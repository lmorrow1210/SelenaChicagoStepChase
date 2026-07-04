#!/usr/bin/env node
/**
 * contrast-audit.mjs — "Field Terminal" palette gate
 *
 * Parses packages/design-system/tokens/colors.css, resolves every token to a
 * concrete hex value (following var() aliases), then computes WCAG 2.1 contrast
 * ratios for the foreground/background pairs the UI actually uses.
 *
 * Thresholds: AA normal text 4.5:1, AA large/UI 3.0:1.
 * Pairs marked large=true are display-size (Barlow Condensed ≥24px bold) or
 * icon/glyph-only.
 *
 * Usage: node scripts/contrast-audit.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const COLORS = path.join(ROOT, 'packages/design-system/tokens/colors.css');

// ── Parse tokens (name -> raw value) ─────────────────────────────────────────
const css = fs.readFileSync(COLORS, 'utf8');
const raw = {};
for (const m of css.matchAll(/--([a-z0-9-]+):\s*([^;]+);/gi)) {
  raw[m[1].trim()] = m[2].trim();
}

// ── Resolve a value to a hex string (follows var() aliases, ignores rgba) ─────
function resolve(val, seen = new Set()) {
  val = val.trim();
  const varMatch = val.match(/^var\(--([a-z0-9-]+)\)/i);
  if (varMatch) {
    const name = varMatch[1];
    if (seen.has(name)) return null;
    seen.add(name);
    return resolve(raw[name] ?? '', seen);
  }
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) return val;
  const hex = val.match(/#([0-9a-f]{6}|[0-9a-f]{3})\b/i);
  if (hex) return hex[0];
  return null;
}

function hex(name) {
  const v = raw[name];
  return v ? resolve(v) : null;
}

// ── WCAG contrast math ───────────────────────────────────────────────────────
function toRGB(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function luminance(h) {
  const [r, g, b] = toRGB(h).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(fg, bg) {
  const a = luminance(fg) + 0.05;
  const b = luminance(bg) + 0.05;
  return (Math.max(a, b) / Math.min(a, b));
}

// ── Pairs the UI renders (fg token, bg token, role, large?) ──────────────────
// "Field Terminal" palette: phosphor-green telemetry on the CRT screen; warm
// case-brown text on tan "printout" paper; red reserved for stamps/threat.
const PAIRS = [
  // Phosphor telemetry / body on every screen surface
  ['phosphor', 'screen-base', 'phosphor text on base screen', false],
  ['phosphor', 'screen-700', 'phosphor text on screen panel', false],
  ['phosphor', 'screen-600', 'phosphor text on raised panel', false],
  // Muted phosphor — labels / captions / muted deltas
  ['phosphor-dim', 'screen-base', 'muted label on base screen', false],
  ['phosphor-dim', 'screen-700', 'muted label on screen panel', false],
  // Bright phosphor — hover / active / wins / positive deltas
  ['phosphor-hot', 'screen-700', 'active/win on screen panel', false],
  ['phosphor-hot', 'screen-600', 'active tab text on lit chip', false],
  // Fills — dark case text on bright phosphor keys/buttons
  ['case-900', 'phosphor', 'text on phosphor (button / complete tile)', false],
  ['case-900', 'phosphor-hot', 'text on phosphor-hot (free tile)', false],
  // Signal red — Selena's gap odometer (display size), vanish timer (small)
  ['signal-red', 'screen-base', 'threat odometer on base (display)', true],
  ['signal-red', 'screen-700', 'vanish timer on screen chip', false],
  ['case-900', 'signal-red', 'text on red fill (danger)', true],
  // Tan "printout" paper cards with case-brown text
  ['case-900', 'tan-200', 'landmark title on tan paper', false],
  ['case-800', 'tan-200', 'fun-fact body on tan paper', false],
  ['case-700', 'tan-200', 'caption/attribution on tan paper', false],
  ['red-deep', 'tan-200', 'CONFIRMED stamp / city kicker on tan paper', false],
  // Chrome — inactive nav labels are dark case on tan bezel
  ['case-900', 'tan-400', 'nav label on tan chrome', false],
  ['case-800', 'tan-400', 'muted chrome label', false],
  // CRT nav well (sidebar)
  ['crt-hi', 'crt-bg', 'terminal active line', false],
  ['crt-dim', 'crt-bg', 'terminal inactive line', false],
  ['crt-hi', 'crt-row', 'terminal active on selected row', false],
  // Badge quality rings (glyph-scale)
  ['bronze', 'screen-700', 'bronze ring on screen', true],
  ['silver', 'screen-700', 'silver ring on screen', true],
];

const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;

console.log('\n=== Field Terminal palette resolved ===');
for (const t of ['screen-base', 'screen-700', 'screen-600', 'phosphor', 'phosphor-dim', 'phosphor-hot', 'signal-red', 'red-deep', 'tan-200', 'case-900', 'case-800', 'case-700', 'case-600', 'crt-hi', 'crt-dim']) {
  console.log(`  --${t.padEnd(12)} ${hex(t)}`);
}

console.log('\n=== Contrast results (WCAG 2.1) ===');
const failures = [];
for (const [fg, bg, role, large] of PAIRS) {
  const fgHex = hex(fg), bgHex = hex(bg);
  if (!fgHex || !bgHex) { console.log(`  ?? ${role}: could not resolve (${fg}/${bg})`); failures.push({ fg, bg, role, r: 'unresolved' }); continue; }
  const r = ratio(fgHex, bgHex);
  const threshold = large ? AA_LARGE : AA_NORMAL;
  const pass = r >= threshold;
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${r.toFixed(2)}:1  (need ${threshold})  ${role}  [${fg} on ${bg}]`);
  if (!pass) failures.push({ fg, bg, role, r: r.toFixed(2), threshold });
}

console.log(`\n=== Summary: ${PAIRS.length - failures.length}/${PAIRS.length} pass ===`);
if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log(`  ✗ ${f.role}: ${f.r}:1 — ${f.fg} on ${f.bg}`);
  process.exitCode = 1;
}

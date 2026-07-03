#!/usr/bin/env node
/**
 * contrast-audit.mjs — "Midnight Dossier" palette gate
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
const PAIRS = [
  // Primary type on every ink surface
  ['bone', 'ink-900', 'primary text on base bg', false],
  ['bone', 'ink-800', 'primary text on recessed panel', false],
  ['bone', 'ink-700', 'primary text on card face', false],
  ['bone', 'ink-600', 'primary text on elevated', false],
  // Secondary paper text
  ['manila', 'ink-900', 'secondary text on bg', false],
  ['manila', 'ink-700', 'secondary text on card', false],
  // Muted / stamped labels / captions
  ['bone-dim', 'ink-900', 'stamped label on bg', false],
  ['bone-dim', 'ink-700', 'stamped label on card', false],
  ['bone-dim', 'ink-600', 'caption on elevated', false],
  // Amber telemetry (workhorse)
  ['amber', 'ink-900', 'telemetry on bg', false],
  ['amber', 'ink-800', 'odometer on inset screen', false],
  ['amber', 'ink-700', 'active state on card', false],
  ['amber-hot', 'ink-700', 'hover/emissive on card', false],
  // Buttons / fills
  ['ink-900', 'amber', 'text on amber (primary button)', false],
  ['ink-900', 'amber-hot', 'text on amber-hot', false],
  ['ink-900', 'signal-red', 'text on red (danger/stamp fill)', true],
  // Signal red — Selena's gap stat is a huge odometer (large ok), plus
  // red stamped text on manila paper
  ['signal-red', 'ink-900', 'Selena gap stat on bg (display size)', true],
  ['signal-red', 'ink-800', 'Selena stat on inset screen (display)', true],
  ['stamp-red', 'manila', 'confidential stamp on manila paper', false],
  // Manila paper cards (postcards, case files) with ink text
  ['ink-900', 'manila', 'ink text on manila paper', false],
  ['ink-900', 'bone', 'ink text on bone paper', false],
  // Team movement vector
  ['vector', 'ink-900', 'team trail on bg', false],
  ['vector', 'ink-700', 'team trail on card', false],
  // Amber phosphor terminal (sidebar)
  ['crt-hi', 'crt-bg', 'terminal active line', false],
  ['crt-dim', 'crt-bg', 'terminal inactive line', false],
  ['crt-hi', 'crt-row', 'terminal active on selected row', false],
  // Badge quality rings (glyph-scale)
  ['bronze', 'ink-700', 'bronze ring on card', true],
  ['silver', 'ink-700', 'silver ring on card', true],
];

const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;

console.log('\n=== Midnight Dossier palette resolved ===');
for (const t of ['ink-900', 'ink-800', 'ink-700', 'ink-600', 'manila', 'bone', 'bone-dim', 'amber', 'amber-hot', 'signal-red', 'vector', 'crt-hi', 'crt-dim']) {
  console.log(`  --${t.padEnd(11)} ${hex(t)}`);
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

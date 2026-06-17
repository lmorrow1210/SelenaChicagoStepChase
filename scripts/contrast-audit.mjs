#!/usr/bin/env node
/**
 * contrast-audit.mjs
 *
 * Parses packages/design-system/tokens/colors.css, resolves every token to a
 * concrete hex value (following var() aliases), then computes WCAG 2.1 contrast
 * ratios for the foreground/background pairs the UI actually uses.
 *
 * Thresholds: AA normal text 4.5:1, AA large/UI 3.0:1.
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
  // bare hex inside a longer value (e.g. a bevel shorthand) — take first hex
  const hex = val.match(/#([0-9a-f]{6}|[0-9a-f]{3})\b/i);
  if (hex) return hex[0];
  return null; // rgba/gradients/etc. — not a flat colour
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

// ── Pairs the UI actually renders (fg token, bg token, role, large?) ──────────
const PAIRS = [
  // Primary text on every surface
  ['parchment', 'tobacco', 'primary text on base bg', false],
  ['parchment', 'felt', 'primary text on card', false],
  ['parchment', 'mahogany', 'primary text on elevated card', false],
  // Secondary text
  ['linen', 'tobacco', 'secondary text on bg', false],
  ['linen', 'felt', 'secondary text on card', false],
  ['linen', 'mahogany', 'secondary text on elevated', false],
  // Muted / disabled / labels (the risky ones)
  ['dust', 'tobacco', 'muted text on bg', false],
  ['dust', 'felt', 'muted text on card', false],
  ['dust', 'mahogany', 'muted text on elevated', false],
  // Accent / links
  ['selena', 'tobacco', 'accent/link on bg', false],
  ['selena', 'felt', 'accent/link on card', false],
  ['selena', 'mahogany', 'accent on elevated (BingoTile progress)', false],
  // Buttons (text on fills)
  ['tobacco', 'selena', 'text-on-blue (primary button)', false],
  ['parchment', 'brick', 'text-on-red (danger button)', false],
  ['tobacco', 'gold', 'text on gold (reward chip)', false],
  // Gold accents
  ['gold', 'tobacco', 'gold accent on bg', false],
  ['gold', 'felt', 'gold accent on card', false],
  ['gold', 'mahogany', 'gold accent on elevated', false],
  // Bingo free tile (Selena-blue center, tobacco glyph)
  ['tobacco', 'selena', 'free-tile label', false],
  ['tobacco', 'selena', 'free-tile icon', false],
  // CRT sidebar (inactive items render on crt-bg, never on crt-row)
  ['crt-hi', 'crt-bg', 'CRT active nav', false],
  ['crt-dim', 'crt-bg', 'CRT inactive nav', false],
  ['crt-hi', 'crt-row', 'CRT active on selected row', false],
  // Sidebar putty casing nameplate (hardcoded #3A2810 text)
  ['_3A2810', 'casing', 'casing nameplate text', false],
  ['_3A2810', 'casing-mid', 'recessed nameplate text', false],
  // MapPin variants (icon glyph on pin head bg)
  ['selena', 'mahogany', 'current-pin glyph', true],
  ['parchment', 'slate', 'next-pin glyph', true],
  ['linen', 'walnut', 'visited-pin glyph', true],
  // Tab bar
  ['selena', 'felt', 'active tab label/icon', false],
  ['dust', 'mahogany', 'inactive tab label (on --mahogany bar)', false],
];

// allow literal hex pseudo-tokens like _3A2810
function val(token) {
  if (token.startsWith('_')) return '#' + token.slice(1);
  return hex(token);
}

const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;

console.log('\n=== v2 palette resolved ===');
for (const t of ['tobacco', 'felt', 'mahogany', 'walnut', 'parchment', 'linen', 'dust', 'selena', 'gold', 'brick', 'slate']) {
  console.log(`  --${t.padEnd(10)} ${hex(t)}`);
}

console.log('\n=== Contrast results (WCAG 2.1) ===');
const failures = [];
for (const [fg, bg, role, large] of PAIRS) {
  const fgHex = val(fg), bgHex = val(bg);
  if (!fgHex || !bgHex) { console.log(`  ?? ${role}: could not resolve (${fg}/${bg})`); continue; }
  const r = ratio(fgHex, bgHex);
  const threshold = large ? AA_LARGE : AA_NORMAL;
  const pass = r >= threshold;
  const tag = pass ? 'PASS' : 'FAIL';
  const line = `  [${tag}] ${r.toFixed(2)}:1  (need ${threshold})  ${role}  [${fg} on ${bg}]`;
  console.log(line);
  if (!pass) failures.push({ fg, bg, role, r: r.toFixed(2), threshold, large });
}

console.log(`\n=== Summary: ${PAIRS.length - failures.length}/${PAIRS.length} pass ===`);
if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) {
    console.log(`  ✗ ${f.role}: ${f.r}:1 (need ${f.threshold}) — ${f.fg} on ${f.bg}`);
  }
  process.exitCode = 1;
}

#!/usr/bin/env node
/**
 * ingest-city-icons.mjs
 *
 * Reads SVG files from packages/design-system/components/game/city-icons/,
 * normalises them for the badge system, and regenerates the CITY_ICONS block
 * in CityBadge.jsx.
 *
 * Usage:  node scripts/ingest-city-icons.mjs [--dry-run]
 *
 * Normalisation applied to each SVG:
 *   - viewBox forced to "0 0 48 48" (scales via preserveAspectRatio)
 *   - Any hardcoded fill/stroke colours replaced with {color} prop token
 *   - stroke="currentColor" / fill="currentColor" → {color}
 *   - Hex/rgb/named colours → {color} (white, black, #fff, #000, etc.)
 *   - Thin strokes boosted to minimum 1.2 on a 48-grid
 *   - style="" colour attrs stripped (use structural attrs only)
 *   - Unnecessary metadata, title, desc, defs stripped
 *   - Self-closing tags normalised
 *
 * Filename → slug mapping examples:
 *   chicago.svg            → chicago
 *   new-york.svg           → newyork
 *   new_york_city.svg      → newyork   (city suffix stripped)
 *   washington-dc.svg      → washingtondc
 *   los-angeles.svg        → losangeles
 *   san_francisco.svg      → sanfrancisco
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'packages/design-system/components/game/city-icons');
const BADGE_FILE = path.join(ROOT, 'packages/design-system/components/game/CityBadge.jsx');
const DRY_RUN = process.argv.includes('--dry-run');

// ── Slug helpers ─────────────────────────────────────────────────────────────

function fileToSlug(filename) {
  return filename
    .replace(/\.svg$/i, '')
    .replace(/[_\-\s]+/g, '')
    .replace(/city$/i, '')
    .replace(/,|\./g, '')
    .toLowerCase();
}

// ── SVG normalisation ─────────────────────────────────────────────────────────

// Colour patterns to replace with the {color} JSX prop token.
const COLOUR_PATTERNS = [
  // currentColor (stroke or fill)
  /currentColor/g,
  // white variants
  /#(?:fff|ffffff)\b/gi,
  /\bwhite\b/g,
  // black variants (less likely but handled)
  /#(?:000|000000)\b/gi,
  /\bblack\b/g,
  // any other 3/6-digit hex — replace last; allows structure colours to survive
  // (only replaces fill/stroke attribute values, not e.g. id values)
];

function normalise(raw, slug) {
  let svg = raw;

  // 1. Strip XML declaration, DOCTYPE
  svg = svg.replace(/<\?xml[^>]*\?>/g, '').replace(/<!DOCTYPE[^>]*>/g, '');

  // 2. Strip metadata elements
  svg = svg.replace(/<(title|desc|metadata|defs)[^>]*>[\s\S]*?<\/\1>/gi, '');
  svg = svg.replace(/<(title|desc|metadata)[^/]*/gi, '');

  // 3. Extract the inner content (everything between <svg…> and </svg>)
  const innerMatch = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  if (!innerMatch) {
    console.warn(`  ⚠ ${slug}: could not parse SVG inner content, skipping`);
    return null;
  }
  let inner = innerMatch[1].trim();

  // 4. Replace colour values in fill/stroke attributes with placeholder
  const PLACEHOLDER = '__COLOR__';
  // fill="…" and stroke="…" attrs
  inner = inner.replace(/\b(fill|stroke)="([^"]+)"/g, (match, attr, val) => {
    const v = val.trim();
    if (v === 'none' || v === 'transparent') return match; // keep
    // Replace any non-structural colour
    if (/^(currentColor|white|black|#[0-9a-f]{3,8}|rgb|hsl)/i.test(v)) {
      return `${attr}="${PLACEHOLDER}"`;
    }
    return match;
  });

  // Also replace fill/stroke in style="" attrs
  inner = inner.replace(/style="([^"]*)"/g, (match, styleVal) => {
    const cleaned = styleVal
      .replace(/(fill|stroke)\s*:\s*[^;]+/g, (s) => {
        if (/none|transparent/.test(s)) return s;
        return s.replace(/:\s*.+/, ': ' + PLACEHOLDER);
      });
    return `style="${cleaned}"`;
  });

  // 5. Boost very thin strokes (stroke-width < 1.2)
  inner = inner.replace(/stroke-width="([\d.]+)"/g, (m, w) => {
    const n = parseFloat(w);
    return `stroke-width="${n < 1.2 ? '1.2' : w}"`;
  });

  // 6. Convert PLACEHOLDER to JSX {color}
  inner = inner.replace(new RegExp(`"${PLACEHOLDER}"`, 'g'), '{color}');

  // 7. Convert HTML attr names to JSX
  inner = inner
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-dasharray=/g, 'strokeDasharray=')
    .replace(/stroke-dashoffset=/g, 'strokeDashoffset=')
    .replace(/stroke-miterlimit=/g, 'strokeMiterlimit=')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/clip-path=/g, 'clipPath=')
    .replace(/font-size=/g, 'fontSize=')
    .replace(/font-weight=/g, 'fontWeight=')
    .replace(/text-anchor=/g, 'textAnchor=')
    .replace(/xlink:href=/g, 'xlinkHref=')
    .replace(/class=/g, 'className=');

  // 8. Remove id="" attrs (not needed, keep SVG lean)
  inner = inner.replace(/\s+id="[^"]*"/g, '');

  return inner.trim();
}

// ── Read existing CITY_ICONS block ────────────────────────────────────────────

function readExistingBlock(source) {
  const start = source.indexOf('const CITY_ICONS = {');
  const end = source.indexOf('\n};\n', start) + 4;
  if (start === -1) throw new Error('Could not find CITY_ICONS block in CityBadge.jsx');
  return { before: source.slice(0, start), block: source.slice(start, end), after: source.slice(end) };
}

function parseExistingSlugs(block) {
  const slugs = new Set();
  const re = /^\s{2}(\w+):\s*\(\{/gm;
  let m;
  while ((m = re.exec(block)) !== null) slugs.add(m[1]);
  return slugs;
}

// ── Build JSX component string ────────────────────────────────────────────────

function buildComponent(slug, inner) {
  return `
  ${slug}: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      ${inner.split('\n').join('\n      ')}
    </svg>
  ),`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

if (!fs.existsSync(ICONS_DIR)) {
  console.log(`Creating ${ICONS_DIR}`);
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

const files = fs.readdirSync(ICONS_DIR).filter(f => /\.svg$/i.test(f));
if (files.length === 0) {
  console.log('No SVG files found in city-icons/ yet. Drop them in and re-run.');
  process.exit(0);
}

console.log(`Found ${files.length} SVG file(s):`);

const source = fs.readFileSync(BADGE_FILE, 'utf8');
const { before, block, after } = readExistingBlock(source);
const existingSlugs = parseExistingSlugs(block);

const newEntries = [];
const skipped = [];

for (const file of files.sort()) {
  const slug = fileToSlug(file);
  const raw = fs.readFileSync(path.join(ICONS_DIR, file), 'utf8');

  if (existingSlugs.has(slug)) {
    console.log(`  ↩  ${file} → ${slug} (already exists, skipping)`);
    skipped.push(slug);
    continue;
  }

  const inner = normalise(raw, slug);
  if (!inner) continue;

  newEntries.push({ slug, component: buildComponent(slug, inner) });
  console.log(`  ✓  ${file} → ${slug}`);
}

if (newEntries.length === 0) {
  console.log('\nNo new icons to add.');
  process.exit(0);
}

// Insert new entries just before the closing };
const insertionPoint = block.lastIndexOf('\n};');
const newBlock =
  block.slice(0, insertionPoint) +
  newEntries.map(e => e.component).join('') +
  '\n\n' +
  block.slice(insertionPoint);

const output = before + newBlock + after;

if (DRY_RUN) {
  console.log('\n--- DRY RUN: would write CityBadge.jsx ---');
  console.log(newEntries.map(e => `  + ${e.slug}`).join('\n'));
} else {
  fs.writeFileSync(BADGE_FILE, output, 'utf8');
  console.log(`\n✓ Added ${newEntries.length} icon(s) to CityBadge.jsx`);
  console.log('  Run: npx tsc --noEmit -p apps/web/tsconfig.json  (to verify)');
  console.log('  Run: node scripts/ingest-city-icons.mjs --dry-run  (to preview)');
}

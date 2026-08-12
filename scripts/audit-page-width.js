#!/usr/bin/env node
/**
 * Page-width audit.
 *
 * The site has exactly one page width: the `.container` rule in app/globals.css,
 * driven by --container-max and --container-pad. Before this was enforced, five
 * competing systems had drifted apart and a single page could render seven
 * different content widths (see tasks/winter-seasonal-discovery-2026-08-12.md).
 *
 * This fails the build if a page-content max-width cap reappears. Component-
 * scale sizing is still fine: modals, form panels, images and badges are not
 * page width, so the small caps (xs/sm/md/lg/xl), character measures and
 * arbitrary values under 600px are all allowed.
 *
 * If you genuinely need a capped page section, add the file to ALLOWLIST below
 * with a comment saying why, rather than widening these rules.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCAN_DIRS = ['app', 'components'];

// Files permitted to set their own width, each for a stated reason.
const ALLOWLIST = new Map([
  ['components/ui/overlays/Modal.tsx', 'dialog sizing, not page width'],
  ['components/ui/overlays/StickyDrawer.tsx', 'drawer sizing, not page width'],
  ['components/hero/InteriorHero.tsx', 'hero text column sits on a photo, not a page surface'],
  ['app/_components/HomeHero.tsx', 'hero text column sits on a photo, not a page surface'],
]);

// Caps that mean "page content", i.e. the ones that used to fight .container.
const BANNED = /(?:^|(?<=[\s"'`]))(?:(?:sm|md|lg|xl|2xl|max-sm|max-md|max-lg|max-xl):)?max-w-(?:2xl|3xl|4xl|5xl|6xl|7xl)(?=[\s"'`]|$)/;
const BANNED_ARBITRARY = /(?:^|(?<=[\s"'`]))(?:(?:sm|md|lg|xl|2xl):)?max-w-\[(\d+)px\](?=[\s"'`]|$)/g;
const MIN_ARBITRARY_PX = 600;

// Character measures (max-w-[56ch] and friends). These were the last thing
// still narrowing page content: SectionHeading capped every section lead at
// 56ch and CtaBand at 50ch, on nearly every page, so the copy sat visibly
// narrower than the cards underneath it. The owner chose one width over
// typographic measure, twice, so they are banned outright.
// `prose-` variants are exempt: those size images inside article bodies, not
// the page.
const BANNED_CH = /(?<!prose-)(?:^|(?<=[\s"'`]))(?:(?:sm|md|lg|xl|2xl):)?max-w-\[\d+ch\](?=[\s"'`]|$)/;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      walk(full, out);
    } else if (entry.name.endsWith('.tsx')) {
      out.push(full);
    }
  }
  return out;
}

const failures = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const rel = path.relative(ROOT, file);
    if (ALLOWLIST.has(rel)) continue;

    fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (BANNED.test(line) || BANNED_CH.test(line)) {
        failures.push(`${rel}:${i + 1}  ${line.trim().slice(0, 100)}`);
        return;
      }
      for (const m of line.matchAll(BANNED_ARBITRARY)) {
        if (Number(m[1]) >= MIN_ARBITRARY_PX) {
          failures.push(`${rel}:${i + 1}  ${line.trim().slice(0, 100)}`);
          return;
        }
      }
    });
  }
}

if (failures.length > 0) {
  console.error(`\nPage-width audit FAILED: ${failures.length} content cap(s) found.\n`);
  console.error('Page width is set once, by .container in app/globals.css. Remove the');
  console.error('max-width and let the wrapper inherit it, or add the file to the');
  console.error('ALLOWLIST in scripts/audit-page-width.js with a reason.\n');
  failures.forEach((f) => console.error(`  ${f}`));
  console.error('');
  process.exit(1);
}

console.log('Page width audit passed. One container width site-wide.');

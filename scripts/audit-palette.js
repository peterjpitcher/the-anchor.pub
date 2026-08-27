#!/usr/bin/env node
/**
 * The brand palette is defined twice. Keep the two copies in step.
 *
 * tailwind.config.ts holds literal hexes so classes like `text-anchor-gold-bright`
 * compile, and app/globals.css holds `--anchor-*` variables so the semantic
 * tokens (--accent, --link, --focus-ring) can be themed. Neither references the
 * other.
 *
 * That means editing one side alone drifts silently and confusingly: the CSS
 * variable changes, every semantic token follows it, and every Tailwind class
 * keeps the old value. It happened on 26 August 2026: two gold values were
 * corrected for contrast in globals.css, the audit still reported a failure on
 * the old colour, and the reason was that `text-anchor-gold-bright` was still
 * compiling to the superseded hex.
 *
 * Ideally there would be one source. Until then, this fails the build when they
 * disagree.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')

function cssVariables() {
  const css = fs.readFileSync(path.join(ROOT, 'app/globals.css'), 'utf8')
  const out = {}
  for (const m of css.matchAll(/--anchor-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,6})\s*;/g)) {
    // First definition wins: :root precedes any themed override.
    if (!(m[1] in out)) out[m[1]] = m[2].toLowerCase()
  }
  return out
}

function tailwindPalette() {
  const tw = fs.readFileSync(path.join(ROOT, 'tailwind.config.ts'), 'utf8')
  const start = tw.indexOf('anchor:')
  if (start === -1) throw new Error('no anchor palette found in tailwind.config.ts')
  const block = tw.slice(start, start + 2500)
  const out = {}
  for (const m of block.matchAll(/([a-zA-Z0-9'"-]+):\s*'(#[0-9a-fA-F]{6})'/g)) {
    out[m[1].replace(/['"]/g, '')] = m[2].toLowerCase()
  }
  for (const m of block.matchAll(/([a-z-]+):\s*\{([^}]*)\}/g)) {
    for (const n of m[2].matchAll(/([A-Za-z0-9'"-]+):\s*'(#[0-9a-fA-F]{6})'/g)) {
      const key = n[1].replace(/['"]/g, '')
      out[key === 'DEFAULT' ? m[1] : `${m[1]}-${key}`] = n[2].toLowerCase()
    }
  }
  return out
}

function audit() {
  const css = cssVariables()
  const tw = tailwindPalette()
  const shared = Object.keys(tw).filter((k) => k in css)
  return {
    shared,
    drift: shared
      .filter((k) => tw[k] !== css[k])
      .map((k) => ({ name: k, tailwind: tw[k], css: css[k] })),
  }
}

module.exports = { audit, cssVariables, tailwindPalette }

if (require.main === module) {
  const { shared, drift } = audit()
  console.log(`palette colours defined in both places: ${shared.length}`)
  if (!drift.length) {
    console.log('tailwind.config.ts and app/globals.css agree.')
    process.exit(0)
  }
  console.log(`\nFAIL  ${drift.length} colour(s) have drifted:\n`)
  for (const d of drift) {
    console.log(`  --anchor-${d.name}`)
    console.log(`     tailwind.config.ts  ${d.tailwind}`)
    console.log(`     app/globals.css     ${d.css}\n`)
  }
  console.log('Update both, or the Tailwind class and the CSS variable will render different colours.')
  process.exit(1)
}

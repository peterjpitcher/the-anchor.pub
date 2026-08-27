#!/usr/bin/env node
/**
 * Accessibility checks in a real browser.
 *
 * The specification had no accessibility acceptance criteria at all (developer
 * review F20), and the existing pipeline could not have found any: lint, types
 * and Jest never render a page. Contrast, focus visibility and reflow do not
 * exist until something paints.
 *
 * jsdom would not do either. It has no layout, so it cannot judge contrast,
 * whether a focus ring is visible, or whether a page reflows at 320px. This
 * drives Chromium through Playwright, which is already a dependency.
 *
 * Usage:
 *   npm run dev
 *   node scripts/audit-a11y.js --base http://localhost:3000
 *
 * Standard: WCAG 2.2 AA. Violations fail; incomplete results are reported for a
 * human, because axe flags things it cannot decide alone (contrast over an
 * image, for instance) and guessing either way would be wrong.
 */
const { chromium } = require('playwright')
const { AxeBuilder } = require('@axe-core/playwright')

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}
const BASE = arg('--base', 'http://localhost:3000').replace(/\/$/, '')

/**
 * One page per template touched by this programme, not the whole site.
 * A template is either accessible or it is not; crawling 199 pages to re-test
 * the same components would just be slower.
 */
const PAGES = [
  ['/', 'homepage'],
  ['/halloween', 'seasonal occasion page (rebuilt)'],
  ['/quiz-night/themed', 'themed quiz hub (new)'],
  ['/heathrow-parking', 'parking (retargeted)'],
  ['/heathrow-hotels-pub', '301 destination for 11 retired pages'],
  ['/private-hire/venue-tour', 'newly indexable'],
  ['/events/quiz-night-2026-10-07', 'event detail template'],
  ['/blog/best-sunday-roast-surrey', 'blog template with related-posts module'],
  ['/private-hire/near/slough-crematorium', 'landmark template'],
  ['/sunday-roast', 'money page'],
]

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/**
 * Pre-existing colour-contrast failures, recorded 26 August 2026.
 *
 * Was 30 on 26 August 2026. Now 2, after fixing the causes rather than the
 * symptoms: two dark-background tokens were being used on light backgrounds
 * (`text-anchor-sage`, `text-anchor-cream-text/80`, both replaced with the
 * theme-aware `text-ink-muted`), two light-theme tokens sat a few hundredths
 * under AA and were nudged imperceptibly, `--text-muted` had never been checked
 * against the header green, and a badge hardcoded white text over a colour that
 * comes from the CMS.
 *
 * The 2 that remain are `--anchor-gold-bright` #c9a020 on the #005131 header at
 * 3.84:1. That token is the dark theme's accent, link, focus ring and tile
 * colour with 27 direct usages, so brightening it to #d9ae26 is a visible brand
 * change and the owner's decision, not one to make silently.
 * Counted in NODES, not violations. axe groups every failing element on a page
 * into one violation object, so counting violations would miss a new failure
 * added to a page that already has one. Verified by injecting an unreadable
 * element: the node count moved 1 -> 3, the violation count did not move at all.
 *
 * Lower this number as tokens are fixed; never raise it.
 */
const CONTRAST_BASELINE = 2

async function main() {
  const browser = await chromium.launch()
  // AxeBuilder requires a page from an explicit context, not browser.newPage().
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const violations = []
  const incomplete = []
  const keyboardProblems = []
  const reflowProblems = []

  try {
    // Warm every page first. A dev server compiles routes on first request, so
    // a cold page can answer 500 while still building and be reported as an
    // accessibility failure it is not. This made the result flaky between runs.
    for (const [pathname] of PAGES) {
      try { await fetch(BASE + pathname) } catch { /* checked properly below */ }
    }

    for (const [pathname, label] of PAGES) {
      const page = await context.newPage()
      let res = await page.goto(BASE + pathname, { waitUntil: 'domcontentloaded' })
      if (res && res.status() >= 500) {
        // One retry, in case it was still compiling.
        await page.waitForTimeout(3000)
        res = await page.goto(BASE + pathname, { waitUntil: 'domcontentloaded' })
      }
      if (!res || res.status() !== 200) {
        violations.push({ pathname, id: 'page-unreachable', help: `status ${res && res.status()}`, nodes: 0 })
        await page.close()
        continue
      }

      const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      for (const v of results.violations) {
        violations.push({ pathname, label, id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length })
      }
      for (const v of results.incomplete) {
        incomplete.push({ pathname, id: v.id, help: v.help, nodes: v.nodes.length })
      }

      // Keyboard: FAQ accordion triggers must be reachable and operable.
      //
      // Deliberately `button[aria-expanded]`, not `[aria-expanded]`. The header
      // nav uses <a aria-expanded> for its dropdowns, and pressing Enter on a
      // link NAVIGATES: the follow-up attribute read then hits a detached node
      // and every page looks broken. The first version of this check did
      // exactly that and reported 30 false failures.
      const triggers = await page.locator('button[aria-expanded]:visible').all()
      for (const t of triggers.slice(0, 3)) {
        try {
          await t.focus()
          if (!(await t.evaluate((el) => el === document.activeElement))) {
            keyboardProblems.push({ pathname, issue: 'accordion control cannot take focus' })
            continue
          }
          // A visible focus ring is a WCAG 2.2 requirement, not a nicety.
          const ring = await t.evaluate((el) => {
            const s = getComputedStyle(el)
            return { outline: s.outlineStyle, width: s.outlineWidth, shadow: s.boxShadow }
          })
          if (ring.outline === 'none' && (!ring.shadow || ring.shadow === 'none')) {
            keyboardProblems.push({ pathname, issue: 'focused accordion control shows no visible focus indicator' })
          }
          const before = await t.getAttribute('aria-expanded')
          await t.press('Enter')
          await page.waitForTimeout(150)
          const after = await t.getAttribute('aria-expanded')
          if (before === after) {
            keyboardProblems.push({ pathname, issue: `aria-expanded stayed "${before}" after Enter` })
          }
        } catch (e) {
          keyboardProblems.push({ pathname, issue: `keyboard interaction threw: ${e.message.slice(0, 60)}` })
        }
      }

      // Reflow: no horizontal scrolling at 320px (WCAG 2.2 1.4.10).
      await page.setViewportSize({ width: 320, height: 800 })
      await page.waitForTimeout(200)
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth)
      if (overflow > 2) reflowProblems.push({ pathname, overflowPx: overflow })

      await page.close()
    }
  } finally {
    await context.close()
    await browser.close()
  }

  console.log(`checked ${PAGES.length} templates at ${BASE}, WCAG 2.2 AA\n`)

  const report = (title, list, keyFn) => {
    if (!list.length) return
    console.log(`${title}: ${list.length}`)
    for (const x of list.slice(0, 12)) console.log('   ', keyFn(x))
    if (list.length > 12) console.log(`    ... and ${list.length - 12} more`)
    console.log()
  }

  report('VIOLATIONS', violations, (v) => `${v.pathname}  [${v.impact || 'n/a'}] ${v.id}: ${v.help} (${v.nodes} node(s))`)
  report('KEYBOARD', keyboardProblems, (k) => `${k.pathname}  ${k.issue}`)
  report('REFLOW at 320px', reflowProblems, (r) => `${r.pathname}  overflows by ${r.overflowPx}px`)
  report('NEEDS A HUMAN (axe could not decide)', incomplete, (i) => `${i.pathname}  ${i.id}: ${i.help} (${i.nodes})`)

  const other = violations.filter((v) => v.id !== 'color-contrast')
  const contrastNodes = violations
    .filter((v) => v.id === 'color-contrast')
    .reduce((total, v) => total + v.nodes, 0)
  const contrast = { length: contrastNodes }

  if (contrast.length > CONTRAST_BASELINE) {
    console.log(`FAIL  colour-contrast failing elements rose from ${CONTRAST_BASELINE} to ${contrast.length}.`)
    console.log('      A new one has been introduced. Fix it, do not raise the baseline.\n')
  } else if (contrast.length) {
    console.log(`contrast: ${contrast.length} failing element(s) from known token issues, baseline ${CONTRAST_BASELINE}.`)
    console.log('      Owner decision: these need brand colour changes. See CONTRAST_BASELINE.\n')
  }

  const failures =
    other.length +
    keyboardProblems.length +
    reflowProblems.length +
    (contrast.length > CONTRAST_BASELINE ? contrast.length - CONTRAST_BASELINE : 0)

  if (!failures) {
    console.log('No violations, no keyboard problems, no reflow problems.')
    if (incomplete.length) console.log(`${incomplete.length} item(s) above need a human decision.`)
    return
  }
  console.log(`FAIL  ${failures} accessibility problem(s).`)
  process.exitCode = 1
}

main().catch((e) => { console.error(e.message); process.exit(1) })

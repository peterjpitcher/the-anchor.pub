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
  // Added 26 Aug after a wider sweep found three defects the ten-template
  // sample missed: a star rating whose aria-label was on a plain div (screen
  // readers ignore it entirely), a nav pill at 4.02:1, and a badge variant
  // using a fill Button had already rejected for the same reason.
  ['/reviews', 'star rating component'],
  ['/private-hire', 'testimonial star ratings'],
  ['/whats-on', 'event listing, seasonal nav pill'],
  ['/book-table', 'booking flow'],
  ['/drinks/managers-special', 'gold badge variant'],
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
 * Now ZERO. The last two were `--anchor-gold-bright` #c9a020 on the #005131
 * header at 3.84:1. That token is the dark theme's accent, link, focus ring and
 * tile colour across 27 usages, so brightening it was a visible brand change;
 * the owner approved #d9ae26 on 26 August 2026.
 *
 * Keep this at 0. A contrast failure is now a regression, not a known issue.
 * Counted in NODES, not violations. axe groups every failing element on a page
 * into one violation object, so counting violations would miss a new failure
 * added to a page that already has one. Verified by injecting an unreadable
 * element: the node count moved 1 -> 3, the violation count did not move at all.
 *
 * Lower this number as tokens are fixed; never raise it.
 */
const CONTRAST_BASELINE = 0

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

      // Wait for React to hydrate before touching anything.
      //
      // Before this, the keyboard checks raced hydration: the run fired Enter at
      // server-rendered markup that had no handlers attached yet and reported
      // three failures on whichever page the dev server happened to compile
      // slowest that run. The failures moved between pages run to run, which is
      // how it was spotted. React stamps `__react*` keys onto DOM nodes as it
      // hydrates, so that is the signal, not a fixed sleep.
      let hydrated = true
      try {
        await page.waitForFunction(() => {
          const el = document.querySelector('button[aria-expanded]') || document.body
          return Object.keys(el).some((k) => k.startsWith('__react'))
        }, null, { timeout: 15000 })
      } catch {
        hydrated = false
        keyboardProblems.push({ pathname, issue: 'page never hydrated, so nothing on it is operable' })
      }

      const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      for (const v of results.violations) {
        violations.push({ pathname, label, id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length })
      }
      for (const v of results.incomplete) {
        incomplete.push({ pathname, id: v.id, help: v.help, nodes: v.nodes.length })
      }

      // Every disclosure control must be a button, not a link.
      //
      // The header nav used to open its four dropdowns from <a aria-expanded>,
      // which only ever worked on hover: Enter on a link navigates, so
      // aria-expanded never moved and the submenu links could not be reached
      // without a pointer. The check below could not catch it either, because
      // pressing Enter on a link detaches the node mid-read and makes every
      // page look broken, so it was scoped to buttons and the real defect sat
      // behind that exclusion. Assert the shape instead: a link carrying
      // aria-expanded is the bug, whatever it does afterwards.
      const linkDisclosures = await page.locator('a[aria-expanded]').all()
      for (const link of linkDisclosures) {
        const name = await link.evaluate((el) => (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40))
        keyboardProblems.push({
          pathname,
          issue: `"${name}" is a link carrying aria-expanded; a disclosure must be a <button>`
        })
      }

      // Keyboard: disclosure controls must be reachable and operable.
      //
      // Six, not three: the header contributes four (Food, Private Hire, What's
      // On, Find Us) on every page, so a smaller sample would test the nav and
      // nothing else. Escape after each one closes the panel it just opened, so
      // an open dropdown is not left covering the next control.
      const triggers = hydrated ? await page.locator('button[aria-expanded]:visible').all() : []
      for (const t of triggers.slice(0, 6)) {
        try {
          await t.focus()
          if (!(await t.evaluate((el) => el === document.activeElement))) {
            keyboardProblems.push({ pathname, issue: 'disclosure control cannot take focus' })
            continue
          }
          // A visible focus ring is a WCAG 2.2 requirement, not a nicety.
          const ring = await t.evaluate((el) => {
            const s = getComputedStyle(el)
            return { outline: s.outlineStyle, width: s.outlineWidth, shadow: s.boxShadow }
          })
          if (ring.outline === 'none' && (!ring.shadow || ring.shadow === 'none')) {
            keyboardProblems.push({ pathname, issue: 'focused disclosure control shows no visible focus indicator' })
          }
          // Wait for THIS control to be wired, not just for the page to have
          // started hydrating. React attaches handlers as it walks the tree, so
          // the page-level probe above can pass on the first button while a
          // control further down is still inert. That is the same race in a
          // smaller window, and pressing Enter into it produces exactly the
          // false "aria-expanded stayed false" this check exists to avoid.
          // Caught on a deployed preview, where the header disclosures wire up
          // after the burger the page-level probe happens to find first.
          try {
            await page.waitForFunction((el) => {
              const key = Object.keys(el).find((k) => k.startsWith('__reactProps$'))
              return Boolean(key && typeof el[key].onClick === 'function')
            }, await t.elementHandle(), { timeout: 10000 })
          } catch {
            keyboardProblems.push({ pathname, issue: 'disclosure control never had a handler attached' })
            continue
          }

          const before = await t.getAttribute('aria-expanded')
          await t.press('Enter')
          await page.waitForTimeout(150)
          const after = await t.getAttribute('aria-expanded')
          if (before === after) {
            keyboardProblems.push({ pathname, issue: `aria-expanded stayed "${before}" after Enter` })
          }
          await t.press('Escape')
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

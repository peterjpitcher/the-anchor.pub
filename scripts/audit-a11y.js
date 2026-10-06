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
 *
 * Each page is checked once it has hydrated AND finished loading its own
 * content (see settle below). A page that never gets there fails the run: a
 * clean result has to mean the content was on the page when axe looked.
 *
 * One page is then opened again and left until a pop-up opens over it on its
 * timer, and axe checks the pop-up (see auditTimedPopup below).
 */

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}
const BASE = arg('--base', 'http://localhost:3000').replace(/\/$/, '')

/**
 * Content that must be on the page before it is checked.
 *
 * Some content cannot be found by watching the network. Name it here and the
 * audit waits for it, and fails the page if it never turns up, so content that
 * did not load cannot pass for content with nothing wrong with it.
 *
 * The cookie banner is on every page for a first-time visitor, which is what
 * this browser is, but components/CookieBanner.tsx holds it back for a second
 * on a timer. Nothing is in flight during that second, so without naming it
 * axe would see the banner on the slower pages and miss it on the quicker ones.
 */
const COOKIE_BANNER = 'button[aria-label="Accept all cookies"]'

/**
 * The reviews carousel fetches /api/reviews after mount and renders nothing at
 * all if that fails.
 */
const REVIEWS_CAROUSEL = '.google-reviews-wrapper button[aria-label="Go to review 1"]'

/**
 * The site shows the event countdown banner to half of all sessions, on a coin
 * toss it keeps in sessionStorage (components/EventCountdownBanner.tsx). Every
 * page here opens as a new session, so axe saw the banner on about half the
 * pages, and a different half each run. The audit calls the toss for itself,
 * on the side with more on the page.
 *
 * The banner cannot be named as content that must be there: it is switched off
 * on some paths and has nothing to show when no event is coming up.
 */
const EVENT_BANNER_SESSION_KEY = 'event_banner_session_show'
const alwaysShowEventBanner = (context) => context.addInitScript((key) => {
  try {
    window.sessionStorage.setItem(key, 'true')
  } catch {
    // A sandboxed frame has no storage. The page itself always does.
  }
}, EVENT_BANNER_SESSION_KEY)

/**
 * One page per template touched by this programme, not the whole site.
 * A template is either accessible or it is not; crawling 199 pages to re-test
 * the same components would just be slower.
 *
 * Each row is path, label and, optionally, a plain CSS selector for content
 * the page loads on the client that must be there before the page is checked.
 */
const PAGES = [
  ['/', 'homepage'],
  ['/halloween', 'seasonal occasion page (rebuilt)'],
  ['/quiz-night/themed', 'themed quiz hub (new)'],
  ['/heathrow-parking', 'parking (retargeted)', REVIEWS_CAROUSEL],
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
  // Added 5 Oct after the privacy notice was found close to unreadable on the
  // dark season skin: a bare `prose` wrapper, so Tailwind Typography's
  // light-theme greys sat on a near-black page (headings 1.01:1, body 1.7:1).
  // No page in this list had an uncoloured `prose` wrapper, so nothing caught it.
  ['/privacy-policy', 'legal notice in a prose wrapper'],
  // Added 5 Oct with the settle step. The only other page with the reviews
  // carousel, and the widest case: 12 dots against six on the parking page,
  // which is what the 320px reflow check needs to see.
  ['/beer-garden', 'reviews carousel at its widest', REVIEWS_CAROUSEL],
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

/**
 * Settling: wait for client-loaded content before axe runs.
 *
 * Hydration is not enough. A client component that fetches after mount (the
 * reviews carousel, the status bar's opening hours, the event banner, the
 * booking form's sittings) is hydrated and still empty. axe used to run in that gap,
 * so whether it saw the content came down to whether the reply beat it. On
 * 5 October 2026 a run against the live site passed /heathrow-parking with six
 * carousel buttons failing target-size; against localhost, where the same reply
 * takes 20ms, the same audit caught all six every time.
 *
 * `networkidle` cannot be the signal: it never arrives on any page here (see
 * isContentRequest). So a page is settled when all of these hold:
 *   1. the content it names (COOKIE_BANNER, and its own row in PAGES) is there,
 *   2. none of its own content requests is in flight, and
 *   3. for SETTLE_QUIET_MS no content request has started or finished and
 *      nothing has been added, removed or reworded.
 * The third covers the render that follows a reply, and any request that
 * render sets off in turn.
 *
 * It fails closed. A page that has not settled inside SETTLE_TIMEOUT_MS, or
 * whose named content never appears, is reported and fails the run. So is a
 * page with a content request that came back as an error or did not come back
 * at all: a reply is not the same as content. The event banner renders nothing
 * when /api/events is not OK, and nothing wrong can be found in nothing.
 *
 * Not covered: content that only loads once it is scrolled into view. A pop-up
 * that opens on a timer is not seen here either; auditTimedPopup below is for
 * that.
 */
const SETTLE_TIMEOUT_MS = 15000
const SETTLE_QUIET_MS = 500

/**
 * Is this a request the page is waiting on for its own content?
 *
 * Reads from the page's own origin: the data a client component fetches after
 * mount (fetch, xhr) and the code for a lazily loaded one (script). Left out,
 * because none of them puts content on the page and some never finish:
 *   - writes. The web-vitals beacon is a POST whose reply the page never reads,
 *     so the browser never reports it finished.
 *   - other origins. Tag Manager and Turnstile keep talking long after load.
 *   - the router's link prefetches, about 28 a page, which only warm a cache.
 */
function isContentRequest({ url, method, resourceType, headers }, pageOrigin) {
  if (method !== 'GET') return false
  if (!['fetch', 'xhr', 'script'].includes(resourceType)) return false
  if (headers && headers['next-router-prefetch']) return false
  try {
    return new URL(url).origin === pageOrigin
  } catch {
    return false
  }
}

/**
 * Attach before page.goto, so nothing the page asks for is missed.
 *
 * A content request counts as failed when it is answered with a 4xx or 5xx, or
 * when the network gives up on it. The browser reports those two differently:
 * an error status still arrives as a reply, so the request is "finished", and
 * only a request with no reply at all is "failed".
 *
 * One kind of failure is left out: net::ERR_ABORTED, a request the page itself
 * cancelled, which is also what a reload does to whatever was still in flight.
 * Measured on 6 October 2026 over 4,169 tracked requests (17 pages, five
 * passes, with and without a 1.5s delay): every one answered 200, none failed
 * and none was aborted, so nothing here fires on a healthy site.
 */
function trackContentRequests(page) {
  const inFlight = new Set()
  const failed = []
  let lastActivity = 0
  const pathOf = (request) => {
    const { pathname, search } = new URL(request.url())
    return pathname + search
  }
  const pageOrigin = () => {
    try {
      return new URL(page.url()).origin
    } catch {
      return null
    }
  }
  page.on('request', (request) => {
    const own = isContentRequest({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      headers: request.headers(),
    }, pageOrigin())
    if (!own) return
    inFlight.add(request)
    lastActivity = Date.now()
  })
  const done = (request) => {
    if (inFlight.delete(request)) lastActivity = Date.now()
  }
  page.on('response', (response) => {
    const request = response.request()
    if (inFlight.has(request) && response.status() >= 400) {
      failed.push(`${pathOf(request)} (status ${response.status()})`)
    }
  })
  page.on('requestfinished', done)
  page.on('requestfailed', (request) => {
    if (!inFlight.has(request)) return
    const reason = (request.failure() || {}).errorText || 'no reply'
    if (reason !== 'net::ERR_ABORTED') failed.push(`${pathOf(request)} (${reason})`)
    done(request)
  })
  return {
    waitingOn: () => [...inFlight].map(pathOf),
    quietFor: () => Date.now() - lastActivity,
    failed: () => [...failed],
    /** The audit is about to load the page again: nothing from the first attempt counts. */
    startOver: () => {
      inFlight.clear()
      failed.length = 0
      lastActivity = 0
    },
  }
}

/**
 * Runs in the page: which of the named selectors are not there yet, and how
 * many milliseconds is it since anything was added, removed or reworded? The
 * first call starts the watch, so it answers 0.
 *
 * Attributes are deliberately not watched: the carousel's own autoplay rewrites
 * a style attribute every five seconds, and a scripted animation does it every
 * frame, so a page with either would never be called still.
 */
const lookAtPage = (selectors) => {
  if (window.__a11yAuditLastChange === undefined) {
    window.__a11yAuditLastChange = performance.now()
    new MutationObserver(() => { window.__a11yAuditLastChange = performance.now() })
      .observe(document.documentElement, { childList: true, characterData: true, subtree: true })
  }
  return {
    missing: selectors.filter((selector) => !document.querySelector(selector)),
    quietFor: performance.now() - window.__a11yAuditLastChange,
  }
}

/**
 * Wait for the page to settle. Returns null when it has and nothing failed to
 * load, or a sentence saying what it was still waiting for and what failed.
 * `ready` is a list of plain CSS selectors.
 *
 * One loop asks for everything, rather than page.waitForSelector and then a
 * quiet period: Playwright backs its selector checks off to every 500ms, which
 * found the cookie banner 300ms late on every page.
 */
async function settle(page, requests, ready = []) {
  const deadline = Date.now() + SETTLE_TIMEOUT_MS
  const seconds = SETTLE_TIMEOUT_MS / 1000
  const failures = () => {
    const failed = requests.failed()
    return failed.length ? `content failed to load: ${failed.join(', ')}` : null
  }
  let missing = ready

  while (Date.now() < deadline) {
    const seen = await page.evaluate(lookAtPage, ready)
    missing = seen.missing
    const loading = requests.waitingOn().length > 0
    const quietFor = Math.min(seen.quietFor, requests.quietFor())
    // Settled, but a failed request still fails the page. It is left to settle
    // first so the checks that follow see everything that did load.
    if (!missing.length && !loading && quietFor >= SETTLE_QUIET_MS) return failures()
    await page.waitForTimeout(50)
  }

  const waitingOn = requests.waitingOn()
  let stuck = `still changing after ${seconds}s`
  if (missing.length) stuck = `expected content never appeared within ${seconds}s: ${missing.join(', ')}`
  else if (waitingOn.length) stuck = `still loading after ${seconds}s: ${waitingOn.join(', ')}`
  return [stuck, failures()].filter(Boolean).join('; ')
}

/**
 * Timed pop-ups: what no page check above can see.
 *
 * A campaign pop-up opens on a timer. The Christmas lightbox opens ten seconds
 * after it mounts (components/features/christmas/ChristmasLightbox.tsx), and
 * each page above is checked and closed in about three. On 5 October 2026 the
 * lightbox's close button had no accessible name, a critical failure nearly
 * every visitor with a screen reader met, and this audit passed every page.
 *
 * So one page is opened again, in a browser that has never seen the site, and
 * left open until a pop-up covers it. axe then looks at the pop-up alone; the
 * page under it has already been checked.
 *
 * A pop-up is found by what it does, not by its name: a new layer fixed over
 * the whole viewport that takes the visitor's clicks. That finds the next
 * campaign's pop-up as well as this one.
 *
 * The page is watched from the moment it loads, before anything is waited
 * for. A first look taken once a slow page had finished loading could find the
 * pop-up already open and take it for part of the page (raised in review of
 * PR #196).
 *
 * This part cannot fail closed. A campaign has an end date, so for some of the
 * year no pop-up is the right answer, and the audit cannot tell that from one
 * that failed to open. It says which happened in the first lines of the report.
 *
 * Not found: an overlay that is always on the page and only fades in. Both
 * campaign lightboxes mount when they open, and a unit test holds them to it.
 * Not checked on the pop-up: where focus goes, and whether Escape closes it.
 */
const POPUP_PAGE = '/heathrow-parking'
// Counted from hydration: ten seconds on the lightbox's own timer and up to
// two more before components/DeferredRender.tsx mounts it. The rest is margin
// for a slow machine.
const POPUP_WAIT_MS = 14000
const POPUP_POLL_MS = 250
const POPUP_MARK = 'data-a11y-audit-popup'

/** Runs in the page. React stamps `__react*` keys onto DOM nodes as it hydrates. */
const hasHydrated = () => {
  const el = document.querySelector('button[aria-expanded]') || document.body
  return Object.keys(el).some((k) => k.startsWith('__react'))
}

/**
 * Runs in the page. Every look that finds no pop-up notes each fixed element
 * on the page, so the page's own furniture (cookie banner, event banner,
 * sticky buttons) is never taken for part of one, whenever it arrives.
 *
 * A pop-up is a fixed layer that was not there at the last look, covers the
 * viewport and takes clicks. The last part matters: the booking drawer keeps a
 * full-screen backdrop on every page with `pointer-events: none` until it is
 * opened, and that is not a pop-up. Nor is anything on the page at the very
 * first look, which is the page as it was served.
 *
 * When one opens, every fixed element that arrived with it is marked, so axe
 * can be pointed at a backdrop and a panel that sit side by side as well as at
 * a single wrapper. `shown` is false while the layer is still fading in: axe
 * judges contrast on what is painted, and a half-faded pop-up is not what a
 * visitor reads.
 */
const lookForPopup = (mark) => {
  const fixed = [...document.body.querySelectorAll('*')].filter((el) => {
    const style = getComputedStyle(el)
    return style.position === 'fixed' && style.display !== 'none' && style.visibility !== 'hidden'
  })
  const firstLook = !window.__a11yAuditFixed
  if (firstLook) window.__a11yAuditFixed = new WeakSet()
  const known = window.__a11yAuditFixed
  const opened = fixed.filter((el) => !known.has(el))
  const cover = firstLook ? undefined : opened.find((el) => {
    if (getComputedStyle(el).pointerEvents === 'none') return false
    const box = el.getBoundingClientRect()
    return box.width >= window.innerWidth * 0.9 && box.height >= window.innerHeight * 0.9
  })
  if (!cover) {
    for (const el of fixed) known.add(el)
    return null
  }
  for (const el of opened) el.setAttribute(mark, '')
  const heading = opened.map((el) => el.querySelector('h1, h2, h3')).find(Boolean)
  return {
    heading: heading ? heading.textContent.trim().slice(0, 60) : '',
    shown: getComputedStyle(cover).opacity === '1',
  }
}

/**
 * Wait for a pop-up to open. Returns what lookForPopup found, or null when
 * none has opened within POPUP_WAIT_MS. A pop-up that opened and never
 * finished fading in is still returned, so it is checked and not skipped.
 *
 * The caller takes the first look, as soon as the page loads.
 */
async function waitForPopup(page) {
  const deadline = Date.now() + POPUP_WAIT_MS
  let popup = null
  while (Date.now() < deadline) {
    popup = await page.evaluate(lookForPopup, POPUP_MARK)
    if (popup && popup.shown) return popup
    await page.waitForTimeout(POPUP_POLL_MS)
  }
  return popup
}

/**
 * Open POPUP_PAGE, wait for a pop-up and point axe at it. What axe finds goes
 * into the same lists as every page; the return value is a line for the report.
 */
async function auditTimedPopup(browser, AxeBuilder, { violations, incomplete }) {
  // A context of its own, not the one the pages shared: a campaign pop-up
  // shows once per visitor and remembers that in localStorage.
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  try {
    const page = await context.newPage()
    const res = await page.goto(BASE + POPUP_PAGE, { waitUntil: 'domcontentloaded' })
    // The page is in PAGES, so one that will not load or hydrate has already
    // failed the run in the page loop.
    if (!res || res.status() !== 200) return `not checked, the page answered ${res ? res.status() : 'nothing'}`

    // The first look, before waiting for anything: see the note above.
    await page.evaluate(lookForPopup, POPUP_MARK)
    try {
      await page.waitForFunction(hasHydrated, null, { timeout: 15000 })
    } catch {
      return 'not checked, the page never hydrated'
    }

    const popup = await waitForPopup(page)
    if (!popup) {
      return `none opened within ${POPUP_WAIT_MS / 1000}s of the page hydrating, so none was checked. ` +
        'That is right only while no campaign pop-up is running.'
    }

    const results = await new AxeBuilder({ page }).include(`[${POPUP_MARK}]`).withTags(WCAG).analyze()
    const pathname = `${POPUP_PAGE} pop-up`
    for (const v of results.violations) {
      violations.push({ pathname, label: 'timed pop-up', id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length })
    }
    for (const v of results.incomplete) {
      incomplete.push({ pathname, id: v.id, help: v.help, nodes: v.nodes.length })
    }
    const name = popup.heading ? ` ("${popup.heading}")` : ''
    return `checked${name}${popup.shown ? '' : ', though it never finished fading in'}`
  } finally {
    await context.close()
  }
}

/**
 * Reflow: nothing may be cut off at the right edge of a 320px screen
 * (WCAG 2.2 1.4.10).
 *
 * This used to ask the root element whether it scrolled sideways: scrollWidth
 * minus clientWidth. It never does. app/globals.css gives <html> and <body>
 * `overflow-x: hidden`, so anything too wide is clipped by <body> and adds
 * nothing to the root's scroll width. The check read 0 on every page. On
 * 6 October 2026 it passed /blog/best-sunday-roast-surrey with a comparison
 * table 856px wide and four of its seven columns out of reach, and seven more
 * pages in PAGES with something cut off.
 *
 * So every box on the page, and every run of text, is measured against the
 * edge of the viewport instead. One that runs past it is cut off, unless one
 * of these is true. Each is a kind of thing found on the pages in PAGES that
 * day, and is meant to be where it is:
 *   - it is not painted: it has no box, or `visibility: hidden`.
 *   - a box it sits in scrolls sideways (`overflow-x: auto` or `scroll`), so
 *     the rest can be reached. The price table on /private-hire, the facts
 *     strip on an event page.
 *   - a box it sits in clips it and shows none of it. The reviews carousel
 *     keeps its other slides beside the window; screen-reader-only text sits
 *     in a box one pixel wide.
 *   - a box it sits in shortens it with an ellipsis (`text-overflow:
 *     ellipsis`), which is a decision somebody made. The event name on the
 *     countdown banner. None was past the edge that day, but the banner is on
 *     14 of these pages and the next event may have a longer name.
 *   - it is parked beside the screen: it, or a box it sits in, is `fixed` or
 *     `absolute` and starts at or past the edge. The closed cost estimator
 *     drawer on /private-hire.
 *
 * A box that clips is not an excuse by itself. 90 components here have
 * `overflow-hidden`, the hero among them, so excusing everything inside one
 * would be the same blind spot one level down. If part of a thing shows and
 * the rest is clipped, it is cut off, whichever box does the clipping.
 *
 * How far down the page a thing sits is not looked at. The sticky bar waits
 * below the screen until the page is scrolled, laid out as it will be shown,
 * so a button past the edge there is a button past the edge when it arrives.
 *
 * Anything still moving is put at rest first. The carousel slides every five
 * seconds for half a second, and a slide caught on its way in is part shown.
 *
 * A thing cut off is reported once, under the outermost box that is.
 *
 * Not looked at: the left edge. A drawer once it is opened. Whether a `fixed`
 * or `absolute` box is laid out against a transformed ancestor, which CSS
 * allows; getting that wrong reports something hidden, it never hides
 * something cut off.
 */
const REFLOW_WIDTH = 320

/** Runs in the page. Returns what is cut off: [{ what, by }], `by` in pixels. */
const lookForCutOff = () => {
  // The same two pixels the old measurement allowed, for rounding.
  const SLACK = 2
  const edge = document.documentElement.clientWidth

  for (const animation of document.getAnimations ? document.getAnimations() : []) {
    try {
      animation.finish()
    } catch {
      // One that never ends, such as a spinner, has no end to go to.
    }
  }

  const found = []
  const reported = new Set()
  const pastEdge = (box) => box.width > 0 && box.height > 0 && box.right > edge + SLACK
  const parked = (style, box) =>
    (style.position === 'fixed' || style.position === 'absolute') && box.left >= edge - SLACK

  // Is a box that runs past the edge meant to? `from` is the nearest element
  // it sits in, `position` is how the box itself is positioned.
  const meantToBe = (box, from, position) => {
    for (let outer = from; outer && outer !== document.body; outer = outer.parentElement) {
      if (reported.has(outer)) return true
      const style = getComputedStyle(outer)
      const outerBox = outer.getBoundingClientRect()
      if (parked(style, outerBox)) return true
      // Only a box it is laid out against can clip it or scroll it. Nothing
      // does either to a fixed box, and a static one does neither to an
      // absolute box inside it.
      if (position === 'fixed' || (position === 'absolute' && style.position === 'static')) continue
      position = style.position
      if (style.overflowX === 'auto' || style.overflowX === 'scroll') return true
      if (style.overflowX === 'hidden' || style.overflowX === 'clip') {
        if (style.textOverflow === 'ellipsis') return true
        const shown = Math.min(box.right, outerBox.right) - Math.max(box.left, outerBox.left)
        if (shown <= SLACK) return true
      }
    }
    return false
  }

  const words = (text) => text.trim().replace(/\s+/g, ' ').slice(0, 40)
  const range = document.createRange()

  for (const el of document.body.querySelectorAll('*')) {
    const box = el.getBoundingClientRect()
    if (pastEdge(box)) {
      const style = getComputedStyle(el)
      if (style.visibility !== 'visible' || parked(style, box)) continue
      if (meantToBe(box, el.parentElement, style.position)) continue
      reported.add(el)
      const label = words(el.getAttribute('aria-label') || el.getAttribute('alt') || el.innerText || el.textContent || '')
      found.push({ what: `<${el.tagName.toLowerCase()}>${label ? ` "${label}"` : ''}`, by: Math.round(box.right - edge) })
      continue
    }

    // Text can run out of a box that fits: a long address in a narrow
    // paragraph. The paragraph's box says nothing about it.
    for (const node of el.childNodes) {
      if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue.trim()) continue
      range.selectNodeContents(node)
      const lines = [...range.getClientRects()].filter(pastEdge)
      if (!lines.length) continue
      if (getComputedStyle(el).visibility !== 'visible') continue
      const left = Math.min(...lines.map((line) => line.left))
      const right = Math.max(...lines.map((line) => line.right))
      if (meantToBe({ left, right }, el, 'static')) continue
      found.push({ what: `text "${words(node.nodeValue)}"`, by: Math.round(right - edge) })
    }
  }
  return found
}

/**
 * Narrow the page to REFLOW_WIDTH and return what is cut off there. The page
 * is not loaded again: it is the one axe has just checked, made narrower.
 */
async function checkReflow(page) {
  await page.setViewportSize({ width: REFLOW_WIDTH, height: 800 })
  await page.waitForTimeout(200)
  return page.evaluate(lookForCutOff)
}

/** One line of the report for a page with something cut off. */
const describeCutOff = ({ pathname, cutOff }) =>
  `${pathname}  ${cutOff.map(({ what, by }) => `${what} by ${by}px`).join('; ')}`

async function main() {
  // Loaded here, not at the top, so the settle logic can be unit tested
  // without a browser installed (CI does not have one).
  const { chromium } = require('playwright')
  const { AxeBuilder } = require('@axe-core/playwright')

  const browser = await chromium.launch()
  // AxeBuilder requires a page from an explicit context, not browser.newPage().
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  await alwaysShowEventBanner(context)
  const violations = []
  const incomplete = []
  const keyboardProblems = []
  const reflowProblems = []
  const settleProblems = []
  let popupNote = ''

  try {
    // Warm every page first. A dev server compiles routes on first request, so
    // a cold page can answer 500 while still building and be reported as an
    // accessibility failure it is not. This made the result flaky between runs.
    for (const [pathname] of PAGES) {
      try { await fetch(BASE + pathname) } catch { /* checked properly below */ }
    }

    for (const [pathname, label, ready] of PAGES) {
      const page = await context.newPage()
      const requests = trackContentRequests(page)
      let res = await page.goto(BASE + pathname, { waitUntil: 'domcontentloaded' })
      if (res && res.status() >= 500) {
        // One retry, in case it was still compiling.
        await page.waitForTimeout(3000)
        requests.startOver()
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
        await page.waitForFunction(hasHydrated, null, { timeout: 15000 })
      } catch {
        hydrated = false
        keyboardProblems.push({ pathname, issue: 'page never hydrated, so nothing on it is operable' })
      }

      // Then wait for what the page loads for itself. A page that never
      // hydrated will never fetch anything, and has already been reported.
      const unsettled = hydrated
        ? await settle(page, requests, [COOKIE_BANNER, ready].filter(Boolean))
        : null
      if (unsettled) settleProblems.push({ pathname, issue: unsettled })

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

      // Reflow: nothing cut off at 320px (WCAG 2.2 1.4.10). See lookForCutOff.
      const cutOff = await checkReflow(page)
      if (cutOff.length) reflowProblems.push({ pathname, cutOff })

      await page.close()
    }

    popupNote = await auditTimedPopup(browser, AxeBuilder, { violations, incomplete })
  } finally {
    await context.close()
    await browser.close()
  }

  console.log(`checked ${PAGES.length} templates at ${BASE}, WCAG 2.2 AA`)
  console.log(`timed pop-up on ${POPUP_PAGE}: ${popupNote}\n`)

  const report = (title, list, keyFn, limit = 12) => {
    if (!list.length) return
    console.log(`${title}: ${list.length}`)
    for (const x of list.slice(0, limit)) console.log('   ', keyFn(x))
    if (list.length > limit) console.log(`    ... and ${list.length - limit} more`)
    console.log()
  }

  report('VIOLATIONS', violations, (v) => `${v.pathname}  [${v.impact || 'n/a'}] ${v.id}: ${v.help} (${v.nodes} node(s))`)
  report('NOT SETTLED (axe may not have seen this content)', settleProblems, (s) => `${s.pathname}  ${s.issue}`)
  report('KEYBOARD', keyboardProblems, (k) => `${k.pathname}  ${k.issue}`)
  // Every page, not the first twelve: one component can put a line on each.
  report(`REFLOW at ${REFLOW_WIDTH}px, pages with something cut off at the right edge`, reflowProblems, describeCutOff, PAGES.length)
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
    settleProblems.length +
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

module.exports = {
  PAGES,
  COOKIE_BANNER,
  REVIEWS_CAROUSEL,
  EVENT_BANNER_SESSION_KEY,
  alwaysShowEventBanner,
  isContentRequest,
  trackContentRequests,
  settle,
  SETTLE_TIMEOUT_MS,
  SETTLE_QUIET_MS,
  POPUP_PAGE,
  POPUP_WAIT_MS,
  POPUP_MARK,
  lookForPopup,
  waitForPopup,
  auditTimedPopup,
  REFLOW_WIDTH,
  lookForCutOff,
  checkReflow,
  describeCutOff,
}

if (require.main === module) {
  main().catch((e) => { console.error(e.message); process.exit(1) })
}

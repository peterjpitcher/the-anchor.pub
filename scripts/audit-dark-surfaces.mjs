#!/usr/bin/env node
/**
 * Runtime dark-surface audit.
 *
 * Renders each representative route in a headless browser and flags any
 * element in <main> whose COMPUTED background colour is dark (luminance
 * below the threshold) — i.e. a dark card/panel/widget sitting on the
 * light theme. This catches dark surfaces regardless of which CSS classes
 * produced them (Tailwind tokens, inline styles, third-party widgets),
 * which a source grep cannot do reliably.
 *
 * Intentional dark elements are excluded by DOM position, not by class:
 *   - the page hero            ([data-hero])
 *   - the footer               (<footer>)
 *   - any deliberate dark band (.theme-dark — hero, AmenityStrip, CtaBand)
 * Gold fills (#8b6914 ≈ 0.16 luminance) sit above the 0.12 threshold, so
 * primary buttons/badges are not flagged.
 *
 * Usage:  node scripts/audit-dark-surfaces.mjs http://localhost:3000
 *         (pass the running dev/preview server base URL)
 */
import { chromium } from 'playwright'

const BASE = process.argv[2] || 'http://localhost:3000'

// One route per distinct template + the component-heavy pages. Add more freely.
const ROUTES = [
  '/', '/food-menu', '/sunday-roast', '/pizza-menu', '/drinks', '/drinks/managers-special',
  '/whats-on', '/quiz-night', '/music-bingo', '/cash-bingo', '/karaoke', '/live-music',
  '/live-sport', '/live-sport/world-cup/sweepstake',
  '/private-hire', '/function-room-hire', '/corporate-events', '/private-party-venue',
  '/private-hire/wakes',
  '/book-table',
  '/near-heathrow', '/near-heathrow/terminal-5', '/find-us', '/plane-spotting-heathrow',
  '/beer-garden', '/heathrow-parking', '/coach-parking-heathrow',
  '/staines-pub', '/pub-near-hilton-heathrow',
  '/easter', '/fathers-day', '/summer-garden-parties',
  '/blog', '/about', '/our-pub', '/reviews', '/sustainability', '/join-our-team',
]

const AUDIT_FN = () => {
  const main = document.querySelector('main') || document.body
  const lum = (rgb) => {
    const m = (rgb || '').match(/[\d.]+/g)
    if (!m) return 1
    const [r, g, b, a] = m.map(Number)
    if (a === 0) return 1
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  const out = []
  const seen = new Set()
  main.querySelectorAll('*').forEach((el) => {
    const bg = getComputedStyle(el).backgroundColor
    if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') return
    if (lum(bg) > 0.12) return
    const r = el.getBoundingClientRect()
    if (r.width < 48 || r.height < 28) return
    if (el.closest('footer,[data-hero],.theme-dark')) return
    const cls = (el.className || '').toString().slice(0, 60)
    const key = cls + bg
    if (seen.has(key)) return
    seen.add(key)
    out.push({ tag: el.tagName.toLowerCase(), cls, bg, txt: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40) })
  })
  return out
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
let total = 0
const failures = []

for (const route of ROUTES) {
  try {
    // Live-data pages (flight/events/hours) never reach networkidle, so wait for
    // DOM + a fixed settle window for client components to paint.
    const resp = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)
    // dismiss cookie banner if present
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim().toLowerCase() === 'reject all')
      if (b) b.click()
    })
    await page.waitForTimeout(300)
    const offenders = await page.evaluate(AUDIT_FN)
    const status = resp ? resp.status() : '???'
    if (offenders.length) {
      total += offenders.length
      failures.push({ route, status, offenders })
      console.log(`\n✗ ${route} (${status}) — ${offenders.length} dark surface(s):`)
      offenders.forEach((o) => console.log(`    <${o.tag} class="${o.cls}"> bg=${o.bg}  "${o.txt}"`))
    } else {
      console.log(`✓ ${route} (${status})`)
    }
  } catch (err) {
    console.log(`! ${route} — error: ${err.message.slice(0, 80)}`)
  }
}

console.log(`\n${'='.repeat(60)}\nDark-surface audit: ${total} offender(s) across ${failures.length}/${ROUTES.length} route(s).`)
await browser.close()
process.exit(total > 0 ? 1 : 0)

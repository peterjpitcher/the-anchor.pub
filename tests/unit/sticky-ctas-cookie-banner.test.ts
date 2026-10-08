import fs from 'fs'
import path from 'path'
import { resolveFloatingLayers } from '@/lib/floating-layers'

const STICKY = fs.readFileSync(
  path.join(process.cwd(), 'components/layout/StickyCtas.tsx'),
  'utf8'
)
const BANNER = fs.readFileSync(
  path.join(process.cwd(), 'components/CookieBanner.tsx'),
  'utf8'
)

/**
 * The thing worth protecting is a decision rather than a rendered pixel: the sticky bar
 * must never again make itself invisible because the cookie banner is on screen.
 *
 * The original code read `visible && !cookieBannerVisible`. It looked like collision
 * avoidance and behaved like a conversion leak, because the person who has not answered
 * the cookie prompt is by definition a first-time visitor: exactly the one who most needs
 * an obvious way to book, and the one guaranteed not to see it.
 *
 * Since 8 October 2026 the decision is the floating layer coordinator's
 * (lib/floating-layers.ts), so the first group asks the coordinator. The rest are still
 * source-level guards: both elements are position:fixed and the failure is that one of
 * them is simply absent, which renders as a perfectly valid page.
 */

describe('the cookie banner never suppresses the booking bar', () => {
  it('shows the bar together with the cookie banner', () => {
    expect(resolveFloatingLayers(['booking-bar', 'cookie-banner'])).toEqual({
      active: 'cookie-banner',
      bookingBar: true
    })
  })

  it('asks the coordinator for the bar whenever the page has scrolled past the hero, and on no other condition', () => {
    expect(STICKY).toMatch(/const showStickyCtas = visible\b/)
    expect(STICKY).toContain("useFloatingLayer('booking-bar', showStickyCtas)")
    expect(STICKY).not.toMatch(/showStickyCtas\s*=\s*visible\s*&&/)
  })

  it('does not read the consent cookie for itself', () => {
    // The bar used to work out whether the banner was up from the cookie. One
    // coordinator decides now; a second opinion here is how layers came to disagree.
    expect(STICKY).not.toContain('hasUserConsented')
  })
})

describe('the two bars are positioned from one shared measurement', () => {
  it('offsets the bar by the height the banner publishes', () => {
    expect(STICKY).toContain('var(--cookie-banner-height, 0px)')
  })

  it('moves the bar with transform, never with bottom', () => {
    // Changing `bottom` when the banner arrives a second after the page is counted by
    // the browser as a layout shift. It was the moving part in 8 of 10 real-visitor
    // readings that recorded any movement (site review FD-007, LS-003).
    expect(STICKY).toContain("'translateY(calc(-1 * var(--cookie-banner-height, 0px)))'")
    expect(STICKY).not.toMatch(/\bbottom:\s/)
    expect(STICKY).not.toMatch(/transition-\[[^\]]*bottom/)
  })

  it('publishes that height from the banner, measured rather than hardcoded', () => {
    // The banner wraps to two lines on narrow screens and grows again when preferences
    // expand. A hardcoded height would overlap on exactly the phones that matter most.
    expect(BANNER).toContain('--cookie-banner-height')
    expect(BANNER).toContain('offsetHeight')
    expect(BANNER).toContain('ResizeObserver')
  })

  it('resets the height when the banner goes away', () => {
    // A stale value would push the bar up off the bottom edge on every later page.
    expect(BANNER).toMatch(/setProperty\(BANNER_HEIGHT_VAR, '0px'\)/)
  })

  it('keeps the banner layered above the bar', () => {
    // The bar sits on top of the banner, so the banner must win any overlap during the
    // slide transition.
    expect(BANNER).toMatch(/z-\[90\]/)
    expect(STICKY).toMatch(/z-\[80\]/)
  })

  it('gives the safe-area inset to whichever element touches the bottom edge', () => {
    // Applying it in both places opens a visible gap inside the bar on notched phones.
    expect(STICKY).toMatch(/paddingBottom: cookieBannerVisible/)
  })

  it('publishes its own height for the page to keep focused controls clear of it', () => {
    expect(STICKY).toContain("'--booking-bar-height'")
    const css = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf8')
    expect(css).toContain(
      'scroll-padding-bottom: calc(var(--booking-bar-height, 0px) + var(--cookie-banner-height, 0px));'
    )
  })
})

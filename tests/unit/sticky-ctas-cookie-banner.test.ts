import fs from 'fs'
import path from 'path'

const STICKY = fs.readFileSync(
  path.join(process.cwd(), 'components/layout/StickyCtas.tsx'),
  'utf8'
)
const BANNER = fs.readFileSync(
  path.join(process.cwd(), 'components/CookieBanner.tsx'),
  'utf8'
)

/**
 * Source-level guards, because the thing worth protecting is a decision rather than a
 * rendered pixel: the sticky bar must never again make itself invisible because another
 * fixed element is on screen.
 *
 * The original code read `visible && !cookieBannerVisible`. It looked like collision
 * avoidance and behaved like a conversion leak, because the person who has not answered
 * the cookie prompt is by definition a first-time visitor: exactly the one who most needs
 * an obvious way to book, and the one guaranteed not to see it.
 *
 * A DOM test cannot catch a regression here. Both elements are position:fixed and the
 * failure is that one of them is simply absent, which renders as a perfectly valid page.
 */

describe('the cookie banner never suppresses the booking bar', () => {
  it('does not gate visibility on the cookie banner', () => {
    expect(STICKY).not.toMatch(/showStickyCtas\s*=\s*visible\s*&&\s*!\s*cookieBannerVisible/)
  })

  it('shows whenever the page has scrolled past the hero, and on no other condition', () => {
    expect(STICKY).toMatch(/const showStickyCtas = visible\b/)
  })

  it('still tracks the banner, but only to position itself', () => {
    // The flag is legitimate: it decides the offset and which element owns the safe-area
    // inset. It must not creep back into the visibility expression.
    expect(STICKY).toContain('cookieBannerVisible')
    expect(STICKY).toMatch(/bottom: cookieBannerVisible/)
  })
})

describe('the two bars are positioned from one shared measurement', () => {
  it('offsets the bar by the height the banner publishes', () => {
    expect(STICKY).toContain('var(--cookie-banner-height, 0px)')
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
})

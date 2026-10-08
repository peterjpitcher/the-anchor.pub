/**
 * Switching a cookie category off removes that category's cookies.
 *
 * Only Reject All used to clean up. The preferences panel's Save wrote the new
 * choice and stopped, so a visitor who had accepted everything and later
 * switched analytics or marketing off kept the Google, Microsoft, Meta and
 * LinkedIn cookies already on the device until they expired. Unused, because
 * consent mode was denied, but still there.
 *
 * As in cookie-settings-control.test.tsx, nothing is mocked between the click
 * and the device: the real footer, banner and providers, and the browser's own
 * cookie jar read back afterwards.
 *
 * This file runs on the live site's address. The tags set their cookies on
 * ".the-anchor.pub", the domain above the one the page is served from, and a
 * cookie can only be deleted by naming the domain it was set on. On jsdom's
 * default "localhost" every cookie belongs to the host alone and that half of
 * the job would go untested.
 *
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://www.the-anchor.pub/"}
 */

import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CookieBanner from '@/components/CookieBanner'
import { Footer } from '@/components/layout/Footer'
import { AnalyticsProvider } from '@/components/tracking/AnalyticsProvider'
import { GTMProvider } from '@/components/tracking/GTMProvider'
import { clearBookingAttributionForTest } from '@/lib/booking-attribution'
import { getConsentStatus, rejectAllCookies, setConsentStatus } from '@/lib/cookies'
import { standInForPageReload } from '../helpers/page-reload'

jest.mock('next/navigation', () => ({
  usePathname: () => '/'
}))

// Clarity only starts when its project id is set, which differs between a
// laptop and CI. It is not under test here, so it is held still.
jest.mock('@microsoft/clarity', () => ({
  __esModule: true,
  default: { init: jest.fn(), consentV2: jest.fn() }
}))

// Switching a category off reloads the page (tests/unit/cookie-withdrawal-reload.test.tsx).
// jsdom cannot, so the reload is stood in for here.
standInForPageReload()

/** Where the tags put their cookies on the live site. */
const SITE_WIDE = '.the-anchor.pub'

// Google Analytics (its client cookie and the GA4 session cookie, which carries
// the property's id in its name) and Microsoft Clarity.
const ANALYTICS_COOKIES = ['_ga', '_ga_ABC123XYZ9', '_clck', '_clsk']
// Meta's pixel, Google's advert click cookie and LinkedIn's Insight Tag.
const MARKETING_COOKIES = ['_fbp', '_fbc', '_gcl_au', 'li_fat_id']

function cookiesOnDevice(): string[] {
  return document.cookie
    .split('; ')
    .filter(Boolean)
    .map((pair) => pair.split('=')[0])
}

/** The ones from `names` that are still on the device, in the order given. */
function held(names: string[]): string[] {
  const present = cookiesOnDevice()
  return names.filter((name) => present.includes(name))
}

function plant(names: string[], domain?: string) {
  names.forEach((name) => {
    document.cookie = `${name}=planted; path=/; max-age=3600${domain ? `; domain=${domain}` : ''}`
  })
  // A cookie the jar refused would make every "it is gone" below pass for nothing.
  expect(held(names)).toEqual(names)
}

function clearEveryCookie() {
  cookiesOnDevice().forEach((name) => {
    document.cookie = `${name}=; path=/; max-age=0`
    document.cookie = `${name}=; path=/; domain=${SITE_WIDE}; max-age=0`
  })
}

/** The footer and banner inside the providers `app/layout.tsx` wraps them in. */
function renderSite() {
  return render(
    <GTMProvider gtmId="GTM-TEST">
      <AnalyticsProvider>
        <main>A page</main>
        <Footer copyright={{ year: 2026 }} />
        <CookieBanner />
      </AnalyticsProvider>
    </GTMProvider>
  )
}

/** The banner waits a second before it shows. Skip the wait, then hand the clock back. */
function renderSiteWithBannerShowing() {
  jest.useFakeTimers()
  renderSite()
  act(() => {
    jest.advanceTimersByTime(1500)
  })
  jest.useRealTimers()
  expect(screen.getByText("Cookies: it's your choice")).toBeInTheDocument()
}

function panel(): HTMLElement {
  return screen.getByRole('dialog', { name: 'Cookie Preferences' })
}

async function saveInPanel(
  user: ReturnType<typeof userEvent.setup>,
  switches: Array<'Analytics Cookies' | 'Marketing Cookies'>
) {
  await user.click(within(screen.getByRole('contentinfo')).getByRole('button', { name: 'Cookie settings' }))
  for (const name of switches) {
    await user.click(within(panel()).getByRole('checkbox', { name }))
  }
  await user.click(within(panel()).getByRole('button', { name: 'Save Preferences' }))
}

beforeAll(() => {
  // The banner measures its own height for the sticky booking bar. jsdom has no layout
  // and no ResizeObserver, and the measurement is not what is being checked here.
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

beforeEach(() => {
  clearBookingAttributionForTest()
  window.localStorage.clear()
  clearEveryCookie()
  // GTMProvider wires its listener once per window; each test gets a fresh one.
  delete window.__gtmLoaded
  window.gtag = jest.fn()
})

afterEach(() => {
  jest.useRealTimers()
  clearBookingAttributionForTest()
  window.localStorage.clear()
  clearEveryCookie()
})

describe('switching a category off in the preferences panel', () => {
  it('marketing off removes the marketing cookies and leaves the analytics ones', async () => {
    const user = userEvent.setup()
    setConsentStatus({ analytics: true, marketing: true })
    plant(ANALYTICS_COOKIES, SITE_WIDE)
    plant(MARKETING_COOKIES, SITE_WIDE)
    renderSite()

    await saveInPanel(user, ['Marketing Cookies'])

    expect(getConsentStatus()).toMatchObject({ analytics: true, marketing: false })
    expect(held(MARKETING_COOKIES)).toEqual([])
    expect(held(ANALYTICS_COOKIES)).toEqual(ANALYTICS_COOKIES)
  })

  it('analytics off removes the analytics cookies and leaves the marketing ones', async () => {
    const user = userEvent.setup()
    setConsentStatus({ analytics: true, marketing: true })
    plant(ANALYTICS_COOKIES, SITE_WIDE)
    plant(MARKETING_COOKIES, SITE_WIDE)
    renderSite()

    await saveInPanel(user, ['Analytics Cookies'])

    expect(getConsentStatus()).toMatchObject({ analytics: false, marketing: true })
    expect(held(ANALYTICS_COOKIES)).toEqual([])
    expect(held(MARKETING_COOKIES)).toEqual(MARKETING_COOKIES)
  })

  it('both off removes both, and the choice itself is kept', async () => {
    const user = userEvent.setup()
    setConsentStatus({ analytics: true, marketing: true })
    plant(ANALYTICS_COOKIES, SITE_WIDE)
    plant(MARKETING_COOKIES, SITE_WIDE)
    renderSite()

    await saveInPanel(user, ['Analytics Cookies', 'Marketing Cookies'])

    expect(held([...ANALYTICS_COOKIES, ...MARKETING_COOKIES])).toEqual([])
    // The cookie that records the refusal has to outlive the ones it refuses.
    expect(getConsentStatus()).toMatchObject({ analytics: false, marketing: false })
  })
})

describe('Reject All', () => {
  it('still removes both, for a visitor whose choice has lapsed but whose cookies have not', async () => {
    plant(ANALYTICS_COOKIES, SITE_WIDE)
    plant(MARKETING_COOKIES, SITE_WIDE)
    renderSiteWithBannerShowing()
    const user = userEvent.setup()

    // Two buttons, one per layout. jsdom applies no CSS, so both are in the tree.
    const rejectButtons = screen.getAllByRole('button', { name: 'Reject all cookies' })
    await user.click(rejectButtons[rejectButtons.length - 1])

    expect(getConsentStatus()).toMatchObject({ analytics: false, marketing: false })
    expect(held([...ANALYTICS_COOKIES, ...MARKETING_COOKIES])).toEqual([])
  })
})

describe('turning a category on', () => {
  it('deletes nothing when marketing is switched on in the panel', async () => {
    const user = userEvent.setup()
    setConsentStatus({ analytics: true, marketing: false })
    plant(ANALYTICS_COOKIES, SITE_WIDE)
    plant(['a-cookie-of-our-own'])
    renderSite()

    await saveInPanel(user, ['Marketing Cookies'])

    expect(getConsentStatus()).toMatchObject({ analytics: true, marketing: true })
    expect(held([...ANALYTICS_COOKIES, 'a-cookie-of-our-own'])).toEqual([...ANALYTICS_COOKIES, 'a-cookie-of-our-own'])
  })

  it('deletes nothing when Accept All is pressed on the banner', async () => {
    plant(ANALYTICS_COOKIES, SITE_WIDE)
    plant(MARKETING_COOKIES, SITE_WIDE)
    renderSiteWithBannerShowing()
    const user = userEvent.setup()

    const acceptButtons = screen.getAllByRole('button', { name: 'Accept all cookies' })
    await user.click(acceptButtons[acceptButtons.length - 1])

    expect(getConsentStatus()).toMatchObject({ analytics: true, marketing: true })
    expect(held([...ANALYTICS_COOKIES, ...MARKETING_COOKIES])).toEqual([...ANALYTICS_COOKIES, ...MARKETING_COOKIES])
  })
})

describe('which cookies the clean-up reaches', () => {
  it('removes the GA4 session cookie whatever id it carries, and the other Google Analytics names', () => {
    const names = ['_ga', '_ga_ABC123XYZ9', '_ga_1', '_gid', '_gat', '_gat_gtag_UA_1_1']
    plant(names, SITE_WIDE)

    setConsentStatus({ analytics: false, marketing: true })

    expect(held(names)).toEqual([])
  })

  it("removes Google's advert click cookies by family, not by one fixed name", () => {
    const names = ['_gcl_au', '_gcl_aw', '_gcl_gs', '_gcl_dc', '_gac_UA-1-1', '_gac_gb_AW-1']
    plant(names, SITE_WIDE)

    setConsentStatus({ analytics: true, marketing: false })

    expect(held(names)).toEqual([])
  })

  it("removes LinkedIn's first-party cookies and our own advert record", () => {
    const names = ['li_fat_id', 'li_giant', 'ln_or', 'oribi_cookie_test', 'oribili_user_guid']
    plant(names, SITE_WIDE)
    plant(['anchor-booking-attribution'])

    setConsentStatus({ analytics: true, marketing: false })

    expect(held([...names, 'anchor-booking-attribution'])).toEqual([])
  })

  it('removes a cookie set on this host as well as one set on the domain above it', () => {
    // Two cookies with one name: they differ by domain, and each needs its own delete.
    plant(['_ga'])
    plant(['_ga'], SITE_WIDE)
    expect(cookiesOnDevice().filter((name) => name === '_ga')).toHaveLength(2)

    setConsentStatus({ analytics: false, marketing: false })

    expect(held(['_ga'])).toEqual([])
  })

  it('leaves every other cookie alone, however close its name', () => {
    const lookalikes = ['_gadget', '_gab', 'ga', '_fbpixel', '_gclid', 'li_fat', '_clckx', 'theme']
    plant(lookalikes, SITE_WIDE)

    rejectAllCookies()

    expect(held(lookalikes)).toEqual(lookalikes)
    expect(held(['anchor-cookie-consent'])).toEqual(['anchor-cookie-consent'])
  })

  it('clears a category that is off on every save, not only the save that switched it off', () => {
    // A first choice of analytics only. Nothing went from on to off, but marketing is
    // off, so marketing cookies left by an earlier visit have no business staying.
    plant(ANALYTICS_COOKIES, SITE_WIDE)
    plant(MARKETING_COOKIES, SITE_WIDE)

    setConsentStatus({ analytics: true, marketing: false })

    expect(held(MARKETING_COOKIES)).toEqual([])
    expect(held(ANALYTICS_COOKIES)).toEqual(ANALYTICS_COOKIES)
  })
})

// The same tags keep a copy of their identifier in the browser's storage, which
// deleting cookies does not touch. Both names were seen on a production build
// after Accept on 7 October 2026. The notice says a category switched off is
// deleted from the browser, so the storage goes with the cookies.
describe('what the tags keep in browser storage', () => {
  const GOOGLE_AD_CLICK = '_gcl_ls'
  const CLARITY_SESSION = '_cltk'
  const OURS = ['christmas_2026_lightbox_seen', 'event_banner_dismissed_until']

  function plantStorage() {
    window.localStorage.setItem(GOOGLE_AD_CLICK, 'planted')
    window.sessionStorage.setItem(CLARITY_SESSION, 'planted')
    OURS.forEach((key) => window.localStorage.setItem(key, 'planted'))
    window.sessionStorage.setItem('event_banner_session_show', 'true')
  }

  afterEach(() => {
    window.sessionStorage.clear()
  })

  it('goes on Reject All, and the notes that only keep a pop-up closed stay', () => {
    plantStorage()

    rejectAllCookies()

    expect(window.localStorage.getItem(GOOGLE_AD_CLICK)).toBeNull()
    expect(window.sessionStorage.getItem(CLARITY_SESSION)).toBeNull()
    OURS.forEach((key) => expect(window.localStorage.getItem(key)).toBe('planted'))
    expect(window.sessionStorage.getItem('event_banner_session_show')).toBe('true')
  })

  it('goes for the category switched off, and only that one', () => {
    setConsentStatus({ analytics: true, marketing: true })
    plantStorage()

    setConsentStatus({ analytics: true, marketing: false })

    expect(window.localStorage.getItem(GOOGLE_AD_CLICK)).toBeNull()
    expect(window.sessionStorage.getItem(CLARITY_SESSION)).toBe('planted')

    setConsentStatus({ analytics: false, marketing: false })

    expect(window.sessionStorage.getItem(CLARITY_SESSION)).toBeNull()
  })

  it('is left alone while both categories are on', () => {
    plantStorage()

    setConsentStatus({ analytics: true, marketing: true })

    expect(window.localStorage.getItem(GOOGLE_AD_CLICK)).toBe('planted')
    expect(window.sessionStorage.getItem(CLARITY_SESSION)).toBe('planted')
  })
})

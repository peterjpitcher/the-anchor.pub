/**
 * Switching a cookie category off reloads the page, once.
 *
 * Tag Manager's consent setting stops a tag from starting. It cannot stop one
 * that is already running in the page. Seen on 5 October 2026 on a production
 * build with the live container: after marketing was switched off in the panel
 * Google's consent mode said denied, and LinkedIn's Insight Tag went on sending
 * a request for every page change and every button pressed. Its tag has no off
 * switch to call. A full page load is what stops it, because with the choice
 * stored as off the tag is never started again.
 *
 * So a save that turns analytics or marketing from on to off reloads the page.
 * A save that turns one on does not, and nor does a first choice: nothing was
 * running to stop.
 *
 * As in cookie-settings-control.test.tsx, the footer, the banner and the two
 * providers are the real ones and the choice is read back from the one store.
 * The single stand-in is the browser's own reload, which jsdom cannot perform
 * (tests/helpers/page-reload.ts).
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
import {
  acceptAllCookies,
  getConsentStatus,
  rejectAllCookies,
  setConsentStatus,
  type CookieConsent
} from '@/lib/cookies'
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

/** Where the tags put their cookies on the live site. */
const SITE_WIDE = '.the-anchor.pub'

const MARKETING_COOKIES = ['_fbp', 'li_fat_id']
const ANALYTICS_COOKIES = ['_ga', '_clck']

type Choice = Pick<CookieConsent, 'analytics' | 'marketing'>
type SwitchName = 'Analytics Cookies' | 'Marketing Cookies'

/** What was true at the moment the page was asked to reload. */
interface AtReload {
  choice: Choice | null
  cookies: string[]
  googleToldTo: unknown[]
}

const reload = standInForPageReload()
let atReload: AtReload[] = []

function cookiesOnDevice(): string[] {
  return document.cookie
    .split('; ')
    .filter(Boolean)
    .map((pair) => pair.split('=')[0])
}

function storedChoice(): Choice | null {
  const consent = getConsentStatus()
  if (!consent) return null
  return { analytics: consent.analytics, marketing: consent.marketing }
}

function plant(names: string[]) {
  names.forEach((name) => {
    document.cookie = `${name}=planted; path=/; max-age=3600; domain=${SITE_WIDE}`
  })
  // A cookie the jar refused would make every "it is gone" below pass for nothing.
  expect(cookiesOnDevice()).toEqual(expect.arrayContaining(names))
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

async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(within(screen.getByRole('contentinfo')).getByRole('button', { name: 'Cookie settings' }))
}

async function saveInPanel(user: ReturnType<typeof userEvent.setup>, switches: SwitchName[]) {
  await openPanel(user)
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

  atReload = []
  reload.mockReset()
  // A real reload starts the page again from what is stored, so what is stored when it
  // is asked for is what decides whether the tags come back.
  reload.mockImplementation(() => {
    atReload.push({
      choice: storedChoice(),
      cookies: cookiesOnDevice(),
      googleToldTo: (window.gtag as jest.Mock).mock.calls.map((call) => call[2])
    })
  })
})

afterEach(() => {
  jest.useRealTimers()
  clearBookingAttributionForTest()
  window.localStorage.clear()
  clearEveryCookie()
})

describe('switching a category off reloads the page', () => {
  it('marketing off: once, with the choice stored, Google told and the cookies gone first', async () => {
    const user = userEvent.setup()
    setConsentStatus({ analytics: true, marketing: true })
    plant([...ANALYTICS_COOKIES, ...MARKETING_COOKIES])
    renderSite()
    reload.mockClear()

    await saveInPanel(user, ['Marketing Cookies'])

    expect(reload).toHaveBeenCalledTimes(1)
    // The page that loads next reads this cookie before Tag Manager starts. Reloading
    // ahead of the write would bring every tag straight back.
    expect(atReload[0].choice).toEqual({ analytics: true, marketing: false })
    expect(atReload[0].googleToldTo).toEqual([expect.objectContaining({ ad_storage: 'denied', analytics_storage: 'granted' })])
    expect(atReload[0].cookies).toEqual(expect.arrayContaining(ANALYTICS_COOKIES))
    MARKETING_COOKIES.forEach((name) => expect(atReload[0].cookies).not.toContain(name))
    // The panel is put away as well, so it is not what the visitor is left looking at.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('analytics off: once, with the choice stored first', async () => {
    const user = userEvent.setup()
    setConsentStatus({ analytics: true, marketing: true })
    plant([...ANALYTICS_COOKIES, ...MARKETING_COOKIES])
    renderSite()
    reload.mockClear()

    await saveInPanel(user, ['Analytics Cookies'])

    expect(reload).toHaveBeenCalledTimes(1)
    expect(atReload[0].choice).toEqual({ analytics: false, marketing: true })
    expect(atReload[0].cookies).toEqual(expect.arrayContaining(MARKETING_COOKIES))
    ANALYTICS_COOKIES.forEach((name) => expect(atReload[0].cookies).not.toContain(name))
  })

  it('both off in one save: one reload, not one for each', async () => {
    const user = userEvent.setup()
    setConsentStatus({ analytics: true, marketing: true })
    renderSite()
    reload.mockClear()

    await saveInPanel(user, ['Analytics Cookies', 'Marketing Cookies'])

    expect(reload).toHaveBeenCalledTimes(1)
    expect(atReload[0].choice).toEqual({ analytics: false, marketing: false })
  })

  it('marketing off while analytics was already off still reloads', async () => {
    const user = userEvent.setup()
    setConsentStatus({ analytics: false, marketing: true })
    renderSite()
    reload.mockClear()

    await saveInPanel(user, ['Marketing Cookies'])

    expect(reload).toHaveBeenCalledTimes(1)
  })

  // The panel is the only way a visitor reaches these today. They are here because the
  // reload lives where the choice is written, so no later caller can save one without it.
  it('covers every way a choice is written, not only the panel', () => {
    setConsentStatus({ analytics: true, marketing: true })
    reload.mockClear()
    rejectAllCookies()
    expect(reload).toHaveBeenCalledTimes(1)

    setConsentStatus({ analytics: true, marketing: true })
    reload.mockClear()
    setConsentStatus({ marketing: false })
    expect(reload).toHaveBeenCalledTimes(1)
    expect(atReload[1].choice).toEqual({ analytics: true, marketing: false })
  })
})

describe('nothing was running, so nothing is reloaded', () => {
  it('a first choice of Accept All on the banner', async () => {
    renderSiteWithBannerShowing()
    const user = userEvent.setup()

    // Two buttons, one per layout. jsdom applies no CSS, so both are in the tree.
    const acceptButtons = screen.getAllByRole('button', { name: 'Accept all cookies' })
    await user.click(acceptButtons[acceptButtons.length - 1])

    expect(storedChoice()).toEqual({ analytics: true, marketing: true })
    expect(reload).not.toHaveBeenCalled()
  })

  it('a first choice of Reject All on the banner', async () => {
    renderSiteWithBannerShowing()
    const user = userEvent.setup()

    const rejectButtons = screen.getAllByRole('button', { name: 'Reject all cookies' })
    await user.click(rejectButtons[rejectButtons.length - 1])

    expect(storedChoice()).toEqual({ analytics: false, marketing: false })
    expect(reload).not.toHaveBeenCalled()
  })

  it('a first choice saved from the panel with everything off', async () => {
    const user = userEvent.setup()
    renderSite()

    await saveInPanel(user, [])

    expect(storedChoice()).toEqual({ analytics: false, marketing: false })
    expect(reload).not.toHaveBeenCalled()
  })

  it('switching a category on', async () => {
    const user = userEvent.setup()
    setConsentStatus({ analytics: true, marketing: false })
    renderSite()
    reload.mockClear()

    await saveInPanel(user, ['Marketing Cookies'])

    expect(storedChoice()).toEqual({ analytics: true, marketing: true })
    expect(reload).not.toHaveBeenCalled()
  })

  it('saving the panel with nothing changed', async () => {
    const user = userEvent.setup()
    setConsentStatus({ analytics: true, marketing: false })
    renderSite()
    reload.mockClear()

    await saveInPanel(user, [])

    expect(storedChoice()).toEqual({ analytics: true, marketing: false })
    expect(reload).not.toHaveBeenCalled()
  })

  it('accepting everything again', () => {
    acceptAllCookies()
    acceptAllCookies()

    expect(reload).not.toHaveBeenCalled()
  })

  it('flicking a switch off and then cancelling', async () => {
    const user = userEvent.setup()
    setConsentStatus({ analytics: true, marketing: true })
    renderSite()
    reload.mockClear()

    await openPanel(user)
    await user.click(within(panel()).getByRole('checkbox', { name: 'Marketing Cookies' }))
    await user.click(within(panel()).getByRole('button', { name: 'Cancel' }))

    expect(storedChoice()).toEqual({ analytics: true, marketing: true })
    expect(reload).not.toHaveBeenCalled()
  })
})

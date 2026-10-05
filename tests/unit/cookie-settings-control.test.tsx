/**
 * Changing a cookie choice after making it.
 *
 * The banner only shows while no choice exists, and nothing reopened it, so the
 * one way to withdraw consent was to clear the site's cookies in the browser.
 * The privacy notice had to say so. The footer now carries a "Cookie settings"
 * control that reopens the banner's own preferences panel.
 *
 * Nothing here is mocked between the click and the device. The footer, the
 * banner and the two providers the root layout wraps every page in are the real
 * ones, so a withdrawal is checked where a visitor would feel it: the consent
 * cookie, the `cookieConsentUpdate` event, Google's consent mode and the advert
 * record in the browser's storage. There is one consent store, `lib/cookies.ts`,
 * and these tests read it back rather than a copy.
 */

import fs from 'fs'
import path from 'path'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PrivacyPolicyPage from '@/app/privacy-policy/page'
import CookieBanner from '@/components/CookieBanner'
import { Footer } from '@/components/layout/Footer'
import { AnalyticsProvider } from '@/components/tracking/AnalyticsProvider'
import { GTMProvider } from '@/components/tracking/GTMProvider'
import { clearBookingAttributionForTest, getBookingAttributionPayload } from '@/lib/booking-attribution'
import { getConsentStatus, setConsentStatus, type CookieConsent } from '@/lib/cookies'
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

const LANDING =
  '/lunch-and-dinner?utm_source=facebook&utm_medium=paid_social&utm_campaign=weekday_lunch_a&fbclid=fb-ad-click'

type Choice = Pick<CookieConsent, 'analytics' | 'marketing' | 'preferences'>

const storedOnDevice = () => ({
  localStorage: window.localStorage.getItem('anchor-booking-attribution'),
  cookie: document.cookie.includes('anchor-booking-attribution=')
})

function storedChoice(): Choice | null {
  const consent = getConsentStatus()
  if (!consent) return null
  return { analytics: consent.analytics, marketing: consent.marketing, preferences: consent.preferences }
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

function cookieSettingsControl(): HTMLElement {
  return within(screen.getByRole('contentinfo')).getByRole('button', { name: 'Cookie settings' })
}

function panel(): HTMLElement {
  return screen.getByRole('dialog', { name: 'Cookie Preferences' })
}

function switchFor(name: 'Analytics Cookies' | 'Marketing Cookies' | 'Preference Cookies'): HTMLElement {
  return within(panel()).getByRole('checkbox', { name })
}

function shownChoice(): Choice {
  return {
    analytics: (switchFor('Analytics Cookies') as HTMLInputElement).checked,
    marketing: (switchFor('Marketing Cookies') as HTMLInputElement).checked,
    preferences: (switchFor('Preference Cookies') as HTMLInputElement).checked
  }
}

describe('the footer Cookie settings control', () => {
  let consentUpdates: CookieConsent[]
  const recordConsentUpdate = (event: Event) => {
    consentUpdates.push((event as CustomEvent<CookieConsent>).detail)
  }

  beforeEach(() => {
    clearBookingAttributionForTest()
    window.localStorage.clear()
    document.cookie = 'anchor-cookie-consent=; path=/; max-age=0'
    window.history.pushState({}, '', '/')
    // GTMProvider wires its listener once per window; each test gets a fresh one.
    delete window.__gtmInitialized
    window.gtag = jest.fn()
    consentUpdates = []
    window.addEventListener('cookieConsentUpdate', recordConsentUpdate)
  })

  afterEach(() => {
    window.removeEventListener('cookieConsentUpdate', recordConsentUpdate)
    jest.useRealTimers()
    clearBookingAttributionForTest()
    window.localStorage.clear()
    document.cookie = 'anchor-cookie-consent=; path=/; max-age=0'
    window.history.pushState({}, '', '/')
  })

  it('is on the page after a choice has been made, when the banner no longer is', () => {
    jest.useFakeTimers()
    setConsentStatus({ analytics: true, marketing: true, preferences: true })

    renderSite()
    // The banner waits a second before showing. Go well past it.
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(screen.queryByText('We value your privacy')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(cookieSettingsControl()).toBeVisible()
    // A button, because it opens something on this page and goes nowhere.
    expect(cookieSettingsControl()).toHaveAttribute('type', 'button')
  })

  it.each<Choice>([
    { analytics: true, marketing: true, preferences: false },
    { analytics: false, marketing: true, preferences: true },
    { analytics: true, marketing: false, preferences: false },
    { analytics: false, marketing: false, preferences: false }
  ])('reopens the panel showing the choice in force: %j', async (choice) => {
    const user = userEvent.setup()
    setConsentStatus(choice)
    renderSite()

    await user.click(cookieSettingsControl())

    expect(shownChoice()).toEqual(choice)
  })

  it('switching marketing off updates the cookie, tells the page and deletes the advert record', async () => {
    const user = userEvent.setup()
    setConsentStatus({ analytics: true, marketing: true, preferences: true })
    // Arrive from an advert with marketing cookies accepted, so there is a
    // record on the device to delete. AnalyticsProvider captures it on mount.
    window.history.pushState({}, '', LANDING)
    renderSite()
    expect(storedOnDevice()).toEqual({ localStorage: expect.stringContaining('weekday_lunch_a'), cookie: true })
    consentUpdates = []

    await user.click(cookieSettingsControl())
    await user.click(switchFor('Marketing Cookies'))
    await user.click(within(panel()).getByRole('button', { name: 'Save Preferences' }))

    // The cookie, read back from the one store every tracker reads.
    expect(storedChoice()).toEqual({ analytics: true, marketing: false, preferences: true })

    // The event the trackers listen for, once, carrying the new choice.
    expect(consentUpdates).toHaveLength(1)
    expect(consentUpdates[0]).toMatchObject({ analytics: true, marketing: false, preferences: true })

    // Google's consent mode: advertising denied, analytics left as it was.
    expect(window.gtag).toHaveBeenCalledTimes(1)
    expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      personalization_storage: 'granted'
    })

    // The advert record, gone from both places it is kept, and from a booking.
    expect(storedOnDevice()).toEqual({ localStorage: null, cookie: false })
    expect(getBookingAttributionPayload()).toEqual({})

    // The panel is closed and the control is still there to change it back.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(cookieSettingsControl()).toBeVisible()
  })

  it('lets a visitor switch a category back on', async () => {
    const user = userEvent.setup()
    setConsentStatus({ analytics: false, marketing: false, preferences: false })
    renderSite()
    consentUpdates = []

    await user.click(cookieSettingsControl())
    await user.click(switchFor('Analytics Cookies'))
    await user.click(within(panel()).getByRole('button', { name: 'Save Preferences' }))

    expect(storedChoice()).toEqual({ analytics: true, marketing: false, preferences: false })
    expect(consentUpdates).toHaveLength(1)
    expect(window.gtag).toHaveBeenCalledWith(
      'consent',
      'update',
      expect.objectContaining({ analytics_storage: 'granted', ad_storage: 'denied' })
    )
  })

  it.each([
    ['Cancel', async (user: ReturnType<typeof userEvent.setup>) => user.click(within(panel()).getByRole('button', { name: 'Cancel' }))],
    ['Close', async (user: ReturnType<typeof userEvent.setup>) => user.click(within(panel()).getByRole('button', { name: 'Close preferences' }))],
    ['Escape', async (user: ReturnType<typeof userEvent.setup>) => user.keyboard('{Escape}')]
  ])('changes nothing when the panel is left with %s', async (_label, leave) => {
    const user = userEvent.setup()
    setConsentStatus({ analytics: true, marketing: true, preferences: true })
    window.history.pushState({}, '', LANDING)
    renderSite()
    consentUpdates = []

    await user.click(cookieSettingsControl())
    await user.click(switchFor('Marketing Cookies'))
    expect(shownChoice().marketing).toBe(false)
    await leave(user)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(storedChoice()).toEqual({ analytics: true, marketing: true, preferences: true })
    expect(consentUpdates).toHaveLength(0)
    expect(window.gtag).not.toHaveBeenCalled()
    expect(storedOnDevice().localStorage).not.toBeNull()

    // Opened again, it shows what is stored, not the switch that was abandoned.
    await user.click(cookieSettingsControl())
    expect(shownChoice()).toEqual({ analytics: true, marketing: true, preferences: true })
  })

  it('works from the keyboard: focus goes into the panel, stays there and comes back', async () => {
    const user = userEvent.setup()
    setConsentStatus({ analytics: true, marketing: true, preferences: true })
    renderSite()

    cookieSettingsControl().focus()
    await user.keyboard('{Enter}')

    const dialog = panel()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toContainElement(document.activeElement as HTMLElement)

    // Tab right round the panel and once more: focus never reaches the page behind.
    for (let press = 0; press < 8; press += 1) {
      await user.tab()
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
    }

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(cookieSettingsControl()).toHaveFocus()
  })

  it('opens the panel for a visitor who has not chosen yet, and stores what they save', async () => {
    const user = userEvent.setup()
    renderSite()
    expect(storedChoice()).toBeNull()

    await user.click(cookieSettingsControl())
    expect(shownChoice()).toEqual({ analytics: false, marketing: false, preferences: false })

    await user.click(switchFor('Analytics Cookies'))
    await user.click(within(panel()).getByRole('button', { name: 'Save Preferences' }))

    expect(storedChoice()).toEqual({ analytics: true, marketing: false, preferences: false })
    expect(consentUpdates).toHaveLength(1)
  })
})

describe('the privacy notice and the control', () => {
  it('names the control by the label the footer gives it', () => {
    const footer = render(<Footer copyright={{ year: 2026 }} />)
    const label = cookieSettingsControl().textContent
    footer.unmount()

    render(<PrivacyPolicyPage />)

    expect(label).toBe('Cookie settings')
    expect(screen.getByText(/If you don't accept marketing cookies/)).toHaveTextContent(
      `Choose ${label} at the bottom of any page.`
    )
  })
})

describe('nothing is painted over the panel', () => {
  // jsdom has no layout, so paint order cannot be rendered here. This reads the
  // layers from the source instead, the way sticky-ctas-cookie-banner.test.ts does.
  // The event countdown card comes later in the page than the banner, so on an
  // equal z-index it wins, and it used to cover the panel's text.
  function layerOf(file: string, fixedElement: RegExp): number {
    const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8')
    const line = source.split('\n').find((candidate) => fixedElement.test(candidate))
    const layer = line?.match(/z-\[(\d+)\]/)
    if (!layer) throw new Error(`No fixed element matching ${fixedElement} with a z-[n] class in ${file}`)
    return Number(layer[1])
  }

  it('puts the panel above the event countdown card and the sticky booking bar', () => {
    const panelLayer = layerOf('components/CookieBanner.tsx', /className="fixed inset-0 /)
    const eventCard = layerOf('components/EventCountdownBanner.tsx', /className="fixed bottom-28 /)
    const stickyBar = layerOf('components/layout/StickyCtas.tsx', /z-\[\d+\]/)

    expect(panelLayer).toBeGreaterThan(eventCard)
    expect(panelLayer).toBeGreaterThan(stickyBar)
  })
})

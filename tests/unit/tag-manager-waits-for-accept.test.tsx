/**
 * Google Tag Manager is not loaded until the visitor accepts analytics cookies.
 *
 * Owner decision, 7 October 2026: Google Analytics and Microsoft Clarity are
 * off until a visitor presses Accept. The published container fires both with
 * no consent condition, so until now they ran before any choice and carried on
 * after Reject. The container is not in this repository; whether it loads is.
 *
 * Nothing is mocked between the banner and the page: the real banner, the real
 * provider and the real cookie. What is checked is the script element, because
 * that is the request.
 *
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://www.the-anchor.pub/"}
 */

import fs from 'fs'
import path from 'path'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CookieBanner from '@/components/CookieBanner'
import { GTMProvider } from '@/components/tracking/GTMProvider'
import { setConsentStatus } from '@/lib/cookies'
import { standInForPageReload } from '../helpers/page-reload'

jest.mock('next/navigation', () => ({
  usePathname: () => '/'
}))

standInForPageReload()

const GTM_SRC = 'https://www.googletagmanager.com/gtm.js?id=GTM-TEST'

function tagManagerScripts(): HTMLScriptElement[] {
  return Array.from(document.querySelectorAll('script')).filter((script) =>
    script.src.includes('googletagmanager.com')
  )
}

function clearEveryCookie() {
  document.cookie
    .split('; ')
    .filter(Boolean)
    .forEach((pair) => {
      document.cookie = `${pair.split('=')[0]}=; path=/; max-age=0`
    })
}

function renderSite() {
  return render(
    <GTMProvider gtmId="GTM-TEST">
      <CookieBanner />
    </GTMProvider>
  )
}

/** Renders with no stored choice and waits for the banner, which shows after a second. */
function renderSiteWithBannerShowing() {
  jest.useFakeTimers()
  const view = renderSite()
  act(() => {
    jest.advanceTimersByTime(1000)
  })
  jest.useRealTimers()
  expect(screen.getByText("Cookies: it's your choice")).toBeInTheDocument()
  return view
}

beforeAll(() => {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

beforeEach(() => {
  clearEveryCookie()
  tagManagerScripts().forEach((script) => script.remove())
  delete window.__gtmLoaded
  window.dataLayer = []
  window.gtag = jest.fn((...args: unknown[]) => {
    window.dataLayer?.push(args as unknown as Record<string, unknown>)
  }) as unknown as typeof window.gtag
})

afterEach(() => {
  jest.useRealTimers()
  clearEveryCookie()
})

describe('before any choice', () => {
  it('adds no Tag Manager script', () => {
    renderSiteWithBannerShowing()

    expect(tagManagerScripts()).toHaveLength(0)
    expect(window.dataLayer).not.toContainEqual(expect.objectContaining({ event: 'gtm.js' }))
  })
})

describe('after Reject', () => {
  it('adds no Tag Manager script', async () => {
    renderSiteWithBannerShowing()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Reject all cookies' }))

    expect(tagManagerScripts()).toHaveLength(0)
  })

  it('adds none on the next page either', () => {
    setConsentStatus({ analytics: false, marketing: false })
    renderSite()

    expect(tagManagerScripts()).toHaveLength(0)
  })
})

describe('after Accept', () => {
  it('adds the script once, and only after Google has been told the choice', async () => {
    renderSiteWithBannerShowing()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Accept all cookies' }))

    const scripts = tagManagerScripts()
    expect(scripts).toHaveLength(1)
    expect(scripts[0].src).toBe(GTM_SRC)
    expect(scripts[0].async).toBe(true)

    // Order in the dataLayer is the order the container reads it in: the
    // consent update first, then the container's own start-up event.
    const layer = window.dataLayer as unknown[]
    const updateAt = layer.findIndex(
      (entry) => Array.isArray(entry) && entry[0] === 'consent' && entry[1] === 'update'
    )
    const startAt = layer.findIndex(
      (entry) => !Array.isArray(entry) && (entry as { event?: string }).event === 'gtm.js'
    )
    expect(updateAt).toBeGreaterThanOrEqual(0)
    expect(startAt).toBeGreaterThan(updateAt)
    expect(layer[updateAt]).toEqual([
      'consent',
      'update',
      {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
      }
    ])
  })

  it('loads it straight away for a returning visitor who accepted before', () => {
    setConsentStatus({ analytics: true, marketing: true })
    renderSite()

    expect(tagManagerScripts()).toHaveLength(1)
  })

  it('never adds a second copy, however many times the choice is saved', () => {
    setConsentStatus({ analytics: true, marketing: true })
    renderSite()
    act(() => {
      setConsentStatus({ analytics: true, marketing: true })
      setConsentStatus({ analytics: true, marketing: false })
    })

    expect(tagManagerScripts()).toHaveLength(1)
  })
})

// The container also carries Google Analytics and Clarity, with no consent
// condition of their own. A visitor who says yes to marketing and no to
// analytics has refused both, so the container stays out. See the comment on
// mayLoadTagManager for what has to change in the container before this can.
describe('marketing accepted, analytics refused', () => {
  it('adds no Tag Manager script', () => {
    setConsentStatus({ analytics: false, marketing: true })
    renderSite()

    expect(tagManagerScripts()).toHaveLength(0)
  })
})

// The page itself must not load the container by any other route. These are
// read from the source because the root layout is a server component that
// cannot be rendered here, and because the failure is a line that should not
// exist rather than one that behaves wrongly.
describe('the root layout', () => {
  const LAYOUT = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf8')
  // Comments explain what was removed and name the hosts; only code counts.
  const CODE = LAYOUT.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '')

  it('names no Google host: no script, no noscript frame and no connection hint', () => {
    expect(CODE).not.toContain('googletagmanager.com')
    expect(CODE).not.toContain('google-analytics.com')
    expect(CODE).not.toContain('<noscript')
  })

  it('still sets the consent defaults to denied before anything else runs', () => {
    expect(CODE).toContain("gtag('consent','default'")
    expect(CODE).toMatch(/'analytics_storage':'denied'/)
    expect(CODE).toMatch(/'ad_storage':'denied'/)
  })
})

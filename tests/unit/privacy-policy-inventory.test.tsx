/**
 * The privacy notice names every company a page can load from, every cookie
 * the site cleans up, and every note the site keeps in the browser's storage.
 *
 * The notice was rewritten on 8 October 2026 after a review found it named four
 * of the companies that handle customer data and described cookies the site did
 * not have. These checks are here so it cannot drift that way again without a
 * test failing: add a host to the Content Security Policy, a storage key to a
 * component or a company to the list, and the notice has to say so.
 *
 * What they cannot see: the Tag Manager container (it is not in this
 * repository) and the management app. A tag added there, or a new provider in
 * that app, still has to be added to the notice by hand.
 *
 * @jest-environment jsdom
 */

import fs from 'fs'
import path from 'path'
import { render } from '@testing-library/react'
import PrivacyPolicyPage from '@/app/privacy-policy/page'

jest.mock('next/navigation', () => ({
  usePathname: () => '/privacy-policy'
}))

jest.mock('@/lib/gtm-events', () => ({
  ...jest.requireActual('@/lib/gtm-events'),
  trackPhoneCallClick: jest.fn(),
  trackEmailClick: jest.fn()
}))

const ROOT = process.cwd()
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8')

function noticeText(): string {
  const { container, unmount } = render(<PrivacyPolicyPage />)
  const text = (container.textContent ?? '').replace(/\s+/g, ' ')
  unmount()
  return text
}

function sourceFiles(dir: string, found: string[] = []): string[] {
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const relative = `${dir}/${entry.name}`
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue
      sourceFiles(relative, found)
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name)) {
      found.push(relative)
    }
  }
  return found
}

describe('every outside host a page may load from has its company named in the notice', () => {
  // The host as it appears in config/security-headers.json, and the name the
  // notice must use for the company behind it.
  const COMPANY_FOR_HOST: Record<string, string> = {
    'www.googletagmanager.com': 'Google Tag Manager',
    'www.google-analytics.com': 'Google Analytics',
    'www.google.com': 'Google Maps',
    'maps.google.com': 'Google Maps',
    'www.youtube-nocookie.com': 'YouTube',
    'connect.facebook.net': 'Meta (Facebook and Instagram)',
    'www.paypal.com': 'PayPal',
    '*.paypal.com': 'PayPal',
    'www.paypalobjects.com': 'PayPal',
    'challenges.cloudflare.com': 'Cloudflare',
    'www.clarity.ms': 'Microsoft Clarity',
    '*.clarity.ms': 'Microsoft Clarity',
    'snap.licdn.com': 'LinkedIn'
  }

  const headers = JSON.parse(read('config/security-headers.json')) as Array<{ key: string; value: string }>
  const policy = headers.find((header) => header.key === 'Content-Security-Policy')?.value ?? ''
  const hosts = Array.from(
    new Set(Array.from(policy.matchAll(/https?:\/\/([^\s;]+)/g), (match) => match[1]))
  )

  it('finds the hosts to check', () => {
    expect(hosts.length).toBeGreaterThan(5)
  })

  it.each(hosts)('%s', (host) => {
    const company = COMPANY_FOR_HOST[host]
    if (!company) {
      throw new Error(
        `${host} is allowed by config/security-headers.json but this test does not know whose it is. ` +
          'Add it to COMPANY_FOR_HOST, and name the company in app/privacy-policy/page.tsx with what it is for.'
      )
    }
    expect(noticeText()).toContain(company)
  })
})

describe('the companies that handle bookings, messages and payments are named', () => {
  // From the management app's code, read on 8 October 2026. This list cannot
  // check itself against that app: it only stops a name being dropped here.
  it.each([
    'Orange Jelly Limited',
    'Cloudflare',
    'Vercel',
    'Supabase',
    'Twilio',
    'Resend',
    'Microsoft 365',
    'PayPal',
    'OpenAI',
    'Upstash'
  ])('%s', (name) => {
    expect(noticeText()).toContain(name)
  })
})

describe('cookies', () => {
  it('names the one cookie set without a choice, and how long it lasts', () => {
    const cookies = read('lib/cookies.ts')
    expect(cookies).toContain("const CONSENT_COOKIE_NAME = 'anchor-cookie-consent'")
    expect(cookies).toContain('const CONSENT_DURATION_DAYS = 365')

    expect(noticeText()).toContain('anchor-cookie-consent is a cookie of our own. It remembers your cookie choice for a year')
  })

  it.each(['_ga', '_ga_', '_clck', '_clsk', '_fbp', '_fbc', 'li_fat_id', '_gcl_', 'anchor-booking-attribution'])(
    'names %s, which the site removes when its category is switched off',
    (name) => {
      // Still in the clean-up list, so still something a tag here can set.
      expect(read('lib/cookies.ts')).toContain(`'${name}'`)
      expect(noticeText()).toContain(name)
    }
  )

  it('no longer describes a preference category, a newsletter, secure areas or anonymous analytics', () => {
    const text = noticeText().toLowerCase()

    for (const gone of ['preference cookies', 'language preference', 'newsletter', 'secure areas', 'anonymized', 'anonymous']) {
      expect(text).not.toContain(gone)
    }
  })
})

describe('notes kept in browser storage', () => {
  // Each key the site writes whatever the cookie choice, and the file it lives in.
  const KEYS: Record<string, string> = {
    christmas_2026_lightbox_seen: 'components/features/christmas/ChristmasLightbox.tsx',
    christmas_enquiry_submitted: 'app/christmas-parties/client-components.tsx',
    christmas_enquiry_lightbox_last: 'app/christmas-parties/client-components.tsx',
    event_banner_dismissed_until: 'components/EventCountdownBanner.tsx',
    event_banner_session_show: 'components/EventCountdownBanner.tsx',
    promo_private_hire_2026_dismissed_until: 'lib/promos/privateHire2026.ts',
    promo_private_hire_2026_disabled: 'lib/promos/privateHire2026.ts',
    sunday_lunch_booking_prompt_dismissed: 'components/sunday-lunch/TimedBookingPrompt.tsx',
    sunday_lunch_exit_intent_shown: 'components/conversion/ExitIntentBookingModal.tsx',
    sunday_lunch_scroll_tooltip_shown: 'components/conversion/ScrollProgressBookingTooltip.tsx',
    plane_spotting_booking_prompt_shown: 'components/plane-spotting/PlaneSpottingBookingPrompt.tsx',
    'anchor-private-hire-selected-space': 'components/private-hire/venue-tour/venue-tour-data.ts'
  }

  it.each(Object.entries(KEYS))('%s is still written by the site and is named in the notice', (key, file) => {
    expect(read(file)).toContain(`'${key}'`)
    expect(noticeText()).toContain(key)
  })

  // The files that touch localStorage or sessionStorage. A new one means a new
  // key, which has to be added above and to the notice.
  const KNOWN_STORAGE_FILES = [
    'app/christmas-parties/client-components.tsx',
    'components/EventCountdownBanner.tsx',
    'components/PrivateBookingCalculator.tsx',
    'components/conversion/ExitIntentBookingModal.tsx',
    'components/conversion/ScrollProgressBookingTooltip.tsx',
    'components/features/christmas/ChristmasLightbox.tsx',
    'components/plane-spotting/PlaneSpottingBookingPrompt.tsx',
    'components/private-hire/venue-tour/InteractiveVenueFloorPlan.tsx',
    'components/promos/PrivateHire2026PromoPopup.tsx',
    'components/sunday-lunch/TimedBookingPrompt.tsx',
    // The advert record: needs marketing cookies, and has its own lines in the notice.
    'lib/booking-attribution.ts',
    // The clean-up when a category is switched off. It removes, and writes nothing.
    'lib/cookies.ts',
    // Would keep allergen filter choices, but no page uses it: see the next test.
    'hooks/useAllergenFilter.ts'
  ]

  it('is written by no file this test has not seen', () => {
    const using = ['app', 'components', 'lib', 'hooks']
      .flatMap((dir) => sourceFiles(dir))
      .filter((file) => /\b(localStorage|sessionStorage)\b/.test(read(file).replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')))
      .sort()

    expect(using).toEqual([...KNOWN_STORAGE_FILES].sort())
  })

  it('does not include allergen filter choices, because no page uses that filter', () => {
    // hooks/useAllergenFilter.ts would store which allergens a visitor hides.
    // That says something about a person's health, so the day a page mounts it
    // the notice has to name its four keys. Until then they are not listed.
    // A call, not an import: two files import its types and store nothing.
    const users = ['app', 'components', 'lib']
      .flatMap((dir) => sourceFiles(dir))
      .filter((file) => /\buseAllergenFilter\s*\(/.test(read(file)))

    expect(users).toEqual([])
  })
})

describe('what the notice leaves out on purpose', () => {
  it('states no company number, no legal basis and no transfer safeguard: none is on record', () => {
    const text = noticeText().toLowerCase()

    for (const unrecorded of ['company number', 'registered in england', 'legal basis', 'legitimate interest', 'standard contractual']) {
      expect(text).not.toContain(unrecorded)
    }
  })

  it('gives the owner decision on job applications, word for word', () => {
    expect(noticeText()).toContain(
      "If you don't get the job, we delete your CV and your contact details 12 months after you apply. We keep a short record for good: your name, the role, the date, the outcome and the reason."
    )
  })

  it('says job applications are stored and read by a named AI service, with a person deciding', () => {
    const text = noticeText()

    expect(text).toContain('Your application and CV are kept in our booking and management system.')
    expect(text).toContain('We use an AI service, OpenAI, to help us read applications.')
    expect(text).toContain('a person reads every application and makes every decision')
    expect(text).not.toContain('are not stored on the website server')
    expect(text).not.toContain('within 6 months')
  })
})

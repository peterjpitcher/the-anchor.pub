import fs from 'fs'
import path from 'path'
import type { ComponentProps } from 'react'
import { act, render, screen } from '@testing-library/react'

/**
 * Review BK-199. Booking pages carried code their guests mostly never use:
 * the quick booking sheet on every page, PayPal's wrapper on /book-table and
 * every event page before anyone owed money, and Cloudflare's security check
 * for a Christmas form inside a closed drawer. Each is now fetched or started
 * when it is needed. The build confirms the first-load chunks; these keep the
 * imports from sliding back.
 */

// Cloudflare's widget, as a marker that it was started.
jest.mock('@marsidev/react-turnstile', () => {
  const React = require('react')
  return {
    Turnstile: React.forwardRef(function MarkedTurnstile() {
      return <div data-testid="turnstile-started" />
    })
  }
})

jest.mock('@/lib/gtm-events', () => new Proxy({}, { get: (_target, name) => (name === '__esModule' ? false : jest.fn()) }))

const read = (file: string): string => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('code a booking page only loads when it is used', () => {
  it.each([
    ['components/layout/StickyCtas.tsx', 'QuickBookSheet', "@/components/features/TableBooking/QuickBookSheet"],
    ['components/features/TableBooking/ManagementTableBookingForm.tsx', 'PayPalDepositSection', './PayPalDepositSection'],
    ['components/features/EventBooking/ManagementEventBookingForm.tsx', 'PayPalEventPaymentSection', './PayPalEventPaymentSection']
  ])('%s fetches %s on demand, never in its first load', (file, name, modulePath) => {
    const source = read(file)
    // A value import would put the module in the page's first load. A type
    // import is erased, so it is allowed.
    const valueImport = new RegExp(`^import \\{[^}]*\\b${name}\\b[^}]*\\} from '${modulePath.replace(/[./]/g, '\\$&')}'`, 'm')
    expect(source).not.toMatch(valueImport)
    expect(source).toContain(`import('${modulePath}')`)
    expect(source).toMatch(/import dynamic from 'next\/dynamic'/)
  })
})

describe('the Christmas drawer starts its security check only once it is opened', () => {
  // The module reads the site key once, as it loads, so it is set here and the
  // module is required below, after it. Not jest.isolateModules: that would
  // load a second copy of React beside the one the renderer holds.
  const originalSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key'
  afterAll(() => {
    if (originalSiteKey === undefined) delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    else process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = originalSiteKey
  })

  function renderForm(securityCheckActive: boolean) {
    const { ChristmasEnquiryForm } = require('@/app/christmas-parties/client-components') as typeof import('@/app/christmas-parties/client-components')
    const props: ComponentProps<typeof ChristmasEnquiryForm> = {
      context: { mode: 'party', service: 'lunch', courseTier: 'undecided', source: 'test', perks: [] },
      season: {
        state: 'active',
        windowLabel: '10 November to 20 December 2026',
        minEnquiryDate: '2026-11-10',
        maxEnquiryDate: '2026-12-20',
        isBookable: true,
        bookingClosed: false,
        showChristmasDayNotice: false
      },
      facts: {
        minPartySize: 4,
        christmasDay: { opens: '12:00', closes: '15:00', foodService: false },
        minNoticeHours: 24,
        depositPerPerson: 10,
        buffetMinimumGuests: 20,
        maxSeated: 50,
        maxStanding: 100,
        privateHireThreshold: 20
      },
      onContextChange: jest.fn(),
      onSuccess: jest.fn(),
      securityCheckActive
    }
    return render(<ChristmasEnquiryForm {...props} />)
  }

  it('does not start it while the drawer is closed', async () => {
    renderForm(false)
    await act(async () => {})
    expect(screen.queryByTestId('turnstile-started')).not.toBeInTheDocument()
  })

  it('starts it once the drawer has been opened', async () => {
    renderForm(true)
    await act(async () => {})
    expect(screen.getByTestId('turnstile-started')).toBeInTheDocument()
  })

  it('is told the drawer has been opened by the page, not just that it is open now', () => {
    const page = read('app/christmas-parties/client-components.tsx')
    expect(page).toContain('securityCheckActive={drawerEverOpened}')
    expect(page).toMatch(/if \(drawerOpen\) setDrawerEverOpened\(true\)/)
  })
})

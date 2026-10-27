/**
 * BK-190: the Christmas enquiry button stayed disabled until the security check passed, so a check
 * that never loaded left a button nobody could press and sent nothing, silently. It now stays
 * pressable and says what is wrong, with the phone number, and the signal records it.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ChristmasFactsView, ChristmasMenuView, ChristmasSeasonView } from '@/app/christmas-parties/client-components'

// A security check that never produces a token.
jest.mock('@/components/security/TurnstileField', () => ({ TurnstileField: () => null }))

const FACTS: ChristmasFactsView = {
  minPartySize: 4,
  christmasDay: { date: '2026-12-25', drinksOnly: true, opensAt: '12:00', closesAt: '15:00' } as never,
  minNoticeHours: 24,
  depositPerPerson: 10,
  buffetMinimumGuests: 30,
  maxSeated: 60,
  maxStanding: 100,
  privateHireThreshold: 20
}
const SEASON: ChristmasSeasonView = {
  state: 'upcoming',
  windowLabel: '10 November to 20 December 2026',
  minEnquiryDate: '2026-11-10',
  maxEnquiryDate: '2026-12-20',
  isBookable: true,
  bookingClosed: false,
  showChristmasDayNotice: false
}
const MENU: ChristmasMenuView = { tiers: [], extraSections: [], hasLiveDishes: false, isUnavailable: false }

describe('Christmas enquiry with a security check that has not finished', () => {
  const previousKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  afterAll(() => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = previousKey
  })

  it('keeps the button pressable, sends nothing, and says what to do', async () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'site-key'
    const fetchMock = jest.fn((_url: string, _init?: RequestInit) => Promise.resolve(new Response('{}', { status: 200 })))
    ;(global as unknown as { fetch: unknown }).fetch = fetchMock
    Object.defineProperty(window.navigator, 'sendBeacon', { configurable: true, value: undefined })

    // Required here, after the key is set, because the form reads it when the module loads. Only
    // types are imported above, so this is the module's first load in this file.
    const { ChristmasPartiesPageClient: Page } = require('@/app/christmas-parties/client-components') as typeof import('@/app/christmas-parties/client-components')
    const { christmasPartiesSchema: schema } = require('@/lib/christmas-parties-schema') as typeof import('@/lib/christmas-parties-schema')
    render(<Page structuredData={schema} menu={MENU} season={SEASON} facts={FACTS} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Plan a Christmas party' })[0])
    await screen.findByRole('heading', { name: 'Send your Christmas enquiry' })

    fireEvent.change(screen.getByLabelText('Full name *'), { target: { value: 'Jo Bloggs' } })
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'jo@example.com' } })
    fireEvent.change(screen.getByLabelText('Mobile *'), { target: { value: '07700900123' } })
    fireEvent.change(screen.getByLabelText('Number of guests *'), { target: { value: '12' } })
    fireEvent.change(screen.getByLabelText('Preferred date *'), { target: { value: '2026-12-04' } })
    fireEvent.click(screen.getByLabelText(/happy for The Anchor to contact me/))

    const button = screen.getByRole('button', { name: 'Plan my Christmas party' })
    expect(button).toBeEnabled()
    fireEvent.click(button)

    expect(await screen.findByText(/The security check has not finished yet/)).toHaveTextContent('01753 682707')
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith('/api/enquiry/christmas/signal', expect.objectContaining({
        body: JSON.stringify({ stage: 'blocked', form: 'main', mode: 'party', reason: 'no_security_token' })
      }))
    )
    expect(fetchMock.mock.calls.some(([url]) => url === '/api/enquiry/christmas')).toBe(false)
  })
})

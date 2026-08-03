import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SeasonalPeriodQuestion } from '@/components/features/TableBooking/SeasonalPeriodQuestion'
import { useBookingPeriod } from '@/components/features/TableBooking/useBookingPeriod'
import type { BookingPeriod, BookingPeriodDeposit } from '@/lib/api/bookings'

/**
 * The seasonal flow's money and consent rules.
 *
 * These exist because the seasonal feature's one production defect was a second
 * implementation disagreeing with the first: a route quoted GBP 30 while the
 * create path charged GBP 0. Everything asserted here is about NOT having a
 * second opinion, and about not carrying an answer the guest did not give.
 */

function makePeriod(overrides: Partial<BookingPeriod> = {}): BookingPeriod {
  return {
    id: 'period-christmas',
    code: 'christmas',
    period_kind: 'seasonal',
    name: 'Christmas dinner',
    guest_question: 'Is this a Christmas dinner booking?',
    guest_blurb: null,
    starts_on: '2026-11-10',
    ends_on: '2026-12-20',
    requires_preorder: true,
    preorder_cutoff_days: 3,
    deposit_basis: 'per_person',
    deposit_amount: 10,
    refund_cutoff_days: 7,
    min_party_size: null,
    max_party_size: null,
    min_notice_hours: 24,
    bookable: true,
    not_bookable_reason: null,
    not_bookable_message: null,
    menu: [],
    ...overrides
  }
}

function makeDeposit(overrides: Partial<BookingPeriodDeposit> = {}): BookingPeriodDeposit {
  return {
    party_size: 4,
    collect: true,
    if_accepted: {
      required: true,
      amount: 40,
      rule: 'period',
      basis: 'per_person',
      rate: 10,
      reason: null,
      refund_cutoff_days: 7,
      refund_policy: 'Refundable up to 7 days before your booking.'
    },
    if_accepted_rejection: null,
    if_declined: {
      required: false,
      amount: 0,
      rule: null,
      basis: null,
      rate: null,
      reason: null,
      refund_cutoff_days: null,
      refund_policy: null
    },
    ...overrides
  }
}

describe('SeasonalPeriodQuestion', () => {
  it('offers "No thanks" as a real answer alongside "Yes please"', async () => {
    const onAnswer = jest.fn()
    render(
      <SeasonalPeriodQuestion
        period={makePeriod()}
        deposit={makeDeposit()}
        answer={null}
        onAnswer={onAnswer}
      />
    )

    expect(screen.getByText('Is this a Christmas dinner booking?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'No thanks' }))
    expect(onAnswer).toHaveBeenCalledWith(false)
  })

  it('shows the amount and the refund wording exactly as the server gave them', () => {
    render(
      <SeasonalPeriodQuestion
        period={makePeriod()}
        deposit={makeDeposit()}
        answer={true}
        onAnswer={jest.fn()}
      />
    )

    // £40 is the server's figure for a party of four. The component must print
    // it, never derive it from rate x party size.
    expect(screen.getByText(/A deposit of £40 is needed/)).toBeInTheDocument()
    expect(
      screen.getByText('Refundable up to 7 days before your booking.')
    ).toBeInTheDocument()
  })

  it('quotes no deposit when the kill switch is off, even though one is owed', () => {
    render(
      <SeasonalPeriodQuestion
        period={makePeriod()}
        deposit={makeDeposit({ collect: false })}
        answer={true}
        onAnswer={jest.fn()}
      />
    )

    expect(screen.queryByText(/A deposit of/)).not.toBeInTheDocument()
    expect(screen.getByText('No deposit is needed for this booking.')).toBeInTheDocument()
  })

  it('explains a live period that cannot be booked and offers no choice', () => {
    render(
      <SeasonalPeriodQuestion
        period={makePeriod({
          bookable: false,
          not_bookable_reason: 'menu_not_published',
          not_bookable_message: 'The Christmas menu is not published yet.'
        })}
        deposit={null}
        answer={null}
        onAnswer={jest.fn()}
      />
    )

    expect(screen.getByText('The Christmas menu is not published yet.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Yes please' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'No thanks' })).not.toBeInTheDocument()
  })
})

describe('useBookingPeriod', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.resetAllMocks()
  })

  function mockPeriodFetch(period: BookingPeriod | null) {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { date: '2026-12-12', period, deposit: period ? makeDeposit() : null }
          })
      })
    ) as unknown as typeof fetch
  }

  it('forgets an answer when the date moves to one the period does not cover', async () => {
    mockPeriodFetch(makePeriod())
    const { result, rerender } = renderHook(
      ({ date }: { date: string }) => useBookingPeriod(date, 4),
      { initialProps: { date: '2026-12-12' } }
    )

    await waitFor(() => expect(result.current.period).not.toBeNull())
    act(() => result.current.setAnswer(true))
    expect(result.current.answer).toBe(true)

    // The guest moves to a date with no period. The acceptance was given for
    // 12 December and means nothing here; carrying it would submit a booking
    // claiming a Christmas dinner the guest never asked for.
    mockPeriodFetch(null)
    rerender({ date: '2027-01-05' })

    await waitFor(() => expect(result.current.period).toBeNull())
    expect(result.current.answer).toBeNull()
  })

  it('reports no period rather than an error when the lookup fails', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('network'))) as unknown as typeof fetch

    const { result } = renderHook(() => useBookingPeriod('2026-12-12', 4))

    await waitFor(() => expect(result.current.loading).toBe(false))
    // A seasonal lookup that fails must never block an ordinary booking.
    expect(result.current.period).toBeNull()
    expect(result.current.deposit).toBeNull()
  })
})

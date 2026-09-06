import { getEventBookingCopy } from '@/lib/event-booking-copy'
import {
  getEventBookingHeroStatement,
  getEventBookingReassurance,
  getEventSeatAvailabilityLabel,
  getEventShortPaymentReassurance
} from '@/lib/event-booking-experience'
import { getEventPriceLabel } from '@/lib/event-pricing'

describe('getEventBookingCopy', () => {
  it('clarifies quiz table booking and cash entry', () => {
    const copy = getEventBookingCopy({
      name: 'Pub Quiz Night',
      category: { id: 'quiz', name: 'Quiz Nights', slug: 'quiz-night', color: '#000' },
      event_type: null,
      booking_mode: 'table',
      payment_mode: null,
      offers: { price: '3', priceCurrency: 'GBP', '@type': 'Offer', availability: '', validFrom: '' },
      isAccessibleForFree: false,
      is_free: false
    })

    expect(copy.label).toBe('Reserve a table, pay quiz entry on arrival')
    expect(copy.policy).toContain('pay £3 cash entry')
  })

  it('clarifies cash bingo books are bought on arrival', () => {
    const copy = getEventBookingCopy({
      name: 'Cash Bingo Night',
      event_type: null,
      booking_mode: 'table',
      payment_mode: null,
      offers: { price: '10', priceCurrency: 'GBP', '@type': 'Offer', availability: '', validFrom: '' },
      isAccessibleForFree: false,
      is_free: false
    } as any)

    expect(copy.label).toBe('Reserve a table, buy bingo book on arrival')
    expect(copy.policy).toContain('Buy your £10 bingo book on arrival')
  })

  it('front-loads cash-on-arrival reassurance for paid reservation events', () => {
    const event = {
      name: 'Music Bingo',
      startDate: '2026-05-08T20:00:00+01:00',
      payment_mode: 'cash_only',
      price_per_seat: 3
    }

    expect(getEventBookingReassurance(event)).toBe(
      'No payment now. Reserve seats online and pay £3 per person on arrival.'
    )
    expect(getEventShortPaymentReassurance(event)).toBe('No payment now, pay £3 on arrival')
    expect(getEventBookingHeroStatement(event)).toBe(
      'Reserve a table for Friday 8 May. No payment now, pay £3 on arrival.'
    )
  })

  it('handles free entry as a table-hold message', () => {
    expect(
      getEventBookingReassurance({
        name: 'Free Karaoke Night',
        is_free: true,
        offers: { price: '0' }
      })
    ).toBe('No payment needed. Reserve seats online so your table is held.')
  })

  it('does not call a positive-price event free when a free-access flag is also present', () => {
    expect(
      getEventBookingReassurance({
        name: 'Pub Quiz Night',
        isAccessibleForFree: true,
        offers: { price: '3' }
      })
    ).toBe('No payment now. Reserve seats online and pay £3 per person on arrival.')
  })

  it('handles prepaid events as payment-step copy', () => {
    expect(
      getEventBookingReassurance({
        name: 'Ticketed Supper Club',
        payment_mode: 'prepaid',
        price_per_seat: 20
      })
    ).toBe('Book online and complete any payment shown in the booking step.')
  })

  it('shows online ticket savings for prepaid events', () => {
    const event = {
      name: 'Ticketed Supper Club',
      payment_mode: 'prepaid',
      ticket_price: 10,
      price: 8,
      online_discount_type: 'fixed',
      online_discount_value: 2
    } as any

    const copy = getEventBookingCopy(event)

    expect(copy.label).toBe('Buy online and save £2')
    expect(copy.policy).toBe('Get your tickets now to save £2. Pay £8 online to secure your place.')
    expect(getEventBookingReassurance(event)).toBe('Get your tickets now to save £2. Pay £8 online.')
    expect(getEventPriceLabel(event)).toBe('Ticket £10 · online £8 (save £2)')
  })

  it('uses ticket-focused copy for communal seating events', () => {
    const event = {
      name: 'Cabaret Night',
      startDate: '2026-05-08T20:00:00+01:00',
      booking_mode: 'communal',
      payment_mode: 'cash_only',
      price_per_seat: 10,
      // Standing tickets genuinely on sale, which is what earns the
      // seated-or-standing label. Without this the copy must not offer a choice.
      seated_remaining: 0,
      standing_remaining: 12,
      offers: { price: '10', priceCurrency: 'GBP', '@type': 'Offer', availability: '', validFrom: '' }
    } as any

    const copy = getEventBookingCopy(event)

    expect(copy.label).toBe('Book standing tickets')
    expect(copy.policy).toContain('Seated places are full')
    expect(getEventBookingReassurance(event)).toBe('No payment now. Book online and pay £10 per person on arrival.')
    expect(getEventBookingHeroStatement(event)).toBe(
      'Book tickets for Friday 8 May. No payment now, pay £10 on arrival.'
    )
    expect(
      getEventSeatAvailabilityLabel({
        booking_mode: 'communal',
        total_remaining: 8,
        seated_remaining: 0,
        standing_remaining: 8
      })
    ).toBe('8 standing left')
  })

  // Regression guard for the case that is actually live on every hosted night at
  // The Anchor: booking_mode is communal but standing_remaining is 0, so there is
  // no seated-or-standing choice to offer. The copy used to promise one anyway,
  // and the booking form then rendered a greyed-out Standing option saying it was
  // unavailable.
  it('does not offer a standing choice on a communal event with no standing tickets', () => {
    const event = {
      name: 'Cabaret Night',
      startDate: '2026-05-08T20:00:00+01:00',
      booking_mode: 'communal',
      payment_mode: 'cash_only',
      price_per_seat: 10,
      standing_remaining: 0,
      offers: { price: '10', priceCurrency: 'GBP', '@type': 'Offer', availability: '', validFrom: '' }
    } as any

    const copy = getEventBookingCopy(event)

    expect(copy.label).toBe('Book your places')
    expect(copy.policy).not.toContain('standing')
  })

  it('treats a missing standing_remaining as no standing tickets', () => {
    const event = {
      name: 'Karaoke Night',
      startDate: '2026-09-18T20:00:00+01:00',
      booking_mode: 'communal',
      payment_mode: 'free',
      isAccessibleForFree: true,
      offers: { price: '0', priceCurrency: 'GBP', '@type': 'Offer', availability: '', validFrom: '' }
    } as any

    expect(getEventBookingCopy(event).label).toBe('Book your places')
    expect(getEventBookingReassurance(event)).toBe(
      'No payment needed. Book a free place for each person so we know how many seats to lay out.'
    )
  })

  it('surfaces sold-out availability clearly', () => {
    expect(getEventSeatAvailabilityLabel({ seats_remaining: 0, is_full: true })).toBe('Sold out')
  })
})

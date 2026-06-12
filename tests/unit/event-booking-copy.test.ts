import { getEventBookingCopy } from '@/lib/event-booking-copy'
import {
  getEventBookingHeroStatement,
  getEventBookingReassurance,
  getEventSeatAvailabilityLabel,
  getEventShortPaymentReassurance
} from '@/lib/event-booking-experience'

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
        name: 'Free Live Music',
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

  it('uses ticket-focused copy for communal seating events', () => {
    const event = {
      name: 'Cabaret Night',
      startDate: '2026-05-08T20:00:00+01:00',
      booking_mode: 'communal',
      payment_mode: 'cash_only',
      price_per_seat: 10,
      offers: { price: '10', priceCurrency: 'GBP', '@type': 'Offer', availability: '', validFrom: '' }
    } as any

    const copy = getEventBookingCopy(event)

    expect(copy.label).toBe('Book seated or standing tickets')
    expect(copy.policy).toContain('Choose seated tickets for communal table seating')
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

  it('surfaces sold-out availability clearly', () => {
    expect(getEventSeatAvailabilityLabel({ seats_remaining: 0, is_full: true })).toBe('Sold out')
  })
})

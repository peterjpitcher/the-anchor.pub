import { getEventBookingCopy } from '@/lib/event-booking-copy'

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
    expect(copy.policy).toContain('Pay £3 cash entry')
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
})

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

/**
 * docs/SSOT.md §10: Cash Bingo is "£10 per book (cash only)", and supervised
 * under-18s may attend but may not play. The event pages said "Book online and
 * pay £10 per person on arrival", which told a family of four, two of them
 * children, that they would owe £40.
 */
describe('Cash Bingo is priced by the book', () => {
  const cashBingo = {
    name: 'Autumn Jackpot Cash Bingo',
    startDate: '2026-09-30T19:00:00+01:00',
    booking_mode: 'communal',
    payment_mode: 'cash_only',
    ticket_price: 10,
    category: { id: 'cat-bingo', name: 'Cash Bingo', slug: 'bingo-night', color: '#000' }
  }

  it('says £10 a book, paid in cash on arrival, with nothing to pay now', () => {
    expect(getEventBookingReassurance(cashBingo)).toBe(
      'No payment now. Buy your bingo books when you arrive, £10 a book in cash.'
    )
    expect(getEventShortPaymentReassurance(cashBingo)).toBe('No payment now, £10 a book in cash on arrival')
    expect(getEventBookingHeroStatement(cashBingo)).toContain(
      'Wednesday 30 September. No payment now, £10 a book in cash on arrival.'
    )
  })

  it('never prices Cash Bingo per person, anywhere in the booking copy', () => {
    const copy = [
      getEventBookingReassurance(cashBingo),
      getEventShortPaymentReassurance(cashBingo),
      getEventBookingHeroStatement(cashBingo),
      getEventBookingCopy(cashBingo as any).policy
    ].join(' ')

    expect(copy).not.toMatch(/per person/i)
  })

  it('recognises a Cash Bingo night by the category its hub is built from', () => {
    // No "cash bingo" in the name: the category is the /cash-bingo hub's.
    const snowball = {
      ...cashBingo,
      name: 'Snowball Showdown',
      category: { id: 'cat-bingo', name: 'Bingo Night', slug: 'bingo-night', color: '#000' }
    }

    expect(getEventBookingReassurance(snowball)).toBe(
      'No payment now. Buy your bingo books when you arrive, £10 a book in cash.'
    )
  })

  it('still says what to bring when the record carries no price', () => {
    expect(getEventBookingReassurance({ ...cashBingo, ticket_price: null })).toBe(
      'No payment now. Buy your bingo books in cash when you arrive.'
    )
  })

  it('leaves Music Bingo priced per person, because that is how it is sold', () => {
    expect(
      getEventBookingReassurance({
        name: 'Screams & Soundtracks: Classic Horror Music Bingo',
        booking_mode: 'communal',
        payment_mode: 'cash_only',
        ticket_price: 5,
        category: { name: 'Music Bingo', slug: 'music-bingo' }
      })
    ).toBe('No payment now. Book online and pay £5 per person on arrival.')
  })
})

/**
 * Three of these strings contradicted docs/SSOT.md §10 and were live on desktop
 * event pages: Music Bingo "starts at 8pm" when the SSOT says 7pm and that
 * "anything still saying 8pm is wrong"; Cash Bingo and Quiz "arrive from 6pm"
 * when both say 6:30pm and the SSOT explicitly supersedes the 6pm line.
 *
 * Copy that states a time has to be pinned to the source of truth, because a
 * wrong arrival time sends somebody to a pub that is not ready for them, and
 * nothing about it fails loudly.
 */
describe('event booking copy states times that match the SSOT', () => {
  const bingo = { name: 'Cash Bingo', booking_mode: 'table' } as any
  const musicBingo = { name: 'Music Bingo', booking_mode: 'table' } as any
  const quiz = { name: 'Quiz Night', booking_mode: 'table' } as any

  it('cash bingo asks people in by 6:30pm, never from 6pm', () => {
    const prompt = getEventBookingCopy(bingo).foodPrompt
    expect(prompt).toContain('6:30pm')
    expect(prompt).not.toContain('6pm for food')
  })

  it('music bingo starts at 7pm, never 8pm', () => {
    const prompt = getEventBookingCopy(musicBingo).foodPrompt
    expect(prompt).toContain('7pm')
    expect(prompt).not.toContain('8pm')
  })

  it('quiz asks people in from 6:30pm, never from 6pm', () => {
    const prompt = getEventBookingCopy(quiz).foodPrompt
    expect(prompt).toContain('6:30pm')
    expect(prompt).not.toContain('from 6pm')
  })

  it('no booking copy anywhere states a retired time', () => {
    for (const event of [bingo, musicBingo, quiz]) {
      const copy = getEventBookingCopy(event)
      const all = `${copy.foodPrompt} ${copy.policy} ${copy.label}`
      expect(all).not.toMatch(/\b8pm\b/)
      expect(all).not.toMatch(/\b9:45pm\b/)
    }
  })
})

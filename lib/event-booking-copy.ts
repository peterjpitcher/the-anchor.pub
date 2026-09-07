import type { Event } from '@/lib/api'
import { formatEventBookingMoney, getEventBookingReassurance, getEventOnlineSavingText, getEventUnitPrice, hasStandingTickets } from '@/lib/event-booking-experience'

type EventBookingCopySource = Pick<
  Event,
  'name' | 'category' | 'event_type' | 'booking_mode' | 'payment_mode' | 'offers' | 'isAccessibleForFree' | 'is_free' | 'price' | 'ticket_price' | 'price_per_seat' | 'online_discount_type' | 'online_discount_value' | 'standing_remaining' | 'seated_remaining'
>

export type EventBookingCopy = {
  label: string
  policy: string
  foodPrompt: string
  suppressRawCancellationPolicy: boolean
}

function eventText(event: EventBookingCopySource): string {
  return [
    event.name,
    event.category?.name,
    event.event_type,
    event.booking_mode,
    event.payment_mode
  ]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ')
    .toLowerCase()
}

function hasPaidOnlineSignal(event: EventBookingCopySource): boolean {
  const text = eventText(event)
  return /online|prepay|pre-pay|ticket|payment_link/.test(text)
}

function hasFreeSignal(event: EventBookingCopySource): boolean {
  const rawPrice = event.offers?.price
  const numericPrice = typeof rawPrice === 'string' ? Number.parseFloat(rawPrice) : Number(rawPrice)
  const directPrices = [event.price, event.ticket_price, event.price_per_seat]
    .map((value) => (typeof value === 'string' ? Number(value) : value))
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))

  if ((Number.isFinite(numericPrice) && numericPrice > 0) || directPrices.some((value) => value > 0)) {
    return false
  }

  return event.isAccessibleForFree === true ||
    event.is_free === true ||
    (Number.isFinite(numericPrice) && numericPrice <= 0)
}

function isCommunalBooking(event: EventBookingCopySource): boolean {
  return typeof event.booking_mode === 'string' && event.booking_mode.trim().toLowerCase() === 'communal'
}

export function getEventBookingCopy(event: EventBookingCopySource): EventBookingCopy {
  const text = eventText(event)
  const unitPrice = getEventUnitPrice(event)
  const arrivalReassurance = getEventBookingReassurance(event)

  if (isCommunalBooking(event)) {
    const standingAvailable = hasStandingTickets(event)

    return {
      label: standingAvailable ? 'Book standing tickets' : 'Book your places',
      policy: standingAvailable
        ? `${arrivalReassurance} Seated places are full. These are standing tickets, with no table seat included.`
        : `${arrivalReassurance} Seating is communal, so book everyone in your group together and we will seat you together.`,
      foodPrompt: 'Food is available before most hosted events. Arrive early if your group wants to eat first.',
      suppressRawCancellationPolicy: false
    }
  }

  if (text.includes('cash bingo')) {
    return {
      label: 'Reserve a table, buy bingo book on arrival',
      policy: 'Reserve your table online. Buy your £10 bingo book on arrival. Players must be 18+.',
      // docs/SSOT.md: arrive by 6:30pm, first game 7pm. The older "arrive from
      // 6pm" line is explicitly superseded there, owner-confirmed 17 August 2026.
      foodPrompt: 'Arrive by 6:30pm for food before eyes down at 7pm.',
      suppressRawCancellationPolicy: true
    }
  }

  if (text.includes('music bingo')) {
    return {
      label: 'Reserve a table for Music Bingo',
      policy: `${arrivalReassurance} Booking holds your table for Music Bingo.`,
      // docs/SSOT.md: start corrected from 8pm to 7pm, owner-confirmed 16 August
      // 2026, and "anything still saying 8pm is wrong". This string was one of them.
      foodPrompt: 'Arrive from 6:30pm for food. Music Bingo starts at 7pm.',
      suppressRawCancellationPolicy: true
    }
  }

  if (text.includes('quiz')) {
    const entryPrice = unitPrice ? formatEventBookingMoney(unitPrice) : '£3'
    return {
      label: 'Reserve a table, pay quiz entry on arrival',
      policy: `No payment now. Reserve your table online and pay ${entryPrice} cash entry per person on arrival.`,
      // docs/SSOT.md: arrive from 6:30pm, start usually 7pm.
      foodPrompt: 'Arrive from 6:30pm for food. Quiz starts at 7pm.',
      suppressRawCancellationPolicy: true
    }
  }

  if (hasPaidOnlineSignal(event)) {
    const savingText = getEventOnlineSavingText(event)
    return {
      label: savingText ? `Buy online and save ${savingText}` : 'Buy ticket now',
      policy: savingText && unitPrice
        ? `Get your tickets now to save ${savingText}. Pay ${formatEventBookingMoney(unitPrice)} online to secure your place.`
        : 'Book online and complete any payment shown in the booking step to secure your place.',
      foodPrompt: 'Food is available before most hosted events. Arrive early if your group wants to eat first.',
      suppressRawCancellationPolicy: false
    }
  }

  if (hasFreeSignal(event)) {
    return {
      label: 'Free entry, reserve table',
      policy: 'No payment needed. Reserve seats online so your table is held. Food and drinks are paid for on the night.',
      foodPrompt: 'Food is available before most hosted events. Arrive early if your group wants to eat first.',
      suppressRawCancellationPolicy: true
    }
  }

  return {
    label: 'Reserve event table',
    policy: arrivalReassurance,
    foodPrompt: 'Food is available before most hosted events. Arrive early if your group wants to eat first.',
    suppressRawCancellationPolicy: true
  }
}

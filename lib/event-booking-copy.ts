import type { Event } from '@/lib/api'
import { formatEventBookingMoney, getEventBookingReassurance, getEventOnlineSavingText, getEventUnitPrice } from '@/lib/event-booking-experience'

type EventBookingCopySource = Pick<
  Event,
  'name' | 'category' | 'event_type' | 'booking_mode' | 'payment_mode' | 'offers' | 'isAccessibleForFree' | 'is_free' | 'price' | 'ticket_price' | 'price_per_seat' | 'online_discount_type' | 'online_discount_value'
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
    return {
      label: 'Book seated or standing tickets',
      policy: `${arrivalReassurance} Choose seated tickets for communal table seating or standing tickets if seats are full.`,
      foodPrompt: 'Food is available before most hosted events. Arrive early if your group wants to eat first.',
      suppressRawCancellationPolicy: false
    }
  }

  if (text.includes('cash bingo')) {
    return {
      label: 'Reserve a table, buy bingo book on arrival',
      policy: 'Reserve your table online. Buy your £10 bingo book on arrival. Players must be 18+.',
      foodPrompt: 'Arrive from 6pm for food before eyes down at 7pm.',
      suppressRawCancellationPolicy: true
    }
  }

  if (text.includes('music bingo')) {
    return {
      label: 'Reserve a table for Music Bingo',
      policy: `${arrivalReassurance} Booking holds your table for Music Bingo.`,
      foodPrompt: 'Arrive from 6:30pm for food. Music Bingo starts at 8pm.',
      suppressRawCancellationPolicy: true
    }
  }

  if (text.includes('quiz')) {
    const entryPrice = unitPrice ? formatEventBookingMoney(unitPrice) : '£3'
    return {
      label: 'Reserve a table, pay quiz entry on arrival',
      policy: `No payment now. Reserve your table online and pay ${entryPrice} cash entry per person on arrival.`,
      foodPrompt: 'Arrive from 6pm for food. Quiz starts at 7pm.',
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

import type { Event } from '@/lib/api'

type EventBookingCopySource = Pick<
  Event,
  'name' | 'category' | 'event_type' | 'booking_mode' | 'payment_mode' | 'offers' | 'isAccessibleForFree' | 'is_free'
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
  return /online|prepay|pre-pay|ticket|stripe|payment_link/.test(text)
}

function hasFreeSignal(event: EventBookingCopySource): boolean {
  const rawPrice = event.offers?.price
  const numericPrice = typeof rawPrice === 'string' ? Number.parseFloat(rawPrice) : Number(rawPrice)

  return event.isAccessibleForFree === true ||
    event.is_free === true ||
    (Number.isFinite(numericPrice) && numericPrice <= 0)
}

export function getEventBookingCopy(event: EventBookingCopySource): EventBookingCopy {
  const text = eventText(event)

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
      policy: 'Reserve your table online. Pay any event costs on the night unless the booking step asks for payment.',
      foodPrompt: 'Arrive from 6:30pm for food. Music Bingo starts at 8pm.',
      suppressRawCancellationPolicy: true
    }
  }

  if (text.includes('quiz')) {
    return {
      label: 'Reserve a table, pay quiz entry on arrival',
      policy: 'Reserve your table online. Pay £3 cash entry per person on the night.',
      foodPrompt: 'Arrive from 6pm for food. Quiz starts at 7pm.',
      suppressRawCancellationPolicy: true
    }
  }

  if (hasPaidOnlineSignal(event)) {
    return {
      label: 'Buy ticket now',
      policy: 'Book online and complete any payment shown in the booking step to secure your place.',
      foodPrompt: 'Food is available before most hosted events. Arrive early if your group wants to eat first.',
      suppressRawCancellationPolicy: false
    }
  }

  if (hasFreeSignal(event)) {
    return {
      label: 'Free entry, reserve table',
      policy: 'Reserve your table online. Food and drinks are paid for on the night.',
      foodPrompt: 'Food is available before most hosted events. Arrive early if your group wants to eat first.',
      suppressRawCancellationPolicy: true
    }
  }

  return {
    label: 'Reserve event table',
    policy: 'Reserve your table online. If an entry fee applies, pay on arrival unless the booking step asks for payment.',
    foodPrompt: 'Food is available before most hosted events. Arrive early if your group wants to eat first.',
    suppressRawCancellationPolicy: true
  }
}

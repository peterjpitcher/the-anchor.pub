import type { Event } from '@/lib/api'
import { getLowestTicketTypePrice, hasMultipleTicketPrices } from '@/lib/api'
import {
  formatEventBookingMoney,
  getEventOnlineSavingText,
  getEventTicketPrice,
  getEventUnitPrice,
  isFreeEvent,
} from '@/lib/event-booking-experience'

type EventPriceSource = Pick<
  Event,
  'name' | 'event_type' | 'booking_mode' | 'payment_mode' | 'offers' | 'price' | 'ticket_price' | 'price_per_seat' | 'online_discount_type' | 'online_discount_value' | 'ticketTypes' | 'ticket_types' | 'isAccessibleForFree' | 'is_free'
>

export function getEventPriceLabel(event: EventPriceSource): string | null {
  // Multiple ticket types with differing prices → "from £X" (lowest active type).
  if (hasMultipleTicketPrices(event)) {
    const lowest = getLowestTicketTypePrice(event)
    if (lowest !== null && lowest > 0) {
      return `from ${formatEventBookingMoney(lowest)}`
    }
    if (lowest === 0) {
      // A mixed basket that starts free still leads with the free option.
      return `from ${formatEventBookingMoney(0)}`
    }
  }

  // Free events say "Free", and must be answered before the price parse below.
  // getEventTicketPrice() returns null for a zero price just as it does for a
  // missing one, so a free night used to fall through to the caller's fallback
  // and render "Price: Check booking step" on an event that costs nothing.
  if (isFreeEvent(event)) return 'Free'

  const ticketPrice = getEventTicketPrice(event)
  if (ticketPrice === null || ticketPrice <= 0) return null

  const unitPrice = getEventUnitPrice(event)
  const savingText = getEventOnlineSavingText(event)

  if (savingText && unitPrice !== null && unitPrice < ticketPrice) {
    return `Ticket ${formatEventBookingMoney(ticketPrice)} · online ${formatEventBookingMoney(unitPrice)} (save ${savingText})`
  }

  return formatEventBookingMoney(ticketPrice)
}

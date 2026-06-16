import type { Event } from '@/lib/api'
import {
  formatEventBookingMoney,
  getEventOnlineSavingText,
  getEventTicketPrice,
  getEventUnitPrice,
} from '@/lib/event-booking-experience'

type EventPriceSource = Pick<
  Event,
  'name' | 'event_type' | 'booking_mode' | 'payment_mode' | 'offers' | 'price' | 'ticket_price' | 'price_per_seat' | 'online_discount_type' | 'online_discount_value'
>

export function getEventPriceLabel(event: EventPriceSource): string | null {
  const ticketPrice = getEventTicketPrice(event)
  if (ticketPrice === null || ticketPrice <= 0) return null

  const unitPrice = getEventUnitPrice(event)
  const savingText = getEventOnlineSavingText(event)

  if (savingText && unitPrice !== null && unitPrice < ticketPrice) {
    return `Ticket ${formatEventBookingMoney(ticketPrice)} · online ${formatEventBookingMoney(unitPrice)} (save ${savingText})`
  }

  return formatEventBookingMoney(ticketPrice)
}

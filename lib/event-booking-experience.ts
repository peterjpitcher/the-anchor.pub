import type { Event, EventTicketType } from '@/lib/api'
import { getEventTicketTypes, getLowestTicketTypePrice, hasMultipleTicketPrices } from '@/lib/api'
import { formatEventLocalDate, formatEventLocalTime } from '@/lib/event-calendar'

type OfferLike = {
  price?: string | number | null
  availability?: string | null
}

export type EventBookingPaymentSource = {
  name?: string | null
  event_type?: string | null
  booking_mode?: string | null
  payment_mode?: string | null
  price?: string | number | null
  ticket_price?: string | number | null
  price_per_seat?: string | number | null
  online_discount_type?: string | null
  online_discount_value?: string | number | null
  offers?: OfferLike | null
  isAccessibleForFree?: boolean | null
  is_free?: boolean | null
  ticketTypes?: EventTicketType[] | null
  ticket_types?: EventTicketType[] | null
}

type EventBookingAvailabilitySource = {
  booking_mode?: string | null
  seats_remaining?: number | null
  seated_remaining?: number | null
  standing_remaining?: number | null
  total_remaining?: number | null
  remainingAttendeeCapacity?: number | null
  is_full?: boolean | null
  offers?: OfferLike | null
}

function isCommunalBookingMode(mode: string | null | undefined): boolean {
  return typeof mode === 'string' && mode.trim().toLowerCase() === 'communal'
}

function parseRemaining(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : null
}

function parsePositiveMoney(value: unknown): number | null {
  const parsed = typeof value === 'string' ? Number(value) : value
  if (typeof parsed === 'number' && Number.isFinite(parsed) && parsed > 0) {
    return parsed
  }
  return null
}

function parseMoney(value: unknown): number | null {
  const parsed = typeof value === 'string' ? Number(value) : value
  if (typeof parsed === 'number' && Number.isFinite(parsed)) {
    return parsed
  }
  return null
}

function normalizeDiscountType(value: unknown): 'fixed' | 'percent' | null {
  return value === 'fixed' || value === 'percent' ? value : null
}

function eventPaymentText(event: EventBookingPaymentSource): string {
  return [
    event.name,
    event.event_type,
    event.booking_mode,
    event.payment_mode
  ]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ')
    .toLowerCase()
}

function hasFreeSignal(event: EventBookingPaymentSource): boolean {
  const offerPrice = parseMoney(event.offers?.price)
  const ticketPrice = parseMoney(event.ticket_price)
  const directPrice = parseMoney(event.price)
  const seatPrice = parseMoney(event.price_per_seat)
  const prices = [offerPrice, ticketPrice, directPrice, seatPrice].filter((value): value is number => value !== null)

  if (prices.some((value) => value > 0)) {
    return false
  }

  return event.isAccessibleForFree === true ||
    event.is_free === true ||
    offerPrice === 0 ||
    ticketPrice === 0 ||
    directPrice === 0 ||
    seatPrice === 0
}

function hasPaidOnlineSignal(event: EventBookingPaymentSource): boolean {
  const text = eventPaymentText(event)
  return /prepaid|pre-pay|online|payment_link|ticket/.test(text)
}

function hasOnlineDiscountSignal(event: EventBookingPaymentSource): boolean {
  const text = eventPaymentText(event)
  return event.payment_mode === 'prepaid' || /prepaid|pre-pay|online|payment_link/.test(text)
}

export function getEventUnitPrice(event: EventBookingPaymentSource): number | null {
  // Multi-type events: ticket-type prices are already the final (post-discount)
  // charge, so the discount must not be re-applied — return the lowest directly.
  if (hasMultipleTicketPrices(event)) {
    return getLowestTicketTypePrice(event)
  }

  const directPrice = parsePositiveMoney(event.price)
  if (directPrice !== null) return directPrice

  const ticketPrice = getEventTicketPrice(event)
  if (ticketPrice === null) return null

  return Math.max(0, Number((ticketPrice - getEventOnlineSaving(event)).toFixed(2)))
}

export function getEventTicketPrice(event: EventBookingPaymentSource): number | null {
  // Multi-type events price "from" the lowest active type (already post-discount).
  if (hasMultipleTicketPrices(event)) {
    return getLowestTicketTypePrice(event)
  }

  const candidates = [event.ticket_price, event.price_per_seat, event.offers?.price, event.price]
  for (const value of candidates) {
    const parsed = parsePositiveMoney(value)
    if (parsed !== null) return parsed
  }
  return null
}

export function getEventOnlineSaving(event: EventBookingPaymentSource): number {
  if (!hasOnlineDiscountSignal(event)) return 0

  const ticketPrice = getEventTicketPrice(event)
  if (!ticketPrice) return 0

  const discountType = normalizeDiscountType(event.online_discount_type)
  const rawDiscountValue = typeof event.online_discount_value === 'number'
    ? event.online_discount_value
    : Number(event.online_discount_value)

  if (!discountType || !Number.isFinite(rawDiscountValue) || rawDiscountValue <= 0) return 0

  const saving = discountType === 'percent'
    ? ticketPrice * (Math.min(rawDiscountValue, 100) / 100)
    : rawDiscountValue

  return Math.min(ticketPrice, Number(saving.toFixed(2)))
}

export function getEventOnlineSavingText(event: EventBookingPaymentSource): string | null {
  const saving = getEventOnlineSaving(event)
  if (saving <= 0) return null
  return formatEventBookingMoney(saving)
}

export function formatEventBookingMoney(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2
  })
    .format(value)
    .replace(/\u00A0/g, ' ')
}

export function getEventBookingReassurance(event: EventBookingPaymentSource): string {
  const unitPrice = getEventUnitPrice(event)
  const isCommunal = isCommunalBookingMode(event.booking_mode)

  if (hasFreeSignal(event)) {
    return isCommunal
      ? 'No payment needed. Book seated or standing places online.'
      : 'No payment needed. Reserve seats online so your table is held.'
  }

  if (hasPaidOnlineSignal(event)) {
    const savingText = getEventOnlineSavingText(event)
    if (unitPrice && savingText) {
      return `Get your tickets now to save ${savingText}. Pay ${formatEventBookingMoney(unitPrice)} online.`
    }
    return 'Book online and complete any payment shown in the booking step.'
  }

  if (event.payment_mode === 'cash_only' || unitPrice) {
    const priceText = unitPrice ? ` ${formatEventBookingMoney(unitPrice)} per person` : ''
    return isCommunal
      ? `No payment now. Book online and pay${priceText} on arrival.`
      : `No payment now. Reserve seats online and pay${priceText} on arrival.`
  }

  return isCommunal
    ? 'Book online now. If any payment is needed, the next step will explain it clearly.'
    : 'Reserve seats online now. If any payment is needed, the next step will explain it clearly.'
}

export function getEventShortPaymentReassurance(event: EventBookingPaymentSource): string {
  const unitPrice = getEventUnitPrice(event)
  const isCommunal = isCommunalBookingMode(event.booking_mode)

  if (hasFreeSignal(event)) {
    return isCommunal ? 'No payment needed' : 'No payment needed, booking holds your table'
  }

  if (hasPaidOnlineSignal(event)) {
    const savingText = getEventOnlineSavingText(event)
    if (savingText) return `Get tickets now to save ${savingText}`
    return 'Complete any required payment in the booking step'
  }

  if (event.payment_mode === 'cash_only' || unitPrice) {
    const priceText = unitPrice ? ` ${formatEventBookingMoney(unitPrice)}` : ''
    return `No payment now, pay${priceText} on arrival`
  }

  return isCommunal ? 'Booking secures your place' : 'Booking holds your table'
}

export function getEventBookingAnchorHref(event: Pick<Event, 'id'> & Partial<Pick<Event, 'slug'>>): string {
  const idOrSlug = (event.slug || event.id || '').trim()
  return `/events/${encodeURIComponent(idOrSlug)}#event-booking`
}

export function getEventBookingHeroStatement(
  event: Pick<Event, 'startDate'> & EventBookingPaymentSource
): string {
  const date = formatEventLocalDate(event.startDate, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
  const action = isCommunalBookingMode(event.booking_mode) ? 'Book tickets' : 'Reserve a table'
  return `${action} for ${date}. ${getEventShortPaymentReassurance(event)}.`
}

export function getEventSeatsRemaining(event: EventBookingAvailabilitySource): number | null {
  const candidates = isCommunalBookingMode(event.booking_mode)
    ? [event.total_remaining, event.seats_remaining, event.remainingAttendeeCapacity]
    : [event.seats_remaining, event.remainingAttendeeCapacity]
  for (const value of candidates) {
    const parsed = parseRemaining(value)
    if (parsed !== null) return parsed
  }
  return null
}

export function getEventSeatAvailabilityLabel(event: EventBookingAvailabilitySource): string | null {
  const seatsRemaining = getEventSeatsRemaining(event)
  const seatedRemaining = parseRemaining(event.seated_remaining)
  const standingRemaining = parseRemaining(event.standing_remaining)
  const schemaSoldOut = event.offers?.availability === 'https://schema.org/SoldOut'

  if (isCommunalBookingMode(event.booking_mode)) {
    if (
      event.is_full === true ||
      schemaSoldOut ||
      (seatedRemaining === 0 && standingRemaining === 0) ||
      (seatsRemaining === 0 && (seatedRemaining === null || seatedRemaining === 0) && (standingRemaining === null || standingRemaining === 0))
    ) {
      return 'Sold out'
    }

    if (seatedRemaining !== null && standingRemaining !== null) {
      if (seatedRemaining > 0 && standingRemaining > 0) {
        return `${seatedRemaining} seated, ${standingRemaining} standing left`
      }

      if (seatedRemaining > 0) {
        return `${seatedRemaining} seated left`
      }

      if (standingRemaining > 0) {
        return `${standingRemaining} standing left`
      }
    }

    if (seatedRemaining !== null && seatedRemaining > 0) return `${seatedRemaining} seated left`
    if (standingRemaining !== null && standingRemaining > 0) return `${standingRemaining} standing left`
  }

  const soldOut = event.is_full === true || seatsRemaining === 0 || schemaSoldOut
  if (soldOut) return 'Sold out'
  if (seatsRemaining === null) return null
  if (seatsRemaining <= 10) return `Only ${seatsRemaining} seat${seatsRemaining === 1 ? '' : 's'} left`
  return `${seatsRemaining} seats available`
}

export function getEventFoodArrivalLabel(
  event: Partial<Pick<Event, 'doorTime' | 'doors_time' | 'startDate'>>,
  fallback: string
): string {
  const doorTime = event.doorTime || event.doors_time
  if (doorTime) {
    const formatted = doorTime.includes('T')
      ? formatEventLocalTime(doorTime)
      : formatEventLocalTime(`2026-01-01T${doorTime}`)
    return `Arrive from ${formatted} for food`
  }

  return fallback
}

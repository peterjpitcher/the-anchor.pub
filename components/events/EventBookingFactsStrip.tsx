'use client'

import { CalendarDays, Car, Clock, PoundSterling, Utensils, Users, type LucideIcon } from 'lucide-react'
import type { Event } from '@/lib/api'
import { formatEventLocalDate } from '@/lib/event-calendar'
import { getEventPriceLabel } from '@/lib/event-pricing'
import {
  formatEventBookingMoney,
  getEventFoodArrivalLabel,
  getEventSeatAvailabilityLabel,
  getEventUnitPrice
} from '@/lib/event-booking-experience'

type Fact = {
  label: string
  value: string
  Icon: LucideIcon
}

type EventBookingFactsStripProps = {
  event: Event
  eventDate: string
  eventTime: string
  foodPrompt: string
}

function condenseArrivalLabel(value: string): string {
  const fromMatch = value.match(/arrive from\s+([^.\s]+)\s+for food/i)
  if (fromMatch?.[1]) {
    return `Food from ${fromMatch[1]}`
  }

  if (/food is available/i.test(value)) {
    return 'Food available before event'
  }

  return value
}

export function EventBookingFactsStrip({
  event,
  eventDate,
  eventTime,
  foodPrompt
}: EventBookingFactsStripProps) {
  const compactDate = formatEventLocalDate(event.startDate, {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
  const unitPrice = getEventUnitPrice(event)
  const priceLabel = unitPrice ? formatEventBookingMoney(unitPrice) : getEventPriceLabel(event) || 'Check booking step'
  const seatLabel = getEventSeatAvailabilityLabel(event) || 'Book early for best tables'
  const arrivalLabel = condenseArrivalLabel(getEventFoodArrivalLabel(event, foodPrompt))

  const facts: Fact[] = [
    { label: 'Date', value: compactDate || eventDate, Icon: CalendarDays },
    { label: 'Price', value: priceLabel, Icon: PoundSterling },
    { label: 'Start', value: eventTime, Icon: Clock },
    { label: 'Arrival', value: arrivalLabel, Icon: Utensils },
    { label: 'Seats', value: seatLabel, Icon: Users },
    { label: 'Parking', value: 'Free parking, 20 spaces', Icon: Car }
  ]

  return (
    <div className="border-y border-anchor-gold-dark/15 bg-anchor-green-raised">
      <div className="flex gap-px overflow-x-auto bg-anchor-gold-dark/10 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
        {facts.map(({ label, value, Icon }) => (
          <div key={label} className="flex min-h-[64px] min-w-[126px] items-start gap-2.5 bg-anchor-green-raised p-3 sm:min-h-[78px] sm:min-w-0 md:gap-3 md:p-4">
            <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-anchor-gold-dark md:h-5 md:w-5" aria-hidden />
            <div className="min-w-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-anchor-gold-bright md:text-xs">{label}</p>
              <p className="mt-1 text-sm font-medium leading-snug text-anchor-cream-text">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

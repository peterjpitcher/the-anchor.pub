'use client'

import { CalendarDays, Car, Clock, PoundSterling, type LucideIcon } from 'lucide-react'
import type { Event } from '@/lib/api'
import type { EventFactsVariant } from '@/lib/event-presentation'
import { formatEventLocalDate } from '@/lib/event-calendar'
import { getEventPriceLabel } from '@/lib/event-pricing'

type Fact = {
  label: string
  value: string
  Icon: LucideIcon
}

type EventBookingFactsStripProps = {
  event: Event
  eventDate: string
  eventTime: string
  /** 'historic' switches the labels to past tense for an event that has been and gone. */
  variant?: EventFactsVariant
}

export function EventBookingFactsStrip({
  event,
  eventDate,
  eventTime,
  variant = 'live'
}: EventBookingFactsStripProps) {
  const isHistoric = variant === 'historic'
  const compactDate = formatEventLocalDate(event.startDate, {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
  const priceLabel =
    getEventPriceLabel(event) || (isHistoric ? 'See event details' : 'Check booking step')

  const facts: Fact[] = [
    { label: isHistoric ? 'Took place' : 'Date', value: compactDate || eventDate, Icon: CalendarDays },
    { label: isHistoric ? 'Entry was' : 'Price', value: priceLabel, Icon: PoundSterling },
    { label: isHistoric ? 'Started' : 'Start', value: eventTime, Icon: Clock },
    { label: 'Parking', value: 'Free parking, 20 spaces', Icon: Car }
  ]

  return (
    <div className="border-y border-line bg-surface">
      <div className="flex gap-px overflow-x-auto bg-line sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
        {facts.map(({ label, value, Icon }) => (
          <div key={label} className="flex min-h-[64px] min-w-[126px] items-start gap-2.5 bg-surface p-3 sm:min-h-[78px] sm:min-w-0 md:gap-3 md:p-4">
            <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-text md:h-5 md:w-5" aria-hidden />
            <div className="min-w-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-accent-text md:text-xs">{label}</p>
              <p className="mt-1 text-sm font-medium leading-snug text-ink">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import type { MouseEvent, ReactElement, ReactNode } from 'react'
import { trackAddToCalendarClick } from '@/lib/gtm-events'

/** The two diary destinations, keyed by the `data-calendar-action` each link carries. */
const CALENDAR_TYPES = {
  google_calendar_open: 'google_calendar',
  ics_file_download: 'ics_file'
} as const

export interface AddToCalendarTrackerProps {
  eventId: string
  eventName: string
  eventDate?: string
  /** Where the control is mounted, e.g. `event_page_booking_actions`. */
  source: string
  ariaLabel: string
  className?: string
  children: ReactNode
}

/**
 * The add-to-calendar group, reporting which diary a guest chose.
 *
 * `AddToCalendar` renders in server trees (the event page, the hub date cards)
 * as well as inside the booking confirmation, and a server component cannot
 * hand a click handler to a link. So the links stay exactly as they were and
 * this wrapper listens for clicks bubbling up from them, reading the action
 * from the `data-calendar-action` attribute each one already carries. A click
 * from the keyboard arrives as the same click event, so it is counted too.
 */
export function AddToCalendarTracker({
  eventId,
  eventName,
  eventDate,
  source,
  ariaLabel,
  className,
  children
}: AddToCalendarTrackerProps): ReactElement {
  function handleClick(clickEvent: MouseEvent<HTMLDivElement>): void {
    const target = clickEvent.target
    if (!(target instanceof Element)) return

    const link = target.closest('[data-calendar-action]')
    if (!link || !clickEvent.currentTarget.contains(link)) return

    const action = link.getAttribute('data-calendar-action')
    if (action !== 'google_calendar_open' && action !== 'ics_file_download') return

    trackAddToCalendarClick(source, {
      eventId,
      eventName,
      eventDate,
      calendarType: CALENDAR_TYPES[action]
    })
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      data-calendar-source={source}
      className={className}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}

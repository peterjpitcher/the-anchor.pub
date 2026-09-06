import type { ReactElement } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Event } from '@/lib/api'
import { Button } from '@/components/ui'
import { buildGoogleCalendarUrl } from '@/lib/event-calendar'
import { getEventPresentation } from '@/lib/event-presentation'
import { cn } from '@/lib/utils'

/**
 * Add-to-calendar for a single event: a Google Calendar link and an .ics
 * download for everything else.
 *
 * Presentational and prop-driven, with no data fetching and no `'use client'`,
 * so it renders in a server tree (the event page, category date cards) and
 * inside a client tree (the booking confirmation state) alike.
 *
 * It gates itself on `getEventPresentation().showAddToCalendar` rather than
 * trusting the caller, so a cancelled, postponed or ended event cannot reach
 * the control by being mounted in the wrong place.
 */

const addToCalendarVariants = cva('flex flex-wrap gap-2 sm:gap-3', {
  variants: {
    layout: {
      /** One row, for a page band or a card footer. */
      inline: 'flex-row items-center justify-start',
      /** Full-width buttons on a phone, one row from `sm` up. */
      stacked: 'flex-col items-stretch justify-start sm:flex-row sm:items-center'
    }
  },
  defaultVariants: {
    layout: 'inline'
  }
})

export interface AddToCalendarProps extends VariantProps<typeof addToCalendarVariants> {
  event: Event
  /** Where the control is mounted, e.g. `event_detail`. Read by GTM click triggers. */
  source: string
  className?: string
  size?: 'sm' | 'md'
  /** Visible lead-in text. Pass null to show the buttons on their own. */
  label?: string | null
}

export function AddToCalendar({
  event,
  source,
  className,
  size = 'sm',
  layout,
  label = 'Add to calendar'
}: AddToCalendarProps): ReactElement | null {
  const { showAddToCalendar } = getEventPresentation(event)
  if (!showAddToCalendar) return null

  // The .ics route resolves either a slug or an id, and prefers the slug so the
  // downloaded filename matches the public URL.
  const segment = `${event.slug ?? ''}`.trim() || `${event.id ?? ''}`.trim()
  const googleUrl = buildGoogleCalendarUrl(event)

  // No usable start date means neither destination can be trusted, so offer nothing.
  if (!segment || !googleUrl) return null

  const icsUrl = `/api/calendar/event/${encodeURIComponent(segment)}`

  return (
    <div
      role="group"
      aria-label={`Add ${event.name} to your calendar`}
      data-calendar-source={source}
      className={cn(addToCalendarVariants({ layout }), className)}
    >
      {label ? <span className="text-sm text-ink-muted">{label}</span> : null}

      <Button asChild variant="outline" size={size}>
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-calendar-action="google_calendar_open"
          aria-label={`Add ${event.name} to Google Calendar`}
        >
          Google Calendar
        </a>
      </Button>

      <Button asChild variant="outline" size={size}>
        <a
          href={icsUrl}
          download
          data-calendar-action="ics_file_download"
          aria-label={`Download a calendar file for ${event.name}, for Apple or Outlook`}
        >
          Apple or Outlook
        </a>
      </Button>
    </div>
  )
}

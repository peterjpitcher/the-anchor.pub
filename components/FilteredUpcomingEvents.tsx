import { getUpcomingEvents, getBusinessHours, type BusinessHours, type Event } from '@/lib/api'
import { FilteredUpcomingEventsClient } from './FilteredUpcomingEventsClient'
import { EventSchema } from '@/components/seo/EventSchema'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getEventDateRangeUtc } from '@/lib/event-calendar'
import { dedupeUpcomingEvents } from '@/lib/event-normalization'
import type { DisplayEvent } from '@/types/display-event'

interface FilteredUpcomingEventsProps {
  events?: Event[]
}

export async function FilteredUpcomingEvents({ events: prefetchedEvents }: FilteredUpcomingEventsProps = {}) {
  try {
    // Fetch events and business hours in parallel
    const [events, businessHours] = await Promise.all([
      prefetchedEvents ? Promise.resolve(prefetchedEvents) : getUpcomingEvents(24),
      getBusinessHours()
    ])

    const timeChangeEvents = mapSpecialHoursToEvents(businessHours)

    const uniqueHostedEvents = dedupeUpcomingEvents(events)

    // Merge venue notices and hosted events, then sort chronologically.
    const mergedEvents: DisplayEvent[] = [...uniqueHostedEvents, ...timeChangeEvents].sort((a, b) => {
      return getEventDateRangeUtc(a).start.getTime() - getEventDateRangeUtc(b).start.getTime()
    })

    return (
      <>
        {mergedEvents.map(event => (
          !event.isTimeChange && <EventSchema key={`event-schema-${event.id}`} event={event} />
        ))}
        <FilteredUpcomingEventsClient events={mergedEvents} />
      </>
    )
  } catch (error) {
    // Error: Failed to load upcoming events

    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
        <p className="text-red-400 mb-2">Unable to load upcoming events at the moment.</p>
        <p className="text-anchor-cream-text/55">Please try again later or contact us at 01753 682707.</p>
      </div>
    )
  }
}

export function mapSpecialHoursToEvents(businessHours: BusinessHours | null): DisplayEvent[] {
  if (!businessHours?.specialHours?.length) return []

  const now = new Date()
  const specials = [...businessHours.specialHours].sort((a, b) => a.date.localeCompare(b.date))
  const upcomingSpecials = specials.filter(special => {
    const specialDateEnd = new Date(`${special.date}T23:59:59Z`)
    return specialDateEnd >= now
  })

  // Group consecutive days with same details
  const grouped: any[] = []

  upcomingSpecials.forEach((special) => {
    const lastGroup = grouped[grouped.length - 1]

    // Check if this special hour matches the last one
    const isConsecutive = lastGroup && (() => {
      const lastDate = new Date(lastGroup.endDate)
      const thisDate = new Date(special.date)
      const diffTime = Math.abs(thisDate.getTime() - lastDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return diffDays === 1 && // Must be next day
        lastGroup.status === special.status &&
        lastGroup.is_closed === special.is_closed &&
        lastGroup.opens === special.opens &&
        lastGroup.closes === special.closes &&
        lastGroup.note === special.note &&
        lastGroup.reason === special.reason
    })()

    if (isConsecutive) {
      // Extend the last group
      lastGroup.endDate = special.date
    } else {
      // Start new group
      grouped.push({
        ...special,
        endDate: special.date,
        startDate: special.date
      })
    }
  })

  return grouped
    .map(special => {
      const { startDate: firstDate, endDate: lastDate, opens, closes, status, note, reason, is_closed, kitchen, is_kitchen_closed, schedule_config } = special
      const statusLabel = status || (is_closed ? 'closed' : 'modified')
      const openTime = formatTimeString(opens)
      const closeTime = formatTimeString(closes)
      const kitchenOpens = kitchen?.opens ? formatTimeString(kitchen.opens) : null
      const kitchenCloses = kitchen?.closes ? formatTimeString(kitchen.closes) : null
      const hasSundayLunch = Array.isArray(schedule_config) && schedule_config.some((s: any) => s.booking_type === 'sunday_lunch' || s.slot_type === 'sunday_lunch')
      const startDateStr = `${firstDate}T${openTime || '00:00'}:00Z`

      const name = `Special Opening Hours – ${formatSpecialDate(firstDate, lastDate)}`

      const description =
        note ||
        reason ||
        (statusLabel === 'closed'
          ? 'We are closed on these dates. Please call us if you need assistance.'
          : `Opening hours have changed. We are open ${openTime || 'TBC'} - ${closeTime || 'TBC'}.`)

      return {
        '@type': 'Event',
        id: `time-change-${firstDate}`,
        slug: `opening-hours-${firstDate}`,
        name,
        description,
        shortDescription: description,
        startDate: startDateStr,
        endDate: startDateStr, // Schema technically usually wants single dates, but for display this serves our ID purpose
        doorTime: null,
        duration: null,
        about: null,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: 'The Anchor, Stanwell Moor',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Horton Road',
            addressLocality: 'Stanwell Moor',
            addressRegion: 'Surrey',
            postalCode: 'TW19 6AQ',
            addressCountry: 'GB'
          }
        },
        performer: undefined,
        offers: {
          '@type': 'Offer',
          price: '0.00',
          priceCurrency: 'GBP',
          availability: 'https://schema.org/InStock',
          validFrom: new Date().toISOString(),
          url: 'https://www.the-anchor.pub/book-table'
        },
        image: [DEFAULT_EVENT_IMAGE],
        video: [],
        heroImageUrl: DEFAULT_EVENT_IMAGE,
        thumbnailImageUrl: DEFAULT_EVENT_IMAGE,
        posterImageUrl: DEFAULT_EVENT_IMAGE,
        galleryImages: [],
        promoVideoUrl: null,
        highlightVideos: [],
        organizer: {
          '@type': 'Organization',
          name: 'The Anchor'
        },
        isAccessibleForFree: true,
        remainingAttendeeCapacity: undefined,
        maximumAttendeeCapacity: undefined,
        url: `https://www.the-anchor.pub/whats-on`,
        identifier: `time-change-${firstDate}`,
        metaTitle: null,
        metaDescription: description,
        category: {
          id: 'time-changes',
          name: 'Opening Hours Update',
          slug: 'time-changes',
          color: '#f97316',
          icon: ''
        },
        booking_rules: undefined,
        custom_messages: undefined,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://www.the-anchor.pub/whats-on`
        },
        potentialAction: undefined,
        faq: [],
        faqPage: undefined,
        isTimeChange: true,
        timeChangeNote: note || reason || null,
        timeChangeStatus: statusLabel,
        timeChangeOpens: openTime,
        timeChangeCloses: closeTime,
        timeChangeDate: firstDate,
        timeChangeRangeEnd: lastDate,
        timeChangeKitchenOpens: kitchenOpens,
        timeChangeKitchenCloses: kitchenCloses,
        timeChangeIsKitchenClosed: is_kitchen_closed === true || kitchen === null,
        timeChangeHasSundayLunch: hasSundayLunch
      } as DisplayEvent
    })
    .sort((a, b) => getEventDateRangeUtc(a).start.getTime() - getEventDateRangeUtc(b).start.getTime())
}

function formatSpecialDate(start: string, end: string): string {
  const startDate = new Date(`${start}T00:00:00Z`)
  const endDate = new Date(`${end}T00:00:00Z`)

  const sameDay = start === end
  if (sameDay) {
    return startDate.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const endLabel = endDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  return `${startDate.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })} – ${endLabel}`
}

function formatTimeString(value?: string | null): string | null {
  if (!value) return null
  const parts = value.split(':')
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10)
    const period = h >= 12 ? 'pm' : 'am'
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h
    return m === 0 ? `${display}${period}` : `${display}:${m.toString().padStart(2, '0')}${period}`
  }
  return value
}

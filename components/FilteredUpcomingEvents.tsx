import { getUpcomingEvents, getEventCategories, getBusinessHours, type BusinessHours } from '@/lib/api'
import { FilteredUpcomingEventsClient } from './FilteredUpcomingEventsClient'
import { EventSchema } from '@/components/EventSchema'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import type { DisplayEvent } from '@/types/display-event'

interface FilteredUpcomingEventsProps {
  categorySlug?: string | null
}

export async function FilteredUpcomingEvents({ categorySlug }: FilteredUpcomingEventsProps) {
  try {
    // Fetch events and categories in parallel
    const [events, categories, businessHours] = await Promise.all([
      getUpcomingEvents(24), // API limits event listings to 24 per request
      getEventCategories(),
      getBusinessHours()
    ])

    const timeChangeEvents = mapSpecialHoursToEvents(businessHours)

    // Filter by category if specified (time-change notices always show)
    let filteredEvents: DisplayEvent[] = events
    if (categorySlug) {
      const category = categories.find(cat => cat.slug === categorySlug)
      if (category) {
        filteredEvents = events.filter(event => event.category?.id === category.id)
      }
    }

    // Merge time changes and sort chronologically
    const mergedEvents: DisplayEvent[] = [...filteredEvents, ...timeChangeEvents].sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    })
    
    return (
      <>
        {mergedEvents.map(event => (
          !event.isTimeChange && <EventSchema key={`event-schema-${event.id}`} event={event} />
        ))}
        <FilteredUpcomingEventsClient events={mergedEvents} categorySlug={categorySlug} />
      </>
    )
  } catch (error) {
    // Error: Failed to load upcoming events
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 mb-2">Unable to load upcoming events at the moment.</p>
        <p className="text-gray-600">Please try again later or contact us at 01753 682707.</p>
      </div>
    )
  }
}

export function mapSpecialHoursToEvents(businessHours: BusinessHours | null): DisplayEvent[] {
  if (!businessHours?.specialHours?.length) return []

  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() + 30)

  const specials = [...businessHours.specialHours].sort((a, b) => a.date.localeCompare(b.date))
  const withinNextMonth = specials.filter(special => {
    const specialDateEnd = new Date(`${special.date}T23:59:59Z`)
    return specialDateEnd >= now && specialDateEnd <= cutoff
  })

  return withinNextMonth
    .map(special => {
      const { date: start, opens, closes, status, note, reason, is_closed } = special as any
      const statusLabel = status || (is_closed ? 'closed' : 'modified')
      const openTime = formatTimeString(opens)
      const closeTime = formatTimeString(closes)
      const startDate = `${start}T${openTime || '00:00'}:00Z`

      const name = `Special Opening Hours – ${formatSpecialDate(start, start)}`

      const description =
        note ||
        reason ||
        (statusLabel === 'closed'
          ? 'We are closed on this date. Please call us if you need assistance.'
          : `Opening hours have changed. We are open ${openTime || 'TBC'} - ${closeTime || 'TBC'}.`)

      return {
        '@type': 'Event',
        id: `time-change-${start}`,
        slug: `opening-hours-${start}`,
        name,
        description,
        shortDescription: description,
        startDate,
        endDate: startDate,
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
        identifier: `time-change-${start}`,
        metaTitle: null,
        metaDescription: description,
        category: {
          id: 'time-changes',
          name: 'Opening Hours Update',
          slug: 'time-changes',
          color: '#f97316',
          icon: '⏰'
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
        timeChangeDate: start,
        timeChangeRangeEnd: start
      } as DisplayEvent
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
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
    const [hours, minutes] = parts
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
  }
  return value
}

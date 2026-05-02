'use client'

import type { Event } from '@/lib/api'
import { trackEventBookClick } from '@/lib/gtm-events'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { getEventBookingCopy } from '@/lib/event-booking-copy'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  buildMothersDayBookingUrl,
  isMothersDayEvent,
  MOTHERS_DAY_BOOKING_CTA_LABEL
} from '@/lib/mothers-day-booking'
import { CATEGORY_ROUTES } from '@/lib/event-seo-strategy'

const CATEGORY_PAGE_PATHS = new Set(Object.values(CATEGORY_ROUTES))

type EventBookingButtonProps = {
  event: Event
  className?: string
  fullWidth?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'warning'
  label?: string
  unavailableLabel?: string
  customHref?: string
  source?: string
  onClick?: () => void
}

function getEventPrice(event: Event): number | undefined {
  const value = event.offers?.price
  if (value === undefined) return undefined
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function normalizeBookingUrl(rawUrl: string | null | undefined, event: Event): string | null {
  const trimmed = typeof rawUrl === 'string' ? rawUrl.trim() : ''
  if (!trimmed) return null
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://www.the-anchor.pub'

  try {
    const parsed = new URL(trimmed, base)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }

    const normalisedPath = parsed.pathname.replace(/\/+$/, '')

    const eventUrl = getEventWebsiteUrl(event, { absolute: true })
    const eventUrlParsed = new URL(eventUrl)
    if (parsed.origin === eventUrlParsed.origin && normalisedPath === eventUrlParsed.pathname.replace(/\/+$/, '')) {
      return null
    }

    // Reject same-origin URLs that point to SEO category pages (e.g. /quiz-night,
    // /cash-bingo). These are not booking destinations, the event detail page is.
    const sameOrigin = parsed.origin === eventUrlParsed.origin
    if (sameOrigin && CATEGORY_PAGE_PATHS.has(normalisedPath)) {
      return null
    }

    const apiEventUrl =
      typeof event.url === 'string' && event.url.trim().length > 0
        ? event.url.trim()
        : null

    if (apiEventUrl) {
      try {
        const apiEventUrlParsed = new URL(apiEventUrl, base)
        if (
          apiEventUrlParsed.protocol === 'http:' ||
          apiEventUrlParsed.protocol === 'https:'
        ) {
          const apiNormalisedPath = apiEventUrlParsed.pathname.replace(/\/+$/, '')
          if (
            parsed.origin === apiEventUrlParsed.origin &&
            normalisedPath === apiNormalisedPath &&
            parsed.search === apiEventUrlParsed.search
          ) {
            return null
          }
        }
      } catch {
        // ignore malformed apiEventUrl and fall back to treating offerUrl as external
      }
    }

    return trimmed
  } catch {
    return null
  }
}

function buildInternalEventBookingUrl(event: Event): string | null {
  const idOrSlug = (event.slug || event.id || '').trim()
  if (!idOrSlug) return null
  return `/events/${encodeURIComponent(idOrSlug)}`
}

function resolveBookingUrl(event: Event): string | null {
  if (isMothersDayEvent(event)) {
    return buildMothersDayBookingUrl()
  }

  const explicitBookingUrl = normalizeBookingUrl(event.bookingUrl, event)
  if (explicitBookingUrl) {
    return explicitBookingUrl
  }

  const offerUrl = normalizeBookingUrl(event.offers?.url, event)
  if (offerUrl) {
    return offerUrl
  }

  return buildInternalEventBookingUrl(event)
}

export function EventBookingButton({
  event,
  className,
  fullWidth = true,
  size = 'lg',
  variant = 'primary',
  label,
  unavailableLabel = 'Booking options available closer to the event',
  customHref,
  source,
  onClick
}: EventBookingButtonProps) {
  // Events with bookings disabled show a static "No booking required" button
  if (event.bookings_enabled === false) {
    return (
      <Button
        className={cn('min-w-0 max-w-full whitespace-normal break-words', className)}
        disabled
        fullWidth={fullWidth}
        size={size}
        variant="secondary"
      >
        No booking required
      </Button>
    )
  }

  const bookingUrl = customHref || resolveBookingUrl(event)
  const isExternalBooking = bookingUrl ? /^https?:\/\//i.test(bookingUrl) : false
  const resolvedLabel = label || (isMothersDayEvent(event) ? MOTHERS_DAY_BOOKING_CTA_LABEL : getEventBookingCopy(event).label)

  if (!bookingUrl) {
    return (
      <Button
        className={cn('min-w-0 max-w-full whitespace-normal break-words', className)}
        disabled
        fullWidth={fullWidth}
        size={size}
        variant="secondary"
      >
        {unavailableLabel}
      </Button>
    )
  }

  return (
    <Button
      asChild
      className={cn('min-w-0 max-w-full whitespace-normal break-words', className)}
      fullWidth={fullWidth}
      size={size}
      variant={variant}
    >
      <a
        href={bookingUrl}
        target={isExternalBooking ? '_blank' : undefined}
        rel={isExternalBooking ? 'noopener noreferrer' : undefined}
        onClick={(clickEvent) => {
          clickEvent.stopPropagation()
          onClick?.()
          trackEventBookClick({
            eventId: event.id,
            eventName: event.name,
            eventDate: event.startDate,
            eventPrice: getEventPrice(event),
            source,
            ctaLabel: resolvedLabel
          })
        }}
        aria-label={`${resolvedLabel} for ${event.name}${source ? ` (${source})` : ''}`}
      >
        {resolvedLabel}
      </a>
    </Button>
  )
}

'use client'

import type { Event } from '@/lib/api'
import { trackEventBookingStart } from '@/lib/gtm-events'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  buildMothersDayBookingUrl,
  isMothersDayEvent,
  MOTHERS_DAY_BOOKING_CTA_LABEL
} from '@/lib/mothers-day-booking'

type EventBookingButtonProps = {
  event: Event
  className?: string
  fullWidth?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'warning'
  label?: string
  unavailableLabel?: string
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
  source,
  onClick
}: EventBookingButtonProps) {
  const bookingUrl = resolveBookingUrl(event)
  const isExternalBooking = bookingUrl ? /^https?:\/\//i.test(bookingUrl) : false
  const resolvedLabel = label || (isMothersDayEvent(event) ? MOTHERS_DAY_BOOKING_CTA_LABEL : 'Book Now')

  if (!bookingUrl) {
    return (
      <Button
        className={cn('whitespace-normal break-words', className)}
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
      className={className}
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
          trackEventBookingStart({
            eventId: event.id,
            eventName: event.name,
            eventPrice: getEventPrice(event)
          })
        }}
        aria-label={`${resolvedLabel} for ${event.name}${source ? ` (${source})` : ''}`}
      >
        {resolvedLabel}
      </a>
    </Button>
  )
}

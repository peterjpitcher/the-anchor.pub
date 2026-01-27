'use client'

import type { Event } from '@/lib/api'
import { DateTime } from 'luxon'
import { trackEventBookingStart } from '@/lib/gtm-events'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

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

const OPEN_TABLE_BASE_URL = 'http://www.opentable.com/restaurant/profile/443973/reserve'
const OPEN_TABLE_RESTREF = '443973'
const EVENT_TIME_ZONE = 'Europe/London'
const EVENT_BOOKING_OFFSET_MINUTES = 30

function getEventPrice(event: Event): number | undefined {
  const value = event.offers?.price
  if (value === undefined) return undefined
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function stripTimeZoneOffset(value: string): string {
  if (!value) return value
  if (value.includes('+') || value.includes('Z')) {
    return value.split('+')[0].split('Z')[0]
  }
  if (value.includes('-') && value.lastIndexOf('-') > 10) {
    return value.substring(0, value.lastIndexOf('-'))
  }
  return value
}

function parseEventDateTime(value?: string | null): DateTime | null {
  if (!value) return null
  const cleaned = stripTimeZoneOffset(value.trim())
  if (!cleaned) return null
  const parsed = DateTime.fromISO(cleaned, { zone: EVENT_TIME_ZONE })
  return parsed.isValid ? parsed : null
}

function buildOpenTableUrl(bookingTime: DateTime): string {
  const formatted = bookingTime.toFormat("yyyy-MM-dd'T'HH:mm")
  return `${OPEN_TABLE_BASE_URL}?restref=${OPEN_TABLE_RESTREF}&datetime=${formatted}&covers=2&searchdatetime=${formatted}&partysize=2`
}

function resolveBookingUrl(event: Event): string | null {
  const eventDateTime = parseEventDateTime(event.startDate)
  if (eventDateTime) {
    const bookingDateTime = eventDateTime.minus({ minutes: EVENT_BOOKING_OFFSET_MINUTES })
    return buildOpenTableUrl(bookingDateTime)
  }

  const explicitBookingUrl =
    typeof event.bookingUrl === 'string' && event.bookingUrl.trim().length > 0
      ? event.bookingUrl.trim()
      : null

  if (explicitBookingUrl) {
    return explicitBookingUrl
  }

  const offerUrl =
    typeof event.offers?.url === 'string' && event.offers.url.trim().length > 0
      ? event.offers.url.trim()
      : null

  if (!offerUrl) {
    return null
  }

  const base = typeof window !== 'undefined' ? window.location.origin : 'https://www.the-anchor.pub'

  try {
    const parsed = new URL(offerUrl, base)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }

    const normalisedPath = parsed.pathname.replace(/\/+$/, '')

    if (parsed.hostname.endsWith('the-anchor.pub') && normalisedPath.startsWith('/events')) {
      return null
    }

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

    return offerUrl
  } catch {
    return null
  }
}

export function EventBookingButton({
  event,
  className,
  fullWidth = true,
  size = 'lg',
  variant = 'primary',
  label = 'Book Now',
  unavailableLabel = 'Booking options available closer to the event',
  source,
  onClick
}: EventBookingButtonProps) {
  const bookingUrl = resolveBookingUrl(event)

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
        target="_blank"
        rel="noopener noreferrer"
        onClick={(clickEvent) => {
          clickEvent.stopPropagation()
          onClick?.()
          trackEventBookingStart({
            eventId: event.id,
            eventName: event.name,
            eventPrice: getEventPrice(event)
          })
        }}
        aria-label={`${label} for ${event.name}${source ? ` (${source})` : ''}`}
      >
        {label}
      </a>
    </Button>
  )
}

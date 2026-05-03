import { canUseCookieCategory } from './cookies'

const DEFAULT_META_PIXEL_ID = '757659911002159'

type FbqCommand = 'init' | 'track' | 'trackCustom' | 'consent'

type Fbq = {
  (...args: unknown[]): void
  callMethod?: (...args: unknown[]) => void
  queue?: unknown[][]
  loaded?: boolean
  version?: string
  push?: Fbq
}

declare global {
  interface Window {
    fbq?: Fbq
    _fbq?: Fbq
    __anchorMetaPixelInitialized?: boolean
    __anchorMetaPixelPurchaseEvents?: Set<string>
  }
}

export interface MetaBookingPurchase {
  eventId: string
  value?: number | null
  currency?: string
  bookingType: 'table' | 'event' | string
  bookingSource?: string
  contentName?: string
  contentIds?: string[]
  contentCategory?: string | null
  contentType?: string
  numItems?: number | null
  eventDate?: string | null
  foodIntent?: string | null
  eventSlug?: string | null
  eventCategorySlug?: string | null
}

export function getMetaPixelId() {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID || DEFAULT_META_PIXEL_ID
}

export function ensureMetaPixel() {
  if (typeof window === 'undefined') return false
  if (!canUseCookieCategory('marketing')) return false

  const pixelId = getMetaPixelId().trim()
  if (!pixelId) return false

  const fbq = installFbq()
  if (!window.__anchorMetaPixelInitialized) {
    fbq('init', pixelId)
    fbq('track', 'PageView')
    window.__anchorMetaPixelInitialized = true
  }

  return true
}

export function trackMetaBookingPurchase(data: MetaBookingPurchase) {
  if (!data.eventId.trim()) return false
  if (!ensureMetaPixel()) return false

  const eventId = data.eventId.trim()
  window.__anchorMetaPixelPurchaseEvents = window.__anchorMetaPixelPurchaseEvents ?? new Set<string>()
  if (window.__anchorMetaPixelPurchaseEvents.has(eventId)) return false
  window.__anchorMetaPixelPurchaseEvents.add(eventId)

  window.fbq?.(
    'track',
    'Purchase',
    {
      value: normaliseValue(data.value),
      currency: data.currency || 'GBP',
      content_ids: data.contentIds,
      content_category: data.contentCategory || 'booking',
      content_name: data.contentName || 'Booking',
      content_type: data.contentType || `${data.bookingType}_booking`,
      num_items: normalisePositiveInteger(data.numItems),
      booking_type: data.bookingType,
      booking_source: data.bookingSource,
      event_date: data.eventDate,
      food_intent: data.foodIntent
    },
    { eventID: eventId }
  )

  forwardBookingConversion({
    ...data,
    eventId
  })

  return true
}

function normaliseValue(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

function normalisePositiveInteger(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  const rounded = Math.floor(value)
  return rounded > 0 ? rounded : undefined
}

function forwardBookingConversion(data: MetaBookingPurchase) {
  if (typeof window === 'undefined') return

  try {
    const url = new URL(window.location.href)
    const payload = {
      sourceSite: window.location.hostname,
      bookingId: data.eventId,
      metaEventId: data.eventId,
      bookingType: data.bookingType === 'event' ? 'event' : 'table',
      eventId: data.contentIds?.[0] ?? null,
      eventSlug: data.eventSlug ?? null,
      eventName: data.contentName ?? null,
      eventCategoryName: data.contentCategory ?? null,
      eventCategorySlug: data.eventCategorySlug ?? null,
      eventDate: data.eventDate ?? null,
      tickets: normalisePositiveInteger(data.numItems) ?? null,
      value: normaliseValue(data.value),
      currency: data.currency || 'GBP',
      foodIntent: data.foodIntent ?? null,
      sourceUrl: url.toString(),
      landingPath: url.pathname,
      utmSource: url.searchParams.get('utm_source'),
      utmMedium: url.searchParams.get('utm_medium'),
      utmCampaign: url.searchParams.get('utm_campaign'),
      utmContent: url.searchParams.get('utm_content'),
      utmTerm: url.searchParams.get('utm_term'),
      fbclid: url.searchParams.get('fbclid'),
      occurredAt: new Date().toISOString()
    }

    void fetch('/api/tracking/booking-conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => undefined)
  } catch {
    // Conversion forwarding should never interrupt the booking confirmation UX.
  }
}

function installFbq(): Fbq {
  if (window.fbq) return window.fbq

  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) {
      fbq.callMethod(...args)
      return
    }
    fbq.queue = fbq.queue ?? []
    fbq.queue.push(args)
  }) as Fbq

  fbq.push = fbq
  fbq.loaded = true
  fbq.version = '2.0'
  fbq.queue = []

  window.fbq = fbq
  window._fbq = fbq

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  const firstScript = document.getElementsByTagName('script')[0]
  firstScript?.parentNode?.insertBefore(script, firstScript)

  return fbq
}

export {}

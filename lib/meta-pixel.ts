import { canUseCookieCategory } from './cookies'
import { getBookingAttributionPayload, getMarketingConsentSignalPayload } from './booking-attribution'

type Fbq = (...args: unknown[]) => void

declare global {
  interface Window {
    fbq?: Fbq
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

// The Meta Pixel base tag (init + PageView) is owned by Google Tag Manager (container
// GTM-WWFQTQS). This module deliberately does NOT initialise a pixel — doing so alongside
// GTM caused a duplicate-pixel init. It only:
//   1. forwards booking conversions server-side via the Meta Conversions API, and
//   2. fires the client-side Purchase event on GTM's already-initialised pixel (deduped by eventID).
export function trackMetaBookingPurchase(data: MetaBookingPurchase) {
  if (!data.eventId.trim()) return false

  const eventId = data.eventId.trim()
  if (typeof window !== 'undefined') {
    window.__anchorMetaPixelPurchaseEvents = window.__anchorMetaPixelPurchaseEvents ?? new Set<string>()
    if (window.__anchorMetaPixelPurchaseEvents.has(eventId)) return false
    window.__anchorMetaPixelPurchaseEvents.add(eventId)
  }

  // Server-side Conversions API — independent of the client pixel; always attempt.
  forwardBookingConversion({ ...data, eventId })

  if (typeof window === 'undefined') return true
  if (!canUseCookieCategory('marketing')) return true

  // Fire the Purchase on the pixel GTM has already initialised. Never init a pixel here.
  const fbq = window.fbq
  if (typeof fbq !== 'function') return true

  fbq(
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
    const attribution = getBookingAttributionPayload()
    const fbclid = attribution.fbclid ?? url.searchParams.get('fbclid')
    const marketingSignal = getMarketingConsentSignalPayload(fbclid)
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
      sourceUrl: attribution.source_url ?? `${url.origin}${url.pathname}`,
      landingPath: attribution.landing_path ?? url.pathname,
      utmSource: attribution.utm_source ?? url.searchParams.get('utm_source'),
      utmMedium: attribution.utm_medium ?? url.searchParams.get('utm_medium'),
      utmCampaign: attribution.utm_campaign ?? url.searchParams.get('utm_campaign'),
      utmContent: attribution.utm_content ?? url.searchParams.get('utm_content'),
      utmTerm: attribution.utm_term ?? url.searchParams.get('utm_term'),
      fbclid,
      gclid: attribution.gclid ?? url.searchParams.get('gclid'),
      shortCode: attribution.short_code ?? url.searchParams.get('short_code'),
      attributionCapturedAt: attribution.attribution_captured_at ?? null,
      attributionUpdatedAt: attribution.attribution_updated_at ?? null,
      metaConsentGranted: marketingSignal.meta_consent_granted === true,
      fbp: marketingSignal.meta_consent_granted === true ? marketingSignal.fbp ?? null : null,
      fbc: marketingSignal.meta_consent_granted === true ? marketingSignal.fbc ?? null : null,
      clientUserAgent: marketingSignal.meta_consent_granted === true ? marketingSignal.client_user_agent ?? null : null,
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

export {}

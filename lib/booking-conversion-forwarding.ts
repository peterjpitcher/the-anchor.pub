export type BookingConversionForwardPayload = {
  sourceSite?: string | null
  bookingId: string
  metaEventId?: string | null
  bookingType: 'event' | 'table'
  eventId?: string | null
  eventSlug?: string | null
  eventName?: string | null
  eventCategoryName?: string | null
  eventCategorySlug?: string | null
  eventDate?: string | null
  tickets?: number | null
  value?: number | null
  currency?: string | null
  foodIntent?: string | null
  sourceUrl?: string | null
  landingPath?: string | null
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmContent?: string | null
  utmTerm?: string | null
  fbclid?: string | null
  occurredAt?: string | null
}

export type BookingConversionForwardResult =
  | { accepted: true }
  | { accepted: false; reason: 'not_configured' | 'upstream_rejected' | 'network_error' }

function getIngestUrl() {
  return process.env.CHEERSAI_BOOKING_CONVERSIONS_URL?.trim()
    || 'https://www.cheersai.uk/api/booking-conversions'
}

function getSecret() {
  return process.env.CHEERSAI_BOOKING_CONVERSIONS_SECRET?.trim() || ''
}

export async function forwardBookingConversionToCheersAI(
  payload: BookingConversionForwardPayload,
  options?: { timeoutMs?: number }
): Promise<BookingConversionForwardResult> {
  const secret = getSecret()
  if (!secret) {
    return { accepted: false, reason: 'not_configured' }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? 1800)

  try {
    const response = await fetch(getIngestUrl(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: controller.signal
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      console.error('[booking-conversion] CheersAI ingest failed', {
        status: response.status,
        body: body.slice(0, 500)
      })
      return { accepted: false, reason: 'upstream_rejected' }
    }

    return { accepted: true }
  } catch (error) {
    console.error('[booking-conversion] Could not forward conversion', error)
    return { accepted: false, reason: 'network_error' }
  } finally {
    clearTimeout(timeout)
  }
}

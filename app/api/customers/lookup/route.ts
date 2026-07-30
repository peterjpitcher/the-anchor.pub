import { NextRequest, NextResponse } from 'next/server'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { getSafeUpstreamErrorMessage, safeJsonParse } from '@/lib/upstream-json'

const API_BASE_URL = getManagementApiBaseUrl()
const API_KEY = process.env.ANCHOR_API_KEY

// Pre-verification lookup response. Typing a phone number is not proof of
// possession, so this public endpoint must never identify anyone (review F10).
// The only fact the booking flow needs is whether the number is known; the
// upstream customer record (id, names, email, phone variants) stays server-side.
type CustomerLookupResponse = {
  known: boolean
  lookup_degraded?: boolean
}

// ── Per-IP rate limiting to protect the shared upstream API key budget ───────
const LOOKUP_RATE_LIMIT_WINDOW_MS = 60_000
const LOOKUP_RATE_LIMIT_MAX = 6 // generous for real users, blocks automated abuse
const lookupRateLimitMap = new Map<string, number[]>()

function isLookupRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = lookupRateLimitMap.get(ip) ?? []
  const recent = timestamps.filter((t) => now - t < LOOKUP_RATE_LIMIT_WINDOW_MS)
  if (recent.length >= LOOKUP_RATE_LIMIT_MAX) {
    lookupRateLimitMap.set(ip, recent)
    return true
  }
  recent.push(now)
  lookupRateLimitMap.set(ip, recent)
  return false
}

function createDegradedLookupResponse(reason: string, status = 200) {
  const data: CustomerLookupResponse = {
    known: false,
    lookup_degraded: true
  }

  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        source: 'brand_lookup_fallback',
        reason
      }
    },
    { status }
  )
}

export async function GET(request: NextRequest) {
  if (!API_KEY) {
    return createDegradedLookupResponse('missing_api_key')
  }

  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isLookupRateLimited(clientIp)) {
    return createDegradedLookupResponse('rate_limited')
  }

  const phone = request.nextUrl.searchParams.get('phone')?.trim() || ''
  const defaultCountryCode =
    request.nextUrl.searchParams.get('default_country_code')?.trim() || '44'

  if (phone.length < 5) {
    return createApiErrorResponse('Phone number is required', 400)
  }

  try {
    const params = new URLSearchParams({ phone })
    if (defaultCountryCode) {
      params.set('default_country_code', defaultCountryCode)
    }

    const upstream = await fetch(`${API_BASE_URL}/customers/lookup?${params.toString()}`, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY
      },
      cache: 'no-store'
    })

    const rawText = await upstream.text()
    const parsed = safeJsonParse(rawText)

    if (upstream.ok) {
      if (parsed) {
        // Reduce the upstream answer to the one non-identifying fact the flow
        // needs. Never pass the upstream body through: it carries the full
        // customer record after a phone-number-only lookup (review F10).
        const upstreamData = ((parsed as any)?.data ?? parsed) as Record<string, unknown> | null
        const data: CustomerLookupResponse = {
          known: upstreamData?.known === true || Boolean(upstreamData?.customer)
        }
        return NextResponse.json(
          {
            success: true,
            data,
            meta: { source: 'brand_lookup' }
          },
          { status: 200 }
        )
      }
      return createDegradedLookupResponse('upstream_non_json')
    }

    const shouldDegrade =
      upstream.status >= 500 ||
      [401, 403, 404, 405, 429].includes(upstream.status)

    if (shouldDegrade) {
      return createDegradedLookupResponse(`upstream_${upstream.status}`)
    }

    // Same rule on error paths: surface a safe message, never the upstream body.
    return NextResponse.json(
      {
        success: false,
        error: getSafeUpstreamErrorMessage(rawText, 'Customer lookup failed')
      },
      { status: upstream.status }
    )
  } catch (error) {
    logError('api/customers/lookup', error)
    return createDegradedLookupResponse('network_error')
  }
}

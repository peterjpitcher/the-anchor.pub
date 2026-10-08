import { NextRequest, NextResponse } from 'next/server'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import { PRIVATE_NO_STORE_HEADERS } from '@/lib/api-cache-policy'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { safeJsonParse } from '@/lib/upstream-json'
import { mapUpstreamFailure } from '@/lib/guest-error-messages'
import { RATE_LIMITS, limitByAddress } from '@/lib/rate-limit'

// Never built ahead of time or kept: every answer is about one phone number.
export const dynamic = 'force-dynamic'

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

// The reason is for our logs only. It used to be sent back in `meta.reason`,
// which told anyone asking whether the key was missing, whether they had been
// limited or what the management app had answered (site review, 7 October 2026).
function createDegradedLookupResponse(reason: string, status = 200) {
  console.warn(`[api/customers/lookup] answered without a lookup: ${reason}`)

  const data: CustomerLookupResponse = {
    known: false,
    lookup_degraded: true
  }

  return NextResponse.json(
    { success: true, data },
    { status, headers: PRIVATE_NO_STORE_HEADERS }
  )
}

const MAX_PHONE_LENGTH = 32

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

// POST, with the number in the body. As a GET the number sat in the web
// address, which is the part of a request that hosting, proxy and browser
// history all record.
//
// The onward call to the management app is still a GET with the number in its
// query string, because that is the only form its lookup accepts. That hop is
// server to server; moving it needs a change in the management app.
export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return createDegradedLookupResponse('missing_api_key')
  }

  // Protects the management app's shared key from one address hammering this
  // lookup. Per server (lib/rate-limit.ts). The answer stays the degraded one,
  // not a 429: the booking form carries on without the lookup, so the guest
  // loses a convenience and never the booking.
  if (limitByAddress(request, 'customer-lookup', RATE_LIMITS.customerLookup).limited) {
    return createDegradedLookupResponse('rate_limited')
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const phone = asTrimmedString(body?.phone)
  const defaultCountryCode = asTrimmedString(body?.default_country_code) || '44'

  if (phone.length < 5 || phone.length > MAX_PHONE_LENGTH || !/^\d{1,4}$/.test(defaultCountryCode)) {
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
          { success: true, data },
          // Keyed by a phone number, so never stored anywhere shared.
          { status: 200, headers: PRIVATE_NO_STORE_HEADERS }
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

    // Same rule on error paths: a safe message, never the upstream body. This
    // used to return the whole upstream JSON envelope as a string, so a guest
    // who mistyped their mobile number saw a line of JSON under the field.
    const mapped = mapUpstreamFailure({ status: upstream.status, body: parsed, context: 'customer_lookup' })
    return NextResponse.json(
      {
        success: false,
        error: { code: mapped.code, message: mapped.message }
      },
      { status: upstream.status, headers: PRIVATE_NO_STORE_HEADERS }
    )
  } catch (error) {
    logError('api/customers/lookup', error)
    return createDegradedLookupResponse('network_error')
  }
}

// A page left open from before this route became a POST still asks with a GET
// and the number in the address. It is answered "could not check", which the
// forms already handle by asking for a name as they would for a new guest, so
// nobody is stopped from booking by a deploy. The number is not read, not
// looked up and not passed on. Nothing on the site sends this any more.
export async function GET() {
  return createDegradedLookupResponse('get_not_supported')
}

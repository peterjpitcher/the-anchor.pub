import { anchorAPI } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import { isValidIsoDate } from '@/lib/table-booking-service-windows'

/**
 * The seasonal period that applies to a date, proxied to the browser.
 *
 * The browser cannot call AMS directly (the API key is server-only), so this
 * route exists purely to carry the answer across. It is a PASS-THROUGH by
 * design: it re-shapes nothing, prices nothing and rounds nothing.
 *
 * That restraint is the point. Every figure and every word of refund wording is
 * computed on the management server from the stored period row, and the one
 * seasonal bug that reached production was a second implementation disagreeing
 * with the first: a route quoted GBP 30 while the create path charged GBP 0. A
 * proxy that only forwards cannot drift from the thing it forwards.
 *
 * GET /api/table-bookings/periods?date=YYYY-MM-DD[&party_size=N]
 */

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const date = url.searchParams.get('date') || ''
  const partySizeRaw = url.searchParams.get('party_size')

  if (!isValidIsoDate(date)) {
    return createApiErrorResponse('A booking date is required, as YYYY-MM-DD.', 400)
  }

  let partySize: number | undefined
  if (partySizeRaw !== null && partySizeRaw !== '') {
    const parsed = Number.parseInt(partySizeRaw, 10)
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 200) {
      return createApiErrorResponse('Party size must be between 1 and 200.', 400)
    }
    partySize = parsed
  }

  // Deliberately the SAFE read. A seasonal lookup that times out must never
  // block an ordinary booking, so a failure is reported as "no period", which is
  // exactly what most of the year looks like anyway. The guest keeps the normal
  // journey rather than being shown a question nobody can price.
  const result = await anchorAPI.getBookingPeriodSafe(date, partySize)

  if (!result) {
    logError('api/table-bookings/periods', new Error('Period lookup unavailable'), {
      date,
      partySize
    })
    return new Response(
      JSON.stringify({
        success: true,
        data: { date, period: null, deposit: null },
        meta: { source: 'unavailable' }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: result,
      meta: { source: 'management_api' }
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

/**
 * Booking assistant agent endpoint: RETIRED, 2026-07-28.
 *
 * This route accepted public, unauthenticated POSTs and created real table bookings at the pub,
 * including setting high chairs and outside seating. Its only protection was the shared browser
 * spam guard (honeypot, timing, Turnstile): no API key, no scoped client identity, no replay
 * protection, no quota of its own.
 *
 * It was added around August 2025 alongside the Sunday lunch booking work, described in its own
 * header as being "designed for GPT-5 and other AI agents". Nothing on the website linked to it,
 * and its only mention anywhere else was one line in docs/architecture/routes.md. Asked in July 2026
 * whether anything called it, the owner had never heard of it.
 *
 * So it was a live public booking channel with no known caller, no owner and no authentication,
 * which also had to be kept in step with every change to the booking contract. Switched off rather
 * than maintained.
 *
 * 410 rather than 404 on purpose: a caller that does still exist gets an unambiguous "this is gone"
 * rather than a silence it might retry through, and it will show up in logs within days.
 *
 * The previous implementation is in git history, in the commit before this one. It should not come
 * back without:
 *   - a scoped, rotatable credential, not the browser spam guard;
 *   - replay protection (nonce or timestamp) and idempotency;
 *   - a per-client rate limit separate from the website's shared budget;
 *   - an audit trail naming the calling agent on every booking;
 *   - a kill switch that does not need a deployment.
 */

const GONE = {
  success: false,
  error:
    'This endpoint has been retired. Table bookings are available at ' +
    'https://www.the-anchor.pub/book-table or by calling 01753 682707.',
} as const

// Plain Response rather than NextResponse.json, matching what this file used before: the
// latter is not available in the jsdom test environment.
function gone(): Response {
  return new Response(JSON.stringify(GONE), {
    status: 410,
    headers: {
      'Content-Type': 'application/json',
      // Tell caches, and any well-behaved client, not to keep trying.
      'Cache-Control': 'no-store',
      Link: '<https://www.the-anchor.pub/book-table>; rel="alternate"',
    },
  })
}

export async function POST(): Promise<Response> {
  return gone()
}

export async function GET(): Promise<Response> {
  return gone()
}

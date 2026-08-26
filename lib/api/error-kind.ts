/**
 * Tell a missing thing apart from a broken dependency.
 *
 * This distinction was absent, and the cost was real: `app/events/[id]/page.tsx`
 * wrapped its fetch in a bare `catch` that issued `permanentRedirect('/whats-on')`.
 * Every failure mode took that branch, so a three-second timeout, a 502 from the
 * management app, a DNS blip or a JSON parse error all told Google that a live,
 * bookable event had **permanently** moved. A 301 is durable and cached; the
 * outage that caused it is not.
 *
 * `anchorAPI` already carries enough to separate the two. It returns `null` when
 * the API genuinely reports 404, and throws `{ message, status }` otherwise. This
 * reads that shape without trusting it blindly.
 */

/** An error is only "not found" when the API positively said so. */
export function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const status = (error as { status?: unknown }).status
  return status === 404
}

/**
 * Anything that is not a definite 404 is treated as transient.
 *
 * Deliberately the default. Misreading an outage as a retirement produces a
 * durable wrong signal; misreading a retirement as an outage produces a 500 that
 * costs nothing and self-corrects on the next crawl.
 */
export function isTransientError(error: unknown): boolean {
  return !isNotFoundError(error)
}

/** Rethrow so Next renders the error boundary, never a redirect. */
export function rethrowIfTransient(error: unknown): void {
  if (isTransientError(error)) throw error
}

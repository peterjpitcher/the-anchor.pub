import { getManagementApiBaseUrl } from '@/lib/management-api-base'

/**
 * Runtime UI flags, read from AMS (review F19 / plan T9).
 *
 * A NEXT_PUBLIC_* build-time flag cannot be an instant rollback: turning a
 * feature off would mean a redeploy. AMS holds the truth in one row and this
 * reader polls it server-side, so switching a flag off takes effect within a
 * minute with no deploy.
 *
 * Every failure mode is OFF. Unreachable, slow, non-200, malformed body,
 * missing key: all of them mean "flag off", because the off state is the
 * rollback state and must never depend on AMS being healthy.
 *
 * Server-side only: call this from server components, route handlers and
 * server actions, never from a client component. The key lives in
 * ANCHOR_API_KEY, which has no NEXT_PUBLIC_ prefix and so is never inlined
 * into a browser bundle: were this imported client-side by mistake the key
 * would read as undefined and every flag would come back off, so the mistake
 * degrades to the rollback state rather than leaking anything.
 */

const FLAGS_PATH = '/website/ui-flags'
const CACHE_TTL_MS = 60_000
const REQUEST_TIMEOUT_MS = 2_000

export type WebsiteUiFlags = Record<string, unknown>

type FlagsCache = {
  flags: WebsiteUiFlags
  expiresAt: number
}

let cache: FlagsCache | null = null
// Collapses concurrent misses onto one request: a burst of renders after the
// cache expires should not become a burst of calls to AMS.
let inFlight: Promise<WebsiteUiFlags> | null = null

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

async function fetchFlags(): Promise<WebsiteUiFlags> {
  const apiKey = process.env.ANCHOR_API_KEY
  if (!apiKey) return {}

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${getManagementApiBaseUrl()}${FLAGS_PATH}`, {
      method: 'GET',
      headers: { 'X-API-Key': apiKey },
      cache: 'no-store',
      signal: controller.signal
    })

    if (!response.ok) return {}

    const body: unknown = await response.json()
    if (!isPlainObject(body)) return {}

    const data = body.data
    if (!isPlainObject(data)) return {}

    return isPlainObject(data.flags) ? data.flags : {}
  } catch {
    // A kill switch that throws is not a kill switch. Any failure is OFF.
    return {}
  } finally {
    clearTimeout(timeout)
  }
}

/** All flags currently set. Cached for 60 seconds; `{}` in every failure mode. */
export async function getWebsiteUiFlags(): Promise<WebsiteUiFlags> {
  const now = Date.now()
  if (cache && cache.expiresAt > now) {
    return cache.flags
  }

  if (inFlight) return inFlight

  inFlight = fetchFlags()
    .then((flags) => {
      // Cache failures too: a flapping AMS must not turn every render into a
      // fresh attempt. Sixty seconds later it tries again.
      cache = { flags, expiresAt: Date.now() + CACHE_TTL_MS }
      return flags
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}

/**
 * Whether one flag is on. Only an explicit boolean `true` counts: a string,
 * a number, a missing key or an unreachable AMS all read as off.
 */
export async function isWebsiteUiFlagEnabled(name: string): Promise<boolean> {
  const flags = await getWebsiteUiFlags()
  return flags[name] === true
}

/** Test seam only: drops the cached flags so the next read hits AMS again. */
export function clearWebsiteUiFlagsCacheForTest(): void {
  cache = null
  inFlight = null
}

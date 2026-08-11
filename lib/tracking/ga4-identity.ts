/**
 * Reads the GA4 first-party cookies in the browser so that events we forward
 * server-side (Measurement Protocol, via /api/analytics) can be joined to the
 * browser session that actually produced them.
 *
 * WHY THIS EXISTS
 *
 * A Measurement Protocol event sent without `session_id` is recorded by GA4 at
 * user and event scope only. It belongs to no session, so every session-scoped
 * dimension (landing page, session source/medium, default channel group)
 * resolves to "(not set)". Between May and August 2026 that put 100% of this
 * site's key events onto a single unattributable row: 76 key events, 1,241
 * "active users" and only 149 sessions, with every real landing page showing
 * 0.00 conversions. We could not tell which pages produced bookings.
 *
 * GA4 writes two first-party cookies we can read here:
 *   _ga            = GA1.1.<clientId>            the device/user identifier
 *   _ga_<STREAM>   = GS1.1.<sessionId>...        the session identifier
 *                    or GS2.1.s<sessionId>$o...  (newer format)
 *
 * We match `_ga_` by prefix rather than deriving the stream suffix from the
 * measurement id, because the measurement id is a server-only environment
 * variable and is not exposed to the browser.
 */

export interface Ga4Identity {
  client_id?: string
  session_id?: string
}

function readRawCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + escaped + '=([^;]*)'))
  return match?.[1] ? decodeURIComponent(match[1]) : undefined
}

/**
 * `_ga` is `GA<version>.<domainDepth>.<clientId>`, where clientId is itself
 * two dot-separated numbers, for example GA1.1.1234567890.1699999999 gives a
 * client id of "1234567890.1699999999".
 */
export function getGa4ClientId(): string | undefined {
  const raw = readRawCookie('_ga')
  if (!raw) return undefined
  const match = raw.match(/^GA\d+\.\d+\.(\d+\.\d+)$/)
  return match?.[1]
}

function parseSessionId(value: string): string | undefined {
  // Newer format: GS2.1.s1723334455$o3$g1$t1723334460$j60$l0$h0
  const v2 = value.match(/^GS2\.\d+\.s(\d+)/)
  if (v2?.[1]) return v2[1]

  // Original format: GS1.1.1723334455.3.1.1723334460.60.0.0
  const v1 = value.match(/^GS1\.\d+\.(\d+)\./)
  if (v1?.[1]) return v1[1]

  return undefined
}

/**
 * Finds the session cookie for whichever GA4 stream is installed. There is
 * normally exactly one `_ga_*` cookie; if several exist we take the first that
 * parses, which is the correct behaviour for a single-property site.
 */
export function getGa4SessionId(): string | undefined {
  if (typeof document === 'undefined') return undefined

  for (const part of document.cookie.split(';')) {
    const [rawName, ...rest] = part.split('=')
    const name = rawName?.trim()
    if (!name || !name.startsWith('_ga_')) continue

    const sessionId = parseSessionId(decodeURIComponent(rest.join('=')))
    if (sessionId) return sessionId
  }

  return undefined
}

/**
 * Returns whatever GA4 identity is currently available. Either field may be
 * absent, most commonly in the short window after a visitor accepts cookies but
 * before the Google tag has written them. Callers must treat a missing
 * client_id as "do not forward", never as "invent one": a fabricated id creates
 * a brand-new GA4 user with no session, which is strictly worse for reporting
 * than sending nothing at all.
 */
export function getGa4Identity(): Ga4Identity {
  const identity: Ga4Identity = {}

  const clientId = getGa4ClientId()
  if (clientId) identity.client_id = clientId

  const sessionId = getGa4SessionId()
  if (sessionId) identity.session_id = sessionId

  return identity
}

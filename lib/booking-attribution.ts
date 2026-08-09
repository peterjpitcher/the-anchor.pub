import { canUseCookieCategory } from './cookies'

const ATTRIBUTION_STORAGE_KEY = 'anchor-booking-attribution'
const ATTRIBUTION_COOKIE_NAME = 'anchor-booking-attribution'
const ATTRIBUTION_TTL_DAYS = 90
const ATTRIBUTION_TTL_MS = ATTRIBUTION_TTL_DAYS * 24 * 60 * 60 * 1000
const FBC_COOKIE_NAME = '_fbc'
const FBP_COOKIE_NAME = '_fbp'
// Meta's own `_fbc` cookie lives for 90 days, but the Pixel refreshes its expiry
// on every page view, so a returning visitor can carry one indefinitely. Never
// send a click older than that lifetime: it cannot attribute anything, and it
// makes an organic booking look like an ad conversion.
const FBC_MAX_AGE_MS = ATTRIBUTION_TTL_MS

const PARAM_LIMITS: Record<AttributionParam, number> = {
  utm_source: 160,
  utm_medium: 160,
  utm_campaign: 240,
  utm_content: 240,
  utm_term: 240,
  fbclid: 500,
  gclid: 500,
  short_code: 120,
}

const ATTRIBUTION_PARAMS = Object.keys(PARAM_LIMITS) as AttributionParam[]
const CLICK_ID_PARAMS: AttributionParam[] = ['fbclid', 'gclid']

type AttributionParam =
  | 'utm_source'
  | 'utm_medium'
  | 'utm_campaign'
  | 'utm_content'
  | 'utm_term'
  | 'fbclid'
  | 'gclid'
  | 'short_code'

type AttributionParams = Partial<Record<AttributionParam, string>>

interface StoredAttributionEntry {
  sourceUrl: string
  landingPath: string
  capturedAt: string
  params: AttributionParams
}

interface StoredBookingAttribution {
  first: StoredAttributionEntry
  latest: StoredAttributionEntry
  expiresAt: string
  // When `latest.params.fbclid` was first observed, which is the click time Meta
  // expects inside `fbc`. Held separately because `latest.capturedAt` advances on
  // every later campaign navigation while the click ID itself does not.
  fbclidCapturedAt?: string
}

export interface BookingAttributionPayload {
  source_url?: string
  landing_path?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  fbclid?: string
  gclid?: string
  short_code?: string
  attribution_captured_at?: string
  attribution_updated_at?: string
  fbclid_captured_at?: string
  meta_consent_granted?: boolean
  fbp?: string
  fbc?: string
  client_user_agent?: string
}

export function captureBookingAttributionFromLocation(now = new Date()): BookingAttributionPayload {
  if (typeof window === 'undefined') return {}

  const current = readAttributionFromUrl(window.location.href, now)
  const existing = readStoredAttribution(now)

  if (!current) {
    return existing ? storedToPayload(existing) : {}
  }

  // `latest` carries the most recent campaign params. A paramless navigation
  // (e.g. organic click from a landing page to /book-table) must NOT clobber a
  // richer existing `latest` — otherwise we'd drop the UTMs that brought the
  // visitor in. Only advance `latest` when the current URL actually has marketing
  // params, or when there's no prior record at all (so a purely organic first
  // session still stores a valid entry capturing its landing_path).
  const currentHasParams = Object.keys(current.params).length > 0
  const latest = existing && !currentHasParams
    ? existing.latest
    : carryClickIdsForward(current, existing?.latest)

  const stored: StoredBookingAttribution = {
    first: existing?.first ?? current,
    latest,
    expiresAt: new Date(now.getTime() + ATTRIBUTION_TTL_MS).toISOString(),
    fbclidCapturedAt: resolveFbclidCapturedAt(existing, latest, now),
  }

  writeStoredAttribution(stored)
  return storedToPayload(stored)
}

export function getBookingAttributionPayload(): BookingAttributionPayload {
  if (typeof window === 'undefined') return {}

  const captured = captureBookingAttributionFromLocation()
  if (Object.keys(captured).length > 0) return captured

  const stored = readStoredAttribution()
  return stored ? storedToPayload(stored) : {}
}

export function getMarketingConsentSignalPayload(fbclid?: string | null): BookingAttributionPayload {
  if (typeof window === 'undefined' || !canUseCookieCategory('marketing')) {
    return { meta_consent_granted: false }
  }

  const attribution = getBookingAttributionPayload()
  const resolvedFbclid = fbclid ?? attribution.fbclid ?? currentFbclid()
  // Only trust the stored click time when it belongs to the click ID we are about
  // to send. A caller passing a different fbclid is reading it live off the URL.
  const fbclidCapturedAt = resolvedFbclid === attribution.fbclid
    ? attribution.fbclid_captured_at
    : undefined

  return removeUndefined({
    meta_consent_granted: true,
    fbp: sanitizeSignal(readCookieValue(FBP_COOKIE_NAME), 500),
    fbc: sanitizeSignal(resolveFbc(resolvedFbclid, fbclidCapturedAt), 500),
    client_user_agent: sanitizeSignal(window.navigator?.userAgent, 500),
  })
}

export function clearBookingAttributionForTest() {
  if (typeof window === 'undefined') return
  window.localStorage?.removeItem(ATTRIBUTION_STORAGE_KEY)
  document.cookie = `${ATTRIBUTION_COOKIE_NAME}=; path=/; max-age=0`
}

function readAttributionFromUrl(urlValue: string, now: Date): StoredAttributionEntry | null {
  let url: URL
  try {
    url = new URL(urlValue)
  } catch {
    return null
  }

  const params: AttributionParams = {}
  const sanitizedUrl = new URL(`${url.origin}${url.pathname}`)

  for (const key of ATTRIBUTION_PARAMS) {
    const value = sanitizeParam(key, url.searchParams.get(key))
    if (!value) continue
    params[key] = value
    sanitizedUrl.searchParams.set(key, value)
  }

  // Even with no UTM/click-id params (i.e. organic traffic), we still record a
  // valid entry so every first session captures its landing path. Marketing
  // params stay empty; `params` as {} remains a valid StoredAttributionEntry.
  return {
    sourceUrl: sanitizedUrl.toString(),
    landingPath: url.pathname || '/',
    capturedAt: now.toISOString(),
    params,
  }
}

/**
 * Click IDs must survive a later campaign click that carries only UTMs. Arriving
 * via a second short link (an SMS, an organic post) used to wipe the Meta click ID
 * the ad brought in, leaving the booking unattributable. Meta's own `_fbc` cookie
 * behaves this way too: it persists until a *new* click ID replaces it.
 */
function carryClickIdsForward(
  current: StoredAttributionEntry,
  previous: StoredAttributionEntry | undefined,
): StoredAttributionEntry {
  if (!previous) return current

  const params: AttributionParams = { ...current.params }
  let carried = false
  for (const key of CLICK_ID_PARAMS) {
    if (params[key] || !previous.params[key]) continue
    params[key] = previous.params[key]
    carried = true
  }

  return carried ? { ...current, params } : current
}

/**
 * The click time Meta wants inside `fbc` is when the fbclid was seen, not when the
 * booking was submitted. Only restamp when the click ID actually changes.
 */
function resolveFbclidCapturedAt(
  existing: StoredBookingAttribution | null,
  latest: StoredAttributionEntry,
  now: Date,
): string | undefined {
  if (!latest.params.fbclid) return undefined
  if (existing?.latest.params.fbclid !== latest.params.fbclid) return now.toISOString()
  // Unchanged click ID. Records written before this field existed fall back to the
  // entry's own capture time, which is the closest thing they hold to a click time.
  return existing.fbclidCapturedAt ?? existing.latest.capturedAt
}

function sanitizeParam(key: AttributionParam, value: string | null): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, PARAM_LIMITS[key])
}

function readStoredAttribution(now = new Date()): StoredBookingAttribution | null {
  const stored = parseStoredAttribution(readLocalStorage()) ?? parseStoredAttribution(readCookie())
  if (!stored) return null

  const expiresAt = new Date(stored.expiresAt)
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= now.getTime()) {
    clearBookingAttributionForTest()
    return null
  }

  return stored
}

function parseStoredAttribution(value: string | null): StoredBookingAttribution | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as Partial<StoredBookingAttribution>
    if (!isStoredEntry(parsed.first) || !isStoredEntry(parsed.latest) || typeof parsed.expiresAt !== 'string') {
      return null
    }
    return {
      first: parsed.first,
      latest: parsed.latest,
      expiresAt: parsed.expiresAt,
      fbclidCapturedAt: typeof parsed.fbclidCapturedAt === 'string' ? parsed.fbclidCapturedAt : undefined,
    }
  } catch {
    return null
  }
}

function isStoredEntry(value: unknown): value is StoredAttributionEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<StoredAttributionEntry>
  return typeof entry.sourceUrl === 'string' &&
    typeof entry.landingPath === 'string' &&
    typeof entry.capturedAt === 'string' &&
    Boolean(entry.params && typeof entry.params === 'object')
}

function writeStoredAttribution(stored: StoredBookingAttribution) {
  const serialized = JSON.stringify(stored)

  try {
    window.localStorage?.setItem(ATTRIBUTION_STORAGE_KEY, serialized)
  } catch {
    // Attribution must never break booking UX.
  }

  const secure = window.location.protocol === 'https:' ? '; secure' : ''
  document.cookie = `${ATTRIBUTION_COOKIE_NAME}=${encodeURIComponent(serialized)}; path=/; max-age=${ATTRIBUTION_TTL_DAYS * 24 * 60 * 60}; samesite=lax${secure}`
}

function readLocalStorage() {
  try {
    return window.localStorage?.getItem(ATTRIBUTION_STORAGE_KEY) ?? null
  } catch {
    return null
  }
}

function readCookie() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${ATTRIBUTION_COOKIE_NAME}=([^;]*)`))
  if (!match?.[1]) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return null
  }
}

function readCookieValue(name: string) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`))
  if (!match?.[1]) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return null
  }
}

function currentFbclid() {
  try {
    return new URL(window.location.href).searchParams.get('fbclid')
  } catch {
    return null
  }
}

/**
 * Resolve the `fb.<subdomainIndex>.<clickTimeMs>.<fbclid>` value Meta expects.
 *
 * The Pixel writes `_fbc` with the true click time, so it wins whenever it holds
 * the same click ID we captured. It must NOT win when it holds a different one:
 * that cookie is a leftover from an earlier visit, and the click we captured this
 * time is the one that brought the booking in. The Pixel only writes `_fbc` when
 * it loads on a URL still carrying `fbclid`, which the consent banner routinely
 * prevents, so the reconstructed value is the normal path rather than the edge case.
 */
function resolveFbc(fbclid: string | null | undefined, fbclidCapturedAt: string | undefined) {
  const captured = sanitizeSignal(fbclid, 500)
  const cookie = parseFbcCookie(readCookieValue(FBC_COOKIE_NAME))

  if (captured) {
    if (cookie?.fbclid === captured) return cookie.value
    // Subdomain index 1 matches where the Pixel sets `_fbc` for this site: the
    // registrable domain the-anchor.pub, one level below the public suffix.
    return `fb.1.${resolveClickTimeMs(fbclidCapturedAt)}.${captured}`
  }

  if (cookie && Date.now() - cookie.createdAt <= FBC_MAX_AGE_MS) return cookie.value
  return undefined
}

function parseFbcCookie(value: string | null) {
  const trimmed = value?.trim()
  if (!trimmed) return null

  const match = trimmed.match(/^fb\.\d+\.(\d+)\.(.+)$/)
  if (!match) return null

  const createdAt = Number(match[1])
  if (!Number.isFinite(createdAt) || createdAt <= 0) return null

  return { value: trimmed, createdAt, fbclid: match[2] }
}

function resolveClickTimeMs(fbclidCapturedAt: string | undefined) {
  const parsed = fbclidCapturedAt ? Date.parse(fbclidCapturedAt) : Number.NaN
  return Number.isFinite(parsed) ? parsed : Date.now()
}

function sanitizeSignal(value: string | null | undefined, max: number) {
  const trimmed = value?.trim()
  return trimmed ? trimmed.slice(0, max) : undefined
}

function storedToPayload(stored: StoredBookingAttribution): BookingAttributionPayload {
  const latest = stored.latest.params
  return removeUndefined({
    source_url: stored.first.sourceUrl,
    landing_path: stored.first.landingPath,
    utm_source: latest.utm_source,
    utm_medium: latest.utm_medium,
    utm_campaign: latest.utm_campaign,
    utm_content: latest.utm_content,
    utm_term: latest.utm_term,
    fbclid: latest.fbclid,
    gclid: latest.gclid,
    short_code: latest.short_code,
    attribution_captured_at: stored.first.capturedAt,
    attribution_updated_at: stored.latest.capturedAt,
    fbclid_captured_at: latest.fbclid ? stored.fbclidCapturedAt ?? stored.latest.capturedAt : undefined,
  })
}

function removeUndefined<T extends Record<string, unknown>>(input: T): T {
  const output = { ...input }
  for (const key of Object.keys(output) as Array<keyof T>) {
    if (output[key] === undefined) delete output[key]
  }
  return output
}

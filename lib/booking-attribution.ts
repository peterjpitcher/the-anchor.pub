const ATTRIBUTION_STORAGE_KEY = 'anchor-booking-attribution'
const ATTRIBUTION_COOKIE_NAME = 'anchor-booking-attribution'
const ATTRIBUTION_TTL_DAYS = 90
const ATTRIBUTION_TTL_MS = ATTRIBUTION_TTL_DAYS * 24 * 60 * 60 * 1000

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
}

export function captureBookingAttributionFromLocation(now = new Date()): BookingAttributionPayload {
  if (typeof window === 'undefined') return {}

  const current = readAttributionFromUrl(window.location.href, now)
  const existing = readStoredAttribution(now)

  if (!current) {
    return existing ? storedToPayload(existing) : {}
  }

  const stored: StoredBookingAttribution = {
    first: existing?.first ?? current,
    latest: current,
    expiresAt: new Date(now.getTime() + ATTRIBUTION_TTL_MS).toISOString(),
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

  if (Object.keys(params).length === 0) return null

  return {
    sourceUrl: sanitizedUrl.toString(),
    landingPath: url.pathname || '/',
    capturedAt: now.toISOString(),
    params,
  }
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
  })
}

function removeUndefined<T extends Record<string, string | undefined>>(input: T): T {
  const output = { ...input }
  for (const key of Object.keys(output) as Array<keyof T>) {
    if (output[key] === undefined) delete output[key]
  }
  return output
}

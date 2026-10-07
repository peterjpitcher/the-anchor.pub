/**
 * What the site records about page speed, and nothing else.
 *
 * Shared by the browser (app/web-vitals.tsx, which builds the report) and the
 * server (app/api/web-vitals/route.ts, which checks it again and writes one log
 * line). The privacy notice, section 5, lists what is recorded: the page
 * address, the screen size class, the timings, and which part of the page moved.
 * Add a field here and it has to be named there first.
 *
 * Deliberately absent: IP address, user agent, referrer, query string, any
 * visitor, session or metric id, and the screen's width in pixels.
 */

export const RECORDED_METRICS = ['CLS', 'LCP', 'INP'] as const
export type RecordedMetric = (typeof RECORDED_METRICS)[number]

export const SIZE_CLASSES = ['phone', 'tablet', 'desktop'] as const
export type SizeClass = (typeof SIZE_CLASSES)[number]

export const RATINGS = ['good', 'needs-improvement', 'poor'] as const
export type Rating = (typeof RATINGS)[number]

/** Fixed start of every line, so `vercel logs` output can be filtered on it. */
export const WEB_VITAL_LOG_PREFIX = '[web-vital]'

export const MAX_BODY_BYTES = 1024
const MAX_PATH_LENGTH = 200
const MAX_SELECTOR_LENGTH = 120

// A layout shift score has no fixed ceiling but a real one is well under 10.
// The timings are milliseconds; ten minutes is far past anything worth keeping.
const MAX_VALUE: Record<RecordedMetric, number> = { CLS: 100, LCP: 600_000, INP: 600_000 }
const MAX_MOVE_PX = 100_000

export interface WebVitalReport {
  name: RecordedMetric
  value: number
  rating: Rating
  path: string
  size: SizeClass
  /** CLS only: a short selector for the element that moved furthest. */
  moved?: string
  /** CLS only: how far it moved across and down, in pixels. */
  dx?: number
  dy?: number
}

const ALLOWED_KEYS = new Set(['name', 'value', 'rating', 'path', 'size', 'moved', 'dx', 'dy'])

export function isRecordedMetric(name: unknown): name is RecordedMetric {
  return typeof name === 'string' && (RECORDED_METRICS as readonly string[]).includes(name)
}

/** Tailwind's md (768px) and lg (1024px) breakpoints, the ones the layouts turn on. */
export function sizeClassForWidth(width: number): SizeClass {
  if (width < 768) return 'phone'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// Pages whose last segment is a booking reference. A reference identifies a
// person, so it never leaves the browser and is never logged.
const REFERENCE_ROUTES = ['/parking/bookings/', '/heathrow-parking/confirmation/']

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const LONG_NUMBER = /^\d{6,}$/
const LONG_HEX = /^[0-9a-f]{16,}$/i
// A long run with no hyphens that mixes letters and digits reads as a token,
// not as a slug: slugs here are hyphenated words.
const TOKEN = /^(?=.*\d)(?=.*[a-z])[a-z0-9_]{20,}$/i

function looksLikeAnId(segment: string): boolean {
  return UUID.test(segment) || LONG_NUMBER.test(segment) || LONG_HEX.test(segment) || TOKEN.test(segment)
}

const SAFE_PATH = /^\/[A-Za-z0-9\-._/[\]]*$/

/**
 * The page path as it may be recorded: no query string, no fragment, and any
 * segment that is or looks like a reference replaced with "[id]". Returns null
 * for anything that is not a plain site path, so an odd address (a mistyped
 * link with an email address in it, say) is dropped rather than stored.
 */
export function recordablePath(pathname: unknown): string | null {
  if (typeof pathname !== 'string') return null

  let path = pathname.split(/[?#]/)[0]
  if (path.length === 0 || path.length > MAX_PATH_LENGTH || !SAFE_PATH.test(path)) return null

  for (const route of REFERENCE_ROUTES) {
    if (path.startsWith(route) && path.length > route.length) path = `${route}[id]`
  }

  return path
    .split('/')
    .map(segment => (looksLikeAnId(segment) ? '[id]' : segment))
    .join('/')
}

function roundValue(name: RecordedMetric, value: number): number {
  // CLS is a small unitless score; the other two are milliseconds.
  return name === 'CLS' ? Math.round(value * 10_000) / 10_000 : Math.round(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

// Printable ASCII only: a selector is tag names, ids and class names.
const SAFE_SELECTOR = /^[\x20-\x7E]+$/

/**
 * Checks a report from the browser. Strict on purpose: an unknown key, a metric
 * we do not record, a number that is not finite or a string that is too long
 * all return null, and the caller answers 400 and logs nothing.
 */
export function parseWebVitalReport(input: unknown): WebVitalReport | null {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return null

  const body = input as Record<string, unknown>
  if (Object.keys(body).some(key => !ALLOWED_KEYS.has(key))) return null

  const { name, value, rating, path, size, moved, dx, dy } = body

  if (!isRecordedMetric(name)) return null
  if (!isFiniteNumber(value) || value < 0 || value > MAX_VALUE[name]) return null
  if (typeof rating !== 'string' || !(RATINGS as readonly string[]).includes(rating)) return null
  if (typeof size !== 'string' || !(SIZE_CLASSES as readonly string[]).includes(size)) return null

  // The browser sends the path already cleaned. One that changes when cleaned
  // again came from somewhere else.
  const cleanPath = recordablePath(path)
  if (cleanPath === null || cleanPath !== path) return null

  const report: WebVitalReport = {
    name,
    value: roundValue(name, value),
    rating: rating as Rating,
    path: cleanPath,
    size: size as SizeClass,
  }

  const hasMove = moved !== undefined || dx !== undefined || dy !== undefined
  if (!hasMove) return report
  if (name !== 'CLS') return null

  if (typeof moved !== 'string' || moved.length === 0 || moved.length > MAX_SELECTOR_LENGTH) return null
  if (!SAFE_SELECTOR.test(moved) || moved.trim() !== moved) return null
  report.moved = moved

  // The distance is optional, but it is both numbers or neither.
  if (dx === undefined && dy === undefined) return report
  if (!isFiniteNumber(dx) || !isFiniteNumber(dy)) return null
  if (Math.abs(dx) > MAX_MOVE_PX || Math.abs(dy) > MAX_MOVE_PX) return null
  report.dx = Math.round(dx)
  report.dy = Math.round(dy)

  return report
}

/**
 * The one line written per request: the prefix, a space, compact JSON. Keys are
 * written in a fixed order and one that has no value is left out, never written
 * empty.
 */
export function formatWebVitalLine(report: WebVitalReport): string {
  const record: Record<string, string | number> = {
    metric: report.name,
    value: report.value,
    rating: report.rating,
    path: report.path,
    size: report.size,
  }
  if (report.moved !== undefined) record.moved = report.moved
  if (report.dx !== undefined && report.dy !== undefined) {
    record.dx = report.dx
    record.dy = report.dy
  }
  return `${WEB_VITAL_LOG_PREFIX} ${JSON.stringify(record)}`
}

interface Rect {
  x: number
  y: number
}

/** The parts of a web-vitals metric this file reads. `attribution` is CLS's. */
export interface ReportedMetric {
  name: string
  value: number
  rating: string
  attribution?: {
    largestShiftTarget?: string
    largestShiftSource?: { previousRect?: Rect; currentRect?: Rect }
  }
}

export interface PageContext {
  /** The page the visitor is on now. */
  pathname: string
  /** The page this visit loaded first. LCP belongs to that page, wherever they are now. */
  landingPathname: string
  /** The window's width in pixels. Turned into a size class here and not sent. */
  width: number
}

/**
 * Builds what the browser sends, or null when there is nothing to send: a
 * metric we do not record, or a page address that cannot be recorded safely.
 */
export function buildWebVitalReport(metric: ReportedMetric, page: PageContext): WebVitalReport | null {
  if (!isRecordedMetric(metric.name)) return null

  const path = recordablePath(metric.name === 'LCP' ? page.landingPathname : page.pathname)
  if (path === null) return null

  const candidate: Record<string, unknown> = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    path,
    size: sizeClassForWidth(page.width),
  }

  if (metric.name === 'CLS') {
    const target = metric.attribution?.largestShiftTarget
    if (typeof target === 'string' && target.length > 0 && SAFE_SELECTOR.test(target)) {
      const selector = target.slice(0, MAX_SELECTOR_LENGTH).trim()
      if (selector.length > 0) candidate.moved = selector
    }

    if (candidate.moved !== undefined) {
      const from = metric.attribution?.largestShiftSource?.previousRect
      const to = metric.attribution?.largestShiftSource?.currentRect
      if (from && to && isFiniteNumber(to.x - from.x) && isFiniteNumber(to.y - from.y)) {
        candidate.dx = Math.round(to.x - from.x)
        candidate.dy = Math.round(to.y - from.y)
      }
    }
  }

  // Through the same check the server runs, so the browser never sends a report
  // the server would turn away.
  return parseWebVitalReport(candidate)
}

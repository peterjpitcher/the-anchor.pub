import { nowInLondonComponents } from './time-london'

export interface SeasonalImage {
  src: string
  season: 'winter' | 'spring' | 'summer' | 'autumn' | 'halloween' | 'remembrance' | 'christmas'
  fallback: string
  objectPosition?: string
}

/**
 * Determines the current season based on London date and returns appropriate image path
 * Date ranges:
 * - Winter: Jan 1 - Feb 28/29
 * - Spring: Mar 1 - May 31
 * - Summer: Jun 1 - Aug 31
 * - Autumn: Sep 1 - Sep 30
 * - Halloween: Oct 1 - Oct 31
 * - Remembrance: Nov 1 - Nov 11
 * - Christmas: Nov 12 - Dec 31
 */
export function getSeasonalHomepageImage(testDate?: Date): SeasonalImage {
  const seasonalLoggingEnabled = process.env.SEASONAL_IMAGE_LOGS === 'true' || process.env.API_DEBUG_LOGS === 'true'
  const defaultImage = '/images/page-headers/home/page-headers-homepage.jpg'

  // Development override (no NODE_ENV check so it works in preview deployments)
  const forced = process.env.NEXT_PUBLIC_FORCE_SEASON as SeasonalImage['season'] | undefined
  if (forced) {
    if (seasonalLoggingEnabled) {
      console.log(`[Seasonal Image] Forced season: ${forced}`)
    }
    return {
      src: `/images/page-headers/home/seasonal/${forced}/page-headers-homepage.jpg`,
      season: forced,
      fallback: defaultImage
    }
  }

  const date = testDate ?? new Date()
  const { month, day } = nowInLondonComponents(date)

  let season: SeasonalImage['season']
  let imagePath: string

  if (month === 1 || month === 2) {
    // Winter: January 1 - February 28/29
    season = 'winter'
  } else if (month >= 3 && month <= 5) {
    // Spring: March 1 - May 31
    season = 'spring'
  } else if (month >= 6 && month <= 8) {
    // Summer: June 1 - August 31
    season = 'summer'
  } else if (month === 9) {
    // Autumn: September 1 - September 30
    season = 'autumn'
  } else if (month === 10) {
    // Halloween: October 1 - October 31
    season = 'halloween'
  } else if (month === 11 && day >= 1 && day <= 11) {
    // Remembrance: November 1 - November 11
    season = 'remembrance'
  } else {
    // Christmas: November 12 - December 31
    season = 'christmas'
  }

  // Remembrance reuses the autumn asset while swapping hero copy
  const imageSeason = season === 'remembrance' ? 'autumn' : season
  imagePath = `/images/page-headers/home/seasonal/${imageSeason}/page-headers-homepage.jpg`

  if (!validateSeasonalImage(imagePath)) {
    if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
      console.warn(`[Seasonal Image] Falling back to default header image. Missing asset at ${imagePath}`)
    }
    return { src: defaultImage, season, fallback: defaultImage }
  }

  // Log which seasonal image is being serving (server-side only, in development)
  if (typeof window === 'undefined' && seasonalLoggingEnabled) {
    console.log(`[Seasonal Image] Serving ${season} image: ${imagePath}`)
  }

  return { src: imagePath, season, fallback: defaultImage }
}

/**
 * Get seasonal greeting message for the hero section
 */
export function getSeasonalGreeting(season: SeasonalImage['season']): string {
  const greetings = {
    winter: "Welcome to The Anchor – Settle in for winter warmth and great company.",
    spring: "Welcome to The Anchor – Fresh blooms and cheerful catch-ups await.",
    summer: "Welcome to The Anchor – Sun-soaked tables and easygoing smiles.",
    autumn: "Welcome to The Anchor – Cozy corners and comforting flavours.",
    halloween: "Welcome to The Anchor – Gather close for spooktacular stories.",
    remembrance: "We Remember Together at The Anchor – With warm gratitude.",
    christmas: "Welcome to The Anchor – Festive warmth and cheer await."
  }

  return greetings[season] || "Welcome to The Anchor"
}

/**
 * Get seasonal alt text for better accessibility
 */
export function getSeasonalAltText(season: SeasonalImage['season']): string {
  const altTexts = {
    winter: "The Anchor pub in Stanwell Moor dressed for the winter season.",
    spring: "The Anchor pub garden bursting with fresh spring colour.",
    summer: "The Anchor pub beer garden enjoying gentle summer sunshine.",
    autumn: "The Anchor pub surrounded by rich autumn colour.",
    halloween: "The Anchor pub softly lit with welcoming Halloween decorations.",
    remembrance: "The Anchor pub adorned with a respectful remembrance poppy tribute.",
    christmas: "The Anchor pub twinkling with festive Christmas decorations."
  }

  return altTexts[season] || "The Anchor pub in Stanwell Moor"
}

/**
 * Focal point configuration for responsive image positioning
 */
export type Focal = {
  x: number      // Horizontal position (0-100)
  yMobile: number  // Vertical position for mobile (0-100)
  yDesktop: number // Vertical position for desktop (0-100)
}

/**
 * Get responsive focal points for each seasonal image
 * Addresses "visual centre ≠ geometric centre" issue
 * Most hero images need to be lifted up (30-40%) to appear centered
 */
export function getSeasonalFocal(season: SeasonalImage['season']): Focal {
  // VERY aggressive lift - images need to show their upper portion
  const defaults: Record<string, Focal> = {
    // Centered by default to ensure hero image vertical alignment is middle
    winter: { x: 50, yMobile: 50, yDesktop: 50 },
    spring: { x: 50, yMobile: 50, yDesktop: 50 },
    summer: { x: 50, yMobile: 50, yDesktop: 50 },
    autumn: { x: 50, yMobile: 50, yDesktop: 50 },
    halloween: { x: 50, yMobile: 50, yDesktop: 50 },
    remembrance: { x: 50, yMobile: 50, yDesktop: 50 },
    christmas: { x: 50, yMobile: 50, yDesktop: 50 }
  }

  return defaults[season] ?? { x: 50, yMobile: 15, yDesktop: 10 }
}

/**
 * @deprecated Use getSeasonalFocal() instead for responsive positioning
 */
export function getSeasonalObjectPosition(season: SeasonalImage['season']): string {
  const focal = getSeasonalFocal(season)
  return `${focal.x}% ${focal.yMobile}%`
}

/* -------------------------------------------------------------------------- */
/* A11 dynamic-field system (seasonal occasion pages)                         */
/* -------------------------------------------------------------------------- */

/**
 * A11 dynamic fields for a seasonal occasion page.
 *
 * Every field is optional. The seasonal page templates render a complete,
 * evergreen page when ALL of these are unset, the dynamic block simply does
 * not appear. Set one or more for an annual update (e.g. confirm this year's
 * Halloween theme, the NYE DJ, or a one-off special menu) without a code change
 * to the page body.
 *
 * NEVER invent values for these. Only populate a field when the detail is
 * confirmed by the owner or returned by the management API. An empty string is
 * treated the same as unset, so a blank value is always safe.
 */
export interface SeasonalDynamicFields {
  /** Human-readable occasion date, e.g. "Sunday 4 April 2027". */
  occasionDate?: string
  /** Food service window, e.g. "1pm to 6pm". */
  foodServiceTimes?: string
  /** Event start time, e.g. "8pm". */
  eventStartTime?: string
  /** Event end time, e.g. "1am". */
  eventEndTime?: string
  /** Booking status note, e.g. "Booking recommended" or "Now taking bookings". */
  bookingStatus?: string
  /** Ticket status note, e.g. "Free entry" or "Tickets on sale". */
  ticketStatus?: string
  /** Annual theme (Halloween fancy-dress theme changes yearly). */
  annualTheme?: string
  /** Performer, DJ or entertainment name. */
  performer?: string
  /** Special menu note (link to /food-menu in copy, never a hardcoded price). */
  specialMenu?: string
  /** Special offer note. */
  specialOffer?: string
  /** Pricing note. NEVER a hardcoded food/drink price, use "live on our menu". */
  pricing?: string
  /** Override the call-to-action label. */
  ctaLabel?: string
  /** Override the call-to-action destination (path or absolute URL). */
  ctaDestination?: string
}

/** A single resolved dynamic detail, ready to render as a labelled row. */
export interface SeasonalDetailRow {
  label: string
  value: string
}

/**
 * Resolved A11 fields. `details` is the ordered list of labelled rows that have
 * a confirmed value; `hasDetails` is a convenience flag for templates so they
 * can decide whether to render the dynamic block at all. CTA overrides are
 * surfaced separately because they change a button rather than add a row.
 */
export interface ResolvedSeasonalFields {
  details: SeasonalDetailRow[]
  hasDetails: boolean
  ctaLabel?: string
  ctaDestination?: string
}

function cleanField(value?: string): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * Normalises raw A11 fields into an ordered, render-ready structure.
 *
 * Blank / whitespace-only / undefined values are dropped, so a page given an
 * empty object (or no object) resolves to `{ details: [], hasDetails: false }`
 * and renders its evergreen base only. The field order here is the display
 * order in the dynamic block.
 */
export function resolveSeasonalFields(fields: SeasonalDynamicFields = {}): ResolvedSeasonalFields {
  const orderedRows: Array<[string, string | undefined]> = [
    ['Date', cleanField(fields.occasionDate)],
    ['Annual theme', cleanField(fields.annualTheme)],
    ['Entertainment', cleanField(fields.performer)],
    ['Event time', resolveEventTimeRange(fields)],
    ['Food service', cleanField(fields.foodServiceTimes)],
    ['Special menu', cleanField(fields.specialMenu)],
    ['Special offer', cleanField(fields.specialOffer)],
    ['Pricing', cleanField(fields.pricing)],
    ['Booking', cleanField(fields.bookingStatus)],
    ['Tickets', cleanField(fields.ticketStatus)]
  ]

  const details: SeasonalDetailRow[] = orderedRows
    .filter((row): row is [string, string] => Boolean(row[1]))
    .map(([label, value]) => ({ label, value }))

  return {
    details,
    hasDetails: details.length > 0,
    ctaLabel: cleanField(fields.ctaLabel),
    ctaDestination: cleanField(fields.ctaDestination)
  }
}

/** Combines start/end times into a single "8pm to 1am" / "from 8pm" string. */
function resolveEventTimeRange(fields: SeasonalDynamicFields): string | undefined {
  const start = cleanField(fields.eventStartTime)
  const end = cleanField(fields.eventEndTime)
  if (start && end) return `${start} to ${end}`
  if (start) return `From ${start}`
  if (end) return `Until ${end}`
  return undefined
}

/**
 * Server-side only: Validates if seasonal image exists
 * Use this in development to verify all seasonal images are present
 */
export function validateSeasonalImage(imagePath: string): boolean {
  // In production, correctly resolving the filesystem path to public assets 
  // can be unreliable in serverless/containerized environments.
  // We assume the assets exist if they are in the codebase.
  if (process.env.NODE_ENV === 'production') {
    return true
  }

  if (typeof window !== 'undefined') {
    // Client-side, assume image exists
    return true
  }

  try {
    const fs = require('fs')
    const path = require('path')
    const normalizedPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
    const publicPath = path.join(process.cwd(), 'public', normalizedPath)
    const exists = fs.existsSync(publicPath)

    if (!exists) {
      console.warn(`[Seasonal Image] Missing file at ${publicPath}`)
    }

    return exists
  } catch (error) {
    console.warn('[Seasonal Image] Failed to validate image path', error)
    return false
  }
}

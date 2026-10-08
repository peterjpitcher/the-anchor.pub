import { GROUP_DEPOSIT_WORDING } from './approved-wording'

export const CONTACT = {
  // Display formats
  phone: '01753 682707',
  phoneDisplay: '+44 1753 682707',
  phoneHref: 'tel:+441753682707',
  phoneIntl: '+441753682707',
  email: 'manager@the-anchor.pub',

  // Address
  address: {
    street: 'Horton Road',
    town: 'Stanwell Moor',
    county: 'Surrey',
    postcode: 'TW19 6AQ',
    country: 'GB'
  },

  // Coordinates (verified from Google Maps)
  coordinates: {
    lat: 51.462509,
    lng: -0.502067
  }
}

export const BRAND = {
  // Primary name - always use this
  name: 'The Anchor',

  // With location context when needed
  nameWithLocation: 'The Anchor, Stanwell Moor',

  // Never use "The Anchor Pub" - avoid the word "Pub" in brand name
  // This helps with SEO and brand consistency
}

/**
 * Free guest parking. The number is docs/SSOT.md section 8 and SSOT.json
 * venue.parking.free_spaces. For a sentence, use PARKING_WORDING from
 * lib/approved-wording.ts: never "around 20", "large" or "guaranteed".
 */
export const PARKING = {
  capacity: 20, // 20 spaces for pub guests
  description: 'Free parking available',
  extendedDescription: 'Free on-site parking with extended parking available nearby'
}

/*
 * Getting here. One home for every journey figure the site states.
 *
 * Each value is docs/SSOT.md section 2 and its mirror in SSOT.json;
 * tests/one-home-for-facts-guard.test.ts fails if this file and SSOT.json
 * disagree, and fails if a page types one of these figures instead of reading
 * it from here. To change a figure: change the SSOT, then this file, once.
 *
 * Only what the SSOT holds is here. There is no figure for Windsor, Ashford,
 * Feltham, Egham, Sunbury, Horton, Wraysbury, Colnbrook or Longford, no walk
 * time from a hotel or a village, and no distance for Terminals 2 and 4, so
 * pages say "a short drive" and give no number.
 */

/** Minutes by car to each terminal, traffic dependent. */
export const HEATHROW_TIMES = {
  terminal2: 11,
  terminal3: 11,
  terminal4: 12,
  terminal5: 7,

  // For general statements about "any terminal"
  range: '7-12 minutes',
  rangeWords: '7 to 12 minutes'
}

/** Road distance, for the two terminals the SSOT gives one for. */
export const HEATHROW_DISTANCES = {
  terminal3: '5.3 miles',
  terminal5: '3.8 miles'
}

/** Minutes by car from the two other places the SSOT gives a figure for. */
export const DRIVE_TIMES = {
  m25Junction14: 2,
  staines: 8
}

/**
 * The bus. Only the 442 stops by the pub, and it runs from Terminal 5. The 441
 * and the 555 do not come to Stanwell Moor. Never a fare, a frequency, a
 * journey time or a last bus time (SSOT sections 2, 14 and 17).
 */
export const BUS = {
  route: '442',
  boardsAt: 'Heathrow Terminal 5',
  stop: 'Horton Road, by the pub'
}

/** The one bus sentence. Use it wherever a page mentions the bus. */
export const BUS_WORDING = `The ${BUS.route} bus stops on Horton Road by the pub and runs from ${BUS.boardsAt}.`

/** The terminal times as one clause, for an answer or a description. */
export const HEATHROW_TIMES_WORDING = `${HEATHROW_TIMES.terminal5} minutes from Terminal 5, ${HEATHROW_TIMES.terminal2} minutes from Terminals 2 and 3, and ${HEATHROW_TIMES.terminal4} minutes from Terminal 4 by car`

/** Schema.org price band, SSOT.json venue.price_range. */
export const PRICE_RANGE = '££'

/**
 * The pub's address and map position as structured data. Every JSON-LD block
 * that describes The Anchor spreads these: none types a street, a town or a
 * latitude of its own (three pages once carried coordinates a mile away).
 */
export const POSTAL_ADDRESS_SCHEMA = {
  '@type': 'PostalAddress',
  streetAddress: CONTACT.address.street,
  addressLocality: CONTACT.address.town,
  addressRegion: CONTACT.address.county,
  postalCode: CONTACT.address.postcode,
  addressCountry: CONTACT.address.country
} as const

export const GEO_COORDINATES_SCHEMA = {
  '@type': 'GeoCoordinates',
  latitude: CONTACT.coordinates.lat,
  longitude: CONTACT.coordinates.lng
} as const

/**
 * Crematoria and cemeteries the SSOT gives a drive time for (section 11,
 * "Nearby venues for wakes"). No other landmark has one, so no other landmark
 * page states one. Keyed by the slug used in lib/local-seo-data.ts.
 */
export const WAKE_VENUE_DRIVE_MINUTES: Record<string, number> = {
  'south-west-middlesex-crematorium': 10,
  'staines-cemetery': 8,
  'slough-crematorium': 15
}

// Large-group deposit policy: applies to groups at or above the threshold,
// regardless of booking type. The website does NOT have a state-aware
// `getCanonicalDeposit` helper, that lives only in the management app
// (it owns the booking row in the database). The website trusts the
// management API's response after booking creation. See spec §7.3.
export const LARGE_GROUP_DEPOSIT_PER_PERSON_GBP = 10
export const LARGE_GROUP_DEPOSIT_THRESHOLD = 15

export function requiresDeposit(partySize: number): boolean {
  return partySize >= LARGE_GROUP_DEPOSIT_THRESHOLD
}

export function computeLargeGroupDepositAmount(partySize: number): number {
  if (!requiresDeposit(partySize)) return 0
  const parsedPartySize = Number.isFinite(partySize) ? Math.floor(partySize) : 0
  const normalizedPartySize = Math.max(0, parsedPartySize)
  return Number((normalizedPartySize * LARGE_GROUP_DEPOSIT_PER_PERSON_GBP).toFixed(2))
}

// The approved sentence, SSOT section 16. It lives in lib/approved-wording.ts.
export const LARGE_GROUP_DEPOSIT_POLICY_COPY = GROUP_DEPOSIT_WORDING

// Staff pay, SSOT section 2: both jobs, bar staff and kitchen team, are open at
// this rate "for now" (owner-confirmed, 7 October 2026). The one home for the
// rate: the recruitment pages and their JobPosting data read it from here.
export const STAFF_HOURLY_RATE_GBP = 12.71
export const STAFF_PAY_WORDING = `£${STAFF_HOURLY_RATE_GBP.toFixed(2)} per hour base rate`

// Walk-in launch banner timestamps (BST). Used by <LaunchAnnouncement>.
// - STARTS_AT: start of 17 May 2026 BST (banner switches from pre-launch
//   "starts on 17 May" copy to launch-day "today from 1pm" copy)
// - BANNER_ENDS_AT: 18:00 BST on 17 May 2026 (matches the actual end of
//   Sunday service, not the last-bookable-slot 17:30; banner removes itself
//   at this point and replacement content is designed collaboratively after)
export const WALK_IN_LAUNCH_STARTS_AT_MS = new Date('2026-05-17T00:00:00+01:00').getTime()
export const WALK_IN_LAUNCH_BANNER_ENDS_AT_MS = new Date('2026-05-17T18:00:00+01:00').getTime()

/** Convenience alias, use this in components instead of CONTACT.phone */
export const PHONE_NUMBER = CONTACT.phone

/**
 * Turn-by-turn directions to the pub.
 *
 * Built from coordinates rather than a name search on purpose: "The Anchor"
 * searched from a phone in Staines resolves to a different pub.
 *
 * Two copies of this string had already grown independently, in
 * components/FindUsSection.tsx and in the event booking form. Two copies of a
 * destination is how a destination drifts, so it lives here beside the
 * coordinates it is built from.
 */
export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${CONTACT.coordinates.lat},${CONTACT.coordinates.lng}`

/**
 * Where every "leave a review" ask on the site must point.
 *
 * Owner rule (23 September 2026): review requests only ever go to the feedback
 * page on the management app. It asks how the visit went and sends happy
 * visitors on to Google itself, so the site must never link straight to a
 * Google write-review URL.
 *
 * This replaced `https://g.page/r/CQz1W5fqSTqPEAI/review`, which had been the
 * `/leave-review` destination since August 2025 and encoded the wrong Google
 * CID entirely (10320642767983473932, not The Anchor's 17928230944823812473).
 * Google bounced it to its own homepage, so every review ask on the site was
 * dead for thirteen months.
 */
export const REVIEW_REQUEST_URL = 'https://l.the-anchor.pub/feedback'

/**
 * Where "read our reviews" links point. Reading is not requesting, so this one
 * does go to Google.
 *
 * Built from the CID rather than a vanity short link: `g.page/theanchorpubsm`
 * died at some point and started resolving to a Google search results page for
 * the literal string "theanchorpubsm". The CID matches Place ID
 * ChIJDcbcERJxdkgReaFjdQ7fzfg.
 */
export const GOOGLE_REVIEWS_URL = 'https://www.google.com/maps?cid=17928230944823812473'

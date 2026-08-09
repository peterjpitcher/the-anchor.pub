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

export const PARKING = {
  // Verified capacity from Find Us page
  capacity: 20, // 20 spaces available for pub guests
  description: 'Free parking available',
  extendedDescription: 'Free on-site parking with extended parking available nearby'
}

export const HEATHROW_TIMES = {
  // Consistent journey times to each terminal
  terminal2: 11,
  terminal3: 11,
  terminal4: 12,
  terminal5: 7,

  // For general statements
  range: '7-12 minutes'
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

export const LARGE_GROUP_DEPOSIT_POLICY_COPY =
  "Groups of 15 or more: we'll take a £10 per person deposit, fully deducted from your bill on the day."

// Walk-in launch banner timestamps (BST). Used by <LaunchAnnouncement>.
// - STARTS_AT: start of 17 May 2026 BST (banner switches from pre-launch
//   "starts on 17 May" copy to launch-day "today from 1pm" copy)
// - BANNER_ENDS_AT: 18:00 BST on 17 May 2026 (matches the actual end of
//   Sunday service, not the last-bookable-slot 17:30; banner removes itself
//   at this point and replacement content is designed collaboratively after)
export const WALK_IN_LAUNCH_STARTS_AT_MS = new Date('2026-05-17T00:00:00+01:00').getTime()
export const WALK_IN_LAUNCH_BANNER_ENDS_AT_MS = new Date('2026-05-17T18:00:00+01:00').getTime()

/** Convenience alias — use this in components instead of CONTACT.phone */
export const PHONE_NUMBER = CONTACT.phone

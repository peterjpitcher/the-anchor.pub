import {
  LARGE_GROUP_DEPOSIT_PER_PERSON_GBP,
  LARGE_GROUP_DEPOSIT_THRESHOLD,
  WALK_IN_LAUNCH_STARTS_AT_MS
} from '@/lib/constants'

export const SUNDAY_ROAST = {
  launchDateLabel: 'Sunday 17 May 2026',
  launchDateIso: '2026-05-17',
  serviceDay: 'Sundays',
  serviceStart: '1pm',
  serviceEnd: '6pm',
  lastBooking: '5:30pm',
  fromPriceLabel: 'from £19',
  bookingHref: '/book-table?source=sunday_lunch&bookingType=sunday_roast',
  menuHref: '/sunday-lunch',
  largePartyThreshold: LARGE_GROUP_DEPOSIT_THRESHOLD,
  largePartyDepositLabel: `£${LARGE_GROUP_DEPOSIT_PER_PERSON_GBP} per person`
} as const

export type SundayRoastStatus = 'pre-launch' | 'live'

export type SundayRoastContent = {
  status: SundayRoastStatus
  isLive: boolean
  availabilityShort: string
  availabilityLong: string
  heroLead: string
  bookingCta: string
  depositCopy: string
  smallPartyCopy: string
}

export function getSundayRoastStatus(now: Date = new Date()): SundayRoastStatus {
  return now.getTime() >= WALK_IN_LAUNCH_STARTS_AT_MS ? 'live' : 'pre-launch'
}

export function getSundayRoastContent(now: Date = new Date()): SundayRoastContent {
  const status = getSundayRoastStatus(now)
  const isLive = status === 'live'
  const depositCopy = `Groups of ${SUNDAY_ROAST.largePartyThreshold} or more need a ${SUNDAY_ROAST.largePartyDepositLabel} deposit, deducted from the bill.`

  if (!isLive) {
    return {
      status,
      isLive,
      availabilityShort: `Sunday roast starts ${SUNDAY_ROAST.launchDateLabel}.`,
      availabilityLong: `Sunday roast starts ${SUNDAY_ROAST.launchDateLabel}. Until then, our normal Sunday menu is available.`,
      heroLead: `Sunday roast starts ${SUNDAY_ROAST.launchDateLabel}. Book ahead for launch Sundays or join us for the normal Sunday menu until then.`,
      bookingCta: 'Book Sunday Roast',
      depositCopy,
      smallPartyCopy: 'No deposit for small tables.'
    }
  }

  return {
    status,
    isLive,
    availabilityShort: `Sunday roast served ${SUNDAY_ROAST.serviceDay.toLowerCase()}, ${SUNDAY_ROAST.serviceStart} to ${SUNDAY_ROAST.serviceEnd}.`,
    availabilityLong: `Sunday roast served ${SUNDAY_ROAST.serviceDay.toLowerCase()}, ${SUNDAY_ROAST.serviceStart} to ${SUNDAY_ROAST.serviceEnd}. Walk in or book ahead. ${depositCopy}`,
    heroLead: `Sunday roast ${SUNDAY_ROAST.fromPriceLabel} • Walk in or book ahead • Served ${SUNDAY_ROAST.serviceStart}-${SUNDAY_ROAST.serviceEnd}`,
    bookingCta: 'Book Sunday Roast',
    depositCopy,
    smallPartyCopy: 'No deposit for small tables.'
  }
}

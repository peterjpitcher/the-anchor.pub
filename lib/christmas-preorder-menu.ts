/**
 * The Christmas dish list, read from the booking period that actually governs
 * Christmas bookings.
 *
 * The page used to say "the full dish list is released closer to the time"
 * because it only ever read the `christmas` menu container, which holds the
 * course-tier PRICES and nothing else. The dishes themselves live on the
 * Christmas booking period (`booking_period_menu_items`) and are served by
 * `/table-bookings/periods`, which is the same source the booking form uses to
 * build a pre-order. Reading them here means the page and the booking form can
 * never show two different menus.
 *
 * Everything is best-effort: any failure returns null and the caller keeps its
 * existing "released closer to the time" copy. A Christmas page that renders
 * without a dish list is worse than one with it, but far better than one that
 * fails to render at all.
 */

import { anchorAPI } from '@/lib/api'
import type { BookingPeriodMenuItem } from '@/lib/api/bookings'
import { parseLondonDate } from '@/lib/time-london'
import {
  CHRISTMAS_MINIMUM_NOTICE_HOURS,
  CHRISTMAS_MINIMUM_PARTY_SIZE,
  CHRISTMAS_WINDOW_END,
  CHRISTMAS_WINDOW_START,
  getLondonIsoDate
} from '@/lib/christmas-season'

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

/** Monday, when the kitchen is closed and no Christmas sitting runs. */
const MONDAY = 1

export type ChristmasDishGroup = {
  /** Course key as the management app stores it: starter, main, dessert, addon. */
  course: string
  /** Guest-facing heading for the group. */
  title: string
  items: BookingPeriodMenuItem[]
}

export type ChristmasPreorderMenu = {
  /** Adult starters. */
  starters: BookingPeriodMenuItem[]
  /** Adult mains. */
  mains: BookingPeriodMenuItem[]
  /** Children's mains, split out because they are priced and portioned apart. */
  kidsMains: BookingPeriodMenuItem[]
  /** Desserts. */
  desserts: BookingPeriodMenuItem[]
  /** Paid extras such as the cheeseboard, which carry their own price. */
  addons: BookingPeriodMenuItem[]
  /** Every group that has at least one dish, in menu order. */
  groups: ChristmasDishGroup[]
  /** Total dish count across every course, used to decide whether to render. */
  dishCount: number
  /** Days before the booking date that choices are due. */
  preorderCutoffDays: number | null
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function shiftIsoDate(isoDate: string, days: number): string {
  const shifted = new Date(parseLondonDate(isoDate).getTime() + days * MILLISECONDS_PER_DAY)
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`
}

/**
 * A date inside the Christmas window that the period endpoint will answer for.
 *
 * The endpoint prices and gates per date, so it has to be asked about a real
 * bookable one: inside the window, clear of the notice rule, and not a Monday
 * when the kitchen is shut. The menu itself is the same on every date, so which
 * one we pick only decides whether we get an answer, never what it says.
 */
export function resolveChristmasMenuProbeDate(today: string = getLondonIsoDate()): string | null {
  const earliest = shiftIsoDate(today, Math.ceil(CHRISTMAS_MINIMUM_NOTICE_HOURS / 24) + 1)
  let candidate = earliest > CHRISTMAS_WINDOW_START ? earliest : CHRISTMAS_WINDOW_START

  // The window is six weeks, so this cannot run away; the bound is belt and braces.
  for (let attempt = 0; attempt < 8; attempt++) {
    if (candidate > CHRISTMAS_WINDOW_END) return null
    if (parseLondonDate(candidate).getUTCDay() !== MONDAY) return candidate
    candidate = shiftIsoDate(candidate, 1)
  }

  return null
}

function isKidsDish(item: BookingPeriodMenuItem): boolean {
  return /^kids?\b/i.test(item.name.trim())
}

function byCourse(items: BookingPeriodMenuItem[], course: string): BookingPeriodMenuItem[] {
  return items.filter((item) => (item.course || '').trim().toLowerCase() === course)
}

/**
 * The Christmas dish list, or null when it cannot be shown.
 *
 * Null covers every "do not show a menu" case the API defines: no period on the
 * date, a period that is not Christmas, a period the API has marked unbookable
 * because its menu is unpublished, and an empty dish list. The API's own
 * contract is that an unbookable period must never render a half-menu, so this
 * follows it rather than second-guessing it.
 */
export async function getChristmasPreorderMenu(): Promise<ChristmasPreorderMenu | null> {
  const probeDate = resolveChristmasMenuProbeDate()
  if (!probeDate) return null

  // Cached, not live: this is page copy, not a price quote at the point of
  // booking, and the page is revalidated hourly anyway.
  const response = await anchorAPI.getBookingPeriodCached(probeDate, CHRISTMAS_MINIMUM_PARTY_SIZE)
  const period = response?.period
  if (!period) return null

  // Guard the season as well as the flag: a future non-Christmas period sharing
  // these dates must not publish its dishes on the Christmas page.
  if ((period.period_kind || '').trim().toLowerCase() !== 'christmas') return null
  if (!period.bookable) return null

  const items = Array.isArray(period.menu) ? period.menu : []
  if (items.length === 0) return null

  const allMains = byCourse(items, 'main')
  const menu: ChristmasPreorderMenu = {
    starters: byCourse(items, 'starter'),
    mains: allMains.filter((item) => !isKidsDish(item)),
    kidsMains: allMains.filter(isKidsDish),
    desserts: byCourse(items, 'dessert'),
    addons: byCourse(items, 'addon'),
    groups: [],
    dishCount: items.length,
    preorderCutoffDays: period.preorder_cutoff_days
  }

  menu.groups = [
    { course: 'starter', title: 'Starters', items: menu.starters },
    { course: 'main', title: 'Mains', items: menu.mains },
    { course: 'dessert', title: 'Desserts', items: menu.desserts },
    { course: 'kids', title: "Children's Christmas dinner", items: menu.kidsMains },
    { course: 'addon', title: 'Add an extra course', items: menu.addons }
  ].filter((group) => group.items.length > 0)

  return menu
}

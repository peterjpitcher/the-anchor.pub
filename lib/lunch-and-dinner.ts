import type { MenuPageData, MenuPageItem } from '@/lib/menu-page-data'
import { getSharedKitchenWindows } from '@/lib/hours-utils'
import { formatTime12Hour } from '@/lib/time-utils'

/**
 * The /lunch-and-dinner landing page (weekday food campaign, September 2026).
 *
 * Only the choice of dishes and their photos is decided here. Every name and
 * price shown comes from the live menu, and every time from the live hours: a
 * dish the menu no longer lists is left out rather than shown from memory.
 */

export type DishImage = {
  src: string
  alt: string
}

type SingleDishPick = {
  kind?: 'dish'
  /** Exact dish name as the menu API serves it. */
  name: string
  /** Only match inside this section, for a name as generic as "Pepperoni". */
  section?: RegExp
  image?: DishImage
}

/**
 * A card for a whole menu section, priced "from" its cheapest live item. Used
 * for the pizzas: the owner's pizza photo matches no single pizza on the menu
 * (owner decision, 10 September 2026), so the card never names one.
 */
type SectionFromPick = {
  kind: 'sectionFrom'
  /** Card title, for example "Stone-baked pizzas". */
  title: string
  /** The section whose cheapest live price the card shows. */
  section: RegExp
  /** Items in that section the card is not about, such as garlic bread. */
  exclude?: RegExp
  image?: DishImage
}

type DishPick = SingleDishPick | SectionFromPick

export type LunchAndDinnerDish = {
  item: MenuPageItem
  image?: DishImage
}

const IMAGE_DIR = '/images/food/weekday-2026'

// Each pick is named so a campaign variant (below) can move it to the front of
// the list by reference, and the same card can never be shown twice.
const COD_AND_CHIPS_PICK: DishPick = {
  name: 'Beer Battered Cod & Chips',
  image: {
    src: `${IMAGE_DIR}/beer-battered-cod-and-chips.jpg`,
    alt: 'Beer battered cod and chips with garden peas, tartare sauce and a wedge of lemon'
  }
}

const SPICY_CHICKEN_STACK_PICK: DishPick = {
  name: 'Spicy Chicken Stack',
  image: {
    src: `${IMAGE_DIR}/spicy-chicken-stack.jpg`,
    alt: 'Spicy chicken stack: a crispy chicken fillet and hash brown with lettuce and tomato in a floured bap, with chips'
  }
}

const BEEF_AND_ALE_PIE_PICK: DishPick = {
  name: 'Beef & Ale Pie',
  image: {
    src: `${IMAGE_DIR}/beef-and-ale-pie.jpg`,
    alt: 'Beef and ale pie on mash with garden peas and a jug of gravy'
  }
}

const PIZZAS_PICK: DishPick = {
  kind: 'sectionFrom',
  title: 'Stone-baked pizzas',
  section: /^pizzas?$/i,
  exclude: /garlic bread/i,
  image: {
    src: `${IMAGE_DIR}/stone-baked-pizza.jpg`,
    alt: 'A stone-baked pizza with a charred crust on a blue plate'
  }
}

const FISH_FINGER_WRAP_PICK: DishPick = {
  name: 'Fish Finger Wrap',
  image: {
    src: `${IMAGE_DIR}/fish-finger-wrap.jpg`,
    alt: 'Fish finger wrap with lettuce, tomato and cucumber, cut in half, with chips'
  }
}

const BANGERS_AND_MASH_PICK: DishPick = {
  name: 'Bangers & Mash',
  image: {
    src: `${IMAGE_DIR}/bangers-and-mash.jpg`,
    alt: 'Bangers and mash with gravy, crispy onions and garden peas'
  }
}

/**
 * "Snack pots, from £9": the lunch ads lead on snack pots, which the page did
 * not show at all. Built like the pizza card, from the cheapest live item in
 * the Snack Pots section, and left out if that section or its prices are
 * missing. No photo exists, so the page shows its text tile.
 */
const SNACK_POTS_PICK: DishPick = {
  kind: 'sectionFrom',
  title: 'Snack pots',
  section: /^snack pots?$/i
}

export const LUNCH_AND_DINNER_DISH_PICKS: readonly DishPick[] = [
  COD_AND_CHIPS_PICK,
  SPICY_CHICKEN_STACK_PICK,
  BEEF_AND_ALE_PIE_PICK,
  PIZZAS_PICK,
  FISH_FINGER_WRAP_PICK,
  BANGERS_AND_MASH_PICK
]

/** `first`, then the rest of the usual list. A promoted pick is not repeated. */
function promotePicks(first: readonly DishPick[]): readonly DishPick[] {
  return [...first, ...LUNCH_AND_DINNER_DISH_PICKS.filter((pick) => !first.includes(pick))]
}

export type LunchDinnerService = 'default' | 'lunch' | 'dinner'

export type LunchDinnerVariant = {
  /** Which service the ad sold. Decides which time badge comes first. */
  service: LunchDinnerService
  /** Hero photo: always one of our own files, never anything from the address. */
  heroImage: string
  /** Hero title. null on the default page, which words its own from the live hours. */
  heroTitle: string | null
  /** The dish cards in page order. */
  picks: readonly DishPick[]
}

const LUNCH_TITLE = 'Lunch, Tuesday to Friday'
// No "tonight": a tagged link can be opened or shared on a Sunday or after
// service, so the title states the regular days only (owner decision D9).
const DINNER_TITLE = 'Dinner, Tuesday to Friday'

const LUNCH_PICKS = promotePicks([SNACK_POTS_PICK, FISH_FINGER_WRAP_PICK])

export const DEFAULT_LUNCH_DINNER_VARIANT: LunchDinnerVariant = {
  service: 'default',
  heroImage: `${IMAGE_DIR}/beer-battered-cod-and-chips.jpg`,
  heroTitle: null,
  picks: LUNCH_AND_DINNER_DISH_PICKS
}

/**
 * The four weekday food campaigns, keyed by the `utm_campaign` their short
 * links put on the address. This is the whole allow-list: nothing else changes
 * the page.
 */
const VARIANTS_BY_CAMPAIGN: ReadonlyMap<string, LunchDinnerVariant> = new Map([
  [
    'weekday_lunch_a_cod_and_chips',
    {
      service: 'lunch',
      heroImage: `${IMAGE_DIR}/beer-battered-cod-and-chips.jpg`,
      heroTitle: LUNCH_TITLE,
      picks: LUNCH_PICKS
    }
  ],
  [
    'weekday_lunch_b_spicy_chicken_stack',
    {
      service: 'lunch',
      heroImage: `${IMAGE_DIR}/spicy-chicken-stack.jpg`,
      heroTitle: LUNCH_TITLE,
      picks: LUNCH_PICKS
    }
  ],
  [
    'weekday_dinner_a_pizza',
    {
      service: 'dinner',
      heroImage: `${IMAGE_DIR}/stone-baked-pizza.jpg`,
      heroTitle: DINNER_TITLE,
      picks: promotePicks([PIZZAS_PICK, BEEF_AND_ALE_PIE_PICK])
    }
  ],
  [
    'weekday_dinner_b_beef_and_ale_pie',
    {
      service: 'dinner',
      heroImage: `${IMAGE_DIR}/beef-and-ale-pie.jpg`,
      heroTitle: DINNER_TITLE,
      picks: promotePicks([BEEF_AND_ALE_PIE_PICK, PIZZAS_PICK])
    }
  ]
])

/**
 * Which version of the page an ad visitor sees, from the `utm_campaign` on the
 * address. Exact match after trimming, ignoring case. Anything else (no tag, an
 * unknown tag, or a tag given more than once, which arrives as a list) gets the
 * default page. The tag is only ever used as a lookup key and is never put on
 * the page, so it cannot inject content.
 */
export function resolveLunchDinnerVariant(
  utmCampaign: string | readonly string[] | null | undefined
): LunchDinnerVariant {
  if (typeof utmCampaign !== 'string') return DEFAULT_LUNCH_DINNER_VARIANT
  return VARIANTS_BY_CAMPAIGN.get(utmCampaign.trim().toLowerCase()) ?? DEFAULT_LUNCH_DINNER_VARIANT
}

// "from £13": SSOT keeps the pound sign on "from" and range lines; single dish
// prices stay bare.
function formatFromPrice(value: number): string {
  return `from £${value % 1 === 0 ? String(value) : value.toFixed(2)}`
}

function pickSectionFrom(
  menu: Pick<MenuPageData, 'items'>,
  pick: SectionFromPick
): LunchAndDinnerDish[] {
  const candidates = menu.items.filter(
    (candidate) =>
      pick.section.test(candidate.sectionTitle.trim()) &&
      !pick.exclude?.test(candidate.name) &&
      Number.isFinite(candidate.priceValue) &&
      candidate.priceValue > 0
  )
  if (candidates.length === 0) return []

  const cheapest = candidates.reduce((low, candidate) =>
    candidate.priceValue < low.priceValue ? candidate : low
  )
  const item: MenuPageItem = {
    ...cheapest,
    id: `${cheapest.sectionId}-from`,
    name: pick.title,
    price: formatFromPrice(cheapest.priceValue)
  }
  return [pick.image ? { item, image: pick.image } : { item }]
}

/** The picked dishes the live menu still lists, in the order above. */
export function pickLunchAndDinnerDishes(
  menu: Pick<MenuPageData, 'items'>,
  picks: readonly DishPick[] = LUNCH_AND_DINNER_DISH_PICKS
): LunchAndDinnerDish[] {
  return picks.flatMap((pick) => {
    if (pick.kind === 'sectionFrom') return pickSectionFrom(menu, pick)

    const item = menu.items.find(
      (candidate) =>
        candidate.name.trim() === pick.name &&
        (!pick.section || pick.section.test(candidate.sectionTitle.trim()))
    )
    if (!item) return []
    return [pick.image ? { item, image: pick.image } : { item }]
  })
}

export type WeekdayServiceTimes = {
  /** "12pm to 3pm" */
  lunch: string
  /** "4pm to 9pm" */
  dinner: string
}

const TUESDAY_TO_FRIDAY = ['tuesday', 'wednesday', 'thursday', 'friday']

/**
 * The kitchen sittings Tuesday to Friday share in the regular week, as text
 * ("12pm to 3pm"), in order. Empty when those days differ or have no sitting,
 * so a caller never states a time the kitchen is not keeping on every one of
 * those days.
 *
 * These are the REGULAR times. A one-off closure on a single date is not
 * resolved here (getEffectiveDayHours in lib/hours-utils.ts does that), so use
 * them only in wording about the regular week, never about today.
 */
export function getWeekdayServiceWindows(
  hours: Parameters<typeof getSharedKitchenWindows>[0],
  now: Date = new Date()
): string[] {
  const sittings = getSharedKitchenWindows(hours, TUESDAY_TO_FRIDAY, now)
  return (sittings ?? []).map(
    (sitting) => `${formatTime12Hour(sitting.opens)} to ${formatTime12Hour(sitting.closes)}`
  )
}

/**
 * Lunch and dinner times, when Tuesday to Friday share one lunch sitting and
 * one dinner sitting. null otherwise, so the page never states a time the
 * kitchen is not keeping on every one of those days.
 */
export function getWeekdayServiceTimes(
  hours: Parameters<typeof getSharedKitchenWindows>[0],
  now: Date = new Date()
): WeekdayServiceTimes | null {
  const windows = getWeekdayServiceWindows(hours, now)
  if (windows.length !== 2) return null

  const [lunch, dinner] = windows
  return { lunch, dinner }
}

/**
 * The "No need to book" line under the hero buttons.
 *
 * Staff seat walk-ins for the whole of both kitchen windows, Tuesday to Friday
 * (owner decision, 25 September 2026, SSOT section 5). The line is about the
 * regular week: it never says "today", "tonight" or "now", because an ad link
 * can be opened on a Sunday, after service or on a day the kitchen is shut.
 *
 * `windows` comes from getWeekdayServiceWindows:
 * - two windows are lunch then dinner, and a dinner ad puts dinner first;
 * - one window is shown as it stands, with no label, because the hours do not
 *   say whether a lone sitting is lunch or dinner;
 * - none (the hours could not be read, or the four days differ) gives the
 *   line with no times, rather than a time that might be stale or wrong.
 */
export function buildWalkInLine(
  windows: readonly string[],
  service: LunchDinnerService = 'default'
): string {
  if (windows.length === 2) {
    const lunch = `lunch ${windows[0]}`
    const dinner = `dinner ${windows[1]}`
    const times = service === 'dinner' ? `${dinner}, ${lunch}` : `${lunch}, ${dinner}`
    return `No need to book. Just come in: ${times}, Tuesday to Friday.`
  }
  if (windows.length === 1) {
    return `No need to book. Just come in: ${windows[0]}, Tuesday to Friday.`
  }
  return 'No need to book, just come in, Tuesday to Friday.'
}

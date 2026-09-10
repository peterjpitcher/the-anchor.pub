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

export const LUNCH_AND_DINNER_DISH_PICKS: readonly DishPick[] = [
  {
    name: 'Beer Battered Cod & Chips',
    image: {
      src: `${IMAGE_DIR}/beer-battered-cod-and-chips.jpg`,
      alt: 'Beer battered cod and chips with garden peas, tartare sauce and a wedge of lemon'
    }
  },
  {
    name: 'Spicy Chicken Stack',
    image: {
      src: `${IMAGE_DIR}/spicy-chicken-stack.jpg`,
      alt: 'Spicy chicken stack: a crispy chicken fillet and hash brown with lettuce and tomato in a floured bap, with chips'
    }
  },
  {
    name: 'Beef & Ale Pie',
    image: {
      src: `${IMAGE_DIR}/beef-and-ale-pie.jpg`,
      alt: 'Beef and ale pie on mash with garden peas and a jug of gravy'
    }
  },
  {
    kind: 'sectionFrom',
    title: 'Stone-baked pizzas',
    section: /^pizzas?$/i,
    exclude: /garlic bread/i,
    image: {
      src: `${IMAGE_DIR}/stone-baked-pizza.jpg`,
      alt: 'A stone-baked pizza with a charred crust on a blue plate'
    }
  },
  {
    name: 'Fish Finger Wrap',
    image: {
      src: `${IMAGE_DIR}/fish-finger-wrap.jpg`,
      alt: 'Fish finger wrap with lettuce, tomato and cucumber, cut in half, with chips'
    }
  },
  {
    name: 'Bangers & Mash',
    image: {
      src: `${IMAGE_DIR}/bangers-and-mash.jpg`,
      alt: 'Bangers and mash with gravy, crispy onions and garden peas'
    }
  }
]

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
 * Lunch and dinner times, when Tuesday to Friday share one lunch sitting and
 * one dinner sitting. null otherwise, so the page never states a time the
 * kitchen is not keeping on every one of those days.
 */
export function getWeekdayServiceTimes(
  hours: Parameters<typeof getSharedKitchenWindows>[0],
  now: Date = new Date()
): WeekdayServiceTimes | null {
  const sittings = getSharedKitchenWindows(hours, TUESDAY_TO_FRIDAY, now)
  if (!sittings || sittings.length !== 2) return null

  const [lunch, dinner] = sittings.map(
    (sitting) => `${formatTime12Hour(sitting.opens)} to ${formatTime12Hour(sitting.closes)}`
  )
  return { lunch, dinner }
}

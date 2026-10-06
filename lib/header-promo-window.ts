import { nowInLondon, parseLondonDate } from './time-london'

/**
 * Which header promos are open on a given London date.
 *
 * Kept apart from lib/header-promos.ts on purpose. That file builds the list
 * and reads the Christmas window from SSOT.json; this one is imported by the
 * Navigation client component, and must not pull an 88 KB facts file into the
 * JavaScript of every page.
 */

const MS_IN_DAY = 24 * 60 * 60 * 1000
const DEFAULT_LEAD_DAYS = 56 // 8 weeks

/** The dates a promo runs between. Stripped off before a promo is rendered. */
export interface PromoWindow {
  startsOn: string
  endsOn: string
  leadDays?: number
}

/**
 * The promos whose window is open on the London date of `at`: from `startsOn`
 * minus the lead days until the end of `endsOn`.
 *
 * One function for both sides of the header. The root layout calls it on the
 * server so the links are in the HTML, and Navigation calls it again in the
 * browser because most pages are built once per deploy and their HTML can be
 * weeks older than the visitor's clock. When this lived only in a Navigation
 * effect the links were added after hydration, which made the strip 12px
 * taller and pushed every desktop page down as it loaded (CLS 0.19 for real
 * visitors, 6 October 2026).
 */
export function getActiveHeaderPromos<T extends PromoWindow>(
  promos: readonly T[],
  at: Date = new Date()
): Omit<T, keyof PromoWindow>[] {
  const now = nowInLondon(at)

  return promos
    .filter((promo) => {
      const leadDays = promo.leadDays ?? DEFAULT_LEAD_DAYS
      const start = parseLondonDate(promo.startsOn)
      const showFrom = new Date(start.getTime() - leadDays * MS_IN_DAY)

      const end = parseLondonDate(promo.endsOn)
      const endExclusive = new Date(end.getTime() + MS_IN_DAY)

      return now >= showFrom && now < endExclusive
    })
    .map(({ startsOn, endsOn, leadDays, ...button }) => button)
}

import { nowInLondonComponents } from './time-london'
import { getMotheringSunday, getValentinesDay } from './recurring-dates'
import { NATIONS_CHAMPIONSHIP_PATH } from './nations-championship/config'
import { CHRISTMAS_WINDOW_END, CHRISTMAS_WINDOW_START } from './christmas-season'

/**
 * The date-windowed promo links in the header's utility strip.
 *
 * Built from the London year rather than typed, so they renew themselves. The
 * previous version hardcoded 2026 dates for Valentine's, Mother's Day and
 * Christmas, which meant every one of them would have gone dark on
 * 1 January 2027 and stayed dark until somebody edited code. On a site whose
 * whole point is looking actively managed, that is the worst possible failure.
 *
 * Navigation filters these itself: a promo shows from `startsOn` minus its lead
 * days until the end of `endsOn`. That is why this returns entries for both the
 * current year and the next one. Valentine's has an eight-week lead, so in late
 * December the entry that needs to be in the list is next February's.
 */

export interface HeaderPromo {
  label: string
  href: string
  external: boolean
  variant: 'outline'
  startsOn: string
  endsOn: string
  leadDays?: number
}

function occasionsForYear(year: number): HeaderPromo[] {
  const valentines = getValentinesDay(year)
  const mothersDay = getMotheringSunday(year)

  return [
    {
      label: "Valentine's Day",
      href: '/valentines-day',
      external: false,
      variant: 'outline',
      startsOn: valentines,
      endsOn: valentines
    },
    {
      label: "Mother's Day",
      href: '/mothers-day',
      external: false,
      variant: 'outline',
      startsOn: mothersDay,
      endsOn: mothersDay
    }
  ]
}

/**
 * Christmas comes from the SSOT rather than the calendar, because the festive
 * service window is an operational decision, not a computable date. If the SSOT
 * is not updated for a new year the link simply stops showing, which is a quiet
 * failure rather than a wrong one advertising last year's dates.
 */
function christmasPromo(): HeaderPromo {
  return {
    label: 'Christmas',
    href: '/christmas-parties',
    external: false,
    variant: 'outline',
    startsOn: CHRISTMAS_WINDOW_START,
    endsOn: CHRISTMAS_WINDOW_END,
    // Party organisers start looking in late summer, so this needs a long run-up.
    leadDays: 101
  }
}

/**
 * Every promo whose window could plausibly be open now or soon. Navigation does
 * the actual filtering; this just makes sure the right candidates are present.
 */
export function getHeaderPromoCtas(testDate?: Date): HeaderPromo[] {
  const { year } = nowInLondonComponents(testDate ?? new Date())
  return [
    ...occasionsForYear(year),
    // Next year's too, so a promo's lead window can cross 31 December.
    ...occasionsForYear(year + 1),
    christmasPromo(),
    // Owner requested a top-bar link from 5 September through Finals Weekend.
    // One tournament only: it must not return automatically in a later year.
    ...(year === 2026 ? [{
      label: 'Nations Championship',
      href: NATIONS_CHAMPIONSHIP_PATH,
      external: false,
      variant: 'outline' as const,
      startsOn: '2026-09-05',
      endsOn: '2026-11-29',
      leadDays: 0
    }] : [])
  ]
}

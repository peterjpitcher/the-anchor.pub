import { nowInLondonComponents } from './time-london'
import {
  CHRISTMAS_DEPOSIT_PER_PERSON,
  CHRISTMAS_MINIMUM_PARTY_SIZE,
  formatChristmasWindowLabel
} from './christmas-season'
import {
  formatFestiveDay,
  getFestiveKitchenStatus,
  type FestiveKitchenClosure
} from './festive-kitchen-closure'
import { HEATHROW_TIMES } from '@/lib/constants'

/**
 * Homepage copy, one set per month, resolved from the London date.
 *
 * Deliberately keyed on the month alone, NOT on the seasonal skin. The skin has
 * three states (off, dark, festive) across windows the owner set on 12 August
 * 2026; the copy changes twelve times a year so the site keeps feeling current
 * even in the middle of a long dark window. The two are independent on purpose:
 * changing one must not drag the other with it.
 *
 * Every claim here is SSOT-checked (docs/SSOT.md, 12 August 2026):
 * - No mulled wine. Banned outright, owner-confirmed 5 Aug 2026.
 * - No "climate controlled" or "year-round comfort". We have heating, not air
 *   conditioning, so warmth is claimable in winter and coolness never is.
 * - No Halloween or New Year specifics, because those depend on event listings
 *   being confirmed rather than on the calendar.
 * - Sunday roast is walk-in, 1pm to 6pm, no pre-order and no cutoff. Beef
 *   topside is the headline roast.
 * - Christmas figures are interpolated from christmas-season.ts, never typed,
 *   so they cannot go stale when the window moves year to year.
 */

export interface MonthlyHomepageCopy {
  /** The cursive line under the H1. The H1 itself is the motto and never changes. */
  script: string
  /** The hero's supporting paragraph. */
  lead: string
  /** Hero primary action label. */
  primaryCta: string
  /**
   * Where the primary action goes. Omit for the normal case, which renders the
   * tracked BookTableButton straight into the booking flow. Set it only when
   * the month's primary ask is something else, as November's is.
   */
  primaryHref?: string
  /** Hero secondary action label, and where it points. */
  secondaryCta: string
  secondaryHref: string
  /** Four amenity chips under the hero. */
  badges: readonly string[]
  /** Closing CTA band at the foot of the homepage. */
  bandTitle: string
  bandCopy: string
}

const ROAST_BADGES = ['Sunday roasts', 'Free parking', 'Dog friendly', `${HEATHROW_TIMES.terminal5} mins from T5`] as const
const GARDEN_BADGES = ['Beer garden', 'Free parking', 'Dog friendly', 'Plane spotting'] as const

const READY_TO_VISIT = {
  bandTitle: 'Ready to visit?',
  bandCopy: 'Walk-ins are always welcome, but booking guarantees your spot.'
} as const

/**
 * Resolves the copy for a 1-12 month number.
 *
 * November and December are built rather than declared, because they carry the
 * live Christmas window. Note December's primary CTA is deliberately "Book a
 * table" and not "Book your festive table": the owner's festive window runs to
 * 31 December but festive SERVICE ends on the 20th, so a festive-specific CTA
 * would be untrue for the last eleven days of the month.
 */
export function getMonthlyHomepageCopy(month: number): MonthlyHomepageCopy {
  const christmasWindow = formatChristmasWindowLabel()
  const minParty = CHRISTMAS_MINIMUM_PARTY_SIZE
  const deposit = CHRISTMAS_DEPOSIT_PER_PERSON

  switch (month) {
    case 1:
      return {
        script: 'Start the year somewhere warm',
        lead: `January is for long lunches, quiet pints and a proper roast on a Sunday. Pub classics, stone-baked pizzas and free parking, ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5.`,
        primaryCta: 'Book a table',
        secondaryCta: 'See the Sunday roast',
        secondaryHref: '/sunday-roast',
        badges: ROAST_BADGES,
        bandTitle: 'Beat the January quiet',
        bandCopy: 'Walk in whenever you like. Booking just means the table is waiting for you.'
      }
    case 2:
      return {
        script: 'Pull up a chair',
        lead: `Dark evenings, warm rooms and somewhere to properly sit down. Roasts carved fresh every Sunday, stone-baked pizzas and pub classics, ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5.`,
        primaryCta: 'Book a table',
        secondaryCta: 'View food menu',
        secondaryHref: '/food-menu',
        badges: ROAST_BADGES,
        bandTitle: 'Got a date in mind?',
        bandCopy: 'Sundays fill up quickly in February. Tell us when and we will hold a table.'
      }
    case 3:
      return {
        script: 'Lighter evenings ahead',
        lead: `The evenings are stretching out again and the garden is waking up. Sunday roasts, stone-baked pizzas and free parking, ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5.`,
        primaryCta: 'Book a table',
        secondaryCta: 'See the Sunday roast',
        secondaryHref: '/sunday-roast',
        badges: ['Sunday roasts', 'Free parking', 'Dog friendly', 'Beer garden'],
        bandTitle: 'Planning something for March?',
        bandCopy: 'Sunday tables, birthdays and small get-togethers. Just tell us the date.'
      }
    case 4:
      return {
        script: "Spring's in the garden",
        lead: `Longer days, planes overhead and a pint outside again. Roasts carved fresh every Sunday, stone-baked pizzas and free parking, ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5.`,
        primaryCta: 'Book a table',
        secondaryCta: 'Visit the beer garden',
        secondaryHref: '/beer-garden',
        badges: ['Beer garden', 'Free parking', 'Dog friendly', `${HEATHROW_TIMES.terminal5} mins from T5`],
        ...READY_TO_VISIT
      }
    case 5:
      return {
        script: 'Garden weather at last',
        lead: `A beer garden under the flight path, a pint in the sun and the planes coming in low. Stone-baked pizzas, pub classics and free parking, ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5.`,
        primaryCta: 'Book a table',
        secondaryCta: 'Visit the beer garden',
        secondaryHref: '/beer-garden',
        badges: GARDEN_BADGES,
        bandTitle: 'Bringing a few people?',
        bandCopy: 'Garden tables, birthdays and long afternoons. Tell us roughly how many and we will sort it.'
      }
    case 6:
      return {
        script: 'Long afternoons out the back',
        lead: `Summer in a proper village pub: the garden open, the planes overhead and no rush to leave. Stone-baked pizzas, pub classics and free parking, ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5.`,
        primaryCta: 'Book a table',
        secondaryCta: 'Visit the beer garden',
        secondaryHref: '/beer-garden',
        badges: GARDEN_BADGES,
        ...READY_TO_VISIT
      }
    case 7:
      return {
        script: 'Pints, planes and no rush',
        lead: `The garden is the whole point in July. Cold drinks, stone-baked pizzas and Terminal 5 arrivals passing right over your head, ${HEATHROW_TIMES.terminal5} minutes from the airport with free parking.`,
        primaryCta: 'Book a table',
        secondaryCta: 'View food menu',
        secondaryHref: '/food-menu',
        badges: GARDEN_BADGES,
        bandTitle: 'Got a group coming?',
        bandCopy: 'Summer afternoons in the garden. Tell us the date and how many.'
      }
    case 8:
      // The evergreen baseline. Every other month is a departure from this.
      return {
        script: "Where everyone's welcome",
        lead: `A proper village pub in Stanwell Moor, ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5. Pub classics, stone-baked pizzas, a beer garden under the flight path and free customer parking.`,
        primaryCta: 'Book a table',
        secondaryCta: 'View food menu',
        secondaryHref: '/food-menu',
        badges: ['Free parking', 'Dog friendly', 'Beer garden', `${HEATHROW_TIMES.terminal5} mins from T5`],
        ...READY_TO_VISIT
      }
    case 9:
      return {
        script: 'Cosy season starts here',
        lead: `Darker evenings, warmer welcomes. Pub classics, stone-baked pizzas and roasts carved fresh every Sunday, ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5.`,
        primaryCta: 'Book a table',
        secondaryCta: 'See the Sunday roast',
        secondaryHref: '/sunday-roast',
        badges: ROAST_BADGES,
        ...READY_TO_VISIT
      }
    case 10:
      // The Christmas push starts here, in the band only. The hero stays about
      // autumn: group bookings from four need lead time, and the header already
      // surfaces a Christmas link from 1 August.
      return {
        script: 'Pull the evenings in',
        lead: `The clocks go back and the roasts get better. Beef topside carved fresh every Sunday from 1pm, stone-baked pizzas and free parking, ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5.`,
        primaryCta: 'Book a table',
        secondaryCta: 'See the Sunday roast',
        secondaryHref: '/sunday-roast',
        badges: ROAST_BADGES,
        bandTitle: 'Thinking about Christmas?',
        bandCopy: `Festive bookings are open for groups from ${minParty} guests up. Get your date in early.`
      }
    case 11:
      // The lights come on 1 November but festive service starts on the 10th,
      // so the lead states the window rather than implying it is already running.
      return {
        script: 'Party season is open',
        lead: `Festive service runs ${christmasWindow}. Christmas bookings take groups from ${minParty} guests up, in a proper village pub ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5.`,
        primaryCta: 'Christmas enquiry',
        primaryHref: '/christmas-parties',
        secondaryCta: 'View food menu',
        secondaryHref: '/food-menu',
        badges: [`Groups from ${minParty}`, 'Free parking', 'Dog friendly', `${HEATHROW_TIMES.terminal5} mins from T5`],
        bandTitle: 'Planning the Christmas do?',
        bandCopy: `Groups from ${minParty} guests up, £${deposit} per person deposit that comes off your bill. Tell us your date and we will hold it.`
      }
    case 12:
      return {
        script: 'Christmas is on at The Anchor',
        lead: `Festive service runs ${christmasWindow}, then we see the year out together. Christmas dinner, groups from ${minParty} guests up and a village pub ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5.`,
        primaryCta: 'Book a table',
        secondaryCta: 'Christmas enquiry',
        secondaryHref: '/christmas-parties',
        badges: ['Festive menu', `Groups from ${minParty}`, 'Free parking', 'Dog friendly'],
        bandTitle: 'See the year out with us',
        bandCopy: 'We would love to see you in before New Year, so come and raise one with us.'
      }
    default:
      // Unreachable for a real London month, but a bad input must never blank
      // the homepage. Fall back to the evergreen baseline.
      return getMonthlyHomepageCopy(8)
  }
}

/**
 * The homepage while the kitchen is shut over Christmas and New Year.
 *
 * The December set sells Christmas dinner and a "Festive menu" chip, and the
 * January set sells long lunches and "a proper roast on a Sunday". Both ran
 * straight through the break (21 December to 11 January in 2026), when there is
 * no food at all. This set makes no food promise: no roast, no lunch, no menu
 * chip, no menu button, and no "walk in".
 *
 * Built from the two closure dates, so it names the day the kitchen is back
 * without anybody typing it. Boxing Day and New Year's Day are closures of the
 * whole pub (SSOT section 7), so the line about them stays until 1 January has
 * passed and then goes.
 */
export function getFestiveBreakHomepageCopy(today: string, closure: FestiveKitchenClosure): MonthlyHomepageCopy {
  const returnDay = formatFestiveDay(closure.returns)
  const kitchen = `Our kitchen's last day of the year is ${formatFestiveDay(closure.lastService)}, and it's back on ${returnDay}.`
  const beforeNewYear = today.slice(0, 4) === closure.lastService.slice(0, 4)
  const newYearsDay = `${closure.returns.slice(0, 4)}-01-01`
  const closedDays = today <= newYearsDay ? " We're closed on Boxing Day and on New Year's Day." : ''
  // "12 January", for a chip that has to stay short.
  const returnDayShort = returnDay.split(' ').slice(1).join(' ')

  return {
    script: beforeNewYear ? 'See the year out with us' : 'Happy New Year from The Anchor',
    lead: `${kitchen} The bar stays open.${closedDays} A proper village pub, ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5.`,
    primaryCta: 'Book a table',
    secondaryCta: 'See the drinks',
    secondaryHref: '/drinks',
    badges: [`Kitchen back ${returnDayShort}`, 'Free parking', 'Dog friendly', `${HEATHROW_TIMES.terminal5} mins from T5`],
    bandTitle: beforeNewYear ? 'See the year out with us' : `Kitchen back on ${returnDay}`,
    bandCopy: beforeNewYear
      ? 'We would love to see you in before New Year, so come and raise one with us.'
      : `The bar is open, and the kitchen is back on ${returnDay}.`
  }
}

/**
 * Today's copy, in Europe/London.
 *
 * The month decides it, with one exception: while the kitchen is shut for the
 * festive break, the break's own set is used instead of December's or
 * January's (see getFestiveBreakHomepageCopy).
 */
export function getCurrentMonthlyHomepageCopy(testDate?: Date): MonthlyHomepageCopy {
  const now = testDate ?? new Date()
  const festive = getFestiveKitchenStatus(now)
  if (festive.state === 'closed' && festive.closure) {
    return getFestiveBreakHomepageCopy(festive.today, festive.closure)
  }

  const { month } = nowInLondonComponents(now)
  return getMonthlyHomepageCopy(month)
}

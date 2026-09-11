/**
 * Locks the owner-confirmed Christmas 2026 offer (confirmed 21 July 2026).
 *
 * These assertions exist because the previous Christmas offer was described in
 * copy that has since been retired: a blanket "pre-order only" rule, shared
 * party nights, sharing boards and per-person add-ons. Anything that reappears
 * here would be published to customers as a fact, so it is guarded rather than
 * left to review.
 */
import { render } from '@testing-library/react'
import ssot from '@/SSOT.json'
import {
  ChristmasPartiesPageClient,
  type ChristmasFactsView,
  type ChristmasMenuView,
  type ChristmasSeasonView
} from '@/app/christmas-parties/client-components'
import { buildChristmasMenuJsonLd, christmasPartiesSchema } from '@/lib/christmas-parties-schema'
import {
  CHRISTMAS_DEPOSIT_PER_PERSON,
  CHRISTMAS_MINIMUM_NOTICE_HOURS,
  CHRISTMAS_MINIMUM_PARTY_SIZE,
  CHRISTMAS_WINDOW_END,
  CHRISTMAS_WINDOW_START,
  getChristmasDay
} from '@/lib/christmas-season'

const BUFFET_MINIMUM_GUESTS =
  (ssot as unknown as { christmas_2026: { buffets: { min_guests: number } } }).christmas_2026.buffets.min_guests

const FACTS: ChristmasFactsView = {
  minPartySize: CHRISTMAS_MINIMUM_PARTY_SIZE,
  // Derived from the SSOT exactly as app/christmas-parties/page.tsx does it,
  // rather than hand-written. A hand-written '12pm' fixture let the page ship
  // "from 12:00 to 15:00" to production on 6 September 2026 while this test
  // passed, because the fixture never exercised the formatting.
  christmasDay: getChristmasDay(),
  minNoticeHours: CHRISTMAS_MINIMUM_NOTICE_HOURS,
  depositPerPerson: CHRISTMAS_DEPOSIT_PER_PERSON,
  buffetMinimumGuests: BUFFET_MINIMUM_GUESTS,
  maxSeated: 60,
  maxStanding: 100,
  privateHireThreshold: 20
}

const SEASON: ChristmasSeasonView = {
  state: 'upcoming',
  windowLabel: '10 November to 20 December 2026',
  minEnquiryDate: CHRISTMAS_WINDOW_START,
  maxEnquiryDate: CHRISTMAS_WINDOW_END,
  isBookable: true,
  bookingClosed: false,
  showChristmasDayNotice: false
}

const EMPTY_MENU: ChristmasMenuView = {
  tiers: [],
  extraSections: [],
  hasLiveDishes: false,
  isUnavailable: false
}

function renderPage(menu: ChristmasMenuView = EMPTY_MENU): string {
  const { container } = render(
    <ChristmasPartiesPageClient
      structuredData={christmasPartiesSchema}
      menu={menu}
      season={SEASON}
      facts={FACTS}
    />
  )
  return container.textContent || ''
}

describe('Christmas 2026 booking rules', () => {
  it('holds the owner-confirmed constants, so every consumer inherits the same rules', () => {
    // Owner-confirmed 6 September 2026: 4 guests, every day of the week.
    expect(CHRISTMAS_MINIMUM_PARTY_SIZE).toBe(4)
    expect(CHRISTMAS_MINIMUM_NOTICE_HOURS).toBe(24)
    expect(CHRISTMAS_DEPOSIT_PER_PERSON).toBe(10)
    expect(CHRISTMAS_WINDOW_START).toBe('2026-11-10')
    // 20 December is inclusive: a 20 December sitting is bookable.
    expect(CHRISTMAS_WINDOW_END).toBe('2026-12-20')
  })

  it('states the day-dependent group minimum, the 24 hour notice and the deposit on the page', () => {
    const text = renderPage()

    // The minimum was 6 until 6 September 2026 and is now 4, every day.
    expect(text).toContain(`${CHRISTMAS_MINIMUM_PARTY_SIZE} guests or more`)
    expect(text).not.toMatch(/Christmas dinner[^.]{0,60}\b6 guests or more/i)
    expect(text).toContain('at least 24 hours')
    expect(text).toContain('no same-day bookings')
    expect(text).toContain(`£${CHRISTMAS_DEPOSIT_PER_PERSON} per person`)
  })

  it('applies the deposit at any party size, never only to large groups', () => {
    const text = renderPage()

    // The general non-Christmas rule (no deposit under 10 guests) must never
    // leak into Christmas copy.
    expect(text).toMatch(/£10 per person, every booking, any size/i)
    expect(text).not.toMatch(/deposit[^.]{0,80}\b10 or more guests/i)
    expect(text).not.toMatch(/no deposit/i)
  })

  it('describes courses as a per-person choice, with only the main required', () => {
    const text = renderPage()

    expect(text).toContain('Courses are chosen per person')
    expect(text).toMatch(/every guest chooses a main/i)
    expect(text).toMatch(/a starter and a dessert are optional/i)
    expect(text).toMatch(/different numbers of courses/i)
    // Two retired rules, both of which the page used to publish as fact.
    expect(text).not.toMatch(/pre-order only/i)
    expect(text).not.toMatch(/pre-book only/i)
  })

  it('says plainly that no kids 2 course or 3 course exists', () => {
    const text = renderPage()

    expect(text).toContain('There is no kids 2 course and no kids 3 course')
    expect(text).toMatch(/children are welcome on those tiers at the adult price/i)
  })

  it('routes groups above the private hire threshold away from a table booking', () => {
    const text = renderPage()

    expect(text).toMatch(/more than 20 guests/i)
    expect(text).toContain('manager@the-anchor.pub')
    expect(text).toContain('01753 682707')
  })

  it('uses the 30 guest buffet minimum everywhere, not the stale 25 or 26', () => {
    expect(BUFFET_MINIMUM_GUESTS).toBe(30)

    const text = renderPage()
    expect(text).toContain('30 guests or more')
    expect(text).not.toMatch(/buffet[^.]{0,60}\b2[56]\b/i)

    const schemaJson = JSON.stringify(christmasPartiesSchema)
    expect(schemaJson).toContain('A festive buffet for 30 guests or more.')
  })

  it('carries the booking rules into the page level JSON-LD', () => {
    const schemaJson = JSON.stringify(christmasPartiesSchema)

    expect(schemaJson).toContain(`${CHRISTMAS_MINIMUM_PARTY_SIZE} guests or more`)
    expect(schemaJson).toContain('at least 24 hours ahead')
    expect(schemaJson).toContain('Courses are chosen per person, not for the whole table.')
    expect(schemaJson).toContain('Every guest chooses a main.')
    expect(schemaJson).toMatch(/deposit of 10 pounds per person applies to every Christmas booking, whatever the party size/i)
  })
})

describe('Christmas 2026 owner decisions of 6 September', () => {
  it('formats the Christmas Day times as pub copy, never as a 24 hour clock', () => {
    const day = getChristmasDay()

    // The SSOT stores "12:00" and "15:00"; customers must read "12pm" and "3pm".
    expect(day.opens).toBe('12pm')
    expect(day.closes).toBe('3pm')
    expect(day.foodService).toBe(false)
    expect(`${day.opens} ${day.closes}`).not.toMatch(/\d{1,2}:\d{2}/)
  })

  it('answers the Christmas Day question, drinks only and no food', () => {
    const text = renderPage()

    expect(text).toContain('Are you open on Christmas Day?')
    expect(text).toMatch(/open on Christmas Day for drinks only, from 12pm to 3pm/i)
    // Pub copy never says 24 hour clock times.
    expect(text).not.toMatch(/1[0-9]:[0-9]{2}/)
    expect(text).toMatch(/no food service on Christmas Day/i)
  })

  it('never advertises food on Christmas Day', () => {
    const text = renderPage()

    // The banned shape: any claim of a meal ON the 25th. The FAQ answer names
    // the dishes we do NOT serve that day, so the assertion is scoped to a
    // positive offer rather than the mere co-occurrence of the words.
    expect(text).not.toMatch(/Christmas dinner on (the )?(25th|Christmas Day)/i)
    expect(text).not.toMatch(/(book|serving|serve) .{0,30}Christmas Day/i)
  })

  it('states a flat 4 guest minimum on every day, and never the retired 6', () => {
    const text = renderPage()

    expect(CHRISTMAS_MINIMUM_PARTY_SIZE).toBe(4)
    expect(text).toContain('4 guests or more')
    expect(text).not.toMatch(/Christmas dinner[^.]{0,60}\b6 guests or more/i)
    // The day-dependent reading was wrong and must not come back.
    expect(text).not.toMatch(/midweek[^.]{0,40}6 on Friday/i)
    // Every other way of writing the retired figure. Matching only "6 guests or
    // more" let "The 6-guest minimum" survive on the drinks-only FAQ until
    // 10 September 2026. Times such as "6:30pm" are not a minimum.
    expect(text).not.toMatch(/\b(?:6|six)[- ]guests?\b|\b(?:minimum(?: of)?|at least|from|starts at) (?:6|six)\b(?!:)/i)
    // The drinks-only answer reads the live minimum rather than a typed number.
    expect(text).toContain(
      `The ${CHRISTMAS_MINIMUM_PARTY_SIZE}-guest minimum and the pre-order rules apply to Christmas dinner`
    )
  })

  it('never puts a minimum party size on the Sunday roast', () => {
    const text = renderPage()

    expect(text).toMatch(/Sunday roast has no minimum/i)
  })

  it('says a drinks-only party has no minimum spend', () => {
    const text = renderPage()

    expect(text).toMatch(/no minimum spend/i)
    // The rule is that we never invent one, so no figure may appear near it.
    expect(text).not.toMatch(/minimum spend of £/i)
  })

  it('routes a 21 to 29 guest group to a private booking rather than refusing it', () => {
    const text = renderPage()

    expect(text).toMatch(/Between 21 and 29 guests we arrange it as a private booking/i)
    expect(text).toMatch(/we will look after it/i)
  })
})

describe('Christmas 2026 discontinued products', () => {
  // Every one of these was live in the 2025 offer and was withdrawn on
  // 21 July 2026. None may reappear in copy, schema or data shapes.
  const DISCONTINUED: Array<[string, RegExp]> = [
    ['shared party nights', /shared\s+(christmas\s+)?party|party\s+night/i],
    ['All the Trimmings Board', /trimmings\s+board/i],
    ['XL Board', /\bxl\s+board\b/i],
    ['cauliflower cheese pot add-on', /cauliflower\s+cheese/i],
    ['stuffing ball add-on', /stuffing\s+balls?\b/i],
    ['extra roast potatoes add-on', /extra\s+roast\s+potatoes/i],
    ['extra Yorkshire puddings add-on', /extra\s+yorkshire/i],
    ['Bundle A', /\bbundle\s+a\b/i],
    ['standalone drinks bundles', /drinks?\s+bundle/i],
    ['per-person add-ons', /add[-\s]?ons?\b/i],
    // Switched off in the management app (mirrored 11 September 2026): a weekday
    // and a weekend price at a minimum of 6. The sit-down offer is the 1, 2 and
    // 3 course Christmas menu only (owner-confirmed 11 September 2026). Matched
    // by the package name, so "no festive menu on the 25th" still passes.
    ['the old Festive Menu catering packages', /\bFestive Menu\b/]
  ]

  it.each(DISCONTINUED)('keeps %s off the rendered page', (_label, pattern) => {
    expect(renderPage()).not.toMatch(pattern)
  })

  it.each(DISCONTINUED)('keeps %s out of the page JSON-LD', (_label, pattern) => {
    expect(JSON.stringify(christmasPartiesSchema)).not.toMatch(pattern)
  })

  it('keeps the surviving products in place, so the guard is not vacuous', () => {
    const text = renderPage()

    // Buffets and the 1, 2 and 3 course Christmas menu stay. Pigs in blankets
    // stay too, but as an included trimming rather than a paid add-on. The
    // Yorkshire pudding, mash and peas joined the list on 13 August 2026,
    // owner-confirmed.
    expect(text).toMatch(/festive buffet/i)
    // Asked about "packages", the page names the Christmas menu instead.
    expect(text).toContain(
      `Teams book our Christmas menu, with each guest choosing 1, 2 or 3 courses, for ${CHRISTMAS_MINIMUM_PARTY_SIZE} guests or more.`
    )
    expect(text).toContain(
      'Trimmings: pigs in blankets, stuffing, brussels sprouts, yorkshire pudding, roast potatoes, mashed potato, peas.'
    )
  })
})

describe('Christmas 2026 menu and price handling', () => {
  const dishMenu: ChristmasMenuView = {
    tiers: [
      {
        id: 'one_course',
        name: '1 course',
        courseCount: 1,
        kidsTierAvailable: true,
        priceFrom: '23',
        kidsPriceFrom: '18',
        dayRateVaries: false,
        items: [
          {
            id: 'turkey',
            name: 'Roast Turkey',
            description: 'Served with trimmings.',
            price: '23',
            allergens: [],
            allergenStatus: 'unknown'
          },
          {
            id: 'beef',
            name: 'Roast Beef',
            description: '',
            price: '25',
            allergens: ['Celery'],
            allergenStatus: 'known'
          }
        ]
      }
    ],
    extraSections: [],
    hasLiveDishes: true,
    isUnavailable: false
  }

  it('never claims a dish has no allergens when the data is missing', () => {
    const text = renderPage(dishMenu)

    expect(text).toContain('See menu or contact us for allergen information')
    expect(text).not.toMatch(/no allergens/i)
    expect(text).toContain('Allergens: Celery')
  })

  it('shows per-item prices without a currency symbol', () => {
    const { container } = render(
      <ChristmasPartiesPageClient
        structuredData={christmasPartiesSchema}
        menu={dishMenu}
        season={SEASON}
        facts={FACTS}
      />
    )

    const dishHeading = Array.from(container.querySelectorAll('h5')).find(
      node => node.textContent === 'Roast Turkey'
    )
    expect(dishHeading).toBeDefined()
    const priceCell = dishHeading?.parentElement?.querySelector('span')
    expect(priceCell?.textContent).toBe('23')
  })

  it('publishes a bare numeric Offer price, and no Offer at all without a live price', () => {
    const jsonLd = buildChristmasMenuJsonLd([
      {
        title: '1 course',
        items: [
          { name: 'Roast Turkey', priceValue: 23 },
          { name: 'Dish to be confirmed', priceValue: 0 }
        ]
      }
    ]) as Record<string, unknown>

    const section = (jsonLd.hasMenuSection as Array<Record<string, unknown>>)[0]
    const items = section.hasMenuItem as Array<Record<string, unknown>>

    expect((items[0].offers as Record<string, unknown>).price).toBe('23.00')
    expect((items[0].offers as Record<string, unknown>).priceCurrency).toBe('GBP')
    expect(items[1]).not.toHaveProperty('offers')
  })

  it('publishes nothing at all when there is no live Christmas menu', () => {
    expect(buildChristmasMenuJsonLd([])).toBeNull()
    expect(buildChristmasMenuJsonLd([{ title: '1 course', items: [] }])).toBeNull()
  })
})

describe('Christmas 2026 dish list, published or silent', () => {
  // SSOT sections 7 and 14: the dishes are published from the Christmas booking
  // period, and "menu released closer to the time" is retired. With no live dish
  // list the page says nothing about the dishes; only an outage gets a message.
  const RETIRED = /closer to the time|still finalising/i

  it('names the dishes in the FAQ when the booking system returns them', () => {
    const { container } = render(
      <ChristmasPartiesPageClient
        structuredData={christmasPartiesSchema}
        menu={EMPTY_MENU}
        season={SEASON}
        facts={FACTS}
        courseChoices={{
          groups: [
            {
              course: 'main',
              title: 'Mains',
              items: [
                { id: 'turkey', name: 'Roast Turkey', description: '', price: '', allergens: [], allergenStatus: 'unknown' }
              ]
            }
          ],
          preorderCutoffDays: 7
        }}
      />
    )
    const text = container.textContent || ''

    expect(text).toContain('What is on the Christmas menu?')
    expect(text).toContain('Mains: Roast Turkey.')
    expect(text).not.toMatch(RETIRED)
  })

  it('says nothing about the dishes when the booking system returns none', () => {
    const text = renderPage(EMPTY_MENU)

    expect(text).not.toMatch(RETIRED)
    expect(text).not.toContain('What is on the Christmas menu?')
    expect(text).not.toContain('The dish list is not showing right now')
  })

  it('tells guests how to get the menu when the menu API is down', () => {
    const text = renderPage({ ...EMPTY_MENU, isUnavailable: true })

    expect(text).toContain('The dish list is not showing right now')
    expect(text).toContain('we will read you the current Christmas menu')
    expect(text).not.toMatch(RETIRED)
  })
})

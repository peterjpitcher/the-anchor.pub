/**
 * /lunch-and-dinner, the landing page for the paid weekday food campaign.
 *
 * The page is built by the same functions production calls: the menu goes
 * through the real getFoodMenuPageData, with only the management API call
 * mocked, and the hours through the real hours helpers. Nothing it shows is
 * typed into the page, so these tests check that what reaches the screen is
 * what the live data says, and that a missing dish or a failed menu is handled.
 */

import fs from 'fs'
import path from 'path'
import type { ReactElement } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import type { BusinessHours } from '@/lib/api'
import type { MenuResponse, MenuSectionData } from '@/lib/api/menu'
import { anchorAPI, getBusinessHoursSnapshot } from '@/lib/api'
import { CONTACT } from '@/lib/constants'
import { rejectAllCookies } from '@/lib/cookies'
import LunchAndDinnerPage, { dynamic, metadata } from '@/app/lunch-and-dinner/page'
import * as lunchAndDinnerPageModule from '@/app/lunch-and-dinner/page'
import {
  DEFAULT_LUNCH_DINNER_VARIANT,
  buildWalkInLine,
  getWeekdayServiceTimes,
  getWeekdayServiceWindows,
  pickLunchAndDinnerDishes,
  resolveLunchDinnerVariant
} from '@/lib/lunch-and-dinner'
import type { MenuPageItem } from '@/lib/menu-page-data'

jest.mock('react', () => {
  const actual = jest.requireActual('react')
  return {
    ...actual,
    cache: (fn: unknown) => fn
  }
})

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getMenu: jest.fn()
  },
  getBusinessHoursSnapshot: jest.fn()
}))

jest.mock('@/lib/gtm-events', () => ({
  ...jest.requireActual('@/lib/gtm-events'),
  trackCtaClick: jest.fn(),
  trackTableBookingClick: jest.fn(),
  trackPhoneCallClick: jest.fn()
}))

jest.mock('next/navigation', () => ({
  usePathname: () => '/lunch-and-dinner'
}))

// A price as the management API might send it. The bad shapes (missing, text,
// zero, negative) are here on purpose: a card must be left out rather than show
// a price the menu does not really hold.
type FixturePrice = number | string | null | undefined

function section(name: string, sortOrder: number, dishes: Array<[string, FixturePrice]>): MenuSectionData {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    description: '',
    sort_order: sortOrder,
    items: dishes.map(([dishName, price], index) => ({
      id: `${name}-${dishName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: dishName,
      description: '',
      price: price as number,
      dietary_info: [],
      allergens: [],
      is_available: true,
      sort_order: index + 1
    }))
  }
}

// The Snack Pots section as the live menu served it on 3 October 2026.
const LIVE_SNACK_POTS: Array<[string, FixturePrice]> = [
  ['Fish Fingers & Chips', 9],
  ['Chicken Goujons & Chips', 9],
  ['Salt & Chilli Squid & Chips', 9]
]

// The live menu's shape on 10 September 2026, trimmed to what the page reads,
// plus the Snack Pots section the lunch ads lead on. `snackPots: null` leaves
// that section out altogether.
function liveShapedMenu(
  overrides: {
    mains?: Array<[string, number]>
    snackPots?: Array<[string, FixturePrice]> | null
  } = {}
): MenuResponse {
  const snackPots = overrides.snackPots === undefined ? LIVE_SNACK_POTS : overrides.snackPots
  return {
    menu: { '@context': 'https://schema.org', '@type': 'Menu', name: 'Food Menu', hasMenuSection: [] },
    sections: [
      ...(snackPots ? [section('Snack Pots', 5, snackPots)] : []),
      section(
        'Mains',
        1,
        overrides.mains ?? [
          ['Beef & Ale Pie', 16],
          ['Beer Battered Cod & Chips', 16],
          ['Bangers & Mash', 14]
        ]
      ),
      section('Pizza', 2, [
        ['Margherita', 13],
        ['Pepperoni', 14],
        ['Garlic Bread', 10]
      ]),
      section('Burgers', 3, [
        ['Classic Beef Burger', 11],
        ['Spicy Chicken Stack', 14]
      ]),
      section('Light Bites', 4, [
        ['Fish Finger Wrap', 10],
        ['Chips', 4]
      ])
    ]
  }
}

const WEEKDAY = {
  opens: '12:00:00',
  closes: '22:00:00',
  kitchen: { opens: '12:00:00', closes: '21:00:00' },
  is_kitchen_closed: false,
  schedule_config: [
    { name: 'Lunch', starts_at: '12:00', ends_at: '15:00', booking_type: 'regular' },
    { name: 'Dinner', starts_at: '16:00', ends_at: '21:00', booking_type: 'regular' }
  ]
}

// /business/hours as served on 10 September 2026.
const LIVE_HOURS = {
  regularHours: {
    monday: { opens: '16:00:00', closes: '22:00:00', kitchen: null, is_kitchen_closed: true },
    tuesday: WEEKDAY,
    wednesday: WEEKDAY,
    thursday: WEEKDAY,
    friday: WEEKDAY,
    saturday: { opens: '12:00:00', closes: '22:00:00', kitchen: { opens: '12:00:00', closes: '19:00:00' }, is_kitchen_closed: false },
    sunday: { opens: '12:00:00', closes: '22:00:00', kitchen: { opens: '13:00:00', closes: '18:00:00' }, is_kitchen_closed: false }
  },
  specialHours: [],
  upcomingVersions: []
} as unknown as BusinessHours

// BookTableButton navigates by assigning window.location.href, which jsdom
// refuses to do for real.
const originalLocation = window.location
let currentHref = 'http://localhost/lunch-and-dinner'

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    enumerable: true,
    value: {
      get href() {
        return currentHref
      },
      set href(value: string) {
        currentHref = value
      },
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      origin: originalLocation.origin,
      pathname: '/lunch-and-dinner',
      search: '',
      hash: ''
    }
  })
})

afterAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    enumerable: true,
    value: originalLocation
  })
})

// How a Meta ad lands on the page: through its short link, tags on the address.
const PAID_LANDING_URL =
  'http://localhost/lunch-and-dinner?utm_source=facebook&utm_medium=paid_social&utm_campaign=weekday_lunch_a_cod_and_chips&utm_content=ad__var_1&short_code=jbozdk'

beforeEach(() => {
  jest.clearAllMocks()
  currentHref = 'http://localhost/lunch-and-dinner'
  jest.mocked(anchorAPI.getMenu).mockResolvedValue(liveShapedMenu())
  jest.mocked(getBusinessHoursSnapshot).mockResolvedValue(LIVE_HOURS)
})

afterEach(() => {
  // Forget any cookie choice a test made.
  document.cookie = 'anchor-cookie-consent=; path=/; max-age=0'
})

type PageSearchParams = Record<string, string | string[] | undefined>

// Next always hands a page its `searchParams`, empty when the address has no
// query. So a test that passes nothing is a test of the default page, exactly
// as a visitor with no ad tags gets it.
async function renderPage(searchParams: PageSearchParams = {}) {
  return render((await LunchAndDinnerPage({ searchParams })) as ReactElement)
}

function dishCards(): HTMLElement[] {
  return within(document.getElementById('dishes') as HTMLElement).queryAllByRole('listitem')
}

function dishNames(): Array<string | null> {
  return dishCards().map((card) => within(card).getByRole('heading', { level: 3 }).textContent)
}

function hero(): HTMLElement {
  return document.querySelector('[data-hero]') as HTMLElement
}

// The hero photo is a next/image, so its src is the optimiser URL with the
// file path inside it.
function heroImagePath(): string {
  const src = hero().querySelector('img')?.getAttribute('src') ?? ''
  return decodeURIComponent(src)
}

// The two time badges, in the order they appear in the hero.
function heroBadges(): Array<string | null> {
  return within(hero())
    .queryAllByText(/^(Lunch|Dinner) \d/)
    .map((badge) => badge.textContent)
}

const DEFAULT_DISH_ORDER = [
  'Beer Battered Cod & Chips',
  'Spicy Chicken Stack',
  'Beef & Ale Pie',
  'Stone-baked pizzas',
  'Fish Finger Wrap',
  'Bangers & Mash'
]

describe('/lunch-and-dinner', () => {
  it('states lunch and dinner Tuesday to Friday with the times from the live hours', async () => {
    await renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Lunch and dinner, Tuesday to Friday' })).toBeInTheDocument()
    expect(screen.getByText('Lunch 12pm to 3pm')).toBeInTheDocument()
    expect(screen.getByText('Dinner 4pm to 9pm')).toBeInTheDocument()
  })

  it('shows the six dishes by their live names and bare live prices, in order', async () => {
    await renderPage()

    const cards = dishCards()
    expect(cards.map((card) => within(card).getByRole('heading', { level: 3 }).textContent)).toEqual([
      'Beer Battered Cod & Chips',
      'Spicy Chicken Stack',
      'Beef & Ale Pie',
      'Stone-baked pizzas',
      'Fish Finger Wrap',
      'Bangers & Mash'
    ])
    expect(within(cards[0]).getByText('16')).toBeInTheDocument()
    expect(within(cards[4]).getByText('10')).toBeInTheDocument()
    // The pizza card never names a pizza: it is priced from the cheapest live
    // pizza, and garlic bread (10) is not a pizza.
    expect(within(cards[3]).getByText('from £13')).toBeInTheDocument()
    // Single dish prices are shown bare (SSOT); only the "from" price carries a £.
    const withPound = cards.filter((card) => card.textContent?.includes('£'))
    expect(withPound).toEqual([cards[3]])
  })

  it('gives every card its photo, with alt text that describes it', async () => {
    await renderPage()

    const cards = dishCards()
    const images = cards.map((card) => within(card).queryByRole('img'))
    expect(images.filter(Boolean)).toHaveLength(6)
    expect(images[0]).toHaveAttribute('alt', expect.stringMatching(/^Beer battered cod and chips/))
    expect(images[3]).toHaveAttribute('alt', expect.stringMatching(/^A stone-baked pizza/))
    expect(images[5]).toHaveAttribute('alt', expect.stringMatching(/^Bangers and mash/))
  })

  it('leaves a card out when its dish is no longer on the menu', async () => {
    jest.mocked(anchorAPI.getMenu).mockResolvedValue(
      liveShapedMenu({ mains: [['Beef & Ale Pie', 16], ['Beer Battered Cod & Chips', 16]] })
    )
    await renderPage()

    const names = dishCards().map((card) => within(card).getByRole('heading', { level: 3 }).textContent)
    expect(names).toHaveLength(5)
    expect(names).not.toContain('Bangers & Mash')
  })

  it('shows the unavailable message and the phone number when the menu service fails', async () => {
    jest.mocked(anchorAPI.getMenu).mockRejectedValue(new Error('management API down'))
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    await renderPage()
    warn.mockRestore()

    const dishes = document.getElementById('dishes') as HTMLElement
    expect(within(dishes).getByText('Menu temporarily unavailable. Please call us on 01753 682707.')).toBeInTheDocument()
    expect(within(dishes).getByRole('link', { name: `Call ${CONTACT.phone}` })).toHaveAttribute(
      'href',
      `tel:${CONTACT.phoneIntl}`
    )
    expect(dishCards()).toHaveLength(0)
  })

  it('states no times when the hours cannot be read', async () => {
    jest.mocked(getBusinessHoursSnapshot).mockResolvedValue(null)
    await renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Lunch and dinner at The Anchor' })).toBeInTheDocument()
    expect(screen.queryByText(/^Lunch \d/)).not.toBeInTheDocument()
  })

  // BookTableButton is a button that navigates in its click handler, so these
  // assert where the browser was actually sent, not an href attribute.
  it('sends both Book buttons straight to the booking form, tagged with the landing page source', async () => {
    await renderPage()

    const buttons = screen.getAllByRole('button', { name: 'Book a table' })
    expect(buttons).toHaveLength(2)
    for (const button of buttons) {
      currentHref = 'http://localhost/lunch-and-dinner'
      fireEvent.click(button)
      // The query comes before the fragment, or the source would be lost.
      expect(currentHref).toBe('/book-table?source=lunch_dinner_lp#booking-form')
    }
    // A source containing "sunday" would open the form as a Sunday roast booking.
    expect(currentHref).not.toMatch(/sunday/i)
  })

  it('carries the ad tags from a paid landing URL through both Book buttons, ending at the form', async () => {
    await renderPage({ utm_campaign: CAMPAIGNS.lunchA })

    const buttons = screen.getAllByRole('button', { name: 'Book a table' })
    expect(buttons).toHaveLength(2)
    for (const button of buttons) {
      // How a Meta ad lands here: through the short link, with its tags on the URL.
      currentHref = PAID_LANDING_URL
      fireEvent.click(button)
      expect(currentHref).toBe(
        '/book-table?source=lunch_dinner_lp&utm_source=facebook&utm_medium=paid_social&utm_campaign=weekday_lunch_a_cod_and_chips&utm_content=ad__var_1&short_code=jbozdk#booking-form'
      )

      const target = new URL(currentHref, 'http://localhost')
      expect(target.pathname).toBe('/book-table')
      expect(target.hash).toBe('#booking-form')
      expect(Object.fromEntries(target.searchParams)).toEqual({
        source: 'lunch_dinner_lp',
        utm_source: 'facebook',
        utm_medium: 'paid_social',
        utm_campaign: 'weekday_lunch_a_cod_and_chips',
        utm_content: 'ad__var_1',
        short_code: 'jbozdk'
      })
    }
  })

  it.each([
    ['before any cookie choice', () => undefined],
    ['with cookies declined', () => rejectAllCookies()]
  ])('carries the ad tags %s, and writes nothing to the device', async (_label, setConsent) => {
    setConsent()
    await renderPage({ utm_campaign: CAMPAIGNS.dinnerA })

    const setItem = jest.spyOn(Storage.prototype, 'setItem')
    const setCookie = jest.spyOn(Document.prototype, 'cookie', 'set')
    try {
      for (const button of screen.getAllByRole('button', { name: 'Book a table' })) {
        currentHref = PAID_LANDING_URL
        fireEvent.click(button)

        const target = new URL(currentHref, 'http://localhost')
        expect(target.pathname).toBe('/book-table')
        expect(target.searchParams.get('source')).toBe('lunch_dinner_lp')
        expect(target.searchParams.get('utm_campaign')).toBe('weekday_lunch_a_cod_and_chips')
        expect(target.searchParams.get('utm_content')).toBe('ad__var_1')
        expect(target.searchParams.get('short_code')).toBe('jbozdk')
        expect(target.hash).toBe('#booking-form')
      }
      // The tags travel in the address only: no cookie, no browser storage.
      expect(setItem).not.toHaveBeenCalled()
      expect(setCookie).not.toHaveBeenCalled()
    } finally {
      setItem.mockRestore()
      setCookie.mockRestore()
    }
  })

  it('stays out of search: noindex, self-canonical and not in the sitemap', () => {
    expect(metadata.robots).toEqual({ index: false, follow: true })
    expect(metadata.alternates?.canonical).toBe('./')

    const sitemap = fs.readFileSync(path.join(process.cwd(), 'app', 'sitemap.ts'), 'utf8')
    expect(sitemap).not.toContain('lunch-and-dinner')
  })
})

const CAMPAIGNS = {
  lunchA: 'weekday_lunch_a_cod_and_chips',
  lunchB: 'weekday_lunch_b_spicy_chicken_stack',
  dinnerA: 'weekday_dinner_a_pizza',
  dinnerB: 'weekday_dinner_b_beef_and_ale_pie'
} as const

const IMAGE_DIR = '/images/food/weekday-2026'

const LUNCH_DISH_ORDER = [
  'Snack pots',
  'Fish Finger Wrap',
  'Beer Battered Cod & Chips',
  'Spicy Chicken Stack',
  'Beef & Ale Pie',
  'Stone-baked pizzas',
  'Bangers & Mash'
]

describe('/lunch-and-dinner matches the ad it was reached from', () => {
  it.each([
    [CAMPAIGNS.lunchA, 'beer-battered-cod-and-chips.jpg', 'Lunch, Tuesday to Friday', 'Snack pots'],
    [CAMPAIGNS.lunchB, 'spicy-chicken-stack.jpg', 'Lunch, Tuesday to Friday', 'Snack pots'],
    [CAMPAIGNS.dinnerA, 'stone-baked-pizza.jpg', 'Dinner, Tuesday to Friday', 'Stone-baked pizzas'],
    [CAMPAIGNS.dinnerB, 'beef-and-ale-pie.jpg', 'Dinner, Tuesday to Friday', 'Beef & Ale Pie']
  ])('%s shows its own hero image, title and first dish', async (campaign, image, title, firstDish) => {
    await renderPage({ utm_campaign: campaign })

    expect(heroImagePath()).toContain(`${IMAGE_DIR}/${image}`)
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(dishNames()[0]).toBe(firstDish)
  })

  it.each([
    [CAMPAIGNS.lunchA, LUNCH_DISH_ORDER],
    [CAMPAIGNS.lunchB, LUNCH_DISH_ORDER],
    [
      CAMPAIGNS.dinnerA,
      ['Stone-baked pizzas', 'Beef & Ale Pie', 'Beer Battered Cod & Chips', 'Spicy Chicken Stack', 'Fish Finger Wrap', 'Bangers & Mash']
    ],
    [
      CAMPAIGNS.dinnerB,
      ['Beef & Ale Pie', 'Stone-baked pizzas', 'Beer Battered Cod & Chips', 'Spicy Chicken Stack', 'Fish Finger Wrap', 'Bangers & Mash']
    ]
  ])('%s puts the dishes from the ad first, then the usual list, with no card twice', async (campaign, order) => {
    await renderPage({ utm_campaign: campaign })

    const names = dishNames()
    expect(names).toEqual(order)
    expect(new Set(names).size).toBe(names.length)
  })

  it('puts the lunch time first for a lunch ad and the dinner time first for a dinner ad, keeping both', async () => {
    const lunch = await renderPage({ utm_campaign: CAMPAIGNS.lunchB })
    expect(heroBadges()).toEqual(['Lunch 12pm to 3pm', 'Dinner 4pm to 9pm'])
    lunch.unmount()

    await renderPage({ utm_campaign: CAMPAIGNS.dinnerA })
    expect(heroBadges()).toEqual(['Dinner 4pm to 9pm', 'Lunch 12pm to 3pm'])
  })

  it('matches the campaign whatever its case, and with stray spaces around it', async () => {
    const mixedCase = await renderPage({ utm_campaign: 'Weekday_Lunch_A_Cod_And_Chips' })
    expect(screen.getByRole('heading', { level: 1, name: 'Lunch, Tuesday to Friday' })).toBeInTheDocument()
    expect(dishNames()).toEqual(LUNCH_DISH_ORDER)
    mixedCase.unmount()

    await renderPage({ utm_campaign: '  WEEKDAY_DINNER_B_BEEF_AND_ALE_PIE ' })
    expect(screen.getByRole('heading', { level: 1, name: 'Dinner, Tuesday to Friday' })).toBeInTheDocument()
    expect(heroImagePath()).toContain(`${IMAGE_DIR}/beef-and-ale-pie.jpg`)
  })

  it.each<[string, PageSearchParams]>([
    ['an unknown campaign', { utm_campaign: 'weekday_brunch_c_pancakes' }],
    ['an empty campaign', { utm_campaign: '' }],
    ['a campaign of spaces', { utm_campaign: '   ' }],
    ['the same campaign given twice', { utm_campaign: [CAMPAIGNS.dinnerA, CAMPAIGNS.dinnerA] }],
    ['two different campaigns', { utm_campaign: [CAMPAIGNS.lunchA, CAMPAIGNS.dinnerA] }],
    ['a campaign that only starts like a known one', { utm_campaign: `${CAMPAIGNS.dinnerA}_extra` }],
    ['other ad tags but no campaign', { utm_source: 'facebook', utm_content: 'ad__var_1', short_code: 'jbozdk' }],
    ['no tags at all', {}]
  ])('shows the default page, unchanged, for %s', async (_label, searchParams) => {
    await renderPage(searchParams)

    expect(heroImagePath()).toContain(`${IMAGE_DIR}/beer-battered-cod-and-chips.jpg`)
    expect(screen.getByRole('heading', { level: 1, name: 'Lunch and dinner, Tuesday to Friday' })).toBeInTheDocument()
    expect(heroBadges()).toEqual(['Lunch 12pm to 3pm', 'Dinner 4pm to 9pm'])
    expect(dishNames()).toEqual(DEFAULT_DISH_ORDER)
  })

  it('shows the default page when it is handed no searchParams at all', async () => {
    render((await LunchAndDinnerPage({})) as ReactElement)

    expect(screen.getByRole('heading', { level: 1, name: 'Lunch and dinner, Tuesday to Friday' })).toBeInTheDocument()
    expect(dishNames()).toEqual(DEFAULT_DISH_ORDER)
  })

  it('never prints the campaign tag, so the address cannot put anything on the page', async () => {
    const hostile = await renderPage({ utm_campaign: '<script>window.qaInjected=1</script>qa_marker_value' })
    expect(document.body.innerHTML).not.toContain('qa_marker_value')
    expect(document.body.innerHTML).not.toContain('qaInjected')
    expect(dishNames()).toEqual(DEFAULT_DISH_ORDER)
    hostile.unmount()

    await renderPage({ utm_campaign: CAMPAIGNS.lunchA })
    expect(document.body.innerHTML).not.toContain(CAMPAIGNS.lunchA)
  })

  it('keeps one fixed title, description and share image whatever the ad', () => {
    // The metadata is a plain object, not a function of the address, so no
    // campaign can change it. The route is declared dynamic and sets no
    // revalidate, so it renders per request by statement, not by inference.
    expect(metadata.title).toBe('Weekday Lunch and Dinner Near Heathrow')
    expect(metadata.description).toMatch(/^Lunch and dinner at The Anchor in Stanwell Moor/)
    expect(metadata.robots).toEqual({ index: false, follow: true })
    expect(metadata.alternates?.canonical).toBe('./')
    expect(metadata.openGraph?.images).toEqual([
      expect.objectContaining({ url: `${IMAGE_DIR}/beer-battered-cod-and-chips.jpg` })
    ])
    expect('generateMetadata' in lunchAndDinnerPageModule).toBe(false)
    expect(dynamic).toBe('force-dynamic')
    expect('revalidate' in lunchAndDinnerPageModule).toBe(false)
  })
})

describe('the snack pots card', () => {
  async function renderLunchPage() {
    return renderPage({ utm_campaign: CAMPAIGNS.lunchA })
  }

  it('shows "from £9" from the live menu, as a text tile with no photo', async () => {
    await renderLunchPage()

    const [card] = dishCards()
    expect(within(card).getByRole('heading', { level: 3, name: 'Snack pots' })).toBeInTheDocument()
    expect(within(card).getByText('from £9')).toBeInTheDocument()
    expect(within(card).getByText('Snack Pots')).toBeInTheDocument()
    // There is no snack pot photo, so the card must not borrow one.
    expect(within(card).queryByRole('img')).not.toBeInTheDocument()
  })

  it('is priced from the cheapest snack pot, showing pence when there are any', async () => {
    jest.mocked(anchorAPI.getMenu).mockResolvedValue(
      liveShapedMenu({ snackPots: [['Fish Fingers & Chips', 11], ['Chicken Goujons & Chips', 9.5]] })
    )
    await renderLunchPage()

    expect(within(dishCards()[0]).getByText('from £9.50')).toBeInTheDocument()
  })

  it('is the only new card: the default page does not show it', async () => {
    await renderPage()

    expect(dishNames()).not.toContain('Snack pots')
  })

  it.each<[string, Array<[string, FixturePrice]> | null]>([
    ['the Snack Pots section is missing', null],
    ['the section is there but empty', []],
    ['every price is missing', [['Fish Fingers & Chips', undefined], ['Chicken Goujons & Chips', null]]],
    ['every price is invalid', [['Fish Fingers & Chips', 'ask at the bar'], ['Chicken Goujons & Chips', 0], ['Salt & Chilli Squid & Chips', -9]]]
  ])('is left out when %s, and the rest of the lunch page still shows', async (_label, snackPots) => {
    jest.mocked(anchorAPI.getMenu).mockResolvedValue(liveShapedMenu({ snackPots }))
    await renderLunchPage()

    const names = dishNames()
    expect(names).not.toContain('Snack pots')
    expect(names).toEqual(LUNCH_DISH_ORDER.slice(1))
    expect(document.getElementById('dishes')?.textContent).not.toMatch(/from £(0|NaN|-)/)
  })

  it('ignores a bad price and uses the snack pots that do have one', async () => {
    jest.mocked(anchorAPI.getMenu).mockResolvedValue(
      liveShapedMenu({ snackPots: [['Fish Fingers & Chips', 'ask at the bar'], ['Chicken Goujons & Chips', 9]] })
    )
    await renderLunchPage()

    expect(within(dishCards()[0]).getByText('from £9')).toBeInTheDocument()
  })

  it('is left out, with every other card, when the menu is unavailable', async () => {
    jest.mocked(anchorAPI.getMenu).mockRejectedValue(new Error('management API down'))
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    await renderLunchPage()
    warn.mockRestore()

    expect(dishCards()).toHaveLength(0)
    expect(screen.queryByText('Snack pots')).not.toBeInTheDocument()
    expect(screen.getByText('Menu temporarily unavailable. Please call us on 01753 682707.')).toBeInTheDocument()
    // The hero still matches the ad even with no menu to show.
    expect(screen.getByRole('heading', { level: 1, name: 'Lunch, Tuesday to Friday' })).toBeInTheDocument()
  })
})

const menuItem = (name: string, sectionTitle: string, priceValue: number) =>
  ({
    id: name.toLowerCase(),
    name,
    price: String(priceValue),
    description: '',
    priceValue,
    priceLabel: '',
    categoryId: 'food',
    categoryTitle: sectionTitle,
    sectionId: sectionTitle.toLowerCase(),
    sectionTitle,
    dietaryInfo: [],
    allergens: []
  }) as MenuPageItem

describe('resolveLunchDinnerVariant', () => {
  const menu = {
    items: [
      menuItem('Beer Battered Cod & Chips', 'Mains', 16),
      menuItem('Beef & Ale Pie', 'Mains', 16),
      menuItem('Margherita', 'Pizza', 13),
      menuItem('Fish Finger Wrap', 'Light Bites', 10),
      menuItem('Fish Fingers & Chips', 'Snack Pots', 9)
    ]
  }
  const firstDish = (utmCampaign: string) =>
    pickLunchAndDinnerDishes(menu, resolveLunchDinnerVariant(utmCampaign).picks)[0]?.item.name

  it.each([
    [CAMPAIGNS.lunchA, 'lunch', 'beer-battered-cod-and-chips.jpg', 'Lunch, Tuesday to Friday', 'Snack pots'],
    [CAMPAIGNS.lunchB, 'lunch', 'spicy-chicken-stack.jpg', 'Lunch, Tuesday to Friday', 'Snack pots'],
    [CAMPAIGNS.dinnerA, 'dinner', 'stone-baked-pizza.jpg', 'Dinner, Tuesday to Friday', 'Stone-baked pizzas'],
    [CAMPAIGNS.dinnerB, 'dinner', 'beef-and-ale-pie.jpg', 'Dinner, Tuesday to Friday', 'Beef & Ale Pie']
  ])('maps %s to its service, hero image, title and first dish', (campaign, service, image, title, dish) => {
    const variant = resolveLunchDinnerVariant(campaign)

    expect(variant.service).toBe(service)
    expect(variant.heroImage).toBe(`${IMAGE_DIR}/${image}`)
    expect(variant.heroTitle).toBe(title)
    expect(firstDish(campaign)).toBe(dish)
  })

  it('uses only hero images that exist in the repository', () => {
    for (const campaign of Object.values(CAMPAIGNS)) {
      const file = path.join(process.cwd(), 'public', resolveLunchDinnerVariant(campaign).heroImage)
      expect(fs.existsSync(file)).toBe(true)
    }
  })

  it('never says "today" or "tonight" in a title', () => {
    for (const campaign of Object.values(CAMPAIGNS)) {
      expect(resolveLunchDinnerVariant(campaign).heroTitle).not.toMatch(/today|tonight|now/i)
    }
  })

  it('matches exactly, ignoring case and surrounding spaces', () => {
    expect(resolveLunchDinnerVariant('Weekday_Lunch_A_Cod_And_Chips').service).toBe('lunch')
    expect(resolveLunchDinnerVariant(' weekday_dinner_a_pizza\n').service).toBe('dinner')
  })

  it.each([
    ['nothing', undefined],
    ['null', null],
    ['an empty value', ''],
    ['spaces', '   '],
    ['an unknown value', 'weekday_brunch_c_pancakes'],
    ['a known value with extra text', 'weekday_dinner_a_pizza_extra'],
    ['a known value with a space inside', 'weekday_dinner_a pizza'],
    ['a repeated value, which arrives as a list', ['weekday_dinner_a_pizza', 'weekday_dinner_a_pizza']],
    ['a list of one', ['weekday_dinner_a_pizza']],
    ['an empty list', []],
    ['an object property name', 'constructor'],
    ['another object property name', '__proto__']
  ])('gives the default page for %s', (_label, value) => {
    const variant = resolveLunchDinnerVariant(value as string | string[] | null | undefined)

    expect(variant).toBe(DEFAULT_LUNCH_DINNER_VARIANT)
    expect(variant.service).toBe('default')
    expect(variant.heroTitle).toBeNull()
    expect(variant.heroImage).toBe(`${IMAGE_DIR}/beer-battered-cod-and-chips.jpg`)
  })

  it('leaves the default dish list as it was', () => {
    const dishes = pickLunchAndDinnerDishes(menu, DEFAULT_LUNCH_DINNER_VARIANT.picks)
    expect(dishes.map((dish) => dish.item.name)).toEqual([
      'Beer Battered Cod & Chips',
      'Beef & Ale Pie',
      'Stone-baked pizzas',
      'Fish Finger Wrap'
    ])
    expect(pickLunchAndDinnerDishes(menu)).toEqual(dishes)
  })

  it('matches the snack pots section by its exact name only', () => {
    const picks = resolveLunchDinnerVariant(CAMPAIGNS.lunchA).picks
    const names = (sectionTitle: string) =>
      pickLunchAndDinnerDishes({ items: [menuItem('Fish Fingers & Chips', sectionTitle, 9)] }, picks).map(
        (dish) => dish.item.name
      )

    expect(names('Snack Pots')).toEqual(['Snack pots'])
    expect(names('snack pot')).toEqual(['Snack pots'])
    expect(names(' Snack Pots ')).toEqual(['Snack pots'])
    expect(names('Snack Pots & Sides')).toEqual([])
    expect(names('Bar Snacks')).toEqual([])
  })
})

const REGULAR_WALK_IN_LINE =
  'No need to book. Just come in: lunch 12pm to 3pm, dinner 4pm to 9pm, Tuesday to Friday.'
const DINNER_FIRST_WALK_IN_LINE =
  'No need to book. Just come in: dinner 4pm to 9pm, lunch 12pm to 3pm, Tuesday to Friday.'
const NO_TIMES_WALK_IN_LINE = 'No need to book, just come in, Tuesday to Friday.'

// Wording that would promise something about right now. The page states the
// regular week only (owner decision D9), because an ad link can be opened on a
// Sunday, after service or on a day the kitchen is shut.
const IMMEDIATE_WORDING = /\b(today|tonight|now|this (lunchtime|afternoon|evening))\b/i

function walkInLine(): string | null | undefined {
  return hero().querySelector('[data-hero-note]')?.textContent
}

// Every piece of text in the hero, a space between each. `textContent` alone
// runs neighbouring elements together ("...tonightProper pub food..."), which
// hides a word from a whole-word search.
function heroText(): string {
  const walker = document.createTreeWalker(hero(), NodeFilter.SHOW_TEXT)
  const parts: string[] = []
  while (walker.nextNode()) parts.push(walker.currentNode.textContent ?? '')
  return parts.join(' ')
}

// Tuesday to Friday with the sittings given. `friday` lets one day differ.
function hoursWithWeekdaySittings(
  sittings: Array<{ name: string; starts_at: string; ends_at: string }>,
  friday?: typeof WEEKDAY
): BusinessHours {
  const day = {
    ...WEEKDAY,
    schedule_config: sittings.map((sitting) => ({ ...sitting, booking_type: 'regular' }))
  }
  const regularHours = (LIVE_HOURS as unknown as { regularHours: Record<string, unknown> }).regularHours
  return {
    ...(LIVE_HOURS as object),
    regularHours: { ...regularHours, tuesday: day, wednesday: day, thursday: day, friday: friday ?? day }
  } as unknown as BusinessHours
}

describe('the walk-in line under the hero buttons', () => {
  it('says there is no need to book, with the regular times from the live hours', async () => {
    await renderPage()

    expect(walkInLine()).toBe(REGULAR_WALK_IN_LINE)
  })

  it('sits under the three hero actions, the third being directions to the pub', async () => {
    await renderPage()

    const actions = [
      within(hero()).getByRole('button', { name: 'Book a table' }),
      within(hero()).getByRole('link', { name: 'See the full menu' }),
      within(hero()).getByRole('link', { name: 'Get directions' })
    ]
    const note = hero().querySelector('[data-hero-note]') as HTMLElement
    for (let index = 1; index < actions.length; index += 1) {
      expect(actions[index - 1].compareDocumentPosition(actions[index]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
    expect(actions[2].compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(actions[2]).toHaveAttribute('href', '/find-us')
  })

  it('puts lunch first for a lunch ad and dinner first for a dinner ad', async () => {
    const lunch = await renderPage({ utm_campaign: CAMPAIGNS.lunchA })
    expect(walkInLine()).toBe(REGULAR_WALK_IN_LINE)
    lunch.unmount()

    const dinnerA = await renderPage({ utm_campaign: CAMPAIGNS.dinnerA })
    expect(walkInLine()).toBe(DINNER_FIRST_WALK_IN_LINE)
    dinnerA.unmount()

    await renderPage({ utm_campaign: CAMPAIGNS.dinnerB })
    expect(walkInLine()).toBe(DINNER_FIRST_WALK_IN_LINE)
  })

  it.each([
    ['the hours come back empty', () => jest.mocked(getBusinessHoursSnapshot).mockResolvedValue(null as unknown as BusinessHours)],
    ['the hours request fails', () => jest.mocked(getBusinessHoursSnapshot).mockRejectedValue(new Error('management API down'))]
  ])('drops the times but keeps Tuesday to Friday when %s', async (_label, breakHours) => {
    breakHours()
    await renderPage({ utm_campaign: CAMPAIGNS.dinnerA })

    expect(walkInLine()).toBe(NO_TIMES_WALK_IN_LINE)
    // No time of any kind in the hero: better none than a stale one.
    expect(heroText()).not.toMatch(/\d\s?(am|pm)\b/i)
    expect(screen.getByRole('link', { name: 'Get directions' })).toHaveAttribute('href', '/find-us')
  })

  it('shows only the window that is there when the lunch sitting is missing', async () => {
    jest.mocked(getBusinessHoursSnapshot).mockResolvedValue(
      hoursWithWeekdaySittings([{ name: 'Dinner', starts_at: '16:00', ends_at: '21:00' }])
    )
    await renderPage({ utm_campaign: CAMPAIGNS.lunchA })

    expect(walkInLine()).toBe('No need to book. Just come in: 4pm to 9pm, Tuesday to Friday.')
    expect(walkInLine()).not.toContain('12pm')
  })

  it('shows only the window that is there when the dinner sitting is missing', async () => {
    jest.mocked(getBusinessHoursSnapshot).mockResolvedValue(
      hoursWithWeekdaySittings([{ name: 'Lunch', starts_at: '12:00', ends_at: '15:00' }])
    )
    await renderPage({ utm_campaign: CAMPAIGNS.dinnerA })

    expect(walkInLine()).toBe('No need to book. Just come in: 12pm to 3pm, Tuesday to Friday.')
    expect(walkInLine()).not.toContain('9pm')
  })

  it('drops the times when the four days do not all keep the same ones', async () => {
    const lateFriday = {
      ...WEEKDAY,
      kitchen: { opens: '12:00:00', closes: '22:00:00' },
      schedule_config: [
        { name: 'Lunch', starts_at: '12:00', ends_at: '15:00', booking_type: 'regular' },
        { name: 'Dinner', starts_at: '16:00', ends_at: '22:00', booking_type: 'regular' }
      ]
    }
    jest.mocked(getBusinessHoursSnapshot).mockResolvedValue(
      hoursWithWeekdaySittings(
        [
          { name: 'Lunch', starts_at: '12:00', ends_at: '15:00' },
          { name: 'Dinner', starts_at: '16:00', ends_at: '21:00' }
        ],
        lateFriday
      )
    )
    await renderPage()

    expect(walkInLine()).toBe(NO_TIMES_WALK_IN_LINE)
  })

  describe('with the clock fixed', () => {
    // Only the clock is faked. The page awaits its data, and faking the timers
    // too would leave those awaits hanging.
    function freezeAt(instant: string) {
      jest.useFakeTimers({
        now: new Date(instant),
        doNotFake: [
          'cancelAnimationFrame', 'cancelIdleCallback', 'clearImmediate', 'clearInterval', 'clearTimeout',
          'hrtime', 'nextTick', 'performance', 'queueMicrotask', 'requestAnimationFrame',
          'requestIdleCallback', 'setImmediate', 'setInterval', 'setTimeout'
        ]
      })
    }

    afterEach(() => {
      jest.useRealTimers()
    })

    // A Tuesday in the fixture's regular week on which the kitchen is shut.
    const KITCHEN_CLOSED_TUESDAY = {
      date: '2026-10-13',
      opens: '12:00:00',
      closes: '22:00:00',
      kitchen: null,
      is_closed: false,
      is_kitchen_closed: true,
      status: 'modified',
      note: 'Kitchen closed',
      schedule_config: []
    }

    // Instants are UTC. London is on BST (UTC+1) until 01:00 UTC on Sunday
    // 25 October 2026, then on GMT until 01:00 UTC on Sunday 28 March 2027.
    it.each([
      ['a Sunday, when there is no weekday service (13:00 BST, 4 October 2026)', '2026-10-04T12:00:00Z', []],
      ['a Wednesday after dinner service has ended (21:30 BST, 7 October 2026)', '2026-10-07T20:30:00Z', []],
      ['a Monday, when the kitchen is always closed (18:00 BST, 5 October 2026)', '2026-10-05T17:00:00Z', []],
      ['a Tuesday with a one-off kitchen closure (12:30 BST, 13 October 2026)', '2026-10-13T11:30:00Z', [KITCHEN_CLOSED_TUESDAY]],
      ['the Friday before the clocks go back (12:30 BST, 23 October 2026)', '2026-10-23T11:30:00Z', []],
      ['half an hour before the clocks go back (01:30 BST, 25 October 2026)', '2026-10-25T00:30:00Z', []],
      ['half an hour after the clocks go back (01:30 GMT, 25 October 2026)', '2026-10-25T01:30:00Z', []],
      ['the Tuesday after the clocks go back (12:30 GMT, 27 October 2026)', '2026-10-27T12:30:00Z', []],
      ['half an hour before the clocks go forward (00:30 GMT, 28 March 2027)', '2027-03-28T00:30:00Z', []],
      ['half an hour after the clocks go forward (02:30 BST, 28 March 2027)', '2027-03-28T01:30:00Z', []]
    ])('stays the regular line on %s', async (_label, instant, specialHours) => {
      freezeAt(instant)
      // The page reads the clock through `new Date()`, so prove it is held.
      expect(new Date().toISOString()).toBe(new Date(instant).toISOString())
      jest.mocked(getBusinessHoursSnapshot).mockResolvedValue({
        ...(LIVE_HOURS as object),
        specialHours
      } as unknown as BusinessHours)

      for (const campaign of [undefined, CAMPAIGNS.lunchA, CAMPAIGNS.dinnerA]) {
        const view = await renderPage(campaign ? { utm_campaign: campaign } : {})

        expect(walkInLine()).toBe(campaign === CAMPAIGNS.dinnerA ? DINNER_FIRST_WALK_IN_LINE : REGULAR_WALK_IN_LINE)
        // Title, lead, badges, buttons and the line: nothing claims to be
        // serving at this moment.
        expect(heroText()).not.toMatch(IMMEDIATE_WORDING)
        view.unmount()
      }
    })
  })
})

describe('buildWalkInLine', () => {
  it('names lunch then dinner for two windows, and dinner first for a dinner ad', () => {
    const windows = ['12pm to 3pm', '4pm to 9pm']

    expect(buildWalkInLine(windows)).toBe(REGULAR_WALK_IN_LINE)
    expect(buildWalkInLine(windows, 'default')).toBe(REGULAR_WALK_IN_LINE)
    expect(buildWalkInLine(windows, 'lunch')).toBe(REGULAR_WALK_IN_LINE)
    expect(buildWalkInLine(windows, 'dinner')).toBe(DINNER_FIRST_WALK_IN_LINE)
  })

  it('gives a lone window as it stands, without calling it lunch or dinner', () => {
    for (const service of ['default', 'lunch', 'dinner'] as const) {
      expect(buildWalkInLine(['4pm to 9pm'], service)).toBe(
        'No need to book. Just come in: 4pm to 9pm, Tuesday to Friday.'
      )
    }
  })

  it('gives no times when there are none to give, or more than it can name', () => {
    expect(buildWalkInLine([])).toBe(NO_TIMES_WALK_IN_LINE)
    expect(buildWalkInLine([], 'dinner')).toBe(NO_TIMES_WALK_IN_LINE)
    expect(buildWalkInLine(['12pm to 2pm', '3pm to 5pm', '6pm to 9pm'])).toBe(NO_TIMES_WALK_IN_LINE)
  })

  it('always says Tuesday to Friday and never makes a claim about right now', () => {
    const cases = [[], ['4pm to 9pm'], ['12pm to 3pm', '4pm to 9pm'], ['a', 'b', 'c']]
    for (const windows of cases) {
      for (const service of ['default', 'lunch', 'dinner'] as const) {
        const line = buildWalkInLine(windows, service)
        expect(line).toMatch(/Tuesday to Friday\.$/)
        expect(line).toMatch(/^No need to book/)
        expect(line).not.toMatch(IMMEDIATE_WORDING)
      }
    }
  })
})

describe('getWeekdayServiceWindows', () => {
  it('reads the shared Tuesday to Friday sittings as text, in order', () => {
    expect(getWeekdayServiceWindows(LIVE_HOURS)).toEqual(['12pm to 3pm', '4pm to 9pm'])
    expect(getWeekdayServiceTimes(LIVE_HOURS)).toEqual({ lunch: '12pm to 3pm', dinner: '4pm to 9pm' })
  })

  it('gives one window when there is one, and names no lunch or dinner time from it', () => {
    const dinnerOnly = hoursWithWeekdaySittings([{ name: 'Dinner', starts_at: '16:00', ends_at: '21:00' }])

    expect(getWeekdayServiceWindows(dinnerOnly)).toEqual(['4pm to 9pm'])
    expect(getWeekdayServiceTimes(dinnerOnly)).toBeNull()
  })

  it('ignores a one-off closure: these are the regular times, for regular wording only', () => {
    const withClosure = {
      ...(LIVE_HOURS as object),
      specialHours: [{ date: '2026-10-13', kitchen: null, is_closed: false, is_kitchen_closed: true, status: 'modified' }]
    } as unknown as BusinessHours

    expect(getWeekdayServiceWindows(withClosure, new Date('2026-10-13T11:30:00Z'))).toEqual(['12pm to 3pm', '4pm to 9pm'])
  })
})

describe('the pizza card', () => {
  it('is priced from the cheapest pizza, never garlic bread, showing pence when there are any', () => {
    const dishes = pickLunchAndDinnerDishes({
      items: [menuItem('Garlic Bread', 'Pizza', 10), menuItem('Pepperoni', 'Pizza', 14), menuItem('Margherita', 'Pizza', 12.5)]
    })
    const pizza = dishes.find((dish) => dish.item.name === 'Stone-baked pizzas')
    expect(pizza?.item.price).toBe('from £12.50')
    expect(pizza?.item.sectionTitle).toBe('Pizza')
    expect(pizza?.image?.src).toMatch(/stone-baked-pizza\.jpg$/)
  })

  it('is left out when the only thing in the pizza section is garlic bread', () => {
    const dishes = pickLunchAndDinnerDishes({ items: [menuItem('Garlic Bread', 'Pizza', 10)] })
    expect(dishes.some((dish) => dish.item.name === 'Stone-baked pizzas')).toBe(false)
  })
})

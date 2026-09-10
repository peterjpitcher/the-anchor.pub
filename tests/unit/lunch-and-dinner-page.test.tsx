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
import LunchAndDinnerPage, { metadata } from '@/app/lunch-and-dinner/page'

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

function section(name: string, sortOrder: number, dishes: Array<[string, number]>): MenuSectionData {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    description: '',
    sort_order: sortOrder,
    items: dishes.map(([dishName, price], index) => ({
      id: `${name}-${dishName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: dishName,
      description: '',
      price,
      dietary_info: [],
      allergens: [],
      is_available: true,
      sort_order: index + 1
    }))
  }
}

// The live menu's shape on 10 September 2026, trimmed to what the page reads.
function liveShapedMenu(overrides: { mains?: Array<[string, number]> } = {}): MenuResponse {
  return {
    menu: { '@context': 'https://schema.org', '@type': 'Menu', name: 'Food Menu', hasMenuSection: [] },
    sections: [
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

beforeEach(() => {
  jest.clearAllMocks()
  currentHref = 'http://localhost/lunch-and-dinner'
  jest.mocked(anchorAPI.getMenu).mockResolvedValue(liveShapedMenu())
  jest.mocked(getBusinessHoursSnapshot).mockResolvedValue(LIVE_HOURS)
})

async function renderPage() {
  return render((await LunchAndDinnerPage()) as ReactElement)
}

function dishCards(): HTMLElement[] {
  return within(document.getElementById('dishes') as HTMLElement).queryAllByRole('listitem')
}

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
      'Pepperoni',
      'Fish Finger Wrap',
      'Bangers & Mash'
    ])
    expect(within(cards[0]).getByText('16')).toBeInTheDocument()
    expect(within(cards[3]).getByText('14')).toBeInTheDocument()
    expect(within(cards[4]).getByText('10')).toBeInTheDocument()
    // No card carries a pound sign: single dish prices are shown bare (SSOT).
    expect(cards.some((card) => card.textContent?.includes('£'))).toBe(false)
  })

  it('gives every dish but the pizza its photo, with alt text that describes the dish', async () => {
    await renderPage()

    const cards = dishCards()
    const images = cards.map((card) => within(card).queryByRole('img'))
    expect(images[3]).toBeNull() // Pepperoni is text only for now
    expect(images.filter(Boolean)).toHaveLength(5)
    expect(images[0]).toHaveAttribute('alt', expect.stringMatching(/^Beer battered cod and chips/))
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

  it('sends both Book buttons to the booking form tagged with the landing page source', async () => {
    await renderPage()

    const buttons = screen.getAllByRole('button', { name: 'Book a table' })
    expect(buttons).toHaveLength(2)
    for (const button of buttons) {
      currentHref = 'http://localhost/lunch-and-dinner'
      fireEvent.click(button)
      expect(currentHref).toBe('/book-table?source=lunch_dinner_lp')
    }
    // A source containing "sunday" would open the form as a Sunday roast booking.
    expect(currentHref).not.toMatch(/sunday/i)
  })

  it('stays out of search: noindex, self-canonical and not in the sitemap', () => {
    expect(metadata.robots).toEqual({ index: false, follow: true })
    expect(metadata.alternates?.canonical).toBe('./')

    const sitemap = fs.readFileSync(path.join(process.cwd(), 'app', 'sitemap.ts'), 'utf8')
    expect(sitemap).not.toContain('lunch-and-dinner')
  })
})

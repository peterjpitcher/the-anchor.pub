import { anchorAPI } from '@/lib/api'
import type { MenuResponse, MenuSectionData } from '@/lib/api/menu'
import {
  getFoodMenuPageData,
  getPizzaMenuPageData,
  getPriceFromLabel,
  getPriceRangeLabel,
  getSundayLunchMenuPageData
} from '@/lib/menu-page-data'

// menu-page-data reaches for React's `cache` at module scope, which is not
// available outside a server render. Same shim the other menu-page-data tests use.
jest.mock('react', () => {
  const actual = jest.requireActual('react')
  return {
    ...actual,
    cache: (fn: unknown) => fn
  }
})

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getMenu: jest.fn(),
    getSundayLunchMenu: jest.fn()
  }
}))

function section(name: string, sortOrder: number, dishes: Array<[string, number]>): MenuSectionData {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    description: '',
    sort_order: sortOrder,
    items: dishes.map(([dishName, price], index) => ({
      id: dishName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
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

// The live menu's shape on 10 September 2026, trimmed. Garlic bread is listed in
// the Pizza section, and the cheapest lines on the whole menu are sides and a
// burger add-on. That shape is what produced "Pizzas from £10", "Food £5 to
// £16" and "Food from 1.".
const LIVE_SHAPED_MENU: MenuResponse = {
  menu: {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'Food Menu',
    hasMenuSection: []
  },
  sections: [
    section('Mains', 1, [
      ['Beef & Ale Pie', 16],
      ['Beer Battered Cod & Chips', 16],
      ['Half Fish & Chips', 12],
      ['Bangers & Mash', 14]
    ]),
    section('Pizza', 2, [
      ['Margherita', 13],
      ['Pepperoni', 14],
      ['Spicy Meatball', 15],
      ['Garlic Bread', 10],
      ['Garlic Bread + Mozzarella', 12]
    ]),
    section('Burgers', 3, [
      ['Classic Beef Burger', 11],
      ['Spicy Chicken Stack', 14]
    ]),
    section('Light Bites', 4, [
      ['Fish Finger Wrap', 10],
      ['Chips', 4],
      ['Chunky Chips', 5]
    ]),
    section('Desserts', 5, [['Ice Cream Sundae', 5]]),
    section('Burger Add-ons', 6, [['Add onion rings', 1]])
  ]
}

describe('menu price labels, built by the same functions the pages call', () => {
  beforeEach(() => {
    jest.mocked(anchorAPI.getMenu).mockResolvedValue(LIVE_SHAPED_MENU)
  })

  it('leaves the garlic bread out of the pizzas, so the /food-menu badge starts at the cheapest pizza', async () => {
    const data = await getFoodMenuPageData()

    expect(data?.pizzaItems.map((item) => item.name)).toEqual(['Margherita', 'Pepperoni', 'Spicy Meatball'])
    expect(getPriceFromLabel(data?.pizzaItems ?? [])).toBe('from £13')
  })

  it('gives /pizza-menu a "from" label taken from the pizzas, with the £', async () => {
    const data = await getPizzaMenuPageData()

    expect(data?.priceFromLabel).toBe('from £13')
    expect(data?.pizzaItems.map((item) => item.name)).not.toContain('Garlic Bread')

    // The garlic bread is still on the pizza page's menu, just not in its price.
    const listed = data?.menuData.categories.flatMap((category) =>
      category.sections.flatMap((menuSection) => menuSection.items.map((item) => item.name))
    )
    expect(listed).toEqual(expect.arrayContaining(['Garlic Bread', 'Garlic Bread + Mozzarella']))
  })

  it('ranges the /food-menu "Mains" badge over the mains, burgers and pizzas only', async () => {
    const data = await getFoodMenuPageData()
    const names = data?.mainsItems.map((item) => item.name) ?? []

    expect(names).toEqual(
      expect.arrayContaining(['Beef & Ale Pie', 'Half Fish & Chips', 'Margherita', 'Classic Beef Burger'])
    )
    for (const excluded of ['Garlic Bread', 'Garlic Bread + Mozzarella', 'Chips', 'Fish Finger Wrap', 'Ice Cream Sundae', 'Add onion rings']) {
      expect(names).not.toContain(excluded)
    }
    expect(getPriceRangeLabel(data?.mainsItems ?? [])).toBe('£11 to £16')
  })

  it('keeps a single dish price bare, as the SSOT requires', async () => {
    const data = await getFoodMenuPageData()

    expect(data?.pizzaItems[0]).toMatchObject({ name: 'Margherita', price: '13', priceValue: 13 })
  })
})

describe('Sunday roast "Mains from" label', () => {
  it('carries the £ and starts at the cheapest adult main', async () => {
    jest.mocked(anchorAPI.getSundayLunchMenu).mockResolvedValue({
      menu_date: '2026-09-13',
      mains: [
        { id: 'roasted-beef', name: 'Roasted Beef', price: 18, is_available: true },
        { id: 'beef-and-ale-pie', name: 'Beef & Ale Pie', price: 16, is_available: true },
        { id: 'kids-roasted-beef', name: 'Kids Roasted Beef', price: 11, is_available: true }
      ],
      sides: []
    })

    const data = await getSundayLunchMenuPageData()

    expect(data.priceFromLabel).toBe('from £16')
  })
})

describe('price label helpers', () => {
  it('shows pence only when there are pence, and one price when there is no range', async () => {
    jest.mocked(anchorAPI.getMenu).mockResolvedValue({
      ...LIVE_SHAPED_MENU,
      sections: [section('Kids', 1, [['Kids Fish Fingers & Chips', 7], ['Kids Mac & Cheese', 11.5]])]
    })

    const data = await getFoodMenuPageData()
    const items = data?.items ?? []

    expect(getPriceRangeLabel(items)).toBe('£7 to £11.50')
    expect(getPriceRangeLabel(items.slice(0, 1))).toBe('£7')
    expect(getPriceFromLabel([])).toBeUndefined()
    expect(getPriceRangeLabel([])).toBeUndefined()
  })
})

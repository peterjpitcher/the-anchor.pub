/**
 * Dietary labels and the NGCI page, built by the same functions production
 * calls: only the management API is mocked.
 *
 * 1. Labels come from the kitchen's flags. The site used to overrule them by
 *    reading the dish text, so "Butternut" (contains "butter") lost its vegan
 *    label, and so did every burger served with "butterhead" salad.
 * 2. /food-menu/gluten-free counts and names only the dishes the kitchen flags
 *    as NGCI. It used to add every pizza and garlic bread to the count and name
 *    Margherita, Pepperoni and Spicy Meatball as NGCI dishes.
 */

import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import type { MenuResponse, MenuSectionData, SundayLunchMenuResponse } from '@/lib/api/menu'
import { anchorAPI } from '@/lib/api'
import {
  getFoodMenuPageData,
  getGlutenFreeMenuPageData,
  getSundayLunchMenuPageData,
  getVeganMenuPageData
} from '@/lib/menu-page-data'
import GlutenFreeMenuPage, { generateMetadata as glutenMetadata } from '@/app/food-menu/gluten-free/page'
import VeganMenuPage from '@/app/food-menu/vegan/page'
import { NGCI_PIZZA_BASE_WORDING } from '@/lib/ngci-menu-copy'
import { NGCI_WORDING } from '@/lib/approved-wording'

jest.mock('react', () => {
  const actual = jest.requireActual('react')
  return { ...actual, cache: (fn: unknown) => fn }
})

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getMenu: jest.fn(),
    getSundayLunchMenu: jest.fn()
  }
}))

jest.mock('next/navigation', () => ({
  usePathname: () => '/food-menu/gluten-free'
}))

type Dish = {
  name: string
  description?: string
  dietary?: string[]
  allergens?: string[]
}

function section(name: string, sortOrder: number, dishes: Dish[]): MenuSectionData {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    description: '',
    sort_order: sortOrder,
    items: dishes.map((dish, index) => ({
      id: `${name}-${dish.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: dish.name,
      description: dish.description ?? '',
      price: 10 + index,
      dietary_info: dish.dietary ?? [],
      allergens: dish.allergens ?? [],
      is_available: true,
      sort_order: index + 1
    }))
  }
}

function menu(sections: MenuSectionData[]): MenuResponse {
  return {
    menu: { '@context': 'https://schema.org', '@type': 'Menu', name: 'Food Menu', hasMenuSection: [] },
    sections
  } as MenuResponse
}

// The pizza section as the live menu served it on 7 October 2026: no flags and
// no allergen data on any of them.
const PIZZA = section('Pizza', 4, [
  { name: 'Margherita' },
  { name: 'Pepperoni' },
  { name: 'Spicy Meatball' },
  { name: 'Garlic Bread' },
  { name: 'Garlic Bread + Mozzarella' }
])

// Shaped like the live menu on 7 October 2026, plus three records that are
// wrong on purpose so the safety checks have something to catch.
const LIVE_SHAPED = menu([
  section('Light Bites', 1, [
    { name: 'Chips', dietary: ['vegan', 'vegetarian', 'dairy_free'] },
    { name: 'Chunky Chips', dietary: ['vegan', 'vegetarian', 'gluten_free'] },
    { name: 'Sweet Potato Fries', dietary: ['vegan', 'vegetarian', 'gluten_free'] },
    { name: '6 Onion Rings', dietary: ['vegan', 'vegetarian', 'dairy_free'], allergens: ['gluten'] },
    { name: 'Cheesy Chips', dietary: ['vegetarian'], allergens: ['milk'] },
    // Wrong on purpose: flagged NGCI but lists gluten. The label must go.
    { name: 'Battered Bites', dietary: ['gluten_free'], allergens: ['gluten'] }
  ]),
  section('Burgers', 2, [
    {
      name: 'Garden Veg Burger',
      description: 'A golden veg patty in a toasted bun with butterhead salad and tomato.',
      dietary: ['vegan', 'vegetarian'],
      allergens: ['sesame', 'sulphites', 'gluten', 'soya']
    },
    { name: 'Classic Beef Burger', description: 'With butterhead salad.', allergens: ['gluten', 'soya'] },
    // Wrong on purpose: flagged vegan but lists milk. The vegan label must go.
    { name: 'Halloumi Burger', dietary: ['vegan', 'vegetarian'], allergens: ['milk', 'gluten'] }
  ]),
  section('Mains', 3, [
    {
      name: 'Butternut Squash, Mixed Bean & Mature Cheddar Pie',
      dietary: ['vegetarian'],
      allergens: ['gluten', 'milk', 'eggs']
    },
    // Wrong on purpose: fish and chips is never NGCI, whatever the flag says.
    { name: 'Beer Battered Cod & Chips', dietary: ['gluten_free'], allergens: ['fish'] },
    // Wrong on purpose: flagged vegetarian but lists fish.
    { name: 'Kedgeree', dietary: ['vegetarian'], allergens: ['fish', 'eggs'] }
  ]),
  PIZZA
])

const SUNDAY: SundayLunchMenuResponse = {
  mains: [
    { id: 'beef', name: 'Roasted Beef', description: 'Topside.', price: 19, dietary_info: [], allergens: [] },
    {
      id: 'wellington',
      name: 'Beetroot & Butternut Squash Wellington',
      description:
        'Golden puff pastry filled with beetroot and butternut squash. Fully vegan as it comes. Ask if you would like buttered cabbage or a Yorkshire pudding added, both of which make the plate no longer vegan.',
      price: 17,
      dietary_info: ['vegan'],
      allergens: []
    }
  ],
  sides: []
} as unknown as SundayLunchMenuResponse

const getMenu = anchorAPI.getMenu as jest.Mock
const getSundayLunchMenu = anchorAPI.getSundayLunchMenu as jest.Mock

beforeEach(() => {
  getMenu.mockReset()
  getSundayLunchMenu.mockReset()
  getMenu.mockResolvedValue(LIVE_SHAPED)
  getSundayLunchMenu.mockResolvedValue(SUNDAY)
})

async function itemsByName() {
  const data = await getFoodMenuPageData()
  if (!data) throw new Error('menu did not build')
  return new Map(data.items.map((item) => [item.name, item]))
}

describe('dietary labels trust the kitchen flags', () => {
  it('keeps the vegan label on a dish whose text happens to contain "butter"', async () => {
    const items = await itemsByName()

    expect(items.get('Garden Veg Burger')).toMatchObject({ vegan: true, vegetarian: true })

    const sunday = await getSundayLunchMenuPageData()
    const wellington = sunday.mains.find((item) => /wellington/i.test(item.name))
    expect(wellington).toMatchObject({ vegan: true, vegetarian: true })
  })

  it('keeps the vegetarian label on a dish whose name contains a meat or dairy word', async () => {
    const items = await itemsByName()

    expect(items.get('Butternut Squash, Mixed Bean & Mature Cheddar Pie')).toMatchObject({
      vegetarian: true,
      vegan: false
    })
  })

  it('never adds a label the kitchen did not give', async () => {
    const items = await itemsByName()

    expect(items.get('Classic Beef Burger')).toMatchObject({ vegetarian: false, vegan: false })
    for (const name of ['Margherita', 'Garlic Bread + Mozzarella']) {
      expect(items.get(name)).toMatchObject({ vegetarian: false, vegan: false, veganOptionAvailable: false })
    }
  })

  it('removes a label only when a listed allergen contradicts it', async () => {
    const items = await itemsByName()

    // Vegan flag with milk listed: not vegan. Still vegetarian, which milk does not contradict.
    expect(items.get('Halloumi Burger')).toMatchObject({ vegan: false, vegetarian: true })
    // Vegetarian flag with fish listed: not vegetarian.
    expect(items.get('Kedgeree')).toMatchObject({ vegan: false, vegetarian: false })
    // An allergen that is not an animal product removes nothing.
    expect(items.get('6 Onion Rings')).toMatchObject({ vegan: true, vegetarian: true })
  })

  it('lists the Garden Veg Burger on the vegan menu, and the Wellington under Sundays', async () => {
    const data = await getVeganMenuPageData()
    expect(data?.veganItems.map((item) => item.name).sort()).toEqual([
      '6 Onion Rings',
      'Chips',
      'Chunky Chips',
      'Garden Veg Burger',
      'Sweet Potato Fries'
    ])

    const { container } = render((await VeganMenuPage()) as ReactElement)
    const text = container.textContent || ''
    expect(text).toContain('Garden Veg Burger')
    expect(text).toContain('Beetroot & Butternut Squash Wellington')
    expect(text).toContain('On the Sunday roast menu, 1pm to 6pm.')
    expect(text).not.toContain('Halloumi Burger')
    expect(text).not.toContain('Roasted Beef')
  })
})

describe('/food-menu/gluten-free names only the dishes the kitchen flags', () => {
  const PIZZA_NAMES = ['Margherita', 'Pepperoni', 'Spicy Meatball', 'Garlic Bread']

  it('flags only dishes with the kitchen flag, no gluten listed, and never fish and chips', async () => {
    const data = await getGlutenFreeMenuPageData()

    expect(data?.glutenFreeItems.map((item) => item.name)).toEqual(['Chunky Chips', 'Sweet Potato Fries'])
  })

  it('treats pizzas as "on an NGCI base on request", and garlic bread as neither', async () => {
    const data = await getGlutenFreeMenuPageData()

    expect(data?.glutenFreeOptionItems.map((item) => item.name)).toEqual([
      'Margherita',
      'Pepperoni',
      'Spicy Meatball'
    ])
  })

  it('counts garlic bread only when its own menu text says it can have an NGCI base', async () => {
    getMenu.mockResolvedValue(
      menu([
        section('Pizza', 1, [
          { name: 'Margherita' },
          { name: 'Garlic Bread', description: 'Also available on an NGCI base.' }
        ])
      ])
    )

    const data = await getGlutenFreeMenuPageData()
    expect(data?.glutenFreeOptionItems.map((item) => item.name)).toEqual(['Margherita', 'Garlic Bread'])
  })

  it('names the flagged dishes and no pizza, on the page and in its structured data', async () => {
    const { container } = render((await GlutenFreeMenuPage()) as ReactElement)
    const text = container.textContent || ''
    const structuredData = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
      .map((node) => node.innerHTML)
      .join('\n')

    expect(text).toContain('Chunky Chips')
    expect(text).toContain('Sweet Potato Fries')
    expect(text).toContain('Our kitchen flags 2 current dishes as NGCI.')
    expect(text).toContain('Our kitchen flags Chunky Chips and Sweet Potato Fries as NGCI.')

    for (const source of [text, structuredData]) {
      for (const name of PIZZA_NAMES) {
        expect(source).not.toContain(name)
      }
      expect(source).not.toMatch(/allergen details/i)
      // The old count added the pizzas and garlic breads to the flagged dishes.
      expect(source).not.toMatch(/\b(?:5|7|10) current dishes/)
    }

    // Records that are wrong on purpose stay off the page.
    expect(text).not.toContain('Battered Bites')
    expect(text).not.toContain('Beer Battered Cod')
  })

  it('says separately that pizzas can be made on an NGCI base, with the approved NGCI wording', async () => {
    const { container } = render((await GlutenFreeMenuPage()) as ReactElement)
    const text = (container.textContent || '').replace(/\s+/g, ' ')

    expect(text).toContain(NGCI_PIZZA_BASE_WORDING)
    expect(text).toContain(NGCI_WORDING)
  })

  it('counts only the flagged dishes in the search description', async () => {
    const metadata = await glutenMetadata()
    const description = String(metadata.description)

    expect(description).toContain('2 dishes our kitchen flags as NGCI.')
    expect(description).toContain('Pizzas on an NGCI base on request.')
    expect(description).not.toMatch(/allergen details/i)
    expect(description).not.toMatch(/\b(?:5|7|10) (?:current )?dishes/)
    // The search phrase stays, as the SSOT allows on search-facing text.
    expect(description).toContain('gluten free options')
  })

  it('with pizza-only data, names no pizza as an NGCI dish', async () => {
    getMenu.mockResolvedValue(menu([PIZZA]))

    const { container } = render((await GlutenFreeMenuPage()) as ReactElement)
    const text = (container.textContent || '').replace(/\s+/g, ' ')

    for (const name of PIZZA_NAMES) {
      expect(text).not.toContain(name)
    }
    expect(text).toContain('Our kitchen does not flag any dish as NGCI right now.')
    expect(text).toContain(NGCI_PIZZA_BASE_WORDING)

    const description = String((await glutenMetadata()).description)
    expect(description).not.toMatch(/\d+ (?:current )?dish/)
  })
})

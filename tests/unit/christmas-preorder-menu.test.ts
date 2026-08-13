/**
 * The Christmas dish list comes from the booking period rather than the priced
 * `christmas` menu container. These tests pin the two things that decide whether
 * a visitor sees the menu at all: which date we ask the API about, and which
 * answers we are willing to publish.
 */

const getBookingPeriodCached = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBookingPeriodCached: (...args: unknown[]) => getBookingPeriodCached(...args),
  },
}))

import {
  getChristmasPreorderMenu,
  resolveChristmasMenuProbeDate,
} from '@/lib/christmas-preorder-menu'
import { CHRISTMAS_WINDOW_END, CHRISTMAS_WINDOW_START } from '@/lib/christmas-season'

function menuItem(course: string, name: string, price: number | null = null) {
  return { id: `${course}-${name}`, course, name, description: `${name} description`, price_gbp: price, allergens: null }
}

function christmasPeriod(overrides: Record<string, unknown> = {}) {
  return {
    period: {
      id: 'period-1',
      code: 'christmas-2026',
      period_kind: 'christmas',
      name: 'Christmas dinner 2026',
      guest_question: 'Is this a Christmas dinner booking?',
      guest_blurb: null,
      starts_on: CHRISTMAS_WINDOW_START,
      ends_on: CHRISTMAS_WINDOW_END,
      requires_preorder: true,
      preorder_cutoff_days: 7,
      deposit_basis: 'per_head',
      deposit_amount: 10,
      refund_cutoff_days: 7,
      min_party_size: 6,
      max_party_size: 20,
      min_notice_hours: 24,
      bookable: true,
      not_bookable_reason: null,
      not_bookable_message: null,
      menu: [
        menuItem('starter', 'Seasonal Soup'),
        menuItem('main', 'Christmas Dinner - Turkey'),
        menuItem('main', 'Christmas Dinner - Vegetable Wellington (VG)'),
        menuItem('main', 'Kids Christmas Dinner, Turkey'),
        menuItem('dessert', 'Steamed Christmas pudding'),
        menuItem('addon', 'Farmhouse cheeseboard', 7.95),
      ],
      ...overrides,
    },
    date: CHRISTMAS_WINDOW_START,
    deposit: null,
  }
}

beforeEach(() => {
  getBookingPeriodCached.mockReset()
})

describe('resolveChristmasMenuProbeDate', () => {
  it('asks about a date inside the service window', () => {
    const probe = resolveChristmasMenuProbeDate('2026-08-12')
    expect(probe).not.toBeNull()
    expect(probe! >= CHRISTMAS_WINDOW_START).toBe(true)
    expect(probe! <= CHRISTMAS_WINDOW_END).toBe(true)
  })

  it('never probes a Monday, when the kitchen is closed', () => {
    // Every day of one week, so the Monday-skip is exercised from each start.
    for (let day = 0; day < 7; day++) {
      const today = `2026-11-${String(9 + day).padStart(2, '0')}`
      const probe = resolveChristmasMenuProbeDate(today)
      if (!probe) continue
      expect(new Date(`${probe}T00:00:00Z`).getUTCDay()).not.toBe(1)
    }
  })

  it('clears the notice rule rather than probing today', () => {
    const probe = resolveChristmasMenuProbeDate('2026-12-01')
    expect(probe).not.toBeNull()
    expect(probe! > '2026-12-01').toBe(true)
  })

  it('returns null once the window has passed', () => {
    expect(resolveChristmasMenuProbeDate('2027-01-05')).toBeNull()
  })
})

describe('getChristmasPreorderMenu', () => {
  it('groups the dishes by course and splits the kids mains out', async () => {
    getBookingPeriodCached.mockResolvedValue(christmasPeriod())

    const menu = await getChristmasPreorderMenu()

    expect(menu).not.toBeNull()
    expect(menu!.starters.map(i => i.name)).toEqual(['Seasonal Soup'])
    expect(menu!.mains.map(i => i.name)).toEqual([
      'Christmas Dinner - Turkey',
      'Christmas Dinner - Vegetable Wellington (VG)',
    ])
    expect(menu!.kidsMains.map(i => i.name)).toEqual(['Kids Christmas Dinner, Turkey'])
    expect(menu!.desserts.map(i => i.name)).toEqual(['Steamed Christmas pudding'])
    expect(menu!.addons.map(i => i.name)).toEqual(['Farmhouse cheeseboard'])
    expect(menu!.preorderCutoffDays).toBe(7)
  })

  it('drops empty courses from the rendered groups', async () => {
    getBookingPeriodCached.mockResolvedValue(
      christmasPeriod({ menu: [menuItem('main', 'Christmas Dinner - Turkey')] })
    )

    const menu = await getChristmasPreorderMenu()

    expect(menu!.groups.map(g => g.course)).toEqual(['main'])
  })

  it('publishes nothing when the API says the period is not bookable', async () => {
    // The API marks a period unbookable while its menu is unpublished, and its
    // contract is that a half-menu must never be shown.
    getBookingPeriodCached.mockResolvedValue(christmasPeriod({ bookable: false }))

    await expect(getChristmasPreorderMenu()).resolves.toBeNull()
  })

  it('publishes nothing for a period that is not Christmas', async () => {
    getBookingPeriodCached.mockResolvedValue(christmasPeriod({ period_kind: 'mothers_day' }))

    await expect(getChristmasPreorderMenu()).resolves.toBeNull()
  })

  it('publishes nothing when the dish list is empty', async () => {
    getBookingPeriodCached.mockResolvedValue(christmasPeriod({ menu: [] }))

    await expect(getChristmasPreorderMenu()).resolves.toBeNull()
  })

  it('publishes nothing when the lookup fails', async () => {
    getBookingPeriodCached.mockResolvedValue(null)

    await expect(getChristmasPreorderMenu()).resolves.toBeNull()
  })
})

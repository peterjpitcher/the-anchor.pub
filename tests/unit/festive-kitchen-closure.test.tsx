/**
 * The kitchen is shut from 21 December 2026 to 11 January 2027, and the pages
 * that promise food know it (site review P13: DT-001, C1-004, C3-021).
 *
 * Before this the New Year's Eve page said "We usually serve food earlier in
 * the evening", the homepage sold a "Festive menu" and then "a proper roast on
 * a Sunday" straight through the break, and /sunday-roast said "every Sunday".
 *
 * Instants are in UTC so they mean the same under `npm test` (Europe/London)
 * and `npm run test:utc`. Every date here is in GMT, so London midnight is
 * 00:00 UTC.
 */

import fs from 'fs'
import path from 'path'
import { render, cleanup } from '@testing-library/react'
import ssot from '@/SSOT.json'
import {
  getFestiveKitchenClosure,
  getFestiveKitchenStatus,
  getFestiveKitchenWording,
  isKitchenShutForFestiveBreak
} from '@/lib/festive-kitchen-closure'
import { getCurrentMonthlyHomepageCopy, getMonthlyHomepageCopy, type MonthlyHomepageCopy } from '@/lib/monthly-copy'
import { getNewYearsEveFoodCopy, resolveNewYearsEveFood } from '@/lib/seasonal/new-years-eve'
import { FestiveKitchenNotice } from '@/components/seasonal/FestiveKitchenNotice'
import NewYearsEvePage from '@/app/new-years-eve/page'
import { anchorAPI } from '@/lib/api/client'

jest.mock('next/navigation', () => ({
  usePathname: () => '/new-years-eve'
}))

const LAST_SERVICE_DAY = '2026-12-20T23:59:00Z'
const FIRST_SHUT_DAY = '2026-12-21T00:00:00Z'
const LAST_SHUT_DAY = '2027-01-11T23:59:00Z'
const KITCHEN_BACK = '2027-01-12T00:00:00Z'

const KITCHEN_WORDING = "Our kitchen's last day of the year is Sunday 20 December, and it's back on Tuesday 12 January."

const allText = (copy: MonthlyHomepageCopy): string =>
  [copy.script, copy.lead, copy.primaryCta, copy.secondaryCta, copy.secondaryHref, ...copy.badges, copy.bandTitle, copy.bandCopy].join(' ')

const REGULAR_HOURS = Object.fromEntries(
  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => [
    day,
    { opens: '12:00', closes: '22:00', kitchen: { opens: '12:00', closes: '21:00' } }
  ])
)

const hoursWith = (special: Record<string, unknown>[]) => ({ regularHours: REGULAR_HOURS, specialHours: special }) as never

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
  cleanup()
})

describe('the festive kitchen closure', () => {
  it('reads the two dates the SSOT holds', () => {
    expect(getFestiveKitchenClosure()).toEqual({ lastService: '2026-12-20', returns: '2027-01-12' })
  })

  it('builds the approved kitchen sentence from those dates, as SSOT section 16 has it', () => {
    expect(getFestiveKitchenWording()).toBe(KITCHEN_WORDING)
    const doc = fs.readFileSync(path.join(process.cwd(), 'docs', 'SSOT.md'), 'utf8')
    expect(doc).toContain(KITCHEN_WORDING)
  })

  it('is shut from the day after the last service to the day before it is back', () => {
    expect(isKitchenShutForFestiveBreak('2026-12-20')).toBe(false)
    expect(isKitchenShutForFestiveBreak('2026-12-21')).toBe(true)
    expect(isKitchenShutForFestiveBreak('2026-12-31')).toBe(true)
    expect(isKitchenShutForFestiveBreak('2027-01-11')).toBe(true)
    expect(isKitchenShutForFestiveBreak('2027-01-12')).toBe(false)
  })

  it.each([
    ['2026-11-19T23:59:00Z', 'none'],
    ['2026-11-20T00:00:00Z', 'ahead'],
    [LAST_SERVICE_DAY, 'ahead'],
    [FIRST_SHUT_DAY, 'closed'],
    [LAST_SHUT_DAY, 'closed'],
    [KITCHEN_BACK, 'none'],
    ['2027-12-25T12:00:00Z', 'none']
  ])('at %s the state is %s', (instant, state) => {
    expect(getFestiveKitchenStatus(new Date(instant)).state).toBe(state)
  })
})

describe('the homepage copy across the break', () => {
  it('keeps December’s own set up to the last service day', () => {
    expect(getCurrentMonthlyHomepageCopy(new Date(LAST_SERVICE_DAY))).toEqual(getMonthlyHomepageCopy(12))
  })

  it.each(['2026-12-21T09:00:00Z', '2026-12-26T12:00:00Z', '2026-12-31T23:30:00Z', '2027-01-01T12:00:00Z', '2027-01-11T12:00:00Z'])(
    'makes no food promise on %s',
    (instant) => {
      const copy = getCurrentMonthlyHomepageCopy(new Date(instant))
      const text = allText(copy)
      expect(text).not.toMatch(/roast|lunch|festive menu|christmas dinner|walk[- ]?in|pizza|pub classics|food-menu|sunday-roast|christmas-parties/i)
      expect(text).toContain(KITCHEN_WORDING)
      expect(copy.badges).toHaveLength(4)
    }
  )

  it('names Boxing Day and New Year’s Day until 1 January, and not after', () => {
    expect(getCurrentMonthlyHomepageCopy(new Date('2027-01-01T12:00:00Z')).lead).toContain('Boxing Day')
    expect(getCurrentMonthlyHomepageCopy(new Date('2027-01-02T12:00:00Z')).lead).not.toContain('Boxing Day')
  })

  it('goes back to January’s own set the day the kitchen is back', () => {
    expect(getCurrentMonthlyHomepageCopy(new Date(KITCHEN_BACK))).toEqual(getMonthlyHomepageCopy(1))
  })
})

describe('the dated notice beside a Sunday roast promise', () => {
  const text = (instant: string): string => {
    const { container } = render(<FestiveKitchenNotice now={new Date(instant)} />)
    const out = container.textContent ?? ''
    cleanup()
    return out
  }

  it('shows nothing for most of the year', () => {
    expect(text('2026-10-08T12:00:00Z')).toBe('')
    expect(text(KITCHEN_BACK)).toBe('')
  })

  it('shows the approved sentence in the run-up and through the break', () => {
    expect(text('2026-12-01T12:00:00Z')).toContain(KITCHEN_WORDING)
    expect(text('2026-12-27T12:00:00Z')).toContain(KITCHEN_WORDING)
    expect(text('2026-12-27T12:00:00Z')).toContain('No roasts or food just now.')
    expect(text('2026-12-01T12:00:00Z')).not.toContain('No roasts or food just now.')
  })

  it('is mounted on the roast page and the food menu, and the roast lines read the same clock', () => {
    const read = (file: string): string => fs.readFileSync(path.join(process.cwd(), file), 'utf8')
    expect(read('app/sunday-roast/page.tsx')).toContain('<FestiveKitchenNotice')
    expect(read('app/sunday-roast/page.tsx')).toContain('getFestiveKitchenStatus()')
    expect(read('app/food-menu/_components/SundayRoastFeature.tsx')).toContain('<FestiveKitchenNotice')
    expect(read('app/page.tsx')).toContain('roastCardOverride')
  })
})

describe('food on New Year’s Eve', () => {
  it('is closed when the live hours row for 31 December says so', () => {
    const hours = hoursWith([{ date: '2026-12-31', opens: '12:00', closes: '01:00', kitchen: null, is_kitchen_closed: true }])
    expect(resolveNewYearsEveFood(new Date('2026-10-08T12:00:00Z'), hours)).toBe('closed')
  })

  it('is closed from the SSOT break when the feed cannot see 31 December yet', () => {
    expect(resolveNewYearsEveFood(new Date('2026-08-01T12:00:00Z'), null)).toBe('closed')
    expect(resolveNewYearsEveFood(new Date('2026-08-01T12:00:00Z'), hoursWith([]))).toBe('closed')
  })

  it('lets a live row that opens the kitchen win over the SSOT', () => {
    const hours = hoursWith([{ date: '2026-12-31', opens: '12:00', closes: '01:00', kitchen: { opens: '12:00', closes: '18:00' }, is_kitchen_closed: false }])
    expect(resolveNewYearsEveFood(new Date('2026-12-30T12:00:00Z'), hours)).toBe('open')
  })

  it('is unknown, and promises nothing, once this year’s night has passed', () => {
    const copy = getNewYearsEveFoodCopy(new Date('2027-01-02T12:00:00Z'), null)
    expect(copy.state).toBe('unknown')
    expect(copy.glance).toBeNull()
    expect(`${copy.paragraph} ${copy.faqAnswer}`).not.toMatch(/usually|serve food|dine|20 December|12 January/i)
  })

  it('still reads "closed" on the night itself and flips at midnight', () => {
    expect(resolveNewYearsEveFood(new Date('2026-12-31T23:59:00Z'), null)).toBe('closed')
    expect(resolveNewYearsEveFood(new Date('2027-01-01T00:00:00Z'), null)).toBe('unknown')
  })

  it('the page says there is no food, with a 31 December row whose kitchen is null', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-08T12:00:00Z'))
    jest.spyOn(anchorAPI, 'getBusinessHoursSnapshot').mockResolvedValue(
      hoursWith([{ date: '2026-12-31', opens: '12:00', closes: '01:00', kitchen: null, is_kitchen_closed: true }])
    )
    const { container } = render(await NewYearsEvePage())
    const html = container.innerHTML
    expect(html).toContain('our kitchen is closed')
    expect(html).toContain('No food: the kitchen is closed')
    // html includes the FAQPage structured data, so this covers what Google reads too.
    expect(html).not.toMatch(/serve food|planning to dine|usually|Food served earlier|food details|kitchen hours for each year/i)
  })

  it('the page makes no food promise when the hours feed is down and no break covers the night', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2027-03-01T12:00:00Z'))
    jest.spyOn(anchorAPI, 'getBusinessHoursSnapshot').mockRejectedValue(new Error('down'))
    const { container } = render(await NewYearsEvePage())
    const text = container.textContent ?? ''
    expect(text).toContain('Kitchen times for New Year’s Eve are set nearer the date.'.replace('’', "'"))
    expect(text).not.toMatch(/serve food|planning to dine|usually|kitchen is closed/i)
  })
})

describe('the SSOT block these read', () => {
  it('still sits where the code looks for it', () => {
    const block = (ssot as { christmas_2026?: { christmas_day?: { kitchen_festive_closure?: unknown } } }).christmas_2026
    expect(block?.christmas_day?.kitchen_festive_closure).toBeDefined()
  })
})

/**
 * Mother's Day, Easter Sunday and Father's Day work their dates out and make
 * no claim the owner has not confirmed (site review P13: DT-006, SM-008,
 * C1-019; owner fact 40, 7 October 2026).
 *
 * Before this each page typed a 2027 date, so it would have named a day that
 * had gone from the morning after, and each told Google about a scheduled
 * event (the Father's Day one with an offer and no price). The owner has since
 * said these are special days whose menu is confirmed nearer the time.
 *
 * Instants are in UTC. London midnight is 00:00 UTC in March before the clocks
 * change, and 23:00 UTC the day before in summer time; both are written out.
 */

import fs from 'fs'
import path from 'path'
import { render } from '@testing-library/react'
import {
  formatOccasionLabel,
  getEasterSunday,
  getFathersDay,
  getMotheringSunday,
  nextOccurrence
} from '@/lib/recurring-dates'
import { OccasionMenuNotice, occasionMenuLine } from '@/components/seasonal/OccasionMenuNotice'

const read = (file: string): string => fs.readFileSync(path.join(process.cwd(), file), 'utf8')
const PAGES = ['app/mothers-day/page.tsx', 'app/easter-sunday/page.tsx', 'app/fathers-day/page.tsx']

describe('nextOccurrence', () => {
  it.each([
    // Mothering Sunday 2027 is 7 March (GMT).
    ['Mothering Sunday, today', getMotheringSunday, '2026-10-08T12:00:00Z', '2027-03-07'],
    ['Mothering Sunday, last minute of the day', getMotheringSunday, '2027-03-07T23:59:00Z', '2027-03-07'],
    ['Mothering Sunday, the morning after', getMotheringSunday, '2027-03-08T00:00:00Z', '2028-03-26'],
    // Easter Sunday 2027 is 28 March, the day the clocks go forward: London
    // midnight at the end of it is 23:00 UTC.
    ['Easter Sunday, last minute of the day', getEasterSunday, '2027-03-28T22:59:00Z', '2027-03-28'],
    ['Easter Sunday, the morning after', getEasterSunday, '2027-03-28T23:00:00Z', '2028-04-16'],
    // Father's Day 2027 is 20 June (BST).
    ["Father's Day, last minute of the day", getFathersDay, '2027-06-20T22:59:00Z', '2027-06-20'],
    ["Father's Day, the morning after", getFathersDay, '2027-06-20T23:00:00Z', '2028-06-18']
  ])('%s', (_name, dateForYear, instant, expected) => {
    expect(nextOccurrence(dateForYear, new Date(instant))).toBe(expected)
  })

  it('formats a date as the pages print it', () => {
    expect(formatOccasionLabel('2027-03-28')).toBe('Sunday 28 March 2027')
    expect(formatOccasionLabel('2027-06-20')).toBe('Sunday 20 June 2027')
  })
})

describe('the three occasion pages', () => {
  it.each(PAGES)('%s types no date', (file) => {
    const code = read(file).replace(/^\s*\/\/.*$/gm, '')
    expect(code).not.toMatch(/'20\d{2}-\d{2}-\d{2}'/)
    expect(code).not.toMatch(/(?:Sunday|Saturday) \d{1,2} (?:March|April|June) 20\d{2}/)
  })

  it('work their dates out from one place each', () => {
    expect(read('app/easter-sunday/page.tsx')).toContain('nextOccurrence(getEasterSunday)')
    expect(read('app/fathers-day/page.tsx')).toContain('nextOccurrence(getFathersDay)')
    expect(read('lib/mothers-day-booking.ts')).toContain('nextOccurrence(getMotheringSunday)')
    expect(read('app/mothers-day/page.tsx')).toContain('const MOTHERS_DAY_DATE = MOTHERS_DAY_SERVICE_DATE')
  })

  it.each(PAGES)('%s sends Google no Event and no Offer', (file) => {
    const code = read(file).replace(/^\s*\/\/.*$/gm, '')
    expect(code).not.toMatch(/'@type':\s*'(?:Event|Offer)'/)
    expect(code).not.toMatch(/startDate|endDate/)
  })

  it.each(PAGES)('%s says the menu is confirmed nearer the time', (file) => {
    expect(read(file)).toContain('<OccasionMenuNotice occasion=')
  })

  it('no longer answers "what is on the menu" with the regular roast', () => {
    const all = PAGES.map(read).join('\n')
    expect(all).not.toMatch(/Our Easter Sunday menu is our regular Sunday roast/)
    expect(all).not.toMatch(/There's no separate set menu/)
    expect(all).not.toMatch(/so the full Sunday roast menu is on/)
  })

  // Owner ruling, 8 October 2026: each is a special day whose menu is confirmed
  // nearer the time, so the page may not describe the regular Sunday roast, its
  // dishes, its serving times or its walk-ins as if they were confirmed for the
  // day. Comments are stripped first: they explain the rule in these words.
  // The one sentence allowed to say "Sunday roast" is the notice itself, which
  // lives in the component, not in the page.
  it.each(PAGES)('%s promises no roast, dish, serving time or walk-in for the day', (file) => {
    const code = read(file)
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
      .replace(/^\s*\/\/.*$/gm, '')

    expect(code).not.toMatch(/roast/i)
    expect(code).not.toMatch(/wellington|yorkshire|gravy|turkey|pork|beef|vegan|vegetarian/i)
    expect(code).not.toMatch(/walk[- ]?in/i)
    expect(code).not.toMatch(/sitting|pre-?order|last (?:table|booking)/i)
    expect(code).not.toMatch(/\b\d{1,2}(?::\d{2})?\s?(?:am|pm)\b/i)
    expect(code).not.toMatch(/sunday-roast|sunday-lunch|pizza-menu/)
  })

  it('links to the three pages without promising a roast', () => {
    const links = read('lib/internal-linking-data.ts')
    for (const href of ['/mothers-day', '/easter-sunday', '/fathers-day']) {
      const entry = links.slice(links.indexOf(`href: '${href}'`)).split('}')[0]
      expect(entry).toContain('description:')
      expect(entry).not.toMatch(/roast/i)
    }
    expect(read('lib/mothers-day-booking.ts')).not.toMatch(/CTA_LABEL = '[^']*Roast/i)
  })
})

describe('the menu notice', () => {
  it('says what the owner confirmed, and no more', () => {
    const { container } = render(<OccasionMenuNotice occasion="Easter Sunday" />)
    expect(container.textContent).toBe(
      'The menu for Easter Sunday is confirmed nearer the time. It may be our Sunday roast, or a set menu for the day.'
    )
    expect(occasionMenuLine("Father's Day")).not.toMatch(/\b20\d{2}\b|£/)
  })
})

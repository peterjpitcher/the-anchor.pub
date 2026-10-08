/**
 * The register of typed dates (config/date-register.json) and the audit that
 * reads it (scripts/audit-freshness.js).
 *
 * The old audit looked at five files and one kind of date, and passed on the
 * day a page went stale (site review finding DT-017). These tests pin the
 * clock and assert what the audit says on the days that matter, and that the
 * register cannot drift away from the code it describes.
 *
 * Every date is passed in as a London calendar date, so the answers are the
 * same under `npm test` (London) and `npm run test:utc` (UTC).
 */

import fs from 'fs'
import path from 'path'

const freshness = require('../../scripts/audit-freshness.js')

const ROOT = path.join(__dirname, '..', '..')
const register = freshness.loadRegister()

type DateResult = { id: string; state: string; daysLeft?: number; problems?: string[] }

function stateOn(today: string, id: string): string {
  const result = freshness.auditAll(today).dates.find((entry: DateResult) => entry.id === id)
  if (!result) throw new Error(`No register entry called ${id}`)
  return result.state
}

describe('the register matches the code today', () => {
  it('has no entry that is out of step with its file', () => {
    const { outOfStep } = freshness.auditAll('2026-10-08')
    expect(outOfStep.map((entry: DateResult) => `${entry.id}: ${entry.problems?.join('; ')}`)).toEqual([])
  })

  it('gives every entry a unique id', () => {
    const ids = register.dates.map((entry: { id: string }) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  const rows: Array<[string, string, string]> = register.dates.map(
    (entry: { id: string; file: string; find: string }) => [entry.id, entry.file, entry.find]
  )

  it.each(rows)('%s: %s still contains the text that carries the date', (_id, file, find) => {
    const source = fs.readFileSync(path.join(ROOT, file), 'utf8')
    expect(source).toContain(find)
  })

  it('names only files that exist in the list of claims with a check date', () => {
    for (const entry of register.checkedFiles.files) {
      expect(fs.existsSync(path.join(ROOT, entry.file))).toBe(true)
    }
  })
})

describe('the job adverts (site review finding DT-010)', () => {
  it('is quiet until 30 days before 12 May 2027', () => {
    expect(stateOn('2026-10-08', 'job-adverts-valid-through')).toBe('ok')
    expect(stateOn('2027-04-11', 'job-adverts-valid-through')).toBe('ok')
  })

  it('warns from 12 April 2027', () => {
    expect(stateOn('2027-04-12', 'job-adverts-valid-through')).toBe('due')
    expect(stateOn('2027-05-12', 'job-adverts-valid-through')).toBe('due')
  })

  it('keeps saying so once the date has passed, until someone acts', () => {
    expect(stateOn('2027-05-13', 'job-adverts-valid-through')).toBe('passed')
    expect(stateOn('2027-08-01', 'job-adverts-valid-through')).toBe('passed')
  })
})

describe('what the audit says on the days that matter', () => {
  it('names the Halloween switch on 25 October 2026, the day the clocks go back', () => {
    expect(stateOn('2026-10-25', 'halloween-party-ends')).toBe('due')
    const due = freshness.auditAll('2026-10-25').needsAttention.map((entry: DateResult) => entry.id)
    expect(due).toContain('halloween-party-ends')
  })

  it('stops listing the Halloween switch once the page has handled it', () => {
    expect(stateOn('2026-11-01', 'halloween-party-ends')).toBe('due')
    expect(stateOn('2026-11-02', 'halloween-party-ends')).toBe('done')
  })

  it('names the brochure year on 1 December 2026 and keeps naming it in January', () => {
    expect(stateOn('2026-12-01', 'brochure-year')).toBe('due')
    expect(stateOn('2027-01-01', 'brochure-year')).toBe('passed')
  })

  it('asks for the runway start week to be checked from mid December', () => {
    expect(stateOn('2026-12-13', 'runway-alternation-start-week')).toBe('ok')
    expect(stateOn('2026-12-14', 'runway-alternation-start-week')).toBe('due')
  })

  it('reminds about Christmas 2027 from June, the day the clocks went forward being long past', () => {
    expect(stateOn('2027-03-28', 'christmas-next-year')).toBe('ok')
    expect(stateOn('2027-05-30', 'christmas-next-year')).toBe('ok')
    expect(stateOn('2027-05-31', 'christmas-next-year')).toBe('due')
  })

  it('has nothing typed-date to say on 8 October 2026', () => {
    const today = freshness.auditAll('2026-10-08')
    expect(today.dates.filter((entry: DateResult) => entry.state === 'due' || entry.state === 'passed')).toEqual([])
  })
})

describe('counting days', () => {
  it('counts calendar days across both clock changes without losing or gaining one', () => {
    // 25 October 2026 is 25 hours long and 28 March 2027 is 23.
    expect(freshness.daysBetween('2026-10-24', '2026-10-26')).toBe(2)
    expect(freshness.daysBetween('2027-03-27', '2027-03-29')).toBe(2)
    expect(freshness.daysBetween('2026-10-08', '2027-05-12')).toBe(216)
  })

  it('reads today in London, not in UTC', () => {
    // 23:30 UTC on 9 July is 00:30 on 10 July in London.
    expect(freshness.londonToday(new Date('2026-07-09T23:30:00Z'))).toBe('2026-07-10')
    // The second 1:30am on the day the clocks go back.
    expect(freshness.londonToday(new Date('2026-10-25T01:30:00Z'))).toBe('2026-10-25')
    // 23:30 UTC on 28 March 2027 is 00:30 on the 29th in London.
    expect(freshness.londonToday(new Date('2027-03-28T23:30:00Z'))).toBe('2027-03-29')
  })
})

describe('a register that has drifted from the code is a failure, not a warning', () => {
  const entry = {
    id: 'example',
    what: 'An example date.',
    file: 'config/date-register.json',
    find: '"dates"',
    date: '2027-01-01',
    warnDays: 10,
    whenItPasses: 'Nothing.',
    action: 'Nothing.',
    afterPassing: 'act'
  }

  it('accepts an entry whose text is in the file', () => {
    expect(freshness.auditDates({ dates: [entry] }, '2026-10-08')[0].state).toBe('ok')
  })

  it('flags text that is no longer in the file', () => {
    const [result] = freshness.auditDates({ dates: [{ ...entry, find: 'this text is not in the file' }] }, '2026-10-08')
    expect(result.state).toBe('out-of-step')
  })

  it('flags a file that is gone', () => {
    const [result] = freshness.auditDates({ dates: [{ ...entry, file: 'app/no-such-file.tsx' }] }, '2026-10-08')
    expect(result.state).toBe('out-of-step')
  })

  it.each([
    ['an impossible date', { date: '2027-02-30' }],
    ['a missing action', { action: '' }],
    ['a negative warning', { warnDays: -1 }],
    ['an unknown afterPassing', { afterPassing: 'maybe' }]
  ])('flags %s', (_label, change) => {
    const [result] = freshness.auditDates({ dates: [{ ...entry, ...change }] }, '2026-10-08')
    expect(result.state).toBe('out-of-step')
  })
})

describe('the weekly report', () => {
  it('is empty when there is nothing to do', () => {
    const quiet = freshness.auditAll('2026-10-08')
    const nothingStale = quiet.checkedFiles.every((entry: { state: string }) => entry.state === 'ok')
    if (nothingStale) expect(freshness.buildReport(quiet)).toBe('')
  })

  it('says what passes and what to do when a date is due', () => {
    const report = freshness.buildReport(freshness.auditAll('2027-04-20'))
    expect(report).toContain('2027-05-12')
    expect(report).toContain('app/join-our-team/recruitmentContent.ts')
    expect(report).toContain('To do:')
  })
})

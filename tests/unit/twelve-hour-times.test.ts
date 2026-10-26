import fs from 'fs'
import path from 'path'
import { formatHoldExpiry } from '@/lib/table-booking/formatting'
import { formatClockTime } from '@/lib/event-lifecycle'

/**
 * Review BK-210. `hour12: true` lets the ICU data pick the hour cycle, and some
 * builds (Node 20, and browsers sharing its data) pick h11, which prints a
 * quarter past noon as "0:15 pm". The deposit deadline on /book-table runs in
 * the guest's browser, so a guest could be shown one. `hourCycle: 'h12'` names
 * the cycle outright. The same rule the management app already follows.
 */

const read = (file: string): string => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('a time just after noon reads as twelve, not nought', () => {
  it('in the deposit hold deadline', () => {
    // 11:15 UTC on 7 July is 12:15 in London (BST).
    expect(formatHoldExpiry('2026-07-07T11:15:00Z')).toMatch(/\b12:15\s?pm\b/)
    expect(formatHoldExpiry('2026-07-07T11:15:00Z')).not.toMatch(/\b0:15/)
  })

  it('in an event time given as a full date and time', () => {
    expect(formatClockTime('2026-12-01T12:15:00Z')).toMatch(/^12:15\s?pm$/)
  })

  it('is asked for by cycle in every file that formats one, never by hour12: true', () => {
    // Reads the code, not the comments: each fix explains itself in words.
    for (const file of [
      'lib/table-booking/formatting.ts',
      'lib/event-lifecycle.ts',
      'app/quiz-night-competition-terms/page.tsx'
    ]) {
      const source = read(file)
      expect({ file, hour12: /^\s*hour12:\s*true/m.test(source) }).toEqual({ file, hour12: false })
      expect(source).toContain("hourCycle: 'h12'")
    }
  })
})

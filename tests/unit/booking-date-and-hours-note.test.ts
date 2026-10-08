import { formatDateForDisplay } from '@/lib/table-booking/formatting'
import { buildBookingHoursNote } from '@/lib/table-booking/hours-note'

// Two lines a guest reads on the booking form.
//
// 1. The date in the summary and the confirmation was in American order,
//    "Sunday, October 25, 2026". It is now British: "Sunday 25 October 2026".
// 2. The hours line said "Kitchen closed today" whatever date had been picked,
//    including one months away. It now says "on this date".
//
// Both are built from the date string alone, never from a clock, so the answers
// are the same in London, in UTC and on a phone in any other zone.

describe('formatDateForDisplay writes dates the British way round', () => {
  it.each([
    ['2026-07-08', 'Wednesday 8 July 2026'],
    ['2026-12-25', 'Friday 25 December 2026'],
    ['2027-01-01', 'Friday 1 January 2027'],
    // Either side of the clocks going back.
    ['2026-10-24', 'Saturday 24 October 2026'],
    ['2026-10-25', 'Sunday 25 October 2026'],
    ['2026-10-26', 'Monday 26 October 2026'],
    // Either side of the clocks going forward.
    ['2027-03-27', 'Saturday 27 March 2027'],
    ['2027-03-28', 'Sunday 28 March 2027'],
    ['2027-03-29', 'Monday 29 March 2027']
  ])('%s reads %s', (iso, expected) => {
    expect(formatDateForDisplay(iso)).toBe(expected)
  })

  it('has no comma and no American month-first order', () => {
    const text = formatDateForDisplay('2026-10-25')
    expect(text).not.toContain(',')
    expect(text).not.toMatch(/October 25/)
  })

  it('hands back anything that is not a date unchanged', () => {
    expect(formatDateForDisplay('next Sunday')).toBe('next Sunday')
  })
})

const openDay = {
  opens: '12:00:00',
  closes: '22:00:00',
  kitchen: { opens: '12:00:00', closes: '21:00:00' },
  is_closed: false,
  is_kitchen_closed: false,
  schedule_config: []
}

// Monday: bar open from 4pm, kitchen closed (docs/SSOT.md section 3).
const monday = {
  opens: '16:00:00',
  closes: '22:00:00',
  kitchen: null,
  is_closed: false,
  is_kitchen_closed: true,
  schedule_config: []
}

const regularHours = {
  monday,
  tuesday: openDay,
  wednesday: openDay,
  thursday: openDay,
  friday: openDay,
  saturday: openDay,
  sunday: openDay
}

describe('the booking form hours line speaks about the chosen date, not today', () => {
  it('says "Kitchen closed on this date" for a Monday, the day after the clocks go back', () => {
    const note = buildBookingHoursNote('2026-10-26', { regularHours })
    expect(note?.summary).toBe('Bar open 16:00–22:00 · Kitchen closed on this date')
    expect(note?.summary).not.toMatch(/today/i)
  })

  it('says it for a Monday, the day after the clocks go forward', () => {
    const note = buildBookingHoursNote('2027-03-29', { regularHours })
    expect(note?.summary).toContain('Kitchen closed on this date')
  })

  it('says it for a special day whose kitchen is null, which means closed, not "as normal"', () => {
    // Tuesday 22 December 2026: a special-hours row with `kitchen: null`.
    const note = buildBookingHoursNote('2026-12-22', {
      regularHours,
      specialHours: [
        { date: '2026-12-22', opens: '12:00:00', closes: '22:00:00', kitchen: null, is_closed: false, is_kitchen_closed: true }
      ]
    })
    expect(note?.summary).toBe('Bar open 12:00–22:00 · Kitchen closed on this date')
  })

  it('treats a special day with a null kitchen and no flag as closed too', () => {
    const note = buildBookingHoursNote('2026-12-22', {
      regularHours,
      specialHours: [{ date: '2026-12-22', opens: '12:00:00', closes: '22:00:00', kitchen: null }]
    })
    expect(note?.summary).toContain('Kitchen closed on this date')
    expect(note?.summary).not.toContain('Kitchen open')
  })

  it('gives the kitchen hours on both clock-change Sundays', () => {
    expect(buildBookingHoursNote('2026-10-25', { regularHours })?.summary).toBe(
      'Bar open 12:00–22:00 · Kitchen open 12:00–21:00'
    )
    expect(buildBookingHoursNote('2027-03-28', { regularHours })?.summary).toBe(
      'Bar open 12:00–22:00 · Kitchen open 12:00–21:00'
    )
  })
})

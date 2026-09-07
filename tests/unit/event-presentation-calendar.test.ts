/**
 * Add-to-calendar: the lifecycle flag and the calendar payloads.
 *
 * Two things are locked in here.
 *
 * 1. `showAddToCalendar` follows the event's phase, not the booking state. A
 *    cancelled, postponed or finished night must never be offered as something
 *    to diarise, while an upcoming night whose online booking is shut still is,
 *    because the visitor can turn up or ring the pub.
 * 2. The .ics and Google Calendar payloads say only what we actually know:
 *    the real London start instant, an end only when the API gives one, a UID
 *    that does not move between downloads, and text that cannot corrupt the file.
 *
 * Every assertion is an absolute UTC instant, so the suite reads the same under
 * `npm test` (TZ=Europe/London) and `npm run test:utc`.
 */

import type { Event } from '@/lib/api'
import {
  buildEventIcs,
  buildGoogleCalendarUrl,
  getEventCalendarRangeUtc,
  getEventCalendarUid,
  getEventDateRangeUtc
} from '@/lib/event-calendar'
import { getEventPresentation } from '@/lib/event-presentation'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const FIXED_NOW = Date.UTC(2026, 4, 1, 12, 0, 0) // 2026-05-01T12:00:00Z

function isoDaysFromNow(days: number): string {
  return new Date(FIXED_NOW + days * ONE_DAY_MS).toISOString()
}

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    '@type': 'Event',
    id: 'evt-123',
    slug: 'quiz-night-2026-07-29',
    name: 'Quiz Night',
    description: 'A friendly pub quiz.',
    startDate: '2026-07-29T18:00:00.000Z',
    eventStatus: 'scheduled',
    event_status: 'scheduled',
    eventAttendanceMode: 'OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'The Anchor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Horton Road',
        addressLocality: 'Stanwell Moor',
        addressRegion: 'Surrey',
        postalCode: 'TW19 6AQ',
        addressCountry: 'GB'
      }
    },
    ...overrides
  } as Event
}

function icsLines(event: Event): string[] {
  return buildEventIcs(event).split('\r\n')
}

function icsProperty(event: Event, name: string): string | undefined {
  return icsLines(event).find((line) => line.startsWith(`${name}:`))
}

describe('showAddToCalendar', () => {
  it('is true for an upcoming event', () => {
    const presentation = getEventPresentation(
      { startDate: isoDaysFromNow(7), event_status: 'scheduled', eventStatus: 'scheduled' },
      FIXED_NOW
    )

    expect(presentation.showAddToCalendar).toBe(true)
  })

  it('is false once the event has ended', () => {
    const presentation = getEventPresentation(
      { startDate: isoDaysFromNow(-20), event_status: 'scheduled', eventStatus: 'scheduled' },
      FIXED_NOW
    )

    expect(presentation.showAddToCalendar).toBe(false)
  })

  it('is false for a cancelled event, whatever its date', () => {
    const future = getEventPresentation(
      { startDate: isoDaysFromNow(3), event_status: 'cancelled', eventStatus: 'cancelled' },
      FIXED_NOW
    )
    const past = getEventPresentation(
      { startDate: isoDaysFromNow(-3), event_status: 'cancelled', eventStatus: 'cancelled' },
      FIXED_NOW
    )

    expect(future.showAddToCalendar).toBe(false)
    expect(past.showAddToCalendar).toBe(false)
  })

  it('is false for a postponed event, whose listed date is the night that is not happening', () => {
    const presentation = getEventPresentation(
      { startDate: isoDaysFromNow(10), event_status: 'postponed', eventStatus: 'postponed' },
      FIXED_NOW
    )

    expect(presentation.showAddToCalendar).toBe(false)
  })

  it('is false for a draft event, which is not a night we have committed to', () => {
    // A draft cannot reach the detail page, which redirects at
    // app/events/[id]/page.tsx:344, but the control also mounts on category
    // date cards, so the flag has to guard it rather than the route.
    const presentation = getEventPresentation(
      { startDate: isoDaysFromNow(10), event_status: 'draft', eventStatus: 'draft' },
      FIXED_NOW
    )

    expect(presentation.showAddToCalendar).toBe(false)
  })

  it('is true for a rescheduled event, whose startDate is already the new date', () => {
    const presentation = getEventPresentation(
      { startDate: isoDaysFromNow(10), event_status: 'rescheduled', eventStatus: 'rescheduled' },
      FIXED_NOW
    )

    expect(presentation.showAddToCalendar).toBe(true)
  })

  it('stays true when online booking is blocked or past its cutoff', () => {
    const bookingsOff = getEventPresentation(
      {
        startDate: isoDaysFromNow(5),
        event_status: 'scheduled',
        eventStatus: 'scheduled',
        bookings_enabled: false
      },
      FIXED_NOW
    )
    const pastCutoff = getEventPresentation(
      {
        startDate: isoDaysFromNow(5),
        event_status: 'scheduled',
        eventStatus: 'scheduled',
        booking_cutoff_at: isoDaysFromNow(-1)
      },
      FIXED_NOW
    )
    const soldOut = getEventPresentation(
      { startDate: isoDaysFromNow(5), event_status: 'sold_out', eventStatus: 'sold_out' },
      FIXED_NOW
    )

    expect(bookingsOff.showBookingForm).toBe(false)
    expect(bookingsOff.showAddToCalendar).toBe(true)
    expect(pastCutoff.showAddToCalendar).toBe(true)
    expect(soldOut.showAddToCalendar).toBe(true)
  })
})

describe('calendar start and end instants', () => {
  it('uses the real London start of a British Summer Time event', () => {
    // 19:00 on 29 July in London is 18:00Z. Both spellings must land there.
    expect(icsProperty(makeEvent({ startDate: '2026-07-29T18:00:00.000Z' }), 'DTSTART')).toBe(
      'DTSTART:20260729T180000Z'
    )
    expect(icsProperty(makeEvent({ startDate: '2026-07-29T19:00:00' }), 'DTSTART')).toBe(
      'DTSTART:20260729T180000Z'
    )
  })

  it('keeps a winter event on GMT', () => {
    expect(icsProperty(makeEvent({ startDate: '2026-01-14T19:00:00' }), 'DTSTART')).toBe(
      'DTSTART:20260114T190000Z'
    )
  })

  it('shifts by an hour across the spring clock change', () => {
    // BST begins on Sunday 29 March 2026. A 7pm event is 19:00Z the day before
    // and 18:00Z the day after.
    expect(icsProperty(makeEvent({ startDate: '2026-03-28T19:00:00' }), 'DTSTART')).toBe(
      'DTSTART:20260328T190000Z'
    )
    expect(icsProperty(makeEvent({ startDate: '2026-03-29T19:00:00' }), 'DTSTART')).toBe(
      'DTSTART:20260329T180000Z'
    )
  })

  it('shifts back across the autumn clock change', () => {
    // GMT returns on Sunday 25 October 2026.
    expect(icsProperty(makeEvent({ startDate: '2026-10-24T19:00:00' }), 'DTSTART')).toBe(
      'DTSTART:20261024T180000Z'
    )
    expect(icsProperty(makeEvent({ startDate: '2026-10-25T19:00:00' }), 'DTSTART')).toBe(
      'DTSTART:20261025T190000Z'
    )
  })

  it('handles an event that runs past midnight in summer', () => {
    const event = makeEvent({
      startDate: '2026-07-29T23:30:00',
      endDate: '2026-07-30T00:30:00'
    })

    expect(icsProperty(event, 'DTSTART')).toBe('DTSTART:20260729T223000Z')
    expect(icsProperty(event, 'DTEND')).toBe('DTEND:20260729T233000Z')
  })

  it('handles an event that runs past midnight in winter', () => {
    const event = makeEvent({
      startDate: '2026-01-14T23:30:00',
      endDate: '2026-01-15T00:30:00'
    })

    expect(icsProperty(event, 'DTSTART')).toBe('DTSTART:20260114T233000Z')
    expect(icsProperty(event, 'DTEND')).toBe('DTEND:20260115T003000Z')
  })
})

describe('unknown finish times', () => {
  it('omits DTEND entirely when the API gives no end and no duration', () => {
    const event = makeEvent({ endDate: undefined, duration: undefined })
    const lines = icsLines(event)

    expect(getEventCalendarRangeUtc(event).end).toBeNull()
    expect(lines.some((line) => line.startsWith('DTEND'))).toBe(false)
    expect(lines).toContain('DTSTART:20260729T180000Z')
  })

  it('falls back to the duration when there is no end date', () => {
    const event = makeEvent({ endDate: undefined, duration: 'PT3H' })

    expect(icsProperty(event, 'DTEND')).toBe('DTEND:20260729T210000Z')
  })

  it('uses an explicit end date when there is one', () => {
    const event = makeEvent({ endDate: '2026-07-29T21:30:00.000Z' })

    expect(icsProperty(event, 'DTEND')).toBe('DTEND:20260729T213000Z')
  })

  it('ignores an unparseable end date rather than writing a broken one', () => {
    const event = makeEvent({ endDate: 'not a date' })

    expect(getEventCalendarRangeUtc(event).end).toBeNull()
    expect(icsLines(event).some((line) => line.startsWith('DTEND'))).toBe(false)
  })

  it('keeps the two-hour assumption on getEventDateRangeUtc, which schema.org needs', () => {
    const { start, end } = getEventDateRangeUtc(makeEvent({ endDate: undefined, duration: undefined }))

    expect(end.getTime() - start.getTime()).toBe(120 * 60 * 1000)
  })
})

describe('a re-download updates the entry instead of duplicating it', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('keeps the same UID across downloads and emits one VEVENT', () => {
    const event = makeEvent()

    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-05-01T12:00:00.000Z'))
    const first = buildEventIcs(event)

    jest.setSystemTime(new Date('2026-06-02T09:15:00.000Z'))
    const second = buildEventIcs(event)

    const uidOf = (ics: string) => ics.split('\r\n').filter((line) => line.startsWith('UID:'))

    expect(uidOf(first)).toEqual(['UID:evt-123@the-anchor.pub'])
    expect(uidOf(second)).toEqual(uidOf(first))
    // Only the download timestamp moves, which is what tells a client this is
    // a newer copy of the same entry.
    expect(first).not.toEqual(second)
    expect(second.split('BEGIN:VEVENT').length - 1).toBe(1)
  })

  it('falls back to the slug when an event has no id', () => {
    expect(getEventCalendarUid({ id: '', slug: 'quiz-night-2026-07-29' })).toBe(
      'quiz-night-2026-07-29@the-anchor.pub'
    )
  })
})

describe('ics text safety', () => {
  it('escapes commas, semicolons and newlines so the file cannot break', () => {
    const event = makeEvent({
      name: 'Quiz Night, Cash Prizes; Free Entry',
      shortDescription: 'Teams of up to six.\nDoors at 6pm, quiz at 7pm; last orders 11pm.'
    })
    const lines = icsLines(event)

    const summary = lines.filter((line) => line.startsWith('SUMMARY'))
    const description = lines.filter((line) => line.startsWith('DESCRIPTION'))

    expect(summary).toEqual(['SUMMARY:Quiz Night\\, Cash Prizes\\; Free Entry'])
    // One line only: a raw newline here would end the property and corrupt the file.
    expect(description).toHaveLength(1)
    expect(description[0]).toContain('Teams of up to six.\\nDoors at 6pm\\, quiz at 7pm\\; last orders 11pm.')
    expect(description[0]).toContain('More info: https://www.the-anchor.pub/events/quiz-night-2026-07-29')
  })

  it('escapes a carriage return on its own', () => {
    const event = makeEvent({ shortDescription: 'Line one\rLine two' })
    const description = icsLines(event).filter((line) => line.startsWith('DESCRIPTION'))

    expect(description).toHaveLength(1)
    expect(description[0]).toContain('Line one\\nLine two')
  })
})

describe('calendar destinations', () => {
  it('carries the public canonical url, never a management url', () => {
    const event = makeEvent()
    const googleUrl = buildGoogleCalendarUrl(event)

    expect(icsProperty(event, 'URL')).toBe('URL:https://www.the-anchor.pub/events/quiz-night-2026-07-29')
    expect(googleUrl).toContain(
      encodeURIComponent('https://www.the-anchor.pub/events/quiz-night-2026-07-29')
    )
    expect(googleUrl).not.toContain('management.orangejelly.co.uk')
  })

  it('sends Google the same instant as the ics', () => {
    const googleUrl = buildGoogleCalendarUrl(makeEvent({ endDate: '2026-07-29T21:30:00.000Z' }))

    expect(googleUrl).toContain('dates=20260729T180000Z/20260729T213000Z')
  })

  it('repeats the start rather than inventing a finish Google can show', () => {
    const googleUrl = buildGoogleCalendarUrl(makeEvent({ endDate: undefined, duration: undefined }))

    expect(googleUrl).toContain('dates=20260729T180000Z/20260729T180000Z')
  })

  it('mentions the door time in the description without moving the start', () => {
    const event = makeEvent({ doors_time: '18:30' })

    expect(icsProperty(event, 'DTSTART')).toBe('DTSTART:20260729T180000Z')
    expect(icsProperty(event, 'DESCRIPTION')).toContain('Doors from 6:30pm.')
  })

  it('gives up rather than guessing when the start date is unusable', () => {
    const event = makeEvent({ startDate: 'nonsense' })

    expect(buildGoogleCalendarUrl(event)).toBeNull()
    expect(() => buildEventIcs(event)).toThrow(/no usable start date/)
  })
})

import type { Event } from '@/lib/api'
import { isEventOver } from '@/lib/event-calendar'
import { getEventBookingBlockReason, isEventInPast } from '@/lib/event-lifecycle'
import { getEventPhase, getEventPresentation } from '@/lib/event-presentation'
import { getEventPageTitle, getEventSeoStrategy } from '@/lib/event-seo-strategy'

// An event page said "This event has ended" and "It took place on ..." from the
// minute the event STARTED: five past seven on quiz night, and from 8pm at a
// party that runs until midnight. One function was answering two questions.
//
//   "Can this still be booked?"  keyed to the start  (isEventInPast, unchanged)
//   "Is it over?"                keyed to the finish (isEventOver, new)
//
// Every instant is fixed and passed in, so the answers are the same in London,
// in UTC and on a phone in any other zone.

const at = (iso: string) => new Date(iso).getTime()

// Quiz night: 7pm to 9:30pm on Wednesday 7 October 2026, British Summer Time.
const quiz = {
  name: 'Quiz Night',
  startDate: '2026-10-07T18:00:00.000Z',
  endDate: '2026-10-07T20:30:00.000Z',
  event_status: 'scheduled',
  bookings_enabled: true
} as unknown as Event

// The Halloween party: 8pm on Saturday 31 October 2026 to midnight, Greenwich Mean Time.
const party = {
  name: 'Halloween Party',
  startDate: '2026-10-31T20:00:00.000Z',
  endDate: '2026-11-01T00:00:00.000Z',
  event_status: 'scheduled',
  bookings_enabled: true
} as unknown as Event

describe('isEventOver is keyed to the finish', () => {
  it('is false five minutes after the start', () => {
    expect(isEventInPast(quiz, at('2026-10-07T18:05:00Z'))).toBe(true)
    expect(isEventOver(quiz, at('2026-10-07T18:05:00Z'))).toBe(false)
  })

  it('is false a minute before the finish and true a minute after', () => {
    expect(isEventOver(quiz, at('2026-10-07T20:29:00Z'))).toBe(false)
    expect(isEventOver(quiz, at('2026-10-07T20:31:00Z'))).toBe(true)
  })

  it('is false at 9pm and 11:55pm at the Halloween party, true after midnight', () => {
    expect(isEventOver(party, at('2026-10-31T21:00:00Z'))).toBe(false)
    expect(isEventOver(party, at('2026-10-31T23:55:00Z'))).toBe(false)
    expect(isEventOver(party, at('2026-11-01T00:01:00Z'))).toBe(true)
  })

  it('uses the start plus the duration when there is no end date', () => {
    const event = { startDate: '2026-11-11T19:00:00.000Z', endDate: null, duration: 'PT2H30M' }
    expect(isEventOver(event, at('2026-11-11T21:29:00Z'))).toBe(false)
    expect(isEventOver(event, at('2026-11-11T21:31:00Z'))).toBe(true)
  })

  it('allows three hours when the record has neither an end nor a duration', () => {
    const event = { startDate: '2026-11-11T19:00:00.000Z' }
    expect(isEventOver(event, at('2026-11-11T21:59:00Z'))).toBe(false)
    expect(isEventOver(event, at('2026-11-11T22:01:00Z'))).toBe(true)
  })

  it('allows three hours when the end is not after the start', () => {
    const event = { startDate: '2026-11-11T19:00:00.000Z', endDate: '2026-11-11T18:00:00.000Z' }
    expect(isEventOver(event, at('2026-11-11T19:05:00Z'))).toBe(false)
    expect(isEventOver(event, at('2026-11-11T22:01:00Z'))).toBe(true)
  })

  it('is false for a date that cannot be read', () => {
    expect(isEventOver({ startDate: 'not a date' }, at('2026-11-11T22:01:00Z'))).toBe(false)
  })

  it('reads a start with no offset as London time', () => {
    // 19:00 in London on 15 July 2026 is 18:00 UTC. Three hours on is 21:00 UTC.
    const event = { startDate: '2026-07-15T19:00:00' }
    expect(isEventOver(event, at('2026-07-15T20:59:00Z'))).toBe(false)
    expect(isEventOver(event, at('2026-07-15T21:01:00Z'))).toBe(true)
  })
})

describe('the clock-change nights', () => {
  it('keeps a party running through the repeated hour on 25 October 2026', () => {
    // 9pm British Summer Time on Saturday 24 October to 2am Greenwich Mean Time on the 25th:
    // six real hours, because 1am to 2am happens twice.
    const event = { startDate: '2026-10-24T20:00:00.000Z', endDate: '2026-10-25T02:00:00.000Z' }
    expect(isEventOver(event, at('2026-10-25T00:30:00Z'))).toBe(false) // the first 1:30am
    expect(isEventOver(event, at('2026-10-25T01:30:00Z'))).toBe(false) // the second 1:30am
    expect(isEventOver(event, at('2026-10-25T02:01:00Z'))).toBe(true)
  })

  it('reads a naive end time on the right side of the change on 28 March 2027', () => {
    // 9pm on Saturday 27 March (GMT, 21:00 UTC) to 2:30am on the 28th, which is British Summer
    // Time by then: 01:30 UTC.
    const event = { startDate: '2027-03-27T21:00:00', endDate: '2027-03-28T02:30:00' }
    expect(isEventOver(event, at('2027-03-28T01:29:00Z'))).toBe(false)
    expect(isEventOver(event, at('2027-03-28T01:31:00Z'))).toBe(true)
  })
})

describe('the event page while the night is under way', () => {
  const fivePastSeven = at('2026-10-07T18:05:00Z')
  const afterTheQuiz = at('2026-10-07T20:31:00Z')

  it('is not "ended" five minutes after the start', () => {
    expect(getEventPhase(quiz, fivePastSeven)).toBe('upcoming')
    const presentation = getEventPresentation(quiz, fivePastSeven)
    expect(presentation.hasEnded).toBe(false)
    expect(presentation.hasStarted).toBe(true)
    expect(presentation.factsVariant).toBe('live')
  })

  it('keeps booking closed from the start, as before', () => {
    expect(getEventBookingBlockReason(quiz, fivePastSeven)).toBe('past')
    const presentation = getEventPresentation(quiz, fivePastSeven)
    expect(presentation.showBookingForm).toBe(false)
    expect(presentation.showBookingPolicy).toBe(false)
    expect(presentation.showBookingFaqs).toBe(false)
    expect(presentation.showBookingCtaBand).toBe(false)
    expect(presentation.showAddToCalendar).toBe(false)
    expect(presentation.includeSchemaOffers).toBe(false)
  })

  it('is "ended" one minute after the finish', () => {
    expect(getEventPhase(quiz, afterTheQuiz)).toBe('ended')
    const presentation = getEventPresentation(quiz, afterTheQuiz)
    expect(presentation.hasEnded).toBe(true)
    expect(presentation.factsVariant).toBe('historic')
    expect(presentation.showStatusRow).toBe(false)
  })

  it('is fully bookable five minutes before the start', () => {
    const presentation = getEventPresentation(quiz, at('2026-10-07T17:55:00Z'))
    expect(presentation.hasStarted).toBe(false)
    expect(presentation.showBookingForm).toBe(true)
    expect(presentation.showAddToCalendar).toBe(true)
    expect(presentation.includeSchemaOffers).toBe(true)
  })

  it('still calls a cancelled night cancelled', () => {
    expect(getEventPhase({ ...quiz, event_status: 'cancelled' }, fivePastSeven)).toBe('cancelled')
  })
})

describe('the title and the search stage follow the finish, not the start', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('keeps the on-sale title and the active stage while the quiz is on', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-10-07T18:05:00Z'))
    expect(getEventPageTitle(quiz)).toMatch(/^Quiz Night, Wed,? 7 Oct$/)
    expect(getEventSeoStrategy(quiz)).toEqual({ index: true, showEndedBanner: false, stage: 'active' })
  })

  it('moves to the dated title and the recent stage once it has finished', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-10-07T20:31:00Z'))
    expect(getEventPageTitle(quiz)).toBe('Quiz Night, 7 October 2026')
    expect(getEventSeoStrategy(quiz)).toEqual({ index: true, showEndedBanner: true, stage: 'recent' })
  })
})

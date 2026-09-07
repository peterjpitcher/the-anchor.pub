/**
 * An outage on /whats-on must not read as an empty diary.
 *
 * The hub used to fetch with `.catch(() => [])`, so a 503 from the management
 * API arrived at the renderer as "no events" and the page told the visitor
 * "No upcoming events scheduled at the moment." with no way to reach us. That
 * is a public read path failing open: a claim about the business made at
 * exactly the moment we could not check it.
 *
 * The failure is injected at the `anchorAPI` boundary, beneath the read
 * helpers, because that is the only level at which "empty" and "broken" are
 * genuinely different. Mocking the page's own data functions would prove
 * nothing about the path a visitor actually travels.
 */
import { isValidElement, type ReactElement } from 'react'
import { anchorAPI } from '@/lib/api/client'
import type { Event } from '@/lib/api'

jest.mock('@/lib/error-handling', () => {
  const actual = jest.requireActual('@/lib/error-handling')
  return { ...actual, logError: jest.fn() }
})

import { logError } from '@/lib/error-handling'
import WhatsOnPage from '@/app/whats-on/page'

const getEventsSpy = jest.spyOn(anchorAPI, 'getEvents')
const getBusinessHoursSpy = jest.spyOn(anchorAPI, 'getBusinessHours')

const OUTAGE_TITLE = 'We could not load the dates just now'
const EMPTY_DIARY_COPY = 'No upcoming events scheduled at the moment.'
const PHONE = '01753 682707'

const DAY_MS = 24 * 60 * 60 * 1000

function futureEvent(id: string, daysAhead = 7): Event {
  return {
    '@type': 'Event',
    id,
    slug: id,
    name: `Test event ${id}`,
    description: 'Fixture',
    startDate: new Date(Date.now() + daysAhead * DAY_MS).toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'The Anchor, Stanwell Moor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Horton Road',
        addressLocality: 'Stanwell Moor',
        addressRegion: 'Surrey',
        postalCode: 'TW19 6AQ',
        addressCountry: 'GB'
      }
    }
  }
}

function listResponse(events: Event[]) {
  return { events, pagination: { total: events.length, limit: 100, offset: 0 } }
}

/** The shape lib/api/client.ts actually throws on a non-ok upstream response. */
function upstreamError(status: number) {
  return { code: 'API_EVENTS_ERROR', status, message: `Failed to load events list (${status})` }
}

/**
 * Flattens an element tree to a searchable string. The page is a server
 * component, so it is awaited into elements and inspected rather than mounted:
 * every child stays an unrendered element, which keeps client components out of
 * the way and keeps the assertions about this page's own output.
 */
function serialise(node: unknown): string {
  return JSON.stringify(node, (_key, value) => (isValidElement(value) ? value.props : value)) ?? ''
}

type ElementProps = Record<string, unknown>

/** The first element in the tree whose props satisfy `match`, or null. */
function findElement(node: unknown, match: (props: ElementProps) => boolean): ReactElement | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElement(child, match)
      if (found) return found
    }
    return null
  }

  if (!isValidElement(node)) return null

  const props = node.props as ElementProps
  if (match(props)) return node

  return findElement(props.children, match)
}

function findByProp(node: unknown, prop: string, value: unknown): ReactElement | null {
  return findElement(node, props => props[prop] === value)
}

/** The `UpcomingEvents` element: the one thing on this page holding an events list. */
function eventsList(node: unknown): ElementProps {
  const element = findElement(node, props => Array.isArray(props.events))
  if (!element) throw new Error('No events list found on the page')
  return element.props as ElementProps
}

function hubEventLogs(context: string) {
  return (logError as jest.Mock).mock.calls.filter(call => call[0] === context)
}

beforeEach(() => {
  getEventsSpy.mockReset()
  getBusinessHoursSpy.mockReset()
  // Hours are not what this suite is about, and an unmocked call would reach
  // the live management API from a test run.
  getBusinessHoursSpy.mockResolvedValue(null as unknown as Awaited<ReturnType<typeof anchorAPI.getBusinessHours>>)
  ;(logError as jest.Mock).mockClear()
})

afterAll(() => {
  getEventsSpy.mockRestore()
  getBusinessHoursSpy.mockRestore()
})

describe('when the management API is unreachable', () => {
  it('says the dates could not be loaded, and never that there is nothing on', async () => {
    getEventsSpy.mockRejectedValue(upstreamError(503))

    const page = await WhatsOnPage()

    expect(findByProp(page, 'title', OUTAGE_TITLE)).not.toBeNull()
    // The empty-diary claim is withheld outright, not merely unrendered: there
    // is no empty state for the list to fall back on.
    expect(eventsList(page).emptyState).toBeNull()
    expect(serialise(page)).not.toContain(EMPTY_DIARY_COPY)
  })

  it('carries the phone number inside the outage notice itself', async () => {
    getEventsSpy.mockRejectedValue(upstreamError(503))

    const page = await WhatsOnPage()
    const notice = findByProp(page, 'title', OUTAGE_TITLE)

    expect(serialise(notice)).toContain(PHONE)
  })

  it('raises the failure to us through logError, with no customer data', async () => {
    getEventsSpy.mockRejectedValue(upstreamError(503))

    await WhatsOnPage()

    expect(hubEventLogs('whats-on-upcoming-events')).toEqual([
      [
        'whats-on-upcoming-events',
        expect.any(Error),
        { status: 'unavailable', failure: 'transient', eventsRendered: 0 }
      ]
    ])
  })

  it('treats a 200 carrying no events array the same way', async () => {
    // Nothing throws here, so only the payload check catches it. A malformed
    // 200 is still an outage and must not be published as an empty diary.
    getEventsSpy.mockResolvedValue({} as unknown as ReturnType<typeof listResponse>)

    const page = await WhatsOnPage()

    expect(findByProp(page, 'title', OUTAGE_TITLE)).not.toBeNull()
    expect(eventsList(page).emptyState).toBeNull()
    expect(hubEventLogs('whats-on-upcoming-events')[0][2]).toMatchObject({ failure: 'invalid-payload' })
  })
})

describe('when the diary really is empty', () => {
  it('still reads as an empty diary, not as an outage', async () => {
    getEventsSpy.mockResolvedValue(listResponse([]))

    const page = await WhatsOnPage()
    const list = eventsList(page)

    // Nothing loaded and nothing failed, so the empty state is what renders.
    expect(list.events).toEqual([])
    expect(serialise(list.emptyState)).toContain(EMPTY_DIARY_COPY)
    expect(findByProp(page, 'title', OUTAGE_TITLE)).toBeNull()
  })

  it('raises nothing to us, because nothing failed', async () => {
    getEventsSpy.mockResolvedValue(listResponse([]))

    await WhatsOnPage()

    expect(hubEventLogs('whats-on-upcoming-events')).toEqual([])
    expect(hubEventLogs('whats-on-recent-events')).toEqual([])
  })
})

describe('when the diary loads', () => {
  it('shows the events, with no outage notice', async () => {
    getEventsSpy.mockResolvedValue(listResponse([futureEvent('quiz-1'), futureEvent('bingo-1', 14)]))

    const page = await WhatsOnPage()
    const list = eventsList(page)

    expect(list.events).toHaveLength(2)
    expect(findByProp(page, 'title', OUTAGE_TITLE)).toBeNull()
    // The empty-state copy is still supplied, so a genuinely empty diary could
    // still say so. It is withheld only during an outage.
    expect(serialise(list.emptyState)).toContain(EMPTY_DIARY_COPY)
  })
})

describe('the heading over the card grid', () => {
  it('makes no claim about a month, so the cards cannot contradict it', async () => {
    // The grid was headed "This month's headline nights" above fifteen events
    // running across four months.
    getEventsSpy.mockResolvedValue(listResponse([futureEvent('quiz-1'), futureEvent('bingo-1', 100)]))

    const output = serialise(await WhatsOnPage())

    expect(output).not.toContain("This month's headline nights")
    expect(output).toContain("What's coming up")
  })
})

/**
 * What the event detail page must put in front of a customer.
 *
 * Every assertion here corresponds to something the live page was getting
 * wrong on 6 September 2026, verified against the served HTML of
 * /events/detention-disco-back-to-school-music-bingo-2026-09-11:
 *
 *  - "Event type: music-bingo", a raw database slug, printed to customers.
 *  - Sixteen em dashes in the served HTML, including inside the JSON-LD.
 *  - No way to add the night to a diary.
 *  - A share control inside a `hidden lg:block` sidebar, withheld from the
 *    phone audience that does nearly all the sharing.
 *  - "How to pay" visible only from 1024px up.
 *  - An outline that opened with an H3 before the first H2, and a map frame
 *    with no title.
 *
 * The page is a server component, so it is awaited and then rendered, the same
 * pattern as tests/unit/parking-page-prices.test.tsx.
 */

import { render, screen } from '@testing-library/react'
import type { Event } from '@/lib/api'
import { getEventBookingCopy } from '@/lib/event-booking-copy'

/**
 * Built from its code point: the write hook blocks any file containing the
 * literal character, which is the same rule this page now enforces on copy
 * arriving from the management API.
 */
const EM_DASH = String.fromCharCode(0x2014)

const mockGetEvent = jest.fn()

jest.mock('@/lib/api', () => {
  const actual = jest.requireActual('@/lib/api')
  return {
    ...actual,
    anchorAPI: { getEvent: (idOrSlug: string) => mockGetEvent(idOrSlug) }
  }
})

// The "next date in this category" lookup only runs for an event that has
// ended. Stubbed so the ended-event case stays hermetic rather than attempting
// a real request and logging the failure it then swallows.
jest.mock('@/lib/api/events', () => {
  const actual = jest.requireActual('@/lib/api/events')
  return { ...actual, getUpcomingEventsByCategory: async () => [] }
})

jest.mock('@/components/features/EventBooking/ManagementEventBookingForm', () => ({
  ManagementEventBookingForm: () => <div data-testid="booking-form" />
}))

jest.mock('@/components/events/RelatedEvents', () => ({
  __esModule: true,
  default: () => null
}))

jest.mock('@/components/tracking/EventPageTracker', () => ({
  EventPageTracker: () => null
}))

import EventPage, { generateMetadata } from '@/app/events/[id]/page'

/** Sunday 6 September 2026, midday London. */
const FIXED_NOW = Date.UTC(2026, 8, 6, 11, 0, 0)
/** Friday 11 September 2026, 7pm London. */
const EVENT_START = '2026-09-11T19:00:00+01:00'
const EVENT_SLUG = 'detention-disco-back-to-school-music-bingo-2026-09-11'
const EVENT_NAME = 'Detention Disco: Back to School Music Bingo'

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    '@type': 'Event',
    id: 'evt-detention-disco',
    slug: EVENT_SLUG,
    name: EVENT_NAME,
    description: `School disco anthems ${EM_DASH} played on the big screen.`,
    shortDescription: `School disco anthems ${EM_DASH} played on the big screen.`,
    longDescription: `Two rounds of music bingo ${EM_DASH} with quizzes between the games.`,
    highlights: [`Prizes every round ${EM_DASH} including a bar tab`],
    faq: [
      {
        '@type': 'Question',
        name: 'Is there a dress code?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `School uniform is optional ${EM_DASH} most people wear it anyway.`
        }
      }
    ],
    startDate: EVENT_START,
    eventStatus: 'scheduled',
    event_status: 'scheduled',
    event_type: 'music-bingo',
    eventAttendanceMode: 'OfflineEventAttendanceMode',
    category: { id: 'cat-music-bingo', name: 'Music Bingo', slug: 'music-bingo' },
    doors_time: '18:30',
    end_time: '21:30',
    ticket_price: 5,
    booking_mode: 'communal',
    bookings_enabled: true,
    squareImageUrl: '/images/events/test-poster.jpg',
    created_at: '2026-07-01T09:00:00Z',
    updated_at: '2026-09-01T09:00:00Z',
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
  } as unknown as Event
}

async function renderEventPage(event: Event = makeEvent()): Promise<HTMLElement> {
  mockGetEvent.mockResolvedValue(event)
  const ui = await EventPage({ params: { id: event.slug } })
  return render(ui).container
}

/**
 * Whether anything between this element and the document root is display:none
 * at the smallest breakpoint. Tailwind's `hidden` is the class the sidebar used
 * to carry, so a control inside one is simply absent on a phone.
 */
function isHiddenOnMobile(element: Element | null): boolean {
  let node: Element | null = element
  while (node) {
    if (node.classList?.contains('hidden')) return true
    node = node.parentElement
  }
  return false
}

function headingLevels(container: HTMLElement): number[] {
  return Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((heading) =>
    Number(heading.tagName.slice(1))
  )
}

function jsonLdText(container: HTMLElement): string {
  return Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
    .map((script) => script.textContent || '')
    .join('\n')
}

/**
 * The words on the page, with the JSON-LD taken out. The structured data holds
 * canonical URLs, which legitimately contain the event slug, so leaving it in
 * would make "no raw slug on the page" impossible to assert.
 */
function visibleText(container: HTMLElement): string {
  const clone = container.cloneNode(true) as HTMLElement
  clone.querySelectorAll('script').forEach((script) => script.remove())
  return clone.textContent || ''
}

let nowSpy: jest.SpyInstance<number, []>

beforeEach(() => {
  mockGetEvent.mockReset()
  nowSpy = jest.spyOn(Date, 'now').mockReturnValue(FIXED_NOW)
})

afterEach(() => {
  nowSpy.mockRestore()
  jest.restoreAllMocks()
})

describe('event detail page, what a customer reads', () => {
  it('never prints a raw database slug, and names the category once in human words', async () => {
    // Guards the fixture itself: the record really does hold the slug that was
    // reaching the page, so this is not passing on an absent field.
    expect(makeEvent().event_type).toBe('music-bingo')

    const container = await renderEventPage()

    expect(screen.queryByText('Event type')).toBeNull()
    expect(visibleText(container)).not.toContain('music-bingo')
    expect(screen.getAllByText('Category').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Music Bingo').length).toBeGreaterThan(0)
  })

  it('strips em dashes from the visible copy and from the JSON-LD', async () => {
    const fixture = makeEvent()
    // The record carries them in four separate prose fields.
    expect(fixture.description).toContain(EM_DASH)
    expect(fixture.longDescription).toContain(EM_DASH)
    expect(fixture.highlights?.[0]).toContain(EM_DASH)

    const container = await renderEventPage(fixture)

    expect(visibleText(container)).not.toContain(EM_DASH)
    expect(jsonLdText(container)).not.toContain(EM_DASH)
    // Normalised, not deleted: every sentence still reads, in the body copy,
    // the highlights, the FAQ answers and the structured data alike.
    expect(visibleText(container)).toContain(
      'Two rounds of music bingo, with quizzes between the games.'
    )
    expect(visibleText(container)).toContain('Prizes every round, including a bar tab')
    expect(visibleText(container)).toContain(
      'School uniform is optional, most people wear it anyway.'
    )
    expect(jsonLdText(container)).toContain('School disco anthems, played on the big screen.')
  })

  it('offers the diary and the share control at every breakpoint, beside the booking action', async () => {
    const container = await renderEventPage()

    const googleCalendar = screen.getByRole('link', {
      name: `Add ${EVENT_NAME} to Google Calendar`
    })
    const icsDownload = screen.getByRole('link', {
      name: `Download a calendar file for ${EVENT_NAME}, for Apple or Outlook`
    })
    const share = screen.getByRole('button', { name: /^Share\b/ })

    expect(isHiddenOnMobile(googleCalendar)).toBe(false)
    expect(isHiddenOnMobile(icsDownload)).toBe(false)
    expect(isHiddenOnMobile(share)).toBe(false)

    // Mounted with the booking action rather than at the foot of the page.
    const calendarGroup = container.querySelector('[data-calendar-source]')
    expect(calendarGroup?.getAttribute('data-calendar-source')).toBe('event_page_booking_actions')
    expect(calendarGroup?.closest('.lg\\:sticky')).not.toBeNull()
  })

  it('withholds the diary control once the night has been and gone', async () => {
    // The gate is the presentation flag, not a local date test, so a page that
    // has ended offers nothing to diarise.
    await renderEventPage(makeEvent({ startDate: '2026-08-14T19:00:00+01:00' }))

    expect(
      screen.queryByRole('link', { name: `Add ${EVENT_NAME} to Google Calendar` })
    ).toBeNull()
  })

  it('states the day, date, start time, price and how to pay as text', async () => {
    const container = await renderEventPage()
    const text = visibleText(container)

    expect(text).toContain('Friday')
    expect(text).toContain('11 September 2026')
    expect(text).toContain('7pm')
    expect(text).toContain('£5')
    // Resolved from the record's booking mode and price, not from the poster.
    expect(text).toContain('No payment now. Book online and pay £5 per person on arrival.')

    const howToPay = screen.getByText('Booking and payment')
    expect(isHiddenOnMobile(howToPay)).toBe(false)
  })

  it('publishes no time the record does not hold', async () => {
    // booking_mode 'table' is what takes getEventBookingCopy() down its Music
    // Bingo branch, whose food prompt hardcodes an arrival time and a start
    // time. The record here says 6:30pm arrival and a 7pm start, and
    // docs/SSOT.md §10 records the prompt's 8pm as wrong.
    const tableBooked = makeEvent({ booking_mode: 'table' })
    const copy = getEventBookingCopy(tableBooked)
    expect(copy.foodPrompt.length).toBeGreaterThan(0)

    const container = await renderEventPage(tableBooked)
    const text = visibleText(container)

    // How to pay stays; the inferred times go.
    expect(text).toContain(copy.policy)
    expect(text).not.toContain(copy.foodPrompt)
    expect(text).not.toContain('8pm')
    expect(text).toContain('Arrive from')
    expect(text).toContain('6:30pm')
    // "Doors" is banned customer-facing wording (docs/SSOT.md §10).
    expect(text).not.toMatch(/\bDoors\b/i)
  })

  it('opens the outline at H2 and skips no heading level', async () => {
    const container = await renderEventPage()
    const levels = headingLevels(container)

    expect(levels[0]).toBe(1)
    expect(levels[1]).toBe(2)
    expect(levels.filter((level) => level === 1)).toHaveLength(1)

    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index] - levels[index - 1]).toBeLessThanOrEqual(1)
    }
  })

  it('names the map frame', async () => {
    const container = await renderEventPage()
    const frame = container.querySelector('iframe')

    expect(frame).not.toBeNull()
    expect(frame?.getAttribute('title')).toContain(EVENT_NAME)
    // title and aria-label are resolved from one value, so they cannot disagree.
    expect(frame?.getAttribute('aria-label')).toBe(frame?.getAttribute('title'))
  })
})

describe('event detail page head', () => {
  beforeEach(() => {
    mockGetEvent.mockResolvedValue(makeEvent())
  })

  it('dates the link preview instead of describing it as "next Friday"', async () => {
    const metadata = await generateMetadata({ params: { id: EVENT_SLUG } })
    const openGraph = metadata.openGraph as { description?: string } | undefined
    const description = openGraph?.description || ''

    expect(description).toContain('Friday, 11 September 2026')
    // A cached card is reshared for weeks, so no phrase may depend on the week
    // it was rendered in.
    expect(description).not.toMatch(
      /\b(?:this|next)\s+(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day\b/i
    )
    expect(description).not.toMatch(/\b(?:today|tonight|tomorrow)\b/i)
  })

  it('declares the page as one dated article, not as the website', async () => {
    const metadata = await generateMetadata({ params: { id: EVENT_SLUG } })
    const openGraph = metadata.openGraph as
      | { type?: string; section?: string; modifiedTime?: string; publishedTime?: string }
      | undefined

    expect(openGraph?.type).toBe('article')
    expect(openGraph?.section).toBe('Music Bingo')
    expect(openGraph?.publishedTime).toBe('2026-07-01T09:00:00Z')
    expect(openGraph?.modifiedTime).toBe('2026-09-01T09:00:00Z')
  })

  it('omits an article timestamp the record does not hold', async () => {
    mockGetEvent.mockResolvedValue(makeEvent({ created_at: undefined, updated_at: 'not a date' }))

    const metadata = await generateMetadata({ params: { id: EVENT_SLUG } })
    const openGraph = metadata.openGraph as
      | { modifiedTime?: string; publishedTime?: string }
      | undefined

    expect(openGraph?.publishedTime).toBeUndefined()
    expect(openGraph?.modifiedTime).toBeUndefined()
  })

  it('carries no em dash into the head', async () => {
    const metadata = await generateMetadata({ params: { id: EVENT_SLUG } })
    const openGraph = metadata.openGraph as { description?: string } | undefined

    expect(metadata.description).not.toContain(EM_DASH)
    expect(openGraph?.description).not.toContain(EM_DASH)
    expect(metadata.description).toContain('School disco anthems, played on the big screen.')
  })
})

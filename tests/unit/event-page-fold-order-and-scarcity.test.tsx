/**
 * Three defects on the event detail page, measured on 6 and 7 September 2026
 * against the served page at 1440x900 and 375x812.
 *
 * EV-010: nothing above the desktop fold sold the event except the artwork. The
 *   poster ran y150 to y651, the H1 was sliced by the fold at y731 to y913, the
 *   date and price line sat at y929 and the "Book tickets" button at y1011 to
 *   y1067. NN/g eyetracking puts about 57% of page-viewing time above the fold.
 *
 * EV-015: the two-column grid used CSS `order` to lift the booking form above
 *   the description on mobile, so a visitor who had not decided yet met a form
 *   before learning what the night was. CSS order changes painting order only,
 *   so a screen reader or a keyboard still met the form first.
 *
 * EV-012: `getEventSeatAvailabilityLabel` was written, exported, and called
 *   from nowhere, so the page never told anyone how many places were left.
 *
 * The page is a server component, so it is awaited and then rendered, the same
 * pattern as tests/unit/event-detail-page.test.tsx.
 */

import { render, screen } from '@testing-library/react'
import type { Event } from '@/lib/api'
import { EventArtworkHero } from '@/components/events/EventArtworkHero'
import { getEventSeatAvailabilityLabel } from '@/lib/event-booking-experience'

const mockGetEvent = jest.fn()

jest.mock('@/lib/api', () => {
  const actual = jest.requireActual('@/lib/api')
  return {
    ...actual,
    anchorAPI: { getEvent: (idOrSlug: string) => mockGetEvent(idOrSlug) }
  }
})

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

import EventPage from '@/app/events/[id]/page'

/** Sunday 6 September 2026, midday London. */
const FIXED_NOW = Date.UTC(2026, 8, 6, 11, 0, 0)
/** Friday 11 September 2026, 7pm London. */
const EVENT_START = '2026-09-11T19:00:00+01:00'
/** Saturday 1 August 2026, 7pm London: five weeks before FIXED_NOW. */
const PAST_START = '2026-08-01T19:00:00+01:00'
const EVENT_SLUG = 'detention-disco-back-to-school-music-bingo-2026-09-11'

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    '@type': 'Event',
    id: 'evt-detention-disco',
    slug: EVENT_SLUG,
    name: 'Detention Disco: Back to School Music Bingo',
    description: 'School disco anthems played on the big screen.',
    longDescription: 'Two rounds of music bingo with quizzes between the games.',
    highlights: ['Prizes every round'],
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

/** True when `b` comes after `a` in document order, whatever CSS then does. */
function precedes(a: Element, b: Element): boolean {
  return Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
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

/*
 * EV-010, the desktop fold.
 *
 * Measured on the served page at 1440x900, with the browser's own numbers:
 *  - the poster's top edge sits 150px down (site header 126px, plus the hero's
 *    24px top padding),
 *  - from the poster's bottom edge to the bottom of the "Book tickets" button
 *    is a fixed 416px of breadcrumb, H1, lead, badges and buttons.
 * So the poster may be at most 900 - 150 - 416 = 334px tall before the primary
 * CTA is pushed below the fold. jsdom cannot lay a page out, so the budget is
 * checked against the cap the component actually ships rather than against a
 * rendered rectangle.
 */
const FOLD_HEIGHT_PX = 900
const HERO_TOP_TO_POSTER_PX = 150
const POSTER_BOTTOM_TO_CTA_BOTTOM_PX = 416
const POSTER_HEIGHT_BUDGET_PX = FOLD_HEIGHT_PX - HERO_TOP_TO_POSTER_PX - POSTER_BOTTOM_TO_CTA_BOTTOM_PX

/** The frame's className, with Tailwind's underscores read back as spaces. */
function frameClasses(container: HTMLElement): string {
  const frame = container.querySelector('[data-event-artwork-frame]')
  if (!frame) throw new Error('no artwork frame rendered')
  return frame.className.replace(/_/g, ' ')
}

/**
 * The poster height the shipped desktop cap resolves to at a given viewport
 * height. The cap is declared as a max-WIDTH, because width drives the box and
 * the aspect ratio derives the height, so a 16:9 frame's width is converted
 * back to a height here exactly as the browser does.
 */
function resolveDesktopPosterHeight(classes: string, viewportHeightPx: number, wide: boolean): number {
  const pattern = wide
    ? /lg:\[--artwork-frame-max:clamp\((\d+)px,calc\(\(100vh - (\d+)rem\)\*16\/9\),(\d+)px\)\]/
    : /lg:\[--artwork-frame-max:clamp\((\d+)px,calc\(100vh - (\d+)rem\),(\d+)px\)\]/
  const match = classes.match(pattern)
  if (!match) throw new Error(`no lg viewport-height cap in: ${classes}`)

  const [, floorPx, offsetRem, ceilingPx] = match
  const available = viewportHeightPx - Number(offsetRem) * 16
  const preferred = wide ? (available * 16) / 9 : available
  const width = Math.min(Math.max(preferred, Number(floorPx)), Number(ceilingPx))
  return wide ? (width * 9) / 16 : width
}

describe('EV-010, the desktop fold sells more than a poster', () => {
  it.each([
    ['square artwork', false],
    ['landscape artwork', true]
  ])('caps %s so the H1, the price line and the CTA clear the fold at 1440x900', (_label, wide) => {
    const { container } = render(
      <EventArtworkHero
        image="/images/events/test-poster.jpg"
        imageAlt="Test poster"
        wide={wide as boolean}
        crumb="Music Bingo"
        title="Detention Disco: Back to School Music Bingo"
        lead="Book tickets for Friday 11 September. No payment now, pay 5 on arrival."
        actions={<button type="button">Book tickets</button>}
      />
    )

    const posterHeight = resolveDesktopPosterHeight(frameClasses(container), FOLD_HEIGHT_PX, wide as boolean)
    const ctaBottom = HERO_TOP_TO_POSTER_PX + posterHeight + POSTER_BOTTOM_TO_CTA_BOTTOM_PX

    expect(posterHeight).toBeLessThanOrEqual(POSTER_HEIGHT_BUDGET_PX)
    expect(ctaBottom).toBeLessThanOrEqual(FOLD_HEIGHT_PX)
  })

  it('leaves the phone untouched: the same max-width it always had, at full size', () => {
    const square = render(
      <EventArtworkHero image="/a.jpg" imageAlt="a" wide={false} crumb="Music Bingo" title="A" />
    )
    expect(frameClasses(square.container)).toContain('[--artwork-frame-max:500px]')

    const landscape = render(
      <EventArtworkHero image="/a.jpg" imageAlt="a" wide crumb="Music Bingo" title="A" />
    )
    expect(frameClasses(landscape.container)).toContain('[--artwork-frame-max:890px]')

    // The cap that shrinks the poster is `lg:` only, so nothing below 1024px
    // can inherit it.
    expect(frameClasses(square.container)).not.toMatch(/(?:^|\s)\[--artwork-frame-max:clamp/)
    expect(frameClasses(landscape.container)).not.toMatch(/(?:^|\s)\[--artwork-frame-max:clamp/)
  })

  it('constrains the poster by height and never by crop or stretch', () => {
    const square = render(
      <EventArtworkHero image="/a.jpg" imageAlt="a" wide={false} crumb="Music Bingo" title="A" />
    )
    const landscape = render(
      <EventArtworkHero image="/a.jpg" imageAlt="a" wide crumb="Music Bingo" title="A" />
    )

    expect(frameClasses(square.container)).toContain('aspect-square')
    expect(frameClasses(landscape.container)).toContain('aspect-[16/9]')

    const image = square.container.querySelector('img')
    expect(image?.className).toContain('object-contain')
    expect(image?.className).not.toContain('object-cover')
  })
})

describe('EV-015, the pitch is read before the form', () => {
  it('puts About This Event before the booking form in the DOM, not in CSS order', async () => {
    const container = await renderEventPage()

    const about = screen.getByText('About This Event')
    const highlights = screen.getByText('Event Highlights')
    const booking = container.querySelector('#event-booking')
    const moreDetails = screen.getByText('More event details')

    expect(booking).not.toBeNull()
    expect(precedes(highlights, about)).toBe(true)
    expect(precedes(about, booking as Element)).toBe(true)
    // The supporting detail follows the booking action, so the phone order is
    // highlights, About This Event, then #event-booking.
    expect(precedes(booking as Element, moreDetails)).toBe(true)
  })

  it('carries no CSS order swap anywhere in the main content grid', async () => {
    const container = await renderEventPage()
    const grid = container.querySelector('#event-booking')?.closest('.grid')
    expect(grid).not.toBeNull()

    const ordered = Array.from((grid as Element).querySelectorAll('[class]')).filter((node) =>
      /(?:^|\s)(?:[a-z]+:)?order-\d/.test(node.className.toString())
    )
    expect(ordered.map((node) => node.className.toString())).toEqual([])
    expect((grid as Element).className).not.toMatch(/order-/)
  })

  it('keeps the desktop sticky sidebar: three blocks placed by row and column', async () => {
    const container = await renderEventPage()
    const grid = container.querySelector('#event-booking')?.closest('.grid') as Element
    const children = Array.from(grid.children).map((child) => child.className)

    expect(children).toHaveLength(3)
    expect(children[0]).toContain('lg:col-start-1')
    expect(children[0]).toContain('lg:row-start-1')
    // The booking column spans both left-hand rows, which is what gives the
    // sticky sidebar a containing block taller than itself.
    expect(children[1]).toContain('lg:col-start-2')
    expect(children[1]).toContain('lg:row-span-2')
    expect(children[2]).toContain('lg:col-start-1')
    expect(children[2]).toContain('lg:row-start-2')

    expect(container.querySelector('#event-booking')?.parentElement?.className).toContain('lg:sticky')
  })

  it('offsets the anchor from the top, so the bottom bar cannot cover it', async () => {
    const container = await renderEventPage()
    const booking = container.querySelector('#event-booking') as Element

    // A hash jump parks the target 96px below the viewport top; the global
    // sticky CTA bar is 73px tall and fixed to the bottom, so the two cannot
    // meet. The section also reserves pb-28 (112px) so the bar never covers
    // the foot of the content either.
    expect(booking.className).toContain('scroll-mt-24')
    expect(booking.closest('section')?.className).toContain('pb-28')
  })
})

describe('EV-012, live places left beside the booking action', () => {
  /** The label the resolver produces, so the page can never invent its own. */
  async function renderLabel(event: Event): Promise<string | null> {
    const container = await renderEventPage(event)
    const booking = container.querySelector('#event-booking')
    const badge = booking?.querySelector('span.rounded-pill')
    return badge ? badge.textContent : null
  }

  it.each([
    ['above the wording threshold', { booking_mode: 'table', seats_remaining: 11 }, '11 seats available'],
    ['at the wording threshold', { booking_mode: 'table', seats_remaining: 10 }, 'Only 10 seats left'],
    ['below the wording threshold', { booking_mode: 'table', seats_remaining: 3 }, 'Only 3 seats left'],
    ['down to the last one', { booking_mode: 'table', seats_remaining: 1 }, 'Only 1 seat left'],
    ['at zero', { booking_mode: 'table', seats_remaining: 0 }, 'Sold out'],
    [
      'seated sold out, standing still available',
      { booking_mode: 'communal', seated_remaining: 0, standing_remaining: 6, total_remaining: 6 },
      '6 standing left'
    ],
    // Standing is offered only once every seat has sold (docs/SSOT.md §10), so
    // while seats remain the count is the seated one alone. This used to read
    // "43 seated, 11 standing left".
    [
      'seats and standing both on sale, which counts seats only',
      { booking_mode: 'communal', seated_remaining: 43, standing_remaining: 11, total_remaining: 54 },
      '43 seats available'
    ],
    [
      'a few seats left with standing behind them, which still counts seats only',
      { booking_mode: 'communal', seated_remaining: 4, standing_remaining: 11, total_remaining: 15 },
      'Only 4 seats left'
    ],
    [
      'seats and standing both gone',
      { booking_mode: 'communal', seated_remaining: 0, standing_remaining: 0, total_remaining: 0 },
      'Sold out'
    ]
  ])('says %s', async (_label, capacity, expected) => {
    const event = makeEvent(capacity as Partial<Event>)

    // The words are the resolver's, not this page's.
    expect(getEventSeatAvailabilityLabel(event)).toBe(expected)
    expect(await renderLabel(event)).toBe(expected)
  })

  it('never mentions standing anywhere on the page while seats remain', async () => {
    const container = await renderEventPage(
      makeEvent({ booking_mode: 'communal', seated_remaining: 49, standing_remaining: 11, total_remaining: 60 })
    )

    expect(container.textContent || '').not.toMatch(/standing/i)
  })

  it('says nothing at all when the API sent no capacity', async () => {
    const event = makeEvent({ booking_mode: 'table' })
    expect(getEventSeatAvailabilityLabel(event)).toBeNull()
    expect(await renderLabel(event)).toBeNull()
  })

  it('says nothing on a night that has already happened', async () => {
    const event = makeEvent({
      booking_mode: 'table',
      seats_remaining: 4,
      startDate: PAST_START,
      end_time: '21:30'
    })

    // The count itself is resolvable; it is the page that must withhold it.
    expect(getEventSeatAvailabilityLabel(event)).toBe('Only 4 seats left')
    expect(await renderLabel(event)).toBeNull()
  })

  it('says nothing on a cancelled night', async () => {
    const event = makeEvent({
      booking_mode: 'table',
      seats_remaining: 4,
      event_status: 'cancelled',
      eventStatus: 'cancelled'
    } as Partial<Event>)

    expect(getEventSeatAvailabilityLabel(event)).toBe('Only 4 seats left')
    expect(await renderLabel(event)).toBeNull()
  })

  it('renders the count inside the booking block, beside what takes the booking', async () => {
    const container = await renderEventPage(makeEvent({ booking_mode: 'table', seats_remaining: 7 }))
    const booking = container.querySelector('#event-booking') as Element

    const badge = Array.from(booking.querySelectorAll('span')).find(
      (node) => node.textContent === 'Only 7 seats left'
    )
    expect(badge).toBeDefined()
    expect(precedes(badge as Element, screen.getByTestId('booking-form'))).toBe(true)
  })

  it('never hardcodes a scarcity claim: no count survives an empty record', async () => {
    const container = await renderEventPage(makeEvent({ booking_mode: 'table' }))
    const text = container.textContent || ''

    expect(text).not.toMatch(/seats? left/i)
    expect(text).not.toMatch(/seats available/i)
    expect(text).not.toMatch(/standing left/i)
    expect(text).not.toMatch(/selling fast|hurry|limited availability|only a few/i)
  })
})

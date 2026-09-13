/**
 * An outage on a game night page must not read as "no dates on sale".
 *
 * The four hubs read their dates through helpers that turned every failure into
 * `[]`: the API client answers a failed category lookup with placeholder
 * categories, the page found nothing in them, and a failed events call was
 * swallowed the same way. The booking card then said "No quiz night dates on
 * sale yet ... The next quiz night is not confirmed at the moment" on exactly
 * the days we could not check, and nothing was logged.
 *
 * The failure is injected at `fetch`, beneath the real API client, because the
 * client's own fallback is part of the defect: stubbing the page's data helper
 * would prove nothing about the path a visitor actually travels. The booking
 * form is stubbed because it is not what this suite is about, and an unmocked
 * request would reach the live management API.
 */
import type { ReactElement } from 'react'
import { render, screen, within } from '@testing-library/react'

jest.mock('@/lib/error-handling', () => {
  const actual = jest.requireActual('@/lib/error-handling')
  return { ...actual, logError: jest.fn() }
})

jest.mock('@/components/features/EventBooking/ManagementEventBookingForm', () => ({
  ManagementEventBookingForm: ({ event }: { event: { name: string } }) => (
    <div data-testid="booking-form">{event.name}</div>
  )
}))

import { logError } from '@/lib/error-handling'
import { GAME_NIGHTS, karaoke, type GameNightConfig } from '@/lib/game-nights'
import QuizNightPage from '@/app/quiz-night/page'
import CashBingoPage from '@/app/cash-bingo/page'
import MusicBingoPage from '@/app/music-bingo/page'
import KaraokePage from '@/app/karaoke/page'

type Slug = GameNightConfig['slug']

const PAGES: Array<{ slug: Slug; Page: () => Promise<ReactElement> }> = [
  { slug: 'quiz-night', Page: QuizNightPage },
  { slug: 'cash-bingo', Page: CashBingoPage },
  { slug: 'music-bingo', Page: MusicBingoPage },
  { slug: 'karaoke', Page: KaraokePage }
]

const PHONE = '01753 682707'
const DAY_MS = 24 * 60 * 60 * 1000

/** Every category the four pages look for, as the management API would list them. */
const CATEGORIES = Object.values(GAME_NIGHTS)
  .flatMap((config) => config.categories)
  .map((category, index) => ({
    id: `cat-${index}`,
    name: category.name,
    slug: category.slug,
    description: '',
    color: '',
    icon: '',
    is_active: true,
    default_start_time: '19:00',
    default_capacity: 60,
    event_count: 1
  }))

function categoryIdFor(name: string): string {
  const found = CATEGORIES.find((category) => category.name === name)
  if (!found) throw new Error(`No fixture category named ${name}`)
  return found.id
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

const categoriesResponse = (categories = CATEGORIES) =>
  json({ success: true, data: { categories, meta: { total: categories.length, lastUpdated: '2026-09-11T09:00:00Z' } } })

const eventsResponse = (events: unknown[]) =>
  json({ success: true, data: { events, pagination: { total: events.length, limit: 60, offset: 0 } } })

function futureEvent(id: string, daysAhead = 7) {
  return {
    '@type': 'Event',
    id,
    slug: id,
    name: `Fixture night ${id}`,
    description: 'Fixture',
    startDate: new Date(Date.now() + daysAhead * DAY_MS).toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    event_status: 'scheduled',
    bookings_enabled: true,
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

const originalFetch = global.fetch
const mockFetch = jest.fn()

/** Answers the two endpoints these pages read; anything else fails the test. */
function upstream(handlers: {
  categories: () => Promise<Response>
  events: (categoryId: string | null) => Promise<Response>
}) {
  mockFetch.mockImplementation(async (input: unknown) => {
    const url = String(input)
    if (url.includes('/event-categories')) return handlers.categories()
    if (url.includes('/events')) {
      return handlers.events(new URL(url, 'https://test.invalid').searchParams.get('category_id'))
    }
    throw new Error(`Unexpected request in test: ${url}`)
  })
}

const networkDown = () => Promise.reject(new TypeError('fetch failed'))

function gameNightLogs() {
  return (logError as jest.Mock).mock.calls.filter((call) => call[0] === 'game-night-events')
}

function outageTitle(config: GameNightConfig): string {
  return `We could not load the ${config.name} dates just now`
}

function emptyDiaryTitle(config: GameNightConfig): string {
  return `No ${config.name} dates on sale yet`
}

/** The on-page booking card every hero button jumps to. */
function bookingCard(container: HTMLElement): HTMLElement {
  const card = container.querySelector<HTMLElement>('#book')
  if (!card) throw new Error('No booking card at #book')
  return card
}

let consoleSpies: jest.SpyInstance[] = []

beforeEach(() => {
  global.fetch = mockFetch as unknown as typeof fetch
  mockFetch.mockReset()
  ;(logError as jest.Mock).mockClear()
  // The client warns on a network failure; that noise is expected here.
  consoleSpies = [
    jest.spyOn(console, 'warn').mockImplementation(() => {}),
    jest.spyOn(console, 'error').mockImplementation(() => {})
  ]
})

afterEach(() => {
  global.fetch = originalFetch
  consoleSpies.forEach((spy) => spy.mockRestore())
})

describe.each(PAGES)('/$slug when the management API is unreachable', ({ slug, Page }) => {
  const config = GAME_NIGHTS[slug]

  beforeEach(() => {
    upstream({ categories: networkDown, events: networkDown })
  })

  it('says the dates could not be loaded, and never that none are on sale', async () => {
    const { container } = render(await Page())

    const card = bookingCard(container)
    expect(within(card).getByText(outageTitle(config))).toBeInTheDocument()
    expect(within(card).getByText(`Call ${PHONE}`)).toBeInTheDocument()
    expect(screen.queryByText(emptyDiaryTitle(config))).not.toBeInTheDocument()
    expect(container.textContent).not.toMatch(/is not confirmed at the moment/)
  })

  it('replaces the dates list empty state with the same notice', async () => {
    const { container } = render(await Page())

    // Once in the booking card, once where the dates list would be.
    expect(screen.getAllByText(outageTitle(config))).toHaveLength(2)
    expect(container.textContent).not.toMatch(/loading soon|being finalised|in the diary right now/i)
  })

  it('raises the failure to us through logError, with no customer data', async () => {
    await Page()

    expect(gameNightLogs()).toEqual([
      [
        'game-night-events',
        expect.any(Error),
        { game: slug, status: 'unavailable', failure: 'transient', eventsRendered: 0 }
      ]
    ])
  })
})

describe('when the categories load but the events call fails', () => {
  it('still reports an outage rather than an empty diary', async () => {
    upstream({
      categories: () => Promise.resolve(categoriesResponse()),
      events: () => Promise.resolve(json({ success: false, error: { message: 'down' } }, 503))
    })

    const { container } = render(await QuizNightPage())

    expect(within(bookingCard(container)).getByText(outageTitle(GAME_NIGHTS['quiz-night']))).toBeInTheDocument()
    expect(screen.queryByText(emptyDiaryTitle(GAME_NIGHTS['quiz-night']))).not.toBeInTheDocument()
    expect(gameNightLogs()[0][2]).toMatchObject({ game: 'quiz-night', status: 'unavailable', failure: 'transient' })
  })
})

describe('when the page cannot find its own category', () => {
  it('treats the gap as an outage, and logs it so a renamed category is noticed', async () => {
    upstream({
      categories: () =>
        Promise.resolve(categoriesResponse(CATEGORIES.filter((category) => category.name !== 'Bingo Night'))),
      events: () => Promise.resolve(eventsResponse([]))
    })

    const { container } = render(await CashBingoPage())

    expect(within(bookingCard(container)).getByText(outageTitle(GAME_NIGHTS['cash-bingo']))).toBeInTheDocument()
    expect(gameNightLogs()[0][2]).toMatchObject({ game: 'cash-bingo', status: 'unavailable', failure: 'not-found' })
  })
})

describe('when only one of karaoke’s two categories answers', () => {
  it('books what loaded, and says the list may be incomplete', async () => {
    const liveCategory = categoryIdFor(karaoke.categories[0].name)
    upstream({
      categories: () => Promise.resolve(categoriesResponse()),
      events: (categoryId) =>
        categoryId === liveCategory
          ? Promise.resolve(eventsResponse([futureEvent('karaoke-1')]))
          : Promise.resolve(json({ success: false, error: { message: 'down' } }, 503))
    })

    const { container } = render(await KaraokePage())
    const card = bookingCard(container)

    expect(within(card).getByTestId('booking-form')).toHaveTextContent('Fixture night karaoke-1')
    expect(within(card).getByText(outageTitle(karaoke))).toBeInTheDocument()
    expect(gameNightLogs()[0][2]).toMatchObject({ game: 'karaoke', status: 'partial', eventsRendered: 1 })
  })
})

describe('when the diary really is empty', () => {
  it('still says no dates are on sale, and raises nothing', async () => {
    upstream({
      categories: () => Promise.resolve(categoriesResponse()),
      events: () => Promise.resolve(eventsResponse([]))
    })

    const { container } = render(await QuizNightPage())

    expect(within(bookingCard(container)).getByText(emptyDiaryTitle(GAME_NIGHTS['quiz-night']))).toBeInTheDocument()
    expect(screen.queryByText(outageTitle(GAME_NIGHTS['quiz-night']))).not.toBeInTheDocument()
    expect(gameNightLogs()).toEqual([])
  })
})

describe('when the diary loads', () => {
  it('offers the next date with no outage notice', async () => {
    upstream({
      categories: () => Promise.resolve(categoriesResponse()),
      events: () => Promise.resolve(eventsResponse([futureEvent('quiz-1')]))
    })

    const { container } = render(await QuizNightPage())

    expect(within(bookingCard(container)).getByTestId('booking-form')).toHaveTextContent('Fixture night quiz-1')
    expect(screen.queryByText(outageTitle(GAME_NIGHTS['quiz-night']))).not.toBeInTheDocument()
    expect(gameNightLogs()).toEqual([])
  })
})

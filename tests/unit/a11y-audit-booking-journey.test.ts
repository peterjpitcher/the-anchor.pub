/**
 * Review BK-222. The browser audit loaded /book-table and never pressed Find a
 * table, so the times, the details screen, its refusals and the event form
 * were never checked; and its only event page was a quiz night that had
 * already happened, so it showed "This event has ended" and no form.
 *
 * The browser half runs in CI (npm run audit:a11y). These tests pin the parts
 * that decide whether it can be trusted: it books nothing, it answers the
 * booking screens with fixtures, and it never checks a dated event page.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const audit = require('../../scripts/audit-a11y.js') as {
  PAGES: Array<[string, string, string?]>
  BOOKING_PAGE: string
  JOURNEY_EVENT_ID: string
  liveEventPage: () => Promise<[string, string] | null>
  mockBookingApis: (page: FakePage) => Promise<void>
}

type Handler = (route: FakeRoute) => unknown
type FakePage = { route: (pattern: string, handler: Handler) => Promise<void> }
type FakeRoute = {
  request: () => { method: () => string; url: () => string }
  fulfill: jest.Mock
  fallback: jest.Mock
  abort: jest.Mock
}

function fakeRoute(method: string, url: string): FakeRoute {
  return {
    request: () => ({ method: () => method, url: () => url }),
    fulfill: jest.fn(),
    fallback: jest.fn(),
    abort: jest.fn()
  }
}

async function registeredRoutes(): Promise<Array<[string, Handler]>> {
  const routes: Array<[string, Handler]> = []
  await audit.mockBookingApis({ route: async (pattern, handler) => { routes.push([pattern, handler]) } })
  return routes
}

const bodyOf = (route: FakeRoute) => JSON.parse(route.fulfill.mock.calls[0][0].body)

describe('the audit\'s page list', () => {
  it('holds no event page tied to a date that will pass', () => {
    const eventRows = audit.PAGES.filter(([pathname]) => pathname.startsWith('/events/'))
    expect(eventRows).toEqual([])
    expect(audit.PAGES.map(([pathname]) => pathname)).toContain(audit.BOOKING_PAGE)
  })
})

describe('the event detail template is found at run time', () => {
  const originalFetch = global.fetch
  afterEach(() => {
    global.fetch = originalFetch
  })

  it('checks the next event on sale', async () => {
    global.fetch = jest.fn(async () =>
      new Response(JSON.stringify({ success: true, data: { events: [{ id: 'a' }, { id: 'b', slug: 'quiz-night-next' }] } }))
    ) as unknown as typeof fetch

    await expect(audit.liveEventPage()).resolves.toEqual(['/events/quiz-night-next', expect.any(String)])
  })

  it('says nothing is on sale rather than failing when there is none, or the site does not answer', async () => {
    global.fetch = jest.fn(async () => new Response(JSON.stringify({ success: true, data: { events: [] } }))) as unknown as typeof fetch
    await expect(audit.liveEventPage()).resolves.toBeNull()

    global.fetch = jest.fn(async () => { throw new Error('offline') }) as unknown as typeof fetch
    await expect(audit.liveEventPage()).resolves.toBeNull()
  })
})

describe('the booking journey books nothing', () => {
  it('refuses every write to the site\'s API that it does not answer itself, and lets reads through', async () => {
    const [[pattern, catchAll]] = await registeredRoutes()
    expect(pattern).toBe('**/api/**')

    const write = fakeRoute('POST', 'http://localhost:3100/api/table-bookings')
    await catchAll(write)
    expect(write.abort).toHaveBeenCalled()
    expect(write.fulfill).not.toHaveBeenCalled()

    const read = fakeRoute('GET', 'http://localhost:3100/api/business-hours')
    await catchAll(read)
    expect(read.fallback).toHaveBeenCalled()
  })

  it('registers the catch-all first, so the fixtures registered after it win', async () => {
    const patterns = (await registeredRoutes()).map(([pattern]) => pattern)
    expect(patterns[0]).toBe('**/api/**')
    expect(patterns).not.toContain('**/api/table-bookings')
    expect(patterns).not.toContain('**/api/event-bookings')
  })

  it('answers the times for the date asked about, and the number check as a new guest', async () => {
    const routes = new Map(await registeredRoutes())

    const times = fakeRoute('GET', 'http://localhost:3100/api/table-bookings/availability?date=2026-11-04&party_size=2')
    await routes.get('**/api/table-bookings/availability**')!(times)
    expect(bodyOf(times).data).toMatchObject({ date: '2026-11-04', calculation_state: 'complete' })
    expect(bodyOf(times).data.time_slots.map((slot: { time: string }) => slot.time)).toContain('19:00')

    const lookup = fakeRoute('POST', 'http://localhost:3100/api/customers/lookup')
    await routes.get('**/api/customers/lookup')!(lookup)
    expect(bodyOf(lookup).data.known).toBe(false)
  })

  it('suggests a prepaid event with a question per ticket on that date, and opens the same one', async () => {
    const routes = new Map(await registeredRoutes())

    const listed = fakeRoute('GET', 'http://localhost:3100/api/events?from_date=2026-11-04&limit=36&available_only=true')
    await routes.get('**/api/events?**')!(listed)
    const [event] = bodyOf(listed).data.events
    expect(event).toMatchObject({ id: audit.JOURNEY_EVENT_ID, payment_mode: 'prepaid' })
    expect(event.startDate.startsWith('2026-11-04')).toBe(true)
    expect(event.booking_questions.length).toBeGreaterThan(0)

    const opened = fakeRoute('GET', `http://localhost:3100/api/events/${audit.JOURNEY_EVENT_ID}`)
    await routes.get(`**/api/events/${audit.JOURNEY_EVENT_ID}`)!(opened)
    expect(bodyOf(opened).data).toEqual(event)
  })

  it('leaves other event lists to the site, so the page around the form is real', async () => {
    const routes = new Map(await registeredRoutes())
    const panel = fakeRoute('GET', 'http://localhost:3100/api/events?limit=6')
    await routes.get('**/api/events?**')!(panel)
    expect(panel.fallback).toHaveBeenCalled()
  })
})

// A module, so its names do not collide with other script-style test files.
export {}

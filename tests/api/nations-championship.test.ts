jest.mock('@/lib/nations-championship/feed', () => ({ getNationsChampionshipFeed: jest.fn() }))
import { getNationsChampionshipFeed } from '@/lib/nations-championship/feed'
import { GET as feedGET } from '@/app/api/nations-championship/route'
import { GET as calendarGET } from '@/app/api/nations-championship/calendar/[fixtureId]/route'
import { nationsFeed } from '../fixtures/nations-championship'

const readFeed = getNationsChampionshipFeed as jest.Mock
// Jest's existing node-fetch polyfill predates the static web Response.json API.
const originalJson = Response.json
beforeAll(() => { Response.json = (body, init) => new Response(JSON.stringify(body), { ...init, headers: { 'content-type': 'application/json', ...init?.headers } }) })
afterAll(() => { Response.json = originalJson })
beforeEach(() => { jest.useFakeTimers(); jest.setSystemTime(new Date('2026-09-05T07:00:00Z')); readFeed.mockResolvedValue(nationsFeed()) })
afterEach(() => { jest.useRealTimers(); jest.clearAllMocks() })
it('serves the current curated feed with no caching', async () => {
  const response = await feedGET()
  expect(response.status).toBe(200)
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(await response.json()).toEqual(nationsFeed())
})
it('does not expose upstream errors or keys when the feed fails', async () => {
  readFeed.mockRejectedValue(new Error('secret-key'))
  const response = await feedGET()
  expect(response.status).toBe(503)
  expect(await response.text()).not.toContain('secret-key')
})
it('downloads a confirmed partial screening starting at opening', async () => {
  const response = await calendarGET(new Request('https://example.test'), { params: { fixtureId: nationsFeed().fixtures[0].id } })
  expect(response.status).toBe(200)
  expect(response.headers.get('content-type')).toContain('text/calendar')
  expect(await response.text()).toContain('DTSTART:20261107T120000Z')
})
it('rejects invalid, unknown and no-longer-confirmed calendar requests', async () => {
  const request = new Request('https://example.test')
  expect((await calendarGET(request, { params: { fixtureId: 'bad' } })).status).toBe(400)
  expect(readFeed).not.toHaveBeenCalled()
  const data = nationsFeed(); data.fixtures[0].screeningDecision = 'not_showing'; readFeed.mockResolvedValue(data)
  expect((await calendarGET(request, { params: { fixtureId: data.fixtures[0].id } })).status).toBe(404)
  expect((await calendarGET(request, { params: { fixtureId: '10000000-0000-4000-8000-000000000099' } })).status).toBe(404)
})

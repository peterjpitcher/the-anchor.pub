jest.mock('server-only', () => ({}), { virtual: true })
jest.mock('@/lib/nations-championship/feed', () => ({ getNationsChampionshipFeed: jest.fn() }))
jest.mock('@/lib/api', () => ({ anchorAPI: { getBusinessHours: jest.fn() } }))
jest.mock('@/lib/spam-protection', () => ({ checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false }) }))
jest.mock('@/lib/booking-conversion-forwarding', () => ({ forwardBookingConversionToCheersAI: jest.fn().mockResolvedValue(undefined) }))
import { POST } from '@/app/api/table-bookings/route'
import { getNationsChampionshipFeed } from '@/lib/nations-championship/feed'
import { anchorAPI } from '@/lib/api'
import { NextRequest } from 'next/server'
import { nationsFeed, nationsFixture, approvedNationsFixture } from '../fixtures/nations-championship'
const feed = getNationsChampionshipFeed as jest.Mock
const makeRequest = (fields = {}, key?: string) => ({ json: async () => ({ phone: '07700900123', date: '2026-11-07', time: '12:00', party_size: 2, purpose: 'food', fixture_id: nationsFixture().id, notes: 'Near the screen', ...fields }), headers: new Headers(key ? { 'Idempotency-Key': key } : {}) }) as NextRequest
beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date('2026-09-05T07:00:00Z'))
  process.env.ANCHOR_API_KEY = 'test-key'
  feed.mockReset().mockResolvedValue(nationsFeed())
  ;(anchorAPI.getBusinessHours as jest.Mock).mockResolvedValue({ regularHours: { saturday: { is_closed: false, opens: '12:00', closes: '23:00', kitchen: { opens: '12:00', closes: '21:00' } } }, specialHours: [] })
  global.fetch = jest.fn().mockImplementation(async (_url, init) => init.headers['X-Idempotency-Replay-Only'] ? new Response(JSON.stringify({ error: { code: 'IDEMPOTENCY_KEY_NOT_FOUND' } }), { status: 404 }) : new Response(JSON.stringify({ success: true, data: { state: 'confirmed', booking_reference: 'TEST' } }), { status: 200 }))
  if (!Response.json) Response.json = (body: unknown, init?: ResponseInit) => new Response(JSON.stringify(body), init)
})
afterEach(() => { jest.useRealTimers(); jest.clearAllMocks(); delete process.env.ANCHOR_API_KEY })
it('forwards trusted match notes and returns the verified fixture ID', async () => {
  const response = await POST(makeRequest({ fixture_label: 'Forged match' }))
  expect(response.status).toBe(200)
  const probe = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
  expect(probe.phone).toBeUndefined()
  expect(probe.replay_request).toMatchObject({ fixture_id: nationsFixture().id, notes: `Nations Championship: [${nationsFixture().id}]\nNear the screen` })
  expect(JSON.parse((global.fetch as jest.Mock).mock.calls[1][1].body)).toMatchObject({ notes: `Nations Championship: Italy v South Africa [${nationsFixture().id}]\nNear the screen` })
  expect(await response.json()).toMatchObject({ data: { fixture_id: nationsFixture().id } })
})
it.each([{ date: '2026-11-08' }, { time: '11:40' }, { time: '13:40' }, { notes: 'x'.repeat(500) }])('rejects incompatible fixture booking %p before writes', async fields => {
  expect((await POST(makeRequest(fields))).status).toBe(400)
  expect((global.fetch as jest.Mock).mock.calls.every(call => call[1].headers['X-Idempotency-Replay-Only'] === 'true')).toBe(true)
})
it('blocks cancelled games and outages without a booking write', async () => {
  feed.mockResolvedValue(nationsFeed([nationsFixture({ matchState: 'cancelled' })]))
  expect((await POST(makeRequest())).status).toBe(409)
  feed.mockRejectedValue(new Error('unavailable'))
  expect((await POST(makeRequest())).status).toBe(503)
  expect((global.fetch as jest.Mock).mock.calls.every(call => call[1].headers['X-Idempotency-Replay-Only'] === 'true')).toBe(true)
})
it('retains context and idempotency key for a pending deposit', async () => {
  ;(global.fetch as jest.Mock).mockImplementation(async () => new Response(JSON.stringify({ success: true, data: { state: 'pending_payment', booking_id: 'test-booking' } }), { status: 200 }))
  for (let i = 0; i < 2; i++) {
    const response = await POST(makeRequest({}, 'same-intent'))
    expect(await response.json()).toMatchObject({ data: { fixture_id: nationsFixture().id, state: 'pending_payment' } })
  }
  expect((global.fetch as jest.Mock).mock.calls.map(call => call[1].headers['Idempotency-Key'])).toEqual(['same-intent', 'same-intent'])
})

it.each(['confirmed', 'pending_payment'])('recovers %s after cancellation without reading mutable screening or creating', async state => {
  feed.mockResolvedValue(nationsFeed([nationsFixture({ matchState: 'cancelled' })]))
  ;(global.fetch as jest.Mock).mockImplementation(async () => new Response(JSON.stringify({ success: true, data: { state, booking_reference: 'ORIGINAL', booking_id: 'original' } }), { status: 201 }))
  const response = await POST(makeRequest({}, 'original-intent'))
  expect(response.status).toBe(201)
  expect(await response.json()).toMatchObject({ data: { state, fixture_id: nationsFixture().id } })
  expect(feed).not.toHaveBeenCalled()
  expect((global.fetch as jest.Mock).mock.calls).toHaveLength(1)
  expect((global.fetch as jest.Mock).mock.calls[0][1].headers).toMatchObject({ 'Idempotency-Key': 'original-intent', 'X-Idempotency-Replay-Only': 'true' })
})
it('recovery-only NOT_FOUND never creates even when screening is eligible', async () => {
  const request = makeRequest({}, 'original-intent')
  request.headers.set('X-Booking-Replay-Only', 'true')
  expect((await POST(request)).status).toBe(404)
  expect(feed).not.toHaveBeenCalled()
  expect(global.fetch).toHaveBeenCalledTimes(1)
})
it('ignores refreshed labels in stable replay payload and fallback key', async () => {
  await POST(makeRequest())
  feed.mockResolvedValue(nationsFeed([nationsFixture({ teamA: 'Replacement' })]))
  await POST(makeRequest())
  const probes = (global.fetch as jest.Mock).mock.calls.filter(call => call[1].headers['X-Idempotency-Replay-Only'])
  expect(probes[0][1].body).toBe(probes[1][1].body)
  expect(probes[0][1].headers['Idempotency-Key']).toBe(probes[1][1].headers['Idempotency-Key'])
})

it.each([false, true])('forwards an owner-approved booking without exact channel or finish time, late: %s', late => {
  feed.mockResolvedValue(nationsFeed([approvedNationsFixture(late)]))
  return POST(makeRequest({ time: late ? '20:00' : '12:00', purpose: 'drinks' })).then(async response => {
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ data: { fixture_id: nationsFixture().id } })
    expect(JSON.parse((global.fetch as jest.Mock).mock.calls[1][1].body)).toMatchObject({ time: late ? '20:00' : '12:00', purpose: 'drinks' })
  })
})
it('rejects closing-time arrival for owner-approved late game before a write', async () => {
  feed.mockResolvedValue(nationsFeed([approvedNationsFixture(true)]))
  expect((await POST(makeRequest({ time: '22:00', purpose: 'drinks' }))).status).toBe(400)
  expect((global.fetch as jest.Mock).mock.calls.every(call => call[1].headers['X-Idempotency-Replay-Only'] === 'true')).toBe(true)
})

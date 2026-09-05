#!/usr/bin/env node
// Local-only browser fixture server. Every outbound fetch is intercepted before
// Next starts. It never delegates to native fetch, including unknown URLs.
const http = require('node:http')
const { nationsFeed, approvedNationsFixture } = require('../tests/fixtures/nations-championship.ts')
const requests = []
const outcomes = new Map()
let feedUnavailable = false
const lateTest = process.env.NATIONS_LATE_TEST === 'true'
const feed = nationsFeed(lateTest ? [approvedNationsFixture(true)] : process.env.NATIONS_APPROVED_TEST === 'true' ? [approvedNationsFixture()] : undefined)
if (lateTest) {
  feed.fixtures[0].screening.foodPromotion.kind = 'before_match'
  feed.fixtures[0].screening.foodPromotion.overlapWindows = []
  feed.fixtures[0].screening.foodPromotion.message = 'Food served noon to 7pm. Eat before the game.'
  feed.fixtures[0].screening.lateFinishPolicy = 'stay_open_if_viewers'
  feed.fixtures[0].screening.openingLabel = 'Usual pub hours: noon to 10pm. If people are still here watching, we will stay open until the game finishes. Please arrive before our usual closing time.'
}
const initialScreeningDecision = feed.fixtures[0].screeningDecision
const hours = {
  regularHours: Object.fromEntries(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => [day, { opens: '12:00', closes: '22:00', is_closed: false, kitchen: { opens: '12:00', closes: '19:00' } }])),
  specialHours: [], currentStatus: { isOpen: false, kitchenOpen: false }, timezone: 'Europe/London',
}
const json = (data, status = 200) => Response.json(data, { status })
const wrapped = data => json({ success: true, data })
// Explicit dummy values prevent the local .env from supplying live credentials.
Object.assign(process.env, {
  ANCHOR_API_BASE_URL: 'https://management.example.invalid/api', ANCHOR_API_KEY: 'isolated-test',
  CHEERSAI_BASE_URL: 'https://cheers.example.invalid', CHEERSAI_NATIONS_FEED_API_KEY: 'isolated-test',
  TURNSTILE_SECRET_KEY: 'isolated-test', NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'isolated-test',
  NEXT_PUBLIC_GTM_ID: '', NEXT_PUBLIC_CLARITY_PROJECT_ID: '', NEXT_TELEMETRY_DISABLED: '1',
})
global.fetch = async (input, init = {}) => {
  const raw = typeof input === 'string' ? input : input.url || String(input)
  const url = new URL(raw)
  const method = (init.method || input.method || 'GET').toUpperCase()
  if (url.hostname === 'challenges.cloudflare.com' && url.pathname.endsWith('/siteverify')) return json({ success: true })
  if (url.hostname === 'cheers.example.invalid' && url.pathname.includes('/api/feed/')) return feedUnavailable ? json({ error: 'test outage' }, 503) : json(feed)
  if (url.hostname !== 'management.example.invalid') return json({ error: 'External request blocked by local test guard' }, 503)
  if (url.pathname === '/api/business/hours') return wrapped(hours)
  if (url.pathname === '/api/website/ui-flags') return wrapped({ booking_options_step1: true })
  if (url.pathname === '/api/table-bookings/load') {
    const slots = ['12:00', '12:30', '13:00', '13:30', '14:00', '18:00'].map(time => ({ time, state: 'available', high_chairs_remaining: 4, public_reason: null, message: null }))
    return wrapped({ date: url.searchParams.get('date'), window_minutes: 30, busy_threshold_covers: 30, filling_threshold_covers: 15, bookings: [], table_availability: { calculation_state: 'complete', slots } })
  }
  if (url.pathname === '/api/customers/lookup') return wrapped({ known: false })
  if (url.pathname === '/api/table-bookings' && method === 'POST') {
    const headers = new Headers(init.headers)
    const key = headers.get('Idempotency-Key')
    const payload = JSON.parse(String(init.body))
    if (headers.get('X-Idempotency-Replay-Only') === 'true') {
      if (!payload.replay_request || payload.phone) return json({ error: { code: 'UNSAFE_REPLAY_SHAPE' } }, 400)
      return outcomes.has(key) ? json(outcomes.get(key)) : json({ error: { code: 'IDEMPOTENCY_KEY_NOT_FOUND' } }, 404)
    }
    requests.push(payload)
    const result = { success: true, data: { state: 'confirmed', table_booking_id: `test-booking-${requests.length}`, booking_reference: 'ISOLATED-TEST-1', table_name: 'Test table', next_step_url: null, hold_expires_at: null } }
    outcomes.set(key, result)
    return json(result, 201)
  }
  if (url.pathname === '/api/events') return wrapped({ events: [] })
  return json({ error: 'Unconfigured local fixture response' }, 503)
}
// Also prevent libraries bypassing fetch from opening an external socket.
const net = require('node:net')
const nativeConnect = net.Socket.prototype.connect
net.Socket.prototype.connect = function (...args) {
  const value = args[0]
  const host = typeof value === 'object' ? value.host : typeof args[1] === 'string' ? args[1] : undefined
  if (host && !['localhost', '127.0.0.1', '::1'].includes(host)) throw new Error('External socket blocked by local test guard')
  return nativeConnect.apply(this, args)
}
const next = require('next')
const app = next({ dev: true, dir: process.cwd() })
app.prepare().then(() => {
  const handle = app.getRequestHandler()
  const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/__nations_test')) {
      const url = new URL(req.url, 'http://127.0.0.1')
      if (url.searchParams.has('outage')) feedUnavailable = url.searchParams.get('outage') === 'true'
      if (url.searchParams.has('cancel')) feed.fixtures[0].screeningDecision = url.searchParams.get('cancel') === 'true' ? 'not_showing' : initialScreeningDecision
      res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ requests, feedUnavailable })); return
    }
    await handle(req, res)
  })
  server.listen(3137, '127.0.0.1', () => console.log('Isolated Nations smoke server ready on port 3137'))
}).catch(error => { console.error(error); process.exitCode = 1 })

#!/usr/bin/env node
// Local-only browser fixture server. Every outbound fetch is intercepted before
// Next starts. It never delegates to native fetch, including unknown URLs.
const http = require('node:http')
const requests = []
const outcomes = new Map()
let rejectEnquiry = false
let bookingMode = 'normal'
const tableRequests = []
const eventRequests = []
const tableOutcomes = new Map()
const config = {
  spaces: [{ id: 'fixture-space', name: 'The Dining Room', capacity_seated: 26, capacity_standing: 50, rate_per_hour: 10, minimum_hours: 1, setup_fee: 0 }],
  packages: [{ id: 'fixture-catering', name: 'Synthetic catering', cost_per_head: 1, minimum_guests: 1 }], vendors: [],
}
const hours = {
  regularHours: Object.fromEntries(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => [day, { opens: '12:00', closes: '22:00', is_closed: false, kitchen: { opens: '12:00', closes: '19:00' } }])),
  specialHours: [], currentStatus: { isOpen: false, kitchenOpen: false }, timezone: 'Europe/London',
}
const json = (data, status = 200) => Response.json(data, { status })
const wrapped = data => json({ success: true, data })
// Explicit dummy values prevent the local .env from supplying live credentials.
Object.assign(process.env, {
  NODE_ENV: 'development',
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
  if (url.hostname !== 'management.example.invalid') return json({ error: 'External request blocked by local test guard' }, 503)
  if (url.pathname === '/api/business/hours') {
    if (bookingMode === 'unavailable') return json({ error: 'Isolated hours outage' }, 503)
    const resolved = structuredClone(hours)
    resolved.regularHours.sunday.kitchen = { opens: '13:00', closes: '18:00' }
    if (bookingMode === 'closed-monday') {
      resolved.regularHours.monday.kitchen = null
      resolved.regularHours.monday.is_kitchen_closed = true
    }
    return wrapped(resolved)
  }
  if (url.pathname === '/api/table-bookings/periods') return wrapped({ periods: [] })
  if (url.pathname === '/api/table-bookings/load') {
    if (bookingMode === 'unavailable') return json({ error: 'Isolated availability outage' }, 503)
    let slots = ['12:00', '12:30', '13:00', '13:30', '14:00', '17:00', '17:30', '18:00'].map(time => ({
      time, state: bookingMode === 'sold-out' ? 'unavailable' : 'available',
      high_chairs_remaining: 4, public_reason: bookingMode === 'sold-out' ? 'fully_booked' : null,
      message: bookingMode === 'sold-out' ? 'No tables available at this time' : null,
    }))
    if (url.searchParams.get('purpose') === 'food') {
      const date = url.searchParams.get('date')
      if (date === '2026-10-11') slots = slots.filter(slot => slot.time >= '13:00' && slot.time < '18:00')
      if (bookingMode === 'closed-monday' && date === '2026-10-05') slots = []
    }
    return wrapped({ date: url.searchParams.get('date'), window_minutes: 30, busy_threshold_covers: 30, filling_threshold_covers: 15, bookings: [], table_availability: { calculation_state: 'complete', slots } })
  }
  if (url.pathname === '/api/table-bookings' && method === 'POST') {
    const headers = new Headers(init.headers)
    const key = headers.get('Idempotency-Key')
    const payload = JSON.parse(String(init.body))
    if (headers.get('X-Idempotency-Replay-Only') === 'true') {
      if (!payload.replay_request || payload.phone) return json({ error: { code: 'UNSAFE_REPLAY_SHAPE' } }, 400)
      return tableOutcomes.has(key) ? json(tableOutcomes.get(key)) : json({ error: { code: 'IDEMPOTENCY_KEY_NOT_FOUND' } }, 404)
    }
    tableRequests.push({ key, payload })
    if (tableOutcomes.has(key)) return json(tableOutcomes.get(key))
    const result = { success: true, data: { state: 'confirmed', table_booking_id: `isolated-table-${tableOutcomes.size + 1}`, booking_reference: 'ISOLATED-TABLE-1', table_name: 'Test table', next_step_url: null, hold_expires_at: null } }
    tableOutcomes.set(key, result)
    return json(result, 201)
  }
  if (url.pathname === '/api/event-bookings' && method === 'POST') {
    const payload=JSON.parse(String(init.body));eventRequests.push(payload)
    return json({success:true,data:{state:'confirmed',booking_id:'isolated-event-1',requests_recorded:Boolean(payload.dining_request||payload.early_arrival_request)}},201)
  }
  if (url.pathname === '/api/website/ui-flags') return wrapped({ flags: { booking_options_step1: process.env.BOOKING_GROWTH_TWO_SCREEN === 'true' } })
  if (url.pathname === '/api/public/private-booking/config') return wrapped(config)
  if (url.pathname === '/api/customers/lookup') return wrapped({ known: false })
  if (url.pathname === '/api/private-booking-enquiry' && method === 'POST') {
    const key = new Headers(init.headers).get('Idempotency-Key')
    const payload = JSON.parse(String(init.body))
    requests.push({ key, payload, rejected: rejectEnquiry })
    if (rejectEnquiry) return json({ success: false, error: 'Isolated test rejection. Please retry.' }, 400)
    if (outcomes.has(key)) return json(outcomes.get(key))
    const result = { booking_id: `isolated-${outcomes.size + 1}`, reference: 'ISOLATED-ONLY', state: 'enquiry_created' }
    outcomes.set(key, result)
    return json(result, 201)
  }
  const fixtureEvents = ['open','past','cancelled','sold-out'].map(state => ({
    '@type': 'Event', id: `fixture-${state}`, slug: `fixture-${state}`, name: `Isolated ${state} event`,
    description: 'Synthetic browser verification event.', startDate: state === 'past' ? '2025-01-01T19:00:00Z' : '2026-10-15T19:00:00Z',
    endDate: state === 'past' ? '2025-01-01T21:00:00Z' : '2026-10-15T21:00:00Z',
    eventStatus: state === 'cancelled' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
    event_status: state === 'cancelled' ? 'cancelled' : state === 'sold-out' ? 'sold_out' : 'scheduled',
    booking_mode: 'general', bookings_enabled: true, payment_mode: 'free', isAccessibleForFree: true,
    seats_remaining: state === 'sold-out' ? 0 : 30, total_remaining: state === 'sold-out' ? 0 : 30,
    location: { '@type': 'Place', name: 'Synthetic location', address: 'Fixture address' },
  }))
  if (url.pathname === '/api/events') return wrapped({ events: fixtureEvents })
  if (url.pathname.startsWith('/api/events/fixture-')) {
    const event = fixtureEvents.find(event => url.pathname === `/api/events/${event.slug}`)
    if (event) return wrapped(event)
  }
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
// Next's custom server discards the conf option. Use an isolated root with its
// own config instead, so browser compilation cannot corrupt a production build.
const fs = require('node:fs')
const path = require('node:path')
const fixtureDir = fs.mkdtempSync('/tmp/anchor-growth-fixture-')
for (const entry of fs.readdirSync(process.cwd())) {
  if (entry.startsWith('.next') || entry.startsWith('.env') || entry === '.git' || entry === 'next.config.js') continue
  if (entry === 'app') fs.cpSync(path.join(process.cwd(),entry), path.join(fixtureDir,entry), {recursive:true})
  else if (['tsconfig.json','next-env.d.ts','package.json'].includes(entry)) fs.copyFileSync(path.join(process.cwd(), entry), path.join(fixtureDir, entry))
  else fs.symlinkSync(path.join(process.cwd(), entry), path.join(fixtureDir, entry))
}
fs.writeFileSync(path.join(fixtureDir,'next.config.js'), `module.exports={...require(${JSON.stringify(path.join(process.cwd(),'next.config.js'))}),distDir:'.next-smoke'}`)
console.log('Isolated fixture root: ' + fixtureDir)
const app = next({ dev: true, dir: fixtureDir })
app.prepare().then(() => {
  const handle = app.getRequestHandler()
  const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/__private_hire_test') || req.url.startsWith('/__booking_growth_test')) {
      const url = new URL(req.url, 'http://127.0.0.1')
      if (url.searchParams.has('reject')) rejectEnquiry = url.searchParams.get('reject') === 'true'
      const mode = url.searchParams.get('mode')
      if (['normal', 'closed-monday', 'sold-out', 'unavailable'].includes(mode)) bookingMode = mode
      res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ requests, uniqueRecords: outcomes.size, bookingMode, tableRequests, eventRequests, uniqueTableRecords: tableOutcomes.size })); return
    }
    await handle(req, res)
  })
  server.listen(3138, '127.0.0.1', () => console.log('Isolated private hire smoke server ready on port 3138'))
}).catch(error => { console.error(error); process.exitCode = 1 })

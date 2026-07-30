// =============================================================================
// Availability contract test (review F03 / plan T8), website side.
//
// The mirror of the AMS test at
// src/app/api/table-bookings/__tests__/table-availability-contract.test.ts.
// Both pin the same fixture file, which must stay byte-identical in the two
// repos: AMS pins what it produces, this pins what the website tolerates and
// how it translates it for the browser.
//
// GET /api/table-bookings/load returns TWO slot collections:
//
// Collection 1: `data.slots` (kitchen pacing). PACING ONLY. It knows nothing
//   about tables, so `remaining > 0` must never on its own be treated as
//   bookable. This route uses it for busyness labels and high-chair advice.
//
// Collection 2: `data.table_availability` (authoritative). Per slot exactly:
//   time, state, public_reason, message, high_chairs_remaining.
//     state          'available' | 'unavailable'
//     public_reason  null when available, else tables_full | kitchen_full |
//                    outside_full | closed | too_late | too_large | unknown
//   Top level: calculation_state 'complete' | 'unknown'. On 'unknown' NOTHING
//   may be treated as bookable. The route-level unknown fallback has no
//   `message`, so the website supplies its own copy.
//   purpose, outside, requires_accessible_table, max_party_size_online and
//   duration_minutes are informational echoes: absence must be tolerated.
// =============================================================================

import contract from '../fixtures/table-availability-contract.json'

const mockGetBusinessHours = jest.fn()
const mockGetTableBookingLoadSafe = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args),
    getTableBookingLoadSafe: (...args: unknown[]) => mockGetTableBookingLoadSafe(...args)
  }
}))

// The fixture's table_availability covers 18:00 to 18:45 on 2026-08-07, a
// Friday. Open wide enough that the local grid contains those times.
const FRIDAY_HOURS = {
  regularHours: {
    friday: {
      opens: '12:00:00',
      closes: '23:00:00',
      is_closed: false,
      kitchen: { opens: '12:00:00', closes: '21:00:00' },
      schedule_config: []
    }
  },
  specialHours: []
} as any

type WireSlot = {
  time: string
  available?: boolean
  available_capacity: number
  unavailable_reason?: string | null
  unavailable_message?: string | null
  high_chairs_remaining?: number
}

describe('availability contract (website side)', () => {
  let getAvailability: (request: Request) => Promise<Response>

  beforeEach(async () => {
    mockGetBusinessHours.mockResolvedValue(FRIDAY_HOURS)
    jest.resetModules()
    ;({ GET: getAvailability } = await import('@/app/api/table-bookings/availability/route'))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  async function fetchWith(load: unknown, query = 'date=2026-08-07&party_size=4') {
    mockGetTableBookingLoadSafe.mockResolvedValue(load)
    const response = await getAvailability(
      new Request(`https://www.the-anchor.pub/api/table-bookings/availability?${query}`)
    )
    expect(response.status).toBe(200)
    return response.json()
  }

  // Build a load response around a given table_availability, reusing the
  // fixture's pacing slots so both collections come from the same capture.
  function loadWith(tableAvailability: unknown) {
    return {
      date: contract.scenario.date,
      window_minutes: 60,
      busy_threshold_covers: 30,
      filling_threshold_covers: 20,
      bookings: [],
      slots: contract.slots,
      table_availability: tableAvailability
    }
  }

  describe('the fixture itself stays inside the documented shape', () => {
    it('pins the per-slot keys, states and public reasons', () => {
      const availability = contract.table_availability

      expect(availability.contract_version).toBe(1)
      expect(availability.calculation_state).toBe('complete')
      expect(availability.slots.length).toBeGreaterThan(0)

      for (const slot of availability.slots) {
        // Exactly the keys AMS builds. Additions must be a deliberate contract
        // change in both repos, not drift.
        expect(Object.keys(slot).sort()).toEqual([
          'high_chairs_remaining',
          'message',
          'public_reason',
          'state',
          'time'
        ])
        expect(slot.time).toMatch(/^\d{2}:\d{2}$/)
        expect(['available', 'unavailable']).toContain(slot.state)
        expect(typeof slot.high_chairs_remaining).toBe('number')

        if (slot.state === 'available') {
          expect(slot.public_reason).toBeNull()
          expect(slot.message).toBeNull()
        } else {
          expect([
            'tables_full',
            'kitchen_full',
            'outside_full',
            'closed',
            'too_late',
            'too_large',
            'unknown'
          ]).toContain(slot.public_reason)
          expect(typeof slot.message).toBe('string')
        }
      }
    })

    it('pins the unknown fallback, which carries no message', () => {
      const unknown = contract.table_availability_unknown

      expect(unknown.calculation_state).toBe('unknown')
      expect(unknown.slots).toEqual([])
      expect(unknown.public_reason).toBe('unknown')
      expect('message' in unknown).toBe(false)
    })
  })

  describe('the website parses the authoritative read-out', () => {
    it('marks available slots bookable and unavailable slots not, carrying the reason through', async () => {
      const body = await fetchWith(loadWith(contract.table_availability))
      const slots = body.data.time_slots as WireSlot[]

      const at = (time: string) => slots.find((slot) => slot.time === time)

      expect(body.data.calculation_state).toBe('complete')
      expect(at('18:00')?.available).toBe(true)

      // Unavailable slots must be unselectable BOTH ways: the form filters on
      // available and on available_capacity, so the two have to agree.
      expect(at('18:30')?.available).toBe(false)
      expect(at('18:30')?.available_capacity).toBe(0)
      expect(at('18:30')?.unavailable_reason).toBe('tables_full')

      // Advisory high chairs are surfaced per slot.
      expect(at('18:00')?.high_chairs_remaining).toBe(1)
    })

    it('does not invent slots for AMS times the website grid does not render', async () => {
      // AMS answers on a 15-minute grid; the website renders 30-minute slots.
      // The quarter-past and quarter-to entries (18:15 kitchen_full, 18:45
      // available) simply have no counterpart to overlay, and the website must
      // not manufacture one.
      const body = await fetchWith(loadWith(contract.table_availability))
      const slots = body.data.time_slots as WireSlot[]

      expect(contract.table_availability.slots.map((slot) => slot.time)).toEqual(
        expect.arrayContaining(['18:15', '18:45'])
      )
      expect(slots.find((slot) => slot.time === '18:15')).toBeUndefined()
      expect(slots.find((slot) => slot.time === '18:45')).toBeUndefined()
    })

    it('a website slot the picker did not speak about is not bookable', async () => {
      // The last remnant of the fail-open: the local schedule grid runs to
      // 23:00, the picker answered only for 18:00 to 18:45. Those unanswered
      // times must not stay bookable on local maths, which knows nothing about
      // tables.
      const body = await fetchWith(loadWith(contract.table_availability))
      const slots = body.data.time_slots as WireSlot[]

      const unanswered = slots.find((slot) => slot.time === '20:00')
      expect(unanswered).toBeDefined()
      expect(unanswered?.available).toBe(false)
      expect(unanswered?.available_capacity).toBe(0)
      expect(unanswered?.unavailable_reason).toBe('unknown')

      // Only the times the picker marked available survive as bookable.
      const bookable = slots.filter((slot) => slot.available === true).map((slot) => slot.time)
      expect(bookable).toEqual(['18:00'])
    })

    it('echoes max_party_size_online when supplied', async () => {
      const body = await fetchWith(loadWith(contract.table_availability))
      expect(body.data.max_party_size_online).toBe(20)
    })

    it('tolerates every informational echo being absent', async () => {
      const stripped = { ...contract.table_availability } as Record<string, unknown>
      for (const key of [
        'purpose',
        'outside',
        'requires_accessible_table',
        'max_party_size_online',
        'duration_minutes',
        'contract_version',
        'date',
        'party_size'
      ]) {
        delete stripped[key]
      }

      const body = await fetchWith(loadWith(stripped))
      const slots = body.data.time_slots as WireSlot[]

      expect(body.data.calculation_state).toBe('complete')
      expect(slots.find((slot) => slot.time === '18:00')?.available).toBe(true)
      expect(slots.find((slot) => slot.time === '18:30')?.available).toBe(false)
    })

    it('treats the unknown fallback as nothing bookable, not as an empty day', async () => {
      const body = await fetchWith(loadWith(contract.table_availability_unknown))

      expect(body.data.calculation_state).toBe('unknown')
      expect(body.data.time_slots).toEqual([])
      expect(body.data.available).toBe(false)
      // The fallback has no message of its own, so the website supplies copy
      // that sends the guest to the phone.
      expect(body.data.message).toContain('01753 682707')
    })
  })

  describe('pacing slots are never bookability on their own', () => {
    it('a load with pacing slots but no table read-out is unknown, not available', async () => {
      // data.slots says remaining > 0 for every slot in the fixture. Without
      // the authoritative collection that means nothing: it knows about covers,
      // not tables.
      const load = loadWith(undefined)
      delete (load as Record<string, unknown>).table_availability

      const body = await fetchWith(load)

      expect(body.data.calculation_state).toBe('unknown')
      expect(body.data.time_slots).toEqual([])
      expect(contract.slots.every((slot) => slot.remaining > 0)).toBe(true)
    })
  })

  describe('complete with zero slots', () => {
    it('means nothing is bookable that day, not "fall back to the local grid"', async () => {
      // The decision for the edge the T2 work surfaced: a COMPLETE calculation
      // that returns no slots is an answer, so the local schedule grid must
      // never be served in its place. Only `unknown` earns the retry message.
      const body = await fetchWith(
        loadWith({ ...contract.table_availability, slots: [] })
      )

      expect(body.data.calculation_state).toBe('complete')
      expect(body.data.time_slots).toEqual([])
      expect(body.data.available).toBe(false)
    })

    it('carries the public reason and message for an above-the-limit party', async () => {
      const body = await fetchWith(
        loadWith({
          contract_version: 1,
          calculation_state: 'complete',
          date: '2026-08-07',
          party_size: 30,
          slots: [],
          public_reason: 'too_large',
          message: 'For parties that size, please give us a ring on 01753 682707.',
          max_party_size_online: 20
        }),
        'date=2026-08-07&party_size=30'
      )

      expect(body.data.time_slots).toEqual([])
      expect(body.data.public_reason).toBe('too_large')
      expect(body.data.message).toContain('01753 682707')
      expect(body.data.max_party_size_online).toBe(20)
    })
  })
})

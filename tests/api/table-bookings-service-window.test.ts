export {}

const mockGetBusinessHours = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args)
  }
}))

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false })
}))

const SUNDAY_HOURS = {
  regularHours: {
    sunday: {
      opens: '12:00',
      closes: '23:00',
      is_closed: false,
      kitchen: {
        opens: '12:00',
        closes: '21:00'
      }
    }
  },
  specialHours: []
} as any

describe('Table Bookings API - Service Window Enforcement', () => {
  let createTableBooking: (request: any) => Promise<Response>

  beforeEach(async () => {
    process.env.ANCHOR_API_KEY = 'test-api-key'
    mockGetBusinessHours.mockResolvedValue(SUNDAY_HOURS)
    ;(global as any).fetch = jest.fn()

    // Polyfill the static Response.json helper that NextResponse.json relies on
    // (Jest's node-fetch Response doesn't include it).
    if (typeof (Response as any).json !== 'function') {
      ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
        new Response(JSON.stringify(body), {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {})
          }
        })
    }

    jest.resetModules()
    ;({ POST: createTableBooking } = await import('@/app/api/table-bookings/route'))
  })

  afterEach(() => {
    delete process.env.ANCHOR_API_KEY
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('rejects food bookings outside kitchen hours', async () => {
    const request = {
      json: async () => ({
        phone: '07700900000',
        date: '2026-03-01',
        time: '21:30',
        party_size: 2,
        purpose: 'food'
      }),
      headers: new Headers()
    } as any

    const response = await createTableBooking(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(String(data.error)).toContain('Food bookings')
    expect((global.fetch as jest.Mock)).not.toHaveBeenCalled()
  })

  it('allows drinks bookings in late bar-only slots', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            state: 'confirmed',
            booking_reference: 'TB-TEST'
          }
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    )

    const request = {
      json: async () => ({
        phone: '07700900000',
        date: '2026-03-01',
        time: '21:30',
        party_size: 2,
        purpose: 'drinks'
      }),
      headers: new Headers()
    } as any

    const response = await createTableBooking(request)

    expect(response.status).toBe(201)
    expect(global.fetch).toHaveBeenCalledTimes(1)

    const [, upstreamOptions] = (global.fetch as jest.Mock).mock.calls[0]
    const upstreamPayload = JSON.parse(String((upstreamOptions as RequestInit).body))
    expect(upstreamPayload.purpose).toBe('drinks')
  })
})

// ---------------------------------------------------------------------------
// Combined service-range helpers — drinks-window master + kitchen overlay.
// These exports back the single-grid /book-table wizard refactor.
// ---------------------------------------------------------------------------

type RegularDayInput = {
  opens?: string
  closes?: string
  is_closed?: boolean
  kitchen?: { opens?: string; closes?: string; is_closed?: boolean } | null
  schedule_config?: Array<{ starts_at: string; ends_at: string; capacity?: number; booking_type: string }>
}

type SpecialDayInput = {
  date: string
  opens?: string | null
  closes?: string | null
  is_closed?: boolean
  status?: 'closed' | 'modified'
  kitchen?: { opens?: string; closes?: string; is_closed?: boolean } | null
  is_kitchen_closed?: boolean
  schedule_config?: Array<{ starts_at: string; ends_at: string; capacity?: number; booking_type: string }>
}

function makeBusinessHours(
  regularDays: Partial<Record<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday', RegularDayInput>>,
  specialDays: SpecialDayInput[] = []
): any {
  const regularHours: Record<string, any> = {}
  for (const [day, config] of Object.entries(regularDays)) {
    if (!config) continue
    regularHours[day] = {
      opens: config.opens ?? '12:00',
      closes: config.closes ?? '23:00',
      is_closed: config.is_closed ?? false,
      kitchen: config.kitchen === undefined ? null : config.kitchen,
      schedule_config: config.schedule_config ?? []
    }
  }
  return {
    regularHours,
    specialHours: specialDays.map((entry) => ({
      ...entry,
      is_closed: entry.is_closed ?? false
    }))
  }
}

describe('resolveCombinedServiceRanges', () => {
  it('returns drinks-window ranges as master and food-window ranges as kitchen overlay on a normal day', async () => {
    const { resolveCombinedServiceRanges, toMinutes } = await import('@/lib/table-booking-service-windows')
    const businessHours = makeBusinessHours({
      tuesday: {
        opens: '12:00:00',
        closes: '23:00:00',
        kitchen: { opens: '12:00:00', closes: '21:00:00' }
      }
    })
    const result = resolveCombinedServiceRanges(businessHours, '2026-05-05')
    expect(result.closed).toBe(false)
    expect(result.ranges.length).toBeGreaterThan(0)
    expect(result.kitchenRanges.length).toBeGreaterThan(0)
    // Kitchen overlay must close no later than the master drinks window.
    const masterEnd = Math.max(...result.ranges.map((r) => toMinutes(r.endsAt)))
    const kitchenEnd = Math.max(...result.kitchenRanges.map((r) => toMinutes(r.endsAt)))
    expect(kitchenEnd).toBeLessThanOrEqual(masterEnd)
  })

  it('returns empty kitchen ranges when the regular kitchen is closed (Monday)', async () => {
    const { resolveCombinedServiceRanges } = await import('@/lib/table-booking-service-windows')
    const businessHours = makeBusinessHours({
      monday: {
        opens: '16:00:00',
        closes: '23:00:00',
        kitchen: { is_closed: true }
      }
    })
    const result = resolveCombinedServiceRanges(businessHours, '2026-05-04')
    expect(result.closed).toBe(false)
    expect(result.ranges.length).toBeGreaterThan(0)
    expect(result.kitchenRanges).toHaveLength(0)
  })

  it('treats special-hours kitchen: null as a deliberate kitchen closure', async () => {
    const { resolveCombinedServiceRanges } = await import('@/lib/table-booking-service-windows')
    const businessHours = makeBusinessHours(
      {
        tuesday: {
          opens: '12:00:00',
          closes: '23:00:00',
          kitchen: { opens: '12:00:00', closes: '21:00:00' }
        }
      },
      [
        {
          date: '2026-05-05',
          opens: '12:00:00',
          closes: '23:00:00',
          kitchen: null
        }
      ]
    )
    const result = resolveCombinedServiceRanges(businessHours, '2026-05-05')
    expect(result.kitchenRanges).toHaveLength(0)
    expect(result.ranges.length).toBeGreaterThan(0)
  })

  it('treats special-hours is_kitchen_closed: true as a kitchen closure', async () => {
    const { resolveCombinedServiceRanges } = await import('@/lib/table-booking-service-windows')
    const businessHours = makeBusinessHours(
      {
        tuesday: {
          opens: '12:00:00',
          closes: '23:00:00',
          kitchen: { opens: '12:00:00', closes: '21:00:00' }
        }
      },
      [
        {
          date: '2026-05-05',
          opens: '12:00:00',
          closes: '23:00:00',
          kitchen: { opens: '12:00:00', closes: '21:00:00' },
          is_kitchen_closed: true
        }
      ]
    )
    const result = resolveCombinedServiceRanges(businessHours, '2026-05-05')
    expect(result.kitchenRanges).toHaveLength(0)
  })

  it('honours special-hours kitchen-open data on an otherwise kitchen-closed regular day', async () => {
    const { resolveCombinedServiceRanges } = await import('@/lib/table-booking-service-windows')
    const businessHours = makeBusinessHours(
      {
        monday: {
          opens: '16:00:00',
          closes: '23:00:00',
          kitchen: { is_closed: true }
        }
      },
      [
        {
          date: '2026-05-04',
          opens: '12:00:00',
          closes: '23:00:00',
          kitchen: { opens: '17:00:00', closes: '20:00:00' }
        }
      ]
    )
    const result = resolveCombinedServiceRanges(businessHours, '2026-05-04')
    expect(result.kitchenRanges.length).toBeGreaterThan(0)
    expect(result.kitchenRanges[0]).toMatchObject({
      startsAt: '17:00',
      endsAt: '20:00'
    })
  })

  it('returns closed=true when the venue is closed all day', async () => {
    const { resolveCombinedServiceRanges } = await import('@/lib/table-booking-service-windows')
    const businessHours = makeBusinessHours({
      tuesday: {
        opens: '12:00:00',
        closes: '23:00:00',
        kitchen: { opens: '12:00:00', closes: '21:00:00' },
        is_closed: true
      }
    })
    const result = resolveCombinedServiceRanges(businessHours, '2026-05-05')
    expect(result.closed).toBe(true)
    expect(result.ranges).toHaveLength(0)
    expect(result.kitchenRanges).toHaveLength(0)
    expect(result.message).toBeTruthy()
  })
})

describe('buildSlotsWithKitchenState', () => {
  it('stamps kitchen_open: true on slots inside a kitchen range and false outside', async () => {
    const { buildSlotsWithKitchenState } = await import('@/lib/table-booking-service-windows')
    const slots = buildSlotsWithKitchenState(
      [{ startsAt: '12:00', endsAt: '23:00', capacity: 50 }],
      [{ startsAt: '12:00', endsAt: '21:00', capacity: 50 }],
      2,
      30
    )
    const noon = slots.find((s) => s.time === '12:00')
    const lateEvening = slots.find((s) => s.time === '22:00')
    expect(noon?.kitchen_open).toBe(true)
    expect(lateEvening?.kitchen_open).toBe(false)
  })

  it('marks every slot kitchen_open: false when kitchen ranges are empty', async () => {
    const { buildSlotsWithKitchenState } = await import('@/lib/table-booking-service-windows')
    const slots = buildSlotsWithKitchenState(
      [{ startsAt: '16:00', endsAt: '23:00', capacity: 50 }],
      [],
      2,
      30
    )
    expect(slots.length).toBeGreaterThan(0)
    expect(slots.every((s) => s.kitchen_open === false)).toBe(true)
  })
})

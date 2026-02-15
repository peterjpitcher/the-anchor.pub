describe('Table Bookings API - Sunday Lunch Cutoff', () => {
  let createTableBooking: (request: any) => Promise<Response>

  beforeEach(async () => {
    process.env.ANCHOR_API_KEY = 'test-api-key'

    jest.resetModules()
    ;({ POST: createTableBooking } = await import('@/app/api/table-bookings/route'))
  })

  afterEach(() => {
    delete process.env.ANCHOR_API_KEY
    jest.useRealTimers()
  })

  it('rejects sunday_lunch bookings for non-Sunday dates', async () => {
    const request = {
      json: async () => ({
        phone: '07700900000',
        date: '2026-03-14',
        time: '13:00',
        party_size: 2,
        purpose: 'food',
        sunday_lunch: true
      }),
      headers: new Headers()
    } as any

    const response = await createTableBooking(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(String(data.error)).toContain('Sundays')
  })

  it('rejects sunday_lunch bookings after the 1pm Saturday cutoff (London time)', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-03-14T13:00:01.000Z'))

    const request = {
      json: async () => ({
        phone: '07700900000',
        date: '2026-03-15',
        time: '13:00',
        party_size: 2,
        purpose: 'food',
        sunday_lunch: true
      }),
      headers: new Headers()
    } as any

    const response = await createTableBooking(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(String(data.error)).toContain('1pm')
    expect(String(data.error)).toContain('closed')
  })
})

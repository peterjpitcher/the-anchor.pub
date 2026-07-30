import { anchorAPI, type TableBookingLoadResponse } from '@/lib/api'

// The bounded load helper backs the availability route's no-fail-open
// behaviour (review F04): one retry, then null, where null means
// "availability unknown", never "assume free".
describe('anchorAPI.getTableBookingLoadSafe', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns the load when a retry succeeds after a first failure', async () => {
    const load: TableBookingLoadResponse = {
      date: '2026-05-05',
      window_minutes: 60,
      busy_threshold_covers: 30,
      filling_threshold_covers: 20,
      bookings: []
    }
    const spy = jest
      .spyOn(anchorAPI, 'getTableBookingLoad')
      .mockRejectedValueOnce(new Error('timed out'))
      .mockResolvedValueOnce(load)

    await expect(anchorAPI.getTableBookingLoadSafe('2026-05-05')).resolves.toEqual(load)
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('returns null (availability unknown) when both attempts fail', async () => {
    const spy = jest
      .spyOn(anchorAPI, 'getTableBookingLoad')
      .mockRejectedValue(new Error('timed out'))

    await expect(anchorAPI.getTableBookingLoadSafe('2026-05-05')).resolves.toBeNull()
    expect(spy).toHaveBeenCalledTimes(2)
  })
})

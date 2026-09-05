jest.mock('@/lib/tracking/dispatcher', () => ({
  dispatchTrackingEvent: jest.fn(),
}))

jest.mock('@/lib/meta-pixel', () => ({
  trackMetaBookingPurchase: jest.fn(),
}))

import { dispatchTrackingEvent } from '@/lib/tracking/dispatcher'
import { trackTableBookingClick, trackTableBookingFunnel } from '@/lib/gtm-events'

const dispatch = dispatchTrackingEvent as jest.MockedFunction<typeof dispatchTrackingEvent>

describe('table booking tracking', () => {
  beforeEach(() => {
    dispatch.mockClear()
  })

  it('sends one canonical click event', () => {
    trackTableBookingClick({
      source: 'hero',
      destination: '/book-table',
    })

    expect(dispatch).toHaveBeenCalledTimes(1)
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'table_booking_click',
        source_component: 'hero',
        destination: '/book-table',
      }),
      { sendToApi: true }
    )
  })
})

it('adds only the non-personal fixture ID to completed booking tracking', () => {
  dispatch.mockClear()
  trackTableBookingFunnel({ step: 'success', source: 'rugby', deviceType: 'mobile', partySize: 4, fixtureId: '10000000-0000-4000-8000-000000000001' })
  const completed = dispatch.mock.calls.find(([event]) => event.event === 'table_booking_completed')?.[0]
  expect(completed).toMatchObject({ fixture_id: '10000000-0000-4000-8000-000000000001', party_size: 4 })
  expect(completed).not.toHaveProperty('notes')
  expect(completed).not.toHaveProperty('email')
  expect(completed).not.toHaveProperty('phone')
})

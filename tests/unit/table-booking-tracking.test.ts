jest.mock('@/lib/tracking/dispatcher', () => ({
  dispatchTrackingEvent: jest.fn(),
}))

jest.mock('@/lib/meta-pixel', () => ({
  trackMetaBookingPurchase: jest.fn(),
}))

import { dispatchTrackingEvent } from '@/lib/tracking/dispatcher'
import { trackTableBookingClick } from '@/lib/gtm-events'

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

jest.mock('@/lib/tracking/dispatcher', () => ({
  dispatchTrackingEvent: jest.fn(),
}))

jest.mock('@/lib/meta-pixel', () => ({
  trackMetaBookingPurchase: jest.fn(),
}))

import { dispatchTrackingEvent } from '@/lib/tracking/dispatcher'
import {
  trackVenueTourEnquiryClicked,
  trackVenueTourPhotoOpened,
  trackVenueTourSpaceSelected,
  trackVenueTourViewed,
} from '@/lib/gtm-events'

const dispatch = dispatchTrackingEvent as jest.MockedFunction<typeof dispatchTrackingEvent>

describe('venue tour tracking', () => {
  beforeEach(() => {
    dispatch.mockClear()
  })

  it('tracks a source-backed tour funnel without personal data', () => {
    trackVenueTourViewed({
      sourcePage: '/private-hire',
      sourceComponent: 'private_hire_page',
    })
    trackVenueTourSpaceSelected({
      sourcePage: '/private-hire',
      sourceComponent: 'private_hire_page',
      spaceId: 'beer-garden',
      spaceName: 'Beer garden',
    })
    trackVenueTourPhotoOpened({
      sourcePage: '/private-hire',
      sourceComponent: 'private_hire_page',
      photoId: 'garden-view',
      photoName: 'The beer garden',
      spaceId: 'beer-garden',
      spaceName: 'Beer garden',
    })
    trackVenueTourEnquiryClicked({
      sourcePage: '/private-hire',
      sourceComponent: 'private_hire_page',
      destination: '/private-hire?space=beer-garden#enquiry',
      spaceId: 'beer-garden',
      spaceName: 'Beer garden',
    })

    expect(dispatch).toHaveBeenCalledTimes(4)
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        event: 'venue_tour_space_selected',
        page_source: '/private-hire',
        source_component: 'private_hire_page',
        space_id: 'beer-garden',
        space_name: 'Beer garden',
      }),
      { sendToApi: true }
    )
    expect(dispatch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        event: 'venue_tour_enquiry_clicked',
        destination: '/private-hire?space=beer-garden#enquiry',
      }),
      { sendToApi: true }
    )
  })
})

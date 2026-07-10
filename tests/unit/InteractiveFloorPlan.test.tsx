import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InteractiveVenueFloorPlan } from '@/components/private-hire/venue-tour'

jest.mock('@/lib/gtm-events', () => ({
  trackModalClose: jest.fn(),
  trackModalEngage: jest.fn(),
  trackModalOpen: jest.fn(),
  trackVenueTourEnquiryClicked: jest.fn(),
  trackVenueTourPhotoOpened: jest.fn(),
  trackVenueTourSpaceSelected: jest.fn(),
  trackVenueTourViewed: jest.fn(),
}))

import { trackVenueTourPhotoOpened } from '@/lib/gtm-events'

const mockTrackPhoto = trackVenueTourPhotoOpened as jest.MockedFunction<
  typeof trackVenueTourPhotoOpened
>

describe('InteractiveVenueFloorPlan', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('switches between the confirmed private hire spaces', async () => {
    const user = userEvent.setup()
    const spaceSelected = jest.fn()
    window.addEventListener('anchor:venue-tour-space-selected', spaceSelected)
    render(<InteractiveVenueFloorPlan source="test_tour" eventType="Birthday Party" />)

    expect(screen.getByRole('heading', { name: 'Dining room' })).toBeInTheDocument()
    expect(screen.getByText('26 seated, up to 50 standing')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Show Beer garden hire details' }))

    expect(screen.getByRole('heading', { name: 'Beer garden' })).toBeInTheDocument()
    expect(screen.getByText('64 seated, larger events by enquiry')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show Beer garden hire details' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: 'Choose Beer garden' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('link', { name: 'Ask about this space' })).toHaveAttribute(
      'href',
      '/private-hire?space=beer-garden&event=Birthday+Party#enquiry'
    )
    expect(spaceSelected).toHaveBeenCalledTimes(1)
    window.removeEventListener('anchor:venue-tour-space-selected', spaceSelected)
  })

  it('opens a photo viewpoint and moves through the photo tour', async () => {
    const user = userEvent.setup()
    render(<InteractiveVenueFloorPlan source="test_tour" />)

    await user.click(screen.getByRole('button', { name: 'Open photo: The main bar' }))

    expect(mockTrackPhoto).toHaveBeenLastCalledWith(
      expect.objectContaining({
        photoId: 'main-bar-view',
        spaceId: undefined,
        spaceName: undefined,
      })
    )

    expect(await screen.findByRole('dialog', { name: 'The main bar' })).toBeInTheDocument()
    expect(screen.getByAltText('The main bar area at The Anchor in Stanwell Moor')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next view' }))

    expect(screen.getByRole('dialog', { name: 'The pool table area' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close modal' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

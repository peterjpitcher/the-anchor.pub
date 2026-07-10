import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VenueTourTeaser } from '@/components/private-hire/venue-tour/VenueTourTeaser'

jest.mock('@/lib/gtm-events', () => ({
  trackCtaClick: jest.fn(),
  trackVenueTourViewed: jest.fn(),
}))

jest.mock('@/components/private-hire/venue-tour/InteractiveVenueFloorPlan', () => ({
  InteractiveVenueFloorPlan: () => <div>Expanded interactive venue tour</div>,
}))

describe('VenueTourTeaser', () => {
  it('links to the requested space on the standalone tour', () => {
    render(
      <VenueTourTeaser
        source="test_page"
        initialSpaceId="beer-garden"
        eventType="Corporate Event"
        ctaLabel="Explore the garden"
      />
    )

    expect(screen.getByRole('link', { name: 'Explore the garden' })).toHaveAttribute(
      'href',
      '/private-hire/venue-tour?space=beer-garden&event=Corporate+Event#venue-map'
    )
  })

  it('loads the interactive version only after an expand action', async () => {
    const user = userEvent.setup()
    render(<VenueTourTeaser source="test_page" mode="expand" />)

    expect(screen.queryByText('Expanded interactive venue tour')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /explore the venue here/i }))

    expect(await screen.findByText('Expanded interactive venue tour')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hide the floor plan/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })
})

import { render, screen, fireEvent } from '@testing-library/react'
import { DirectionsButton, DirectionsLink } from '@/components/DirectionsButton'
import { trackDirectionsClick } from '@/lib/gtm-events'

jest.mock('@/lib/gtm-events', () => ({
  trackDirectionsClick: jest.fn(),
}))

const mockTrackDirectionsClick = trackDirectionsClick as jest.MockedFunction<typeof trackDirectionsClick>

const GOOGLE_MAPS_HREF = 'https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ'
const APPLE_MAPS_HREF = 'https://maps.apple.com/?q=The+Anchor+Stanwell+Moor+TW19+6AQ'

describe('DirectionsButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders one anchor and never a button nested inside an anchor', () => {
    const { container } = render(
      <DirectionsButton href={GOOGLE_MAPS_HREF} source="test_directions">
        Get Directions
      </DirectionsButton>
    )

    // The defect this guards: <a><button>...</button></a> is invalid HTML, gives one
    // action two tab stops, and reads oddly to screen readers.
    expect(container.querySelectorAll('a button')).toHaveLength(0)
    expect(container.querySelectorAll('button')).toHaveLength(0)
    expect(container.querySelectorAll('a, button')).toHaveLength(1)
  })

  it('exposes a single accessible link, not a link plus a button', () => {
    render(
      <DirectionsButton href={GOOGLE_MAPS_HREF} source="test_directions">
        Get Directions
      </DirectionsButton>
    )

    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get Directions' })).toHaveAttribute('href', GOOGLE_MAPS_HREF)
  })

  it('keeps the anchor keyboard reachable with a visible focus ring', () => {
    render(
      <DirectionsButton href={GOOGLE_MAPS_HREF} source="test_directions">
        Get Directions
      </DirectionsButton>
    )

    const link = screen.getByRole('link', { name: 'Get Directions' })
    expect(link).not.toHaveAttribute('tabindex')
    link.focus()
    expect(link).toHaveFocus()
    expect(link.className).toContain('focus:ring-2')
    expect(link.className).toContain('focus:ring-anchor-gold-dark')
  })

  it('still looks like a button and merges the caller className onto the anchor', () => {
    render(
      <DirectionsButton href={GOOGLE_MAPS_HREF} source="test_directions" variant="outline" size="lg" className="w-full">
        Get Directions
      </DirectionsButton>
    )

    const link = screen.getByRole('link', { name: 'Get Directions' })
    expect(link.className).toContain('inline-flex')
    expect(link.className).toContain('rounded-pill')
    expect(link.className).toContain('w-full')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('tracks the click with the unchanged directions payload', () => {
    const onClick = jest.fn()

    render(
      <DirectionsButton
        href={APPLE_MAPS_HREF}
        source="test_directions"
        fromLocation="Heathrow Terminal 5"
        onClick={onClick}
      >
        Get Directions
      </DirectionsButton>
    )

    fireEvent.click(screen.getByRole('link', { name: 'Get Directions' }))

    expect(mockTrackDirectionsClick).toHaveBeenCalledWith('test_directions', {
      destination: 'The Anchor Stanwell Moor',
      mapPlatform: 'apple_maps',
      fromLocation: 'Heathrow Terminal 5',
    })
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('leaves the asLink branch as a plain inline anchor', () => {
    const { container } = render(
      <DirectionsLink href={GOOGLE_MAPS_HREF} source="footer_address" className="text-anchor-gold-dark">
        Horton Road, Stanwell Moor
      </DirectionsLink>
    )

    const link = screen.getByRole('link', { name: 'Horton Road, Stanwell Moor' })
    expect(container.querySelectorAll('a button')).toHaveLength(0)
    expect(container.querySelectorAll('a, button')).toHaveLength(1)
    expect(link.className).toBe('text-anchor-gold-dark')
    expect(link.className).not.toContain('rounded-pill')

    fireEvent.click(link)

    expect(mockTrackDirectionsClick).toHaveBeenCalledWith('footer_address', {
      destination: 'The Anchor Stanwell Moor',
      mapPlatform: 'google_maps',
      fromLocation: undefined,
    })
  })
})

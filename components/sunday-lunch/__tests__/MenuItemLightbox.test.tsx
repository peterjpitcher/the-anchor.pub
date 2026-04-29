import { fireEvent, render, screen } from '@testing-library/react'
import { MenuItemLightbox, type MenuItem } from '../MenuItemLightbox'
import { pushToDataLayer } from '@/lib/gtm-events'

jest.mock('@/lib/gtm-events', () => ({
  pushToDataLayer: jest.fn(),
  trackModalOpen: jest.fn(),
  trackModalClose: jest.fn(),
  trackModalEngage: jest.fn(),
  trackCtaClick: jest.fn(),
  trackTableBookingClick: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  usePathname: () => '/sunday-lunch',
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

const sampleItem: MenuItem = {
  name: 'Roast Beef',
  description: 'Slow-roasted topside with horseradish and pan gravy.',
  priceLabel: '£16.95',
  imageSrc: '/images/roast-beef.jpg',
  imageAlt: 'Plated roast beef Sunday lunch',
}

describe('MenuItemLightbox', () => {
  const mockPushToDataLayer = pushToDataLayer as jest.MockedFunction<typeof pushToDataLayer>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not render content when item is null', () => {
    render(<MenuItemLightbox item={null} onClose={() => {}} />)
    expect(screen.queryByText('Roast Beef')).not.toBeInTheDocument()
  })

  it('renders name, description, price, image, and Book CTA when an item is given', () => {
    render(<MenuItemLightbox item={sampleItem} onClose={() => {}} />)

    expect(screen.getByText('Roast Beef')).toBeInTheDocument()
    expect(
      screen.getByText('Slow-roasted topside with horseradish and pan gravy.')
    ).toBeInTheDocument()
    expect(screen.getByText('£16.95')).toBeInTheDocument()
    expect(
      screen.getByAltText('Plated roast beef Sunday lunch')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /book a table/i })
    ).toBeInTheDocument()
  })

  it('fires a view_item dataLayer event when opened', () => {
    render(<MenuItemLightbox item={sampleItem} onClose={() => {}} />)

    expect(mockPushToDataLayer).toHaveBeenCalledWith({
      event: 'view_item',
      item_category: 'menu_item',
      item_name: 'Roast Beef',
    })
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = jest.fn()
    render(<MenuItemLightbox item={sampleItem} onClose={onClose} />)

    fireEvent.click(screen.getByLabelText('Close modal'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = jest.fn()
    render(<MenuItemLightbox item={sampleItem} onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

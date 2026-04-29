import { fireEvent, render, screen } from '@testing-library/react'
import { SundayLunchMenuList, type SundayLunchMenuItem } from '../SundayLunchMenuList'
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

const ITEMS: SundayLunchMenuItem[] = [
  {
    name: 'Roast Beef',
    description: 'Slow-roasted topside with horseradish and pan gravy.',
    priceLabel: '£22',
  },
  {
    name: 'Crispy Pork Belly',
    description: 'Crispy crackling, Bramley apple sauce.',
    priceLabel: '£22',
  },
]

describe('SundayLunchMenuList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders one button row per menu item', () => {
    render(<SundayLunchMenuList items={ITEMS} />)

    expect(
      screen.getByRole('button', { name: /view details for roast beef/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /view details for crispy pork belly/i })
    ).toBeInTheDocument()
  })

  it('opens the lightbox with the clicked item', () => {
    render(<SundayLunchMenuList items={ITEMS} fallbackImageSrc="/fallback.jpg" />)

    // No modal-rendered title initially.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: /view details for roast beef/i })
    )

    // Modal opens — assert the modal-only Book a table CTA is now visible.
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /book a table/i })
    ).toBeInTheDocument()
    // Description appears once in the row and once in the modal — both items
    // share the same name + description so the count is what we assert here.
    expect(
      screen.getAllByText('Slow-roasted topside with horseradish and pan gravy.')
    ).toHaveLength(2)
  })

  it('fires view_item to dataLayer when a row is clicked', () => {
    const mockPush = pushToDataLayer as jest.MockedFunction<typeof pushToDataLayer>
    render(<SundayLunchMenuList items={ITEMS} />)

    fireEvent.click(
      screen.getByRole('button', { name: /view details for roast beef/i })
    )

    expect(mockPush).toHaveBeenCalledWith({
      event: 'view_item',
      item_category: 'menu_item',
      item_name: 'Roast Beef',
    })
  })
})

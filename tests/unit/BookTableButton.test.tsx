import { render, screen, fireEvent } from '@testing-library/react'
import { BookTableButton } from '@/components/BookTableButton'
import { trackCtaClick, trackTableBookingClick } from '@/lib/gtm-events'
import { usePathname } from 'next/navigation'

jest.mock('@/lib/gtm-events', () => ({
  trackCtaClick: jest.fn(),
  trackTableBookingClick: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

describe('BookTableButton', () => {
  const mockTrackCtaClick = trackCtaClick as jest.MockedFunction<typeof trackCtaClick>
  const mockTrackTableBookingClick = trackTableBookingClick as jest.MockedFunction<typeof trackTableBookingClick>
  const mockUsePathname = usePathname as jest.Mock
  const defaultUserAgent = navigator.userAgent
  const originalLocation = window.location
  let currentHref = 'http://localhost/'

  const locationMock: Partial<Location> & {
    assign: jest.Mock
    replace: jest.Mock
    reload: jest.Mock
  } = {
    get href() {
      return currentHref
    },
    set href(value: string) {
      currentHref = value
    },
    assign: jest.fn((value: string) => {
      currentHref = value
    }),
    replace: jest.fn((value: string) => {
      currentHref = value
    }),
    reload: jest.fn(),
    ancestorOrigins: originalLocation.ancestorOrigins,
    origin: originalLocation.origin,
    pathname: originalLocation.pathname,
    search: originalLocation.search,
    hash: originalLocation.hash,
  }

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: locationMock,
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/test-page')

    // Reset window and navigator state between tests
    currentHref = 'http://localhost/'
    locationMock.assign.mockClear()
    locationMock.replace.mockClear()
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      writable: true,
      configurable: true,
    })
  })

  afterAll(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: defaultUserAgent,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: originalLocation,
    })
  })

  it('renders with default props', () => {
    render(<BookTableButton source="test" />)

    expect(screen.getByRole('button', { name: 'Book a Table' })).toBeInTheDocument()
  })

  it('renders custom children', () => {
    render(<BookTableButton source="test">Reserve Now</BookTableButton>)

    expect(screen.getByRole('button', { name: 'Reserve Now' })).toBeInTheDocument()
  })

  it('tracks events and navigates to booking flow on click', () => {
    render(<BookTableButton source="hero" />)

    fireEvent.click(screen.getByRole('button', { name: 'Book a Table' }))

    expect(mockTrackCtaClick).toHaveBeenCalledWith({
      id: 'book_table_hero',
      label: 'Book a Table',
      location: 'hero',
      destination: 'book_table',
      context: 'regular',
      variant: 'primary',
    })

    expect(mockTrackTableBookingClick).toHaveBeenCalledWith(expect.objectContaining({
      source: 'hero',
      context: 'regular',
      destination: '/book-table',
      originPath: '/test-page',
      device: 'desktop',
    }))

    expect(currentHref).toBe('/book-table')
  })

  it('detects mobile devices when tracking', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      writable: true,
      configurable: true,
    })
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true, configurable: true })

    render(<BookTableButton source="mobile_menu" />)

    fireEvent.click(screen.getByRole('button', { name: 'Book a Table' }))

    expect(mockTrackTableBookingClick).toHaveBeenCalledWith(expect.objectContaining({
      source: 'mobile_menu',
      device: 'mobile',
    }))
  })

  it('calls custom onClick handler after tracking', () => {
    const afterTracking = jest.fn()

    render(
      <BookTableButton
        source="test"
        onClickAfterTracking={afterTracking}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Book a Table' }))

    expect(afterTracking).toHaveBeenCalled()
    expect(mockTrackCtaClick).toHaveBeenCalled()
    expect(mockTrackTableBookingClick).toHaveBeenCalled()
  })

  it('determines correct time of day for analytics', () => {
    const scenarios = [
      { hour: 8, expected: 'morning' },
      { hour: 14, expected: 'afternoon' },
      { hour: 20, expected: 'evening' },
    ]

    jest.useFakeTimers()

    try {
      scenarios.forEach(({ hour, expected }) => {
        jest.setSystemTime(new Date(2024, 0, 15, hour, 0, 0))

        const { getByRole, unmount } = render(<BookTableButton source="test" />)
        fireEvent.click(getByRole('button', { name: 'Book a Table' }))

        expect(mockTrackTableBookingClick).toHaveBeenCalledWith(expect.objectContaining({
          timeOfDay: expected,
        }))

        mockTrackCtaClick.mockClear()
        mockTrackTableBookingClick.mockClear()
        currentHref = 'http://localhost/'
        unmount()
      })
    } finally {
      jest.useRealTimers()
    }
  })
})

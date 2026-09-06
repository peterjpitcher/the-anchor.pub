import { render, screen, fireEvent } from '@testing-library/react'
import { PhoneButton } from '@/components/PhoneButton'
import { trackPhoneCallClick } from '@/lib/gtm-events'

jest.mock('@/lib/gtm-events', () => ({
  trackPhoneCallClick: jest.fn(),
}))

const mockTrackPhoneCallClick = trackPhoneCallClick as jest.MockedFunction<typeof trackPhoneCallClick>

describe('PhoneButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders one anchor and never a button nested inside an anchor', () => {
    const { container } = render(<PhoneButton phone="01753 682707" source="test_source" />)

    expect(container.querySelectorAll('a button')).toHaveLength(0)
    expect(container.querySelectorAll('button')).toHaveLength(0)
    expect(container.querySelectorAll('a, button')).toHaveLength(1)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('keeps the tel link keyboard reachable, styled as a button', () => {
    render(<PhoneButton phone="01753 682707" source="test_source" className="w-full" />)

    const link = screen.getByRole('link', { name: 'Call 01753 682707' })
    expect(link).toHaveAttribute('href', 'tel:+441753682707')
    expect(link).not.toHaveAttribute('tabindex')
    link.focus()
    expect(link).toHaveFocus()
    expect(link.className).toContain('rounded-pill')
    expect(link.className).toContain('focus:ring-2')
    expect(link.className).toContain('w-full')
  })

  it('tracks the click with the unchanged phone payload', () => {
    render(<PhoneButton phone="01753 682707" source="test_source">Call us</PhoneButton>)

    fireEvent.click(screen.getByRole('link', { name: 'Call us' }))

    expect(mockTrackPhoneCallClick).toHaveBeenCalledWith({
      phone: '01753 682707',
      source: 'test_source',
    })
  })
})

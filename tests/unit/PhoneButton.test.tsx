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
    const { container } = render(<PhoneButton phone="01753 682707" source="test_phone" />)

    // The defect this guards: <a><button>...</button></a> is invalid HTML, gives one
    // action two tab stops, and reads oddly to screen readers.
    expect(container.querySelectorAll('a button')).toHaveLength(0)
    expect(container.querySelectorAll('button')).toHaveLength(0)
    expect(container.querySelectorAll('a, button')).toHaveLength(1)
  })

  it('exposes a single accessible link, not a link plus a button', () => {
    render(<PhoneButton phone="01753 682707" source="test_phone" />)

    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Call 01753 682707' })).toBeInTheDocument()
  })

  it('normalises the UK number to international format in the tel: href', () => {
    render(<PhoneButton phone="01753 682707" source="test_phone" />)

    expect(screen.getByRole('link', { name: 'Call 01753 682707' })).toHaveAttribute(
      'href',
      'tel:+441753682707'
    )
  })

  it('keeps the anchor keyboard reachable with a visible focus ring', () => {
    render(<PhoneButton phone="01753 682707" source="test_phone" />)

    const link = screen.getByRole('link', { name: 'Call 01753 682707' })
    expect(link).not.toHaveAttribute('tabindex')
    link.focus()
    expect(link).toHaveFocus()
    expect(link.className).toContain('focus:ring-2')
    expect(link.className).toContain('focus:ring-anchor-gold-dark')
  })

  it('still looks like a button and applies the caller variant, size and className', () => {
    render(
      <PhoneButton phone="01753 682707" source="test_phone" variant="primary" size="sm" className="w-full">
        Ring the pub
      </PhoneButton>
    )

    const link = screen.getByRole('link', { name: 'Ring the pub' })
    expect(link.className).toContain('inline-flex')
    expect(link.className).toContain('rounded-pill')
    expect(link.className).toContain('w-full')
  })

  it('tracks the click with the unchanged phone payload', () => {
    render(<PhoneButton phone="01753 682707" source="footer_cta" />)

    fireEvent.click(screen.getByRole('link', { name: 'Call 01753 682707' }))

    expect(mockTrackPhoneCallClick).toHaveBeenCalledWith({
      phone: '01753 682707',
      source: 'footer_cta',
    })
  })
})

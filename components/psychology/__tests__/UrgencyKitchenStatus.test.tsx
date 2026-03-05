import { render, screen } from '@testing-library/react'
import { UrgencyKitchenStatus } from '../UrgencyKitchenStatus'

describe('UrgencyKitchenStatus', () => {
  it('renders nothing when status is null', () => {
    const { container } = render(<UrgencyKitchenStatus status={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders closed-today message with booking link', () => {
    render(<UrgencyKitchenStatus status={{ type: 'closed-today' }} />)
    expect(screen.getByText(/Kitchen's having a rest today/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /book for another day/i })).toBeInTheDocument()
  })

  it('renders opens-later message with time and link', () => {
    render(<UrgencyKitchenStatus status={{ type: 'opens-later', opensAt: '4pm' }} />)
    expect(screen.getByText(/Kitchen opens at 4pm/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /reserve your table now/i })).toBeInTheDocument()
  })

  it('renders open message without booking link', () => {
    render(<UrgencyKitchenStatus status={{ type: 'open', closesAt: '9pm' }} />)
    expect(screen.getByText(/Kitchen open until 9pm/i)).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('renders closing-soon message with link', () => {
    render(<UrgencyKitchenStatus status={{ type: 'closing-soon', closesAt: '9pm' }} />)
    expect(screen.getByText(/Kitchen closes at 9pm/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /don't leave it too late/i })).toBeInTheDocument()
  })
})

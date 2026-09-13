import { render, screen } from '@testing-library/react'
import { ValueProofStrip } from '../ValueProofStrip'

describe('ValueProofStrip', () => {
  it('renders food variant with the ULEZ line and no saving figure', () => {
    const { container } = render(<ValueProofStrip variant="food" />)
    expect(screen.getByText(/Outside the ULEZ zone/i)).toBeInTheDocument()
    // SSOT §14: a ULEZ saving figure is never quoted, it depends on the car and the route.
    expect(container.textContent).not.toMatch(/£\s?\d/)
    expect(screen.getByText(/Free on-site parking/i)).toBeInTheDocument()
    expect(screen.getByText(/Free WiFi/i)).toBeInTheDocument()
  })

  it('renders private-hire variant with guest-focused copy', () => {
    const { container } = render(<ValueProofStrip variant="private-hire" />)
    expect(screen.getByText(/Free parking for all your guests/i)).toBeInTheDocument()
    expect(screen.getByText(/Outside the ULEZ zone/i)).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/£\s?\d/)
    expect(screen.getByText(/Free WiFi throughout/i)).toBeInTheDocument()
  })

  it('renders with default food variant when no variant given', () => {
    render(<ValueProofStrip />)
    expect(screen.getByText(/Outside the ULEZ zone/i)).toBeInTheDocument()
  })
})

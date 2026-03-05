import { render, screen } from '@testing-library/react'
import { ValueProofStrip } from '../ValueProofStrip'

describe('ValueProofStrip', () => {
  it('renders food variant with ULEZ saving', () => {
    render(<ValueProofStrip variant="food" />)
    expect(screen.getByText(/Skip the ULEZ charge/i)).toBeInTheDocument()
    expect(screen.getByText(/£12\.50/)).toBeInTheDocument()
    expect(screen.getByText(/Free on-site parking/i)).toBeInTheDocument()
    expect(screen.getByText(/Free WiFi/i)).toBeInTheDocument()
  })

  it('renders private-hire variant with guest-focused copy', () => {
    render(<ValueProofStrip variant="private-hire" />)
    expect(screen.getByText(/Free parking for all your guests/i)).toBeInTheDocument()
    expect(screen.getByText(/Outside ULEZ/i)).toBeInTheDocument()
    expect(screen.getByText(/Free WiFi throughout/i)).toBeInTheDocument()
  })

  it('renders with default food variant when no variant given', () => {
    render(<ValueProofStrip />)
    expect(screen.getByText(/Skip the ULEZ charge/i)).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/layout/Footer'
import { OrangeJellyCreditLine } from '@/components/OrangeJellyCredit'
import { FALLBACK_CREDIT } from '@/lib/orange-jelly-credit'

// The credit is an async Server Component, so the layout renders it and passes it
// to this client footer as a slot. These pin where that slot lands.
describe('Footer credit slot', () => {
  it('renders the credit directly under the copyright line in the base bar', () => {
    render(
      <Footer
        copyright={{ year: 2026 }}
        credit={<OrangeJellyCreditLine credit={FALLBACK_CREDIT} className="credit-line" />}
      />
    )

    const copyright = screen.getByText(/2026 The Anchor, Stanwell Moor Village/)
    const credit = screen.getByText(/Built and maintained by/)

    expect(credit).toHaveClass('credit-line')
    expect(copyright.nextElementSibling).toBe(credit)
    expect(screen.getByRole('link', { name: 'Orange Jelly' })).toHaveAttribute('href', 'https://www.orangejelly.co.uk/')
  })

  it('renders no credit when none is passed', () => {
    render(<Footer copyright={{ year: 2026 }} />)

    expect(screen.getByText(/2026 The Anchor, Stanwell Moor Village/)).toBeInTheDocument()
    expect(screen.queryByText(/Built and maintained by/)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Orange Jelly' })).not.toBeInTheDocument()
  })
})

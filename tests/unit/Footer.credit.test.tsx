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

  // Site review DT-011: a clock read in this client component ran once on the
  // server and again in the browser, and at New Year the two disagreed.
  it('prints the year it is given and never reads the clock itself', () => {
    const fs = require('fs') as typeof import('fs')
    const path = require('path') as typeof import('path')
    const source = fs.readFileSync(path.join(process.cwd(), 'components', 'layout', 'Footer.tsx'), 'utf8')
    expect(source).not.toMatch(/new Date\(|Date\.now\(/)

    jest.useFakeTimers().setSystemTime(new Date('2027-01-01T00:00:30Z'))
    render(<Footer copyright={{ year: 2026 }} />)
    expect(screen.getAllByText(/2026 The Anchor, Stanwell Moor Village/).length).toBeGreaterThan(0)
    jest.useRealTimers()
  })

  it('the root layout passes the London year', () => {
    const fs = require('fs') as typeof import('fs')
    const path = require('path') as typeof import('path')
    const layout = fs.readFileSync(path.join(process.cwd(), 'app', 'layout.tsx'), 'utf8')
    expect(layout).toContain('copyright={{ year: nowInLondonComponents().year }}')
  })
})

import { render, screen } from '@testing-library/react'
import { SectionHeading } from '../SectionHeading'

describe('SectionHeading', () => {
  it('renders the title as a heading', () => {
    render(<SectionHeading title="Our Sunday Roast" />)
    expect(screen.getByRole('heading', { name: 'Our Sunday Roast' })).toBeInTheDocument()
  })

  it('renders kicker, script and lead in canonical styles', () => {
    render(<SectionHeading kicker="Eat" script="Tuck in" title="Food" lead="Pub classics" />)
    const kicker = screen.getByText('Eat')
    expect(kicker).toHaveClass('uppercase')
    expect(kicker).toHaveClass('text-accent-text')

    const script = screen.getByText('Tuck in')
    expect(script).toHaveClass('font-script')
    expect(script).toHaveClass('text-script')

    const lead = screen.getByText('Pub classics')
    expect(lead).toHaveClass('text-ink-muted')
    // The lead used to cap at 56ch. It no longer sets any width of its own:
    // page width is decided once, by .container in globals.css. A capped lead
    // sat visibly narrower than the cards beneath it on nearly every page.
    expect(lead.className).not.toMatch(/max-w-/)
  })

  it('keeps the custom h2 size alongside the colour token (tailwind-merge fix)', () => {
    render(<SectionHeading title="Heading" />)
    const heading = screen.getByRole('heading', { name: 'Heading' })
    // Both the custom font-size and the colour utility must survive cn().
    expect(heading).toHaveClass('text-h2')
    expect(heading).toHaveClass('text-ink-strong')
    expect(heading).toHaveClass('font-display')
  })

  it('maps the deprecated eyebrow alias to kicker', () => {
    render(<SectionHeading title="Heading" eyebrow="Welcome" />)
    expect(screen.getByText('Welcome')).toHaveClass('text-accent-text')
  })

  it('folds the deprecated description and subtitle aliases into the lead', () => {
    const { rerender } = render(<SectionHeading title="Heading" description="Some copy" />)
    expect(screen.getByText('Some copy')).toBeInTheDocument()

    rerender(<SectionHeading title="Heading" subtitle="A warm line" />)
    expect(screen.getByText('A warm line')).toBeInTheDocument()
  })

  it('renders both subtitle and description when both are supplied', () => {
    render(<SectionHeading title="Heading" subtitle="Primary line" description="Secondary line" />)
    expect(screen.getByText('Primary line')).toBeInTheDocument()
    expect(screen.getByText('Secondary line')).toBeInTheDocument()
  })

  it('centres by default and left-aligns when asked', () => {
    const { container, rerender } = render(<SectionHeading title="Heading" />)
    expect(container.firstChild).toHaveClass('text-center')

    rerender(<SectionHeading title="Heading" align="left" />)
    expect(container.firstChild).toHaveClass('text-left')

    // Legacy 'right' renders left-aligned.
    rerender(<SectionHeading title="Heading" align="right" />)
    expect(container.firstChild).toHaveClass('text-left')
  })
})

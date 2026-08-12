import { render, screen } from '@testing-library/react'
import { Container, Section } from '../Container'

describe('Container', () => {
  it('renders children correctly', () => {
    render(<Container>Container content</Container>)
    expect(screen.getByText('Container content')).toBeInTheDocument()
  })

  // Page width has one definition: the .container rule in app/globals.css,
  // driven by --container-max / --container-pad. The component must not add a
  // max-width or a padding of its own, or it drifts away from the header the
  // way it used to (1216px of content against the header's 1248px).
  it('applies the shared container class and nothing else that sets width', () => {
    render(<Container>Content</Container>)
    const el = screen.getByText('Content')
    expect(el).toHaveClass('container')
    expect(el.className).not.toMatch(/\bmax-w-/)
    expect(el.className).not.toMatch(/(^|\s|:)px-/)
  })

  it('renders as different HTML elements', () => {
    const { rerender } = render(<Container as="div">Div container</Container>)
    expect(screen.getByText('Div container').tagName).toBe('DIV')

    rerender(<Container as="section">Section container</Container>)
    expect(screen.getByText('Section container').tagName).toBe('SECTION')

    rerender(<Container as="main">Main container</Container>)
    expect(screen.getByText('Main container').tagName).toBe('MAIN')
  })

  it('applies custom className', () => {
    render(<Container className="custom-class">Custom</Container>)
    expect(screen.getByText('Custom')).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Container ref={ref}>Container</Container>)
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
  })
})

describe('Section', () => {
  it('renders as section element', () => {
    render(<Section>Section content</Section>)
    const section = screen.getByText('Section content')
    expect(section.tagName).toBe('SECTION')
  })

  it('applies spacing classes correctly', () => {
    const { rerender } = render(<Section spacing="none">No spacing</Section>)
    expect(screen.getByText('No spacing').className).not.toMatch(/\bpy-\d/)

    rerender(<Section spacing="sm">Small spacing</Section>)
    expect(screen.getByText('Small spacing')).toHaveClass('py-8', 'md:py-10')

    rerender(<Section spacing="lg">Large spacing</Section>)
    expect(screen.getByText('Large spacing')).toHaveClass('py-12', 'md:py-14', 'lg:py-16')
  })

  it('inherits the single container width from Container', () => {
    render(<Section>Section</Section>)
    const section = screen.getByText('Section')
    expect(section).toHaveClass('container')
    expect(section.className).not.toMatch(/\bmax-w-/)
  })

  it('combines spacing and custom className', () => {
    render(<Section spacing="md" className="bg-gray-100">Section</Section>)
    const section = screen.getByText('Section')
    expect(section).toHaveClass('py-10', 'md:py-12', 'lg:py-14', 'bg-gray-100')
  })
})

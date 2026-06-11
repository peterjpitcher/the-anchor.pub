import { render, screen } from '@/lib/test-utils'
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '../Card'

describe('Card', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <CardBody>Card content</CardBody>
      </Card>
    )

    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders a light card by default', () => {
    render(
      <Card testId="card">
        <CardBody>Light</CardBody>
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('bg-surface', 'border-line', 'rounded-md', 'shadow-sm')
  })

  it('renders a dark card', () => {
    render(
      <Card variant="dark" testId="card">
        <CardBody>Dark</CardBody>
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('bg-anchor-green-card', 'border-line-gold', 'rounded-xs')
  })

  it('renders a gold accent top rule', () => {
    const { rerender } = render(
      <Card accent testId="card">
        <CardBody>Accent light</CardBody>
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('border-t-[3px]', 'border-t-anchor-gold')

    rerender(
      <Card variant="dark" accent testId="card">
        <CardBody>Accent dark</CardBody>
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('border-t-[3px]', 'border-t-anchor-gold-bright')
  })

  it('applies hover lift when hover is set', () => {
    render(
      <Card hover testId="card">
        <CardBody>Hover</CardBody>
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('hover:-translate-y-[3px]', 'hover:shadow-lg')
  })

  it('applies custom className', () => {
    render(
      <Card className="custom-card" testId="card">
        <CardBody>Custom</CardBody>
      </Card>
    )

    expect(screen.getByTestId('card')).toHaveClass('custom-card')
  })

  it('renders with all sub-components', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardBody>Card body content</CardBody>
        <CardFooter>Card footer</CardFooter>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card body content')).toBeInTheDocument()
    expect(screen.getByText('Card footer')).toBeInTheDocument()
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(
      <Card ref={ref}>
        <CardBody>With ref</CardBody>
      </Card>
    )

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
  })
})

describe('CardHeader', () => {
  it('renders children correctly', () => {
    render(
      <CardHeader>
        <CardTitle>Header Title</CardTitle>
      </CardHeader>
    )

    expect(screen.getByText('Header Title')).toBeInTheDocument()
  })

  it('applies correct styling', () => {
    render(<CardHeader>Header</CardHeader>)

    const header = screen.getByText('Header')
    expect(header).toHaveClass('border-b', 'border-line')
  })

  it('applies custom className', () => {
    render(<CardHeader className="custom-header">Header</CardHeader>)

    expect(screen.getByText('Header')).toHaveClass('custom-header')
  })
})

describe('CardTitle', () => {
  it('renders as h3 by default', () => {
    render(<CardTitle>Title</CardTitle>)

    const title = screen.getByText('Title')
    expect(title.tagName).toBe('H3')
  })

  it('renders with correct styling', () => {
    render(<CardTitle>Title</CardTitle>)

    const title = screen.getByText('Title')
    expect(title).toHaveClass('text-xl', 'text-ink-strong')
  })

  it('accepts custom as prop', () => {
    render(<CardTitle as="h2">Title</CardTitle>)

    const title = screen.getByText('Title')
    expect(title.tagName).toBe('H2')
  })
})

describe('CardBody', () => {
  it('renders children correctly', () => {
    render(<CardBody>Body content</CardBody>)

    expect(screen.getByText('Body content')).toBeInTheDocument()
  })

  it('applies correct styling', () => {
    render(<CardBody>Body</CardBody>)

    const body = screen.getByText('Body')
    expect(body).toHaveClass('p-6')
  })
})

describe('CardFooter', () => {
  it('renders children correctly', () => {
    render(<CardFooter>Footer content</CardFooter>)

    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('applies correct styling', () => {
    render(<CardFooter>Footer</CardFooter>)

    const footer = screen.getByText('Footer')
    expect(footer).toHaveClass('border-t', 'border-line')
  })

  it('applies custom className', () => {
    render(<CardFooter className="custom-footer">Footer</CardFooter>)

    expect(screen.getByText('Footer')).toHaveClass('custom-footer')
  })
})

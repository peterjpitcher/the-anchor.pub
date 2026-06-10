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

  it('renders different variants', () => {
    const { rerender } = render(
      <Card variant="default" testId="card">
        <CardBody>Default</CardBody>
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('border', 'border-anchor-gold-dark/20')
    
    rerender(
      <Card variant="outlined" testId="card">
        <CardBody>Outlined</CardBody>
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('border-2', 'border-anchor-gold-dark/40')
    
    rerender(
      <Card variant="elevated" testId="card">
        <CardBody>Elevated</CardBody>
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('shadow-[0_16px_40px_rgba(0,0,0,0.4)]')
  })

  it('renders with different padding options', () => {
    const { rerender } = render(
      <Card padding="none" testId="card">
        <CardBody>No padding</CardBody>
      </Card>
    )
    expect(screen.getByTestId('card').className).not.toMatch(/\bp-\d/)
    
    rerender(
      <Card padding="sm" testId="card">
        <CardBody>Small padding</CardBody>
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('p-4')
    
    rerender(
      <Card padding="lg" testId="card">
        <CardBody>Large padding</CardBody>
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('p-8')
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
    expect(header).toHaveClass('border-b', 'border-anchor-gold-dark/15')
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
    expect(title).toHaveClass('text-lg', 'font-semibold', 'text-anchor-cream-text')
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
    expect(body).toHaveClass('px-6', 'py-4')
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
    expect(footer).toHaveClass('border-t', 'border-anchor-gold-dark/15')
  })

  it('applies custom className', () => {
    render(<CardFooter className="custom-footer">Footer</CardFooter>)
    
    expect(screen.getByText('Footer')).toHaveClass('custom-footer')
  })
})

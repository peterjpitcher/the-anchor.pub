import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-anchor-gold')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-anchor-bg-card')
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-sm')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-lg')
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state correctly', () => {
    render(<Button loading>Loading</Button>)
    
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveTextContent('Loading...')
    expect(screen.getByRole('button').querySelector('svg')).toHaveClass('animate-spin')
  })

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders with icon on the left', () => {
    const icon = <span data-testid="icon">→</span>
    render(<Button icon={icon} iconPosition="left">With Icon</Button>)
    
    const button = screen.getByRole('button')
    const iconElement = screen.getByTestId('icon')
    
    expect(button).toContainElement(iconElement)
    expect(iconElement.parentElement).toHaveClass('mr-2')
  })

  it('renders with icon on the right', () => {
    const icon = <span data-testid="icon">→</span>
    render(<Button icon={icon} iconPosition="right">With Icon</Button>)
    
    const button = screen.getByRole('button')
    const iconElement = screen.getByTestId('icon')
    
    expect(button).toContainElement(iconElement)
    expect(iconElement.parentElement).toHaveClass('ml-2')
  })

  it('applies full width class when fullWidth is true', () => {
    render(<Button fullWidth>Full Width</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Button ref={ref}>Button</Button>)
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement))
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('passes through native button props', () => {
    render(
      <Button 
        type="submit" 
        form="test-form"
        aria-label="Submit form"
      >
        Submit
      </Button>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('form', 'test-form')
    expect(button).toHaveAttribute('aria-label', 'Submit form')
  })

  it('applies styles to child when using asChild', () => {
    render(
      <Button asChild variant="primary">
        <a href="#test">Link Button</a>
      </Button>
    )

    const link = screen.getByRole('link', { name: 'Link Button' })
    expect(link).toHaveClass('bg-anchor-gold')
    expect(link).toHaveClass('inline-flex')
  })

  it('handles click events when using asChild', async () => {
    const handleClick = jest.fn((event: React.MouseEvent) => {
      event.preventDefault()
    })
    render(
      <Button asChild onClick={handleClick}>
        <a href="#test">Link Button</a>
      </Button>
    )
    
    await userEvent.click(screen.getByRole('link', { name: 'Link Button' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('renders as a pill with a transparent border', () => {
    render(<Button>Reserve a table</Button>)

    expect(screen.getByRole('button')).toHaveClass(
      'rounded-pill',
      'border-2',
      'border-transparent',
      'whitespace-nowrap'
    )
  })

  it('with wrap, lets a long label fit a phone, where one line was cut off by the screen', () => {
    // The page clips sideways overflow, so a label that cannot wrap is not
    // scrolled to, it is lost. Found by the 320px reflow check on six pages.
    render(<Button wrap>Get Directions from Slough Cemetery and Crematorium</Button>)
    const button = screen.getByRole('button')

    // Less side padding first, so most of these still take one line at 390px.
    expect(button).toHaveClass('max-sm:px-4')
    // Then wrapping: centred (a link's lines are left-aligned otherwise) and
    // kept off the border.
    expect(button).toHaveClass('max-sm:whitespace-normal', 'max-sm:text-center', 'max-sm:py-2')
    // Still one line, at full padding, from 640px up.
    expect(button).toHaveClass('whitespace-nowrap', 'px-8')
  })

  it('gives the same wrapping to a link rendered through asChild', () => {
    render(
      <Button asChild wrap>
        <a href="/christmas-parties">See the Christmas menu and prices</a>
      </Button>
    )
    const link = screen.getByRole('link')

    expect(link).toHaveClass('max-sm:whitespace-normal', 'max-sm:text-center', 'max-sm:px-4')
    // The flag is for the stylesheet. It must not reach the element.
    expect(link).not.toHaveAttribute('wrap')
  })

  it('leaves a button that did not ask for it exactly as it was', () => {
    // Tried as the default, wrapping changed buttons that fitted: any label
    // reaching into its side padding went to two lines, and vertical padding
    // made every button that already wrapped 16px taller at every width.
    render(<Button>Book a table</Button>)
    const button = screen.getByRole('button')

    expect(button.className.split(/\s+/).filter((name) => name.startsWith('max-sm:'))).toEqual([])
    expect(button).not.toHaveAttribute('wrap')
  })

  it('lets a caller narrow the phone padding further than wrap does', () => {
    // The sticky bar does this for its main button.
    render(<Button wrap className="max-sm:px-2">Enquire about your date</Button>)
    const button = screen.getByRole('button')

    expect(button).toHaveClass('max-sm:px-2')
    expect(button).not.toHaveClass('max-sm:px-4')
  })

  it('applies the three variant styles correctly', () => {
    // Primary is the AA-safe gold-dark fill (#8b6914 on white = 5.08:1).
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-anchor-gold-dark', 'text-white')
    expect(screen.getByRole('button')).toHaveClass('hover:bg-anchor-green', 'hover:shadow-gold')

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border-accent', 'text-accent')

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-ink')
  })

  it('applies the three size styles correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('min-h-[44px]', 'px-6', 'text-sm')

    rerender(<Button size="md">Medium</Button>)
    expect(screen.getByRole('button')).toHaveClass('min-h-[48px]', 'px-8', 'text-base')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('min-h-[56px]', 'px-12', 'text-lg')
  })

  it('defaults to the primary variant at medium size', () => {
    render(<Button>Default</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-anchor-gold-dark', 'min-h-[48px]')
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
    expect(link).toHaveClass('bg-anchor-gold-dark')
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

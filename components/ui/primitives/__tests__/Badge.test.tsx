import { render, screen } from '@/lib/test-utils'
import { Badge } from '../Badge'

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Label</Badge>)
    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('defaults to the green variant', () => {
    render(<Badge testId="badge">Green</Badge>)
    expect(screen.getByTestId('badge')).toHaveClass('bg-anchor-green', 'text-white')
  })

  it('renders each of the six variants', () => {
    const cases: Array<[Parameters<typeof Badge>[0]['variant'], string]> = [
      ['green', 'bg-anchor-green'],
      // anchor-gold-dark, not anchor-gold. White on #a57626 is 4.02:1, under
      // AA, and Button had already rejected that exact fill for the same
      // reason. anchor-gold-dark takes white to 5.59:1.
      ['gold', 'bg-anchor-gold-dark'],
      // The sand variant is theme-aware: warm cream on light, gold at low
      // opacity on the dark season's green. Both live behind --tile.
      ['sand', 'bg-tile'],
      ['outline', 'border-line-strong'],
      ['success', 'text-anchor-success'],
      ['danger', 'text-anchor-danger']
    ]
    const { rerender } = render(<Badge variant="green" testId="badge">x</Badge>)
    for (const [variant, cls] of cases) {
      rerender(<Badge variant={variant} testId="badge">x</Badge>)
      expect(screen.getByTestId('badge')).toHaveClass(cls)
    }
  })

  it('is a pill with Outfit 600 at text-xs', () => {
    render(<Badge testId="badge">Pill</Badge>)
    expect(screen.getByTestId('badge')).toHaveClass('rounded-pill', 'font-sans', 'font-semibold', 'text-xs')
  })

  it('renders a dot before the label when dot is set', () => {
    const { container } = render(<Badge dot>With dot</Badge>)
    const dot = container.querySelector('span[aria-hidden="true"]')
    expect(dot).not.toBeNull()
    expect(dot).toHaveClass('bg-current', 'rounded-full')
  })

  it('does not render a dot by default', () => {
    const { container } = render(<Badge>No dot</Badge>)
    expect(container.querySelector('span[aria-hidden="true"]')).toBeNull()
  })

  it('applies custom className', () => {
    render(<Badge className="custom" testId="badge">x</Badge>)
    expect(screen.getByTestId('badge')).toHaveClass('custom')
  })
})

import { render, screen } from '@testing-library/react'
import { 
  Spinner, 
  Skeleton, 
  LoadingOverlay, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonTable,
  SkeletonAvatar 
} from '../Loading'

describe('Spinner', () => {
  it('renders with default props', () => {
    render(<Spinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('h-6', 'w-6') // Default size md
    expect(spinner).toHaveClass('text-anchor-gold') // Default colour primary
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Spinner size="sm" />)
    expect(screen.getByRole('status')).toHaveClass('h-4', 'w-4')
    
    rerender(<Spinner size="lg" />)
    expect(screen.getByRole('status')).toHaveClass('h-8', 'w-8')
  })

  it('renders with different colours', () => {
    const { rerender } = render(<Spinner color="secondary" />)
    expect(screen.getByRole('status')).toHaveClass('text-anchor-cream-text')
    
    rerender(<Spinner color="white" />)
    expect(screen.getByRole('status')).toHaveClass('text-white')
  })

  it('includes screen reader label', () => {
    render(<Spinner label="Loading data" />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Loading data')
  })

  it('renders with custom className', () => {
    render(<Spinner className="custom-class" />)
    
    expect(screen.getByRole('status')).toHaveClass('custom-class')
  })
})

describe('Skeleton', () => {
  it('renders single skeleton with default props', () => {
    render(<Skeleton />)
    
    const skeleton = screen.getByRole('status')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('animate-pulse', 'bg-anchor-bg-raised', 'rounded')
    expect(skeleton).toHaveClass('w-full') // Default width
  })

  it('renders multiple skeletons when count > 1', () => {
    render(<Skeleton count={3} />)
    
    const skeletons = screen.getAllByRole('status')
    expect(skeletons).toHaveLength(3)
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Skeleton variant="text" />)
    expect(screen.getByRole('status')).toHaveClass('h-4')
    
    rerender(<Skeleton variant="circular" />)
    expect(screen.getByRole('status')).toHaveClass('rounded-full')
    
    rerender(<Skeleton variant="title" />)
    expect(screen.getByRole('status')).toHaveClass('h-8')
  })

  it('renders with different widths', () => {
    const { rerender } = render(<Skeleton width="sm" />)
    expect(screen.getByRole('status')).toHaveClass('w-20')
    
    rerender(<Skeleton width="lg" />)
    expect(screen.getByRole('status')).toHaveClass('w-60')
  })

  it('applies spacing between multiple skeletons', () => {
    const { container } = render(<Skeleton count={2} spacing="lg" />)
    
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('space-y-4')
  })

  it('has proper accessibility attributes', () => {
    render(<Skeleton />)
    
    const skeleton = screen.getByRole('status')
    expect(skeleton).toHaveAttribute('aria-label', 'Loading')
  })
})

describe('LoadingOverlay', () => {
  const getOverlay = () => {
    const overlays = screen.getAllByRole('status')
    const overlay = overlays.find(element => element.getAttribute('aria-live') === 'polite')
    if (!overlay) {
      throw new Error('Overlay element not found')
    }
    return overlay
  }

  it('renders when visible', () => {
    render(<LoadingOverlay visible={true} />)

    expect(getOverlay()).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('does not render when not visible', () => {
    render(<LoadingOverlay visible={false} />)
    
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders with custom message', () => {
    render(<LoadingOverlay visible={true} message="Please wait..." />)
    
    expect(screen.getByText('Please wait...')).toBeInTheDocument()
  })

  it('applies blur effect by default', () => {
    render(<LoadingOverlay visible={true} />)

    expect(getOverlay()).toHaveClass('backdrop-blur-sm')
  })

  it('can disable blur effect', () => {
    render(<LoadingOverlay visible={true} blur={false} />)

    expect(getOverlay()).not.toHaveClass('backdrop-blur-sm')
  })

  it('renders fullscreen when specified', () => {
    render(<LoadingOverlay visible={true} fullScreen={true} />)

    expect(getOverlay()).toHaveClass('fixed', 'inset-0', 'z-50')
  })

  it('renders as absolute overlay by default', () => {
    render(<LoadingOverlay visible={true} fullScreen={false} />)

    expect(getOverlay()).toHaveClass('absolute', 'inset-0', 'z-10')
  })

  it('has proper ARIA attributes', () => {
    render(<LoadingOverlay visible={true} />)

    const overlay = getOverlay()
    expect(overlay).toHaveAttribute('aria-live', 'polite')
  })
})

describe('Skeleton Presets', () => {
  it('renders SkeletonText with specified lines', () => {
    render(<SkeletonText lines={5} />)
    
    const skeletons = screen.getAllByRole('status')
    expect(skeletons).toHaveLength(5)
  })

  it('renders SkeletonCard with proper structure', () => {
    const { container } = render(<SkeletonCard />)
    
    expect(container.querySelector('.rounded-none.border')).toBeInTheDocument()
    expect(screen.getAllByRole('status')).toHaveLength(5) // Header + 2 text lines + 2 buttons
  })

  it('renders SkeletonTable with correct grid', () => {
    render(<SkeletonTable rows={3} columns={4} />)
    
    // 4 headers + (3 rows * 4 columns) = 16 total skeletons
    const skeletons = screen.getAllByRole('status')
    expect(skeletons).toHaveLength(16)
  })

  it('renders SkeletonAvatar with correct size', () => {
    const { rerender } = render(<SkeletonAvatar size="sm" />)
    expect(screen.getByRole('status')).toHaveClass('h-8', 'w-8')
    
    rerender(<SkeletonAvatar size="lg" />)
    expect(screen.getByRole('status')).toHaveClass('h-16', 'w-16')
  })
})

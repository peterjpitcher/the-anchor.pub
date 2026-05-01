import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { Toast, ToastProvider, useToast } from '../Toast'

// Test component that uses useToast hook
const ToastTrigger = ({ variant }: { variant?: string }) => {
  const { toast } = useToast()
  
  return (
    <button 
      onClick={() => toast({ 
        title: 'Test toast',
        description: 'Test description',
        variant: variant as any 
      })}
    >
      Show Toast
    </button>
  )
}

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  })

  it('renders toast when triggered', async () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    )
    
    fireEvent.click(screen.getByText('Show Toast'))
    
    expect(await screen.findByText('Test toast')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('auto-dismisses after duration', async () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    )
    
    fireEvent.click(screen.getByText('Show Toast'))
    
    expect(await screen.findByText('Test toast')).toBeInTheDocument()
    
    act(() => {
      jest.advanceTimersByTime(5000) // Default duration
    })
    
    await waitFor(() => {
      expect(screen.queryByText('Test toast')).not.toBeInTheDocument()
    })
  })

  it('can be manually dismissed', async () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    )
    
    fireEvent.click(screen.getByText('Show Toast'))
    
    const closeButton = await screen.findByLabelText('Close notification')
    fireEvent.click(closeButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Test toast')).not.toBeInTheDocument()
    })
  })

  it('renders different variants', async () => {
    const { rerender } = render(
      <ToastProvider>
        <ToastTrigger variant="success" />
      </ToastProvider>
    )
    
    fireEvent.click(screen.getByText('Show Toast'))
    
    const toast = await screen.findByRole('alert')
    expect(toast).toHaveClass('bg-anchor-bg-card', 'text-anchor-gold-vivid')
  })

  it('shows action button when provided', () => {
    const handleAction = jest.fn()
    
    render(
      <Toast
        id="1"
        title="Test toast"
        action={{
          label: 'Undo',
          onClick: handleAction
        }}
      />
    )
    
    const actionButton = screen.getByText('Undo')
    expect(actionButton).toBeInTheDocument()
    
    fireEvent.click(actionButton)
    expect(handleAction).toHaveBeenCalledTimes(1)
  })

  it('respects max toasts limit', async () => {
    render(
      <ToastProvider maxToasts={2}>
        <ToastTrigger />
      </ToastProvider>
    )
    
    // Show 3 toasts
    const button = screen.getByText('Show Toast')
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    
    await waitFor(() => {
      const toasts = screen.getAllByRole('alert')
      expect(toasts).toHaveLength(2) // Only 2 should be visible
    })
  })

  it('renders toast with custom icon', () => {
    render(
      <Toast
        id="1"
        title="Test toast"
        icon={<span data-testid="custom-icon">🎉</span>}
      />
    )
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('has proper ARIA attributes', () => {
    render(
      <Toast
        id="1"
        title="Test toast"
        description="Test description"
      />
    )
    
    const toast = screen.getByRole('alert')
    expect(toast).toHaveAttribute('aria-live', 'polite')
  })
})

describe('ToastProvider', () => {
  it('provides toast context to children', () => {
    let toastFunction: any
    
    const TestComponent = () => {
      const { toast } = useToast()
      toastFunction = toast
      return null
    }
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    
    expect(toastFunction).toBeDefined()
    expect(typeof toastFunction).toBe('function')
  })

  it('throws error when useToast is used outside provider', () => {
    const TestComponent = () => {
      useToast()
      return null
    }
    
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    expect(() => render(<TestComponent />)).toThrow('useToast must be used within ToastProvider')
    
    consoleSpy.mockRestore()
  })

  it('can dismiss all toasts', async () => {
    let dismissAllFunction: any
    
    const TestComponent = () => {
      const { toast, dismissAll } = useToast()
      dismissAllFunction = dismissAll
      
      return (
        <>
          <button onClick={() => toast({ title: 'Toast 1' })}>Toast 1</button>
          <button onClick={() => toast({ title: 'Toast 2' })}>Toast 2</button>
          <button onClick={dismissAll}>Dismiss All</button>
        </>
      )
    }
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    
    // Show 2 toasts
    fireEvent.click(screen.getByText('Toast 1'))
    fireEvent.click(screen.getByText('Toast 2'))
    
    await waitFor(() => {
      expect(screen.getAllByRole('alert')).toHaveLength(2)
    })
    
    // Dismiss all
    fireEvent.click(screen.getByText('Dismiss All'))
    
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})

'use client'

import { forwardRef, useEffect, useState, createContext, useContext, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from '../types'

const toastVariants = cva(
  'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'bg-anchor-green-card text-anchor-cream-text border border-anchor-gold-dark/15',
        success: 'bg-anchor-green-card text-anchor-gold-bright border border-anchor-gold-dark/15',
        error: 'bg-anchor-green-card text-red-400 border border-red-500/20',
        warning: 'bg-anchor-green-card text-yellow-300 border border-yellow-500/20',
        info: 'bg-anchor-green-card text-anchor-cream-text border border-anchor-gold-dark/15'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

const toastPositionVariants = cva(
  'fixed z-50 flex flex-col gap-2 p-4',
  {
    variants: {
      position: {
        'top-left': 'top-0 left-0',
        'top-center': 'top-0 left-1/2 -translate-x-1/2',
        'top-right': 'top-0 right-0',
        'bottom-left': 'bottom-0 left-0',
        'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
        'bottom-right': 'bottom-0 right-0'
      }
    },
    defaultVariants: {
      position: 'bottom-right'
    }
  }
)

export interface ToastProps 
  extends BaseComponentProps,
    VariantProps<typeof toastVariants> {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
  onClose?: () => void
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ 
    className,
    variant,
    id,
    title,
    description,
    icon,
    action,
    duration = 5000,
    onClose,
    testId,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = useState(true)
    const [isExiting, setIsExiting] = useState(false)

    // Auto dismiss
    useEffect(() => {
      if (duration === Infinity) return

      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duration])

    const handleClose = () => {
      setIsExiting(true)
      setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, 300) // Match animation duration
    }

    if (!isVisible) return null

    return (
      <div
        ref={ref}
        className={cn(
          toastVariants({ variant }),
          isExiting && 'opacity-0 translate-x-full',
          'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
          className
        )}
        role="alert"
        aria-live="polite"
        data-testid={testId}
        {...props}
      >
        <div className="flex p-4">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">
              {title}
            </p>
            {description && (
              <p className="mt-1 text-sm opacity-90">
                {description}
              </p>
            )}
            {action && (
              <button
                type="button"
                className="mt-2 text-sm font-medium underline hover:no-underline"
                onClick={action.onClick}
              >
                {action.label}
              </button>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md text-anchor-cream-text/55 hover:text-anchor-cream-text focus:outline-none focus:ring-2 focus:ring-anchor-gold-dark focus:ring-offset-2"
              onClick={handleClose}
              aria-label="Close notification"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }
)

Toast.displayName = 'Toast'

// Toast Context and Provider
interface ToastItem extends Omit<ToastProps, 'id' | 'onClose'> {
  id: string
}

interface ToastContextValue {
  toast: (props: Omit<ToastItem, 'id'>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

interface ToastProviderProps extends VariantProps<typeof toastPositionVariants> {
  children: React.ReactNode
  maxToasts?: number
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  position = 'bottom-right',
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [mounted, setMounted] = useState(false)
  const idCounterRef = useRef(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toast = useCallback((props: Omit<ToastItem, 'id'>) => {
    idCounterRef.current += 1
    const id = `${Date.now()}-${idCounterRef.current}`
    const newToast: ToastItem = { ...props, id }

    setToasts((prev) => {
      const updated = [...prev, newToast]
      // Limit number of toasts
      return updated.slice(-maxToasts)
    })
  }, [maxToasts])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss, dismissAll }}>
      {children}
      {mounted && createPortal(
        <div className={cn(toastPositionVariants({ position }))}>
          {toasts.map((toastItem) => (
            <Toast
              key={toastItem.id}
              {...toastItem}
              onClose={() => dismiss(toastItem.id)}
            />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

// Preset toast functions - These should be called from within React components
export const createToastHelpers = (toastFn: (props: Omit<ToastItem, 'id'>) => void) => ({
  success: (title: string, description?: string) => {
    toastFn({
      variant: 'success',
      title,
      description,
      icon: (
        <svg className="h-5 w-5 text-anchor-gold-bright" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    })
  },
  error: (title: string, description?: string) => {
    toastFn({
      variant: 'error',
      title,
      description,
      icon: (
        <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    })
  },
  warning: (title: string, description?: string) => {
    toastFn({
      variant: 'warning',
      title,
      description,
      icon: (
        <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    })
  },
  info: (title: string, description?: string) => {
    toastFn({
      variant: 'info',
      title,
      description,
      icon: (
        <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    })
  }
})

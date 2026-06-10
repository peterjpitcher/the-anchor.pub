import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from '../types'

// Spinner Component
const spinnerVariants = cva(
  'animate-spin',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12'
      },
      color: {
        primary: 'text-anchor-gold-dark',
        secondary: 'text-anchor-cream-text',
        white: 'text-white',
        current: 'text-current'
      }
    },
    defaultVariants: {
      size: 'md',
      color: 'primary'
    }
  }
)

export interface SpinnerProps 
  extends BaseComponentProps,
    VariantProps<typeof spinnerVariants> {
  label?: string
}

export const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, color, label = 'Loading', testId, ...props }, ref) => {
    return (
      <div className="inline-flex flex-col items-center gap-2">
        <svg
          ref={ref}
          className={cn(spinnerVariants({ size, color }), className)}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label={label}
          role="status"
          data-testid={testId}
          {...props}
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {label && (
          <span className="sr-only">{label}</span>
        )}
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'

// Skeleton Component
const skeletonVariants = cva(
  'animate-pulse bg-anchor-green-raised rounded',
  {
    variants: {
      variant: {
        text: 'h-4',
        title: 'h-8',
        rectangular: '',
        circular: 'rounded-full',
        rounded: 'rounded-lg'
      },
      width: {
        sm: 'w-20',
        md: 'w-40',
        lg: 'w-60',
        full: 'w-full'
      },
      height: {
        sm: 'h-10',
        md: 'h-20',
        lg: 'h-40',
        auto: ''
      }
    },
    defaultVariants: {
      variant: 'rectangular',
      width: 'full'
    }
  }
)

export interface SkeletonProps 
  extends BaseComponentProps,
    VariantProps<typeof skeletonVariants> {
  count?: number
  spacing?: 'sm' | 'md' | 'lg'
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant, 
    width, 
    height,
    count = 1,
    spacing = 'md',
    testId,
    ...props 
  }, ref) => {
    const spacingClasses = {
      sm: 'space-y-2',
      md: 'space-y-3',
      lg: 'space-y-4'
    }

    if (count === 1) {
      return (
        <div
          ref={ref}
          className={cn(skeletonVariants({ variant, width, height }), className)}
          role="status"
          aria-label="Loading"
          data-testid={testId}
          {...props}
        />
      )
    }

    return (
      <div className={spacingClasses[spacing]} ref={ref}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn(skeletonVariants({ variant, width, height }), className)}
            role="status"
            aria-label="Loading"
            data-testid={`${testId}-${index}`}
            {...props}
          />
        ))}
      </div>
    )
  }
)

Skeleton.displayName = 'Skeleton'

// Loading Overlay Component
export interface LoadingOverlayProps extends BaseComponentProps {
  visible: boolean
  message?: string
  blur?: boolean
  fullScreen?: boolean
}

export const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ 
    className,
    visible,
    message = 'Loading...',
    blur = true,
    fullScreen = false,
    testId,
    ...props 
  }, ref) => {
    if (!visible) return null

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center bg-anchor-green-deep/80',
          blur && 'backdrop-blur-sm',
          fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0 z-10',
          className
        )}
        role="status"
        aria-live="polite"
        data-testid={testId}
        {...props}
      >
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          {message && (
            <p className="text-sm font-medium text-anchor-cream-text/70">{message}</p>
          )}
        </div>
      </div>
    )
  }
)

LoadingOverlay.displayName = 'LoadingOverlay'

// Skeleton Preset Components
export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <Skeleton variant="text" width="full" count={lines} />
)

export const SkeletonCard: React.FC = () => (
  <div className="rounded-none border border-anchor-gold-dark/15 p-4 space-y-3 bg-anchor-green-card">
    <Skeleton variant="rectangular" width="md" height="sm" />
    <Skeleton variant="text" count={2} />
    <div className="flex gap-2">
      <Skeleton variant="rounded" width="sm" className="h-8" />
      <Skeleton variant="rounded" width="sm" className="h-8" />
    </div>
  </div>
)

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="space-y-2">
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} variant="text" className="h-6" />
      ))}
    </div>
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" />
          ))}
        </div>
      ))}
    </div>
  </div>
)

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }
  
  return <Skeleton variant="circular" className={sizeClasses[size]} />
}
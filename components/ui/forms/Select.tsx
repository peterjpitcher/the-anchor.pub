import { forwardRef, SelectHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps, WithChildren } from '../types'
import { ChevronDownIcon } from '../Icon'

const selectVariants = cva(
  'flex w-full appearance-none rounded-md border bg-anchor-bg-card px-3 py-2 pr-10 text-base text-anchor-cream-text ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-anchor-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
  {
    variants: {
      variant: {
        default: 'border-anchor-gold/30 focus:border-anchor-gold',
        error: 'border-red-500 focus:border-red-500 focus-visible:ring-red-500',
        success: 'border-green-500 focus:border-green-500 focus-visible:ring-green-500'
      },
      size: {
        sm: 'h-8 text-sm',
        md: 'h-10',
        lg: 'h-12 text-lg'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

export interface SelectProps
  extends BaseComponentProps,
    WithChildren,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'className'>,
    VariantProps<typeof selectVariants> {
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, size, error, testId, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            selectVariants({ variant: error ? 'error' : variant, size }),
            className
          )}
          ref={ref}
          data-testid={testId}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDownIcon className="h-4 w-4 text-anchor-cream-text/55" aria-hidden="true" />
        </div>
      </div>
    )
  }
)
Select.displayName = 'Select'
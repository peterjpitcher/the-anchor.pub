import { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps, WithChildren } from '../types'

const badgeVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-anchor-gold/10 text-anchor-gold',
        secondary: 'bg-anchor-green/10 text-anchor-green',
        outline: 'border border-gray-300 text-gray-700 bg-transparent',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800'
      },
      size: {
        sm: 'px-2 py-0.5 text-sm sm:text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base'
      },
      dot: {
        true: 'pl-1.5',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      dot: false
    }
  }
)

export interface BadgeProps 
  extends BaseComponentProps,
    WithChildren,
    Omit<HTMLAttributes<HTMLSpanElement>, 'className'>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    className,
    variant,
    size,
    dot,
    children,
    testId,
    ...props 
  }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, dot }), className)}
        data-testid={testId}
        {...props}
      >
        {dot && (
          <span 
            className={cn(
              'rounded-full bg-current',
              size === 'sm' && 'w-1.5 h-1.5 mr-1',
              size === 'md' && 'w-2 h-2 mr-1.5',
              size === 'lg' && 'w-2.5 h-2.5 mr-2'
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

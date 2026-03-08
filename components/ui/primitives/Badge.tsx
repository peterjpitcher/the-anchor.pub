import { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps, WithChildren } from '../types'

const badgeVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-anchor-bg-raised text-anchor-cream-text',
        primary: 'bg-anchor-gold/10 text-anchor-gold',
        secondary: 'bg-anchor-bg-raised text-anchor-cream-text',
        outline: 'border border-anchor-gold/15 text-anchor-cream-text/70 bg-transparent',
        success: 'bg-anchor-gold-vivid/15 text-anchor-gold-vivid',
        warning: 'bg-yellow-900/30 text-yellow-300',
        error: 'bg-red-900/30 text-red-300'
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

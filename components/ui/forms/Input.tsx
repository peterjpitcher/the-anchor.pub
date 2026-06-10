import { forwardRef, InputHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from '../types'

const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:border-anchor-gold-dark',
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

export interface InputProps
  extends BaseComponentProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'className'>,
    VariantProps<typeof inputVariants> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, error, testId, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          inputVariants({ variant: error ? 'error' : variant, size }),
          className
        )}
        ref={ref}
        data-testid={testId}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
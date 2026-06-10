import { forwardRef, TextareaHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from '../types'

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-colors',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:border-anchor-gold-dark',
        error: 'border-red-500 focus:border-red-500 focus-visible:ring-red-500',
        success: 'border-green-500 focus:border-green-500 focus-visible:ring-green-500'
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

export interface TextareaProps
  extends BaseComponentProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>,
    VariantProps<typeof textareaVariants> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, error, testId, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          textareaVariants({ variant: error ? 'error' : variant, size }),
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
Textarea.displayName = 'Textarea'
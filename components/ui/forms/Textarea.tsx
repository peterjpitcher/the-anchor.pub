import { forwardRef, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from '../types'
import { fieldControlClass, fieldInvalidClass } from '../primitives/Input'

export interface TextareaProps
  extends BaseComponentProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, testId, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          fieldControlClass,
          'resize-y min-h-[80px]',
          error && fieldInvalidClass,
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

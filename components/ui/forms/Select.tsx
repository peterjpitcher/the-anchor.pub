import { forwardRef, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps, WithChildren } from '../types'
import { ChevronDownIcon } from '../Icon'
import { fieldControlClass, fieldInvalidClass } from '../primitives/Input'

export interface SelectProps
  extends BaseComponentProps,
    WithChildren,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'className'> {
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, testId, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            fieldControlClass,
            'appearance-none pr-10',
            error && fieldInvalidClass,
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
          <ChevronDownIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />
        </div>
      </div>
    )
  }
)
Select.displayName = 'Select'

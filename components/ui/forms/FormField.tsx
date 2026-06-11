import { forwardRef, ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps, WithChildren } from '../types'
// Remove icon for now to fix build
// import { AlertCircleIcon } from '../Icon'

export interface FormFieldProps
  extends BaseComponentProps,
    WithChildren,
    Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  error?: string
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, children, error, testId, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        data-testid={testId}
        {...props}
      >
        {children}
        {error && (
          <p 
            className="flex items-center gap-1 text-sm text-anchor-danger"
            role="alert"
            aria-live="polite"
            id={`${testId || 'field'}-error`}
          >
            {/* Icon removed temporarily */}
            {error}
          </p>
        )}
      </div>
    )
  }
)
FormField.displayName = 'FormField'

export interface FormLabelProps
  extends BaseComponentProps,
    WithChildren,
    React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, required, testId, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-sm font-medium text-ink',
          className
        )}
        data-testid={testId}
        {...props}
      >
        {children}
        {required && <span className="ml-1 text-anchor-danger">*</span>}
      </label>
    )
  }
)
FormLabel.displayName = 'FormLabel'

export interface FormHelpTextProps
  extends BaseComponentProps,
    WithChildren,
    HTMLAttributes<HTMLParagraphElement> {}

export const FormHelpText = forwardRef<HTMLParagraphElement, FormHelpTextProps>(
  ({ className, children, testId, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-ink-muted', className)}
        data-testid={testId}
        {...props}
      >
        {children}
      </p>
    )
  }
)
FormHelpText.displayName = 'FormHelpText'

export interface FormProps
  extends BaseComponentProps,
    WithChildren,
    React.FormHTMLAttributes<HTMLFormElement> {}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ className, children, testId, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn('space-y-6', className)}
        data-testid={testId}
        {...props}
      >
        {children}
      </form>
    )
  }
)
Form.displayName = 'Form'

export interface FormSectionProps
  extends BaseComponentProps,
    WithChildren,
    HTMLAttributes<HTMLFieldSetElement> {
  title?: string
  description?: string
}

export const FormSection = forwardRef<HTMLFieldSetElement, FormSectionProps>(
  ({ className, title, description, children, testId, ...props }, ref) => {
    return (
      <fieldset
        ref={ref}
        className={cn('space-y-4', className)}
        data-testid={testId}
        {...props}
      >
        {(title || description) && (
          <div>
            {title && (
              <legend className="text-lg font-medium text-ink-strong">
                {title}
              </legend>
            )}
            {description && (
              <p className="mt-1 text-sm text-ink-muted">{description}</p>
            )}
          </div>
        )}
        {children}
      </fieldset>
    )
  }
)
FormSection.displayName = 'FormSection'
'use client'

import { forwardRef, FormHTMLAttributes, createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps, WithChildren } from '../types'

// Form context for managing form state
interface FormContextValue {
  errors: Record<string, string>
  setError: (field: string, message: string) => void
  clearError: (field: string) => void
  clearAllErrors: () => void
  isSubmitting: boolean
  setIsSubmitting: (value: boolean) => void
}

const FormContext = createContext<FormContextValue | undefined>(undefined)

export const useForm = () => {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useForm must be used within a Form component')
  }
  return context
}

export interface FormProps 
  extends BaseComponentProps,
    WithChildren,
    Omit<FormHTMLAttributes<HTMLFormElement>, 'className' | 'onSubmit'> {
  onSubmit?: (data: FormData) => void | Promise<void>
  className?: string
}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ 
    className,
    children,
    onSubmit,
    testId,
    ...props 
  }, ref) => {
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const setError = (field: string, message: string) => {
      setErrors(prev => ({ ...prev, [field]: message }))
    }

    const clearError = (field: string) => {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    const clearAllErrors = () => {
      setErrors({})
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      
      if (onSubmit) {
        setIsSubmitting(true)
        clearAllErrors()
        
        try {
          const formData = new FormData(e.currentTarget)
          await onSubmit(formData)
        } catch (error) {
          console.error('Form submission error:', error)
        } finally {
          setIsSubmitting(false)
        }
      }
    }

    return (
      <FormContext.Provider 
        value={{ 
          errors, 
          setError, 
          clearError, 
          clearAllErrors,
          isSubmitting,
          setIsSubmitting
        }}
      >
        <form
          ref={ref}
          className={cn('space-y-6', className)}
          onSubmit={handleSubmit}
          data-testid={testId}
          noValidate
          {...props}
        >
          {children}
        </form>
      </FormContext.Provider>
    )
  }
)

Form.displayName = 'Form'

// Form Field wrapper for consistent spacing and layout
export interface FormFieldProps extends BaseComponentProps, WithChildren {
  name?: string
  label?: string
  required?: boolean
  error?: string
  helperText?: string
  className?: string
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ 
    name,
    label,
    required,
    error: propError,
    helperText,
    className,
    children,
    testId,
    ...props 
  }, ref) => {
    const form = useContext(FormContext)
    const error = propError || (form && name ? form.errors[name] : undefined)

    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        data-testid={testId}
        {...props}
      >
        {label && (
          <label 
            htmlFor={name}
            className="block text-sm font-medium text-ink"
          >
            {label}
            {required && <span className="text-anchor-danger ml-1">*</span>}
          </label>
        )}
        
        {children}
        
        {error && (
          <p id={`${name}-error`} className="text-sm text-anchor-danger" role="alert">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${name}-helper`} className="text-sm text-ink-muted">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

// Form Section for grouping related fields
export interface FormSectionProps extends BaseComponentProps, WithChildren {
  title?: string
  description?: string
  className?: string
}

export const FormSection = forwardRef<HTMLFieldSetElement, FormSectionProps>(
  ({ 
    title,
    description,
    className,
    children,
    testId,
    ...props 
  }, ref) => {
    return (
      <fieldset
        ref={ref}
        className={cn('space-y-4', className)}
        data-testid={testId}
        {...props}
      >
        {(title || description) && (
          <div className="mb-4">
            {title && (
              <legend className="text-lg font-semibold text-ink-strong">
                {title}
              </legend>
            )}
            {description && (
              <p className="mt-1 text-sm text-ink-muted">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </fieldset>
    )
  }
)

FormSection.displayName = 'FormSection'
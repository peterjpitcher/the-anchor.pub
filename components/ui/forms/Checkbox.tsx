'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from '../types'

const checkboxVariants = cva(
  'rounded border-line text-accent-text focus:ring-2 focus:ring-accent-text focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colours',
  {
    variants: {
      size: {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

export interface CheckboxProps 
  extends BaseComponentProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className' | 'size'>,
    VariantProps<typeof checkboxVariants> {
  label?: string
  error?: string
  helperText?: string
  indeterminate?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    className,
    size,
    label,
    error,
    helperText,
    indeterminate,
    id,
    testId,
    disabled,
    ...props 
  }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-')

    // Handle indeterminate state
    React.useEffect(() => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.indeterminate = indeterminate || false
      }
    }, [indeterminate, ref])

    return (
      <div className="relative">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              className={cn(checkboxVariants({ size }), className)}
              disabled={disabled}
              data-testid={testId}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${checkboxId}-error` : 
                helperText ? `${checkboxId}-helper` : 
                undefined
              }
              {...props}
            />
          </div>
          {label && (
            <div className="ml-3">
              <label 
                htmlFor={checkboxId}
                className={cn(
                  'text-sm font-medium text-ink cursor-pointer',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {label}
              </label>
              {helperText && !error && (
                <p id={`${checkboxId}-helper`} className="text-sm text-ink-muted">
                  {helperText}
                </p>
              )}
            </div>
          )}
        </div>
        {error && (
          <p id={`${checkboxId}-error`} className="mt-1 text-sm text-anchor-danger ml-8">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

// Checkbox Group for managing multiple checkboxes
interface CheckboxOption {
  value: string
  label: string
  disabled?: boolean
  helperText?: string
}

export interface CheckboxGroupProps extends BaseComponentProps {
  label?: string
  options: CheckboxOption[]
  value?: string[]
  onChange?: (values: string[]) => void
  error?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
}

export const CheckboxGroup = forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(
  ({ 
    label,
    options,
    value = [],
    onChange,
    error,
    helperText,
    required,
    disabled,
    orientation = 'vertical',
    testId,
    ...props 
  }, ref) => {
    const handleCheckboxChange = (optionValue: string, checked: boolean) => {
      if (!onChange) return
      
      if (checked) {
        onChange([...value, optionValue])
      } else {
        onChange(value.filter(v => v !== optionValue))
      }
    }

    return (
      <fieldset
        ref={ref}
        className="space-y-2"
        data-testid={testId}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${testId}-error` : 
          helperText ? `${testId}-helper` : 
          undefined
        }
        {...props}
      >
        {label && (
          <legend className="text-sm font-medium text-ink mb-2">
            {label}
            {required && <span className="text-anchor-danger ml-1">*</span>}
          </legend>
        )}
        
        {helperText && !error && (
          <p id={`${testId}-helper`} className="text-sm text-ink-muted mb-2">
            {helperText}
          </p>
        )}
        
        <div className={cn(
          'space-y-2',
          orientation === 'horizontal' && 'flex flex-wrap gap-4 space-y-0'
        )}>
          {options.map(option => (
            <Checkbox
              key={option.value}
              id={`${testId}-${option.value}`}
              name={testId}
              value={option.value}
              label={option.label}
              helperText={option.helperText}
              checked={value.includes(option.value)}
              onChange={e => handleCheckboxChange(option.value, e.target.checked)}
              disabled={disabled || option.disabled}
            />
          ))}
        </div>
        
        {error && (
          <p id={`${testId}-error`} className="mt-2 text-sm text-anchor-danger">
            {error}
          </p>
        )}
      </fieldset>
    )
  }
)

CheckboxGroup.displayName = 'CheckboxGroup'

// Import React for useEffect
import React from 'react'
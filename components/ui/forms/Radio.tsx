'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from '../types'

const radioVariants = cva(
  'rounded-full border-gray-300 text-anchor-gold-dark focus:ring-2 focus:ring-anchor-gold-dark focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors',
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

export interface RadioProps 
  extends BaseComponentProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className' | 'size'>,
    VariantProps<typeof radioVariants> {
  label?: string
  error?: string
  helperText?: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ 
    className,
    size,
    label,
    error,
    helperText,
    id,
    testId,
    disabled,
    ...props 
  }, ref) => {
    const radioId = id || `${props.name}-${props.value}`

    return (
      <div className="relative">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={ref}
              id={radioId}
              type="radio"
              className={cn(radioVariants({ size }), className)}
              disabled={disabled}
              data-testid={testId}
              aria-describedby={
                error ? `${radioId}-error` : 
                helperText ? `${radioId}-helper` : 
                undefined
              }
              {...props}
            />
          </div>
          {label && (
            <div className="ml-3">
              <label 
                htmlFor={radioId}
                className={cn(
                  'text-sm font-medium text-anchor-cream-text/70 cursor-pointer',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {label}
              </label>
              {helperText && !error && (
                <p id={`${radioId}-helper`} className="text-sm text-anchor-cream-text/70">
                  {helperText}
                </p>
              )}
            </div>
          )}
        </div>
        {error && (
          <p id={`${radioId}-error`} className="mt-1 text-sm text-red-600 ml-8">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Radio.displayName = 'Radio'

// Radio Group for managing multiple radio buttons
interface RadioOption {
  value: string
  label: string
  disabled?: boolean
  helperText?: string
}

export interface RadioGroupProps extends BaseComponentProps {
  name: string
  label?: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  error?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
}

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  ({ 
    name,
    label,
    options,
    value,
    onChange,
    error,
    helperText,
    required,
    disabled,
    orientation = 'vertical',
    size = 'md',
    testId,
    ...props 
  }, ref) => {
    const handleRadioChange = (optionValue: string) => {
      if (onChange) {
        onChange(optionValue)
      }
    }

    return (
      <fieldset
        ref={ref}
        className="space-y-2"
        data-testid={testId}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${name}-error` : 
          helperText ? `${name}-helper` : 
          undefined
        }
        aria-required={required}
        role="radiogroup"
        {...props}
      >
        {label && (
          <legend className="text-sm font-medium text-anchor-cream-text/70 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </legend>
        )}
        
        {helperText && !error && (
          <p id={`${name}-helper`} className="text-sm text-anchor-cream-text/70 mb-2">
            {helperText}
          </p>
        )}
        
        <div className={cn(
          'space-y-2',
          orientation === 'horizontal' && 'flex flex-wrap gap-4 space-y-0'
        )}>
          {options.map(option => (
            <Radio
              key={option.value}
              name={name}
              value={option.value}
              label={option.label}
              helperText={option.helperText}
              checked={value === option.value}
              onChange={() => handleRadioChange(option.value)}
              disabled={disabled || option.disabled}
              size={size}
            />
          ))}
        </div>
        
        {error && (
          <p id={`${name}-error`} className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </fieldset>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'

// Card Radio variant for more visual selection
export interface CardRadioProps extends RadioOption {
  name: string
  checked?: boolean
  onChange?: () => void
  disabled?: boolean
  icon?: React.ReactNode
  description?: string
}

export const CardRadio = forwardRef<HTMLInputElement, CardRadioProps>(
  ({ 
    name,
    value,
    label,
    checked,
    onChange,
    disabled,
    icon,
    description,
    helperText
  }, ref) => {
    const radioId = `${name}-${value}`

    return (
      <label
        htmlFor={radioId}
        className={cn(
          'relative flex cursor-pointer rounded-lg border p-4 transition-all',
          checked ? 'border-anchor-gold-dark bg-anchor-gold-dark/10' : 'border-anchor-gold-dark/15',
          !disabled && 'hover:border-anchor-gold-dark/40',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          ref={ref}
          id={radioId}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        
        <div className="flex flex-1">
          {icon && (
            <div className="flex-shrink-0 mr-4">
              {icon}
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className={cn(
                'text-sm font-medium',
                checked ? 'text-anchor-gold-dark' : 'text-anchor-cream-text'
              )}>
                {label}
              </h3>
              {checked && (
                <svg 
                  className="ml-2 h-5 w-5 text-anchor-gold-dark" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            
            {description && (
              <p className="mt-1 text-sm text-anchor-cream-text/70">
                {description}
              </p>
            )}
            
            {helperText && (
              <p className="mt-1 text-sm sm:text-xs text-anchor-cream-text/70">
                {helperText}
              </p>
            )}
          </div>
        </div>
        
        <div className={cn(
          'absolute -inset-px rounded-lg pointer-events-none',
          checked && 'border-2 border-anchor-gold-dark'
        )} />
      </label>
    )
  }
)

CardRadio.displayName = 'CardRadio'
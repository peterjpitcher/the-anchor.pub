'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from '../types'

const switchVariants = cva(
  'relative inline-flex cursor-pointer items-center rounded-full transition-colours focus:outline-none focus:ring-2 focus:ring-accent-text focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-14'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

const switchThumbVariants = cva(
  'pointer-events-none inline-block transform rounded-full bg-white shadow-lg ring-0 transition-transform',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
      },
      checked: {
        true: '',
        false: ''
      }
    },
    compoundVariants: [
      {
        size: 'sm',
        checked: true,
        className: 'translate-x-4'
      },
      {
        size: 'sm',
        checked: false,
        className: 'translate-x-0.5'
      },
      {
        size: 'md',
        checked: true,
        className: 'translate-x-5'
      },
      {
        size: 'md',
        checked: false,
        className: 'translate-x-0.5'
      },
      {
        size: 'lg',
        checked: true,
        className: 'translate-x-7'
      },
      {
        size: 'lg',
        checked: false,
        className: 'translate-x-0.5'
      }
    ],
    defaultVariants: {
      size: 'md',
      checked: false
    }
  }
)

export interface SwitchProps 
  extends BaseComponentProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className' | 'size'>,
    VariantProps<typeof switchVariants> {
  label?: string
  labelPosition?: 'left' | 'right'
  error?: string
  helperText?: string
  onLabel?: string
  offLabel?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ 
    className,
    size,
    label,
    labelPosition = 'right',
    error,
    helperText,
    onLabel,
    offLabel,
    checked,
    disabled,
    id,
    testId,
    ...props 
  }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const isChecked = checked || false

    return (
      <div className="relative">
        <div className={cn(
          'flex items-center',
          labelPosition === 'left' ? 'flex-row-reverse' : 'flex-row'
        )}>
          <label className="flex items-center cursor-pointer">
            <input
              ref={ref}
              id={switchId}
              type="checkbox"
              className="sr-only"
              checked={checked}
              disabled={disabled}
              data-testid={testId}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${switchId}-error` : 
                helperText ? `${switchId}-helper` : 
                undefined
              }
              role="switch"
              aria-checked={isChecked}
              {...props}
            />
            
            <span
              className={cn(
                switchVariants({ size }),
                isChecked ? "bg-accent-text" : "bg-surface-sunk border border-line",
                className
              )}
            >
              <span
                className={switchThumbVariants({ 
                  size, 
                  checked: isChecked 
                })}
              />
            </span>
            
            {/* On/Off labels */}
            {(onLabel || offLabel) && (
              <span className={cn(
                'ml-3 text-sm font-medium',
                disabled ? "text-ink-muted/60" : "text-ink"
              )}>
                {isChecked ? (onLabel || 'On') : (offLabel || 'Off')}
              </span>
            )}
          </label>
          
          {/* Main label */}
          {label && !onLabel && !offLabel && (
            <span className={cn(
              'text-sm font-medium',
              disabled ? "text-ink-muted/60" : "text-ink",
              labelPosition === 'left' ? 'mr-3' : 'ml-3'
            )}>
              {label}
            </span>
          )}
        </div>
        
        {/* Helper text */}
        {helperText && !error && (
          <p id={`${switchId}-helper`} className="mt-1 text-sm text-ink-muted ml-11">
            {helperText}
          </p>
        )}
        
        {/* Error message */}
        {error && (
          <p id={`${switchId}-error`} className="mt-1 text-sm text-anchor-danger ml-11">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Switch.displayName = 'Switch'

// Switch Group for managing multiple switches
interface SwitchOption {
  id: string
  label: string
  helperText?: string
  disabled?: boolean
}

export interface SwitchGroupProps extends BaseComponentProps {
  label?: string
  options: SwitchOption[]
  values?: Record<string, boolean>
  onChange?: (id: string, checked: boolean) => void
  error?: string
  helperText?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const SwitchGroup = forwardRef<HTMLFieldSetElement, SwitchGroupProps>(
  ({ 
    label,
    options,
    values = {},
    onChange,
    error,
    helperText,
    disabled,
    size = 'md',
    testId,
    ...props 
  }, ref) => {
    const handleSwitchChange = (optionId: string, checked: boolean) => {
      if (onChange) {
        onChange(optionId, checked)
      }
    }

    return (
      <fieldset
        ref={ref}
        className="space-y-4"
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
          </legend>
        )}
        
        {helperText && !error && (
          <p id={`${testId}-helper`} className="text-sm text-ink-muted mb-2">
            {helperText}
          </p>
        )}
        
        <div className="space-y-3">
          {options.map(option => (
            <Switch
              key={option.id}
              id={`${testId}-${option.id}`}
              name={testId}
              label={option.label}
              helperText={option.helperText}
              checked={values[option.id] || false}
              onChange={e => handleSwitchChange(option.id, e.target.checked)}
              disabled={disabled || option.disabled}
              size={size}
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

SwitchGroup.displayName = 'SwitchGroup'
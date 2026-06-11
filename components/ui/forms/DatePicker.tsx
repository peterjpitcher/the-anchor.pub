'use client'

import { forwardRef, InputHTMLAttributes, useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from '../types'
import { fieldControlClass, fieldInvalidClass } from '../primitives/Input'

// Shared field label / hint styling (matches the canonical Input, spec §4.4).
const fieldLabelClass = 'block text-sm font-semibold font-sans text-ink-strong mb-2'
const fieldHintClass = 'mt-1.5 text-xs text-ink-muted'
const fieldHintInvalidClass = 'mt-1.5 text-xs text-anchor-danger'

export interface DatePickerProps
  extends BaseComponentProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className' | 'size'> {
  label?: string
  error?: string
  helperText?: string
  minDate?: string
  maxDate?: string
  showTime?: boolean
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({
    className,
    label,
    error,
    helperText,
    minDate,
    maxDate,
    showTime = false,
    id,
    testId,
    ...props
  }, ref) => {
    const datePickerId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const inputType = showTime ? 'datetime-local' : 'date'
    const [isMobile, setIsMobile] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    
    // Detect mobile device
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                   ('ontouchstart' in window) ||
                   (window.innerWidth < 768))
      }
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }, [])
    
    // Handle mobile click to prevent immediate closing
    const handleMobileClick = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
      if (isMobile) {
        e.stopPropagation()
        // Force the input to stay focused
        const input = e.currentTarget
        setTimeout(() => {
          input.focus()
          input.click()
        }, 10)
      }
    }, [isMobile])
    
    // Prevent touch events from closing the picker
    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLInputElement>) => {
      if (isMobile) {
        e.stopPropagation()
      }
    }, [isMobile])

    return (
      <div className="w-full min-w-0">
        {label && (
          <label htmlFor={datePickerId} className={fieldLabelClass}>
            {label}
          </label>
        )}

        <div className="relative w-full min-w-0 overflow-hidden rounded-sm">
          <input
            ref={ref || inputRef}
            id={datePickerId}
            type={inputType}
            min={minDate}
            max={maxDate}
            className={cn(
              fieldControlClass,
              'text-left appearance-none',
              error && fieldInvalidClass,
              className
            )}
            data-native-date-time="true"
            data-testid={testId}
            aria-invalid={!!error}
            aria-describedby={error ? `${datePickerId}-error` : helperText ? `${datePickerId}-helper` : undefined}
            onClick={handleMobileClick}
            onTouchStart={handleTouchStart}
            onFocus={(e) => {
              // Prevent blur on mobile
              if (isMobile) {
                e.persist()
              }
              props.onFocus?.(e)
            }}
            {...props}
          />
        </div>
        
        {error && (
          <p id={`${datePickerId}-error`} className={fieldHintInvalidClass}>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${datePickerId}-helper`} className={fieldHintClass}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

DatePicker.displayName = 'DatePicker'

// Date Range Picker
export interface DateRangePickerProps extends BaseComponentProps {
  label?: string
  startDate?: string
  endDate?: string
  onStartDateChange?: (date: string) => void
  onEndDateChange?: (date: string) => void
  minDate?: string
  maxDate?: string
  error?: string
  helperText?: string
  /** @deprecated single canonical control size — no longer affects rendering */
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  ({ 
    label,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    minDate,
    maxDate,
    error,
    helperText,
    size: _size,
    disabled,
    testId,
    ...props
  }, ref) => {
    const [localStartDate, setLocalStartDate] = useState(startDate || '')
    const [localEndDate, setLocalEndDate] = useState(endDate || '')

    // Update end date min when start date changes
    const endDateMin = localStartDate || minDate

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value
      setLocalStartDate(newDate)
      if (onStartDateChange) {
        onStartDateChange(newDate)
      }
      
      // Clear end date if it's before the new start date
      if (localEndDate && newDate > localEndDate) {
        setLocalEndDate('')
        if (onEndDateChange) {
          onEndDateChange('')
        }
      }
    }

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value
      setLocalEndDate(newDate)
      if (onEndDateChange) {
        onEndDateChange(newDate)
      }
    }

    return (
      <div ref={ref} className="space-y-4" data-testid={testId} {...props}>
        {label && <label className={fieldLabelClass}>{label}</label>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            label="Start Date"
            value={localStartDate}
            onChange={handleStartDateChange}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            error={error ? 'Invalid date range' : undefined}
          />
          
          <DatePicker
            label="End Date"
            value={localEndDate}
            onChange={handleEndDateChange}
            minDate={endDateMin}
            maxDate={maxDate}
            disabled={disabled || !localStartDate}
            error={error ? 'Invalid date range' : undefined}
          />
        </div>
        
        {error && (
          <p className={fieldHintInvalidClass} role="alert">
            {error}
          </p>
        )}

        {helperText && !error && <p className={fieldHintClass}>{helperText}</p>}
      </div>
    )
  }
)

DateRangePicker.displayName = 'DateRangePicker'

// Time Picker
export interface TimePickerProps
  extends BaseComponentProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className' | 'size'> {
  label?: string
  error?: string
  helperText?: string
  min?: string
  max?: string
  step?: number
}

export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  ({
    className,
    label,
    error,
    helperText,
    min,
    max,
    step = 60, // Default to 1 minute intervals
    id,
    testId,
    ...props
  }, ref) => {
    const timePickerId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full min-w-0">
        {label && (
          <label htmlFor={timePickerId} className={fieldLabelClass}>
            {label}
          </label>
        )}

        <div className="relative w-full min-w-0 overflow-hidden rounded-sm">
          <input
            ref={ref}
            id={timePickerId}
            type="time"
            min={min}
            max={max}
            step={step}
            className={cn(
              fieldControlClass,
              'appearance-none',
              error && fieldInvalidClass,
              className
            )}
            data-native-date-time="true"
            data-testid={testId}
            aria-invalid={!!error}
            aria-describedby={error ? `${timePickerId}-error` : helperText ? `${timePickerId}-helper` : undefined}
            {...props}
          />
          
          {/* Clock icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {error && (
          <p id={`${timePickerId}-error`} className={fieldHintInvalidClass}>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${timePickerId}-helper`} className={fieldHintClass}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

TimePicker.displayName = 'TimePicker'

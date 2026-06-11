import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from './types'

export interface PriceProps
  extends BaseComponentProps,
    Omit<HTMLAttributes<HTMLSpanElement>, 'className'> {
  amount: number | string
  currency?: 'GBP' | 'USD' | 'EUR'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'sale' | 'crossed'
  showDecimals?: boolean
  prefix?: string
  suffix?: string
}

const currencySymbols = {
  GBP: '',
  USD: '$',
  EUR: '€'
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg font-semibold',
  xl: 'text-xl font-bold'
}

const variantClasses = {
  default: 'text-ink-strong',
  sale: 'text-anchor-danger font-semibold',
  crossed: 'text-ink-muted line-through'
}

export const Price = forwardRef<HTMLSpanElement, PriceProps>(
  ({ 
    amount,
    currency = 'GBP',
    size = 'md',
    variant = 'default',
    showDecimals = true,
    prefix,
    suffix,
    className,
    testId,
    ...props 
  }, ref) => {
    // Convert amount to number if it's a string
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    
    // Format the price
    const formattedAmount = showDecimals 
      ? numericAmount.toFixed(2)
      : Math.floor(numericAmount).toString()
    
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-baseline',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        data-testid={testId}
        {...props}
      >
        {prefix && <span className="mr-1">{prefix}</span>}
        <span className="font-mono">
          {currencySymbols[currency]}{formattedAmount}
        </span>
        {suffix && <span className="ml-1">{suffix}</span>}
      </span>
    )
  }
)
Price.displayName = 'Price'

// Compound component for price ranges
export interface PriceRangeProps extends Omit<PriceProps, 'amount'> {
  from: number | string
  to: number | string
}

export const PriceRange = forwardRef<HTMLSpanElement, PriceRangeProps>(
  ({ from, to, ...props }, ref) => {
    return (
      <span ref={ref} className="inline-flex items-baseline gap-1">
        <Price amount={from} {...props} />
        <span className="text-ink-muted">-</span>
        <Price amount={to} {...props} />
      </span>
    )
  }
)
PriceRange.displayName = 'PriceRange'

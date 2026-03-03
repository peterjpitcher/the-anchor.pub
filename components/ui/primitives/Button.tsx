'use client'

import {
  forwardRef,
  type ButtonHTMLAttributes,
  isValidElement,
  cloneElement,
  type ReactElement,
  type ReactNode
} from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { 
  BaseComponentProps, 
  WithChildren, 
  WithIcon, 
  WithLoading 
} from '../types'

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center font-semibold text-center transition-all duration-200 rounded-full whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-anchor-gold focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-anchor-gold text-white hover:bg-anchor-gold-light',
        secondary: 'bg-white text-anchor-green border-2 border-anchor-green hover:bg-anchor-green hover:text-white',
        ghost: 'text-anchor-green hover:bg-anchor-green/10',
        outline: 'border-2 border-anchor-gold text-anchor-gold hover:bg-anchor-gold hover:text-white',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600'
      },
      size: {
        xs: 'px-3 py-2 text-sm sm:text-xs min-h-[44px]',
        sm: 'px-4 py-2 text-sm min-h-[44px]',
        md: 'px-6 py-3 text-base min-h-[44px]',
        lg: 'px-8 py-4 text-lg min-h-[48px]',
        xl: 'px-10 py-4 text-xl min-h-[52px]'
      },
      fullWidth: {
        true: 'w-full'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)

export interface ButtonProps 
  extends BaseComponentProps,
    WithChildren,
    WithIcon,
    WithLoading,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className,
    variant,
    size,
    fullWidth,
    children,
    icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    testId,
    asChild = false,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading
    const baseClassName = cn(buttonVariants({ variant, size, fullWidth }), className)

    const content = (inner: ReactNode) => {
      if (loading) {
        return (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-label="Loading"
              role="status"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">Loading...</span>
            Loading...
          </>
        )
      }

      return (
        <>
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {inner}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </>
      )
    }

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement
      const disabledClassName = isDisabled ? 'pointer-events-none opacity-50 cursor-not-allowed' : undefined
      const mergedClassName = cn(baseClassName, disabledClassName, child.props.className)

      return cloneElement(
        child,
        {
          ref: ref as any,
          'aria-disabled': isDisabled,
          'data-testid': testId,
          className: mergedClassName,
          ...props
        },
        content(child.props.children)
      )
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        data-testid={testId}
        className={baseClassName}
        {...props}
      >
        {content(children)}
      </button>
    )
  }
)

Button.displayName = 'Button'

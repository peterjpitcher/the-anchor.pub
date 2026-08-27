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
  // Base styles — pill shape, Outfit 600, centred inline-flex with a 2px transparent
  // border so variants that add a border do not shift layout. Lift on hover, settle on
  // active, and never transform whilst disabled (design system spec §4.1).
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill border-2 border-transparent font-sans font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-anchor-gold-dark focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0',
  {
    variants: {
      variant: {
        // AA-safe primary: --anchor-gold-dark #836313 on white is 5.59:1 (was
        // #8b6914 at 5.08:1, darkened 26 Aug so it also clears AA on cream).
        // The prototype's lighter #a57626 fill only reaches 4.02:1, so it is not used.
        primary: 'bg-anchor-gold-dark text-white hover:bg-anchor-green hover:shadow-gold',
        // Theme-aware accent outline: green on light, gold-bright inside .theme-dark.
        outline: 'border-accent text-accent hover:bg-accent hover:text-canvas',
        // Low-emphasis: inherits ink colour. Hover wash is a near-black tint on light
        // surfaces; inside the class-based dark theme it flips to a white tint. (The
        // semantic tokens are hex, not RGB channels, so an opacity modifier on `ink`
        // would not compile — black/white are real palette colours and do work.)
        ghost: 'text-ink hover:bg-black/5 [.theme-dark_&]:hover:bg-white/10'
      },
      size: {
        // Heights follow the control-size tokens; padding-x uses the spacing scale.
        sm: 'min-h-[44px] px-6 text-sm',
        md: 'min-h-[48px] px-8 text-base',
        lg: 'min-h-[56px] px-12 text-lg'
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

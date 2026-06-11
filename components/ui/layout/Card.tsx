import { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps, WithChildren } from '../types'

// One card (spec §4.3):
//  - light (default): white surface, 1px border-line, radius-md (12px), shadow-sm
//  - dark: anchor-green-card bg, 1px border-line-gold, radius-xs (3px), no shadow
//  - accent: gold top rule (gold on light, gold-bright on dark)
//  - hover: lift -3px + shadow-lg
const cardVariants = cva('overflow-hidden border', {
  variants: {
    variant: {
      light: 'bg-surface border-line rounded-md shadow-sm',
      dark: 'bg-anchor-green-card border-line-gold rounded-xs'
    },
    accent: {
      true: 'border-t-[3px]',
      false: ''
    },
    hover: {
      true: 'transition-transform transition-shadow duration-200 hover:-translate-y-[3px] hover:shadow-lg',
      false: ''
    }
  },
  compoundVariants: [
    { variant: 'light', accent: true, class: 'border-t-anchor-gold' },
    { variant: 'dark', accent: true, class: 'border-t-anchor-gold-bright' }
  ],
  defaultVariants: {
    variant: 'light',
    accent: false,
    hover: false
  }
})

export interface CardProps
  extends BaseComponentProps,
    WithChildren,
    Omit<HTMLAttributes<HTMLDivElement>, 'className'>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, accent, hover, children, testId, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, accent, hover }), className)}
        data-testid={testId}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card Header component
export interface CardHeaderProps extends BaseComponentProps, WithChildren {
  className?: string
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-6 py-4 border-b border-line', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

// Card Title component
export interface CardTitleProps extends BaseComponentProps, WithChildren {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Component = 'h3', className, children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn('text-xl text-ink-strong', className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

CardTitle.displayName = 'CardTitle'

// Card Body component — padding = --space-6 (p-6 / 32px) per spec §4.3
export interface CardBodyProps extends BaseComponentProps, WithChildren {
  className?: string
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6', className)} {...props}>
        {children}
      </div>
    )
  }
)

CardBody.displayName = 'CardBody'

// Card Footer component
export interface CardFooterProps extends BaseComponentProps, WithChildren {
  className?: string
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-6 py-4 border-t border-line', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'

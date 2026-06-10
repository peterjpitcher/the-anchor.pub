import { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps, WithChildren } from '../types'

const cardVariants = cva(
  'bg-anchor-green-card rounded-none overflow-hidden border border-anchor-gold-dark/20',
  {
    variants: {
      variant: {
        default: '',
        outlined: 'border-2 border-anchor-gold-dark/40',
        elevated: 'shadow-[0_16px_40px_rgba(0,0,0,0.4)] border-0'
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md'
    }
  }
)

export interface CardProps 
  extends BaseComponentProps,
    WithChildren,
    Omit<HTMLAttributes<HTMLDivElement>, 'className'>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, children, testId, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
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
        className={cn('px-6 py-4 border-b border-anchor-gold-dark/15', className)}
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
        className={cn('text-lg font-semibold text-anchor-cream-text', className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

CardTitle.displayName = 'CardTitle'

// Card Body component
export interface CardBodyProps extends BaseComponentProps, WithChildren {
  className?: string
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-6 py-4', className)}
        {...props}
      >
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
        className={cn('px-6 py-4 border-t border-anchor-gold-dark/15 bg-anchor-green-raised', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'
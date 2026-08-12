import { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps, WithChildren } from '../types'

/**
 * One width, no variants.
 *
 * This used to carry `size` (max-w-3xl / 5xl / 7xl / 1440px) and `padding`
 * (px-4 / px-6 / px-8) props on top of the `.container` class. Because the
 * padding utility beat the container's own, every section rendered 32px
 * narrower than the header, and the size prop layered four more widths on top.
 * Both props are gone: `.container` in app/globals.css is the only thing that
 * decides page width now.
 */
const containerVariants = cva('container w-full')

export interface ContainerProps
  extends BaseComponentProps,
    WithChildren,
    Omit<HTMLAttributes<HTMLDivElement>, 'className'>,
    VariantProps<typeof containerVariants> {
  as?: 'div' | 'section' | 'article' | 'main'
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({
    as: Component = 'div',
    className,
    children,
    testId,
    ...props
  }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(containerVariants(), className)}
        data-testid={testId}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Container.displayName = 'Container'

// Section variant with vertical spacing
const sectionVariants = cva(
  '',
  {
    variants: {
      spacing: {
        none: '',
        tight: 'py-6 md:py-8',
        sm: 'py-8 md:py-10',
        md: 'py-10 md:py-12 lg:py-14',
        lg: 'py-12 md:py-14 lg:py-16'
      }
    },
    defaultVariants: {
      spacing: 'md'
    }
  }
)

export interface SectionProps 
  extends ContainerProps,
    VariantProps<typeof sectionVariants> {}

export const Section = forwardRef<HTMLDivElement, SectionProps>(
  ({ 
    spacing,
    className,
    ...props 
  }, ref) => {
    return (
      <Container
        ref={ref}
        as="section"
        className={cn(sectionVariants({ spacing }), className)}
        {...props}
      />
    )
  }
)

Section.displayName = 'Section'

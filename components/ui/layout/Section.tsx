import { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps, WithChildren } from '../types'

const sectionVariants = cva(
  '',
  {
    variants: {
      background: {
        white: 'bg-anchor-bg-card',
        gray: 'bg-anchor-bg',
        dark: 'bg-anchor-bg text-anchor-cream-text',
        cream: 'bg-anchor-bg-card',
        transparent: 'bg-transparent'
      },
      spacing: {
        none: '',
        xs: 'py-4 md:py-6',
        sm: 'py-8 md:py-10',
        md: 'py-12 md:py-16',
        lg: 'py-16 md:py-20 lg:py-24',
        xl: 'py-20 md:py-24 lg:py-32'
      },
      minHeight: {
        none: '',
        screen: 'min-h-screen',
        half: 'min-h-[50vh]',
        third: 'min-h-[33vh]',
        two_thirds: 'min-h-[66vh]'
      }
    },
    defaultVariants: {
      background: 'white',
      spacing: 'md',
      minHeight: 'none'
    }
  }
)

export interface SectionProps 
  extends BaseComponentProps,
    WithChildren,
    Omit<HTMLAttributes<HTMLElement>, 'className'>,
    VariantProps<typeof sectionVariants> {
  as?: 'section' | 'div' | 'article'
  container?: boolean
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ 
    as: Component = 'section',
    background,
    spacing,
    minHeight,
    container = false,
    containerSize,
    className,
    children,
    testId,
    ...props 
  }, ref) => {
    const sectionContent = container ? (
      <div className={cn(
        'mx-auto w-full',
        containerSize === 'sm' && 'max-w-3xl',
        containerSize === 'md' && 'max-w-5xl',
        containerSize === 'lg' && 'max-w-7xl',
        containerSize === 'xl' && 'max-w-[1440px]',
        containerSize === 'full' && 'max-w-full',
        !containerSize && 'max-w-7xl',
        'px-4 sm:px-6 lg:px-8'
      )}>
        {children}
      </div>
    ) : children

    return (
      <Component
        ref={ref as any}
        className={cn(
          sectionVariants({ background, spacing, minHeight }), 
          className
        )}
        data-testid={testId}
        {...props}
      >
        {sectionContent}
      </Component>
    )
  }
)

Section.displayName = 'Section'

// Common section patterns as compound components
export const PageSection = forwardRef<HTMLElement, SectionProps>((props, ref) => (
  <Section ref={ref} container containerSize="lg" {...props} />
))
PageSection.displayName = 'PageSection'

export const HeroSection = forwardRef<HTMLElement, SectionProps>((props, ref) => (
  <Section ref={ref} minHeight="half" spacing="none" {...props} />
))
HeroSection.displayName = 'HeroSection'

export const CTASection = forwardRef<HTMLElement, SectionProps>((props, ref) => (
  <Section ref={ref} background="dark" container containerSize="md" {...props} />
))
CTASection.displayName = 'CTASection'
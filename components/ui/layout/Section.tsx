import { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseComponentProps, WithChildren } from '../types'

const sectionVariants = cva(
  '',
  {
    variants: {
      background: {
        white: 'bg-surface',
        gray: 'bg-surface-sunk',
        dark: 'theme-dark bg-anchor-green-deep text-anchor-cream-text',
        cream: 'bg-canvas',
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
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ 
    as: Component = 'section',
    background,
    spacing,
    minHeight,
    container = false,
    className,
    children,
    testId,
    ...props
  }, ref) => {
    // One width. The `containerSize` prop is gone: it used to layer four more
    // max-widths and a competing padding scale on top of `.container`.
    const sectionContent = container ? (
      <div className="container w-full">{children}</div>
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
  <Section ref={ref} container {...props} />
))
PageSection.displayName = 'PageSection'

export const HeroSection = forwardRef<HTMLElement, SectionProps>((props, ref) => (
  <Section ref={ref} minHeight="half" spacing="none" {...props} />
))
HeroSection.displayName = 'HeroSection'

export const CTASection = forwardRef<HTMLElement, SectionProps>((props, ref) => (
  <Section ref={ref} background="dark" container {...props} />
))
CTASection.displayName = 'CTASection'
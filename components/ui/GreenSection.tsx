import { cn } from '@/lib/utils'

interface GreenSectionProps {
  children: React.ReactNode
  className?: string
  variant?: 'solid' | 'gradient'
}

export function GreenSection({ 
  children, 
  className = '',
  variant = 'solid'
}: GreenSectionProps) {
  const baseClasses = 'text-anchor-cream-text' // Force cream text on dark backgrounds

  const variants = {
    solid: 'bg-anchor-bg-card',
    gradient: 'bg-gradient-to-br from-anchor-bg-card to-anchor-bg'
  }
  
  return (
    <section className={cn(
      baseClasses,
      variants[variant],
      className
    )}>
      {children}
    </section>
  )
}

interface GreenHeadingProps {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function GreenHeading({
  children,
  className = '',
  as: Component = 'h2'
}: GreenHeadingProps) {
  return (
    <Component className={cn('text-anchor-gold-vivid', className)}>
      {children}
    </Component>
  )
}
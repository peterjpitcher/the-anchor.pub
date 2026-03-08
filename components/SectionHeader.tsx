import { ReactNode } from 'react'

export interface SectionHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  align?: 'left' | 'center' | 'right'
  className?: string
}

export function SectionHeader({ 
  title, 
  subtitle, 
  description,
  eyebrow,
  align = 'center',
  className = '' 
}: SectionHeaderProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <div className={`${alignClasses[align]} mb-12 ${className}`}>
      {eyebrow && (
        <div className={`flex items-center gap-3 mb-4 ${align === 'center' ? 'justify-center' : ''}`}>
          <span className="h-px w-7 flex-shrink-0 bg-anchor-gold/55" aria-hidden="true" />
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-anchor-gold-vivid">
            {eyebrow}
          </p>
          <span className="h-px w-7 flex-shrink-0 bg-anchor-gold/55" aria-hidden="true" />
        </div>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-anchor-cream-text mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className={`text-xl text-anchor-cream-text/70 ${align === 'center' ? 'max-w-3xl mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
      {description && (
        <p className={`mt-3 text-base text-anchor-cream-text/55 ${align === 'center' ? 'max-w-3xl mx-auto' : ''}`}>
          {description}
        </p>
      )}
    </div>
  )
}

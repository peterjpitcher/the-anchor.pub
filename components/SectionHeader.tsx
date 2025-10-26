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
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-anchor-gold">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-anchor-green mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className={`text-xl text-gray-700 ${align === 'center' ? 'max-w-3xl mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
      {description && (
        <p className={`mt-3 text-base text-gray-500 ${align === 'center' ? 'max-w-3xl mx-auto' : ''}`}>
          {description}
        </p>
      )}
    </div>
  )
}

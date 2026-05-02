interface QuickInfoItem {
  icon: string | React.ReactNode
  title: string
  subtitle?: string | React.ReactNode
}

interface QuickInfoGridProps {
  items: QuickInfoItem[]
  columns?: 2 | 3 | 4
  variant?: 'default' | 'compact'
  className?: string
}

export function QuickInfoGrid({ 
  items, 
  columns = 4,
  variant = 'default',
  className = '' 
}: QuickInfoGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
  }

  const sizeClasses = {
    default: 'p-6',
    compact: 'p-4'
  }

  return (
    <div className={`grid min-w-0 ${gridCols[columns]} gap-4 ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`card-dark min-w-0 rounded-none text-center ${sizeClasses[variant]}`}
        >
          <div className={`${variant === 'compact' ? 'text-2xl mb-2' : 'text-3xl mb-3'}`}>
            {item.icon}
          </div>
          <h3 className={`break-words font-bold text-anchor-gold-vivid ${variant === 'compact' ? 'text-sm' : ''}`}>
            {item.title}
          </h3>
          {item.subtitle && (
            <div className={`break-words text-anchor-cream-text/70 ${variant === 'compact' ? 'text-sm sm:text-xs mt-1' : 'text-base sm:text-sm mt-2'}`}>
              {item.subtitle}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

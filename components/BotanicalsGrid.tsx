import React from 'react'

interface BotanicalsGridProps {
  botanicals: string[]
  title?: string
  description?: string
  columns?: 2 | 3 | 4 | 5 | 6
  className?: string
}

export function BotanicalsGrid({
  botanicals,
  title,
  description,
  columns = 4,
  className = ''
}: BotanicalsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  }

  return (
    <div className={className}>
      {title && (
        <h3 className="break-words text-2xl md:text-3xl font-bold text-anchor-cream-text mb-4 text-center">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-center text-anchor-cream-text/70 mb-8 max-w-2xl mx-auto break-words">
          {description}
        </p>
      )}
      <div className={`grid min-w-0 ${gridCols[columns]} gap-3`}>
        {botanicals.map((botanical, index) => (
          <div
            key={index}
            className="min-w-0 bg-anchor-bg-raised hover:bg-anchor-bg-card transition-colors rounded-none p-4 text-center border border-anchor-gold/15"
          >
            <span className="break-words text-sm text-anchor-cream-text/70 font-medium">{botanical}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

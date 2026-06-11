interface DirectionsCardProps {
  from: string
  steps: string[]
  time?: string
  distance?: string
  icon?: string
  className?: string
}

export function DirectionsCard({ 
  from, 
  steps, 
  time,
  distance,
  icon = '',
  className = '' 
}: DirectionsCardProps) {
  return (
    <div className={`bg-surface border border-line rounded-md shadow-sm p-6 ${className}`}>
      <h3 className="text-xl mb-4 text-ink-strong">
        {icon} From {from}
      </h3>
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-3">
            <span className="font-bold text-accent-text">{index + 1}.</span>
            <span className="text-ink-muted">{step}</span>
          </li>
        ))}
      </ol>
      {(time || distance) && (
        <div className="mt-4 pt-4 border-t border-line">
          {time && (
            <p className="text-sm text-ink-muted">
              <strong className="text-ink-strong">Journey time:</strong> {time}
            </p>
          )}
          {distance && (
            <p className="text-sm text-ink-muted">
              <strong className="text-ink-strong">Distance:</strong> {distance}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

interface DirectionsGridProps {
  directions: DirectionsCardProps[]
  columns?: 1 | 2
  className?: string
}

export function DirectionsGrid({ directions, columns = 2, className = '' }: DirectionsGridProps) {
  const gridCols = columns === 2 ? 'md:grid-cols-2' : ''

  return (
    <div className={`grid ${gridCols} gap-8 ${className}`}>
      {directions.map((direction, index) => (
        <DirectionsCard key={index} {...direction} />
      ))}
    </div>
  )
}
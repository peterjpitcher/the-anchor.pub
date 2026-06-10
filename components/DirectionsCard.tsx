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
    <div className={`card-dark rounded-none p-6 ${className}`}>
      <h3 className="text-xl font-bold mb-4 text-anchor-gold-bright">
        {icon} From {from}
      </h3>
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-3">
            <span className="font-bold text-anchor-gold-dark">{index + 1}.</span>
            <span className="text-anchor-cream-text/70">{step}</span>
          </li>
        ))}
      </ol>
      {(time || distance) && (
        <div className="mt-4 pt-4 border-t border-anchor-gold-dark/15">
          {time && (
            <p className="text-sm text-anchor-cream-text/70">
              <strong>Journey time:</strong> {time}
            </p>
          )}
          {distance && (
            <p className="text-sm text-anchor-cream-text/70">
              <strong>Distance:</strong> {distance}
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
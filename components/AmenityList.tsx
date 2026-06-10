interface AmenityItem {
  icon: string | React.ReactNode
  title?: string
  description: string
}

interface AmenityListProps {
  items: AmenityItem[]
  variant?: 'default' | 'compact'
  iconColor?: string
  className?: string
}

export function AmenityList({ 
  items, 
  variant = 'default',
  iconColor = 'text-anchor-gold-dark',
  className = '' 
}: AmenityListProps) {
  const spacing = variant === 'compact' ? 'space-y-2' : 'space-y-3'

  return (
    <ul className={`${spacing} ${className}`}>
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className={`${iconColor} ${variant === 'compact' ? 'text-lg' : 'text-xl'} flex-shrink-0`}>
            {item.icon}
          </span>
          <div className="flex-grow">
            {item.title ? (
              <>
                <strong>{item.title}:</strong> {item.description}
              </>
            ) : (
              <span>{item.description}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
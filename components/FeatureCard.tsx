interface FeatureCardProps {
  icon?: string | React.ReactNode
  title: string
  description: string | React.ReactNode
  variant?: 'default' | 'cream' | 'colored'
  color?: string
  className?: string
}

export function FeatureCard({
  icon,
  title,
  description,
  variant = 'default',
  color,
  className = ''
}: FeatureCardProps) {
  const baseClasses = 'bg-surface border border-line rounded-md shadow-sm p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg'

  const variantClasses = {
    default: '',
    cream: 'bg-canvas',
    colored: color || 'bg-surface-sunk'
  }

  const renderIcon = () => {
    if (!icon) return null
    if (typeof icon === 'string') {
      return <div className="text-4xl mb-3">{icon}</div>
    }
    return <div className="mb-3">{icon}</div>
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {renderIcon()}
      <h3 className="font-bold text-lg mb-2 text-accent-text">{title}</h3>
      <div className="text-ink">{description}</div>
    </div>
  )
}

interface FeatureGridProps {
  features: FeatureCardProps[]
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function FeatureGrid({ features, columns = 3, className = '' }: FeatureGridProps) {
  const gridCols = {
    1: 'grid-cols-1 max-w-xl mx-auto',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} />
      ))}
    </div>
  )
}
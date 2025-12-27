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
  const baseClasses = 'rounded-xl p-6'

  const variantClasses = {
    default: 'bg-white shadow-sm',
    cream: 'bg-anchor-cream',
    colored: color || 'bg-gray-50'
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
      <h3 className="font-bold text-lg mb-2 text-anchor-green">{title}</h3>
      <div className="text-gray-700">{description}</div>
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
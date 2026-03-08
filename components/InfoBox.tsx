interface InfoBoxProps {
  title: string
  content: React.ReactNode
  footnote?: string
  variant?: 'default' | 'colored'
  color?: string
  icon?: string
  className?: string
}

export function InfoBox({ 
  title, 
  content, 
  footnote,
  variant = 'default',
  color,
  icon,
  className = ''
}: InfoBoxProps) {
  const baseClasses = 'card-dark rounded-none p-6'

  const variantClasses = {
    default: '',
    colored: color ? color : ''
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} overflow-hidden ${className}`}>
      <h3 className="text-xl font-bold mb-4 text-anchor-cream-text">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h3>
      <div className="text-anchor-cream-text/70">
        {content}
      </div>
      {footnote && (
        <p className="mt-3 text-sm text-anchor-cream-text/55">
          {footnote}
        </p>
      )}
    </div>
  )
}

interface LegacyInfoBoxItem {
  title: string
  description?: React.ReactNode
  subtitle?: React.ReactNode
  footnote?: string
  variant?: 'default' | 'colored'
  color?: string
  icon?: string
  className?: string
}

interface InfoBoxGridProps {
  boxes?: InfoBoxProps[]
  items?: LegacyInfoBoxItem[]
  columns?: 1 | 2 | 3
  className?: string
}

export function InfoBoxGrid({ boxes, items, columns = 2, className = '' }: InfoBoxGridProps) {
  const gridCols = {
    1: '',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3'
  }

  const normalizedBoxes: InfoBoxProps[] = boxes ?? (items
    ? items.map((item) => {
        const body = item.description ?? item.subtitle ?? null
        const renderedContent = typeof body === 'string'
          ? <p>{body}</p>
          : body ?? <></>

        return {
          title: item.title,
          content: renderedContent,
          footnote: item.footnote,
          variant: item.variant,
          color: item.color,
          icon: item.icon,
          className: item.className
        }
      })
    : [])

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {normalizedBoxes.map((box, index) => (
        <InfoBox key={index} {...box} />
      ))}
    </div>
  )
}

import { BusinessHours } from './BusinessHours'

interface BusinessHoursSectionProps {
  title?: string
  subtitle?: string
  variant?: 'default' | 'centered' | 'card'
  showKitchen?: boolean
  className?: string
}

export function BusinessHoursSection({ 
  title = 'Opening Hours',
  subtitle,
  variant = 'default',
  showKitchen = false,
  className = '' 
}: BusinessHoursSectionProps) {
  const sectionClasses = {
    default: 'section-spacing bg-gray-50',
    centered: 'section-spacing bg-gray-50',
    card: 'section-spacing bg-white'
  }

  const contentClasses = {
    default: 'max-w-4xl mx-auto',
    centered: 'max-w-2xl mx-auto text-center',
    card: 'max-w-2xl mx-auto'
  }

  return (
    <section className={`${sectionClasses[variant]} ${className}`}>
      <div className="container mx-auto px-4">
        <div className={contentClasses[variant]}>
          <h2 className={`text-3xl font-bold text-anchor-green mb-8 ${variant === 'centered' ? 'text-center' : ''}`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`text-gray-600 mb-6 ${variant === 'centered' ? 'text-center' : ''}`}>
              {subtitle}
            </p>
          )}
          {variant === 'card' ? (
            <div className="bg-gray-50 rounded-xl p-6">
              <BusinessHours 
                showKitchen={showKitchen}
              />
            </div>
          ) : (
            <BusinessHours 
              showKitchen={showKitchen}
            />
          )}
        </div>
      </div>
    </section>
  )
}

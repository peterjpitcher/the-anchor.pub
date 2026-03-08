import Link from 'next/link'
import { getEventCategories } from '@/lib/api'

export async function EventCategories() {
  try {
    const categories = await getEventCategories()
    
    if (!categories || categories.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-anchor-cream-text/55 text-lg">No event categories available at the moment.</p>
          <p className="text-anchor-cream-text/70 text-sm mt-2">Please check back later or view all our events.</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {categories.filter(cat => cat.is_active).map((category) => (
          <Link
            key={category.id}
            href={`/whats-on?category=${category.slug}`}
            className="group block"
          >
            <div 
              className="relative rounded-2xl p-8 text-center hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl h-full flex flex-col items-center justify-center min-h-[180px] border-2 border-transparent hover:border-current"
              style={{ 
                backgroundColor: category.color ? `${category.color}15` : '#f3f4f6',
                borderColor: category.color || '#d1d5db'
              }}
            >
              {category.icon && (
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-200">
                  {category.icon}
                </div>
              )}
              <h3 
                className="font-bold text-xl mb-2 group-hover:underline"
                style={{ color: category.color || '#047857' }}
              >
                {category.name}
              </h3>
              {category.event_count > 0 && (
                <p className="text-sm text-anchor-cream-text/55 font-medium">
                  {category.event_count} event{category.event_count !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    )
  } catch (error) {
    // Error: Failed to load event categories
    return null
  }
}
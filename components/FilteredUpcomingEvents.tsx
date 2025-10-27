import { getUpcomingEvents, getEventCategories } from '@/lib/api'
import { FilteredUpcomingEventsClient } from './FilteredUpcomingEventsClient'
import { EventSchema } from '@/components/EventSchema'

interface FilteredUpcomingEventsProps {
  categorySlug?: string | null
}

export async function FilteredUpcomingEvents({ categorySlug }: FilteredUpcomingEventsProps) {
  try {
    // Fetch events and categories in parallel
    const [events, categories] = await Promise.all([
      getUpcomingEvents(24), // API limits event listings to 24 per request
      getEventCategories()
    ])
    
    // Filter by category if specified
    let filteredEvents = events
    if (categorySlug) {
      const category = categories.find(cat => cat.slug === categorySlug)
      if (category) {
        filteredEvents = events.filter(event => event.category?.id === category.id)
      }
    }
    
    return (
      <>
        {filteredEvents.map(event => (
          <EventSchema key={`event-schema-${event.id}`} event={event} />
        ))}
        <FilteredUpcomingEventsClient events={filteredEvents} categorySlug={categorySlug} />
      </>
    )
  } catch (error) {
    // Error: Failed to load upcoming events
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 mb-2">Unable to load upcoming events at the moment.</p>
        <p className="text-gray-600">Please try again later or contact us at 01753 682707.</p>
      </div>
    )
  }
}

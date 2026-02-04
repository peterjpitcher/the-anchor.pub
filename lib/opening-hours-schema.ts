import { BusinessHours } from '@/lib/api'

type RegularHours = BusinessHours['regularHours']

const dayOrder: Array<keyof RegularHours> = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
]

/**
 * Convert API regularHours into schema-friendly, per-day entries.
 * Returns an empty array if hours are unavailable.
 */
export function buildOpeningHoursSchema(regularHours?: RegularHours) {
  if (!regularHours) return []

  const entries = dayOrder.flatMap((dayKey) => {
    const hours = regularHours[dayKey]
    if (!hours) return []

    const dayName = String(dayKey)
    const dayOfWeek = dayName.charAt(0).toUpperCase() + dayName.slice(1)

    return [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek,
        opens: hours.opens,
        closes: hours.closes,
        ...(hours.is_closed ? { description: 'Closed' } : {})
      }
    ]
  })

  return entries
}

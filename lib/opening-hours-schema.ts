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

/** Fallback opening hours if the API is unavailable */
export const DEFAULT_OPENING_HOURS_SCHEMA = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: 'Monday',
    opens: '00:00',
    closes: '00:00',
    description: 'Closed'
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: 'Tuesday',
    opens: '16:00',
    closes: '22:00'
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: 'Wednesday',
    opens: '16:00',
    closes: '22:00'
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: 'Thursday',
    opens: '16:00',
    closes: '22:00'
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: 'Friday',
    opens: '16:00',
    closes: '00:00'
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: 'Saturday',
    opens: '12:00',
    closes: '00:00'
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: 'Sunday',
    opens: '12:00',
    closes: '22:00'
  }
]

/**
 * Convert API regularHours into schema-friendly, per-day entries.
 * Falls back to safe defaults when data is missing or a day is closed.
 */
export function buildOpeningHoursSchema(regularHours?: RegularHours) {
  if (!regularHours) return DEFAULT_OPENING_HOURS_SCHEMA

  const entries = dayOrder.flatMap((dayKey) => {
    const hours = regularHours[dayKey]
    if (!hours) return []

    const dayName = String(dayKey)
    const dayOfWeek = dayName.charAt(0).toUpperCase() + dayName.slice(1)

    if (hours.is_closed) {
      return [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek,
          opens: '00:00',
          closes: '00:00',
          description: 'Closed'
        }
      ]
    }

    return [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek,
        opens: hours.opens || '00:00',
        closes: hours.closes || '00:00'
      }
    ]
  })

  return entries.length ? entries : DEFAULT_OPENING_HOURS_SCHEMA
}

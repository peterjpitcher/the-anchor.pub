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
 *
 * `regularHours` is only the schedule in force today. Pass `upcomingVersions`
 * so a published change is bounded and announced rather than the old times
 * being published as though they ran indefinitely.
 */
export function buildOpeningHoursSchema(
  regularHours?: RegularHours,
  upcomingVersions?: BusinessHours['upcomingVersions']
) {
  if (!regularHours) return []

  const upcoming = (upcomingVersions ?? [])
    .filter((version) => version?.effectiveFrom && version.hours)
    .slice()
    .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom))

  const schedules: Array<{
    hours: RegularHours
    validFrom?: string
    validThrough?: string
  }> =
    upcoming.length === 0
      ? [{ hours: regularHours }]
      : [
          { hours: regularHours, validThrough: isoDayBefore(upcoming[0].effectiveFrom) },
          ...upcoming.map((version, index) => {
            const next = upcoming[index + 1]
            return {
              hours: version.hours,
              validFrom: version.effectiveFrom,
              ...(next ? { validThrough: isoDayBefore(next.effectiveFrom) } : {})
            }
          })
        ]

  return schedules.flatMap((schedule) =>
    dayOrder.flatMap((dayKey) => {
      const hours = schedule.hours?.[dayKey]
      if (!hours) return []

      const dayName = String(dayKey)
      const dayOfWeek = dayName.charAt(0).toUpperCase() + dayName.slice(1)

      return [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek,
          opens: hours.opens,
          closes: hours.closes,
          ...(schedule.validFrom ? { validFrom: schedule.validFrom } : {}),
          ...(schedule.validThrough ? { validThrough: schedule.validThrough } : {}),
          ...(hours.is_closed ? { description: 'Closed' } : {})
        }
      ]
    })
  )
}

function isoDayBefore(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return isoDate
  parsed.setUTCDate(parsed.getUTCDate() - 1)
  return parsed.toISOString().slice(0, 10)
}

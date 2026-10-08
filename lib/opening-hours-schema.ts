import { BusinessHours } from '@/lib/api'
import { getEffectiveDayHours } from '@/lib/hours-utils'
import { nowInLondonComponents } from '@/lib/time-london'

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

/**
 * One dated entry for each coming day whose opening hours differ from the
 * normal week: Boxing Day, New Year's Day and the like.
 *
 * The weekly entries above describe a normal week only, so without these a
 * search engine shows the usual hours on a day the pub is shut or closes
 * early. Google's documented form is used: an entry whose `validFrom` and
 * `validThrough` are both the date, and "00:00" to "00:00" for a day that is
 * closed.
 *
 * Only days the management app lists are published, and only when the venue's
 * own hours change. A day on which just the kitchen is shut is left out, since
 * these are the pub's opening hours, not the kitchen's. Nothing is inferred:
 * a special day with no times and no closure flag is skipped.
 */
export function buildSpecialOpeningHoursSchema(
  hours: Pick<BusinessHours, 'regularHours' | 'specialHours' | 'upcomingVersions'> | null | undefined,
  now: Date = new Date()
) {
  if (!hours?.regularHours || !Array.isArray(hours.specialHours)) return []

  const { year, month, day } = nowInLondonComponents(now)
  const today = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const regular = hours.regularHours as Parameters<typeof getEffectiveDayHours>[1]

  return hours.specialHours
    .filter((special) => /^\d{4}-\d{2}-\d{2}$/.test(special?.date ?? '') && special.date >= today)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap((special) => {
      const usual = getEffectiveDayHours(special.date, regular, undefined, hours.upcomingVersions)
      const actual = getEffectiveDayHours(special.date, regular, hours.specialHours, hours.upcomingVersions)

      const closed = actual.is_closed === true
      const usuallyClosed = usual.is_closed === true
      if (!closed && (!actual.opens || !actual.closes)) return []
      const unchanged = closed
        ? usuallyClosed
        : !usuallyClosed && actual.opens === usual.opens && actual.closes === usual.closes
      if (unchanged) return []

      return [
        {
          '@type': 'OpeningHoursSpecification',
          opens: closed ? '00:00' : actual.opens,
          closes: closed ? '00:00' : actual.closes,
          validFrom: special.date,
          validThrough: special.date,
        },
      ]
    })
}

function isoDayBefore(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return isoDate
  parsed.setUTCDate(parsed.getUTCDate() - 1)
  return parsed.toISOString().slice(0, 10)
}

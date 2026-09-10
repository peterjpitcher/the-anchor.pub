import type { AvailabilitySlot } from '@/lib/table-booking/availability'
import { judgeSlot, type SlotSelectionContext } from '@/lib/table-booking/selection'
import { toMinutes } from '@/lib/table-booking/formatting'
import { getEffectiveDayHours, getKitchenWindows } from '@/lib/hours-utils'
import type { PublishedHours } from '@/lib/table-booking/hours-note'

/**
 * How the slot grid on screen 1 is laid out.
 *
 * This module decides LAYOUT only. Whether a time may be chosen is decided in
 * one place, `judgeSlot`, and read here. The grid used to carry its own copy of
 * the high-chair rule, which is how it came to disagree with the re-validation
 * about which times were still valid: the grid hid a time while the
 * re-validation kept it selected, Continue and all.
 */

// One boundary per date keeps the two headings unambiguous: every slot lands
// in exactly one of them. It sits where that date's dinner sitting starts (see
// resolveEveningStartMinutes). A fixed 5pm put the 4pm and 4:30pm dinner times
// under Lunch on every Tuesday to Friday.
//
// The fallback is for a date with no second sitting to split at: one sitting,
// a closed kitchen, or hours not loaded yet. 4pm keeps Monday's drinks times,
// which start when the bar opens at 4pm, out of Lunch.
export const FALLBACK_EVENING_START_MINUTES = 16 * 60

/**
 * Where the Evening heading starts on a date: the start of its second kitchen
 * sitting, in minutes after midnight.
 *
 * Read exactly as the hours note above the form reads it (hours-note.ts), from
 * the effective hours for that date, so special hours and effective-dated
 * schedules move the boundary with them. Layout only: what may be booked is
 * still the availability route's answer.
 */
export function resolveEveningStartMinutes(
  date: string,
  businessHours: PublishedHours | null
): number {
  if (!businessHours || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return FALLBACK_EVENING_START_MINUTES

  const sittings = getKitchenWindows(
    getEffectiveDayHours(
      date,
      businessHours.regularHours,
      businessHours.specialHours,
      businessHours.upcomingVersions
    )
  )
  const dinner = sittings[1]
  if (!dinner) return FALLBACK_EVENING_START_MINUTES

  // toMinutes reads an unparseable time as 0, which would put every slot
  // under Evening. Treat that as no second sitting.
  const start = toMinutes(dinner.opens)
  return start > 0 ? start : FALLBACK_EVENING_START_MINUTES
}

export type DisplaySlot = {
  slot: AvailabilitySlot
  state: 'available' | 'unavailable'
  /** Chairs free when short of the request, straight from the verdict. */
  highChairsFree?: number
}

export type GroupedSlots = {
  lunch: DisplaySlot[]
  evening: DisplaySlot[]
  /**
   * Times the rule hid because the guest asked for high chairs and none are
   * free then. Counted so the grid can explain the gap instead of silently
   * shrinking.
   */
  hiddenForHighChairs: number
  /** Times the guest can actually tap, across both groups. */
  selectableTimes: string[]
}

export function groupSlotsForDisplay(
  slots: AvailabilitySlot[],
  context: SlotSelectionContext,
  eveningStartMinutes: number = FALLBACK_EVENING_START_MINUTES
): GroupedSlots {
  const lunch: DisplaySlot[] = []
  const evening: DisplaySlot[] = []
  const selectableTimes: string[] = []
  let hiddenForHighChairs = 0

  for (const slot of slots) {
    const verdict = judgeSlot(slot, context)

    if (verdict.display === 'hide') {
      hiddenForHighChairs += 1
      continue
    }

    const display: DisplaySlot = {
      slot,
      state: verdict.selectable ? 'available' : 'unavailable',
      ...(verdict.highChairsFree !== undefined ? { highChairsFree: verdict.highChairsFree } : {})
    }

    if (verdict.selectable) selectableTimes.push(slot.time)
    if (toMinutes(slot.time) < eveningStartMinutes) {
      lunch.push(display)
    } else {
      evening.push(display)
    }
  }

  return { lunch, evening, hiddenForHighChairs, selectableTimes }
}

/** "1 high chair free" / "2 high chairs free". Never rendered when none are. */
export function highChairFlagLabel(chairsFree: number): string {
  return `${chairsFree} high chair${chairsFree === 1 ? '' : 's'} free`
}

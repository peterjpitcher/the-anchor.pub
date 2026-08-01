import type { AvailabilitySlot } from '@/lib/table-booking/availability'
import { judgeSlot, type SlotSelectionContext } from '@/lib/table-booking/selection'
import { toMinutes } from '@/lib/table-booking/formatting'

/**
 * How the slot grid on screen 1 is laid out.
 *
 * This module decides LAYOUT only. Whether a time may be chosen is decided in
 * one place, `judgeSlot`, and read here. The grid used to carry its own copy of
 * the high-chair rule, which is how it came to disagree with the re-validation
 * about which times were still valid: the grid hid a time while the
 * re-validation kept it selected, Continue and all.
 */

// Lunch runs up to 5pm, evening from 5pm. A single boundary keeps the two
// headings unambiguous: every slot lands in exactly one of them.
export const EVENING_START_MINUTES = 17 * 60

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
  context: SlotSelectionContext
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
    if (toMinutes(slot.time) < EVENING_START_MINUTES) {
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

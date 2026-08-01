import { isSlotAvailable, type AvailabilitySlot } from '@/lib/table-booking/availability'
import { readSlotHighChairsRemaining } from '@/lib/table-booking/journey'
import { toMinutes } from '@/lib/table-booking/formatting'

/**
 * How the slot grid on screen 1 is laid out and what each slot looks like once
 * the guest's refinements are applied.
 *
 * This module decides PRESENTATION only. It can turn an available slot into one
 * that is greyed out or hidden, never the other way round: nothing here can
 * make a slot the availability route declined look bookable. That direction is
 * the whole safety property, so read every rule below as "which affirmed slots
 * do we still offer".
 */

// Lunch runs up to 5pm, evening from 5pm. A single boundary keeps the two
// headings unambiguous: every slot lands in exactly one of them.
export const EVENING_START_MINUTES = 17 * 60

export type SlotDisplayState = 'available' | 'unavailable'

export type DisplaySlot = {
  slot: AvailabilitySlot
  state: SlotDisplayState
  /**
   * Set only when the guest asked for high chairs and this time has fewer free
   * than they asked for, but more than none. The slot stays tappable and
   * carries the flag (owner decision D4): a chair shortfall is information, not
   * a reason to take the time away.
   */
  highChairsFree?: number
}

export type GroupedSlots = {
  lunch: DisplaySlot[]
  evening: DisplaySlot[]
  /**
   * Times dropped because the guest asked for high chairs and this time has
   * none free at all. The only case where a chair question hides a time (D4),
   * counted so the grid can explain the gap instead of silently shrinking.
   */
  hiddenForHighChairs: number
  /** Times the guest can actually tap, across both groups. */
  selectableTimes: string[]
}

export type SlotGroupingOptions = {
  partySize: number
  highChairCount: number
}

/**
 * Split the day's slots into Lunch and Evening and apply the refinements that
 * are answered locally.
 *
 * Party size and the four table options are all sent to the availability route,
 * so `slot.available` already reflects them. The one thing left to apply here is
 * the high-chair rule, because the advisory `high_chairs_remaining` is a count
 * rather than a yes/no and D4 asks for three different outcomes from it.
 */
export function groupSlotsForDisplay(
  slots: AvailabilitySlot[],
  options: SlotGroupingOptions
): GroupedSlots {
  const lunch: DisplaySlot[] = []
  const evening: DisplaySlot[] = []
  const selectableTimes: string[] = []
  let hiddenForHighChairs = 0

  for (const slot of slots) {
    const available = isSlotAvailable(slot, options.partySize)
    const chairsFree = readSlotHighChairsRemaining(slot)

    // Hide only a time the guest could otherwise have booked. Hiding one that
    // is already greyed out would inflate the "no high chairs anywhere" count
    // and tell them the chairs are the problem when the tables are.
    if (available && options.highChairCount > 0 && chairsFree === 0) {
      hiddenForHighChairs += 1
      continue
    }

    const shortfall =
      available &&
      options.highChairCount > 0 &&
      chairsFree !== undefined &&
      chairsFree < options.highChairCount

    const display: DisplaySlot = {
      slot,
      state: available ? 'available' : 'unavailable',
      ...(shortfall ? { highChairsFree: chairsFree } : {})
    }

    if (available) selectableTimes.push(slot.time)
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

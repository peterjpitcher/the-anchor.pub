import { isSlotAvailable, type AvailabilitySlot } from '@/lib/table-booking/availability'
import { toMinutes } from '@/lib/table-booking/formatting'
import { readSlotHighChairsRemaining } from '@/lib/table-booking/journey'

/**
 * THE rule for whether a guest may choose a given time.
 *
 * There used to be three answers to that question and they disagreed. The grid
 * applied the high-chair rule, the re-validation after an options change asked
 * only about capacity, and the party-size handler asked nothing at all. So a
 * time the grid had hidden stayed selected with its Continue button lit, and a
 * party size could be changed under an answer that was never re-checked.
 *
 * Everything now reads `judgeSlot`: the grid, the re-validation, the Continue
 * gate, the submit guard and the nearest-alternatives builder. Adding a second
 * definition anywhere is the bug, so `tests/unit/slot-selection.test.ts` fails
 * if `isSlotAvailable` is consulted outside this module.
 *
 * The rule only ever takes availability AWAY. Nothing here can make a slot the
 * availability route declined look bookable, which is the safety property the
 * whole booking flow rests on.
 */

export type SlotSelectionContext = {
  partySize: number
  highChairCount: number
  /**
   * Whether a time with no high chair free at all is off the table.
   *
   * Two-screen flow: true. Owner decision D4 hides it, and the guest can set
   * high chairs back to 0 to see it again.
   *
   * Four-step flow: false. That flow has no way to show the guest a hidden
   * time, and instead offers "no high chairs are free, book anyway?" on its
   * details step. Deleted along with the rest of the four-step path.
   */
  hideWhenNoHighChairFree: boolean
}

/** How the grid should treat a slot. `hide` means it is not rendered at all. */
export type SlotDisplay = 'offer' | 'grey' | 'hide'

export type SlotVerdict = {
  /** May the guest choose this time? */
  selectable: boolean
  display: SlotDisplay
  /**
   * Set only when the guest asked for high chairs and this time has fewer free
   * than they asked for, but more than none. The time is still offered, with
   * the count on it (D4): a shortfall is information, not a refusal.
   */
  highChairsFree?: number
}

const REFUSED_GREY: SlotVerdict = { selectable: false, display: 'grey' }
const REFUSED_HIDDEN: SlotVerdict = { selectable: false, display: 'hide' }

export function judgeSlot(slot: AvailabilitySlot, context: SlotSelectionContext): SlotVerdict {
  // The authoritative answer first. Everything below can only narrow it.
  if (!isSlotAvailable(slot, context.partySize)) return REFUSED_GREY

  if (context.highChairCount <= 0) return { selectable: true, display: 'offer' }

  const chairsFree = readSlotHighChairsRemaining(slot)
  // Absent means the API did not report a figure, which is unknown rather than
  // zero. Refusing on a missing field would take away a table the pub can seat.
  if (chairsFree === undefined) return { selectable: true, display: 'offer' }

  if (chairsFree === 0) {
    return context.hideWhenNoHighChairFree ? REFUSED_HIDDEN : { selectable: true, display: 'offer' }
  }

  return chairsFree < context.highChairCount
    ? { selectable: true, display: 'offer', highChairsFree: chairsFree }
    : { selectable: true, display: 'offer' }
}

/**
 * The same rule, asked about a time rather than a slot. A time the reading does
 * not mention cannot be chosen: a complete answer is exhaustive, so silence
 * about a time is a refusal of it.
 */
export function judgeTime(
  slots: AvailabilitySlot[],
  time: string,
  context: SlotSelectionContext
): SlotVerdict {
  if (!time) return REFUSED_HIDDEN
  const slot = slots.find((candidate) => candidate.time === time)
  return slot ? judgeSlot(slot, context) : REFUSED_HIDDEN
}

/** Every time the guest may currently choose, in the order the reading gave them. */
export function selectableSlots(
  slots: AvailabilitySlot[],
  context: SlotSelectionContext
): AvailabilitySlot[] {
  return slots.filter((slot) => judgeSlot(slot, context).selectable)
}

/**
 * The selectable time nearest the one asked for. Used by the four-step flow to
 * pre-select a slot after a search, and by both flows as the "is there anything
 * at all on this date" signal.
 */
export function pickClosestSelectableSlot(
  slots: AvailabilitySlot[],
  requestedTime: string,
  context: SlotSelectionContext
): string | null {
  const candidates = selectableSlots(slots, context)
  if (candidates.length === 0) return null

  const targetMinutes = toMinutes(requestedTime)
  let closest = candidates[0]
  let closestDistance = Math.abs(toMinutes(closest.time) - targetMinutes)

  for (const slot of candidates.slice(1)) {
    const distance = Math.abs(toMinutes(slot.time) - targetMinutes)
    if (distance < closestDistance) {
      closest = slot
      closestDistance = distance
    }
  }

  return closest.time
}

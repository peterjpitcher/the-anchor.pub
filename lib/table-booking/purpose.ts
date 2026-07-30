import type { SlotBookablePurpose } from '@/lib/api'
import type { AvailabilityData, SelectedSlotService } from '@/lib/table-booking/availability'

/**
 * What a chosen slot may be booked for, and what the guest is told about it.
 *
 * Three surfaces have to agree, always: the caption on the slot button, the
 * "Booking" line on the review step, and the `purpose` field that is submitted.
 * They agree because all three come from here, and here reads the authoritative
 * answer rather than reconstructing it. Nothing in this module may consult
 * opening hours, `kitchen_open`, or the clock.
 */

/**
 * Everything needed to say what the currently chosen slot is for. `availability`
 * is the current reading, which may belong to a different date than the chosen
 * slot; `selectedSlotService` is the cache captured when the slot was picked.
 */
export type SlotPurposeContext = {
  date: string
  selectedTime: string
  availability: AvailabilityData | null
  selectedSlotService: SelectedSlotService | null
}

// What this slot may be booked for, READ, never inferred. The route decided
// it where both the drinks and food answers were in hand; nothing here
// reconstructs that decision from opening hours or any other proxy.
//   1. Prefer the current reading when it covers this date.
//   2. Otherwise fall back to the cache captured at slot-select time.
//   3. If no matching slot can be found, return null and block submit.
export function resolveSlotBookablePurpose(
  context: SlotPurposeContext
): SlotBookablePurpose | null {
  const { availability, date, selectedTime, selectedSlotService } = context

  // If anyone simplifies this pair later: THIS preference order is the
  // load-bearing fix, not the cache re-stamp in the re-read's "still free"
  // exit. Reverting only the re-stamp leaves the behaviour correct; reverting
  // this brings the stale-purpose defect straight back. Remove the re-stamp
  // if you must remove one, never this.
  //
  // The current reading is authoritative whenever it actually covers this
  // date. `selectedSlotService` is only a cache, for the nearest-alternative
  // path where the chosen time belongs to a date this reading is not about.
  const fresh =
    availability && availability.date === date
      ? availability.time_slots.find((s) => s.time === selectedTime)
      : undefined

  const cached =
    selectedSlotService &&
    selectedSlotService.date === date &&
    selectedSlotService.time === selectedTime
      ? selectedSlotService
      : null

  if (fresh) {
    // If the cache disagrees with the fresh answer it is stale, and a stale
    // value must never win. Fail closed rather than pick a side.
    if (cached && cached.bookable_purpose !== fresh.bookable_purpose) {
      return 'drinks_only'
    }
    return fresh.bookable_purpose
  }

  return cached ? cached.bookable_purpose : null
}

// The management-API `purpose` field for submit. null means the slot context was
// lost, which Confirm blocks on: it must read as unresolved, never as drinks.
export function deriveSubmitPurpose(
  context: SlotPurposeContext & { drinksOnly: boolean }
): 'food' | 'drinks' | null {
  // If the guest said "just drinks", that is the answer. Inferring from whether the kitchen
  // happens to be open was wrong for 76 of 101 drinks bookings in the last six months,
  // because most drinks bookings are made DURING kitchen hours.
  if (context.drinksOnly) return 'drinks'

  const bookablePurpose = resolveSlotBookablePurpose(context)
  if (!bookablePurpose) return null
  return bookablePurpose === 'food_or_drinks' ? 'food' : 'drinks'
}

/**
 * Whether these times are drinks-only because we could not check food, rather
 * than because the kitchen is shut.
 *
 * Read from the SAME reading that decides the purpose, on the same date gate
 * as resolveSlotBookablePurpose. Without that gate the two described
 * different readings, so after choosing a nearest alternative the review step
 * could show "we could not check food, ring us if you want to eat" directly
 * above "Booking: Table for food", at the exact moment of commitment.
 *
 * The `drinksOnly` guard is belt and braces: the route only sets the flag
 * for a food-wanting guest, and toggling "Just drinks" refetches.
 */
export function isFoodCheckUnavailable(
  context: SlotPurposeContext & { drinksOnly: boolean }
): boolean {
  if (context.drinksOnly) return false

  return context.availability && context.availability.date === context.date
    ? context.availability.food_check_unavailable === true
    : context.selectedSlotService?.food_check_unavailable === true
}

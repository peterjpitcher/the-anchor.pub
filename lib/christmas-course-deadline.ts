/**
 * The Christmas 2 and 3 course deadline, as the website needs it.
 *
 * Two and three courses need everyone's choices by noon London time, a set
 * number of days before the booking (SSOT §7; 7 days today). After that only
 * the 1 course tier can be booked, because it needs no pre-order (owner
 * decision, 10 September 2026).
 *
 * The management app owns the rule AND the number. It refuses a late booking
 * (`christmas_course_policy_v01`, fed by the editable
 * `booking_periods.preorder_cutoff_days`) and publishes the deadline on
 * /api/table-bookings/periods as `course_policy` and `preorder_cutoff_days`.
 * This file only reads that answer (BK-150): it used to keep its own fixed
 * 7, so a changed setting would have had the website offering tiers the
 * management app then refused, or the reverse. It answers "available"
 * whenever it cannot tell, and leaves the refusal to the management app.
 * It has no imports on purpose: client components use it.
 */

/** The deadline as the management app publishes it on a Christmas period. */
export type ChristmasCoursePolicy = {
  preorder_closes_at?: string | null
  multiple_courses_available?: boolean | null
} | null | undefined

/** Can the 2 and 3 course tiers still be booked, by the management app's published deadline? */
export function christmasMultipleCoursesAvailable(policy: ChristmasCoursePolicy, now: Date = new Date()): boolean {
  if (!policy) return true
  const closesAtMs = policy.preorder_closes_at ? Date.parse(policy.preorder_closes_at) : Number.NaN
  if (Number.isFinite(closesAtMs)) return now.getTime() < closesAtMs
  if (typeof policy.multiple_courses_available === 'boolean') return policy.multiple_courses_available
  return true
}

/** What a guest is told when their date is inside the deadline, in the period's own number of days. */
export function lateChristmasOneCourseNote(cutoffDays: number | null | undefined): string {
  if (typeof cutoffDays !== 'number' || !Number.isFinite(cutoffDays) || cutoffDays < 1) {
    return "Your date is past the pre-order deadline, so it's the 1 course menu, with no pre-order. Two and three courses need everyone's choices before that deadline."
  }
  const howClose = cutoffDays === 7 ? 'less than a week away' : `less than ${cutoffDays} day${cutoffDays === 1 ? '' : 's'} away`
  const before = `${cutoffDays} day${cutoffDays === 1 ? '' : 's'} before`
  return `Your date is ${howClose}, so it's the 1 course menu, with no pre-order. Two and three courses need everyone's choices by noon, ${before}.`
}

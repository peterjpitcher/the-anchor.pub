import type { AvailabilitySlot } from '@/lib/table-booking/availability'

/**
 * The shape of the booking journey: what the steps are, and what has to be true
 * before a guest may leave the details step.
 *
 * Every refusal here carries a stable machine code as well as its guest-facing
 * sentence. The code is what analytics records; the sentence can contain nothing
 * a guest typed.
 */

export type BookingStep = 'find' | 'choose' | 'details' | 'review'

export const STEP_ORDER: BookingStep[] = ['find', 'choose', 'details', 'review']

export const STEP_LABELS: Record<BookingStep, string> = {
  find: 'Find table',
  choose: 'Choose time',
  details: 'Guest details',
  review: 'Review & book'
}

/**
 * The approved two-screen journey (spec D1, D7, D8): find a table and its time
 * on one surface, then details and confirm on the next. `choose` and `review`
 * are gone: the slot grid lives on `find`, and the review summary is an inline
 * card on `details`.
 *
 * The four-step vocabulary above stays until the old path is deleted, so both
 * can be rendered from the same state while the runtime flag decides which the
 * guest sees.
 */
export const TWO_SCREEN_STEP_ORDER: BookingStep[] = ['find', 'details']

export const TWO_SCREEN_STEP_LABELS: Record<'find' | 'details', string> = {
  find: 'Find a table',
  details: 'Your details'
}

// House cap on high chairs per booking. The slot's advisory remaining figure
// never clamps the guest's request (review F06); it drives the shortfall
// acknowledgement instead.
export const HIGH_CHAIR_HOUSE_CAP = 2

export type HighChairShortfall = {
  free: number
  requested: number
}

/**
 * A guest's consent to ONE specific shortfall, on one date, at one time.
 *
 * Consent used to be a boolean with an effect that reset it whenever the
 * context changed. That is two mechanisms for one idea, and the two-screen flow
 * added a third that SET it whenever a shortfall appeared, handing out consent
 * for a shortfall the guest had never been shown (review F06: knowing there are
 * fewer chairs is not agreeing to book with fewer chairs).
 *
 * Recording what was consented to instead makes it self-invalidating. Nothing
 * has to remember to clear it, because a consent for a different date, time,
 * request or number of free chairs simply does not match.
 */
export type HighChairConsent = {
  // The date belongs here as much as the time does. Without it, agreeing to one
  // free chair at 8pm on the Tuesday was spent on 8pm on the Wednesday: the
  // guest went back, changed the date, searched again, and a fresh shortfall on
  // a day nobody had shown them counted as already agreed to.
  date: string
  time: string
  free: number
  requested: number
}

/**
 * Has this exact shortfall been agreed to? No shortfall means there is nothing
 * to agree to, which reads as satisfied.
 */
export function isHighChairShortfallAcknowledged(
  consent: HighChairConsent | null,
  date: string,
  time: string,
  shortfall: HighChairShortfall | null
): boolean {
  if (!shortfall) return true
  return Boolean(
    consent &&
      consent.date === date &&
      consent.time === time &&
      consent.free === shortfall.free &&
      consent.requested === shortfall.requested
  )
}

// Advisory remaining count for the chosen slot; undefined when the API does
// not report one (treat as unknown and leave the picker enabled, spec D7).
export function readSlotHighChairsRemaining(
  slot: AvailabilitySlot | null
): number | undefined {
  const remaining = slot?.high_chairs_remaining
  if (typeof remaining === 'number' && Number.isFinite(remaining)) {
    return Math.max(0, Math.floor(remaining))
  }
  return undefined
}

// The guest asked for more chairs than the chosen slot has free. The request
// is never silently reduced (review F06): they must explicitly acknowledge
// the shortfall before continuing, and the ORIGINAL request is submitted so
// the server can grant what it truly has at create time.
export function resolveHighChairShortfall(
  slotHighChairsRemaining: number | undefined,
  highChairCount: number
): HighChairShortfall | null {
  return slotHighChairsRemaining !== undefined && highChairCount > slotHighChairsRemaining
    ? { free: slotHighChairsRemaining, requested: highChairCount }
    : null
}

/**
 * Why the guest may not leave the details step yet. `returnToChoose` means the
 * slot context is gone and the message only makes sense on the slot list.
 */
export type DetailsStepRefusal = {
  code: string
  message: string
  returnToChoose?: boolean
}

export type DetailsStepState = {
  /** An options re-read is in flight, so the chosen time is not settled. */
  revalidatingAvailability: boolean
  selectedTime: string
  phone: string
  detailsUnlocked: boolean
  isKnownCustomer: boolean
  firstName: string
  /**
   * Optional, and stays optional. Validated only when the guest typed something, because
   * a typo silently becomes an undeliverable address in the marketing list and there is
   * no bounce to notice it until a campaign goes out months later.
   */
  email: string
  highChairShortfall: HighChairShortfall | null
  highChairShortfallAcknowledged: boolean
  /**
   * The current reading covers the chosen time and `judgeSlot` refuses it.
   *
   * False when the reading cannot speak for the slot at all, which is the
   * nearest-alternative path: that slot belongs to another date, and the
   * reading on screen is about this one. A reading that was never asked about a
   * slot has no standing to refuse it.
   */
  selectionRefusedByReading: boolean
}

/** null when the guest may continue; otherwise the reason they may not. */
/**
 * Loose shape check: something, an @, something, a dot, something, and no spaces.
 *
 * Deliberately not one of the long RFC-shaped regexes. Those reject real addresses, and a
 * guest who is told their own working email is invalid abandons the booking, which costs
 * far more than accepting an odd-looking address that turns out to be fine.
 */
function isPlausibleEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
}

export function findDetailsStepRefusal(state: DetailsStepState): DetailsStepRefusal | null {
  // A re-read is in flight because they just changed high chairs or outside seating. Their time
  // may be about to be confirmed or replaced, so do not let them submit against it mid-flight.
  if (state.revalidatingAvailability) {
    return {
      code: 'availability_revalidating',
      message: 'Just checking that time is still free. One moment.'
    }
  }

  if (!state.selectedTime) {
    return {
      code: 'no_time_selected',
      message: 'Please select a time before continuing.',
      returnToChoose: true
    }
  }

  // The last line of defence, using the same rule the grid and the
  // re-validation use. Reaching here means something moved after the time was
  // chosen, so send them back to the times rather than book against an answer
  // that no longer stands.
  if (state.selectionRefusedByReading) {
    return {
      code: 'slot_no_longer_selectable',
      message: 'That time is no longer available with your options. Please choose another.',
      returnToChoose: true
    }
  }

  if (!state.phone.trim()) {
    return { code: 'phone_missing', message: 'Please enter your mobile number.' }
  }

  if (!state.detailsUnlocked) {
    return { code: 'phone_not_verified', message: 'Please verify your mobile number first.' }
  }

  // Only the first name is required; the surname is optional end to end
  // (spec W2 as corrected by review F09: AMS already stores an empty
  // surname and the proxy already omits a blank one from the payload).
  if (!state.isKnownCustomer && !state.firstName.trim()) {
    return { code: 'name_missing', message: 'Please enter your first name.' }
  }

  // Email became required on 2026-08-19. It was optional from the day the form started
  // collecting it, and the label said so, which is why only 46% of new guests left one:
  // roughly half of every month's bookers arrived with no way to be emailed at all. The
  // field always had a genuine service reason behind it (the confirmation), so the label
  // was telling guests not to bother with something the booking actually wants.
  //
  // Known customers are exempt because they never see the box. The management app already
  // holds their address, and the form deliberately submits nothing for them, so demanding
  // one here would block a returning guest over a field that is not on their screen.
  if (!state.isKnownCustomer && !state.email.trim()) {
    return { code: 'email_missing', message: 'Please enter your email address so we can send your confirmation.' }
  }

  // A typed one is checked, because before this anything at all was accepted:
  // "jane@gmail" and "jane.gmail.com" both sailed through, went to the management app, and
  // became a permanently undeliverable address on the marketing list. Nobody finds out
  // until a campaign bounces months later, and by then the guest is long gone.
  //
  // The shape check is deliberately loose. Anything stricter starts rejecting real
  // addresses, and the cost of a false rejection here (a guest abandons the booking) is
  // far higher than the cost of letting an odd-but-valid address through.
  if (state.email.trim() && !isPlausibleEmail(state.email.trim())) {
    return { code: 'email_invalid', message: 'That email address does not look right. Please check it.' }
  }

  // A high-chair shortfall needs an explicit tap before the guest can carry
  // on (review F06): information about fewer chairs is not consent to book
  // with fewer chairs.
  if (state.highChairShortfall && !state.highChairShortfallAcknowledged) {
    return {
      code: 'high_chair_shortfall_unacknowledged',
      message:
        state.highChairShortfall.free === 0
          ? 'Please confirm you are happy to book without a high chair first.'
          : `Please confirm you are happy to book with ${state.highChairShortfall.free} high chair${state.highChairShortfall.free === 1 ? '' : 's'} first.`
    }
  }

  return null
}

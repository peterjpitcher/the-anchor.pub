'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, ChevronDown } from 'lucide-react'
import { Alert } from '@/components/ui/feedback/Alert'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Badge } from '@/components/ui/primitives/Badge'
import { Input, Textarea } from '@/components/ui/primitives/Input'
import { Button } from '@/components/ui/primitives/Button'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'
import { TurnstileField, type TurnstileFieldRef } from '@/components/security/TurnstileField'
import { useBusinessHoursContext } from '@/components/providers/BusinessHoursProvider'
import { pickSlotWindow } from '@/lib/table-booking-slot-window'
import { londonNowParts } from '@/lib/table-booking-service-windows'
import {
  addDays,
  formatDateForDisplay,
  formatGbpCurrency,
  formatHoldExpiry,
  formatTimeForDisplay,
  formatTimeList,
  getDefaultTimeValue,
  isPastLondonDate,
  toIsoDateInputValue,
  toMinutes,
  toTimeInputValue,
} from '@/lib/table-booking/formatting'
import {
  NEUTRAL_AVAILABILITY_ANCHOR_TIME,
  busynessAdvisory,
  busynessCaption,
  fetchAvailability,
  isQuieterSlot,
  shouldNudgeForBusyness,
  unknownAvailability,
  type AlternativeSlot,
  type AvailabilityData,
  type AvailabilitySlot,
  type SelectedSlotService,
} from '@/lib/table-booking/availability'
import { groupSlotsForDisplay, highChairFlagLabel } from '@/lib/table-booking/slot-groups'
import {
  judgeSlot,
  judgeTime,
  pickClosestSelectableSlot,
  selectableSlots,
  type SlotSelectionContext,
} from '@/lib/table-booking/selection'
import {
  BOOKING_HORIZON_MESSAGE,
  isBeyondBookingHorizon,
  maxBookingIsoDate,
} from '@/lib/table-booking/horizon'
import {
  pushToDataLayer,
  trackBookingErrorShown,
  trackBookingStepViewed,
  trackOptionToggled,
  trackSlotFlagShown,
  trackSlotInvalidated,
  trackTableBookingClick,
  trackTableBookingFunnel,
} from '@/lib/gtm-events'
import {
  LARGE_GROUP_DEPOSIT_PER_PERSON_GBP,
  LARGE_GROUP_DEPOSIT_POLICY_COPY,
  requiresDeposit,
} from '@/lib/constants'
import {
  formatEventTimeLabel,
  getLondonIsoDate,
  type SuggestedEvent,
} from '@/lib/table-booking/suggested-events'
import {
  getBookingAttributionPayload,
  getMarketingConsentSignalPayload,
  type BookingAttributionPayload,
} from '@/lib/booking-attribution'
import { buildBookingHoursNote } from '@/lib/table-booking/hours-note'
import { PayPalDepositSection } from './PayPalDepositSection'
import { BookingConfirmedCard } from './BookingConfirmedCard'
import { BookingProgressBar } from './BookingProgressBar'
import { BookingSummaryCard } from './BookingSummaryCard'
import { SlotPickerGrid } from './SlotPickerGrid'
import { TableRefinements } from './TableRefinements'
import { useAvailabilityRequests } from './useAvailabilityRequests'
import { useBookingPeriod } from './useBookingPeriod'
import { SeasonalPeriodQuestion } from './SeasonalPeriodQuestion'
import { useSuggestedEvents } from './useSuggestedEvents'
import { PhoneLink } from '@/components/PhoneLink'
import { PhoneButton } from '@/components/PhoneButton'
import { CONTACT } from '@/lib/constants'
import { getAircraftOverheadNotePartsForDateTime } from '@/lib/heathrow-runway-alternation'
import { CommunicationConsentFields } from '@/components/CommunicationConsentFields'
import {
  DEFAULT_COMMUNICATION_CONSENT_STATE,
  type CommunicationConsentState,
} from '@/lib/communication-consent'
import {
  buildSubmitIntentFingerprint,
  createClientIdempotencyKey,
} from '@/lib/table-booking-idempotency'
import {
  BLOCKED_REASON_COPY,
  applyRequestedExtras,
  buildTableBookingPayload,
  confirmationDeliveryCopy,
  parseLookupResponse,
  type CustomerLookupState,
  type ManagementTableBookingResult,
} from '@/lib/table-booking/submission'
import {
  deriveSubmitPurpose,
  isFoodCheckUnavailable,
} from '@/lib/table-booking/purpose'
import {
  HIGH_CHAIR_HOUSE_CAP,
  STEP_LABELS,
  STEP_ORDER,
  TWO_SCREEN_STEP_LABELS,
  TWO_SCREEN_STEP_ORDER,
  findDetailsStepRefusal,
  isHighChairShortfallAcknowledged,
  readSlotHighChairsRemaining,
  resolveHighChairShortfall,
  type BookingStep,
  type HighChairConsent,
} from '@/lib/table-booking/journey'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

/**
 * Everything a reading depends on, as one comparable value.
 *
 * Built by a function rather than written inline twice, because "Find a table"
 * has to record the inputs it is about to ask with. Without that the search's
 * own `setPartySize` would look like a change nobody had accounted for, and the
 * invalidation effect would cancel the very search that caused it.
 */
function buildAvailabilityInputsKey(input: {
  partySize: number
  drinksOnly: boolean
  requiresAccessibleTable: boolean
  highChairCount: number
  isOutsideSeating: boolean
}): string {
  return [
    input.partySize,
    input.drinksOnly,
    input.requiresAccessibleTable,
    input.highChairCount,
    input.isOutsideSeating
  ].join('|')
}

interface ManagementTableBookingFormProps {
  prefill?: {
    date?: string
    time?: string
    partySize?: number
  }
  /**
   * The approved two-screen journey (spec D1). Off by default and set from the
   * runtime `booking_options_step1` flag by the page, which reads it server-side
   * and defaults to off whenever AMS cannot be reached. The four-step path below
   * stays until the new one is proven in production, and is then deleted.
   */
  twoScreenFlow?: boolean
}

export function ManagementTableBookingForm({
  prefill,
  twoScreenFlow = false
}: ManagementTableBookingFormProps) {
  // Trigger re-renders so time-based cutoffs update without requiring a reload.
  // (Retained because the LaunchAnnouncement, hold-expiry and other time-derived
  // surfaces benefit from a periodic tick; the legacy Sunday-lunch / Mother's-Day
  // cutoff calculations that originally drove this have been retired in §8.1.)
  //
  // Re-render tick only. Booking date/time computations must use Europe/London
  // helpers (londonIsoDate / londonNowParts), not the browser-local value below.
  const [, setNow] = useState(() => new Date())
  useEffect(() => {
    if (typeof window === 'undefined') return
    const intervalId = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(intervalId)
  }, [])

  // Booking source from `?source=...` query param (e.g. `sunday_lunch_hero`).
  // Defaults to `'direct'` so every funnel event always carries a source.
  const searchParams = useSearchParams()
  const bookingSource = useMemo(() => {
    const raw = searchParams?.get('source')?.trim()
    return raw && raw.length > 0 ? raw.slice(0, 80) : 'direct'
  }, [searchParams])
  const bookingType = useMemo(() => {
    const raw = searchParams?.get('bookingType')?.trim() || searchParams?.get('booking_type')?.trim()
    if (raw === 'sunday_roast' || raw === 'sunday_lunch') return 'sunday_roast'
    if (bookingSource.toLowerCase().includes('sunday')) return 'sunday_roast'
    return 'regular'
  }, [bookingSource, searchParams])

  // Funnel tracking lifecycle:
  //  - `view` fires once on mount
  //  - `start` fires once on the first user interaction (any field)
  //  - `submit` / `success` / `error` fire from the booking submit handler
  const hasViewedRef = useRef(false)
  const hasInteractedRef = useRef(false)
  const getDeviceType = (): 'mobile' | 'desktop' => {
    if (typeof window === 'undefined') return 'desktop'
    return window.innerWidth < 768 ? 'mobile' : 'desktop'
  }

  useEffect(() => {
    if (typeof window === 'undefined' || hasViewedRef.current) return
    hasViewedRef.current = true
    trackTableBookingFunnel({
      step: 'view',
      source: bookingSource,
      bookingType,
      deviceType: getDeviceType(),
    })
    // bookingSource is stable for the lifetime of the form (URL doesn't change
    // between mount and unmount in our flow). Listed for lint clarity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function markFunnelStart() {
    if (hasInteractedRef.current) return
    hasInteractedRef.current = true
    trackTableBookingFunnel({
      step: 'start',
      source: bookingSource,
      bookingType,
      deviceType: getDeviceType(),
    })
  }

  const today = useMemo(() => londonNowParts().isoDate, [])
  const defaultDate = toIsoDateInputValue(prefill?.date) || today
  const defaultRequestedTime = toTimeInputValue(prefill?.time) || getDefaultTimeValue()
  const defaultPartySize = Math.min(Math.max(prefill?.partySize || 2, 1), 20)

  const [step, setStep] = useState<BookingStep>('find')
  // In the two-screen flow the slot grid lives on `find`, so everything that
  // used to send the guest back to the `choose` step sends them here instead.
  const slotsStep: BookingStep = twoScreenFlow ? 'find' : 'choose'
  const stepKeys = twoScreenFlow ? TWO_SCREEN_STEP_ORDER : STEP_ORDER
  const stepLabels = twoScreenFlow ? TWO_SCREEN_STEP_LABELS : STEP_LABELS

  const [partySize, setPartySize] = useState(defaultPartySize)
  const [partySizeDisplay, setPartySizeDisplay] = useState(String(defaultPartySize))
  const [date, setDate] = useState(defaultDate)
  const [requestedTime, setRequestedTime] = useState(defaultRequestedTime)
  const [selectedTime, setSelectedTime] = useState<string>('')
  // Step-2 slot window. `slotWindowAnchorTime` is captured at search time so
  // selecting a slot (which mutates `requestedTime`) does not re-centre the
  // visible grid; `showAllTimes` toggles the "See more times" expander.
  const [showAllTimes, setShowAllTimes] = useState(false)
  const [slotWindowAnchorTime, setSlotWindowAnchorTime] = useState(defaultRequestedTime)
  // Captured at slot-select time so the submit step can read the slot's
  // authoritative `bookable_purpose` without re-fetching availability. Covers
  // the nearest-alternative path, where the chosen slot is not in the current
  // `availability.time_slots` at all.
  const [selectedSlotService, setSelectedSlotService] =
    useState<SelectedSlotService | null>(null)

  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  // Two-screen flow only: the chosen time stopped qualifying after a refinement
  // changed. Rendered inline above the grid, naming the time and the reason
  // (spec §3.5), rather than in the red "booking not completed" alert: nothing
  // has failed, the guest simply needs to pick again.
  const [slotDroppedNotice, setSlotDroppedNotice] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string | null>(null)
  const [alternativeSlots, setAlternativeSlots] = useState<AlternativeSlot[]>([])
  const suggestedEvents = useSuggestedEvents(date)
  const [selectedSuggestedEvent, setSelectedSuggestedEvent] = useState<SuggestedEvent | null>(null)
  const previousDateRef = useRef(date)
  // Which request may still write state, and which spinner belongs to it. All
  // three network paths (search, options re-read, nearest-alternatives probe)
  // are tracked in one place; see useAvailabilityRequests for why.
  const {
    availabilityLoading,
    revalidating: revalidatingAvailability,
    alternativesLoading,
    beginAvailabilityRequest,
    isCurrentAvailabilityRequest,
    finishAvailabilityRequest,
    cancelAvailabilityRequests,
    beginAlternativesRequest,
    isCurrentAlternativesRequest,
    finishAlternativesRequest,
    supersedeAlternatives,
    resetAlternatives
  } = useAvailabilityRequests()

  const [phone, setPhone] = useState('')
  const [lookupState, setLookupState] = useState<CustomerLookupState>('idle')
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [lookupDegraded, setLookupDegraded] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [highChairCount, setHighChairCount] = useState(0)
  const [isOutsideSeating, setIsOutsideSeating] = useState(false)

  // "Just drinks?" rather than a food-or-drinks question. Food is the default and is right
  // 99.4% of the time; the toggle exists because 76 of 101 drinks bookings were made DURING
  // kitchen hours, so the clock cannot be used to guess. Ticking it switches the house order
  // to the bar, shortens the turn, drops out of kitchen pacing and reveals slots when the
  // kitchen is shut.
  const [drinksOnly, setDrinksOnly] = useState(false)

  // A seating requirement, never a reason or a diagnosis. Small Bay has a step and High 4 is
  // bar height, so this is a real filter, not a preference.
  const [requiresAccessibleTable, setRequiresAccessibleTable] = useState(false)

  // Everything the answer depends on, gathered in one place for the one rule
  // that reads it. Every consumer of "may this time be chosen" takes this exact
  // object, so they cannot disagree about what was asked.
  const slotSelectionContext: SlotSelectionContext = useMemo(
    () => ({
      partySize,
      highChairCount,
      // Owner decision D4 hides a time with no chair free, and the guest can
      // set chairs back to 0 to see it. The four-step flow has no way to show a
      // hidden time, so it offers "book anyway" on its details step instead.
      hideWhenNoHighChairFree: twoScreenFlow
    }),
    [partySize, highChairCount, twoScreenFlow]
  )

  // Any of these changes which TABLES qualify, so a reading taken before the change is stale.
  // A stale slot must never be trusted: otherwise a guest can choose a time, then say they need
  // an accessible table, and book a slot that was never valid for them.
  //
  // But clearing it on its own stranded them. High chairs and outside seating live on the DETAILS
  // step, after the time has been chosen, so ticking either wiped the slot while the summary kept
  // showing the old time. Nothing re-fetched, so Continue bounced them back to a slot list reading
  // "No online times available" and the only way out was Back and search again. So: re-read
  // availability with the new inputs and keep their time if it survives, and only interrupt them
  // when it genuinely does not.
  //
  // PARTY SIZE BELONGS HERE. It was left out because in the four-step flow it
  // lived on a different screen from the grid, so it could not change under an
  // answer. The two-screen flow rightly puts them together, and without this a
  // guest could search for two, choose a time, change to eight, and book that
  // time with nothing re-checked and nothing on screen to say so. The route
  // reports capacity from the local schedule (50 for the drinks range), so the
  // client-side filter cannot catch it either: only asking again can.
  const availabilityInputsKey = buildAvailabilityInputsKey({
    partySize,
    drinksOnly,
    requiresAccessibleTable,
    highChairCount,
    isOutsideSeating
  })
  const previousAvailabilityInputs = useRef(availabilityInputsKey)

  useEffect(() => {
    if (previousAvailabilityInputs.current === availabilityInputsKey) return
    previousAvailabilityInputs.current = availabilityInputsKey

    // Two-screen flow: the refinements sit directly above the grid, so a change
    // has to re-filter that grid in place (spec §3.5). Once a search has run,
    // re-read with the new inputs whether or not a time is chosen; the grid the
    // guest is looking at must never be answering the previous question.
    const refilterGridInPlace = twoScreenFlow && availability !== null && Boolean(date)

    // On the find step nothing is chosen yet, so drop the stale reading and let the
    // "Find a table" button fetch with the new inputs. Any in-flight request was
    // asked about the OLD options, so its answer is worthless either way.
    if (!refilterGridInPlace && (step === 'find' || !date || !selectedTime)) {
      cancelAvailabilityRequests()
      setAvailability(null)
      setSelectedTime('')
      setSelectedSlotService(null)
      setAlternativeSlots([])
      setSlotDroppedNotice(null)
      return
    }

    const timeAtChange = selectedTime
    let cancelled = false
    const { generation, controller } = beginAvailabilityRequest('revalidate')

    void (async () => {
      try {
        const data = await fetchAvailabilityForDate(
          date,
          // With no time chosen yet (two-screen flow, refinement changed before
          // the guest picked) there is no time to anchor on, so ask about the
          // day the same way the search does.
          timeAtChange || NEUTRAL_AVAILABILITY_ANCHOR_TIME,
          partySize,
          controller.signal
        )
        // `cancelled` covers the effect re-running; the generation covers being
        // superseded by anything else, notably a new search. Relying on the
        // abort alone would leave this path trusting that every runtime rejects
        // an aborted fetch promptly, and this answer is about the OLD date and
        // options either way.
        if (cancelled || !isCurrentAvailabilityRequest(generation)) return

        // Stamp the date we asked about when the response does not echo one, so
        // provenance is always provable downstream.
        setAvailability({ ...data, date: data.date || date })
        setAlternativeSlots([])

        if (data.calculation_state === 'unknown') {
          // The re-read could not check live availability, so neither the old
          // reading nor the chosen time can be trusted. Put them on the slot
          // list's retry state rather than claiming the time has gone.
          trackSlotInvalidated({ reason: 'availability_error' })
          setSelectedTime('')
          setSelectedSlotService(null)
          setStep(slotsStep)
          reportSlotDropped(
            'availability_unknown',
            'We could not check that time with those options. Please try again.'
          )
          return
        }

        // The refinement has left this date with nothing on it. Any probe from
        // before the change has already lost the panel (beginAvailabilityRequest
        // supersedes it), so ask again with what the guest now wants rather than
        // leaving them looking at an empty panel.
        if (selectableSlots(data.time_slots, slotSelectionContext).length === 0) {
          void loadNearestAlternatives(
            date,
            timeAtChange || NEUTRAL_AVAILABILITY_ANCHOR_TIME,
            partySize
          )
        }

        // The SAME rule the grid applies. These two used to disagree: the grid
        // hid a time with no high chair free while this asked only about
        // capacity, so the guest kept a selection that was not on screen.
        const freshVerdict = judgeTime(data.time_slots, timeAtChange, slotSelectionContext)
        const freshSlot = freshVerdict.selectable
          ? data.time_slots.find((slot) => slot.time === timeAtChange)
          : undefined

        // A shortfall that appeared underneath them is not something they have
        // agreed to. In the two-screen flow consent is given by tapping the
        // slot while the count is printed on it, so send them back to do that
        // rather than carry a time they chose when no chairs were in play. The
        // four-step flow keeps its own acknowledgement on the details step.
        const shortfallNeedsFreshConsent =
          twoScreenFlow &&
          freshVerdict.highChairsFree !== undefined &&
          !isHighChairShortfallAcknowledged(highChairConsent, date, timeAtChange, {
            free: freshVerdict.highChairsFree,
            requested: highChairCount
          })

        if (freshSlot && !shortfallNeedsFreshConsent) {
          setSelectedTime(timeAtChange)
          setSlotDroppedNotice(null)
          // Re-stamp the cached slot from the FRESH answer. Keeping the time
          // but not the purpose left this exit holding a bookable_purpose
          // captured under the old options, and resolveSlotBookablePurpose
          // reads the cache first, so the stale value beat the answer the
          // picker had just given.
          setSelectedSlotService({
            date,
            time: timeAtChange,
            bookable_purpose: freshSlot.bookable_purpose,
            food_check_unavailable: data.food_check_unavailable === true
          })
          return
        }

        if (shortfallNeedsFreshConsent && freshVerdict.highChairsFree !== undefined) {
          trackSlotInvalidated({ reason: 'high_chair_shortfall' })
          setSelectedTime('')
          setSelectedSlotService(null)
          setStep(slotsStep)
          reportSlotDropped(
            'slot_high_chair_shortfall',
            `${formatTimeForDisplay(timeAtChange)} now has only ${freshVerdict.highChairsFree} high chair${
              freshVerdict.highChairsFree === 1 ? '' : 's'
            } free. Tap it again if that suits you, or choose another time.`
          )
          return
        }

        // Nothing was chosen when this started, so nothing was lost: the fresh
        // grid simply replaces the old one. Only reachable in the two-screen
        // flow, where a refinement can change before a time is picked.
        //
        // The clear is not redundant. A guest can choose a time while this is in
        // flight, and that choice lands on the grid that answered the PREVIOUS
        // question. Keeping it would leave a chosen time no current answer
        // stands behind, so it goes and they pick again from what is now on
        // screen.
        //
        // And they are put back on the grid rather than assumed to be there.
        // Choosing a nearest alternative moves them to the details step, so
        // this branch could void the time they were about to book while they
        // sat on a screen that still showed it.
        if (!timeAtChange) {
          setSelectedTime('')
          setSelectedSlotService(null)
          setSlotDroppedNotice(null)
          setStep(slotsStep)
          return
        }

        // Genuinely unavailable now. Say why, and put them on the slot list, which this
        // re-read has just filled with real alternatives.
        trackSlotInvalidated({ reason: 'options_changed' })
        setSelectedTime('')
        setSelectedSlotService(null)
        setStep(slotsStep)
        reportSlotDropped(
          'slot_options_changed',
          `${formatTimeForDisplay(timeAtChange)} is not available with those options. Please choose another time.`
        )
      } catch (caught) {
        // The generation check matters as much here as on the success path.
        // abort() on an already-settled fetch is a no-op, so an error that had
        // already arrived surfaces as a plain Error rather than an AbortError,
        // and our own timeout throws a plain Error by design. Without this a
        // superseded failure would write an unknown reading stamped with a date
        // the guest had already left.
        if (
          cancelled ||
          (caught as Error)?.name === 'AbortError' ||
          !isCurrentAvailabilityRequest(generation)
        ) {
          return
        }
        // Never leave a stale reading on screen, and never let the failure read
        // as "no tables" either: the re-read did not answer, so availability is
        // unknown and the guest gets the retry state, not a false full-house.
        trackSlotInvalidated({ reason: 'availability_error' })
        setAvailability(unknownAvailability(date))
        setSelectedTime('')
        setSelectedSlotService(null)
        setAlternativeSlots([])
        setStep(slotsStep)
        setAvailabilityError(
          'We could not check that time with those options. Please try again.'
        )
      } finally {
        // Whoever is the current request clears the flag, cancelled or not. A
        // superseded run must never clear it (the newer one is still working)
        // and must never leave it set: whatever superseded it already cleared
        // it, in beginAvailabilityRequest or cancelAvailabilityRequests.
        finishAvailabilityRequest(generation)
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
    // Deliberately keyed on the seating inputs alone. This effect SETS selectedTime and
    // availability, so listing them would re-run it mid-flight and the cleanup would abort the
    // very fetch we are waiting on. The ref guard above already limits the body to renders where
    // the seating inputs actually changed, and the values read come from that same render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityInputsKey])
  const [communicationConsent, setCommunicationConsent] = useState<CommunicationConsentState>(
    DEFAULT_COMMUNICATION_CONSENT_STATE
  )

  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null)
  const [bookingIdForPayment, setBookingIdForPayment] = useState<string | null>(null)
  const [depositAmountForPayment, setDepositAmountForPayment] = useState<number>(0)
  const [paymentState, setPaymentState] = useState<'idle' | 'confirmed' | 'error'>('idle')
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [submittedAttribution, setSubmittedAttribution] = useState<BookingAttributionPayload | null>(null)

  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Every guest-visible booking error also emits booking_error_shown with a
  // stable machine code (never the message, which can carry typed-in data).
  function showBookingError(code: string, message: string) {
    trackBookingErrorShown({ code })
    setError(message)
  }

  // The chosen time stopped qualifying. In the two-screen flow the guest is
  // already looking at the grid, so this is an inline note beside it rather
  // than a red failure banner: the same machine code is recorded either way.
  function reportSlotDropped(code: string, message: string) {
    if (!twoScreenFlow) {
      showBookingError(code, message)
      return
    }
    trackBookingErrorShown({ code })
    setSlotDroppedNotice(message)
  }
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileFieldRef>(null)
  const [website, setWebsite] = useState('')
  const formLoadedAt = useRef(Date.now())
  const [result, setResult] = useState<ManagementTableBookingResult | null>(null)
  const aircraftOverheadNote = useMemo(
    () => getAircraftOverheadNotePartsForDateTime(date, requestedTime),
    [date, requestedTime]
  )

  // Wizard root ref for scroll-to-top on step transitions. Mounted-guard ref
  // prevents the effect from firing on initial mount, only step changes
  // after first paint should scroll.
  const wizardRef = useRef<HTMLDivElement>(null)
  const wizardMountedRef = useRef(false)

  useEffect(() => {
    if (!wizardMountedRef.current) {
      wizardMountedRef.current = true
      return
    }
    wizardRef.current?.scrollIntoView({ block: 'start' })
  }, [step])

  // Analytics: each wizard step counts as viewed when it becomes the current
  // step, including the initial 'find' step on mount.
  useEffect(() => {
    trackBookingStepViewed({ step })
  }, [step])

  // Submit-intent idempotency cache. Reuse the same Idempotency-Key when the
  // customer retries a Confirm with the same booking payload, so the management
  // API's server-side dedupe recognises the retry. Generate a fresh key when
  // any meaningful payload field changes. Volatile fields (`_t`,
  // `turnstile_token`, `website`) are intentionally excluded from the
  // fingerprint, they can change between retries without changing the booking
  // intent. Stored in a ref because the value is never rendered and we need to
  // read/write it inside the submit handler without async state timing issues.
  const submitIntentKeyRef = useRef<{ fingerprint: string; key: string } | null>(null)

  const holdExpiry = formatHoldExpiry(result?.hold_expires_at || null)
  // Sunday roast as a separate booking type, the Saturday-1pm cutoff, the
  // dedicated Mother's Day mode, and the Sunday menu pre-order flow are all
  // retired with the walk-in launch (spec §6, §7.8, §8.1). Sundays are now
  // regular food bookings; deposit gating is purely group-size based (10+).
  const requiresGroupDeposit = requiresDeposit(partySize)
  const groupDepositAmount = requiresGroupDeposit ? partySize * LARGE_GROUP_DEPOSIT_PER_PERSON_GBP : 0
  const detailsUnlocked = lookupState === 'known' || lookupState === 'unknown'
  const isKnownCustomer = lookupState === 'known'
  const selectedDateEvents = suggestedEvents.events
  const selectedDateEventsLoading = suggestedEvents.loading
  const selectedDateEventError = suggestedEvents.error
  const hideDateEventSuggestions = suggestedEvents.dismissed
  const showDateEventSuggestions = !hideDateEventSuggestions && selectedDateEvents.length > 0

  const currentStepIndex = stepKeys.indexOf(step)
  // Everything the purpose rules need, gathered once. The slot caption, the
  // review line and the submitted `purpose` all read it, which is what stops
  // what the guest is shown drifting from what gets booked.
  const slotPurposeContext = {
    date,
    selectedTime,
    availability,
    selectedSlotService,
    drinksOnly
  }
  // These times are drinks-only because we could not check food, not because
  // the kitchen is shut.
  const foodCheckUnavailable = isFoodCheckUnavailable(slotPurposeContext)
  // What the review step states. null means the slot context was lost, which
  // Confirm already blocks on: it must read as unresolved, not as drinks.
  const reviewBookingPurpose = deriveSubmitPurpose(slotPurposeContext)
  /**
   * The reading, but only when it is about the date now on screen.
   *
   * A reading answers for ONE date and carries that date with it. Choosing a
   * nearest alternative moves the guest to another day while this reading still
   * holds the old one, and a re-read that started before the move writes the
   * old day's slots back into it. Rendering that under the new date's heading
   * offered times affirmed for a different day, and one of them got booked.
   *
   * Applied once, here, so no call site has to remember: when the dates do not
   * agree there is no reading, and the grid, the verdicts and the alternatives
   * all follow from that.
   */
  const currentReading = useMemo(
    () => (availability && (availability.date || date) === date ? availability : null),
    [availability, date]
  )

  // The authoritative check could not run. Distinct from "checked and full":
  // the guest gets a retry and the phone number, never guessed slots (F04).
  const availabilityUnknown = currentReading?.calculation_state === 'unknown'

  // Every time the guest may currently choose, by the one rule. Everything that
  // asks "can they have this slot" reads from here or from `judgeTime`.
  const availableSlots = useMemo(
    () => selectableSlots(currentReading?.time_slots || [], slotSelectionContext),
    [currentReading?.time_slots, slotSelectionContext]
  )
  // Visible step-2 slots: by default a 7-slot window centred on the search-time
  // anchor, expanded to the full list when the customer taps "See more times".
  const visibleSlots = useMemo(
    () =>
      showAllTimes
        ? availableSlots
        : pickSlotWindow(availableSlots, slotWindowAnchorTime),
    [availableSlots, showAllTimes, slotWindowAnchorTime]
  )
  const selectedSlot = useMemo(
    () => availableSlots.find((slot) => slot.time === selectedTime) || null,
    [availableSlots, selectedTime]
  )
  const slotHighChairsRemaining = useMemo(
    () => readSlotHighChairsRemaining(selectedSlot),
    [selectedSlot]
  )
  const highChairShortfall = resolveHighChairShortfall(slotHighChairsRemaining, highChairCount)
  // What the guest agreed to, not merely that they agreed to something. A
  // consent recorded for a different time, request or free count does not match
  // the shortfall in front of them, so it reads as unacknowledged with nothing
  // needing to remember to clear it. See HighChairConsent in journey.ts.
  const [highChairConsent, setHighChairConsent] = useState<HighChairConsent | null>(null)
  const highChairShortfallAcknowledged = isHighChairShortfallAcknowledged(
    highChairConsent,
    date,
    selectedTime,
    highChairShortfall
  )
  // Analytics: the shortfall flag surfaced for this context. Primitive deps so
  // the event fires once per context change, not on every render.
  const highChairShortfallFree = highChairShortfall ? highChairShortfall.free : undefined
  const highChairShortfallRequested = highChairShortfall ? highChairShortfall.requested : undefined
  useEffect(() => {
    if (highChairShortfallFree === undefined || highChairShortfallRequested === undefined) return
    trackSlotFlagShown({
      chairsFree: highChairShortfallFree,
      chairsRequested: highChairShortfallRequested
    })
  }, [highChairShortfallFree, highChairShortfallRequested])
  // With no chairs left and none requested there is nothing to pick; the copy
  // below explains instead. A carried-over request keeps the stepper visible
  // so the guest can still reduce it.
  const hideHighChairPicker = slotHighChairsRemaining === 0 && highChairCount === 0
  const quieterSlots = useMemo(() => {
    if (!selectedSlot || !shouldNudgeForBusyness(selectedSlot.busyness)) return []
    const selectedMinutes = toMinutes(selectedSlot.time)
    return availableSlots
      .filter((slot) => slot.time !== selectedSlot.time && isQuieterSlot(selectedSlot.busyness, slot.busyness))
      .sort((a, b) => Math.abs(toMinutes(a.time) - selectedMinutes) - Math.abs(toMinutes(b.time) - selectedMinutes))
      .slice(0, 2)
  }, [availableSlots, selectedSlot])
  const quieterTimeLabel = formatTimeList(quieterSlots.map((slot) => formatTimeForDisplay(slot.time)))
  const selectedSlotAdvisory = busynessAdvisory(selectedSlot)

  // Two-screen flow: the whole day, grouped Lunch and Evening. The grid decides
  // nothing on its own; it reads the same verdict everything else reads.
  const groupedSlots = useMemo(
    () => groupSlotsForDisplay(currentReading?.time_slots || [], slotSelectionContext),
    [currentReading?.time_slots, slotSelectionContext]
  )
  // Every time was hidden because the guest asked for chairs and none are free
  // anywhere on this date. Say so and offer the way out, rather than leaving an
  // empty grid that looks like the pub is full.
  const allTimesHiddenForHighChairs =
    groupedSlots.hiddenForHighChairs > 0 && groupedSlots.selectableTimes.length === 0

  // THE gate on carrying a time forward, by the same rule the grid uses. Not
  // `selectedTime` on its own: a time can stop qualifying under the guest while
  // it is still stored, and a Continue button that reads only the stored value
  // will happily carry them off a grid that no longer shows it.
  const selectedTimeVerdict = useMemo(
    () => judgeTime(currentReading?.time_slots || [], selectedTime, slotSelectionContext),
    [currentReading?.time_slots, selectedTime, slotSelectionContext]
  )
  // Whether the reading on screen has any standing to judge the chosen slot.
  // On the nearest-alternative path it does not: that slot belongs to another
  // date, and `currentReading` is already null there, so a reading that was
  // never asked about a slot cannot refuse it.
  const readingCoversSelection = Boolean(selectedTime) && Boolean(currentReading)
  const selectionRefusedByReading = readingCoversSelection && !selectedTimeVerdict.selectable
  const hasUsableSelection = Boolean(selectedTime) && !selectionRefusedByReading

  // Twelve months, the owner's cap on how far ahead we take online bookings.
  // The `max` below is a courtesy for the date picker; the website proxies
  // enforce the same rule server-side, which is where it actually binds.
  // The seasonal period for the date and party on screen, and the guest's
  // answer. The hook keys the answer to the period id AND the date, so moving
  // either forgets it rather than carrying an acceptance the guest never gave
  // for the date they have landed on.
  const seasonal = useBookingPeriod(date, partySize)

  // The question must be ANSWERED before a time can be taken forward, because
  // the answer decides both the menu and the deposit. An unanswered live period
  // would otherwise submit as though the guest had declined.
  const seasonalAnswerRequired = Boolean(seasonal.period?.bookable) && seasonal.answer === null

  /*
   * NOT COLLECTED YET: the per-guest pre-order.
   *
   * AMS has nowhere to put it. The seasonal migration created `booking_periods`
   * and `booking_period_menu_items`, which are the menu to SHOW, but no table
   * for a guest's choices, and the public create route's schema has no menu
   * field at all. The retired Sunday-lunch shape wrote to `table_booking_items`
   * through an RPC the seasonal path does not call.
   *
   * So collecting choices here would take a guest through a dish-by-dish picker
   * and then drop every answer on the floor, which is worse than not asking:
   * they would arrive believing the kitchen had their order. `SeasonalPreorderPicker`
   * is built and ready to wire the moment an intake exists.
   *
   * This is not a regression. AMS marks a pre-order period `bookable: false`
   * until its menu is published, and staff taking a Christmas booking through
   * the FOH `christmas` purpose have no pre-order intake either, so choices are
   * already handled off-system.
   */

  // Alternatives offered for the SAME date as the failed search. The nearest-
  // alternatives probe and the grid do not ask the identical question, so the
  // probe can legitimately surface times on this date that the grid's judge
  // rejects. When that happens the empty state must not call the date closed
  // while those very times are printed directly beneath it: a guest who chose
  // one, then pressed Back, was told there were no online times for a date whose
  // times were listed below the notice.
  const sameDateAlternatives = useMemo(
    () => alternativeSlots.filter((option) => option.date === date),
    [alternativeSlots, date]
  )

  const maxBookingDate = useMemo(() => maxBookingIsoDate(today), [today])

  // Date-aware bar / kitchen hours summary, shown above the party-size
  // field on the Find step. Pulls from the global BusinessHoursProvider
  // so we benefit from the same caching as the header status bar; falls
  // back to null while hours are still loading or the date is invalid.
  const businessHoursContext = useBusinessHoursContext()
  const businessHours = businessHoursContext?.hours ?? null
  const hoursNote = useMemo(
    () => buildBookingHoursNote(date, businessHours),
    [date, businessHours]
  )

  useEffect(() => {
    if (previousDateRef.current === date) {
      return
    }

    previousDateRef.current = date
  }, [date])

  useEffect(() => {
    if (result?.state !== 'pending_payment' || !result.booking_id) return

    setBookingIdForPayment(result.booking_id)
    setDepositAmountForPayment(result.deposit_amount ?? 0)
    setPaypalOrderId(null)
    setPaymentState('idle')
    setPaymentError(null)

    fetch('/api/table-bookings/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: result.booking_id }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.orderId) {
          setPaypalOrderId(data.orderId)
        } else {
          setPaymentError(data.error ?? 'Unable to set up payment. Please try again or call us.')
          setPaymentState('error')
        }
      })
      .catch(() => {
        setPaymentError('Unable to set up payment. Please try again or call us.')
        setPaymentState('error')
      })
  }, [result?.state, result?.booking_id, result?.deposit_amount])


  // Ask about a date with the seating options as they stand right now. The
  // options are read here rather than passed in because every caller means
  // "with what the guest has currently chosen"; the date, time and party size
  // are threaded explicitly because callers ask about other ones (the
  // nearest-alternative probe) or about a freshly-typed value that has not
  // reached state yet.
  function fetchAvailabilityForDate(
    targetDate: string,
    targetTime: string,
    targetPartySize: number,
    signal?: AbortSignal
  ): Promise<AvailabilityData> {
    return fetchAvailability(
      {
        date: targetDate,
        time: targetTime,
        partySize: targetPartySize,
        drinksOnly,
        isOutsideSeating,
        requiresAccessibleTable,
        highChairCount
      },
      signal
    )
  }

  async function loadNearestAlternatives(
    targetDate: string,
    targetTime: string,
    targetPartySize: number
  ) {
    const requestId = beginAlternativesRequest()
    setAlternativeSlots([])

    try {
      const dateCandidates = [1, 2, 3].map((offset) => addDays(targetDate, offset))
      const candidateResponses = await Promise.all(
        dateCandidates.map(async (candidateDate) => {
          try {
            return await fetchAvailabilityForDate(candidateDate, targetTime, targetPartySize)
          } catch {
            return null
          }
        })
      )

      // Stale-search guard: if a newer search has started while these candidate
      // requests were in flight, drop this response on the floor, the newer
      // call owns the alternatives panel now.
      if (!isCurrentAlternativesRequest(requestId)) {
        return
      }

      const alternatives: AlternativeSlot[] = []
      for (const response of candidateResponses) {
        if (!response) continue

        // The same rule, on the same chair policy the rest of the flow already
        // runs on: `probeContext` carries the current `hideWhenNoHighChairFree`,
        // so this panel asks only whether a time is selectable and inherits the
        // answer.
        //
        // Deliberately no second condition. One that also demanded the chairs
        // be covered in full withheld every short time on the four-step path,
        // where the details step the guest is sent to next openly offers "no
        // high chairs are free at this time, book anyway?". A panel that will
        // not show a time the very next screen offers to book is its own kind
        // of wrong.
        const probeContext: SlotSelectionContext = {
          ...slotSelectionContext,
          partySize: targetPartySize
        }
        const slots = response.time_slots
          .map((slot) => ({ slot, verdict: judgeSlot(slot, probeContext) }))
          .filter(({ verdict }) => verdict.selectable)
          .slice(0, 2)
          .map(({ slot, verdict }) => ({
            date: response.date || targetDate,
            time: slot.time,
            bookable_purpose: slot.bookable_purpose,
            // Each candidate date has its own food answer, so the flag travels
            // with the slot rather than being read off the current reading.
            food_check_unavailable: response.food_check_unavailable === true,
            // Carried so the two-screen panel can print the shortfall on the
            // button, the way its grid does. Nobody should tap through to a
            // booking whose chair shortfall they were never shown.
            ...(verdict.highChairsFree !== undefined
              ? { highChairsFree: verdict.highChairsFree }
              : {})
          }))

        alternatives.push(...slots)
        if (alternatives.length >= 6) {
          break
        }
      }

      setAlternativeSlots(alternatives.slice(0, 6))
    } finally {
      // Only the latest request resets the loading flag. Earlier in-flight
      // requests must not flip the spinner off while a newer search is loading.
      finishAlternativesRequest(requestId)
    }
  }

  async function runAvailabilitySearch(input: {
    targetDate: string
    targetTime: string
    targetPartySize: number
    source: string
    context: string
    generation: number
    signal?: AbortSignal
  }) {
    if (!input.targetDate || !input.targetTime) {
      throw new Error('Please choose a date and time first.')
    }

    trackTableBookingClick({
      source: input.source,
      destination: '/api/table-bookings/availability',
      context: input.context
    })

    const availabilityData = await fetchAvailabilityForDate(
      input.targetDate,
      input.targetTime,
      input.targetPartySize,
      input.signal
    )

    // Latest request wins. Without this, a search still in flight when the guest
    // changed a seating option came back and wrote its answer to state anyway,
    // dragging them to the choose step with a time affirmed for the OLD options
    // (the accessible-table box ticked, but the slot checked without it).
    if (!isCurrentAvailabilityRequest(input.generation)) return

    // Funnel: an availability check completed. Documented since the funnel
    // launched but never fired until now (spec W1).
    trackTableBookingFunnel({
      step: 'availability_check',
      partySize: input.targetPartySize,
      bookingDate: input.targetDate,
      bookingTime: input.targetTime,
      source: bookingSource,
      bookingType,
      deviceType: getDeviceType(),
    })

    // The same rule again, with the party size this search actually asked
    // about. `null` doubles as the "there is nothing on this date" signal
    // below, so it has to agree with the grid or the two disagree about
    // whether the date is empty.
    const closestTime = pickClosestSelectableSlot(
      availabilityData.time_slots,
      input.targetTime,
      { ...slotSelectionContext, partySize: input.targetPartySize }
    )

    setDate(input.targetDate)
    if (!twoScreenFlow) {
      setRequestedTime(input.targetTime)
      // Pin the slot-window anchor at the originally-requested time. Subsequent
      // slot selections may move `requestedTime`, but the visible window stays put.
      setSlotWindowAnchorTime(input.targetTime)
      setShowAllTimes(false)
    }
    // Stamp the date we asked about when the response does not echo one, so
    // resolveSlotBookablePurpose can prove which date this reading covers.
    setAvailability({ ...availabilityData, date: availabilityData.date || input.targetDate })
    // Two-screen flow: nothing is pre-selected. The guest was never asked for a
    // preferred time, so choosing one for them would put a time on the summary
    // they never picked. `closestTime` is still computed, because "there is no
    // closest slot" is exactly "there is nothing free" below.
    setSelectedTime(twoScreenFlow ? '' : closestTime || '')
    setSlotDroppedNotice(null)
    // A new availability response invalidates the previous slot selection.
    setSelectedSlotService(null)
    setStep(slotsStep)

    if (!closestTime && availabilityData.calculation_state !== 'unknown') {
      // No point probing nearby dates while the checker itself is unavailable;
      // those probes would come back unknown too. The choose step shows the
      // retry state instead.
      void loadNearestAlternatives(input.targetDate, input.targetTime, input.targetPartySize)
    }
  }

  async function handleFindTable() {
    // Sync partySizeDisplay → partySize on submit in case blur hasn't fired.
    // The clamped value is also threaded explicitly through the availability
    // search so the network request sees the freshly-typed size, not stale state.
    const parsedSize = Number.parseInt(partySizeDisplay, 10)
    const clampedSize = (!Number.isFinite(parsedSize) || parsedSize < 1) ? 1 : Math.min(parsedSize, 20)
    setPartySize(clampedSize)
    setPartySizeDisplay(String(clampedSize))
    // Account for that party size here, because this search is about to ask
    // with it. Without this the invalidation effect would see a size it had not
    // accounted for, decide the reading was stale, and cancel the very search
    // that set it.
    previousAvailabilityInputs.current = buildAvailabilityInputsKey({
      partySize: clampedSize,
      drinksOnly,
      requiresAccessibleTable,
      highChairCount,
      isOutsideSeating
    })

    // Reject past dates before hitting the API. Compared as YYYY-MM-DD strings
    // against Europe/London today, the customer's browser-local clock is
    // intentionally ignored.
    if (isPastLondonDate(date)) {
      setDateError('Please select a future date')
      return
    }

    // Twelve months ahead, no further (owner decision 4). Checked here so the
    // guest is told immediately, and again in the proxies so it holds for any
    // caller that never saw this form.
    if (isBeyondBookingHorizon(date, today)) {
      setDateError(BOOKING_HORIZON_MESSAGE)
      return
    }

    // Supersede anything in flight, a previous search OR an options re-read.
    // The re-read half used to be missing: its controller was never reachable
    // from here, so a re-read could resolve after this search and overwrite it
    // with an answer for a different date and different options.
    const { generation, controller } = beginAvailabilityRequest('search')

    setAvailabilityError(null)
    setError(null)
    setResult(null)
    setAlternativeSlots([])
    supersedeAlternatives()
    setShowAllTimes(false)
    setSlotDroppedNotice(null)
    // A new availability search starts a new submit-intent. Drop any cached
    // idempotency key so the next Confirm cannot accidentally dedupe with a
    // pre-search booking attempt. See spec §13.2.
    clearSubmitIntentIdempotencyKey()

    try {
      await runAvailabilitySearch({
        targetDate: date,
        // Two-screen flow: the guest was never asked for a preferred time
        // (spec D7), so the request carries a neutral anchor for the day.
        targetTime: twoScreenFlow ? NEUTRAL_AVAILABILITY_ANCHOR_TIME : requestedTime,
        targetPartySize: clampedSize,
        source: 'book_table_find_table',
        context: 'availability_first',
        generation,
        signal: controller.signal
      })
    } catch (availabilityFailure: unknown) {
      if (availabilityFailure instanceof Error && availabilityFailure.name === 'AbortError') return
      // Same reasoning as the re-read's catch: a settled-then-superseded
      // failure is not an AbortError, and must not write state on top of a
      // newer answer.
      if (!isCurrentAvailabilityRequest(generation)) return
      trackBookingErrorShown({ code: 'availability_check_failed' })
      // A failed check means availability is UNKNOWN, never "no tables".
      // Clearing it to null used to drop the choose step out of the unknown
      // state, taking the retry button and the phone number with it and
      // falling through to "No online times available": one tap turned "we
      // could not check" into a confident, wrong "the pub is full" with no way
      // back. Hold the unknown state so the retry affordance survives.
      setAvailability(unknownAvailability(date))
      setSelectedTime('')
      setSelectedSlotService(null)
      setAvailabilityError(
        (availabilityFailure instanceof Error ? availabilityFailure.message : null) ||
          'We could not check availability right now. Please try again or call us at 01753 682707.'
      )
    } finally {
      // Only the current search owns the spinner. A superseded one switching it
      // off would hide the fact that a newer search is still running.
      finishAvailabilityRequest(generation)
    }
  }

  function handleBookSuggestedEvent(event: SuggestedEvent, context: string) {
    const eventDate = getLondonIsoDate(event.startDate) || date

    // Keep focus on the selected booking path once an event is chosen.
    suggestedEvents.dismissFor(eventDate)
    setSelectedSuggestedEvent(event)
    setAvailabilityError(null)
    setError(null)
    setResult(null)

    trackTableBookingClick({
      source: 'book_table_event_suggestion',
      destination: '/api/event-bookings',
      context
    })
  }

  function handleSlotSelect(slot: AvailabilitySlot) {
    const verdict = judgeSlot(slot, slotSelectionContext)

    // Consent to a high-chair shortfall is given HERE, in the two-screen flow,
    // because here the count is printed on the button being tapped and read out
    // in its aria-label. Tapping it is therefore an informed choice. The
    // four-step grid shows no such flag, so tapping there consents to nothing
    // and its details step asks separately (review F06).
    setHighChairConsent(
      twoScreenFlow && verdict.highChairsFree !== undefined
        ? { date, time: slot.time, free: verdict.highChairsFree, requested: highChairCount }
        : null
    )

    setSelectedTime(slot.time)
    setRequestedTime(slot.time)
    setSlotDroppedNotice(null)
    setSelectedSlotService({
      date,
      time: slot.time,
      bookable_purpose: slot.bookable_purpose,
      food_check_unavailable: availability?.food_check_unavailable === true
    })
    trackTableBookingClick({
      source: 'book_table_slot_selected',
      context: 'availability_step'
    })
  }

  function handleChooseAlternative(alternative: AlternativeSlot) {
    setDate(alternative.date)
    setRequestedTime(alternative.time)
    setSelectedTime(alternative.time)
    // Carry the alternative's bookable purpose through so submit can read it
    // even though the current `availability` belongs to the originally
    // requested date.
    setSelectedSlotService({
      date: alternative.date,
      time: alternative.time,
      bookable_purpose: alternative.bookable_purpose,
      food_check_unavailable: alternative.food_check_unavailable
    })
    setStep('details')
    setError(null)
  }

  function handleBackToFind() {
    setStep('find')
    setError(null)
  }

  function handleBackToChoose() {
    setStep(slotsStep)
    setError(null)
  }

  function handleRequestedTimeChange(value: string) {
    markFunnelStart()
    setRequestedTime(value)
    // Do NOT set the slot-window anchor here, the anchor is search-time
    // state, owned exclusively by `runAvailabilitySearch` (spec §5.2).
    // Mutating it from a draft input handler couples input state to choose-
    // step rendering and can re-centre stale availability after a failed or
    // unsubmitted edit. See codex ARCH-002.
    setShowAllTimes(false)
    setSelectedSlotService(null)
    supersedeAlternatives()
  }

  function handleDateChange(value: string) {
    markFunnelStart()
    setDate(value)
    // The date IS the question. Any search still in flight was asked about the
    // previous one, so it must lose the right to write state here and not merely
    // be dropped from view: clearing `availability` alone left a slow answer for
    // the old date free to land afterwards and repopulate the grid under the new
    // one. `currentReading` hid the worst of it by matching on date, but the
    // pending spinner and the alternatives panel still belonged to the old
    // question. Supersede, then clear.
    cancelAvailabilityRequests()
    setAvailability(null)
    setAlternativeSlots([])
    supersedeAlternatives()
    setSelectedTime('')
    setSelectedSlotService(null)
    setShowAllTimes(false)
    setSlotDroppedNotice(null)
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // Past-date validation runs in Europe/London. Do not parse value with
      // `new Date(...)` for booking validation, that re-introduces the
      // browser-local timezone bug on travellers outside the UK.
      setDateError(
        isPastLondonDate(value)
          ? 'Please select a future date'
          : isBeyondBookingHorizon(value, today)
          ? BOOKING_HORIZON_MESSAGE
          : null
      )
    } else {
      setDateError(null)
    }
  }

  // Shown with the slot grid AND again on review, because review is where the
  // guest actually commits. Same notice treatment as the availability-unknown
  // panel, deliberately: this is information they need, not an alarm.
  function renderFoodCheckNotice(context: 'grid' | 'review') {
    return (
      <div
        className="space-y-2 rounded-md border border-line bg-surface-sunk p-4 text-sm text-ink"
        aria-live="polite"
      >
        <p>
          {context === 'review'
            ? 'We could not check food service just now, so this booking is for drinks only.'
            : 'We could not check food service just now, so these times are for drinks only.'}
        </p>
        <p>
          If you would like to eat, give us a ring on{' '}
          <PhoneLink
            phone={CONTACT.phone}
            source={`table_booking_food_check_unavailable_${context}`}
            showIcon={false}
            className="font-semibold underline"
          >
            01753 682707
          </PhoneLink>{' '}
          and we will sort it.
        </p>
      </div>
    )
  }

  // The deposit step for bookings that take one. The four-step flow renders it
  // from the review screen and the two-screen flow from the details screen,
  // which is the same moment in the journey: the booking exists, the deposit
  // has not been paid, and nothing else may happen until it is.
  function renderPendingPayment() {
    if (result?.state !== 'pending_payment') return null

    return (
      <>
        {paymentState === 'confirmed' ? (
          <Alert variant="success" title="Deposit paid, booking confirmed!">
            <p>Your deposit has been received. Your table is now secured.</p>
            {result.booking_reference ? (
              <p className="mt-1">Booking reference: <strong>{result.booking_reference}</strong></p>
            ) : null}
          </Alert>
        ) : paymentState === 'error' && !paypalOrderId ? (
          <Alert variant="warning" title="We couldn't open the PayPal payment automatically">
            <p>{paymentError ?? 'Please try again or call us to complete your booking.'}</p>
            <p className="mt-2">Two ways to finish your booking:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>
                Call us on{' '}
                <PhoneLink phone={CONTACT.phone} source="table_booking_payment_error" showIcon={false} className="font-semibold underline">
                  01753 682707
                </PhoneLink>{' '}
                we'll take payment over the phone.
              </li>
              {result?.fallback_payment_url ? (
                <li>
                  Or open the secure payment link we've sent to your phone, or{' '}
                  <a
                    href={result.fallback_payment_url}
                    className="font-semibold underline"
                    rel="noopener noreferrer"
                  >
                    click here to complete your deposit
                  </a>
                  .
                </li>
              ) : (
                <li>Or check your phone, we've sent you a secure payment link by SMS.</li>
              )}
            </ul>
            <p className="mt-2 text-xs">
              Your {isOutsideSeating ? 'booking' : 'table'} is held while you complete payment.
            </p>
          </Alert>
        ) : paypalOrderId && bookingIdForPayment ? (
          <div className="space-y-3 rounded-md border border-line bg-surface-sunk p-4">
            {holdExpiry && (
              <p className="text-sm text-ink font-medium">
                Your {isOutsideSeating ? 'booking' : 'table'} is held until {holdExpiry}. Complete payment to confirm your booking.
              </p>
            )}
            {paymentState === 'error' && paymentError && (
              <Alert variant="error" title="Payment error">
                <p>{paymentError}</p>
              </Alert>
            )}
             <PayPalDepositSection
               bookingId={bookingIdForPayment}
               orderId={paypalOrderId}
               depositAmount={depositAmountForPayment}
               conversionPayload={{
                 bookingReference: result.booking_reference,
                 depositAmount: depositAmountForPayment,
                 bookingDate: date,
                 bookingTime: selectedTime,
                 partySize,
                 bookingType,
                 purpose: deriveSubmitPurpose(slotPurposeContext) ?? 'drinks',
                 bookingSource,
                 attribution: submittedAttribution,
                 // Consent-gated inside PayPalDepositSection; hashed server-side.
                 email: email.trim() || null,
                 phone: phone.trim() || null,
               }}
               bookingSummary={[
                 date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : null,
                 selectedTime ? (() => { const [h, m] = selectedTime.split(':').map(Number); const ampm = h >= 12 ? 'pm' : 'am'; const hour = h % 12 || 12; return `${hour}:${String(m).padStart(2, '0')}${ampm}`; })() : null,
                 partySize ? `${partySize} guests` : null,
                 isOutsideSeating ? 'Outside / patio' : null,
                 highChairCount > 0 ? `${highChairCount} high chair${highChairCount === 1 ? '' : 's'}` : null
               ].filter(Boolean).join(' · ')}
               onSuccess={() => {
                 setPaymentState('confirmed')
                 const transactionId = result.booking_reference || bookingIdForPayment || undefined
                 trackTableBookingFunnel({
                   step: 'success',
                   partySize,
                   bookingDate: date,
                   bookingTime: selectedTime,
                   bookingReference: transactionId,
                   bookingType,
                   source: bookingSource,
                   deviceType: getDeviceType(),
                   value: depositAmountForPayment,
                 })
                 if (transactionId) {
                   pushToDataLayer({
                     event: 'purchase',
                     transaction_id: transactionId,
                     value: depositAmountForPayment,
                     currency: 'GBP',
                     booking_source: bookingSource,
                   })
                 }
               }}
               onError={(msg) => {
                 setPaymentError(msg)
                 setPaymentState('error')
              }}
            />
          </div>
        ) : (
          <p className="text-sm text-ink-muted">Setting up payment…</p>
        )}

        {paymentState !== 'confirmed' && (
          <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto" onClick={resetJourney}>
            Start a new booking
          </Button>
        )}
      </>
    )
  }

  function renderDateEventSuggestions(options: {
    title: string
    description: string
    context: string
    highlight?: boolean
  }) {
    if (hideDateEventSuggestions) {
      return null
    }

    if (selectedDateEventsLoading) {
      return (
        <div className="rounded-md border border-line bg-surface-sunk p-4 text-sm text-ink-muted">
          Checking events on {formatDateForDisplay(date)}...
        </div>
      )
    }

    // No events for this date → render nothing (avoid distracting empty
    // placeholder; user explicitly asked us to omit this when there's
    // nothing to suggest).
    if (selectedDateEvents.length === 0) {
      return null
    }

    return (
      <div
        className={`rounded-md border p-4 ${
          options.highlight
            ? 'border-anchor-gold bg-surface-raised'
            : 'border-line bg-surface-sunk'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-ink-strong">{options.title}</p>
            <p className="mt-1 text-sm text-ink-muted">{options.description}</p>
            <p className="mt-1 text-xs text-ink-muted">Tap an event below to book it without leaving this page.</p>
          </div>
          <button
            type="button"
            onClick={suggestedEvents.dismiss}
            className="text-xs font-medium text-ink-muted underline hover:text-ink"
          >
            Hide
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {selectedDateEvents.map((event) => {
            return (
              <div
                key={event.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-sm border border-line bg-surface px-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-strong">{event.name}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {formatEventTimeLabel(event.startDate)}
                    {event.priceLabel ? ` • ${event.priceLabel}` : ' • Free entry'}
                    {typeof event.seatsRemaining === 'number'
                      ? ` • ${event.seatsRemaining} seat${event.seatsRemaining === 1 ? '' : 's'} left`
                      : ''}
                  </p>
                  {event.shortDescription ? (
                    <p className="mt-1 text-xs text-ink-muted line-clamp-2">{event.shortDescription}</p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={options.highlight ? 'primary' : 'outline'}
                  className="w-full sm:w-auto"
                  onClick={() => {
                    handleBookSuggestedEvent(event, options.context)
                  }}
                >
                  Book this event
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  async function handlePhoneLookup() {
    setLookupError(null)
    setError(null)
    setLookupDegraded(false)

    if (!phone.trim()) {
      setLookupError('Please enter your mobile number first.')
      return
    }

    setLookupState('loading')

    try {
      const params = new URLSearchParams({ phone: phone.trim(), default_country_code: '44' })
      const response = await fetch(`/api/customers/lookup?${params.toString()}`, { cache: 'no-store' })
      const payload = await response.json()

      if (!response.ok || payload?.success === false) {
        const message =
          payload?.error?.message || payload?.error || 'Unable to verify this number right now. Please try again.'
        throw new Error(message)
      }

      const lookup = parseLookupResponse(payload)

      if (lookup.known) {
        setLookupState('known')
        setLookupDegraded(false)
      } else {
        setLookupState('unknown')
        setLookupDegraded(Boolean(lookup.lookup_degraded))
      }
    } catch (lookupFailure: any) {
      trackBookingErrorShown({ code: 'lookup_failed' })
      setLookupState('idle')
      setLookupError(lookupFailure?.message || 'Unable to verify this number right now.')
      setLookupDegraded(false)
    }
  }

  function resetPhoneLookup() {
    setLookupState('idle')
    setLookupError(null)
    setLookupDegraded(false)
    setFirstName('')
    setLastName('')
    setEmail('')
    setError(null)
  }

  function validateDetailsStep(): boolean {
    const refusal = findDetailsStepRefusal({
      revalidatingAvailability,
      selectedTime,
      phone,
      detailsUnlocked,
      isKnownCustomer,
      firstName,
      highChairShortfall,
      highChairShortfallAcknowledged,
      selectionRefusedByReading
    })
    if (!refusal) return true

    // The slot context is gone, so the message only makes sense on the slot
    // list. Move them there first, exactly as the inline checks did.
    if (refusal.returnToChoose) setStep(slotsStep)
    showBookingError(refusal.code, refusal.message)
    return false
  }

  // Funnel: guest details passed validation. Documented since the funnel
  // launched but never fired until the analytics baseline (spec W1). The
  // four-step flow reaches this on the way to review; the two-screen flow has
  // no review, so it fires at the same moment, inside Confirm.
  function trackDetailsEntered() {
    trackTableBookingFunnel({
      step: 'details_entered',
      partySize,
      bookingDate: date,
      bookingTime: selectedTime,
      source: bookingSource,
      bookingType,
      deviceType: getDeviceType(),
    })
  }

  function handleContinueToReview() {
    setError(null)

    if (!validateDetailsStep()) {
      return
    }

    trackTableBookingClick({
      source: 'book_table_details_complete',
      context: 'details_step'
    })

    trackDetailsEntered()

    setStep('review')
  }

  // Reuse the cached idempotency key when the fingerprint matches the previous
  // submit intent; otherwise mint a new one and replace the cache entry.
  function getSubmitIntentIdempotencyKey(fingerprint: string): string {
    if (submitIntentKeyRef.current?.fingerprint === fingerprint) {
      return submitIntentKeyRef.current.key
    }
    const key = createClientIdempotencyKey('tbl_web')
    submitIntentKeyRef.current = { fingerprint, key }
    return key
  }

  function clearSubmitIntentIdempotencyKey() {
    submitIntentKeyRef.current = null
  }

  async function handleConfirmBooking() {
    setError(null)
    setResult(null)

    if (!validateDetailsStep()) {
      return
    }

    // The two-screen flow confirms straight from the details screen, so this is
    // where its details pass validation.
    if (twoScreenFlow) {
      trackDetailsEntered()
    }

    if (!policyAccepted) {
      showBookingError('policy_not_accepted', 'Please confirm you understand the booking and no-show policy before continuing.')
      return
    }

    const purpose = deriveSubmitPurpose(slotPurposeContext)
    if (!purpose) {
      showBookingError('slot_context_lost', 'Please choose a time again before confirming.')
      setStep(slotsStep)
      return
    }

    const trimmedPhone = phone.trim()
    const resolvedFirstName = firstName.trim()
    const resolvedLastName = lastName.trim()
    // Known customers submit no email; the management API already holds their
    // record and resolves it from the phone number.
    const resolvedEmail = (isKnownCustomer ? undefined : email.trim()) || undefined
    const trimmedNotes = notes.trim()
    // Submit the ORIGINAL request, never a value clamped to the advisory
    // remaining figure (review F06). The server re-checks atomically at create
    // and the confirmation screen shows granted-of-requested; the shortfall
    // acknowledgement above is the guest's consent to a possible shortfall.
    const resolvedHighChairCount = Math.max(0, highChairCount)
    const resolvedOutsideSeating = isOutsideSeating

    // Build the submit-intent fingerprint from non-volatile payload fields,
    // then look up (or mint) the idempotency key. This guarantees that a retry
    // of the same booking intent reuses the key, while a changed slot or guest
    // detail forces a new key. High-chair, outside and accessibility are all
    // included so a booking that differs only in those fields gets its own key.
    // See spec §13.2, §10 and review F18.
    const idempotencyFingerprint = buildSubmitIntentFingerprint({
      phone: trimmedPhone,
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      email: resolvedEmail,
      date,
      time: selectedTime,
      partySize,
      purpose,
      notes: trimmedNotes,
      highChairCount: resolvedHighChairCount,
      isOutsideSeating: resolvedOutsideSeating,
      requiresAccessibleTable,
      communicationConsent
    })
    const idempotencyKey = getSubmitIntentIdempotencyKey(idempotencyFingerprint)

    setLoading(true)

    trackTableBookingClick({
      source: 'book_table_management_form',
      context: bookingType,
      destination: '/api/table-bookings'
    })

    // Funnel: submit attempt. Fired here (not in `try`) so it lands even if
    // the request never makes it to the server (e.g. offline).
    trackTableBookingFunnel({
      step: 'submit',
      partySize,
      bookingDate: date,
      bookingTime: selectedTime,
      source: bookingSource,
      bookingType,
      deviceType: getDeviceType(),
    })

    try {
      const storedAttribution = getBookingAttributionPayload()
      const attribution = {
        ...storedAttribution,
        ...getMarketingConsentSignalPayload(storedAttribution.fbclid),
      }
      setSubmittedAttribution(attribution)

      const payload = buildTableBookingPayload({
        phone: trimmedPhone,
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
        email: resolvedEmail,
        date,
        time: selectedTime,
        partySize,
        purpose,
        notes: trimmedNotes,
        highChairCount: resolvedHighChairCount,
        isOutsideSeating: resolvedOutsideSeating,
        requiresAccessibleTable,
        communicationConsent,
        // Only sent when the guest was actually asked. `seasonal.answer` is
        // already keyed to the period and the date on screen, so a stale
        // acceptance for a date they have left cannot reach the server.
        seasonalAnswer:
          seasonal.period && seasonal.answer !== null
            ? { periodId: seasonal.period.id, accepted: seasonal.answer }
            : null,
        attribution,
        turnstileToken,
        website,
        secondsOnForm: Math.floor((Date.now() - formLoadedAt.current) / 1000)
      })

      const response = await fetch('/api/table-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(payload)
      })

      const body = await response.json()
      const data = body?.data || body

      if (!response.ok || body?.success === false) {
        const upstreamError =
          body?.error?.message ||
          body?.error ||
          data?.error ||
          'We could not process your booking right now.'
        throw new Error(upstreamError)
      }

      if (!data || typeof data !== 'object' || !data.state) {
        throw new Error('Booking response was incomplete. Please try again.')
      }

      // Preserve what the guest requested so the confirmation can show
      // granted-of-requested; fall back to the submitted values if the API
      // build doesn't echo them back yet.
      const bookingResult = applyRequestedExtras(data as ManagementTableBookingResult, {
        highChairCount: resolvedHighChairCount,
        isOutsideSeating: resolvedOutsideSeating
      })
      setResult(bookingResult)

      if (bookingResult.state === 'blocked') {
        const blockedReason = bookingResult.blocked_reason || 'blocked'
        showBookingError(blockedReason, BLOCKED_REASON_COPY[blockedReason] || bookingResult.reason || BLOCKED_REASON_COPY.blocked)
        setStep(slotsStep)
        trackTableBookingFunnel({
          step: 'error',
          partySize,
          bookingDate: date,
          bookingTime: selectedTime,
          errorType: blockedReason,
          errorMessage: bookingResult.reason || BLOCKED_REASON_COPY[blockedReason] || 'blocked',
          source: bookingSource,
          bookingType,
          deviceType: getDeviceType(),
        })
      } else if (bookingResult.state === 'confirmed') {
        // Defence-in-depth: drop the cached submit-intent key on a confirmed
        // terminal state so a hypothetical second Confirm with the same
        // payload would mint a new key rather than dedupe with the just-
        // succeeded booking. Pending-payment and blocked states deliberately
        // keep the cached key (the former is still in flight, the latter is
        // a retry case). See codex AB-003.
        clearSubmitIntentIdempotencyKey()

        // Funnel success
        trackTableBookingFunnel({
          step: 'success',
          partySize,
          bookingDate: date,
          bookingTime: selectedTime,
          bookingReference: bookingResult.booking_reference || undefined,
          source: bookingSource,
          bookingType,
          deviceType: getDeviceType(),
        })

        // GA4 purchase event so bookings appear in the Monetisation reports.
        // Confirmed (no deposit) bookings have value 0; the `transaction_id`
        // is the booking reference so duplicates de-dupe in GA4.
        const transactionId =
          bookingResult.booking_reference || bookingResult.table_booking_id || undefined
        if (transactionId) {
          pushToDataLayer({
            event: 'purchase',
            transaction_id: transactionId,
            value: bookingResult.deposit_amount ?? 0,
            currency: 'GBP',
            booking_source: bookingSource,
          })
        }
      }
    } catch (submitError: any) {
      const errorMessage = submitError?.message || 'We could not process your booking right now.'
      showBookingError('submit_failed', errorMessage)
      trackTableBookingFunnel({
        step: 'error',
        partySize,
        bookingDate: date,
        bookingTime: selectedTime,
        errorType: 'submit_failed',
        errorMessage,
        source: bookingSource,
        bookingType,
        deviceType: getDeviceType(),
      })
    } finally {
      setLoading(false)
      setTurnstileToken(null)
      turnstileRef.current?.reset()
    }
  }

  function resetJourney() {
    setStep('find')
    setPartySize(defaultPartySize)
    setPartySizeDisplay(String(defaultPartySize))
    setDate(defaultDate)
    setRequestedTime(defaultRequestedTime)
    setSlotWindowAnchorTime(defaultRequestedTime)
    setShowAllTimes(false)
    setSelectedTime('')
    setSelectedSlotService(null)
    setAvailability(null)
    setAvailabilityError(null)
    setSlotDroppedNotice(null)
    setAlternativeSlots([])
    resetAlternatives()
    suggestedEvents.resetDismissals()
    setSelectedSuggestedEvent(null)
    setPhone('')
    setLookupState('idle')
    setLookupError(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setNotes('')
    setHighChairCount(0)
    setHighChairConsent(null)
    setIsOutsideSeating(false)
    setPolicyAccepted(false)
    setError(null)
    setResult(null)
    setPaypalOrderId(null)
    setBookingIdForPayment(null)
    setDepositAmountForPayment(0)
    setPaymentState('idle')
    setPaymentError(null)
    setTurnstileToken(null)
    turnstileRef.current?.reset()
    setWebsite('')
    formLoadedAt.current = Date.now()
    // Drop the cached submit-intent key so the next booking minted by the
    // wizard cannot reuse a previous booking's Idempotency-Key. See spec §13.2.
    clearSubmitIntentIdempotencyKey()
  }

  if (selectedSuggestedEvent) {
    const selectedEventDate = getLondonIsoDate(selectedSuggestedEvent.startDate)
    const selectedEventDateLabel = selectedEventDate ? formatDateForDisplay(selectedEventDate) : 'Date TBC'
    const selectedEventTimeLabel = formatEventTimeLabel(selectedSuggestedEvent.startDate)

    return (
      <div className="mx-auto max-w-[640px] space-y-4">
        <Card accent>
          <CardBody className="space-y-3 p-6">
            <h3 className="font-display text-h4 text-ink-strong">Event booking</h3>
            <p className="text-sm text-ink-muted">
              You're booking <strong className="text-ink-strong">{selectedSuggestedEvent.name}</strong> on{' '}
              <strong className="text-ink-strong">{selectedEventDateLabel}</strong> at <strong className="text-ink-strong">{selectedEventTimeLabel}</strong>.
            </p>
            <p className="text-sm text-ink-muted">
              Complete your event booking below without leaving this page.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto min-h-12"
              onClick={() => setSelectedSuggestedEvent(null)}
            >
              Back to table booking
            </Button>
          </CardBody>
        </Card>

        <ManagementEventBookingForm
          event={{
            id: selectedSuggestedEvent.id,
            name: selectedSuggestedEvent.name,
            slug: selectedSuggestedEvent.slug ?? undefined,
            startDate: selectedSuggestedEvent.startDate
          }}
          title="Reserve event table"
          compact
        />
      </div>
    )
  }

  if (result?.state === 'confirmed') {
    return (
      <BookingConfirmedCard
        result={result}
        partySize={partySize}
        date={date}
        time={selectedTime || requestedTime}
        onBookAnother={resetJourney}
      />
    )
  }


  return (
    <div ref={wizardRef} className="mx-auto max-w-[640px]">
    <Card accent>
      <CardBody className="space-y-6">
        <BookingProgressBar
          currentStep={currentStepIndex + 1}
          totalSteps={stepKeys.length}
          stepKeys={stepKeys}
          stepLabels={stepLabels}
        />

        {error && (
          <Alert variant="error" title="Booking not completed">
            <p>{error}</p>
            <p className="mt-2">
              Call <PhoneLink phone={CONTACT.phone} source="table_booking_error" showIcon={false} className="font-semibold underline">01753 682707</PhoneLink> if you need help.
            </p>
          </Alert>
        )}

        {step === 'find' && twoScreenFlow && (
          <div className="space-y-5">
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                void handleFindTable()
              }}
            >
              <div>
                <h3 className="font-display text-h4 text-ink-strong">Find a table</h3>
                <p className="mt-1 text-sm text-ink-muted">
                  Tell us how many of you there are and when. We will show every time we can take.
                </p>
              </div>

              {hoursNote ? (
                <div className="rounded-sm border border-line bg-surface-sunk p-3 text-sm text-ink">
                  <p className="font-semibold text-ink-strong">{formatDateForDisplay(date)}</p>
                  <p className="mt-1">{hoursNote.summary}</p>
                  {hoursNote.footer ? (
                    <p className="mt-2 text-xs text-ink-muted">{hoursNote.footer}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Party size"
                  type="number"
                  size="lg"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={1}
                  max={20}
                  required
                  value={partySizeDisplay}
                  onChange={(event) => {
                    markFunnelStart()
                    // Typing only. Party size invalidates the reading, so
                    // committing it per character would fire a search per
                    // digit: "12" would ask about 1, then 12. It settles on
                    // blur, or when "Find a table" reads the typed value.
                    setPartySizeDisplay(event.target.value)
                  }}
                  onBlur={() => {
                    const parsed = Number.parseInt(partySizeDisplay, 10)
                    const clamped = !Number.isFinite(parsed) || parsed < 1 ? 1 : Math.min(parsed, 20)
                    setPartySizeDisplay(String(clamped))
                    if (clamped === partySize) return
                    // A settled change. The invalidation effect re-reads with
                    // it and keeps the chosen time only if it survives.
                    setPartySize(clamped)
                    supersedeAlternatives()
                  }}
                />

                <Input
                  label="Date"
                  type="date"
                  size="lg"
                  min={today}
                  max={maxBookingDate || undefined}
                  required
                  value={date}
                  onChange={(event) => handleDateChange(event.target.value)}
                  error={dateError || undefined}
                />
              </div>

              {requiresGroupDeposit ? (
                <Badge variant="sand" className="block w-full whitespace-normal text-left leading-snug">
                  Groups of 10 or more: a £10 per person deposit, fully deducted from your bill.
                </Badge>
              ) : null}

              <div
                className="rounded-sm border border-line bg-surface-sunk p-3 text-sm text-ink"
                aria-live="polite"
              >
                <p className="font-medium text-ink-strong">{aircraftOverheadNote.message}</p>
                <p className="mt-1 text-xs text-ink-muted">{aircraftOverheadNote.caveat}</p>
              </div>

              {availabilityError && (
                <Alert variant="warning">
                  <p>{availabilityError}</p>
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={availabilityLoading}
                icon={<ArrowRight aria-hidden="true" className="h-4 w-4" />}
                iconPosition="right"
              >
                Find a table
              </Button>
            </form>

            {currentReading ? (
              <div className="space-y-4 border-t border-line pt-5">
                {/* Every question that changes which TABLES qualify, directly
                    above the times it filters (spec D2). Nothing here may ever
                    move to screen 2. */}
                <TableRefinements
                  drinksOnly={drinksOnly}
                  onDrinksOnlyChange={(value) => {
                    setDrinksOnly(value)
                    trackOptionToggled({ option: 'drinks_only', value, step })
                  }}
                  isOutsideSeating={isOutsideSeating}
                  onOutsideSeatingChange={(value) => {
                    setIsOutsideSeating(value)
                    trackOptionToggled({ option: 'outside_seating', value, step })
                  }}
                  requiresAccessibleTable={requiresAccessibleTable}
                  // Deliberately untracked, see TableRefinements and the rules
                  // at the top of lib/gtm-events.ts.
                  onRequiresAccessibleTableChange={setRequiresAccessibleTable}
                  highChairCount={highChairCount}
                  onHighChairCountChange={(value) => {
                    setHighChairCount(value)
                    trackOptionToggled({ option: 'high_chair_count', value, step })
                  }}
                />

                {/* The seasonal question sits ABOVE the times, because the
                    answer changes both the menu and the price of the slot
                    underneath it. Absent for most of the year: no live period
                    means nothing renders and the journey is unchanged. */}
                {seasonal.period ? (
                  <SeasonalPeriodQuestion
                    period={seasonal.period}
                    deposit={seasonal.deposit}
                    answer={seasonal.answer}
                    onAnswer={seasonal.setAnswer}
                  />
                ) : null}

                <div>
                  <h3 className="font-display text-h4 text-ink-strong">Choose your time</h3>
                  <p className="mt-1 text-sm text-ink-muted">
                    {formatDateForDisplay(date)} for {partySize}{' '}
                    {partySize === 1 ? 'guest' : 'guests'}.
                  </p>
                </div>

                {revalidatingAvailability ? (
                  <p className="text-sm text-ink-muted" aria-live="polite">
                    Checking which times still work with your options...
                  </p>
                ) : null}

                {slotDroppedNotice ? (
                  <div
                    className="rounded-md border border-anchor-gold bg-surface-raised p-4 text-sm text-ink"
                    aria-live="polite"
                  >
                    <p>{slotDroppedNotice}</p>
                  </div>
                ) : null}

                {foodCheckUnavailable ? renderFoodCheckNotice('grid') : null}

                {availabilityUnknown ? (
                  <div
                    className="space-y-3 rounded-md border border-line bg-surface-sunk p-4 text-sm text-ink"
                    aria-live="polite"
                  >
                    <p className="font-semibold text-ink-strong">We could not check live availability</p>
                    {currentReading?.message || availabilityError ? (
                      <p>{currentReading?.message || availabilityError}</p>
                    ) : null}
                    <p>
                      Please try again in a moment. If it keeps happening, give us a ring on{' '}
                      <PhoneLink
                        phone={CONTACT.phone}
                        source="table_booking_availability_unknown"
                        showIcon={false}
                        className="font-semibold underline"
                      >
                        01753 682707
                      </PhoneLink>{' '}
                      and we will book you in.
                    </p>
                    <Button
                      type="button"
                      variant="primary"
                      className="w-full sm:w-auto min-h-12"
                      loading={availabilityLoading}
                      onClick={() => void handleFindTable()}
                    >
                      Try again
                    </Button>
                  </div>
                ) : groupedSlots.selectableTimes.length > 0 ? (
                  <>
                    <SlotPickerGrid
                      grouped={groupedSlots}
                      selectedTime={selectedTime}
                      onSelect={handleSlotSelect}
                    />

                    {groupedSlots.hiddenForHighChairs > 0 ? (
                      <p className="text-sm text-ink-muted">
                        Some times are not shown because every high chair is taken then. Set high
                        chairs to 0 to see them.
                      </p>
                    ) : null}

                    {selectedSlotAdvisory ? (
                      <div className="rounded-md border border-anchor-gold bg-surface-sunk p-4 text-sm text-ink">
                        <p>{selectedSlotAdvisory}</p>
                        {quieterTimeLabel ? (
                          <p className="mt-2">{quieterTimeLabel} may be a smoother option.</p>
                        ) : null}
                        {quieterSlots.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {quieterSlots.map((slot) => (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() => handleSlotSelect(slot)}
                                className="min-h-12 rounded-pill border border-line-strong bg-surface px-3 py-2 text-sm font-medium text-ink hover:border-anchor-gold"
                              >
                                {formatTimeForDisplay(slot.time)}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : allTimesHiddenForHighChairs ? (
                  <Alert variant="warning" title="No high chairs left on this date">
                    <p>
                      Every time on {formatDateForDisplay(date)} has its high chairs taken. Set high
                      chairs to 0 to see the times we can offer, try another date, or give us a ring
                      on{' '}
                      <PhoneLink
                        phone={CONTACT.phone}
                        source="table_booking_no_high_chairs"
                        showIcon={false}
                        className="font-semibold underline"
                      >
                        01753 682707
                      </PhoneLink>
                      .
                    </p>
                  </Alert>
                ) : (
                  <Alert
                    variant="warning"
                    title={
                      sameDateAlternatives.length > 0
                        ? 'That time is not available online'
                        : 'No online times available'
                    }
                  >
                    <p>
                      {sameDateAlternatives.length > 0
                        ? 'Other times on this date are still open. Pick one of the times below, or join the waitlist.'
                        : currentReading?.message ||
                          `We couldn't find an online slot for that request. Try one of the nearest alternatives below, or join the waitlist.`}
                    </p>
                    {currentReading?.special_notes ? (
                      <p className="mt-2">{currentReading.special_notes}</p>
                    ) : null}
                    {!drinksOnly ? (
                      <p className="mt-2">
                        If you only want drinks, tick &quot;Just drinks, no food&quot; above and we
                        will show the bar times too.
                      </p>
                    ) : null}
                  </Alert>
                )}

                {(showDateEventSuggestions || selectedDateEventsLoading) &&
                  renderDateEventSuggestions({
                    title:
                      groupedSlots.selectableTimes.length === 0
                        ? 'There are events on this date'
                        : 'Also happening on this date',
                    description:
                      groupedSlots.selectableTimes.length === 0
                        ? 'If table times are limited, you can switch to one of these events right away.'
                        : 'You can continue with your table booking, or switch to an event if that suits your plans better.',
                    context:
                      groupedSlots.selectableTimes.length === 0
                        ? 'find_step_no_availability'
                        : 'find_step_with_availability',
                    highlight: groupedSlots.selectableTimes.length === 0
                  })}

                {groupedSlots.selectableTimes.length === 0 &&
                !availabilityUnknown &&
                !allTimesHiddenForHighChairs ? (
                  <div className="space-y-3 rounded-md border border-line bg-surface-sunk p-4">
                    <p className="text-sm font-semibold text-ink-strong">Nearest alternatives</p>

                    {alternativesLoading ? (
                      <p className="text-sm text-ink-muted">Finding nearby options...</p>
                    ) : alternativeSlots.length > 0 ? (
                      <div className="space-y-2">
                        {alternativeSlots.map((option) => (
                          <button
                            key={`${option.date}-${option.time}`}
                            type="button"
                            onClick={() => handleChooseAlternative(option)}
                            // A re-read is in flight, so this panel is about to be replaced.
                            // Taking one of these now would move the guest to the details
                            // step under an answer that is already being superseded.
                            disabled={revalidatingAvailability}
                            // Same shortfall flag the grid prints, for the same
                            // reason: this button books a table, so a chair
                            // shortfall has to be on it before it is tapped.
                            aria-label={[
                              formatDateForDisplay(option.date),
                              formatTimeForDisplay(option.time),
                              ...(option.highChairsFree !== undefined
                                ? [highChairFlagLabel(option.highChairsFree)]
                                : [])
                            ].join(', ')}
                            className="flex min-h-12 w-full items-center justify-between gap-3 rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-3 text-left text-base hover:border-anchor-gold"
                          >
                            <span className="font-medium text-ink">
                              {formatDateForDisplay(option.date)}
                            </span>
                            <span className="flex items-baseline gap-2">
                              {option.highChairsFree !== undefined ? (
                                <span className="text-xs font-medium text-anchor-gold-dark">
                                  {highChairFlagLabel(option.highChairsFree)}
                                </span>
                              ) : null}
                              <span className="text-accent-text font-semibold">
                                {formatTimeForDisplay(option.time)}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-ink-muted">No nearby online alternatives were found.</p>
                    )}

                    <div className="rounded-sm border border-line bg-surface-raised p-3 text-sm text-ink">
                      <p className="font-semibold text-ink-strong">Join waitlist</p>
                      <p className="mt-1">Call us and we&apos;ll add you to the waitlist for cancellations.</p>
                      <div className="mt-2">
                        <PhoneButton
                          phone={CONTACT.phone}
                          source="table_booking_waitlist"
                          size="sm"
                          variant="outline"
                          className="min-h-12"
                        >
                          Join waitlist by phone
                        </PhoneButton>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Gated on the rule, not on the stored time. A refinement or a
                    party-size change can take the chosen time off the grid, and
                    a button reading only `selectedTime` would carry the guest
                    forward on a slot that is no longer shown. */}
                {hasUsableSelection ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={<ArrowRight aria-hidden="true" className="h-4 w-4" />}
                    iconPosition="right"
                    disabled={revalidatingAvailability || seasonalAnswerRequired}
                    onClick={() => {
                      setStep('details')
                      setError(null)
                    }}
                  >
                    {selectedSlot && shouldNudgeForBusyness(selectedSlot.busyness)
                      ? `Book ${formatTimeForDisplay(selectedSlot.time)} anyway`
                      : `Continue with ${formatTimeForDisplay(selectedTime)}`}
                  </Button>
                ) : null}

                {/* Say WHY Continue is unavailable. A disabled button with no
                    explanation is how a guest decides the site is broken and
                    rings instead. */}
                {hasUsableSelection && seasonalAnswerRequired ? (
                  <p className="text-sm text-ink-muted" aria-live="polite">
                    Please answer the question above before continuing.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        )}

        {step === 'find' && !twoScreenFlow && (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void handleFindTable()
            }}
          >
            <div>
              <h3 className="font-display text-h4 text-ink-strong">Find a table</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {`Start with party size, date, and time. We'll ask for contact details after you pick a slot.`}
              </p>
            </div>

            {hoursNote ? (
              <div className="rounded-sm border border-line bg-surface-sunk p-3 text-sm text-ink">
                <p className="font-semibold text-ink-strong">
                  {formatDateForDisplay(date)}
                </p>
                <p className="mt-1">{hoursNote.summary}</p>
                {hoursNote.footer ? (
                  <p className="mt-2 text-xs text-ink-muted">{hoursNote.footer}</p>
                ) : null}
              </div>
            ) : null}

            <Input
              label="Party Size"
              type="number"
              size="lg"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              max={20}
              required
              value={partySizeDisplay}
              onChange={(event) => {
                markFunnelStart()
                const raw = event.target.value
                setPartySizeDisplay(raw)
                if (raw === '') return
                const parsed = Number.parseInt(raw, 10)
                if (Number.isNaN(parsed)) return
                const clamped = Math.min(Math.max(parsed, 1), 20)
                setPartySize(clamped)
                setSelectedSlotService(null)
                setShowAllTimes(false)
                supersedeAlternatives()
              }}
              onBlur={() => {
                const parsed = Number.parseInt(partySizeDisplay, 10)
                const clamped = (!Number.isFinite(parsed) || parsed < 1) ? 1 : Math.min(parsed, 20)
                setPartySize(clamped)
                setPartySizeDisplay(String(clamped))
                setSelectedSlotService(null)
                setShowAllTimes(false)
                supersedeAlternatives()
              }}
            />

            {requiresGroupDeposit ? (
              <Badge variant="sand" className="block w-full whitespace-normal text-left leading-snug">
                Groups of 10 or more: a £10 per person deposit, fully deducted from your bill.
              </Badge>
            ) : null}

            {/*
              Two questions, both optional, both placed BEFORE times are shown because each
              changes which tables qualify. Asking after a time is chosen would mean the guest
              picks a slot that was never valid for them.
            */}
            <div className="space-y-3 rounded-lg border border-line bg-surface-subtle p-4">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={drinksOnly}
                  onChange={(event) => {
                    setDrinksOnly(event.target.checked)
                    trackOptionToggled({ option: 'drinks_only', value: event.target.checked, step })
                  }}
                  className="mt-0.5 h-4 w-4"
                />
                <span>
                  <span className="font-medium text-ink-strong">Just drinks</span>
                  <span className="block text-ink-muted">
                    We will seat you in the bar and show times when the kitchen is closed too.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={requiresAccessibleTable}
                  onChange={(event) => {
                    // Deliberately NOT tracked. A step-free seating request
                    // infers a mobility impairment, which is special-category
                    // data under UK GDPR Article 9, and analytics-cookie
                    // consent is not Article 9 explicit consent. See the rules
                    // at the top of lib/gtm-events.ts.
                    setRequiresAccessibleTable(event.target.checked)
                  }}
                  className="mt-0.5 h-4 w-4"
                />
                <span>
                  <span className="font-medium text-ink-strong">
                    I need an accessible table
                  </span>
                  <span className="block text-ink-muted">
                    Step-free, with standard-height seating rather than bar stools.
                  </span>
                </span>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Date"
                type="date"
                size="lg"
                min={today}
                required
                value={date}
                onChange={(event) => handleDateChange(event.target.value)}
                error={dateError || undefined}
              />

              <Input
                label="Preferred Time"
                type="time"
                size="lg"
                required
                value={requestedTime}
                onChange={(event) => handleRequestedTimeChange(event.target.value)}
              />
            </div>

            <div
              className="rounded-sm border border-line bg-surface-sunk p-3 text-sm text-ink"
              aria-live="polite"
            >
              <p className="font-medium text-ink-strong">{aircraftOverheadNote.message}</p>
              <p className="mt-1 text-xs text-ink-muted">{aircraftOverheadNote.caveat}</p>
            </div>

            {(showDateEventSuggestions || selectedDateEventsLoading) &&
              renderDateEventSuggestions({
                title: 'Events on this date',
                description:
                  'If you were planning a night out, you can switch to an event booking in one tap.',
                context: 'find_step'
              })}

            {selectedDateEventError && !showDateEventSuggestions && !selectedDateEventsLoading ? (
              <p className="text-xs text-ink-muted">{selectedDateEventError}</p>
            ) : null}

            {availabilityError && (
              <Alert variant="warning">
                <p>{availabilityError}</p>
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={availabilityLoading}
              icon={<ArrowRight aria-hidden="true" className="h-4 w-4" />}
              iconPosition="right"
            >
              Find a table
            </Button>
          </form>
        )}

        {step === 'choose' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-h4 text-ink-strong">Choose your time</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {formatDateForDisplay(date)} for {partySize} {partySize === 1 ? 'guest' : 'guests'}.
              </p>
            </div>

            {availabilityLoading ? (
              <p className="text-sm text-ink-muted">Checking available times...</p>
            ) : null}

            {/* Deliberately outside the slot-list branch so this renders on
                exactly the same condition as its twin on the review step. It
                used to sit inside the "there are slots" branch, so the two
                could disagree about whether the guest had been told. */}
            {foodCheckUnavailable ? renderFoodCheckNotice('grid') : null}

            {availabilityUnknown ? (
              <div
                className="space-y-3 rounded-md border border-line bg-surface-sunk p-4 text-sm text-ink"
                aria-live="polite"
              >
                <p className="font-semibold text-ink-strong">We could not check live availability</p>
                {/* The reason, when we have one. Without this a failed retry
                    looked identical to the first failure and the guest had no
                    idea anything had happened. */}
                {currentReading?.message || availabilityError ? (
                  <p>{currentReading?.message || availabilityError}</p>
                ) : null}
                <p>
                  Please try again in a moment. If it keeps happening, give us a ring on{' '}
                  <PhoneLink
                    phone={CONTACT.phone}
                    source="table_booking_availability_unknown"
                    showIcon={false}
                    className="font-semibold underline"
                  >
                    01753 682707
                  </PhoneLink>{' '}
                  and we will book you in.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  className="w-full sm:w-auto min-h-12"
                  loading={availabilityLoading}
                  onClick={() => void handleFindTable()}
                >
                  Try again
                </Button>
              </div>
            ) : availableSlots.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {visibleSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time
                    // Label and submitted purpose both read the SAME field, so
                    // what the guest is shown and what gets booked cannot drift
                    // apart. Combined aria-label so screen readers announce
                    // time and service as one phrase.
                    const servesFood = slot.bookable_purpose === 'food_or_drinks'
                    const serviceCaption = servesFood ? 'drinks and food' : 'drinks only'
                    const loadCaption = busynessCaption(slot.busyness)
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        aria-label={`${formatTimeForDisplay(slot.time)}, ${serviceCaption}${loadCaption ? `, ${loadCaption}` : ''}`}
                        aria-pressed={isSelected}
                        onClick={() => handleSlotSelect(slot)}
                        className={`min-h-16 rounded-pill border-[1.5px] px-3 py-3 text-center transition-colors ${
                          isSelected
                            ? 'border-anchor-green bg-anchor-green text-white'
                            : 'border-line-strong bg-surface text-ink hover:border-anchor-gold'
                        }`}
                      >
                        <span className="block text-base font-semibold">
                          {formatTimeForDisplay(slot.time)}
                        </span>
                        <span className={`mt-1 block text-xs font-normal ${isSelected ? 'text-white/80' : 'text-ink-muted'}`}>
                          {servesFood ? 'Drinks & food' : 'Drinks only'}
                        </span>
                        {loadCaption ? (
                          <span className={`mt-1 block text-xs font-medium ${isSelected ? 'text-white' : slot.busyness === 'busy' ? 'text-anchor-gold-dark' : 'text-ink-muted'}`}>
                            {loadCaption}
                          </span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>

                {!showAllTimes && availableSlots.length > visibleSlots.length ? (
                  <button
                    type="button"
                    onClick={() => setShowAllTimes(true)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-pill border-[1.5px] border-line-strong px-4 py-3 text-base font-medium text-ink transition-colors hover:border-anchor-gold focus:outline-none focus:ring-2 focus:ring-anchor-gold-dark focus:ring-offset-2 sm:w-auto sm:px-6"
                  >
                    See more times
                    <ChevronDown aria-hidden="true" className="h-4 w-4" />
                  </button>
                ) : null}

                {selectedSlotAdvisory ? (
                  <div className="rounded-md border border-anchor-gold bg-surface-sunk p-4 text-sm text-ink">
                    <p>{selectedSlotAdvisory}</p>
                    {quieterTimeLabel ? (
                      <p className="mt-2">
                        {quieterTimeLabel} may be a smoother option.
                      </p>
                    ) : null}
                    {quieterSlots.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {quieterSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => handleSlotSelect(slot)}
                            className="rounded-pill border border-line-strong bg-surface px-3 py-2 text-sm font-medium text-ink hover:border-anchor-gold"
                          >
                            {formatTimeForDisplay(slot.time)}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <Alert variant="warning" title="No online times available">
                <p>
                  {currentReading?.message ||
                    `We couldn't find an online slot for that request. Try one of the nearest alternatives below, or join the waitlist.`}
                </p>
                {currentReading?.special_notes ? <p className="mt-2">{currentReading.special_notes}</p> : null}
              </Alert>
            )}

            {(showDateEventSuggestions || selectedDateEventsLoading) &&
              renderDateEventSuggestions({
                title:
                  availableSlots.length === 0
                    ? 'There are events on this date'
                    : 'Also happening on this date',
                description:
                  availableSlots.length === 0
                    ? 'If table times are limited, you can switch to one of these events right away.'
                    : 'You can continue with your table booking, or switch to an event if that suits your plans better.',
                context:
                  availableSlots.length === 0 ? 'choose_step_no_availability' : 'choose_step_with_availability',
                highlight: availableSlots.length === 0
              })}

            {availableSlots.length === 0 && !availabilityUnknown && (
              <div className="space-y-3 rounded-md border border-line bg-surface-sunk p-4">
                <p className="text-sm font-semibold text-ink-strong">Nearest alternatives</p>

                {alternativesLoading ? (
                  <p className="text-sm text-ink-muted">Finding nearby options...</p>
                ) : alternativeSlots.length > 0 ? (
                  <div className="space-y-2">
                    {alternativeSlots.map((option) => (
                      <button
                        key={`${option.date}-${option.time}`}
                        type="button"
                        onClick={() => handleChooseAlternative(option)}
                        // A re-read is in flight, so this panel is about to be replaced.
                        // Taking one of these now would move the guest to the details
                        // step under an answer that is already being superseded.
                        disabled={revalidatingAvailability}
                        className="flex min-h-12 w-full items-center justify-between rounded-sm border-[1.5px] border-line-strong bg-surface px-3 py-3 text-left text-base hover:border-anchor-gold"
                      >
                        <span className="font-medium text-ink">{formatDateForDisplay(option.date)}</span>
                        <span className="text-accent-text font-semibold">{formatTimeForDisplay(option.time)}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted">No nearby online alternatives were found.</p>
                )}

                <div className="rounded-sm border border-line bg-surface-raised p-3 text-sm text-ink">
                  <p className="font-semibold text-ink-strong">Join waitlist</p>
                  <p className="mt-1">Call us and we'll add you to the waitlist for cancellations.</p>
                  <div className="mt-2">
                    <PhoneButton phone={CONTACT.phone} source="table_booking_waitlist" size="sm" variant="outline" className="min-h-12">
                      Join waitlist by phone
                    </PhoneButton>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto min-h-12"
                icon={<ArrowLeft aria-hidden="true" className="h-4 w-4" />}
                iconPosition="left"
                onClick={handleBackToFind}
              >
                Back
              </Button>

              {/* The same gate as the two-screen grid, for the same reason. */}
              {hasUsableSelection ? (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                  icon={<ArrowRight aria-hidden="true" className="h-4 w-4" />}
                  iconPosition="right"
                  onClick={() => {
                    setStep('details')
                    setError(null)
                  }}
                >
                  {selectedSlot && shouldNudgeForBusyness(selectedSlot.busyness)
                    ? `Book ${formatTimeForDisplay(selectedSlot.time)} anyway`
                    : 'Continue'}
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {step === 'details' && twoScreenFlow && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-h4 text-ink-strong">Your details</h3>
              <p className="mt-1 text-sm text-ink-muted">
                Last thing. We need a mobile number so we can confirm your table.
              </p>
            </div>

            {/* Everything they are about to book, stated once, here (spec D8).
                There is deliberately nothing on this screen that changes which
                tables qualify: those questions were all answered on screen 1. */}
            <BookingSummaryCard
              partySize={partySize}
              date={date}
              time={selectedTime || requestedTime}
              bookingPurpose={reviewBookingPurpose}
              isOutsideSeating={isOutsideSeating}
              requiresAccessibleTable={requiresAccessibleTable}
              highChairCount={highChairCount}
              highChairsFreeAtSlot={highChairShortfall?.free}
              depositAmount={requiresGroupDeposit ? groupDepositAmount : 0}
              depositNote={LARGE_GROUP_DEPOSIT_POLICY_COPY}
            />

            {/* Repeated from the grid because this is where the guest commits.
                Someone who skimmed the times could otherwise reach Confirm with
                nothing on screen telling them they are booking drinks. */}
            {foodCheckUnavailable ? renderFoodCheckNotice('review') : null}

            {selectedSlotAdvisory ? (
              <div className="rounded-md border border-anchor-gold bg-surface-sunk p-4 text-sm text-ink">
                <p className="font-semibold text-ink-strong">Worth knowing before you confirm</p>
                <p className="mt-1">{selectedSlotAdvisory}</p>
              </div>
            ) : null}

            <div className="rounded-md border border-line bg-surface-sunk p-4">
              <Input
                label="Mobile Number"
                type="tel"
                size="lg"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phone}
                disabled={detailsUnlocked}
                onChange={(event) => {
                  markFunnelStart()
                  setPhone(event.target.value)
                }}
                placeholder="07xxx xxxxxx"
                helperText="We only use this for booking confirmation and reminders."
              />

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {!detailsUnlocked ? (
                  <Button
                    type="button"
                    size="md"
                    className="w-full sm:w-auto min-h-12"
                    loading={lookupState === 'loading'}
                    onClick={handlePhoneLookup}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="md"
                    variant="outline"
                    className="w-full sm:w-auto min-h-12"
                    onClick={resetPhoneLookup}
                  >
                    Use Different Number
                  </Button>
                )}
              </div>

              {lookupError ? <p className="mt-3 text-sm text-anchor-danger">{lookupError}</p> : null}

              {isKnownCustomer ? (
                <p className="mt-3 text-sm font-medium text-accent-text">
                  Welcome back. We recognise this number, so we&apos;ve skipped your personal details.
                </p>
              ) : null}

              {lookupState === 'unknown' ? (
                <p className="mt-3 text-sm font-medium text-ink">
                  {lookupDegraded
                    ? 'We could not verify this number right now. Please continue by entering your details below.'
                    : 'New customer detected. Please complete your details below.'}
                </p>
              ) : null}
            </div>

            {detailsUnlocked && !isKnownCustomer ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="First Name"
                  type="text"
                  size="lg"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="John"
                />
                <Input
                  label="Last name (optional)"
                  type="text"
                  size="lg"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Smith"
                />
                <div className="md:col-span-2">
                  <Input
                    label="Email (optional)"
                    type="email"
                    size="lg"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
              </div>
            ) : null}

            {detailsUnlocked ? (
              <Textarea
                label="Notes (optional)"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Special requests, dietary needs, occasion details..."
                rows={3}
              />
            ) : null}

            {detailsUnlocked ? (
              <CommunicationConsentFields
                value={communicationConsent}
                onChange={setCommunicationConsent}
              />
            ) : null}

            <p className="text-sm text-ink-muted">
              Plans changed?{' '}
              <PhoneLink
                phone={CONTACT.phone}
                source="table_booking_change"
                showIcon={false}
                className="font-semibold underline"
              >
                A quick call to 01753 682707
              </PhoneLink>{' '}
              lets us offer your table to someone else. Thanks for letting us know.
            </p>

            {result?.state === 'pending_payment' ? (
              renderPendingPayment()
            ) : (
              <>
                {/* Honeypot, hidden from real users, filled by bots */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px',
                    opacity: 0,
                    height: 0,
                    overflow: 'hidden'
                  }}
                >
                  <label htmlFor="website-two-screen">Website</label>
                  <input
                    id="website-two-screen"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                {detailsUnlocked && TURNSTILE_SITE_KEY && (
                  <TurnstileField
                    id="table-booking-turnstile"
                    turnstileRef={turnstileRef}
                    onTokenChange={setTurnstileToken}
                  />
                )}

                {detailsUnlocked ? (
                  <label className="flex min-h-12 items-start gap-2 py-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={policyAccepted}
                      onChange={(event) => setPolicyAccepted(event.target.checked)}
                      className="mt-1 accent-anchor-green"
                    />
                    <span>
                      I understand The Anchor&apos;s booking and no-show policy, and I agree to continue.
                    </span>
                  </label>
                ) : null}

                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap sm:justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full sm:w-auto min-h-12"
                    icon={<ArrowLeft aria-hidden="true" className="h-4 w-4" />}
                    iconPosition="left"
                    onClick={handleBackToChoose}
                    disabled={loading}
                  >
                    Back
                  </Button>

                  {detailsUnlocked ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto"
                      loading={loading}
                      disabled={TURNSTILE_SITE_KEY ? !turnstileToken : false}
                      icon={<Check aria-hidden="true" className="h-4 w-4" />}
                      iconPosition="right"
                      onClick={handleConfirmBooking}
                    >
                      {requiresGroupDeposit ? 'Confirm and pay deposit' : 'Confirm booking'}
                    </Button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        )}

        {step === 'details' && !twoScreenFlow && (
          <div className="space-y-4">
            <div className="rounded-md border border-line bg-surface-sunk p-4 text-sm text-ink">
              <p>
                <strong className="text-ink-strong">{partySize}</strong> guests on <strong className="text-ink-strong">{formatDateForDisplay(date)}</strong> at{' '}
                <strong className="text-ink-strong">{formatTimeForDisplay(selectedTime || requestedTime)}</strong>
              </p>
              {/* Continue is refused while a re-read is in flight, so the guest
                  has to be able to see that something is actually happening.
                  Without this the refusal message appeared with no explanation
                  anywhere on screen. */}
              {revalidatingAvailability ? (
                <p className="mt-2 text-ink-muted" aria-live="polite">
                  Checking that time is still free with your new options...
                </p>
              ) : null}
            </div>

            <div className="rounded-md border border-line bg-surface-sunk p-4">
              <Input
                label="Mobile Number"
                type="tel"
                size="lg"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phone}
                disabled={detailsUnlocked}
                onChange={(event) => {
                  markFunnelStart()
                  setPhone(event.target.value)
                }}
                placeholder="07xxx xxxxxx"
                helperText="We only use this for booking confirmation and reminders."
              />

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {!detailsUnlocked ? (
                  <Button
                    type="button"
                    size="md"
                    className="w-full sm:w-auto min-h-12"
                    loading={lookupState === 'loading'}
                    onClick={handlePhoneLookup}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="md"
                    variant="outline"
                    className="w-full sm:w-auto min-h-12"
                    onClick={resetPhoneLookup}
                  >
                    Use Different Number
                  </Button>
                )}
              </div>

              {lookupError ? <p className="mt-3 text-sm text-anchor-danger">{lookupError}</p> : null}

              {isKnownCustomer ? (
                <p className="mt-3 text-sm font-medium text-accent-text">
                  Welcome back. We recognise this number, so we've skipped your personal details.
                </p>
              ) : null}

              {lookupState === 'unknown' ? (
                <p className="mt-3 text-sm font-medium text-ink">
                  {lookupDegraded
                    ? 'We could not verify this number right now. Please continue by entering your details below.'
                    : 'New customer detected. Please complete your details below.'}
                </p>
              ) : null}
            </div>

            {detailsUnlocked && !isKnownCustomer ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="First Name"
                  type="text"
                  size="lg"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="John"
                />
                <Input
                  label="Last name (optional)"
                  type="text"
                  size="lg"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Smith"
                />
                <div className="md:col-span-2">
                  <Input
                    label="Email (optional)"
                    type="email"
                    size="lg"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
              </div>
            ) : null}

            {detailsUnlocked ? (
              <Textarea
                label="Notes (optional)"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Special requests, accessibility needs, occasion details..."
                rows={3}
              />
            ) : null}

            {detailsUnlocked ? (
              <div className="space-y-3 rounded-md border border-line bg-surface-sunk p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink-strong">High chair (for a baby)</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {hideHighChairPicker
                        ? "Sorry, all our high chairs are booked for this time. If you need one, please try another time slot; you're very welcome to book here without one."
                        : 'We have a limited number, reserved on a first-come basis.'}
                    </p>
                  </div>
                  {hideHighChairPicker ? null : (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-10 min-h-0 p-0"
                        aria-label="Fewer high chairs"
                        disabled={highChairCount <= 0}
                        onClick={() => {
                          const next = Math.max(0, highChairCount - 1)
                          setHighChairCount(next)
                          trackOptionToggled({ option: 'high_chair_count', value: next, step })
                        }}
                      >
                        &#8722;
                      </Button>
                      <span
                        className="w-6 text-center text-base font-semibold text-ink-strong"
                        aria-live="polite"
                      >
                        {highChairCount}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-10 min-h-0 p-0"
                        aria-label="More high chairs"
                        disabled={highChairCount >= HIGH_CHAIR_HOUSE_CAP}
                        onClick={() => {
                          const next = Math.min(HIGH_CHAIR_HOUSE_CAP, highChairCount + 1)
                          setHighChairCount(next)
                          trackOptionToggled({ option: 'high_chair_count', value: next, step })
                        }}
                      >
                        +
                      </Button>
                    </div>
                  )}
                </div>

                {highChairShortfall ? (
                  <div className="rounded-md border border-anchor-gold bg-surface-raised p-3 text-sm text-ink">
                    <p>
                      {highChairShortfall.free === 0
                        ? 'No high chairs are free at this time. Book anyway?'
                        : highChairShortfall.free === 1
                        ? 'Only 1 high chair is free at this time. Book with 1?'
                        : `Only ${highChairShortfall.free} high chairs are free at this time. Book with ${highChairShortfall.free}?`}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      We&apos;ll keep your request for {highChairShortfall.requested} on the booking and do our best on the day.
                    </p>
                    {highChairShortfall && highChairShortfallAcknowledged ? (
                      <p className="mt-2 text-xs font-medium text-accent-text">
                        Thanks, that&apos;s noted for your booking.
                      </p>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-2 min-h-12"
                        onClick={() =>
                          setHighChairConsent({
                            date,
                            time: selectedTime,
                            free: highChairShortfall.free,
                            requested: highChairShortfall.requested
                          })
                        }
                      >
                        {highChairShortfall.free === 0
                          ? 'Yes, book anyway'
                          : `Yes, book with ${highChairShortfall.free}`}
                      </Button>
                    )}
                  </div>
                ) : null}

                <label className="flex items-start gap-2 pt-1 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={isOutsideSeating}
                    onChange={(event) => {
                      setIsOutsideSeating(event.target.checked)
                      trackOptionToggled({ option: 'outside_seating', value: event.target.checked, step })
                    }}
                    className="mt-1 accent-anchor-green"
                  />
                  <span>I&apos;d like an outside table (weather permitting)</span>
                </label>
              </div>
            ) : null}

            {detailsUnlocked ? (
              <CommunicationConsentFields
                value={communicationConsent}
                onChange={setCommunicationConsent}
              />
            ) : null}

            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto min-h-12"
                icon={<ArrowLeft aria-hidden="true" className="h-4 w-4" />}
                iconPosition="left"
                onClick={handleBackToChoose}
              >
                Back
              </Button>

              {detailsUnlocked ? (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                  icon={<ArrowRight aria-hidden="true" className="h-4 w-4" />}
                  iconPosition="right"
                  onClick={handleContinueToReview}
                >
                  Continue to review
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-h4 text-ink-strong">Review your booking</h3>
              <p className="mt-1 text-sm text-ink-muted">Check details, then confirm your booking.</p>
            </div>

            {/* Repeated here because this is where the guest commits. Someone
                who skimmed the grid could otherwise reach Confirm with nothing
                on screen telling them they are booking drinks. */}
            {foodCheckUnavailable ? renderFoodCheckNotice('review') : null}

            <div className="rounded-md border border-line bg-surface-sunk p-4 text-sm">
              <dl className="space-y-2 text-ink">
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-ink-muted">Party size</dt>
                  <dd className="text-ink-strong">{partySize}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-ink-muted">Date</dt>
                  <dd className="text-ink-strong">{formatDateForDisplay(date)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-ink-muted">Time</dt>
                  <dd className="text-ink-strong">{formatTimeForDisplay(selectedTime || requestedTime)}</dd>
                </div>
                {/* What is actually being booked. The guest could previously
                    reach Confirm without this ever appearing on screen, so a
                    drinks-only slot could be paid for by someone expecting a
                    roast. Reads the same authoritative purpose as submit. */}
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-ink-muted">Booking</dt>
                  <dd className="text-ink-strong">
                    {/* null means the slot context was lost, which Confirm
                        blocks on anyway. Say that rather than stating a booking
                        type nothing stands behind. */}
                    {reviewBookingPurpose === 'food'
                      ? 'Table for food'
                      : reviewBookingPurpose === 'drinks'
                      ? 'Drinks only'
                      : 'Please choose your time again'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-ink-muted">Mobile</dt>
                  <dd className="text-ink-strong">{phone}</dd>
                </div>
                {!isKnownCustomer ? (
                  <div className="flex justify-between gap-3">
                    <dt className="font-medium text-ink-muted">Guest</dt>
                    <dd className="text-ink-strong">
                      {[firstName.trim(), lastName.trim()].filter(Boolean).join(' ') || 'Not provided'}
                    </dd>
                  </div>
                ) : null}
                {requiresGroupDeposit ? (
                  <div className="flex justify-between gap-3">
                    <dt className="font-medium text-ink-muted">Deposit due now</dt>
                    <dd className="text-ink-strong">{formatGbpCurrency(groupDepositAmount)}</dd>
                  </div>
                ) : null}
              </dl>
              {requiresGroupDeposit ? (
                <p className="mt-3 text-xs text-ink-muted">
                  {LARGE_GROUP_DEPOSIT_POLICY_COPY}
                </p>
              ) : null}
            </div>

            {selectedSlotAdvisory ? (
              <div className="rounded-md border border-anchor-gold bg-surface-sunk p-4 text-sm text-ink">
                <p className="font-semibold text-ink-strong">Worth knowing before you confirm</p>
                <p className="mt-1">{selectedSlotAdvisory}</p>
              </div>
            ) : null}

            <p className="text-sm text-ink-muted">
              Plans changed?{' '}
              <PhoneLink phone={CONTACT.phone} source="table_booking_change" showIcon={false} className="font-semibold underline">
                A quick call to 01753 682707
              </PhoneLink>{' '}
              lets us offer your table to someone else. Thanks for letting us know.
            </p>

            {result?.state === 'pending_payment' ? (
              renderPendingPayment()
            ) : (
              <>
                {/* Honeypot, hidden from real users, filled by bots */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                {TURNSTILE_SITE_KEY && (
                  <TurnstileField
                    id="table-booking-turnstile"
                    turnstileRef={turnstileRef}
                    onTokenChange={setTurnstileToken}
                  />
                )}

                <label className="flex min-h-12 items-start gap-2 py-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={policyAccepted}
                    onChange={(event) => setPolicyAccepted(event.target.checked)}
                    className="mt-1 accent-anchor-green"
                  />
                  <span>
                    I understand The Anchor's booking and no-show policy, and I agree to continue.
                  </span>
                </label>

                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap sm:justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full sm:w-auto min-h-12"
                    icon={<ArrowLeft aria-hidden="true" className="h-4 w-4" />}
                    iconPosition="left"
                    onClick={() => setStep('details')}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                    loading={loading}
                    disabled={TURNSTILE_SITE_KEY ? !turnstileToken : false}
                    icon={<Check aria-hidden="true" className="h-4 w-4" />}
                    iconPosition="right"
                    onClick={handleConfirmBooking}
                  >
                    {requiresGroupDeposit ? 'Confirm and pay deposit' : 'Confirm booking'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </CardBody>
    </Card>
    </div>
  )
}

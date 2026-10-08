'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/primitives/Button'
import { Input } from '@/components/ui/primitives/Input'
import { StickyDrawer } from '@/components/ui/overlays/StickyDrawer'
import { GUEST_TABLE_COMPACT_CONSENT_NOTICE } from '@/lib/communication-consent'
import {
  fetchAvailability,
  NEUTRAL_AVAILABILITY_ANCHOR_TIME,
  busynessCaption,
  type AvailabilityData,
} from '@/lib/table-booking/availability'
import {
  DEFAULT_PARTY_SIZE,
  QUICK_BOOK_MAX_PARTY,
  buildQuickBookIntentFingerprint,
  buildQuickBookPayload,
  buildQuickBookRequestBody,
  defaultQuickBookState,
  findQuickBookRefusal,
  fullFormHref,
  quickDateChoices,
  resolveEmptyState,
  selectableSlots,
  type QuickBookState,
} from '@/lib/table-booking/quick-book'
import { createClientIdempotencyKey } from '@/lib/table-booking-idempotency'
import {
  BLOCKED_REASON_COPY,
  confirmationDeliveryCopy,
  type ManagementTableBookingResult,
} from '@/lib/table-booking/submission'
import { toGuestMessage } from '@/lib/guest-error-messages'
import { TurnstileField, type TurnstileFieldRef } from '@/components/security/TurnstileField'
import {
  trackTableBookingClick,
  trackFormStart,
  trackFormComplete,
  trackBookingErrorShown,
} from '@/lib/gtm-events'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

type QuickBookSheetProps = {
  open: boolean
  onClose: () => void
  /** Where the sheet was opened from, for attribution. */
  source: string
}

// 'payment' is a table that is HELD, not booked: the management app wants a
// deposit before it will confirm. It is its own screen so it can never be
// mistaken for 'done'.
type Phase = 'choose' | 'details' | 'payment' | 'done'

const PHONE_DISPLAY = '01753 682707'
const PHONE_HREF = 'tel:+441753682707'
const SUBMIT_FAILED_COPY = `We could not complete your booking. Please try again, or ring us on ${PHONE_DISPLAY}.`
// Word for word what the full form says for the same answer.
const INCOMPLETE_RESPONSE_COPY = 'Booking response was incomplete. Please try again.'

/** A payment link is only ever followed if it is a plain https address. */
function safePaymentUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try {
    return new URL(value).protocol === 'https:' ? value : null
  } catch {
    return null
  }
}

/**
 * Two taps and a phone number.
 *
 * The full wizard at /book-table asks the right questions for a complicated booking:
 * high chairs, accessible tables, outside seating, deposits, seasonal menus. For the
 * ordinary case, a table for two tonight, all of that is friction between a guest and a
 * booking they had already decided to make.
 *
 * So this sheet does not reimplement the wizard, it short-circuits it. Everything it can
 * assume, it assumes; everything it cannot, it hands to the full form with the guest's
 * answers carried across. It deliberately owns NO business rules of its own: availability,
 * purpose and validation all come from the same modules the wizard uses, so the two cannot
 * drift into disagreeing about what is bookable.
 */
export function QuickBookSheet({ open, onClose, source }: QuickBookSheetProps) {
  const [state, setState] = useState<QuickBookState>(defaultQuickBookState)
  const [phase, setPhase] = useState<Phase>('choose')
  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [error, setError] = useState<string | null>(null)
  // Why the booking system refused the time the guest asked for. Kept apart from
  // `error` because the two mean different things on the time grid: an error
  // replaces the grid (there are no times to trust), a refusal sits above it
  // (the other times are still good).
  const [refusal, setRefusal] = useState<string | null>(null)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  // Bumped to ask for the times again without changing what was asked.
  const [availabilityRefresh, setAvailabilityRefresh] = useState(0)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [reference, setReference] = useState<string | null>(null)
  // The management app confirms by email first when the guest has a usable
  // address on file, so the done screen names the channel the API reports.
  const [deliveryChannel, setDeliveryChannel] = useState<ManagementTableBookingResult['notification_channel']>(null)
  // /api/table-bookings runs the shared spam guard, which requires BOTH a
  // Turnstile token and `_t`. This sheet sent neither, so every submission was
  // rejected at the timing check and answered with a fake success: the guest
  // saw "You're booked in.", a form_complete fired, and no booking existed.
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileFieldRef>(null)
  const openedAtRef = useRef<number>(Date.now())

  const dateChoices = useMemo(() => quickDateChoices(), [])
  const phoneRef = useRef<HTMLInputElement | null>(null)
  const startedRef = useRef(false)
  // The Idempotency-Key currently standing for this submit intent, held with the
  // fingerprint it was minted for. Same as the full form's cache: a double tap reuses the
  // key and cannot book twice, while a genuine change mints a fresh one.
  const submitIntentKeyRef = useRef<{ fingerprint: string; key: string } | null>(null)

  const idempotencyKeyFor = useCallback((fingerprint: string): string => {
    if (submitIntentKeyRef.current?.fingerprint === fingerprint) {
      return submitIntentKeyRef.current.key
    }
    const key = createClientIdempotencyKey('tbl_quick')
    submitIntentKeyRef.current = { fingerprint, key }
    return key
  }, [])

  // A fresh sheet every time it opens. Reopening after a booking and finding the previous
  // guest's phone number still in the box is alarming on a shared family phone.
  useEffect(() => {
    if (open) {
      openedAtRef.current = Date.now()
      return
    }
    setTurnstileToken(null)
    setState(defaultQuickBookState())
    setPhase('choose')
    setSelectedTime(null)
    setPhone('')
    setFirstName('')
    setError(null)
    setRefusal(null)
    setPaymentUrl(null)
    setFieldError(null)
    setReference(null)
    setDeliveryChannel(null)
    startedRef.current = false
    // A closed sheet has no submit intent left to retry, so the next one starts on a
    // fresh key rather than risking a replay of whatever the last guest submitted.
    submitIntentKeyRef.current = null
  }, [open])

  useEffect(() => {
    if (!open || startedRef.current) return
    startedRef.current = true
    trackFormStart({ formName: 'quick_book_sheet', formLocation: source })
  }, [open, source])

  // Availability loads the moment the sheet opens, and again whenever a chip changes, so
  // the times are usually on screen before the guest has finished reading the chips.
  useEffect(() => {
    if (!open) return

    const controller = new AbortController()
    let cancelled = false

    setLoading(true)
    setError(null)

    fetchAvailability(
      {
        date: state.date,
        time: NEUTRAL_AVAILABILITY_ANCHOR_TIME,
        partySize: state.partySize,
        drinksOnly: state.purpose === 'drinks',
        // The sheet never asks about these, which is exactly why it hands over to the full
        // form when they might matter. Sending the neutral answer keeps the availability
        // question identical to the one the wizard asks with nothing selected.
        isOutsideSeating: false,
        requiresAccessibleTable: false,
        highChairCount: 0,
      },
      controller.signal
    )
      .then((data) => {
        if (cancelled) return
        setAvailability(data)
      })
      .catch((failure: unknown) => {
        if (cancelled || controller.signal.aborted) return
        setAvailability(null)
        setError(
          failure instanceof Error
            ? failure.message
            : 'We could not check availability right now.'
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [open, state.date, state.partySize, state.purpose, availabilityRefresh])

  const slots = useMemo(
    () => selectableSlots(availability, state.partySize, state.purpose),
    [availability, state.partySize, state.purpose]
  )
  const emptyState = useMemo(
    () => resolveEmptyState(availability, state.partySize, state.purpose, loading),
    [availability, state.partySize, state.purpose, loading]
  )

  const updateState = useCallback((patch: Partial<QuickBookState>) => {
    // Changing a chip invalidates the chosen time: it belonged to a different question.
    setSelectedTime(null)
    // And the refusal with it: it was about the question they have just changed.
    setRefusal(null)
    setState((current) => ({ ...current, ...patch }))
  }, [])

  const chooseTime = useCallback((time: string) => {
    setSelectedTime(time)
    setPhase('details')
    setFieldError(null)
    setRefusal(null)
    // Focus after the phase transition so the keyboard opens straight onto the number.
    setTimeout(() => phoneRef.current?.focus(), 60)
  }, [])

  const submit = useCallback(async () => {
    const invalid = findQuickBookRefusal({ time: selectedTime, phone, firstName })
    if (invalid) {
      setFieldError(invalid.message)
      trackBookingErrorShown({ code: `quick_book_${invalid.field}` })
      return
    }

    const slot = slots.find((candidate) => candidate.time === selectedTime)
    if (!slot) {
      // The grid moved under them while they typed. Send them back rather than book a
      // time that is no longer offered.
      setPhase('choose')
      setSelectedTime(null)
      // A refusal, not an error: an error would hide the very grid they are
      // being asked to pick from.
      setRefusal('That time has just gone. Please pick another.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const payload = buildQuickBookPayload({
        state,
        time: selectedTime as string,
        slotPurpose: slot.bookable_purpose,
        phone,
        firstName,
      })

      const response = await fetch('/api/table-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Scoped to this attempt's actual content, so a double tap cannot create two
          // bookings but a genuine retry after a change still can. The fingerprint covers
          // the WHOLE payload, matching the fields the management API hashes, so changing
          // an answer and resubmitting mints a new key instead of colliding with the old
          // one and coming back as a raw 409.
          'Idempotency-Key': idempotencyKeyFor(buildQuickBookIntentFingerprint(payload)),
        },
        // Volatile fields are appended AFTER the fingerprint above has already
        // been taken from the clean payload, exactly as the full form does in
        // lib/table-booking/submission.ts, so a refreshed token or another
        // second on the sheet cannot mint a different idempotency key and turn
        // a double tap into two bookings.
        body: JSON.stringify(
          buildQuickBookRequestBody(payload, {
            turnstileToken,
            secondsOnSheet: Math.floor((Date.now() - openedAtRef.current) / 1000),
          })
        ),
      }).catch(() => null)

      // The request never arrived, or its answer never came back. The browser's
      // own wording for that ("Failed to fetch") tells a guest nothing. The key
      // is kept, so trying again cannot book twice if the first one did land.
      if (!response) {
        throw new Error(SUBMIT_FAILED_COPY)
      }

      // A body that is not JSON (a gateway page, an empty answer) is a failed
      // booking like any other, and gets the same message and phone number.
      const body = await response.json().catch(() => null)
      const data = body?.data || body

      if (!response.ok || !body || body?.success === false) {
        // Through the shared mapper: a sentence with the phone number in it,
        // never a code and never the management app's own wording.
        // The sheet adds its own phone link under whatever it shows.
        throw new Error(
          toGuestMessage(body?.error ?? data?.error, 'table_booking', { phone: false, fallback: SUBMIT_FAILED_COPY })
        )
      }

      // A 2xx is not a booking. The management app answers a REFUSED booking
      // with HTTP 200 and success true, and says what actually happened in
      // `state`. Until October 2026 this sheet never read it, so a guest whose
      // table had just gone was told "You're booked in." Only 'confirmed' may
      // reach the done screen; anything this code does not recognise is treated
      // as not booked.
      if (!data || typeof data !== 'object' || !data.state) {
        throw new Error(INCOMPLETE_RESPONSE_COPY)
      }

      const result = data as ManagementTableBookingResult

      if (result.state === 'confirmed') {
        // Booked. Defence in depth: drop the key so a hypothetical second submit of the
        // identical payload mints a new one rather than replaying the booking just made.
        submitIntentKeyRef.current = null
        setReference(result.booking_reference || null)
        setDeliveryChannel(result.notification_channel ?? null)
        setPhase('done')
        // The completion events belong to a confirmed booking and to nothing else.
        trackFormComplete({ formName: 'quick_book_sheet', formLocation: source })
        trackTableBookingClick({ source: `quick_book_${source}`, context: 'quick_book' })
        return
      }

      if (result.state === 'pending_payment') {
        // A booking exists and is held for a deposit. The key is kept, as the
        // full form keeps it: this attempt is still in flight, and a second
        // submit must find the same held booking, never make another.
        setReference(result.booking_reference || null)
        setPaymentUrl(
          safePaymentUrl(result.fallback_payment_url) ?? safePaymentUrl(result.next_step_url)
        )
        setPhase('payment')
        return
      }

      if (result.state === 'blocked') {
        const blockedReason = result.blocked_reason || 'blocked'
        // Nothing was created, so the next attempt is a new one and gets a new
        // key. Keeping it would replay this refusal if the guest tried the same
        // time again after a table came free.
        submitIntentKeyRef.current = null
        setRefusal(BLOCKED_REASON_COPY[blockedReason] || BLOCKED_REASON_COPY.blocked)
        setSelectedTime(null)
        setPhase('choose')
        // The grid they chose from is now known to be out of date.
        setAvailabilityRefresh((count) => count + 1)
        trackBookingErrorShown({ code: `quick_book_blocked_${blockedReason}` })
        return
      }

      throw new Error(INCOMPLETE_RESPONSE_COPY)
    } catch (failure: unknown) {
      setError(failure instanceof Error && failure.message ? failure.message : SUBMIT_FAILED_COPY)
      trackBookingErrorShown({ code: 'quick_book_submit_failed' })
    } finally {
      setSubmitting(false)
      // A Turnstile token is single use. Without this a guest whose first
      // attempt failed would resubmit the spent token and be refused again,
      // with no way out but to close the sheet.
      setTurnstileToken(null)
      turnstileRef.current?.reset()
    }
  }, [firstName, idempotencyKeyFor, phone, selectedTime, slots, source, state, turnstileToken])

  return (
    <StickyDrawer
      open={open}
      onClose={onClose}
      side="bottom"
      title={phase === 'done' ? 'Table booked' : phase === 'payment' ? 'Deposit needed' : 'Book a table'}
    >
      <div className="space-y-4 px-4 pb-6 pt-2">
        {phase === 'done' ? (
          <div className="space-y-3 text-center">
            <p className="text-lg font-semibold text-ink-strong">You&apos;re booked in.</p>
            <p className="text-sm text-ink-muted">
              {formatConfirmation(state, selectedTime)}
            </p>
            {reference ? (
              <p className="text-sm text-ink-muted">
                Reference <strong className="text-ink-strong">{reference}</strong>
              </p>
            ) : null}
            <p className="text-xs text-ink-muted">
              {/* The neutral line talks about a reference, so it is only used when
                  there is one on screen to keep. */}
              {deliveryChannel || reference
                ? confirmationDeliveryCopy(deliveryChannel)
                : 'Your table is booked.'}
            </p>
            <Button variant="primary" size="lg" className="w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : phase === 'payment' ? (
          <div className="space-y-3 text-center">
            <p className="text-lg font-semibold text-ink-strong">
              Your table is held, not booked yet.
            </p>
            <p className="text-sm text-ink-muted">
              {formatConfirmation(state, selectedTime)}
            </p>
            <p className="text-sm text-ink-muted">
              This booking needs a deposit. It&apos;s only confirmed once the deposit is paid.
            </p>
            {reference ? (
              <p className="text-sm text-ink-muted">
                Reference <strong className="text-ink-strong">{reference}</strong>
              </p>
            ) : null}
            {paymentUrl ? (
              <Button asChild variant="primary" size="lg" className="w-full">
                <a href={paymentUrl} rel="noopener noreferrer">
                  Pay the deposit
                </a>
              </Button>
            ) : null}
            <p className="text-sm text-ink-muted">
              {paymentUrl ? 'Or ring us on ' : 'Ring us on '}
              <a href={PHONE_HREF} className="underline">
                {PHONE_DISPLAY}
              </a>{' '}
              and we&apos;ll take the deposit over the phone.
            </p>
          </div>
        ) : (
          <>
            <ChipRow
              state={state}
              dateChoices={dateChoices}
              onChange={updateState}
              disabled={submitting}
            />

            {phase === 'choose' ? (
              <TimeGrid
                slots={slots}
                emptyState={emptyState}
                state={state}
                error={error}
                refusal={refusal}
                onChoose={chooseTime}
                onSwitchToDrinks={() => updateState({ purpose: 'drinks' })}
              />
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-ink-muted">
                  {formatConfirmation(state, selectedTime)}{' '}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => {
                      setPhase('choose')
                      setFieldError(null)
                    }}
                  >
                    Change
                  </button>
                </p>

                <Input
                  ref={phoneRef}
                  label="Mobile number"
                  type="tel"
                  size="lg"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="07700 900000"
                  hint="So we can confirm your booking."
                />

                <Input
                  label="First name"
                  size="lg"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Jane"
                />

                {fieldError ? (
                  <p className="text-sm text-anchor-danger" role="alert">{fieldError}</p>
                ) : null}
                {error ? (
                  // A booking that could not be made always comes with another way
                  // to make it.
                  <p className="text-sm text-anchor-danger" role="alert">
                    <WithPhoneLink message={error} />
                  </p>
                ) : null}

                {TURNSTILE_SITE_KEY ? (
                  <TurnstileField
                    id="quick-book-turnstile"
                    turnstileRef={turnstileRef}
                    onTokenChange={setTurnstileToken}
                  />
                ) : null}

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={submitting}
                  disabled={TURNSTILE_SITE_KEY ? !turnstileToken : false}
                  onClick={submit}
                >
                  Book table
                </Button>

                <p className="text-xs leading-relaxed text-ink-muted">
                  {GUEST_TABLE_COMPACT_CONSENT_NOTICE}
                </p>
              </div>
            )}

            <p className="text-center text-xs text-ink-muted">
              Need high chairs, outside seating or a bigger table?{' '}
              <Link
                href={fullFormHref({ ...state, time: selectedTime })}
                className="underline"
                onClick={onClose}
              >
                Use the full form
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </StickyDrawer>
  )
}

/**
 * A message with the pub's phone number in it as a link a thumb can ring. A
 * message that already carries the number has it linked in place; one that does
 * not has it added, so no refusal or failure is ever shown without it.
 */
function WithPhoneLink({ message }: { message: string }) {
  const link = (
    <a href={PHONE_HREF} className="underline">
      {PHONE_DISPLAY}
    </a>
  )
  const at = message.indexOf(PHONE_DISPLAY)
  if (at === -1) {
    return (
      <>
        {message} Ring us on {link}.
      </>
    )
  }
  return (
    <>
      {message.slice(0, at)}
      {link}
      {message.slice(at + PHONE_DISPLAY.length)}
    </>
  )
}

function formatConfirmation(state: QuickBookState, time: string | null): string {
  const people = `${state.partySize} ${state.partySize === 1 ? 'person' : 'people'}`
  const when = new Date(`${state.date}T00:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
  return time ? `${people}, ${when} at ${time}.` : `${people}, ${when}.`
}

function ChipRow({
  state,
  dateChoices,
  onChange,
  disabled,
}: {
  state: QuickBookState
  dateChoices: { value: string; label: string }[]
  onChange: (patch: Partial<QuickBookState>) => void
  disabled: boolean
}) {
  return (
    <div className="space-y-3">
      <fieldset disabled={disabled}>
        <legend className="sr-only">Party size</legend>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: QUICK_BOOK_MAX_PARTY }, (_, index) => index + 1).map((size) => (
            <Chip
              key={size}
              selected={state.partySize === size}
              onClick={() => onChange({ partySize: size })}
              label={String(size)}
              ariaLabel={`${size} ${size === 1 ? 'person' : 'people'}`}
            />
          ))}
        </div>
      </fieldset>

      <fieldset disabled={disabled}>
        <legend className="sr-only">Date</legend>
        <div className="flex flex-wrap gap-2">
          {dateChoices.map((choice) => (
            <Chip
              key={choice.value}
              selected={state.date === choice.value}
              onClick={() => onChange({ date: choice.value })}
              label={choice.label}
            />
          ))}
          <label className="sr-only" htmlFor="quick-book-date">
            Another date
          </label>
          <input
            id="quick-book-date"
            type="date"
            value={state.date}
            min={dateChoices[0]?.value}
            onChange={(event) => onChange({ date: event.target.value })}
            className="rounded-full border border-line bg-surface px-3 py-2 text-sm text-ink"
          />
        </div>
      </fieldset>

      <fieldset disabled={disabled}>
        <legend className="sr-only">Eating or drinks</legend>
        <div className="flex flex-wrap gap-2">
          <Chip
            selected={state.purpose === 'food'}
            onClick={() => onChange({ purpose: 'food' })}
            label="Eating"
          />
          <Chip
            selected={state.purpose === 'drinks'}
            onClick={() => onChange({ purpose: 'drinks' })}
            label="Just drinks"
          />
        </div>
      </fieldset>
    </div>
  )
}

function Chip({
  selected,
  onClick,
  label,
  ariaLabel,
}: {
  selected: boolean
  onClick: () => void
  label: string
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={ariaLabel}
      onClick={onClick}
      className={[
        'min-h-[44px] min-w-[44px] rounded-full border px-4 text-sm transition-colors',
        selected
          ? 'border-accent bg-accent text-canvas'
          : 'border-line bg-surface text-ink hover:border-accent',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

function TimeGrid({
  slots,
  emptyState,
  state,
  error,
  refusal,
  onChoose,
  onSwitchToDrinks,
}: {
  slots: ReturnType<typeof selectableSlots>
  emptyState: ReturnType<typeof resolveEmptyState>
  state: QuickBookState
  error: string | null
  refusal: string | null
  onChoose: (time: string) => void
  onSwitchToDrinks: () => void
}) {
  // Said first and kept on screen through the reload that follows it, so the
  // guest is never left looking at "Checking times" wondering what happened to
  // the booking they just asked for.
  const refusalNotice = refusal ? (
    <p
      className="rounded-md border border-line bg-surface-sunk p-3 text-left text-sm text-anchor-danger"
      role="alert"
    >
      <WithPhoneLink message={refusal} />
    </p>
  ) : null

  if (emptyState === 'loading') {
    return (
      <div className="space-y-3">
        {refusalNotice}
        <p className="py-6 text-center text-sm text-ink-muted">Checking times…</p>
      </div>
    )
  }

  if (emptyState === 'check_failed' || error) {
    return (
      <div className="space-y-2 py-4 text-center">
        {refusalNotice}
        <p className="text-sm text-ink-muted">
          {error || 'We could not check times just now.'}
        </p>
        <a href="tel:+441753682707" className="text-sm underline">
          Ring us on 01753 682707
        </a>
      </div>
    )
  }

  if (emptyState === 'kitchen_closed_but_drinks_available') {
    return (
      <div className="space-y-3 py-4 text-center">
        {refusalNotice}
        {/* The recovery that matters. Mondays the kitchen is shut but the bar is open, and
            a guest told "no availability" walks away from a table they could have had. */}
        <p className="text-sm text-ink-muted">
          The kitchen is closed then, but we can seat you for drinks.
        </p>
        <Button variant="outline" size="md" onClick={onSwitchToDrinks}>
          Show drinks times
        </Button>
      </div>
    )
  }

  if (emptyState === 'nothing_today') {
    return (
      <div className="space-y-2 py-4 text-center">
        {refusalNotice}
        <p className="text-sm text-ink-muted">
          Nothing free for {state.partySize} then. Try another day, or give us a ring.
        </p>
        <a href="tel:+441753682707" className="text-sm underline">
          Ring us on 01753 682707
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {refusalNotice}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => {
          const caption = busynessCaption(slot.busyness)
          return (
            <button
              key={slot.time}
              type="button"
              onClick={() => onChoose(slot.time)}
              className="min-h-[48px] rounded-md border border-line bg-surface px-2 py-2 text-sm text-ink transition-colors hover:border-accent hover:bg-surface-sunk"
            >
              <span className="block font-medium">{slot.time}</span>
              {caption ? (
                <span className="block text-[11px] text-ink-muted">{caption}</span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Button } from '@/components/ui/primitives/Button'
import { PhoneLink } from '@/components/PhoneLink'
import { CONTACT } from '@/lib/constants'
import { cn } from '@/lib/utils'

// "We will help", not "we will book this for you": the same widget sits on the
// enquiry forms and the job application, where nothing is being booked.
const VERIFICATION_ERROR = `Verification did not complete. Try again, or call ${CONTACT.phone} and we will help.`

const UNSUPPORTED_ERROR = `This browser cannot complete our security check. Please call ${CONTACT.phone} and we will help.`

/**
 * How long we wait for Cloudflare to hand over a token before we say something.
 *
 * Every form disables its submit button until a token exists, so a widget that
 * is blocked by an extension, killed by a corporate proxy or simply never
 * loaded left the guest looking at a dead button with nothing on screen to
 * explain it. Cloudflare calls nothing back in that case, so the only signal is
 * the clock. Ten seconds is long enough for a slow phone on a weak signal to
 * finish quietly, and short enough that nobody sits there wondering what they
 * did. The event booking form had this first; it lives here now so every form
 * that mounts the widget gets it.
 */
export const TURNSTILE_RECOVERY_DELAY_MS = 10_000

export const TURNSTILE_RECOVERY_TITLE = 'Security check not completed'

export const TURNSTILE_RECOVERY_MESSAGE =
  'Our security check has not finished, so we cannot take this online yet. Everything you have typed is still here.'

export type TurnstileFieldRef = TurnstileInstance | null

/**
 * Cloudflare's wide widget ('flexible') fills its box but is never narrower
 * than 300px. A 320px phone has 288px inside the page gutters, less inside a
 * padded card, and <body> hides sideways overflow, so the part of the widget
 * past the edge could not be reached and it dragged the form out with it. The
 * 'compact' widget is 150px by 140px and fits anywhere.
 */
const FLEXIBLE_MIN_WIDTH_PX = 300

type TurnstileWidgetSize = 'flexible' | 'compact'

/**
 * Pick the widget for the room there is. Anything that cannot be measured
 * (no element, a width of 0 because an ancestor is not laid out yet, a throw)
 * gets the wide widget, which is what every visitor had before this.
 *
 * `clientWidth` and not `getBoundingClientRect`: it is the laid-out width, so
 * a dialog that scales in as it opens is not read as narrower than it is.
 */
function pickWidgetSize(slot: HTMLElement | null): TurnstileWidgetSize {
  try {
    const available = slot?.clientWidth ?? 0
    return available > 0 && available < FLEXIBLE_MIN_WIDTH_PX ? 'compact' : 'flexible'
  } catch {
    return 'flexible'
  }
}

// useLayoutEffect warns when a client component is rendered on the server.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * What Cloudflare last told us. Reported only to callers that pass
 * `onStatusChange`, so a form can run its own recovery UI: the widget itself
 * says nothing at all when it never loads, and `onTokenChange(null)` alone
 * cannot tell "the token expired and will be replaced" apart from "the
 * challenge failed".
 */
export type TurnstileFieldStatus = 'pending' | 'ready' | 'expired' | 'error' | 'unsupported'

interface TurnstileFieldProps {
  id: string
  turnstileRef: MutableRefObject<TurnstileFieldRef>
  onTokenChange: (token: string | null) => void
  className?: string
  /** Optional lifecycle feed for callers that own their own recovery message. */
  onStatusChange?: (status: TurnstileFieldStatus) => void
  /**
   * Set false when the caller renders its own failure panel, so the guest is not
   * told the same thing twice by two different components. Defaults to true, so
   * every form gets the failure alert and the "not completed" panel without
   * asking for them.
   */
  showInlineError?: boolean
  /** Names this form in the phone click tracking. */
  phoneSource?: string
}

export function TurnstileField({
  id,
  turnstileRef,
  onTokenChange,
  className,
  onStatusChange,
  showInlineError = true,
  phoneSource = 'turnstile_recovery'
}: TurnstileFieldProps) {
  const [error, setError] = useState<string | null>(null)
  // Whether the guest can do anything about `error` by pressing a button.
  const [retryable, setRetryable] = useState(true)
  // What Cloudflare last told us, kept here as well as reported to the caller
  // so the recovery clock below runs for every form, not only for a caller
  // that listens.
  const [status, setStatus] = useState<TurnstileFieldStatus>('pending')
  const [timedOut, setTimedOut] = useState(false)
  // Bumped by each retry, so the clock starts again even when the status it
  // goes back to ('pending') is the one it already had.
  const [attempt, setAttempt] = useState(0)

  // The widget's size, decided ONCE per mount from the room its slot has, in a
  // layout effect so the widget appears in the same frame as the form.
  //
  // It is never decided again, on resize or on rotation: changing the size
  // makes Cloudflare render a new widget, which throws away the token the
  // visitor already has and disables the submit button under their thumb.
  //
  // Until it is decided the slot is empty, never hidden, and it is decided on
  // every path: there is no state in which the widget is left out.
  const slotRef = useRef<HTMLDivElement>(null)
  const [widgetSize, setWidgetSize] = useState<TurnstileWidgetSize | null>(null)
  useIsomorphicLayoutEffect(() => {
    setWidgetSize((decided) => decided ?? pickWidgetSize(slotRef.current))
  }, [])

  // Held in a ref so an inline arrow passed by the caller does not change the
  // identity of the handlers below on every render, which would hand Cloudflare
  // a fresh set of callbacks each time the parent form re-renders.
  const onStatusChangeRef = useRef(onStatusChange)
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange
  }, [onStatusChange])

  const reportStatus = useCallback((next: TurnstileFieldStatus) => {
    setStatus(next)
    onStatusChangeRef.current?.(next)
  }, [])

  // The recovery clock. It runs while a token is awaited: from mount, after an
  // expiry and after a retry. An expired token is routine and Cloudflare
  // usually replaces it in well under a second, so the panel appears only if no
  // replacement turns up. A hard error or an unsupported browser has its own
  // message at once and needs no clock.
  //
  // This is a way out for the guest and nothing more. The form's button stays
  // disabled without a token and the server verifies every token it is given.
  useEffect(() => {
    setTimedOut(false)
    if (status !== 'pending' && status !== 'expired') return

    const timer = window.setTimeout(() => setTimedOut(true), TURNSTILE_RECOVERY_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [status, attempt])

  // Expiry and challenge-timeout are ROUTINE, not failures.
  //
  // A Turnstile token dies after five minutes. The booking form mounts this
  // widget as soon as the guest's number is accepted, and they then fill in
  // names, email, dietary notes, high chairs and any pre-order, so passing five
  // minutes is ordinary rather than exceptional. Because `refreshExpired` and
  // `refreshTimeout` are both 'auto', Cloudflare quietly mints a replacement
  // and calls onSuccess again. Treating these as errors is what put a red
  // "verification did not complete" banner in front of guests who had simply
  // taken their time, and disabled the confirm button while it healed itself.
  // Drop the stale token so the button cannot submit one, and say nothing.
  const clearTokenQuietly = useCallback(() => {
    onTokenChange(null)
    reportStatus('expired')
  }, [onTokenChange, reportStatus])

  // A real failure. `retry: 'auto'` may still recover it, in which case
  // onSuccess clears this, but it can also be terminal so the guest is told.
  const clearTokenWithError = useCallback(() => {
    onTokenChange(null)
    setError(VERIFICATION_ERROR)
    setRetryable(true)
    reportStatus('error')
  }, [onTokenChange, reportStatus])

  // Terminal: nothing retries a browser that cannot run the challenge at all,
  // so send the guest straight to the phone instead of a dead Try Again button.
  const handleUnsupported = useCallback(() => {
    onTokenChange(null)
    setError(UNSUPPORTED_ERROR)
    setRetryable(false)
    reportStatus('unsupported')
  }, [onTokenChange, reportStatus])

  const handleSuccess = useCallback((token: string) => {
    onTokenChange(token)
    setError(null)
    reportStatus('ready')
  }, [onTokenChange, reportStatus])

  const handleRetry = useCallback(() => {
    onTokenChange(null)
    setError(null)
    setAttempt((count) => count + 1)
    reportStatus('pending')
    turnstileRef.current?.reset()
  }, [onTokenChange, reportStatus, turnstileRef])

  return (
    // No space-y here: the live region below is an empty box most of the time,
    // and a gap utility would give that empty box a margin of its own. The two
    // panels carry their own top margin instead.
    <div className={cn(className)}>
      {/*
        The slot is what gets measured, so it has no minimum width of its own.
        It holds the wide widget's 65px from the first paint, server render
        included, so nothing below it moves when the widget arrives. Only the
        compact widget (140px, narrow screens) makes the slot grow. The
        library sizes its own box to match the size it is given (150px by
        140px for compact), so its 300px minimum applies to the wide one only.
      */}
      <div ref={slotRef} className="min-h-[65px]">
        {widgetSize ? (
          <Turnstile
            id={id}
            ref={(instance) => {
              turnstileRef.current = instance ?? null
            }}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
            onSuccess={handleSuccess}
            onError={clearTokenWithError}
            onExpire={clearTokenQuietly}
            onTimeout={clearTokenQuietly}
            onUnsupported={handleUnsupported}
            options={{
              theme: 'light',
              size: widgetSize,
              retry: 'auto',
              refreshExpired: 'auto',
              refreshTimeout: 'auto'
            }}
          />
        ) : null}
      </div>

      {error && showInlineError ? (
        <div
          role="alert"
          className="mt-3 space-y-3 rounded-sm border border-anchor-danger/30 bg-anchor-danger/10 p-3 text-sm text-anchor-danger"
        >
          <p>{error}</p>
          {/* Nothing retries a browser that cannot run the challenge at all. */}
          {retryable ? (
            <Button type="button" size="sm" variant="outline" onClick={handleRetry}>
              Try Again
            </Button>
          ) : null}
        </div>
      ) : null}

      {/*
        Kept in the DOM at all times and left empty until there is something to
        say. A live region added to the page at the same moment as its text is
        routinely missed by screen readers, whereas one already sitting there
        announces the change.
      */}
      {showInlineError ? (
        <div role="status" aria-live="polite" aria-atomic="true">
          {timedOut && !error ? (
            <div className="mt-3 space-y-3 rounded-sm border border-anchor-danger/30 bg-anchor-danger/10 p-3 text-sm text-anchor-danger">
              <p className="font-semibold">{TURNSTILE_RECOVERY_TITLE}</p>
              <p>{TURNSTILE_RECOVERY_MESSAGE}</p>
              <p>
                Call{' '}
                <PhoneLink phone={CONTACT.phone} source={phoneSource} showIcon={false} className="font-semibold underline">
                  {CONTACT.phone}
                </PhoneLink>{' '}
                and we will help.
              </p>
              <Button type="button" size="sm" variant="outline" wrap onClick={handleRetry}>
                Try the security check again
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

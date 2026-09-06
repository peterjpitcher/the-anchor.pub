'use client'

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Button } from '@/components/ui/primitives/Button'
import { cn } from '@/lib/utils'

const VERIFICATION_ERROR =
  'Verification did not complete. Try again, or call 01753 682707 and we will book this for you.'

const UNSUPPORTED_ERROR =
  'This browser cannot complete our security check. Please call 01753 682707 and we will book this for you.'

export type TurnstileFieldRef = TurnstileInstance | null

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
   * every existing caller keeps the inline alert it has always had.
   */
  showInlineError?: boolean
}

export function TurnstileField({
  id,
  turnstileRef,
  onTokenChange,
  className,
  onStatusChange,
  showInlineError = true
}: TurnstileFieldProps) {
  const [error, setError] = useState<string | null>(null)

  // Held in a ref so an inline arrow passed by the caller does not change the
  // identity of the handlers below on every render, which would hand Cloudflare
  // a fresh set of callbacks each time the parent form re-renders.
  const onStatusChangeRef = useRef(onStatusChange)
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange
  }, [onStatusChange])

  const reportStatus = useCallback((status: TurnstileFieldStatus) => {
    onStatusChangeRef.current?.(status)
  }, [])

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
    reportStatus('error')
  }, [onTokenChange, reportStatus])

  // Terminal: nothing retries a browser that cannot run the challenge at all,
  // so send the guest straight to the phone instead of a dead Try Again button.
  const handleUnsupported = useCallback(() => {
    onTokenChange(null)
    setError(UNSUPPORTED_ERROR)
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
    reportStatus('pending')
    turnstileRef.current?.reset()
  }, [onTokenChange, reportStatus, turnstileRef])

  return (
    <div className={cn('space-y-3', className)}>
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
          size: 'flexible',
          retry: 'auto',
          refreshExpired: 'auto',
          refreshTimeout: 'auto'
        }}
      />

      {error && showInlineError ? (
        <div
          role="alert"
          className="space-y-3 rounded-sm border border-anchor-danger/30 bg-anchor-danger/10 p-3 text-sm text-anchor-danger"
        >
          <p>{error}</p>
          <Button type="button" size="sm" variant="outline" onClick={handleRetry}>
            Try Again
          </Button>
        </div>
      ) : null}
    </div>
  )
}

'use client'

import { useCallback, useState, type MutableRefObject } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Button } from '@/components/ui/primitives/Button'
import { cn } from '@/lib/utils'

const VERIFICATION_ERROR =
  'Verification did not complete. Try again, or call 01753 682707 and we will book this for you.'

const UNSUPPORTED_ERROR =
  'This browser cannot complete our security check. Please call 01753 682707 and we will book this for you.'

export type TurnstileFieldRef = TurnstileInstance | null

interface TurnstileFieldProps {
  id: string
  turnstileRef: MutableRefObject<TurnstileFieldRef>
  onTokenChange: (token: string | null) => void
  className?: string
}

export function TurnstileField({
  id,
  turnstileRef,
  onTokenChange,
  className
}: TurnstileFieldProps) {
  const [error, setError] = useState<string | null>(null)

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
  }, [onTokenChange])

  // A real failure. `retry: 'auto'` may still recover it, in which case
  // onSuccess clears this, but it can also be terminal so the guest is told.
  const clearTokenWithError = useCallback(() => {
    onTokenChange(null)
    setError(VERIFICATION_ERROR)
  }, [onTokenChange])

  // Terminal: nothing retries a browser that cannot run the challenge at all,
  // so send the guest straight to the phone instead of a dead Try Again button.
  const handleUnsupported = useCallback(() => {
    onTokenChange(null)
    setError(UNSUPPORTED_ERROR)
  }, [onTokenChange])

  const handleSuccess = useCallback((token: string) => {
    onTokenChange(token)
    setError(null)
  }, [onTokenChange])

  const handleRetry = useCallback(() => {
    onTokenChange(null)
    setError(null)
    turnstileRef.current?.reset()
  }, [onTokenChange, turnstileRef])

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

      {error ? (
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

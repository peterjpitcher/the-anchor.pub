'use client'

import { useCallback, useState, type MutableRefObject } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Button } from '@/components/ui/primitives/Button'
import { cn } from '@/lib/utils'

const VERIFICATION_ERROR =
  'Verification did not complete. Try again, or call 01753 682707 and we will book this for you.'

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

  const clearTokenWithError = useCallback(() => {
    onTokenChange(null)
    setError(VERIFICATION_ERROR)
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
        onExpire={clearTokenWithError}
        onTimeout={clearTokenWithError}
        onUnsupported={clearTokenWithError}
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

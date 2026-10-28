'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/primitives/Button'
import { formatLondonClockTime } from '@/lib/time-london'

/**
 * How long a website ticket hold lasts, and what to do when it ends (review BK-100).
 *
 * Paid tickets are held for 15 minutes while the guest pays (owner decision D11: a fixed hold,
 * shown, with no extension). Guests used to see only "currently on hold", so slower guests,
 * including people using a screen reader, lost the hold without warning. This says when it ends,
 * tells a screen reader politely at 5 minutes and at 1 minute left, and once it has ended offers
 * to hold the tickets again.
 */

const ANNOUNCE_AT_MINUTES = [5, 1] as const
const TICK_MS = 5_000

interface EventHoldNoticeProps {
  holdExpiresAt: string | null | undefined
  /** "seats" or "standing tickets". */
  ticketLabel: string
  /** What the guest owes, when the booking system said; shown only when there is no breakdown. */
  amountDue?: number | null
  onHoldAgain: () => void
  /** For tests: the clock. */
  now?: () => number
}

function formatPounds(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function EventHoldNotice({ holdExpiresAt, ticketLabel, amountDue, onHoldAgain, now = Date.now }: EventHoldNoticeProps) {
  const expiresMs = holdExpiresAt ? Date.parse(holdExpiresAt) : Number.NaN
  const holdUntil = formatLondonClockTime(holdExpiresAt)
  const [nowMs, setNowMs] = useState(() => now())
  const [announcement, setAnnouncement] = useState('')
  const announced = useRef(new Set<number>())

  useEffect(() => {
    if (!Number.isFinite(expiresMs)) return
    const timer = setInterval(() => setNowMs(now()), TICK_MS)
    return () => clearInterval(timer)
  }, [expiresMs, now])

  const remainingMs = Number.isFinite(expiresMs) ? expiresMs - nowMs : Number.NaN
  const lapsed = Number.isFinite(remainingMs) && remainingMs <= 0

  useEffect(() => {
    if (!Number.isFinite(remainingMs)) return
    if (remainingMs <= 0) {
      setAnnouncement(`Your hold has ended, so your ${ticketLabel} have gone back on sale.`)
      return
    }
    for (const minutes of ANNOUNCE_AT_MINUTES) {
      if (remainingMs <= minutes * 60_000 && !announced.current.has(minutes)) {
        ANNOUNCE_AT_MINUTES.filter((m) => m >= minutes).forEach((m) => announced.current.add(m))
        setAnnouncement(
          minutes === 1
            ? `1 minute left to pay before your ${ticketLabel} are released.`
            : `${minutes} minutes left to pay before your ${ticketLabel} are released.`
        )
        break
      }
    }
  }, [remainingMs, ticketLabel])

  const amountLine = typeof amountDue === 'number' && Number.isFinite(amountDue) && amountDue > 0
    ? <p className="mt-2">Total to pay: {formatPounds(amountDue)}.</p>
    : null

  return (
    <div>
      {lapsed ? (
        <div>
          <p className="font-semibold">Your hold has ended, so your {ticketLabel} have gone back on sale.</p>
          <p className="mt-1">Your details are still here. Hold them again and you&apos;ll have another 15 minutes to pay.</p>
          <div className="mt-2">
            <Button type="button" size="sm" onClick={onHoldAgain}>
              Hold them again
            </Button>
          </div>
        </div>
      ) : holdUntil ? (
        <p>We&apos;re holding your {ticketLabel} until {holdUntil}. Pay before then to confirm your booking.</p>
      ) : (
        <p>Your {ticketLabel} are on hold. Pay now to confirm your booking.</p>
      )}
      {lapsed ? null : amountLine}
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
    </div>
  )
}

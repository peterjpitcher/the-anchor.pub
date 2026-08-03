'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { BookingPeriodResponse } from '@/lib/api/bookings'

/**
 * The seasonal period for the date and party the guest is currently looking at,
 * plus the answer they gave.
 *
 * Two rules drive the whole shape of this hook.
 *
 * THE ANSWER IS KEYED TO A PERIOD AND A DATE. A guest who says "yes, Christmas
 * dinner" for 12 December and then moves to 5 January has not answered anything
 * about January. Carrying the answer across would submit a booking claiming an
 * acceptance the guest never gave, for a period that no longer applies. So the
 * answer is stored WITH the period id and date it was given for, and is only
 * ever read back when both still match. Changing either forgets it, and there is
 * no separate reset call for a caller to forget to make.
 *
 * A FAILED LOOKUP MEANS NO PERIOD. Not an error, not a retry prompt, not a
 * blocked booking: the ordinary journey, which is what most of the year looks
 * like anyway. A seasonal question is worth money, but never at the price of an
 * ordinary Tuesday booking failing because a lookup timed out.
 *
 * Only the newest request may write, on the same generation-counter rule the
 * availability requests use, because party size and date both change while
 * answers are in flight.
 */

export type SeasonalAnswer = {
  periodId: string
  date: string
  accepted: boolean
}

export type BookingPeriodState = {
  /** The live period for this date, or null when there is none (the usual case). */
  period: BookingPeriodResponse['period']
  /** Deposit pricing for the current party size, or null when not asked for. */
  deposit: BookingPeriodResponse['deposit']
  /** True while a lookup is in flight. */
  loading: boolean
  /**
   * The guest's answer, but ONLY when it was given for the period and date now
   * on screen. Null means unanswered, which is also what a stale answer becomes.
   */
  answer: boolean | null
  /** Record an answer against the period and date currently on screen. */
  setAnswer(accepted: boolean): void
}

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function useBookingPeriod(date: string, partySize: number): BookingPeriodState {
  const [period, setPeriod] = useState<BookingPeriodResponse['period']>(null)
  const [deposit, setDeposit] = useState<BookingPeriodResponse['deposit']>(null)
  const [loading, setLoading] = useState(false)
  const [answer, setAnswerState] = useState<SeasonalAnswer | null>(null)

  const requestRef = useRef(0)

  useEffect(() => {
    if (!isValidIsoDate(date) || !Number.isFinite(partySize) || partySize < 1) {
      requestRef.current += 1
      setPeriod(null)
      setDeposit(null)
      setLoading(false)
      return
    }

    const generation = ++requestRef.current
    const controller = new AbortController()
    setLoading(true)

    void (async () => {
      try {
        const response = await fetch(
          `/api/table-bookings/periods?date=${encodeURIComponent(date)}&party_size=${partySize}`,
          { signal: controller.signal }
        )
        const body = await response.json()
        if (requestRef.current !== generation) return

        const data = (body?.data ?? null) as BookingPeriodResponse | null
        setPeriod(data?.period ?? null)
        setDeposit(data?.deposit ?? null)
      } catch {
        // Deliberately silent to the guest. A lookup we could not make is
        // reported as "no period", which leaves the ordinary journey intact.
        if (requestRef.current !== generation) return
        setPeriod(null)
        setDeposit(null)
      } finally {
        if (requestRef.current === generation) setLoading(false)
      }
    })()

    return () => {
      controller.abort()
    }
  }, [date, partySize])

  const setAnswer = useCallback(
    (accepted: boolean) => {
      if (!period) return
      setAnswerState({ periodId: period.id, date, accepted })
    },
    [period, date]
  )

  // The answer is read back only when it still belongs to what is on screen.
  // Nothing has to remember to clear it, because nothing stores it as a bare
  // boolean in the first place.
  const currentAnswer =
    answer && period && answer.periodId === period.id && answer.date === date
      ? answer.accepted
      : null

  return { period, deposit, loading, answer: currentAnswer, setAnswer }
}

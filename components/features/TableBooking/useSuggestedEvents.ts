'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  normalizeSuggestedEvents,
  type SuggestedEvent,
} from '@/lib/table-booking/suggested-events'

/**
 * The events happening on the date the guest is looking at, for the "you could
 * switch to an event instead" panel.
 *
 * Answers are cached per date and never re-fetched for a date already answered,
 * including a date that answered with an empty list; that is what the
 * hasOwnProperty check is for, and why the cache holds [] rather than deleting
 * the key on failure. A failed load is a soft failure: the panel says nothing
 * and the booking journey carries on regardless.
 */

export type SuggestedEventsForDate = {
  events: SuggestedEvent[]
  loading: boolean
  error: string | null
  /** The guest closed the panel for this date and should not see it again. */
  dismissed: boolean
  /** Hide the panel for the date currently being viewed. */
  dismiss(): void
  /** Hide the panel for a specific date, used when an event is chosen. */
  dismissFor(targetDate: string): void
  /** Show every panel again, for a full journey reset. */
  resetDismissals(): void
}

export function useSuggestedEvents(date: string): SuggestedEventsForDate {
  const [eventsByDate, setEventsByDate] = useState<Record<string, SuggestedEvent[]>>({})
  const [eventErrorsByDate, setEventErrorsByDate] = useState<Record<string, string>>({})
  const [eventsLoadingDate, setEventsLoadingDate] = useState<string | null>(null)
  const [dismissedEventDates, setDismissedEventDates] = useState<string[]>([])

  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return
    }

    if (Object.prototype.hasOwnProperty.call(eventsByDate, date)) {
      return
    }

    let cancelled = false

    async function loadDateEvents() {
      setEventsLoadingDate(date)
      setEventErrorsByDate((previous) => {
        const next = { ...previous }
        delete next[date]
        return next
      })

      try {
        const params = new URLSearchParams({
          from_date: date,
          limit: '36',
          available_only: 'true'
        })

        const response = await fetch(`/api/events?${params.toString()}`, {
          cache: 'no-store'
        })

        const body = await response.json()

        if (!response.ok || body?.success === false) {
          throw new Error(
            body?.error?.message ||
              body?.error ||
              'We could not load event suggestions right now.'
          )
        }

        const normalized = normalizeSuggestedEvents(body, date).slice(0, 6)

        if (!cancelled) {
          setEventsByDate((previous) => ({
            ...previous,
            [date]: normalized
          }))
        }
      } catch (eventError: any) {
        if (!cancelled) {
          setEventsByDate((previous) => ({
            ...previous,
            [date]: []
          }))
          setEventErrorsByDate((previous) => ({
            ...previous,
            [date]:
              eventError?.message ||
              'We could not load event suggestions right now.'
          }))
        }
      } finally {
        // Always clear this specific date's loading state, even if the effect was cleaned up.
        setEventsLoadingDate((current) => (current === date ? null : current))
      }
    }

    void loadDateEvents()

    return () => {
      cancelled = true
    }
  }, [date, eventsByDate])

  const dismissFor = useCallback((targetDate: string) => {
    setDismissedEventDates((previous) => {
      if (previous.includes(targetDate)) return previous
      return [...previous, targetDate]
    })
  }, [])

  const dismiss = useCallback(() => {
    dismissFor(date)
  }, [date, dismissFor])

  const resetDismissals = useCallback(() => {
    setDismissedEventDates([])
  }, [])

  return {
    events: eventsByDate[date] || [],
    loading: eventsLoadingDate === date,
    error: eventErrorsByDate[date] || null,
    dismissed: dismissedEventDates.includes(date),
    dismiss,
    dismissFor,
    resetDismissals
  }
}

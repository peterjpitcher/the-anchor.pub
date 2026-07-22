'use client'

import { useEffect, useState } from 'react'
import {
  getCompetitionStatus,
  type CompetitionStatus
} from '@/lib/competition-status'

interface CompetitionStatusNoticeProps {
  openingDateTime: string
  closingDateTime: string
  eventDateLabel: string
  closingTimeLabel: string
  closedMessage: string
  initialStatus: CompetitionStatus
}

const MAX_STATUS_CHECK_DELAY_MS = 60_000

export function CompetitionStatusNotice({
  openingDateTime,
  closingDateTime,
  eventDateLabel,
  closingTimeLabel,
  closedMessage,
  initialStatus
}: CompetitionStatusNoticeProps) {
  const [status, setStatus] = useState<CompetitionStatus>(initialStatus)

  useEffect(() => {
    let timeoutId: number | undefined

    const refreshStatus = () => {
      const nextStatus = getCompetitionStatus({ openingDateTime, closingDateTime })
      setStatus(nextStatus)

      if (nextStatus === 'closed') return

      const nextBoundary = nextStatus === 'upcoming'
        ? new Date(openingDateTime).getTime()
        : new Date(closingDateTime).getTime()
      const remainingTime = Math.max(0, nextBoundary - Date.now())

      timeoutId = window.setTimeout(
        refreshStatus,
        Math.min(remainingTime, MAX_STATUS_CHECK_DELAY_MS)
      )
    }

    refreshStatus()
    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    }
  }, [closingDateTime, openingDateTime])

  if (status === 'closed') {
    return (
      <aside
        aria-live="polite"
        className="rounded-md border border-anchor-danger/30 bg-red-50 p-4 text-red-950 sm:p-5"
      >
        <p className="font-semibold">Competition now closed</p>
        <p className="mt-1 text-sm leading-relaxed">{closedMessage}</p>
      </aside>
    )
  }

  if (status === 'upcoming') {
    return (
      <aside
        aria-live="polite"
        className="rounded-md border border-line-gold bg-anchor-sand p-4 text-ink-strong sm:p-5"
      >
        <p className="font-semibold">Competition not yet open</p>
        <p className="mt-1 text-sm leading-relaxed">
          Please check back when the competition is announced in the WhatsApp group.
        </p>
      </aside>
    )
  }

  return (
    <aside
      aria-live="polite"
      className="rounded-md border border-anchor-green/25 bg-green-50 p-4 text-green-950 sm:p-5"
    >
      <p className="font-semibold">Competition open</p>
      <p className="mt-1 text-sm leading-relaxed">
        Entries close at {closingTimeLabel} on {eventDateLabel}.
      </p>
    </aside>
  )
}

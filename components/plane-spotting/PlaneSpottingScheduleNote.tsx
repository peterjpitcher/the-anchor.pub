import Link from 'next/link'
import { Plane, CloudSun } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getLondonIsoDate,
  getPlaneSpottingWindowForDate,
  getTodayPlaneSpottingWindow,
  type PlaneSpottingWindowInfo,
} from '@/lib/heathrow-runway-alternation'

type PlaneSpottingScheduleNoteVariant = 'subtle' | 'panel' | 'compact'

interface PlaneSpottingScheduleNoteProps {
  isoDate?: string
  info?: PlaneSpottingWindowInfo
  variant?: PlaneSpottingScheduleNoteVariant
  className?: string
  showCta?: boolean
  ctaSource?: string
}

function resolveInfo(isoDate?: string, info?: PlaneSpottingWindowInfo): PlaneSpottingWindowInfo {
  if (info) return info
  if (isoDate) return getPlaneSpottingWindowForDate(isoDate)
  return getTodayPlaneSpottingWindow()
}

function bookingHref(source: string, isoDate?: string) {
  const params = new URLSearchParams({ source })
  if (isoDate) params.set('date', isoDate)
  return `/book-table?${params.toString()}`
}

export function PlaneSpottingScheduleNote({
  isoDate,
  info,
  variant = 'subtle',
  className,
  showCta = false,
  ctaSource = 'plane_spotting_schedule_note'
}: PlaneSpottingScheduleNoteProps) {
  const schedule = resolveInfo(isoDate, info)

  if (variant === 'compact') {
    return (
      <p className={cn('text-xs text-ink-muted', className)}>
        {schedule.bookingNote}
      </p>
    )
  }

  if (variant === 'panel') {
    return (
      <div className={cn(
        'rounded-md border border-line bg-surface p-4 text-ink shadow-sm',
        className
      )}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-gold bg-anchor-gold/10 text-accent-text">
              <Plane className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent-text">
                Today&apos;s expected overhead window
              </p>
              <p className="mt-1 text-xl font-semibold text-ink-strong">
                Overhead arrivals {schedule.label}
              </p>
              <p className="mt-2 flex gap-2 text-sm text-ink-muted">
                <CloudSun className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
                <span>{schedule.caveat}</span>
              </p>
            </div>
          </div>

          {showCta ? (
            <Link
              href={bookingHref(ctaSource, isoDate ?? getLondonIsoDate())}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-anchor-gold-dark px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-anchor-green focus:outline-none focus:ring-2 focus:ring-anchor-gold-dark focus:ring-offset-2 md:w-auto"
            >
              Book a Table
            </Link>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'rounded-md border border-line bg-surface-sunk p-3 text-sm text-ink-muted',
      className
    )}>
      <p className="font-medium text-ink-strong">{schedule.bookingNote}</p>
    </div>
  )
}

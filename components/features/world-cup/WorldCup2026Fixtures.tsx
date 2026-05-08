'use client'

import { useMemo, useState } from 'react'
import { DateTime } from 'luxon'
import { Card } from '@/components/ui/layout/Card'
import { Button } from '@/components/ui/primitives/Button'
import { BookTableButton } from '@/components/BookTableButton'
import { cn } from '@/lib/utils'
import type { WorldCup2026Match, WorldCup2026MatchStage } from '@/lib/world-cup-2026'

const STAGE_ORDER: WorldCup2026MatchStage[] = [
  'First Stage',
  'Round of 32',
  'Round of 16',
  'Quarter-final',
  'Semi-final',
  'Play-off for third place',
  'Final',
]

type MatchShowingStatus = 'showing' | 'opening_early' | 'not_showing'

const stageLabel: Record<WorldCup2026MatchStage, string> = {
  'First Stage': 'Group Stage',
  'Round of 32': 'Round of 32',
  'Round of 16': 'Round of 16',
  'Quarter-final': 'Quarter-finals',
  'Semi-final': 'Semi-finals',
  'Play-off for third place': 'Third-place Playoff',
  'Final': 'Final',
}

function buildTableBookingUrl(bookingTime: DateTime) {
  const params = new URLSearchParams({
    date: bookingTime.toFormat('yyyy-MM-dd'),
    time: bookingTime.toFormat('HH:mm'),
    party_size: '2',
    purpose: 'drinks'
  })

  return `/book-table?${params.toString()}`
}

const countryLabel = (countryCode?: WorldCup2026Match['countryCode']) => {
  if (!countryCode) return null
  if (countryCode === 'USA') return 'USA'
  if (countryCode === 'CAN') return 'Canada'
  if (countryCode === 'MEX') return 'Mexico'
  return countryCode
}

const EXTENDED_CLOSE_DATES: Record<string, number> = {
  '2026-07-03': 24 * 60, // Fri — Round of 32 (Match 86, 23:00)
  '2026-07-04': 24 * 60, // Sat — Round of 16 (Match 89, 22:00)
  '2026-07-09': 24 * 60, // Thu — Quarter-final (Match 97, 21:00)
  '2026-07-11': 24 * 60, // Sat — Quarter-final (Match 99, 22:00)
  '2026-07-18': 24 * 60, // Sat — Third-place playoff (Match 103, 22:00)
}

function getCoreHoursForWeekday(weekday: number): { openMinutes: number; closeMinutes: number } {
  // Luxon weekday: 1 = Monday ... 7 = Sunday
  if (weekday >= 1 && weekday <= 4) {
    return { openMinutes: 16 * 60, closeMinutes: 22 * 60 }
  }
  if (weekday === 5) {
    return { openMinutes: 16 * 60, closeMinutes: 22 * 60 }
  }
  if (weekday === 6) {
    return { openMinutes: 12 * 60, closeMinutes: 22 * 60 }
  }
  return { openMinutes: 12 * 60, closeMinutes: 22 * 60 }
}

function getShowingStatus(londonDateTime: DateTime): {
  status: MatchShowingStatus
  openTime: DateTime
  closeTime: DateTime
} {
  const { openMinutes, closeMinutes } = getCoreHoursForWeekday(londonDateTime.weekday)
  const dateKey = londonDateTime.toISODate()
  const effectiveClose = (dateKey ? EXTENDED_CLOSE_DATES[dateKey] : undefined) ?? closeMinutes
  const dayStart = londonDateTime.startOf('day')
  const openTime = dayStart.plus({ minutes: openMinutes })
  const closeTime = dayStart.plus({ minutes: effectiveClose })
  const earlyStart = openTime.minus({ hours: 1 })

  if (londonDateTime < earlyStart || londonDateTime > closeTime) {
    return { status: 'not_showing', openTime, closeTime }
  }
  if (londonDateTime < openTime) {
    return { status: 'opening_early', openTime, closeTime }
  }
  return { status: 'showing', openTime, closeTime }
}

type FixturesByDate = Array<{
  dateKey: string
  londonDate: DateTime
  matches: Array<{
    match: WorldCup2026Match
    londonDateTime: DateTime
    status: MatchShowingStatus
    openTime: DateTime
    closeTime: DateTime
  }>
}>

interface WorldCup2026FixturesProps {
  matches: WorldCup2026Match[]
  className?: string
}

export function WorldCup2026Fixtures({ matches, className }: WorldCup2026FixturesProps) {
  const [selectedStage, setSelectedStage] = useState<WorldCup2026MatchStage | 'all'>('all')
  const [fixtureVisibility, setFixtureVisibility] = useState<'showing' | 'all'>('showing')

  const availableStages = useMemo(() => {
    const stageSet = new Set<WorldCup2026MatchStage>()
    matches.forEach((match) => stageSet.add(match.stage))
    return STAGE_ORDER.filter((stage) => stageSet.has(stage))
  }, [matches])

  const filteredMatches = useMemo(() => {
    if (selectedStage === 'all') return matches
    return matches.filter((match) => match.stage === selectedStage)
  }, [matches, selectedStage])

  const fixturesByDate: FixturesByDate = useMemo(() => {
    const buckets = new Map<string, Array<{
      match: WorldCup2026Match
      londonDateTime: DateTime
      status: MatchShowingStatus
      openTime: DateTime
      closeTime: DateTime
    }>>()

    filteredMatches.forEach((match) => {
      const londonDateTime = DateTime.fromISO(match.utcDateTime, { zone: 'utc' }).setZone('Europe/London')
      const dateKey = londonDateTime.toISODate()
      if (!dateKey) return
      const { status, openTime, closeTime } = getShowingStatus(londonDateTime)
      const existing = buckets.get(dateKey) ?? []
      existing.push({ match, londonDateTime, status, openTime, closeTime })
      buckets.set(dateKey, existing)
    })

    return Array.from(buckets.entries())
      .map(([dateKey, matches]) => {
        matches.sort((a, b) => a.londonDateTime.toMillis() - b.londonDateTime.toMillis())
        return {
          dateKey,
          londonDate: matches[0]?.londonDateTime.startOf('day') ?? DateTime.fromISO(dateKey),
          matches,
        }
      })
      .sort((a, b) => a.londonDate.toMillis() - b.londonDate.toMillis())
  }, [filteredMatches])

  return (
    <div className={cn('space-y-8', className)}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant={fixtureVisibility === 'showing' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFixtureVisibility('showing')}
            className="rounded-full"
          >
            Showing Only
          </Button>
          <Button
            variant={fixtureVisibility === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFixtureVisibility('all')}
            className="rounded-full"
          >
            All Fixtures
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant={selectedStage === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedStage('all')}
            className="rounded-full"
          >
            All Matches
          </Button>
          {availableStages.map((stage) => (
            <Button
              key={stage}
              variant={selectedStage === stage ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedStage(stage)}
              className="rounded-full"
            >
              {stageLabel[stage]}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {fixturesByDate.map(({ dateKey, londonDate, matches }) => {
          const displayDate = londonDate.toFormat('EEEE d MMMM yyyy')
          const showingCount = matches.filter(({ status }) => status !== 'not_showing').length
          const notShowingCount = matches.length - showingCount
          const visibleMatches =
            fixtureVisibility === 'all'
              ? matches
              : matches.filter(({ status }) => status !== 'not_showing')
          const hiddenMatches =
            fixtureVisibility === 'all'
              ? []
              : matches.filter(({ status }) => status === 'not_showing')
          return (
            <Card key={dateKey} className="overflow-hidden border border-anchor-gold/15">
              <div className="flex flex-col gap-3 bg-anchor-bg-raised px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-anchor-cream-text">{displayDate}</p>
                  <p className="text-xs text-anchor-cream-text/70">
                    {matches.length} match{matches.length === 1 ? '' : 'es'}
                    {' • '}
                    {showingCount} showing
                    {notShowingCount > 0 && (
                      <>
                        {' • '}
                        {notShowingCount} not showing
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-anchor-gold/15">
                {visibleMatches.map(({ match, londonDateTime, status, closeTime }) => {
                  const timeLabel = londonDateTime.toFormat('HH:mm')
                  const stageText = stageLabel[match.stage]
                  const country = countryLabel(match.countryCode)
                  const locationParts = [match.city, country].filter(Boolean).join(', ')
                  const teamsLabel = match.placeholderA && match.placeholderB ? `${match.placeholderA} vs ${match.placeholderB}` : `Match ${match.matchNumber}`
                  const isEnglandMatch = teamsLabel.toLowerCase().includes('england')
                  const secondaryBits = [match.group, stageText].filter(Boolean)
                  const isShowing = status !== 'not_showing'
                  const startsBeforeOpen = status === 'opening_early'
                  const estimatedEnd = londonDateTime.plus({ minutes: 120 })
                  const mayRunPastClose = isShowing && estimatedEnd.toMillis() > closeTime.toMillis()
                  const bookingDateTime = londonDateTime.minus({ minutes: 30 })
                  const bookingUrl = buildTableBookingUrl(bookingDateTime)

                  const statusLabelText = (() => {
                    if (!isShowing) return 'Not showing'
                    if (startsBeforeOpen) return 'Opening early'
                    return 'Showing'
                  })()

                  const statusPillClassName = (() => {
                    if (!isShowing) return 'bg-anchor-bg-raised text-anchor-cream-text/55'
                    if (startsBeforeOpen) return 'bg-amber-500/20 text-amber-400'
                    return 'bg-anchor-green/20 text-anchor-gold-vivid'
                  })()

                  return (
                    <div
                      key={match.matchNumber}
                      id={`match-${match.matchNumber}`}
                      className={cn(
                        'flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
                        !isShowing && 'bg-anchor-bg-raised'
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="inline-flex rounded-full bg-anchor-green/20 px-2.5 py-1 text-xs font-bold text-anchor-gold-vivid">
                            {timeLabel}
                          </span>
                          <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', statusPillClassName)}>
                            {statusLabelText}
                          </span>
                          {isEnglandMatch && (
                            <span className="inline-flex rounded-full bg-anchor-gold/20 px-2.5 py-1 text-xs font-semibold text-anchor-gold-vivid">
                              England
                            </span>
                          )}
                          <p className="text-sm font-semibold text-anchor-cream-text">{teamsLabel}</p>
                          <span className="text-xs text-anchor-cream-text/55">Match {match.matchNumber}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-anchor-cream-text/70">
                          {secondaryBits.length > 0 && <span>{secondaryBits.join(' • ')}</span>}
                          {locationParts && <span>{locationParts}</span>}
                          {mayRunPastClose && (
                            <span className="text-amber-400">
                              May run past closing
                            </span>
                          )}
                        </div>
                        {!isShowing && (
                          <p className="mt-2 text-xs text-anchor-cream-text/70">
                            Kick-off is outside our opening hours.
                          </p>
                        )}
                      </div>

                      {isShowing && (
                        <div className="inline-flex w-full flex-col sm:w-auto">
                          <BookTableButton
                            source={`world_cup_match_${match.matchNumber}`}
                            context="sport"
                            eventName={`World Cup ${teamsLabel} (${displayDate} ${timeLabel})`}
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                            customHref={bookingUrl}
                          >
                            Book Table
                          </BookTableButton>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {fixtureVisibility === 'showing' && hiddenMatches.length > 0 && (
                <details className="border-t border-anchor-gold/15 bg-anchor-bg-card">
                  <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-anchor-cream-text/70 hover:bg-anchor-bg-raised">
                    {hiddenMatches.length} match{hiddenMatches.length === 1 ? '' : 'es'} not showing (outside opening hours)
                  </summary>
                  <div className="divide-y divide-anchor-gold/15">
                    {hiddenMatches.map(({ match, londonDateTime, status, closeTime }) => {
                      const timeLabel = londonDateTime.toFormat('HH:mm')
                      const stageText = stageLabel[match.stage]
                      const country = countryLabel(match.countryCode)
                      const locationParts = [match.city, country].filter(Boolean).join(', ')
                      const teamsLabel =
                        match.placeholderA && match.placeholderB
                          ? `${match.placeholderA} vs ${match.placeholderB}`
                          : `Match ${match.matchNumber}`
                      const isEnglandMatch = teamsLabel.toLowerCase().includes('england')
                      const secondaryBits = [match.group, stageText].filter(Boolean)
                      const estimatedEnd = londonDateTime.plus({ minutes: 120 })
                      const mayRunPastClose = estimatedEnd.toMillis() > closeTime.toMillis()

                      return (
                        <div
                          key={match.matchNumber}
                          id={`match-${match.matchNumber}`}
                          className="flex flex-col gap-3 bg-anchor-bg-raised px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="inline-flex rounded-full bg-anchor-green/20 px-2.5 py-1 text-xs font-bold text-anchor-gold-vivid">
                                {timeLabel}
                              </span>
                              <span className="inline-flex rounded-full bg-anchor-bg-card px-2.5 py-1 text-xs font-semibold text-anchor-cream-text/55">
                                Not showing
                              </span>
                              {isEnglandMatch && (
                                <span className="inline-flex rounded-full bg-anchor-gold/20 px-2.5 py-1 text-xs font-semibold text-anchor-gold-vivid">
                                  England
                                </span>
                              )}
                              <p className="text-sm font-semibold text-anchor-cream-text">{teamsLabel}</p>
                              <span className="text-xs text-anchor-cream-text/55">Match {match.matchNumber}</span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-anchor-cream-text/70">
                              {secondaryBits.length > 0 && <span>{secondaryBits.join(' • ')}</span>}
                              {locationParts && <span>{locationParts}</span>}
                              {mayRunPastClose && <span className="text-amber-400">May run past closing</span>}
                            </div>
                            <p className="mt-2 text-xs text-anchor-cream-text/70">Kick-off is outside our opening hours.</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </details>
              )}
            </Card>
          )
        })}

        {fixturesByDate.length === 0 && (
          <div className="py-12 text-center text-anchor-cream-text/55">No matches found for your selection.</div>
        )}
      </div>

      <div className="text-center text-xs text-anchor-cream-text/55 italic">
        * Times shown in UK time (BST). Fixtures subject to change.
      </div>
    </div>
  )
}

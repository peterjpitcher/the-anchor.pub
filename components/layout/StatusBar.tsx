'use client'

import { cn } from '@/lib/utils'
import { StatusIndicator } from '@/components/ui/StatusIndicator'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import { formatTime12Hour, getTodayHours, getTomorrowHours, findNextKitchenOpening } from '@/lib/status-boundary-calculator'
import { KitchenStatus } from '@/lib/api'
import { useBusinessHoursContext } from '@/components/providers/BusinessHoursProvider'

interface StatusBarProps {
  variant?: 'default' | 'compact' | 'navigation' | 'hero'
  showKitchen?: boolean
  className?: string
  apiEndpoint?: string
  theme?: {
    background?: string
    border?: string
    text?: string
    accentText?: string
  }
  labels?: {
    barOpen?: string
    barClosed?: string
    kitchenOpen?: string
    kitchenClosed?: string
    opens?: string
    closes?: string
  }
}

const defaultTheme = {
  background: 'bg-anchor-green',
  border: 'border-2 border-anchor-gold',
  text: 'text-white',
  accentText: 'text-white/60'
}

const defaultLabels = {
  barOpen: 'Bar open',
  barClosed: 'Bar closed',
  kitchenOpen: 'Kitchen open',
  kitchenClosed: 'Kitchen closed',
  kitchenClosedBarOpen: 'Bar Open • Kitchen Closed',
  noKitchenService: 'No Kitchen Service',
  opens: 'opens',
  closes: 'closes'
}

/**
 * Check if kitchen has opening hours
 */
function isKitchenOpen(kitchen: KitchenStatus): kitchen is { opens: string; closes: string } {
  return kitchen !== null && 'opens' in kitchen && 'closes' in kitchen
}

/**
 * Check if kitchen is explicitly closed
 */
function isKitchenClosed(kitchen: KitchenStatus): boolean {
  return kitchen !== null && 'is_closed' in kitchen && kitchen.is_closed === true
}

/**
 * Get bar status message trusting API data completely
 */
function resolveTodaySchedule(hours: any) {
  const todayFromApi = hours?.today
  if (todayFromApi && typeof todayFromApi === 'object' && ('opens' in todayFromApi || 'closes' in todayFromApi)) {
    return todayFromApi
  }
  return getTodayHours(hours)
}

function getBarStatus(hours: any): string {
  const { currentStatus } = hours
  const todayHours = resolveTodaySchedule(hours)

  // Trust currentStatus.isOpen from API
  if (currentStatus.isOpen) {
    const closes = todayHours?.closes
    if (closes) {
      return `Bar: Open · closes ${formatTime12Hour(closes)}`
    }
    return 'Bar: Open'
  }

  // Bar is closed - determine if opens today or tomorrow
  if (todayHours?.opens && !todayHours.is_closed) {
    const now = new Date()
    const [openHour, openMin] = todayHours.opens.split(':').map(Number)
    const openingTime = new Date()
    openingTime.setHours(openHour, openMin, 0, 0)

    if (openingTime > now) {
      return `Bar: Opens at ${formatTime12Hour(todayHours.opens)}`
    }
  }

  // Opens tomorrow - get tomorrow's data
  const tomorrowHours = getTomorrowHours(hours)
  if (tomorrowHours?.opens && !tomorrowHours.is_closed) {
    return `Bar: Opens tomorrow at ${formatTime12Hour(tomorrowHours.opens)}`
  }

  // Closed with no known opening
  return 'Bar: Closed'
}

/**
 * Get kitchen status with robust null handling
 */
function getKitchenStatus(hours: any): {
  status: string
  indicator: 'open' | 'warning' | 'closed'
} {
  const { currentStatus } = hours
  const todayHours = resolveTodaySchedule(hours)

  const futureOpeningMessage = (
    fallbackStatus: string,
    fallbackIndicator: 'open' | 'warning' | 'closed' = 'closed',
    options: { includeToday?: boolean } = {}
  ): { status: string; indicator: 'open' | 'warning' | 'closed' } => {
    const nextOpening = findNextKitchenOpening(hours, {
      includeToday: options.includeToday ?? false
    })

    if (!nextOpening) {
      return {
        status: fallbackStatus,
        indicator: fallbackIndicator
      }
    }

    const timeLabel = formatTime12Hour(nextOpening.opens)
    const whenLabel =
      nextOpening.offset === 0
        ? `at ${timeLabel}`
        : nextOpening.offset === 1
          ? `tomorrow at ${timeLabel}`
          : `${nextOpening.dayName} at ${timeLabel}`

    return {
      status: `Kitchen: Opens ${whenLabel}`,
      indicator: currentStatus.isOpen ? 'warning' : 'closed'
    }
  }
  
  // Guard 1: Check if there are no hours for today (fully closed)
  if (!todayHours) {
    return futureOpeningMessage('Kitchen: Closed')
  }
  
  const kitchenHours = todayHours.kitchen
  const kitchenClosedToday = (todayHours as any).is_kitchen_closed === true

  if (kitchenClosedToday) {
    return futureOpeningMessage('Kitchen: Closed today')
  }

  // Guard 2: Check if kitchen data exists
  if (kitchenHours === null || kitchenHours === undefined) {
    return futureOpeningMessage('Kitchen: No service')
  }
  
  if (isKitchenClosed(kitchenHours)) {
    // Kitchen explicitly closed today
    return futureOpeningMessage('Kitchen: Closed today')
  }
  
  // Kitchen has hours - check current status
  if (isKitchenOpen(kitchenHours)) {
    // Use currentStatus.kitchenOpen from API (source of truth)
    if (currentStatus.kitchenOpen) {
      return {
        status: `Kitchen: Open · closes ${formatTime12Hour(kitchenHours.closes)}`,
        indicator: 'open'
      }
    } else {
      // Kitchen is closed but has hours - check if it opens later today
      const now = new Date()
      const [openHour, openMin] = kitchenHours.opens.split(':').map(Number)
      const openingTime = new Date()
      openingTime.setHours(openHour, openMin, 0, 0)

      if (openingTime > now) {
        // Opens later today - keep the message focused on the next action.
        return {
          status: `Kitchen: Opens at ${formatTime12Hour(kitchenHours.opens)}`,
          indicator: currentStatus.isOpen ? 'warning' : 'closed'
        }
      }

      // Kitchen won't open again today, find next available service
      return futureOpeningMessage(
        'Kitchen: Closed',
        currentStatus.isOpen ? 'warning' : 'closed'
      )
    }
  }
  
  // Fallback
  return futureOpeningMessage('Kitchen: Closed')
}

export function StatusBar({ 
  variant = 'default', 
  showKitchen = true,
  className = '',
  apiEndpoint = '/api/business/hours',
  theme = defaultTheme,
  labels = defaultLabels
}: StatusBarProps) {
  const contextValue = useBusinessHoursContext()
  const hookValue = useBusinessHours({ apiEndpoint, enabled: !contextValue })
  const { hours, loading, error, isStale } = contextValue ?? hookValue
  
  const mergedTheme = { ...defaultTheme, ...theme }
  const mergedLabels = { ...defaultLabels, ...labels }
  
  function renderFallbackStatus(reason: 'loading' | 'unavailable') {
    const barFallback =
      reason === 'loading'
        ? 'Opening times loading'
        : 'Opening times unavailable'
    const kitchenFallback = "Call 01753 682707 for today's times"

    if (variant === 'navigation') {
      return (
        <div className={cn('flex flex-col items-start gap-1 text-[13px] sm:text-[15px] font-semibold', className)}>
          <div className="flex items-center gap-1.5">
            <StatusIndicator status="warning" size="sm" />
            <span className="whitespace-normal break-words text-left leading-snug uppercase tracking-wider text-white">
              {barFallback}
            </span>
          </div>
          {showKitchen && (
            <div className="flex items-center gap-1.5">
              <StatusIndicator status="warning" size="sm" />
              <a href="tel:+441753682707" className="whitespace-normal break-words text-left leading-snug uppercase tracking-wider text-white underline decoration-white/40 underline-offset-2">
                {kitchenFallback}
              </a>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className={cn(
        'flex w-full flex-col items-center justify-center gap-1 rounded-full px-4 sm:px-6 py-2.5 shadow-md',
        mergedTheme.background,
        mergedTheme.border,
        className
      )}>
        <div className="flex flex-col items-center gap-0.5 text-sm sm:text-base font-medium w-full text-center">
          <div className="flex items-center justify-center gap-1.5 leading-tight">
            <StatusIndicator status="warning" size={variant === 'compact' ? 'sm' : 'md'} />
            <span className="leading-tight uppercase tracking-wider">{barFallback}</span>
          </div>
          {showKitchen && (
            <div className="flex items-center justify-center gap-1.5 leading-tight">
              <StatusIndicator status="warning" size={variant === 'compact' ? 'sm' : 'md'} />
              <a href="tel:+441753682707" className="leading-tight uppercase tracking-wider underline decoration-white/40 underline-offset-2">
                {kitchenFallback}
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show useful fallback content if no cached data is available.
  if (loading && !hours) {
    return renderFallbackStatus('loading')
  }

  // If no data at all, keep a useful contact path visible.
  if (!hours) {
    return renderFallbackStatus(error ? 'unavailable' : 'loading')
  }

  // Get status messages from API data
  const barStatus = getBarStatus(hours)
  const kitchenInfo = showKitchen ? getKitchenStatus(hours) : null
  
  // Determine overall background based on status
  const isOpen = hours.currentStatus.isOpen
  const overallStatus = isOpen ? (kitchenInfo?.indicator === 'open' ? 'open' : 'partial') : 'closed'
  const backgroundClass = overallStatus === 'partial' ? 'bg-amber-500' : mergedTheme.background

  // Variant-specific styling
  const containerClasses = {
    default: 'flex w-full flex-col items-center justify-center gap-1 rounded-full px-4 sm:px-6 py-2.5 shadow-md',
    compact: 'flex w-full flex-col items-center justify-center gap-1 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-md',
    navigation: 'flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2',
    hero: 'inline-flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-full px-5 sm:px-7 py-2.5 shadow-lg w-auto max-w-full'
  }

  const textClasses = {
    default: 'flex flex-col items-center gap-0.5 text-sm sm:text-base font-medium w-full text-center',
    compact: 'flex flex-col items-center gap-0.5 text-xs sm:text-sm font-medium w-full text-center',
    navigation: 'flex flex-col items-start gap-1 text-[13px] sm:text-[15px] font-semibold',
    hero: 'flex flex-col sm:flex-row items-start sm:items-center gap-1.5 text-base sm:text-xl font-semibold'
  }

  let statusTextClass = 'leading-tight uppercase tracking-wider'
  if (variant === 'navigation') {
    statusTextClass = 'whitespace-normal break-words text-left leading-snug uppercase tracking-wider'
  } else if (variant === 'hero') {
    statusTextClass = 'text-left leading-tight text-base sm:text-xl font-semibold uppercase tracking-wider'
  }
  
  const indicatorSize = variant === 'navigation' || variant === 'compact' ? 'sm' : 'md'

  return (
    <div className={cn(
      containerClasses[variant],
      variant !== 'navigation' && backgroundClass,
      variant !== 'navigation' && mergedTheme.border,
      className
    )}>
      <div className={cn(textClasses[variant], mergedTheme.text)}>
        {variant === 'navigation' ? (
          // Navigation variant: show on two lines
          <>
            <div className="flex items-center gap-1.5">
              <StatusIndicator status={isOpen ? 'open' : 'closed'} size={indicatorSize} />
              <span className={statusTextClass}>{barStatus}</span>
            </div>
            {showKitchen && kitchenInfo && (
              <div className="flex items-center gap-1.5">
                <StatusIndicator 
                  status={kitchenInfo.indicator} 
                  size={indicatorSize}
                />
                <span className={statusTextClass}>{kitchenInfo.status}</span>
              </div>
            )}
          </>
        ) : (
          // Default/compact variants: stacked vertically, centred
          <>
            <div className="flex items-center justify-center gap-1.5">
              <StatusIndicator status={isOpen ? 'open' : 'closed'} size={indicatorSize} />
              <span className={statusTextClass}>{barStatus}</span>
            </div>

            {showKitchen && kitchenInfo && (
              <div className="flex items-center justify-center gap-1.5">
                <StatusIndicator
                  status={kitchenInfo.indicator}
                  size={indicatorSize}
                />
                <span className={statusTextClass}>{kitchenInfo.status}</span>
              </div>
            )}
          </>
        )}
        
        {/* Stale data indicator */}
        {isStale && (
          <span className="text-xs text-amber-600 ml-2" title="Status may be outdated">
            (updating...)
          </span>
        )}
      </div>
    </div>
  )
}

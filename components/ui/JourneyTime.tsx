import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from './types'
import { CarIcon, ClockIcon } from './Icon'

export interface JourneyTimeProps
  extends BaseComponentProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  from: string
  to: string
  duration: number // in minutes
  distance?: number // in miles
  variant?: 'default' | 'compact' | 'detailed'
  showIcon?: boolean
  highlight?: boolean
}

export const JourneyTime = forwardRef<HTMLDivElement, JourneyTimeProps>(
  ({ 
    from,
    to,
    duration,
    distance,
    variant = 'default',
    showIcon = true,
    highlight = false,
    className,
    testId,
    ...props 
  }, ref) => {
    const formatDuration = (minutes: number) => {
      if (minutes < 60) {
        return `${minutes} min${minutes !== 1 ? 's' : ''}`
      }
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}h ${mins}m`
    }

    if (variant === 'compact') {
      return (
        <div
          ref={ref}
          className={cn(
            'flex justify-between items-center p-3 rounded-lg',
            highlight ? "bg-anchor-gold/10 border border-anchor-gold/30" : "bg-surface-sunk border border-line",
            className
          )}
          data-testid={testId}
          {...props}
        >
          <span className="font-semibold text-ink-strong">{to}</span>
          <span className={cn(
            'font-bold',
            highlight ? "text-accent-text" : "text-accent-text"
          )}>
            {formatDuration(duration)}
          </span>
        </div>
      )
    }

    if (variant === 'detailed') {
      return (
        <div
          ref={ref}
          className={cn(
            'p-4 rounded-lg',
            highlight ? "bg-anchor-gold/10 border border-anchor-gold/30" : "bg-surface-sunk border border-line",
            className
          )}
          data-testid={testId}
          {...props}
        >
          <div className="flex items-start gap-3">
            {showIcon && (
              <div className="mt-1">
                <CarIcon className="h-5 w-5 text-ink-muted" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-ink-muted">From: {from}</p>
                  <p className="font-semibold text-ink-strong">To: {to}</p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    'text-lg font-bold',
                    highlight ? "text-accent-text" : "text-accent-text"
                  )}>
                    {formatDuration(duration)}
                  </p>
                  {distance && (
                    <p className="text-sm text-ink-muted">{distance} miles</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Default variant
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2',
          className
        )}
        data-testid={testId}
        {...props}
      >
        {showIcon && <CarIcon className="h-4 w-4 text-ink-muted" />}
        <span className="text-ink-muted">{to}:</span>
        <span className={cn(
          'font-semibold',
          highlight ? "text-accent-text" : "text-accent-text"
        )}>
          {formatDuration(duration)}
        </span>
        {distance && (
          <span className="text-sm text-ink-muted">({distance} miles)</span>
        )}
      </div>
    )
  }
)
JourneyTime.displayName = 'JourneyTime'

// Compound component for multiple journey times
export interface JourneyTimesProps
  extends BaseComponentProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  title?: string
  from: string
  destinations: Array<{
    to: string
    duration: number
    distance?: number
    highlight?: boolean
  }>
  variant?: 'default' | 'compact' | 'detailed'
}

export const JourneyTimes = forwardRef<HTMLDivElement, JourneyTimesProps>(
  ({ 
    title,
    from,
    destinations,
    variant = 'compact',
    className,
    testId,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-3', className)}
        data-testid={testId}
        {...props}
      >
        {title && (
          <h3 className="text-lg font-semibold text-ink-strong mb-3">{title}</h3>
        )}
        {destinations.map((dest, index) => (
          <JourneyTime
            key={`${dest.to}-${index}`}
            from={from}
            to={dest.to}
            duration={dest.duration}
            distance={dest.distance}
            highlight={dest.highlight}
            variant={variant}
            showIcon={variant === 'detailed'}
          />
        ))}
      </div>
    )
  }
)
JourneyTimes.displayName = 'JourneyTimes'

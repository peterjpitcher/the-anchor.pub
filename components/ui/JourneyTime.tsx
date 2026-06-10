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
            highlight ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-anchor-green-raised',
            className
          )}
          data-testid={testId}
          {...props}
        >
          <span className="font-semibold text-anchor-cream-text">{to}</span>
          <span className={cn(
            'font-bold',
            highlight ? 'text-amber-300' : 'text-anchor-gold-dark'
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
            highlight ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-anchor-green-raised',
            className
          )}
          data-testid={testId}
          {...props}
        >
          <div className="flex items-start gap-3">
            {showIcon && (
              <div className="mt-1">
                <CarIcon className="h-5 w-5 text-anchor-cream-text/70" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-anchor-cream-text/70">From: {from}</p>
                  <p className="font-semibold text-anchor-cream-text">To: {to}</p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    'text-lg font-bold',
                    highlight ? 'text-amber-300' : 'text-anchor-gold-dark'
                  )}>
                    {formatDuration(duration)}
                  </p>
                  {distance && (
                    <p className="text-sm text-anchor-cream-text/70">{distance} miles</p>
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
        {showIcon && <CarIcon className="h-4 w-4 text-anchor-cream-text/70" />}
        <span className="text-anchor-cream-text/70">{to}:</span>
        <span className={cn(
          'font-semibold',
          highlight ? 'text-amber-300' : 'text-anchor-gold-dark'
        )}>
          {formatDuration(duration)}
        </span>
        {distance && (
          <span className="text-sm text-anchor-cream-text/55">({distance} miles)</span>
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
          <h3 className="text-lg font-semibold text-anchor-cream-text mb-3">{title}</h3>
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

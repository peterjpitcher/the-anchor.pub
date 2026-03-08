import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from './types'
import { ClockIcon, CheckIcon } from './Icon'
// XCircle icon temporarily removed

export interface OpeningHour {
  day: string
  hours: string
  kitchen?: string
  isClosed?: boolean
  isToday?: boolean
}

export interface OpeningHoursProps
  extends BaseComponentProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  hours: OpeningHour[]
  variant?: 'default' | 'compact' | 'detailed'
  showKitchen?: boolean
  showIcon?: boolean
  title?: string
}

export const OpeningHours = forwardRef<HTMLDivElement, OpeningHoursProps>(
  ({ 
    hours,
    variant = 'default',
    showKitchen = true,
    showIcon = true,
    title = 'Opening Hours',
    className,
    testId,
    ...props 
  }, ref) => {
    if (variant === 'compact') {
      return (
        <div
          ref={ref}
          className={cn('space-y-2', className)}
          data-testid={testId}
          {...props}
        >
          {hours.map((hour) => (
            <div
              key={hour.day}
              className={cn(
                'flex justify-between items-center py-1',
                hour.isToday && 'font-semibold text-anchor-gold-vivid'
              )}
            >
              <span className="text-sm">{hour.day}</span>
              <span className="text-sm">
                {hour.isClosed ? (
                  <span className="text-red-600">Closed</span>
                ) : (
                  hour.hours
                )}
              </span>
            </div>
          ))}
        </div>
      )
    }

    if (variant === 'detailed') {
      return (
        <div
          ref={ref}
          className={cn('bg-anchor-bg-raised rounded-none p-6', className)}
          data-testid={testId}
          {...props}
        >
          {title && (
            <div className="flex items-center gap-2 mb-4">
              {showIcon && <ClockIcon className="h-5 w-5 text-anchor-cream-text/70" />}
              <h3 className="text-lg font-semibold text-anchor-cream-text">{title}</h3>
            </div>
          )}
          <div className="space-y-3">
            {hours.map((hour) => (
              <div
                key={hour.day}
                className={cn(
                  'flex items-start justify-between p-3 rounded-md',
                  hour.isToday && 'bg-amber-50 border border-amber-200',
                  hour.isClosed && 'opacity-60'
                )}
              >
                <div className="flex-1">
                  <p className={cn(
                    'font-medium',
                    hour.isToday && 'text-amber-800'
                  )}>
                    {hour.day}
                    {hour.isToday && (
                      <span className="ml-2 text-xs bg-amber-600 text-white px-2 py-0.5 rounded">
                        TODAY
                      </span>
                    )}
                  </p>
                  {showKitchen && hour.kitchen && !hour.isClosed && (
                    <p className="text-sm text-anchor-cream-text/70 mt-1">
                      Kitchen: {hour.kitchen}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {hour.isClosed ? (
                    <div className="flex items-center gap-1 text-red-600">
                      <span className="font-medium">Closed</span>
                    </div>
                  ) : (
                    <div>
                      <p className={cn(
                        'font-medium',
                        hour.isToday && 'text-amber-800'
                      )}>
                        {hour.hours}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Default variant
    return (
      <div
        ref={ref}
        className={cn('', className)}
        data-testid={testId}
        {...props}
      >
        {title && (
          <div className="flex items-center gap-2 mb-3">
            {showIcon && <ClockIcon className="h-4 w-4 text-anchor-cream-text/70" />}
            <h3 className="font-semibold text-anchor-cream-text">{title}</h3>
          </div>
        )}
        <div className="space-y-2">
          {hours.map((hour) => (
            <div
              key={hour.day}
              className={cn(
                'flex justify-between items-center',
                hour.isToday && 'font-semibold text-anchor-gold-vivid'
              )}
            >
              <span>{hour.day}</span>
              <span>
                {hour.isClosed ? (
                  <span className="text-red-600">Closed</span>
                ) : (
                  <>
                    {hour.hours}
                    {showKitchen && hour.kitchen && (
                      <span className="text-sm text-anchor-cream-text/70 ml-2">
                        (Kitchen: {hour.kitchen})
                      </span>
                    )}
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
)
OpeningHours.displayName = 'OpeningHours'

// Helper component for current status
export interface OpenStatusProps
  extends BaseComponentProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  isOpen: boolean
  closingTime?: string
  openingTime?: string
  size?: 'sm' | 'md' | 'lg'
}

export const OpenStatus = forwardRef<HTMLDivElement, OpenStatusProps>(
  ({ 
    isOpen,
    closingTime,
    openingTime,
    size = 'md',
    className,
    testId,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'text-sm px-2 py-1',
      md: 'text-base px-3 py-1.5',
      lg: 'text-lg px-4 py-2'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 rounded-full font-medium',
          isOpen ? 'bg-anchor-gold-vivid/15 text-anchor-gold-vivid' : 'bg-red-900/20 text-red-400',
          sizeClasses[size],
          className
        )}
        data-testid={testId}
        {...props}
      >
        <div className={cn(
          'h-2 w-2 rounded-full',
          isOpen ? 'bg-anchor-gold-vivid' : 'bg-red-500'
        )} />
        <span>
          {isOpen ? 'Open' : 'Closed'}
          {isOpen && closingTime && ` until ${closingTime}`}
          {!isOpen && openingTime && ` • Opens ${openingTime}`}
        </span>
      </div>
    )
  }
)
OpenStatus.displayName = 'OpenStatus'
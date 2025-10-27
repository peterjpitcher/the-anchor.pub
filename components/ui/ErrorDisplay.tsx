'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CONTACT_INFO } from '@/lib/error-handling'

interface ErrorDisplayProps {
  message: string
  onRetry?: () => void
  showContactInfo?: boolean
  showDetails?: boolean
  technicalDetails?: string
  variant?: 'inline' | 'card' | 'banner'
  className?: string
}

export function ErrorDisplay({
  message,
  onRetry,
  showContactInfo = true,
  showDetails = false,
  technicalDetails,
  variant = 'card',
  className
}: ErrorDisplayProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(false)

  const baseClasses = {
    inline: 'text-red-700 text-sm',
    card: 'bg-red-50 border border-red-200 rounded-lg p-6 text-center',
    banner: 'bg-red-50 border-t border-b border-red-200 py-4 px-6'
  }

  if (variant === 'inline') {
    return (
      <div className={cn(baseClasses.inline, className)} role="alert">
        <p>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-anchor-gold hover:text-anchor-gold-light font-semibold underline ml-2"
            aria-label="Try again"
          >
            Try again
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn(baseClasses[variant], className)} role="alert">
      <div className="max-w-2xl mx-auto">
        <p className="text-red-700 mb-4 text-base font-medium">{message}</p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-anchor-gold text-white rounded-full font-semibold hover:bg-anchor-gold-light transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Try again"
            >
              Try Again
            </button>
          )}
          
          {showContactInfo && (
            <p className="text-gray-700 text-sm">
              Still having issues?{' '}
              <a
                href={CONTACT_INFO.phoneLink}
                className="text-anchor-gold hover:text-anchor-gold-light font-semibold underline"
              >
                Call us at {CONTACT_INFO.phone}
              </a>
            </p>
          )}
        </div>

        {showDetails && technicalDetails && (
          <div className="mt-4 border-t border-red-200 pt-4">
            <button
              onClick={() => setDetailsExpanded(!detailsExpanded)}
              className="text-sm text-gray-600 hover:text-gray-800 underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-anchor-gold rounded"
              aria-expanded={detailsExpanded}
              aria-controls="error-details"
            >
              {detailsExpanded ? 'Hide' : 'Show'} technical details
            </button>
            
            {detailsExpanded && (
              <pre
                id="error-details"
                className="mt-2 text-xs text-left bg-white p-3 rounded border border-gray-200 overflow-x-auto"
              >
                {technicalDetails}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Specific error variants for common use cases
export function EventsErrorDisplay({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      message="We couldn't load the events right now. Please refresh the page or try again in a moment."
      onRetry={onRetry}
      showContactInfo={true}
    />
  )
}

export function BookingErrorDisplay({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      message="We couldn't process your booking online. Please call us at 01753 682707 and we'll reserve your spot right away."
      onRetry={onRetry}
      showContactInfo={true}
      variant="card"
    />
  )
}

export function FlightErrorDisplay({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      message="Flight information is temporarily unavailable. For real-time updates, visit the Heathrow Airport website."
      onRetry={onRetry}
      showContactInfo={true}
    />
  )
}

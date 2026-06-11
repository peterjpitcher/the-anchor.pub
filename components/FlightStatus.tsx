'use client'

import { useEffect, useState, useRef, useCallback, memo } from 'react'
import { flightAPI, FlightAPI, type Flight } from '@/lib/flights'
import { FlightErrorDisplay } from '@/components/ui/ErrorDisplay'
import { LoadingState } from '@/components/ui/LoadingState'
import { useFlightError } from '@/hooks/useErrorHandler'

interface FlightStatusProps {
  terminal: string
  type?: 'departures' | 'arrivals' | 'both'
  limit?: number
  refreshInterval?: number // in milliseconds
  pauseWhenHidden?: boolean
}

export function FlightStatus({ 
  terminal, 
  type = 'both', 
  limit = 5,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
  pauseWhenHidden = true
}: FlightStatusProps) {
  const [departures, setDepartures] = useState<Flight[]>([])
  const [arrivals, setArrivals] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { error, handleError, retry, retryCount } = useFlightError()

  const fetchFlights = useCallback(async () => {
    try {
      setLoading(true)
      // Clear any previous errors

      if (type === 'departures' || type === 'both') {
        const deps = await flightAPI.getDepartures(terminal, limit * 2) // Get more to filter
        // Filter by terminal if we got all flights
        const filtered = deps.flights.filter(flight => 
          !terminal || 
          flight.departure.terminal === terminal || 
          flight.departure.terminal === `T${terminal}` ||
          flight.departure.terminal === `Terminal ${terminal}`
        ).slice(0, limit)
        setDepartures(filtered)
      }

      if (type === 'arrivals' || type === 'both') {
        const arrs = await flightAPI.getArrivals(terminal, limit * 2) // Get more to filter
        // Filter by terminal if we got all flights
        const filtered = arrs.flights.filter(flight => 
          !terminal || 
          flight.arrival.terminal === terminal || 
          flight.arrival.terminal === `T${terminal}` ||
          flight.arrival.terminal === `Terminal ${terminal}`
        ).slice(0, limit)
        setArrivals(filtered)
      }
    } catch (err) {
      // Error: Failed to fetch flight data
      handleError(err)
    } finally {
      setLoading(false)
      setLastUpdate(new Date())
    }
  }, [terminal, type, limit, handleError])

  // Set up intersection observer for visibility detection
  useEffect(() => {
    if (!pauseWhenHidden || !containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [pauseWhenHidden])

  // Handle fetching and refresh interval
  useEffect(() => {
    // Initial fetch
    fetchFlights()

    // Set up refresh interval if visible
    if (isVisible && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchFlights, refreshInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [terminal, type, limit, isVisible, refreshInterval, fetchFlights, retryCount])

  if (loading) {
    return (
      <div className="bg-surface border border-line rounded-md p-6">
        <LoadingState variant="skeleton" className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-surface border border-line rounded-md p-6">
        <FlightErrorDisplay onRetry={retry} />
      </div>
    )
  }

  const FlightRow = memo(({ flight, isDeparture }: { flight: Flight; isDeparture: boolean }) => {
    const status = FlightAPI.getStatusText(flight.flight_status)
    const delay = isDeparture
      ? FlightAPI.calculateDelay(flight.departure.scheduled, flight.departure.estimated)
      : FlightAPI.calculateDelay(flight.arrival.scheduled, flight.arrival.estimated)
    
    const scheduledTime = isDeparture
      ? FlightAPI.formatTime(flight.departure.scheduled)
      : FlightAPI.formatTime(flight.arrival.scheduled)
    
    const actualTime = isDeparture
      ? FlightAPI.formatTime(flight.departure.estimated || flight.departure.actual)
      : FlightAPI.formatTime(flight.arrival.estimated || flight.arrival.actual)
    
    const destination = isDeparture ? flight.arrival.airport : flight.departure.airport
    const gate = isDeparture ? flight.departure.gate : flight.arrival.gate

    return (
      <div className="py-3 border-b border-line last:border-0">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink-strong">
                {flight.airline.iata} {flight.flight.number}
              </span>
              <span className={`text-sm font-medium ${status.color}`}>
                {status.text}
              </span>
              {delay && delay > 0 && (
                <span className="text-sm text-orange-600">
                  +{delay} min
                </span>
              )}
            </div>
            <div className="text-sm text-ink-muted mt-1">
              {isDeparture ? 'To' : 'From'} {destination}
              {gate && <span className="ml-2">• Gate {gate}</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium text-ink-strong">{scheduledTime}</div>
            {actualTime !== scheduledTime && (
              <div className="text-sm text-orange-600">{actualTime}</div>
            )}
          </div>
        </div>
      </div>
    )
  })

  FlightRow.displayName = 'FlightRow'

  return (
    <div ref={containerRef} className="space-y-6" role="region" aria-label="Flight status information">
      {/* ARIA live region for screen readers */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {lastUpdate && `Flight information last updated at ${lastUpdate.toLocaleTimeString()}`}
      </div>

      {(type === 'departures' || type === 'both') && departures.length > 0 && (
        <div className="bg-surface border border-line rounded-md overflow-hidden">
          <div className="bg-surface-sunk text-ink-strong px-6 py-4 border-b border-line">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Departures from Terminal {terminal}
              {!isVisible && pauseWhenHidden && (
                <span className="text-sm sm:text-xs font-normal ml-auto">(Updates paused)</span>
              )}
            </h3>
          </div>
          <div className="px-6 py-2" role="list" aria-label="Departure flights">
            {departures.map((flight, idx) => (
              <div key={`dep-${flight.flight.icao}-${idx}`} role="listitem">
                <FlightRow flight={flight} isDeparture={true} />
              </div>
            ))}
          </div>
        </div>
      )}

      {(type === 'arrivals' || type === 'both') && arrivals.length > 0 && (
        <div className="bg-surface border border-line rounded-md overflow-hidden">
          <div className="bg-surface-sunk text-ink-strong px-6 py-4 border-b border-line">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Arrivals to Terminal {terminal}
              {!isVisible && pauseWhenHidden && (
                <span className="text-sm sm:text-xs font-normal ml-auto">(Updates paused)</span>
              )}
            </h3>
          </div>
          <div className="px-6 py-2" role="list" aria-label="Arrival flights">
            {arrivals.map((flight, idx) => (
              <div key={`arr-${flight.flight.icao}-${idx}`} role="listitem">
                <FlightRow flight={flight} isDeparture={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      {departures.length === 0 && arrivals.length === 0 && (
        <div className="bg-surface border border-line rounded-md p-6">
          <p className="text-ink text-center">
            No flight information available for Terminal {terminal} at this time.
          </p>
          <p className="text-sm sm:text-xs text-ink-muted text-center mt-2">
            Flight data may be limited. Check the Heathrow Airport website for live updates.
          </p>
        </div>
      )}
    </div>
  )
}

// Compact widget for showing delay summary
export const FlightDelayWidget = memo(function FlightDelayWidget({ terminal }: { terminal: string }) {
  const [delayInfo, setDelayInfo] = useState<{
    avgDelay: number
    delayedFlights: number
    totalFlights: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDelayInfo = useCallback(async () => {
    try {
      const [deps, arrs] = await Promise.all([
        flightAPI.getDepartures(terminal, 10),
        flightAPI.getArrivals(terminal, 10)
      ])

      let totalDelay = 0
      let delayedCount = 0
      const allFlights = [...deps.flights, ...arrs.flights]

      allFlights.forEach(flight => {
        const depDelay = FlightAPI.calculateDelay(
          flight.departure.scheduled,
          flight.departure.estimated
        )
        if (depDelay && depDelay > 0) {
          totalDelay += depDelay
          delayedCount++
        }
      })

      setDelayInfo({
        avgDelay: delayedCount > 0 ? Math.round(totalDelay / delayedCount) : 0,
        delayedFlights: delayedCount,
        totalFlights: allFlights.length
      })
    } catch (err) {
      // Error: Failed to fetch delay info
    } finally {
      setLoading(false)
    }
  }, [terminal])

  useEffect(() => {
    fetchDelayInfo()
    // Refresh every 10 minutes
    const interval = setInterval(fetchDelayInfo, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [terminal, fetchDelayInfo])

  if (loading || !delayInfo) {
    return null
  }

  const delayPercentage = delayInfo.totalFlights > 0
    ? Math.round((delayInfo.delayedFlights / delayInfo.totalFlights) * 100)
    : 0

  return (
    <div className="bg-surface-sunk border border-line-gold rounded-md p-4" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <div></div>
        <div className="flex-1">
          <h4 className="font-semibold text-accent-text">
            Terminal {terminal} Flight Status
          </h4>
          {delayInfo.delayedFlights > 0 ? (
            <p className="text-sm text-amber-700 mt-1">
              {delayPercentage}% of flights delayed • Average delay: {delayInfo.avgDelay} minutes
            </p>
          ) : (
            <p className="text-sm text-green-700 mt-1">
              All flights running on schedule
            </p>
          )}
        </div>
      </div>
    </div>
  )
})
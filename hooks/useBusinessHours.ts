'use client'

import { useState, useEffect, useRef } from 'react'
import { BusinessHours } from '@/lib/api'
import { logError } from '@/lib/error-handling'
import { computeNextStatusChange } from '@/lib/status-boundary-calculator'

interface UseBusinessHoursOptions {
  refreshInterval?: number
  apiEndpoint?: string
  /**
   * When false, the hook will skip fetching and remain idle.
   * Useful when a parent provider is already supplying the data.
   */
  enabled?: boolean
}

interface CachedData {
  data: BusinessHours | null
  lastFetchTime: Date | null
  isStale: boolean
}

interface UseBusinessHoursReturn {
  hours: BusinessHours | null
  loading: boolean
  error: Error | null
  isStale: boolean
  refresh: () => Promise<void>
}

/**
 * Custom hook for fetching and managing business hours data
 * Smart refresh timing + robust error handling (no caching)
 */
export function useBusinessHours(options: UseBusinessHoursOptions = {}): UseBusinessHoursReturn {
  const {
    apiEndpoint = '/api/business/hours',
    refreshInterval = 60 * 1000,
    enabled = true
  } = options

  const debugLogging = process.env.NEXT_PUBLIC_STATUSBAR_DEBUG === 'true'

  const [cached, setCached] = useState<CachedData>({ 
    data: null, 
    lastFetchTime: null,
    isStale: false
  })
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<Error | null>(null)
  
  const retryCount = useRef(0)
  const abortControllerRef = useRef<AbortController>()
  const nextRefreshTimerRef = useRef<NodeJS.Timeout>()
  const fallbackTimerRef = useRef<NodeJS.Timeout>()
  const cachedRef = useRef(cached)

  useEffect(() => {
    cachedRef.current = cached
  }, [cached])

  const scheduleNextRefresh = (data: BusinessHours, trigger: string) => {
    // Clear any existing timers
    if (nextRefreshTimerRef.current) {
      clearTimeout(nextRefreshTimerRef.current)
    }

    try {
      // Calculate next status change
      const nextChange = computeNextStatusChange(data)
      
      // Refresh 10 seconds before the boundary to account for network delay
      const msUntilRefresh = Math.max(
        5000, // Minimum 5 seconds
        nextChange.at.getTime() - Date.now() - 10000
      )

      if (debugLogging) {
        const minutesUntil = Math.round(msUntilRefresh / 60000)
        console.log(
          `[StatusBar] Next refresh scheduled in ${minutesUntil} minutes for ${nextChange.reason}`,
          {
            trigger,
            nextChange: nextChange.at.toISOString(),
            currentTime: new Date().toISOString()
          }
        )
      }

      nextRefreshTimerRef.current = setTimeout(() => {
        fetchHours('boundary')
      }, msUntilRefresh)
    } catch (err) {
      // If boundary calculation fails, fall back to regular interval
      if (debugLogging) {
        console.warn('[StatusBar] Failed to calculate next boundary, using fallback', err)
      }
    }
  }

  const fetchHours = async (trigger: string = 'unknown') => {
    if (!enabled) {
      return
    }

    const currentCache = cachedRef.current

    try {
      // Log refresh trigger in development
      if (debugLogging) {
        console.log(`[StatusBar] Refresh triggered by: ${trigger} at ${new Date().toISOString()}`)
      }

      // Cancel any in-flight request
      abortControllerRef.current?.abort()
      abortControllerRef.current = new AbortController()

      const headers: HeadersInit = {
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache'
      }

      const cacheBustedEndpoint = apiEndpoint.includes('?')
        ? `${apiEndpoint}&_=${Date.now()}`
        : `${apiEndpoint}?_=${Date.now()}`

      const response = await fetch(cacheBustedEndpoint, {
        headers,
        cache: 'no-store',
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const result = await response.json()
      
      // Handle API response wrapper
      const data = result.success && result.data ? result.data : result
      
      // Validate the response has expected structure
      if (!data.regularHours || !data.currentStatus) {
        throw new Error('Invalid business hours data structure')
      }
      
      // Successfully fetched - reset retry count
      retryCount.current = 0
      
      setCached({
        data,
        lastFetchTime: new Date(),
        isStale: false
      })
      setError(null)
      
      // Schedule next refresh based on new data
      scheduleNextRefresh(data, 'fetch-success')
      
    } catch (err: any) {
      if (err.name === 'AbortError') return
      
      // On error, mark existing data as stale but keep showing it
      setCached(prev => ({ ...prev, isStale: true }))
      
      const error = err instanceof Error ? err : new Error('Failed to fetch business hours')
      setError(error)
      logError('use-business-hours', error)
      
      // Exponential backoff for retries
      retryCount.current++
      const retryDelay = Math.min(60000, 5000 * Math.pow(2, retryCount.current - 1))
      
      if (debugLogging) {
        console.error(`[StatusBar] Fetch error, retry in ${retryDelay}ms:`, err)
      }
      
      // Schedule retry
      if (nextRefreshTimerRef.current) {
        clearTimeout(nextRefreshTimerRef.current)
      }
      nextRefreshTimerRef.current = setTimeout(() => fetchHours('error-retry'), retryDelay)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return undefined
    }

    fetchHours('mount')
    
    if (refreshInterval > 0) {
      fallbackTimerRef.current = setInterval(() => {
        const lastFetch = cachedRef.current.lastFetchTime?.getTime() ?? 0
        const timeSinceLastFetch = Date.now() - lastFetch
        if (!lastFetch || timeSinceLastFetch >= refreshInterval || cachedRef.current.isStale) {
          fetchHours('fallback')
        }
      }, refreshInterval)
    }
    
    return () => {
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current)
      }
      if (nextRefreshTimerRef.current) {
        clearTimeout(nextRefreshTimerRef.current)
      }
      abortControllerRef.current?.abort()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint, refreshInterval, enabled])

  // Refresh on visibility/focus changes
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchHours('visibility')
      }
    }
    
    const handleFocus = () => {
      fetchHours('focus')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [enabled])

  return {
    hours: cached.data,
    loading,
    error,
    isStale: cached.isStale,
    refresh: () => enabled ? fetchHours('manual') : Promise.resolve()
  }
}

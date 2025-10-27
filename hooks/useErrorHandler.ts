'use client'

import { useState, useCallback } from 'react'
import { getUserFriendlyErrorMessage, logError, isRecoverableError, type ErrorContext } from '@/lib/error-handling'

interface UseErrorHandlerOptions {
  context: ErrorContext
  onError?: (error: unknown) => void
}

export function useErrorHandler({ context, onError }: UseErrorHandlerOptions) {
  const [error, setError] = useState<string | null>(null)
  const [isRecoverable, setIsRecoverable] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [technicalDetails, setTechnicalDetails] = useState<string | null>(null)

  const handleError = useCallback((error: unknown) => {
    // Get user-friendly message
    const userMessage = getUserFriendlyErrorMessage(error, context)
    setError(userMessage)

    // Check if error is recoverable
    setIsRecoverable(isRecoverableError(error))

    // Store technical details for debugging (only in dev)
    if (process.env.NODE_ENV === 'development') {
      setTechnicalDetails(
        error instanceof Error 
          ? error.stack || error.message 
          : JSON.stringify(error, null, 2)
      )
    }

    // Log error for monitoring
    logError(`${context.feature}:${context.action}`, error)

    // Call custom error handler if provided
    onError?.(error)
  }, [context, onError])

  const clearError = useCallback(() => {
    setError(null)
    setTechnicalDetails(null)
  }, [])

  const retry = useCallback(() => {
    clearError()
    setRetryCount(prev => prev + 1)
  }, [clearError])

  return {
    error,
    technicalDetails,
    isRecoverable,
    retryCount,
    handleError,
    clearError,
    retry
  }
}

// Convenience hooks for specific contexts
export function useEventsError(onError?: (error: unknown) => void) {
  return useErrorHandler({
    context: { feature: 'events', action: 'load' },
    onError
  })
}

export function useBookingError(onError?: (error: unknown) => void) {
  return useErrorHandler({
    context: { feature: 'booking', action: 'submit' },
    onError
  })
}

export function useFlightError(onError?: (error: unknown) => void) {
  return useErrorHandler({
    context: { feature: 'flights', action: 'load' },
    onError
  })
}

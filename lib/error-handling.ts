/**
 * User-friendly error message mappings and utilities
 */

import { trackError } from '@/lib/gtm-events'
import { CONTACT } from '@/lib/constants'

export interface ErrorContext {
  feature: 'events' | 'booking' | 'flights' | 'hours' | 'business-hours' | 'general'
  action: 'load' | 'submit' | 'fetch' | 'process'
  showContactInfo?: boolean
  showRetry?: boolean
}

// User-friendly error messages by context
const ERROR_MESSAGES: Record<string, Record<string, string>> = {
  events: {
    load: "We couldn't load the events right now. Please refresh the page or try again in a moment.",
    fetch: "Having trouble getting the latest events. Please check your connection and try again.",
    process: "Something went wrong while processing events. Please try again."
  },
  booking: {
    load: "We couldn't load the booking form. Please refresh the page or call us at 01753 682707.",
    submit: "We couldn't process your booking online. Please call us at 01753 682707 and we'll reserve your spot right away.",
    process: "There was an issue with your booking. Please try again or give us a call at 01753 682707."
  },
  flights: {
    load: "Flight information is temporarily unavailable. For real-time updates, visit the Heathrow Airport website.",
    fetch: "We couldn't load the latest flight information. Please try again or check directly with Heathrow Airport."
  },
  hours: {
    load: "We couldn't load our opening hours. Please call us at 01753 682707 for today's opening times.",
    fetch: "Having trouble loading hours. Please call us at 01753 682707 for today's opening times."
  },
  'business-hours': {
    load: "Unable to load current status. Call 01753 682707 for today's hours.",
    fetch: "Having trouble checking if we're open. Please call 01753 682707 for today's hours.",
    process: "Can't determine current status. Please call 01753 682707 to confirm."
  },
  general: {
    load: "Something went wrong. Please refresh the page and try again.",
    fetch: "We're having trouble connecting. Please check your internet connection and try again.",
    process: "Something unexpected happened. Please try again."
  }
}

// Fallback content by feature
export const FALLBACK_CONTENT = {
  events: {
    title: "Check Our Events",
    message: "Call us at 01753 682707 for today's events schedule",
    link: "/whats-on"
  },
  hours: {
    title: "Opening Hours",
    regular: {}
  },
  flights: {
    message: "For real-time flight information, please visit heathrow.com"
  }
}

/**
 * Get a user-friendly error message based on context
 */
export function getUserFriendlyErrorMessage(
  error: unknown,
  context: ErrorContext
): string {
  // Check for network errors
  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return "Please check your internet connection and try again."
    }
  }

  // Get context-specific message
  const contextMessages = ERROR_MESSAGES[context.feature] || ERROR_MESSAGES.general
  return contextMessages[context.action] || contextMessages.load || ERROR_MESSAGES.general.load
}

/**
 * Standard error response format for API routes
 */
export function createApiErrorResponse(
  message: string,
  status: number = 500,
  details?: any
) {
  const response: any = {
    error: message,
    status,
    timestamp: new Date().toISOString()
  }

  // Only include details in development
  if (process.env.NODE_ENV === 'development' && details) {
    response.details = details
  }

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * Log error for monitoring while keeping user messages friendly
 */
export function logError(context: string, error: unknown, additionalInfo?: Record<string, any>) {
  const errorDetails = {
    context,
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : error,
    ...additionalInfo
  }

  // Track error in analytics
  const errorCategory = context.includes('api') ? 'api' : 
                       context.includes('booking') ? 'booking' : 
                       context.includes('form') ? 'form' : 'api'
  
  const errorLabel = error instanceof Error ? 
    `${context}: ${error.message}` : 
    `${context}: ${JSON.stringify(error)}`
  
  trackError(errorCategory, errorLabel, context)

  // In production, this would send to error monitoring service
  console.error(`[${context}] Error:`, errorDetails)
}

/**
 * Check if an error is recoverable (can be retried)
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Network errors are often recoverable
    if (error.message.includes('network') || 
        error.message.includes('fetch') ||
        error.message.includes('timeout')) {
      return true
    }
  }

  // Check for specific HTTP status codes
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as any).status
    // 5xx errors and 429 (rate limit) are often temporary
    return status >= 500 || status === 429
  }

  return false
}

/**
 * Format contact information consistently
 */
export const CONTACT_INFO = {
  phone: CONTACT.phone,
  phoneFormatted: CONTACT.phone,
  phoneLink: CONTACT.phoneHref,
  getCallToAction: (context?: string) => {
    if (context === 'booking') {
      return `Call us at ${CONTACT_INFO.phone} and we'll help you right away`
    }
    return `Need help? Call us at ${CONTACT_INFO.phone}`
  }
}

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2
}

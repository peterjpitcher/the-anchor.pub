'use client'

import React from 'react'
import { logError } from '@/lib/error-handling'
import { Button } from '@/components/ui'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError('error-boundary', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    })
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback
      
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} reset={this.reset} />
      }
      
      return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold text-anchor-cream-text mb-2">
              Something went wrong
            </h2>
            <p className="text-anchor-cream-text/70 mb-4">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <Button onClick={this.reset} variant="primary">
              Try again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for error handling in functional components
export function useErrorHandler() {
  return (error: Error) => {
    logError('use-error-handler', error)
    // Could also trigger UI notifications here
  }
}

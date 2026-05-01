import React from 'react'
import { PhoneLink } from '@/components/PhoneLink'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class EventBookingErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('EventBooking error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6" role="alert">
          <h3 className="text-lg font-semibold text-red-300 mb-2">Booking System Error</h3>
          <p className="text-anchor-cream-text/75 mb-4">
            We're experiencing technical difficulties with our booking system.
          </p>
          <p className="text-sm text-anchor-cream-text/70">
            Please call us at <PhoneLink phone="01753682707" source="event_booking_error" className="underline font-semibold" showIcon={false}>01753 682707</PhoneLink> to book your spot.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 text-sm text-red-300 underline hover:text-red-200"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

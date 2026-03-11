import { Metadata } from 'next'
import Link from 'next/link'
import { anchorAPI } from '@/lib/api'

// Next.js 15: params is a Promise — must be awaited before use.
interface Props {
  params: Promise<{ bookingId: string }>
}

export const metadata: Metadata = {
  title: 'Parking Confirmed | The Anchor',
  robots: { index: false },
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London',
  })
}

export default async function ParkingConfirmationPage({ params }: Props) {
  const { bookingId } = await params // Next.js 15: must await params
  let booking = null
  try {
    booking = await anchorAPI.getParkingBooking(bookingId)
  } catch {
    // Fallback handled below
  }

  if (!booking) {
    return (
      <main className="min-h-screen bg-anchor-bg flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-5xl">✓</div>
          <h1 className="text-2xl font-bold text-anchor-cream-text">Thank you for your booking</h1>
          <p className="text-anchor-sage text-sm">
            Your booking is being processed. You should receive a confirmation text shortly.
            If you have any questions, call us on{' '}
            <a href="tel:01753682707" className="text-anchor-gold underline">01753 682707</a>.
          </p>
          <Link href="/" className="inline-block mt-4 text-anchor-gold underline text-sm">
            Return to The Anchor
          </Link>
        </div>
      </main>
    )
  }

  const amount = booking.override_price ?? booking.calculated_price ?? 0

  return (
    <main className="min-h-screen bg-anchor-bg">
      {/* Hero */}
      <section className="bg-anchor-green px-4 pt-12 pb-8 text-center">
        <div className="w-14 h-14 bg-anchor-green-light rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Parking confirmed</h1>
        <p className="text-anchor-cream-text text-sm">
          Booking reference: <span className="text-anchor-gold font-bold">{booking.reference}</span>
        </p>
      </section>

      {/* SMS notice */}
      <div className="bg-anchor-bg-raised border-t-2 border-anchor-gold-vivid px-4 py-3 flex items-center gap-3">
        <span className="text-xl">📱</span>
        <p className="text-anchor-gold-vivid text-sm font-medium">Confirmation text sent to your mobile</p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Booking details */}
        <div className="bg-anchor-bg-card rounded-xl overflow-hidden">
          <div className="bg-anchor-bg-raised px-4 py-2.5">
            <h2 className="text-anchor-green-light text-xs font-bold uppercase tracking-wider">Your booking</h2>
          </div>
          <div className="divide-y divide-anchor-bg-raised px-4">
            <div className="flex justify-between items-start py-3">
              <span className="text-anchor-sage text-sm">Drop off</span>
              <span className="text-anchor-cream-text text-sm font-semibold text-right">
                {formatDateTime(booking.start_at)}
              </span>
            </div>
            <div className="flex justify-between items-start py-3">
              <span className="text-anchor-sage text-sm">Pick up</span>
              <span className="text-anchor-cream-text text-sm font-semibold text-right">
                {formatDateTime(booking.end_at)}
              </span>
            </div>
            <div className="flex justify-between items-start py-3">
              <span className="text-anchor-sage text-sm">Vehicle</span>
              <div className="text-right">
                <p className="text-anchor-cream-text text-sm font-semibold">{booking.vehicle_registration}</p>
                {booking.vehicle_make && (
                  <p className="text-anchor-sage text-xs">{booking.vehicle_make}{booking.vehicle_model ? ` ${booking.vehicle_model}` : ''}</p>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-anchor-sage text-sm">Amount paid</span>
              <span className="text-anchor-green-light text-lg font-bold">£{amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Getting here */}
        <div className="bg-anchor-bg-card rounded-xl overflow-hidden">
          <div className="bg-anchor-bg-raised px-4 py-2.5">
            <h2 className="text-anchor-green-light text-xs font-bold uppercase tracking-wider">Getting here</h2>
          </div>
          <div className="divide-y divide-anchor-bg-raised px-4">
            {[
              { icon: '📍', text: 'Horton Road, Stanwell Moor, TW19 6AQ' },
              { icon: '🚕', text: '7 minutes to Terminal 5 by taxi or rideshare' },
              { icon: '🚌', text: 'Bus 442 from outside — direct to T2, T3, T4 & T5' },
              { icon: '🔑', text: 'Keep your keys with you at all times' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-3 py-3">
                <span className="text-base mt-0.5">{icon}</span>
                <p className="text-anchor-sage text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/"
          className="block w-full text-center bg-anchor-green text-white font-semibold py-3.5 rounded-xl hover:bg-anchor-green-dark transition-colors"
        >
          While you&apos;re here — visit the pub
        </Link>
        <p className="text-anchor-sage text-xs text-center">Full menu · Real ales · Family friendly</p>
      </div>
    </main>
  )
}

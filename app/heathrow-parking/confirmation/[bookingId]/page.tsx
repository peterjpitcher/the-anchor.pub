import { Metadata } from 'next'
import Link from 'next/link'
import { anchorAPI } from '@/lib/api'
import type { ParkingBookingDetails } from '@/lib/api/parking'
import { Button, Card, CardBody, Container } from '@/components/ui'
import { Icon } from '@/components/ui/Icon'
import { PhoneLink } from '@/components/PhoneLink'
import { CONTACT } from '@/lib/constants'

// Next.js 15: params is a Promise, must be awaited before use.
interface Props {
  params: Promise<{ bookingId: string }>
}

// Neutral on purpose. The title is set before the booking is read, and this
// address also answers for an unpaid booking and for a reference that does not
// exist, so it must not say "confirmed".
export const metadata: Metadata = {
  title: 'Your parking booking',
  robots: { index: false },
}

// Read on every request. A stored copy of this page would show one customer's
// booking, or yesterday's payment state, to whoever asked next.
export const dynamic = 'force-dynamic'

/**
 * Paid means the management app says so, twice over: the booking is live and
 * the payment is recorded as taken. Anything else, including a status this code
 * has never seen, is not paid.
 */
function isPaidBooking(booking: ParkingBookingDetails | null): booking is ParkingBookingDetails {
  if (!booking) return false
  const live = booking.status === 'confirmed' || booking.status === 'completed'
  return live && booking.payment_status === 'paid'
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
  let booking: ParkingBookingDetails | null = null
  try {
    booking = await anchorAPI.getParkingBooking(bookingId)
  } catch {
    // A reference that does not exist and a lookup that failed are treated the
    // same way below: neither is a paid booking, so neither is confirmed.
  }

  // This page used to thank anyone who opened it. A made-up address got a green
  // tick and "Thank you for your booking", and an unpaid, expired or cancelled
  // booking was shown as "Parking confirmed" with an "Amount paid". It now says
  // confirmed, and names an amount as paid, only for a booking that is paid. One
  // plain message covers every other case, so the page tells a stranger nothing
  // about a reference they have guessed.
  if (!isPaidBooking(booking)) {
    return (
      <main className="min-h-screen bg-canvas flex items-center justify-center px-4 py-section-y">
        <div className="text-center space-y-4 max-w-sm">
          <h1 className="font-display text-h3 text-ink-strong">
            We can&apos;t find a paid booking for that reference
          </h1>
          <p className="text-ink-muted text-sm">
            If you&apos;ve just paid, or you think this is wrong, ring us on{' '}
            <PhoneLink phone={CONTACT.phone} source="parking-confirmation_fallback" className="text-accent-text underline" showIcon={false} />{' '}
            and we&apos;ll check it for you.
          </p>
          <Link href="/heathrow-parking" className="inline-block mt-4 text-accent-text underline text-sm">
            Back to Heathrow parking
          </Link>
        </div>
      </main>
    )
  }

  const amount = booking.override_price ?? booking.calculated_price ?? 0

  const gettingHere = [
    { icon: 'mapPin' as const, text: 'Horton Road, Stanwell Moor, TW19 6AQ' },
    { icon: 'car' as const, text: '7 minutes to Terminal 5 by taxi or rideshare' },
    { icon: 'parking' as const, text: 'Bus 442 from outside, direct to T2, T3, T4 & T5' },
    { icon: 'lock' as const, text: 'Keep your keys with you at all times' },
  ]

  return (
    <main className="min-h-screen bg-canvas py-section-y">
      <Container>
        <div className="max-w-lg mx-auto space-y-6">
          {/* Confirmation header */}
          <div className="text-center space-y-3">
            <div className="w-[72px] h-[72px] bg-anchor-green rounded-full flex items-center justify-center mx-auto">
              <Icon name="check" className="w-9 h-9 text-white" />
            </div>
            <h1 className="font-display text-h2 text-ink-strong">Parking confirmed</h1>
            <p className="text-ink-muted text-sm">
              Booking reference: <span className="text-accent-text font-bold">{booking.reference}</span>
            </p>
          </div>

          {/* Booking details */}
          <Card accent>
            <div className="bg-surface-sunk px-6 py-3">
              <h2 className="text-ink-muted text-xs font-bold uppercase tracking-wider">Your booking</h2>
            </div>
            <CardBody className="px-6 py-0">
              <div className="divide-y divide-line">
                <div className="flex justify-between items-start py-3">
                  <span className="text-ink-muted text-sm">Drop off</span>
                  <span className="text-ink-strong text-sm font-semibold text-right">
                    {formatDateTime(booking.start_at)}
                  </span>
                </div>
                <div className="flex justify-between items-start py-3">
                  <span className="text-ink-muted text-sm">Pick up</span>
                  <span className="text-ink-strong text-sm font-semibold text-right">
                    {formatDateTime(booking.end_at)}
                  </span>
                </div>
                <div className="flex justify-between items-start py-3">
                  <span className="text-ink-muted text-sm">Vehicle</span>
                  <div className="text-right">
                    <p className="text-ink-strong text-sm font-semibold">{booking.vehicle_registration}</p>
                    {booking.vehicle_make && (
                      <p className="text-ink-muted text-xs">{booking.vehicle_make}{booking.vehicle_model ? ` ${booking.vehicle_model}` : ''}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-ink-muted text-sm">Amount paid</span>
                  <span className="text-ink-strong text-lg font-bold">£{amount.toFixed(2)}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Getting here */}
          <Card accent>
            <div className="bg-surface-sunk px-6 py-3">
              <h2 className="text-ink-muted text-xs font-bold uppercase tracking-wider">Getting here</h2>
            </div>
            <CardBody className="px-6 py-0">
              <div className="divide-y divide-line">
                {gettingHere.map(({ icon, text }) => (
                  <div key={text} className="flex items-start gap-3 py-3">
                    <Icon name={icon} className="w-4 h-4 mt-0.5 text-accent-text flex-shrink-0" />
                    <p className="text-ink-muted text-sm">{text}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* CTA */}
          <Button asChild variant="primary" size="lg" fullWidth>
            <Link href="/">
              While you&apos;re here, visit the pub
            </Link>
          </Button>
          <p className="text-ink-muted text-xs text-center">Full menu · Draught beers · Family friendly</p>
        </div>
      </Container>
    </main>
  )
}

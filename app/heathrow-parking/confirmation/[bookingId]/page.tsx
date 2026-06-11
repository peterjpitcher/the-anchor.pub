import { Metadata } from 'next'
import Link from 'next/link'
import { anchorAPI } from '@/lib/api'
import { Button, Card, CardBody, Container } from '@/components/ui'
import { Icon } from '@/components/ui/Icon'
import { PhoneLink } from '@/components/PhoneLink'
import { CONTACT } from '@/lib/constants'

// Next.js 15: params is a Promise, must be awaited before use.
interface Props {
  params: Promise<{ bookingId: string }>
}

export const metadata: Metadata = {
  title: 'Parking Confirmed',
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
      <main className="min-h-screen bg-canvas flex items-center justify-center px-4 py-section-y">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-[72px] h-[72px] bg-anchor-green rounded-full flex items-center justify-center mx-auto">
            <Icon name="check" className="w-9 h-9 text-white" />
          </div>
          <h1 className="font-display text-h3 text-ink-strong">Thank you for your booking</h1>
          <p className="text-ink-muted text-sm">
            Your booking is being processed. You should receive a confirmation text shortly.
            If you have any questions, call us on{' '}
            <PhoneLink phone={CONTACT.phone} source="parking-confirmation_fallback" className="text-accent-text underline" showIcon={false} />.
          </p>
          <Link href="/" className="inline-block mt-4 text-accent-text underline text-sm">
            Return to The Anchor
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
            <p className="inline-flex items-center gap-2 text-accent-text text-sm font-medium">
              <Icon name="message" className="w-4 h-4" />
              Confirmation text sent to your mobile
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
                  <span className="text-anchor-green text-lg font-bold">£{amount.toFixed(2)}</span>
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
          <Link href="/" className="block">
            <Button variant="primary" size="lg" fullWidth>
              While you&apos;re here, visit the pub
            </Button>
          </Link>
          <p className="text-ink-muted text-xs text-center">Full menu · Draught beers · Family friendly</p>
        </div>
      </Container>
    </main>
  )
}

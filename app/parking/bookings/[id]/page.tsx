import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { anchorAPI, formatPrice, ParkingBookingDetails } from '@/lib/api'
import { Container, Button, Badge, Card, CardBody } from '@/components/ui'
import { Icon } from '@/components/ui/Icon'
import { PhoneLink } from '@/components/PhoneLink'
import { CONTACT } from '@/lib/constants'

interface PageProps {
  params: { id: string }
  searchParams: { payment?: string }
}

const formatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'long',
  timeStyle: 'short'
})

function getStatusBadge(booking: ParkingBookingDetails) {
  const status = booking.status
  if (status === 'confirmed' || status === 'completed') {
    return (
      <Badge variant="success" className="gap-1.5">
        <Icon name="check" className="h-4 w-4" />
        Payment confirmed
      </Badge>
    )
  }

  if (status === 'pending_payment') {
    return (
      <Badge variant="sand" className="gap-1.5">
        <Icon name="clock" className="h-4 w-4" />
        Payment pending
      </Badge>
    )
  }

  if (status === 'cancelled') {
    return (
      <Badge variant="outline" className="gap-1.5">
        <Icon name="close" className="h-4 w-4" />
        Booking cancelled
      </Badge>
    )
  }

  return (
    <Badge variant="outline">
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Parking Booking ${params.id}`,
    robots: 'noindex, nofollow'
  }
}

export default async function ParkingBookingStatusPage({ params, searchParams }: PageProps) {
  let booking: ParkingBookingDetails | null = null

  try {
    booking = await anchorAPI.getParkingBooking(params.id)
  } catch (error: any) {
    if (error?.status === 404) {
      notFound()
    }
    throw error
  }

  if (!booking) {
    notFound()
  }

  const paymentMessage = searchParams.payment === 'success'
    ? 'Payment captured successfully. Keep this page handy for your reference.'
    : searchParams.payment === 'failed'
      ? 'PayPal could not confirm your payment. Please try again or call 01753 682707.'
      : null

  return (
    <main className="min-h-screen bg-canvas py-section-y">
      <Container>
        <div className="mx-auto max-w-3xl">
          <Card accent>
            <CardBody className="p-8">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-accent-text">Parking booking reference</p>
                  <h1 className="mt-1 font-display text-h2 text-ink-strong">{booking.reference}</h1>
                  <div className="mt-3">{getStatusBadge(booking)}</div>
                </div>

                {paymentMessage && (
                  <div className={`rounded-md border p-4 text-sm ${searchParams.payment === 'success' ? 'bg-anchor-success/[0.12] border-anchor-success/30 text-anchor-success' : 'bg-anchor-danger/[0.12] border-anchor-danger/30 text-anchor-danger'}`}>
                    {paymentMessage}
                  </div>
                )}

                <div className="grid gap-6 rounded-md border border-line bg-surface-sunk p-6 md:grid-cols-2">
                  <div>
                    <h2 className="text-lg font-semibold text-ink-strong">Stay details</h2>
                    <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                      <li><strong>Arrival:</strong> {formatter.format(new Date(booking.start_at))}</li>
                      <li><strong>Departure:</strong> {formatter.format(new Date(booking.end_at))}</li>
                      <li><strong>Parking duration:</strong> {Math.round((new Date(booking.end_at).getTime() - new Date(booking.start_at).getTime()) / (1000 * 60 * 60))} hours</li>
                      <li><strong>Vehicle:</strong> {booking.vehicle_registration} {booking.vehicle_make && `· ${booking.vehicle_make}`} {booking.vehicle_model && `· ${booking.vehicle_model}`}</li>
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-ink-strong">Contact</h2>
                    <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                      <li><strong>Name:</strong> {booking.customer_first_name} {booking.customer_last_name}</li>
                      <li><strong>Mobile:</strong> {booking.customer_mobile}</li>
                      {booking.customer_email && <li><strong>Email:</strong> {booking.customer_email}</li>}
                      <li><strong>Amount due:</strong> {formatPrice(booking.calculated_price)} {booking.payment_status === 'paid' ? '(paid)' : '(pending)'}</li>
                      <li><strong>Payment deadline:</strong> {formatter.format(new Date(booking.payment_due_at))}</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-md bg-surface-sunk px-6 py-4 text-sm text-ink-muted">
                  <p>
                    Need to adjust flight dates or extend your Heathrow parking stay? Email <a href="mailto:parking@the-anchor.pub" className="font-semibold text-accent-text">parking@the-anchor.pub</a> or call <PhoneLink phone={CONTACT.phone} source="parking-booking_contact" className="font-semibold text-accent-text" showIcon={false} /> with your reference {booking.reference}.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Link href="/heathrow-parking">
                    <Button variant="outline">Back to Heathrow parking page</Button>
                  </Link>
                  {booking.status !== 'confirmed' && booking.status !== 'completed' && (
                    <Link href={`/parking/bookings/${booking.id}`} prefetch={false}>
                      <Button variant="primary">Refresh status</Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </Container>
    </main>
  )
}

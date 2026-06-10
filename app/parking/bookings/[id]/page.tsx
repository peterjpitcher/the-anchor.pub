import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { anchorAPI, formatPrice, ParkingBookingDetails } from '@/lib/api'
import { Section, Container, Button } from '@/components/ui'
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
      <span className="inline-flex items-center gap-2 rounded-full bg-anchor-gold-dark/15 px-3 py-1 text-sm font-semibold text-anchor-gold-bright">
        <Icon name="check" className="h-4 w-4" />
        Payment confirmed
      </span>
    )
  }

  if (status === 'pending_payment') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-anchor-green-raised px-3 py-1 text-sm font-semibold text-anchor-gold-dark">
        <Icon name="clock" className="h-4 w-4" />
        Payment pending
      </span>
    )
  }

  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-anchor-green-raised px-3 py-1 text-sm font-semibold text-anchor-cream-text/55">
        <Icon name="close" className="h-4 w-4" />
        Booking cancelled
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-anchor-green-raised px-3 py-1 text-sm font-semibold text-anchor-cream-text">
      {status.replace(/_/g, ' ')}
    </span>
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
    <Section className="min-h-screen bg-anchor-green-deep py-16">
      <Container>
        <div className="mx-auto max-w-3xl rounded-3xl bg-anchor-green-card p-8 shadow-lg border border-anchor-gold-dark/15">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-anchor-gold-bright">Parking booking reference</p>
              <h1 className="mt-1 text-3xl font-bold text-anchor-cream-text">{booking.reference}</h1>
              <div className="mt-3">{getStatusBadge(booking)}</div>
            </div>

            {paymentMessage && (
              <div className={`rounded-xl border p-4 text-sm ${searchParams.payment === 'success' ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                {paymentMessage}
              </div>
            )}

            <div className="grid gap-6 rounded-2xl border border-anchor-gold-dark/15 bg-anchor-green-raised p-6 md:grid-cols-2">
              <div>
                <h2 className="text-lg font-semibold text-anchor-cream-text">Stay details</h2>
                <ul className="mt-3 space-y-2 text-sm text-anchor-cream-text/70">
                  <li><strong>Arrival:</strong> {formatter.format(new Date(booking.start_at))}</li>
                  <li><strong>Departure:</strong> {formatter.format(new Date(booking.end_at))}</li>
                  <li><strong>Parking duration:</strong> {Math.round((new Date(booking.end_at).getTime() - new Date(booking.start_at).getTime()) / (1000 * 60 * 60))} hours</li>
                  <li><strong>Vehicle:</strong> {booking.vehicle_registration} {booking.vehicle_make && `· ${booking.vehicle_make}`} {booking.vehicle_model && `· ${booking.vehicle_model}`}</li>
                </ul>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-anchor-cream-text">Contact</h2>
	                <ul className="mt-3 space-y-2 text-sm text-anchor-cream-text/70">
	                  <li><strong>Name:</strong> {booking.customer_first_name} {booking.customer_last_name}</li>
	                  <li><strong>Mobile:</strong> {booking.customer_mobile}</li>
	                  {booking.customer_email && <li><strong>Email:</strong> {booking.customer_email}</li>}
	                  <li><strong>Amount due:</strong> {formatPrice(booking.calculated_price)} {booking.payment_status === 'paid' ? '(paid)' : '(pending)'}</li>
	                  <li><strong>Payment deadline:</strong> {formatter.format(new Date(booking.payment_due_at))}</li>
	                </ul>
	              </div>
            </div>

            <div className="rounded-2xl bg-anchor-green-raised px-6 py-4 text-sm text-anchor-cream-text/70">
              <p>
                Need to adjust flight dates or extend your Heathrow parking stay? Email <a href="mailto:parking@the-anchor.pub" className="font-semibold text-anchor-gold-bright">parking@the-anchor.pub</a> or call <PhoneLink phone={CONTACT.phone} source="parking-booking_contact" className="font-semibold text-anchor-gold-bright" showIcon={false} /> with your reference {booking.reference}.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/heathrow-parking">
                <Button variant="secondary">Back to Heathrow parking page</Button>
              </Link>
              {booking.status !== 'confirmed' && booking.status !== 'completed' && (
                <Link href={`/parking/bookings/${booking.id}`} prefetch={false}>
                  <Button variant="primary">Refresh status</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}

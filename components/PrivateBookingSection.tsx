import Link from 'next/link'
import { Container, SectionHeader } from '@/components/ui'
import { PrivateBookingCalculator } from '@/components/PrivateBookingCalculator'

interface PrivateBookingSectionProps {
  id?: string
  title?: string
  subtitle?: string
  eventType?: string
}

export function PrivateBookingSection({
  id = 'enquiry',
  title = 'Instant Quote & Check Availability',
  subtitle = 'Get an immediate cost estimate for your gathering.',
  eventType
}: PrivateBookingSectionProps) {
  return (
    <section id={id} className="border-y py-12 bg-anchor-bg-raised border-anchor-gold/15">
      <Container size="md">
        <SectionHeader title={title} subtitle={subtitle} />
        <p className="text-center text-sm text-anchor-cream-text/60 -mt-4 mb-6">
          Want to see the space first?{' '}
          <Link href="/our-pub" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid hover:underline">
            View photos of our pub &rarr;
          </Link>
        </p>
        <div className="max-w-3xl mx-auto">
          <PrivateBookingCalculator eventType={eventType} />
        </div>
      </Container>
    </section>
  )
}

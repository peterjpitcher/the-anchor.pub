import Link from 'next/link'
import { Container, SectionHeading } from '@/components/ui'
import { StickyEstimatorDrawer } from '@/components/StickyEstimatorDrawer'

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
    <>
      <section id={id} className="border-y py-12 bg-surface-sunk border-line" data-sticky-cta-guard="true">
        <Container size="md">
          <SectionHeading title={title} subtitle={subtitle} />
          <p className="text-center text-sm text-ink-muted -mt-4 mb-6">
            Want to see the space first?{' '}
            <Link href="/our-pub" className="text-accent-text font-semibold hover:text-accent hover:underline">
              View photos of our pub &rarr;
            </Link>
          </p>
          <div className="max-w-md mx-auto text-center">
            <p className="text-ink-muted mb-6">
              Use our cost estimator to build a bespoke quote for your event. Choose your space, guest count, catering, and extras to see a live price breakdown.
            </p>
            <StickyEstimatorDrawer
              eventType={eventType}
              source={`estimator_${id}`}
              showInlineButton
              inlineButtonLabel="Open Cost Estimator"
            />
          </div>
        </Container>
      </section>
    </>
  )
}

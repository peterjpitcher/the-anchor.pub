import { Container, SectionHeading } from '@/components/ui'
import { StickyEstimatorDrawer } from '@/components/StickyEstimatorDrawer'
import { VenueTourLink } from '@/components/private-hire/venue-tour/VenueTourLink'
import {
  isVenueTourEventType,
  type VenueTourSpaceId,
} from '@/components/private-hire/venue-tour/venue-tour-data'

interface PrivateBookingSectionProps {
  id?: string
  title?: string
  subtitle?: string
  eventType?: string
  initialSpaceId?: VenueTourSpaceId
  showVenueTourLink?: boolean
}

export function PrivateBookingSection({
  id = 'enquiry',
  title = 'Instant Quote & Check Availability',
  subtitle = 'Get an immediate cost estimate for your gathering.',
  eventType,
  initialSpaceId,
  showVenueTourLink = true,
}: PrivateBookingSectionProps) {
  return (
    <>
      <section id={id} className="scroll-mt-24 border-y py-12 bg-surface-sunk border-line" data-sticky-cta-guard="true">
        <Container size="md">
          <SectionHeading title={title} subtitle={subtitle} />
          {showVenueTourLink ? (
            <p className="text-center text-sm text-ink-muted -mt-4 mb-6">
              Want to see the space first?{' '}
              <VenueTourLink
                source={`private_booking_${id}`}
                label="Explore the floor plan and photos"
                initialSpaceId={initialSpaceId}
                eventType={isVenueTourEventType(eventType) ? eventType : undefined}
                className="text-accent-text font-semibold hover:text-accent hover:underline"
              >
                Explore the floor plan and photos &rarr;
              </VenueTourLink>
            </p>
          ) : null}
          <div className="max-w-md mx-auto text-center">
            <p className="text-ink-muted mb-6">
              Use our cost estimator to build a bespoke quote for your event. Choose your space, guest count, catering, and extras to see a live price breakdown.
            </p>
            <StickyEstimatorDrawer
              eventType={eventType}
              initialSpaceId={initialSpaceId}
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

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowDown, Phone } from 'lucide-react'
import { InteriorHero } from '@/components/hero'
import { CtaBand } from '@/components/CtaBand'
import { PhoneButton } from '@/components/PhoneButton'
import { Button, Container, SectionHeading } from '@/components/ui'
import {
  InteractiveVenueFloorPlan,
  isVenueTourEventType,
  isVenueTourSpaceId,
  VenueTourEnquiryLink,
} from '@/components/private-hire/venue-tour'
import { CONTACT } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Interactive Private Hire Venue Tour',
  description:
    'Explore The Anchor private hire spaces and photo viewpoints on an interactive floor plan.',
  robots: {
    index: false,
    follow: false,
  },
}

interface VenueTourPageProps {
  searchParams?: {
    space?: string | string[]
    event?: string | string[]
  }
}

export default function VenueTourPage({ searchParams }: VenueTourPageProps) {
  const requestedSpace = Array.isArray(searchParams?.space)
    ? searchParams?.space[0]
    : searchParams?.space
  const initialSpaceId = isVenueTourSpaceId(requestedSpace) ? requestedSpace : undefined
  const requestedEvent = Array.isArray(searchParams?.event)
    ? searchParams?.event[0]
    : searchParams?.event
  const eventType = isVenueTourEventType(requestedEvent) ? requestedEvent : undefined

  return (
    <>
      <InteriorHero
        image="/images/page-headers/private-hire/private-hire.jpg"
        focal="50% 56%"
        crumb="Private Hire Venue Tour"
        kicker="Interactive venue tour"
        title="Find the right space for your event"
        lead="Explore our hire spaces on the floor plan, then open real photos from around the pub."
        actions={
          <Button asChild variant="primary" size="lg">
            <Link href="#venue-map">
              Explore the floor plan
              <ArrowDown className="h-5 w-5" aria-hidden />
            </Link>
          </Button>
        }
      />

      <section id="venue-map" className="scroll-mt-6 bg-canvas py-section-y">
        <Container size="xl">
          <SectionHeading
            kicker="Explore the venue"
            script="Take a look around"
            title="Spaces and views, all in one place"
            lead="Gold numbered markers show private hire spaces. Green camera markers open photos from that part of the pub."
          />

          <InteractiveVenueFloorPlan
            source="standalone_venue_tour"
            initialSpaceId={initialSpaceId}
            eventType={eventType}
          />
        </Container>
      </section>

      <CtaBand
        title="Like what you see?"
        copy="Tell us your date, guest count and plans. Our team will help you choose the best setup."
        primary={
          <Button asChild variant="primary" size="lg">
            <VenueTourEnquiryLink
              source="standalone_venue_tour_cta"
              initialSpaceId={initialSpaceId}
              eventType={eventType}
            >
              Get an event quote
            </VenueTourEnquiryLink>
          </Button>
        }
        secondary={
          <PhoneButton
            phone={CONTACT.phone}
            source="private_hire_venue_tour"
            variant="outline"
            size="lg"
          >
            <Phone className="h-5 w-5" aria-hidden />
            {CONTACT.phone}
          </PhoneButton>
        }
      />
    </>
  )
}

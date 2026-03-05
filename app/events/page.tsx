import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Button, Container, Section } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FilteredUpcomingEvents } from '@/components/FilteredUpcomingEvents'
import { TrustBar } from '@/components/psychology'
import { BookTableButton } from '@/components/BookTableButton'
import { getTwitterMetadata } from '@/lib/twitter-metadata'

export const metadata: Metadata = {
  title: "Events at The Anchor | Stanwell Moor, Near Heathrow",
  description: "See upcoming events at The Anchor in Stanwell Moor — quiz nights, Music Bingo, bingo and more. Free parking on site, 7 minutes from Heathrow Terminal 5.",
  alternates: {
    canonical: '/events',
  },
  openGraph: {
    title: "Events at The Anchor | Stanwell Moor, Near Heathrow",
    description: "Upcoming events at The Anchor: quiz nights, Music Bingo hosted by Nikki Manfadge, cash bingo and one-off nights.",
    images: ["/images/events/quiz-night/the-anchor-quiz-night-stanwell-moor.jpg"],
  },
  twitter: getTwitterMetadata({
    title: "Events at The Anchor | Stanwell Moor, Near Heathrow",
    description: "Upcoming events at The Anchor: quiz nights, Music Bingo hosted by Nikki Manfadge, cash bingo and one-off nights.",
    images: ["/images/events/quiz-night/the-anchor-quiz-night-stanwell-moor.jpg"],
  }),
}

export default function EventsPage() {
  return (
    <>
      <HeroWrapper
        route="/events"
        title="Events at The Anchor"
        description="Quiz nights, Music Bingo, cash bingo and special one-off events. Check the listings and book your spot."
        tags={[
          { label: '🎤 Music Bingo', variant: 'primary' },
          { label: '🧠 Quiz Night', variant: 'warning' },
          { label: '🎱 Cash Bingo', variant: 'default' },
        ]}
        primaryCta={
          <BookTableButton
            source="events_hero"
            variant="primary"
            size="lg"
            fullWidth
            className="w-full sm:w-auto"
          >
            Reserve a Table
          </BookTableButton>
        }
        secondaryCta={
          <Link href="/whats-on" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" fullWidth className="sm:w-auto">
              Full What&apos;s On Guide
            </Button>
          </Link>
        }
      />

      <TrustBar variant="events" />

      <div className="mx-auto max-w-3xl px-4 py-4 text-center">
        <p className="text-gray-600 text-base">Join your neighbours for a proper night out</p>
      </div>

      <Section id="upcoming-events" background="white" spacing="md">
        <Container>
          <div className="max-w-5xl mx-auto">
            <Suspense fallback={<div className="text-center py-8">Loading events...</div>}>
              <FilteredUpcomingEvents />
            </Suspense>
          </div>
        </Container>
      </Section>
    </>
  )
}

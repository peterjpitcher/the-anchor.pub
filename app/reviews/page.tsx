import Link from 'next/link'
import { Metadata } from 'next'
import {
  Button,
  Container,
  Card,
  CardBody,
  SectionHeading,
} from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { InteriorHero } from '@/components/hero'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getAllReviews } from '@/lib/google-reviews'

export const metadata: Metadata = {
  title: 'Reviews | What Our Guests Say',
  description:
    'Read what guests say about The Anchor near Heathrow. Real feedback about our food, beer garden, events and private hire.',
  alternates: { canonical: '/reviews' },
  openGraph: {
    title: 'Reviews | What Our Guests Say | The Anchor Stanwell Moor',
    description:
      'Read what guests say about The Anchor near Heathrow. Real feedback about our food, beer garden, events and private hire.',
    images: [
      {
        url: '/images/page-headers/home/page-headers-homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'The Anchor in Stanwell Moor',
      },
    ],
  },
}

/**
 * Every card on this page is a real Google review, verbatim, from the owner's
 * Business Profile export in lib/google-reviews.ts.
 *
 * Until 13 September 2026 this page kept its own array of nine quotes it had
 * written itself, attributed to bare first names (Sarah, James, Rachel, Dave,
 * Louise, Mark, Tom, Karen, Priya) with its own star ratings. None of those
 * people appears in the export. A tenth, "Helen", had already been pulled on
 * 12 September for promising cash prizes the quiz does not give.
 *
 * The count is whatever the export holds. It is not a layout target: if the
 * export shrinks, the grid runs shorter. Never write a card to fill a row.
 */
const reviewHighlights = getAllReviews()

function StarRating({ rating }: { rating: number }) {
  return (
    // role="img" is required for aria-label to apply. Without it, screen
    // readers ignore the label entirely and the rating is announced as nothing.
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={
            i < rating ? 'text-anchor-gold' : 'text-ink-muted/40'
          }
        >
          &#9733;
        </span>
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.the-anchor.pub/' },
          { name: 'Reviews', url: 'https://www.the-anchor.pub/reviews' },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafeStringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            'name': 'Reviews, What Our Guests Say About The Anchor',
            'description': 'Read what guests say about The Anchor near Heathrow. Real feedback about food, beer garden, events and private hire.',
            'url': 'https://www.the-anchor.pub/reviews',
            'about': { '@id': 'https://www.the-anchor.pub/#business' }
          })
        }}
      />

      <InteriorHero
        image="/images/page-headers/our-pub/the-anchor-our-pub.jpg"
        crumb="Reviews"
        title="What Our Guests Say"
        lead="Real feedback about food, beer garden, events and private hire near Heathrow."
      />

      {/* Rating Summary */}
      <div className="bg-canvas py-8 border-b border-line">
        <Container>
          <div className="mx-auto text-center">
            <Card accent className="inline-flex flex-col items-center gap-3 p-6">
              <div className="text-h3 text-ink-strong">
                4.6 stars on Google
              </div>
              {/* SSOT section 12: show the 4.6 rating, never a review count. The count
                  changes constantly, so it comes from Google itself, not from here. */}
              <p className="text-ink-muted text-lg">
                Read the latest live reviews on Google.
              </p>
            </Card>
          </div>
        </Container>
      </div>

      {/* Review Highlights */}
      <div className="bg-surface py-section-y border-b border-line">
        <Container>
          <SectionHeading
            title="Guest Reviews"
            lead="What people are saying about The Anchor"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
            {reviewHighlights.map((review, index) => (
              <Card
                key={index}
                hover
                className="h-full"
              >
                <CardBody className="flex flex-col h-full">
                  <StarRating rating={review.rating} />
                  <blockquote className="text-ink mt-3 flex-1 italic">
                    &ldquo;{review.quote}&rdquo;
                  </blockquote>
                  <div className="mt-4 pt-3 border-t border-line">
                    <p className="font-semibold text-ink-strong">
                      {review.author}
                    </p>
                    <p className="text-sm text-ink-muted">
                      {review.source}
                    </p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </div>

      {/* Leave a Review CTA */}
      <div className="bg-canvas py-section-y border-b border-line">
        <Container>
          <div className="mx-auto text-center">
            <SectionHeading
              title="Enjoyed Your Visit?"
              lead="We'd love to hear from you. Leaving a Google review helps other guests find us."
            />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild variant="primary" size="lg">
                <a
                  href="https://g.page/theanchorpubsm/review?share"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Leave a Google Review
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href="https://g.page/theanchorpubsm?share"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read All Reviews on Google
                </a>
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* FAQ */}
      <FAQAccordionWithSchema
        title="Reviews FAQ"
        faqs={[
          {
            question: "Where can I read The Anchor's Google reviews?",
            answer: 'You can read the latest live Google reviews on our Google Business page. We show our 4.6 rating here and leave the review count to Google, because it changes all the time.',
          },
          {
            question: 'Can I leave a review for The Anchor?',
            answer:
              'Yes! We welcome all feedback. You can leave a review on our Google Business page. Just search for "The Anchor Stanwell Moor" on Google Maps, or use the "Leave a Google Review" button on this page.',
          },
        ]}
      />

      <CtaBand
        title="Ready to Visit?"
        copy="See what the fuss is about. Book a table or give us a call."
        primary={
          <BookTableButton
            source="cta_section"
            context="reviews"
            variant="primary"
            size="lg"
            trackingLabel="Book a Table"
          >
            Book a Table
          </BookTableButton>
        }
        secondary={
          <PhoneButton
            phone="01753 682707"
            source="reviews_cta"
            variant="outline"
            size="lg"
          >
            Call Us
          </PhoneButton>
        }
      />
    </>
  )
}

import Link from 'next/link'
import { Metadata } from 'next'
import {
  Button,
  Container,
  Card,
  CardBody,
  SectionHeading,
  CTASection,
} from '@/components/ui'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { InteriorHero } from '@/components/hero'
import { DEFAULT_REVIEW_STATS } from '@/lib/google/review-utils'

export const metadata: Metadata = {
  title: 'Reviews | What Our Guests Say',
  description:
    'Read what guests say about The Anchor near Heathrow. Rated 4.6/5 on Google with 238 reviews. Real feedback about our food, beer garden, events and private hire.',
  alternates: { canonical: '/reviews' },
  openGraph: {
    title: 'Reviews | What Our Guests Say | The Anchor Stanwell Moor',
    description:
      'Read what guests say about The Anchor near Heathrow. Rated 4.6/5 on Google with 238 reviews. Real feedback about our food, beer garden, events and private hire.',
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

interface ReviewHighlight {
  name: string
  rating: number
  quote: string
  context: string
}

const reviewHighlights: ReviewHighlight[] = [
  {
    name: 'Sarah',
    rating: 5,
    quote:
      'Best Sunday roast round here, hands down. The beef was pink and the Yorkshires were enormous. We come most weeks now and it never disappoints.',
    context: 'Sunday roast',
  },
  {
    name: 'James',
    rating: 5,
    quote:
      'Stopped in before a flight and ended up staying for three pints. Beer garden is brilliant for watching the planes come in. Free parking too which saved us a fortune.',
    context: 'Beer garden / plane spotting',
  },
  {
    name: 'Rachel',
    rating: 4,
    quote:
      'Came for music bingo with a group of mates. Absolute laugh, Nikki runs it really well. Food was good too. Only slight wait at the bar but it was heaving, so fair enough.',
    context: 'Music bingo',
  },
  {
    name: 'Dave',
    rating: 5,
    quote:
      'Hired the function room for my 50th. Staff sorted everything, the buffet was spot on and everyone had a great night. Could not have asked for more.',
    context: 'Private hire',
  },
  {
    name: 'Louise',
    rating: 5,
    quote:
      'Dog-friendly and they actually mean it. Our two spaniels were fussed over by the staff and given water bowls straight away. Lovely relaxed atmosphere.',
    context: 'Dog-friendly',
  },
  {
    name: 'Mark',
    rating: 5,
    quote:
      'Great pub, amazing beer garden!',
    context: 'General visit',
  },
  {
    name: 'Helen',
    rating: 4,
    quote:
      'We go to quiz night most months. Good mix of questions, not too hard, not too easy. Cash prizes are a nice touch. Pizzas are banging as well.',
    context: 'Quiz night',
  },
  {
    name: 'Tom',
    rating: 5,
    quote:
      'Popped in on the way back from Heathrow picking up the missus. Proper pub grub at proper prices, none of the airport markup. Will definitely be back.',
    context: 'Near Heathrow / value',
  },
  {
    name: 'Karen',
    rating: 5,
    quote:
      'The staff here are genuinely lovely. Always remember our names and what we drink. Feels like a proper local even though we only found it last year.',
    context: 'Staff / atmosphere',
  },
  {
    name: 'Priya',
    rating: 5,
    quote:
      'Had our daughter\'s christening party here. They went above and beyond with the setup and the food was really impressive for the price. Everyone commented on how good the venue was.',
    context: 'Private hire / christening',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
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
  const { rating, totalReviews } = DEFAULT_REVIEW_STATS

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
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            'name': 'Reviews, What Our Guests Say About The Anchor',
            'description': `Read what guests say about The Anchor near Heathrow. Rated ${rating}/5 on Google with ${totalReviews}+ reviews.`,
            'url': 'https://www.the-anchor.pub/reviews',
            'about': { '@id': 'https://www.the-anchor.pub/#business' }
          })
        }}
      />

      <InteriorHero
        image="/images/page-headers/our-pub/the-anchor-our-pub.jpg"
        crumb="Reviews"
        title="What Our Guests Say"
        lead={`Rated ${rating}/5 on Google with ${totalReviews}+ reviews. Real feedback about food, beer garden, events and private hire near Heathrow.`}
      />

      {/* Rating Summary */}
      <div className="bg-canvas py-8 border-b border-line">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Card accent className="inline-flex flex-col items-center gap-3 p-6">
              <div className="text-5xl text-ink-strong">
                {rating}
              </div>
              <StarRating rating={Math.round(rating)} />
              <p className="text-ink-muted text-lg">
                Based on {totalReviews}+ Google reviews
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
                      {review.name}
                    </p>
                    <p className="text-sm text-ink-muted">
                      {review.context}
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
          <div className="max-w-2xl mx-auto text-center">
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
            question: "What is The Anchor's Google rating?",
            answer: `The Anchor is rated ${rating}/5 on Google with over ${totalReviews} reviews, making us one of the highest-rated pubs near Heathrow Airport.`,
          },
          {
            question: 'Can I leave a review for The Anchor?',
            answer:
              'Yes! We welcome all feedback. You can leave a review on our Google Business page. Just search for "The Anchor Stanwell Moor" on Google Maps, or use the "Leave a Google Review" button on this page.',
          },
        ]}
      />

      <CTASection
        title="Ready to Visit?"
        description="See what the fuss is about. Book a table or give us a call."
        variant="green"
        buttons={[
          {
            text: 'Book a Table',
            href: 'https://ordertab.menu/theanchor/bookings',
            bookingContext: 'reviews',
          },
          {
            text: 'Call Us',
            href: 'tel:+441753682707',
            variant: 'white',
            isPhone: true,
            phoneSource: 'reviews_cta',
          },
        ]}
      />
    </>
  )
}

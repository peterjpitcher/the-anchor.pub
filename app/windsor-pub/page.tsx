import Link from 'next/link'
import { Button, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING, DRIVE_TIMES, PRICE_RANGE, DIRECTIONS_URL } from '@/lib/constants'
import { PARKING_WORDING, ULEZ_WORDING, DOGS_WORDING } from '@/lib/approved-wording'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
  title: 'Pubs in Windsor | Free Parking Alternative',
  description: `Pubs near Windsor? ${BRAND.name} is a short drive from Windsor with free parking, Sunday roasts and stone-baked pizzas. Outside the ULEZ zone.`,
  openGraph: {
    title: 'Pubs in Windsor, The Anchor, Stanwell Moor',
    description: 'A highly rated pub near Windsor, a short drive away with free parking, Sunday roast, stone-baked pizzas and countryside atmosphere.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pubs in Windsor, The Anchor, Stanwell Moor',
    description: 'A highly rated pub near Windsor, a short drive away with free parking, Sunday roast, stone-baked pizzas and countryside atmosphere.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/windsor-pub'
  }
}

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "BarOrPub"],
  "@id": "https://www.the-anchor.pub/windsor-pub#business",
  "name": `${BRAND.name} - Near Windsor`,
  "image": `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": CONTACT.address.street,
    "addressLocality": CONTACT.address.town,
    "addressRegion": "Surrey",
    "postalCode": CONTACT.address.postcode,
    "addressCountry": "GB"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": CONTACT.coordinates.lat,
    "longitude": CONTACT.coordinates.lng
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Windsor"
    },
    {
      "@type": "City",
      "name": "Old Windsor"
    },
    {
      "@type": "City",
      "name": "Datchet"
    },
    {
      "@type": "City",
      "name": "Eton"
    }
  ],
  "priceRange": PRICE_RANGE,
  "servesCuisine": ["British", "Traditional English", "Sunday Roast"],
  "telephone": CONTACT.phoneIntl,
  "url": "https://www.the-anchor.pub/windsor-pub"
}

export default function WindsorPubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([localBusinessSchema]) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Pub Near Windsor', url: '/windsor-pub' }
        ]}
      />

      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/windsor-pub/find-us.jpg"
        crumb="Windsor"
        title="Traditional British Pub Near Windsor"
        lead="A short drive from Windsor with free parking"
        actions={
          <BookTableButton source="windsor_pub_hero"
          context="local_pub" variant="primary" size="lg" fullWidth>
          Book a Table
        </BookTableButton>
        }
      />

      {/* Page Title */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto text-center">
            <PageTitle
              seo={{
                structured: true,
                speakable: true
              }}
              className="mb-4"
            >
              Pubs in Windsor, Traditional British Pub Near Windsor
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Searching for pubs in Windsor? Your local traditional pub is a short drive from Windsor with free parking
            </p>
          </div>
        </Container>
      </section>

      {/* Welcome Section */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto text-center">
            <SectionHeading
              title="Windsor's Favourite Traditional Pub Experience"
              lead="A short drive from Windsor, The Anchor is a proper village pub. Enjoy traditional pub atmosphere, fantastic food, and a warm welcome in our historic Stanwell Moor location."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: "Near Windsor", description: "A short drive from Windsor" },
                { title: "Fair Village Prices", description: "Our prices are on the live menu" },
                { title: "Outside the ULEZ", description: ULEZ_WORDING },
              ].map((item) => (
                <Card key={item.title} accent>
                  <CardBody className="p-6 text-center">
                    <h3 className="font-display text-h4 text-ink-strong mb-2">{item.title}</h3>
                    <p className="text-sm text-ink-muted">{item.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Why Windsor Residents Choose Us */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Why Windsor Residents Love The Anchor"
            />

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display text-h3 text-ink-strong mb-4">Worth the Journey</h3>
                <ul className="space-y-3 text-ink">
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>A change of scene</strong> - Peaceful village pub atmosphere</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>Fair village prices</strong> - See the <Link href="/food-menu" className="underline">live menu</Link></div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>{PARKING.capacity} free spaces</strong> - Right outside</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>Real locals pub</strong> - Where Windsor residents go for a proper pint</div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-display text-h3 text-ink-strong mb-4">Food and Events</h3>
                <ul className="space-y-3 text-ink">
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>Stone-baked pizzas</strong> - Hand-stretched bases with generous toppings</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>Famous Sunday Roasts</strong> - Walk in 1pm-6pm or book ahead. Groups of 15+ pay a £10 per person deposit.</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>Music Bingo</strong> - Hosted by Nikki Manfadge. <Link href="/whats-on" className="underline">See what&apos;s on</Link> for dates.</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div><strong>Quiz Nights</strong> - £3 entry, great prizes, monthly events</div>
                  </li>
                </ul>
              </div>
            </div>

            <Card accent className="mt-8 text-center">
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-2">A Village Local</h3>
                <p className="text-lg text-ink-muted">
                  A proper village pub, a short drive from Windsor.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Popular with Windsor Groups */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="For Windsor Groups"
            />

            <div className="mx-auto max-w-xl mb-8">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Perfect For</h3>
                  <ul className="space-y-2 text-ink-muted">
                    <li>• Pre-race meals (Windsor Racecourse)</li>
                    <li>• Post-castle visit dinners</li>
                    <li>• Birthday celebrations</li>
                    <li>• Christmas parties</li>
                    <li>• Retirement gatherings</li>
                  </ul>
                </CardBody>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-lg text-ink-muted mb-6">
                Private hire for Windsor groups, for {PRIVATE_HIRE_CAPACITY.recommendedRange}
              </p>
              <Button asChild variant="primary" size="lg" wrap>
                <Link href="/private-hire#enquiry">
                  Enquire About Group Bookings
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Getting Here from Windsor */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Getting to The Anchor from Windsor"
            />

            <div className="text-center">
              <p className="text-lg text-ink-muted mb-4">
                We&apos;re on {CONTACT.address.street}, {CONTACT.address.town}. Set your sat nav to {CONTACT.address.postcode}.
              </p>
              <p className="text-lg text-ink-muted mb-6">{PARKING_WORDING}</p>
              <DirectionsButton
                href={DIRECTIONS_URL}
                source="windsor_directions"
                variant="outline"
                size="md"
              >
                Get directions
              </DirectionsButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Windsor Connection */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto text-center">
            <SectionHeading
              title="Windsor to The Anchor - Why We're Worth the Trip"
            />

            <div className="grid md:grid-cols-3 gap-5 mb-8">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">A Proper Village Pub</h3>
                  <ul className="space-y-2 text-ink-muted text-sm">
                    <li>• A village pub since 1751</li>
                    <li>• Fair village prices</li>
                    <li>• Real community feel</li>
                    <li>• Where everyone&apos;s welcome</li>
                  </ul>
                </CardBody>
              </Card>

              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Easy Access</h3>
                  <ul className="space-y-2 text-ink-muted text-sm">
                    <li>• A short drive from Windsor</li>
                    <li>• {PARKING.capacity} free spaces</li>
                    <li>• {DRIVE_TIMES.m25Junction14} mins from M25 Junction 14</li>
                    <li>• Avoid town traffic</li>
                  </ul>
                </CardBody>
              </Card>

              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Unique Features</h3>
                  <ul className="space-y-2 text-ink-muted text-sm">
                    <li>• Plane spotting garden</li>
                    <li>• Monthly entertainment</li>
                    <li>• Dogs welcome throughout, on a lead</li>
                    <li>• Traditional games</li>
                  </ul>
                </CardBody>
              </Card>
            </div>

            <p className="text-lg text-ink-muted">
              Come over from Windsor and you&apos;ll be treated like a local.
            </p>
          </div>
        </Container>
      </section>

      {/* Local Knowledge Section */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="A Local&rsquo;s Guide: Windsor to The Anchor"
            />
            <div className="prose max-w-none space-y-4 text-ink-muted">
              <p>
                Looking for pubs near Windsor? Sometimes you want somewhere that feels like <em>yours</em>. We&rsquo;re a short drive away, with {PARKING.capacity} free spaces right outside the door.
              </p>
              <p>
                Spent the morning on the Long Walk or around Virginia Water? Come over for a proper pub lunch. And if you&rsquo;ve just done the theatre or a Windsor Racecourse meeting, we&rsquo;re a good stop on the way home.
              </p>
              <p>
                The beer garden is the clincher for most people. Sit outside with a pint and watch the planes coming into Heathrow overhead, it&rsquo;s a genuinely good free show. {DOGS_WORDING} So if you&rsquo;ve brought the spaniel along for that Great Park walk, they&rsquo;re sorted too.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto text-center">
            <SectionHeading
              title="Opening Hours"
            />
            <BusinessHours/>
            <p className="mt-4 text-ink-muted">
              Kitchen closes earlier - check times for food service
            </p>
          </div>
        </Container>
      </section>

      <OrganicSearchClusterLinks
        cluster="localPub"
        currentPath="/windsor-pub"
        title="More local guides"
        intro="More on the food, the pub and how to find us."
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "How far is The Anchor from Windsor Castle?",
            answer: `The Anchor is a short drive from Windsor. We're on ${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.postcode}.`
          },
          {
            question: "Why come to The Anchor from Windsor?",
            answer: `For a proper village pub with fair village prices, Sunday roasts and stone-baked pizzas, and a beer garden under the Heathrow flight path. ${PARKING_WORDING} ${ULEZ_WORDING}`
          },
          {
            question: "Is there parking at The Anchor for Windsor visitors?",
            answer: `Yes. ${PARKING_WORDING}`
          },
          {
            question: "How do I find The Anchor from Windsor?",
            answer: `Set your sat nav to ${CONTACT.address.postcode}, or use the Get directions link on this page.`
          },
          {
            question: "Is The Anchor handy for Windsor and Eton?",
            answer: "Yes. We're a short drive from Windsor, Old Windsor, Datchet and Eton, and parking's free when you get here."
          },
          {
            question: "Can you accommodate large Windsor groups?",
            answer: `Yes. We host birthdays, work events and celebrations, with private hire for ${PRIVATE_HIRE_CAPACITY.recommendedRange}.`
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="Discover Windsor's Favourite Local"
        copy="A short drive from the castle, with free parking right outside"
      >
        <Button asChild variant="primary" size="lg">
          <Link href={CONTACT.phoneHref}>Book a Table</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/private-hire#enquiry">Book an Event</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/drinks">See the Drinks Menu</Link>
        </Button>
      </CtaBand>
    </>
  )
}

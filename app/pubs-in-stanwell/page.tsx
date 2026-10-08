import Link from 'next/link'
import { Metadata } from 'next'
import { Button, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { CtaBand } from '@/components/CtaBand'
import { DirectionsButton } from '@/components/DirectionsButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { GoogleReviews } from '@/components/reviews'
import { DEFAULT_PAGE_HEADER_IMAGE, DEFAULT_FOOD_IMAGE } from '@/lib/image-fallbacks'
import { getBusinessHours } from '@/lib/api'
import { generateOpeningHoursSpecification } from '@/lib/schema-utils'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { ACCESS_AMENITY_FEATURES, PARKING_WORDING, SPORT_WORDING } from '@/lib/approved-wording'
import { BRAND, CONTACT, HEATHROW_TIMES, PARKING, DRIVE_TIMES, PRICE_RANGE, DIRECTIONS_URL } from '@/lib/constants'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'

export const metadata: Metadata = {
  title: 'Pubs in Stanwell Moor | Village Pub & Beer Garden',
  description: 'The heart of Stanwell Moor village since 1751. Beer garden, free parking, home-cooked food and quiz nights. Your proper local in TW19.',
  openGraph: {
    title: 'Pubs in Stanwell Moor | Village Pub & Beer Garden | The Anchor',
    description: 'Stanwell Moor\'s village pub since 1751. Beer garden, free parking, great food, quiz nights and hosted events.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
  },
  twitter: getTwitterMetadata({
    title: 'Pubs in Stanwell Moor | Village Pub & Beer Garden | The Anchor',
    description: 'Stanwell Moor\'s village pub since 1751. Beer garden, free parking, great food, quiz nights and hosted events.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/pubs-in-stanwell'
  }
}

export default async function PubsInStanwellPage() {
  const businessHours = await getBusinessHours()
  const openingHoursSpecification = generateOpeningHoursSpecification(businessHours)
  const localPubSchema = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    "@id": "https://www.the-anchor.pub/pubs-in-stanwell",
    "name": BRAND.name,
    "description": "Family-friendly local pub serving Stanwell Moor and Stanwell since 1751. Traditional British pub with great food, beer garden, and free parking.",
    "url": "https://www.the-anchor.pub",
    "image": [
      `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
      'https://www.the-anchor.pub/images/garden/beer-garden/the-anchor-beer-garden-heathrow-flight-path.jpg',
      `https://www.the-anchor.pub${DEFAULT_FOOD_IMAGE}`
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CONTACT.address.street,
      "addressLocality": CONTACT.address.town,
      "addressRegion": CONTACT.address.county,
      "postalCode": CONTACT.address.postcode,
      "addressCountry": CONTACT.address.country
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": CONTACT.coordinates.lat,
      "longitude": CONTACT.coordinates.lng
    },
    "telephone": CONTACT.phoneIntl,
    "priceRange": PRICE_RANGE,
    "servesCuisine": ["British", "Pub Food"],
    "hasMenu": "https://www.the-anchor.pub/food-menu",
    "acceptsReservations": true,
    "publicAccess": true,
    "smokingAllowed": false,
    ...(openingHoursSpecification.length ? { "openingHoursSpecification": openingHoursSpecification } : {}),
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Free Parking", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Beer Garden", "value": true },
      ...ACCESS_AMENITY_FEATURES,
      { "@type": "LocationFeatureSpecification", "name": "Family Friendly", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Dog Friendly", "value": true }
    ]
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(localPubSchema) }}
      />

      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Pubs in Stanwell"
        title="Stanwell Moor's Village Pub & Beer Garden"
        lead="The heart of Stanwell Moor village, traditional British pub since 1751"
      />

      {/* Page Title for SEO */}
      <section className="py-section-y bg-canvas">
        <Container>
          <PageTitle
            className="text-center"
            seo={{ structured: true, speakable: true }}
          >
            Pubs in Stanwell Moor - The Anchor Village Pub &amp; Beer Garden
          </PageTitle>
        </Container>
      </section>

      {/* Why We're Stanwell's Favourite Local */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Why The Anchor is Stanwell Moor's Favourite Village Pub"
              lead="A proper local at the heart of Stanwell Moor"
            />

            <div className="grid md:grid-cols-2 gap-5 mb-12">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">A True Village Pub</h3>
                  <div className="space-y-3">
                    <p className="text-ink-muted">
                      Located on Horton Road in the heart of Stanwell Moor, we've been
                      the village's gathering place since 1751, standing here long before
                      Heathrow existed. Unlike chain pubs, we're independently run with
                      genuine local character.
                    </p>
                    <ul className="space-y-2 text-ink-muted">
                      <li>Independently run</li>
                      <li>Know our regulars by name</li>
                      <li>Support local events and causes</li>
                      <li>Traditional pub atmosphere</li>
                      <li>Community hub since 1751</li>
                    </ul>
                  </div>
                </CardBody>
              </Card>

              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">What Makes Us Special</h3>
                  <div className="space-y-3">
                    <p className="text-ink-muted">
                      We're not just another pub - we're your local. From our famous
                      Sunday roasts to stone-baked pizzas, all made properly
                      in a warm, welcoming environment.
                    </p>
                    <ul className="space-y-2 text-ink-muted">
                      <li>Home-cooked British food</li>
                      <li>Draught beers and chilled lagers</li>
                      <li>Large beer garden</li>
                      <li>Quiz nights and hosted events</li>
                      <li>Free parking</li>
                    </ul>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Location Benefits */}
            <Card accent className="mx-auto">
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-2">Perfectly Located in Stanwell Moor</h3>
                <p className="text-ink-muted mb-3">
                  Easily accessible from all surrounding areas:
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-ink-muted">
                  <ul className="space-y-1 text-sm">
                    <li>• Staines: {DRIVE_TIMES.staines} mins</li>
                    <li>• Heathrow T5: {HEATHROW_TIMES.terminal5} mins</li>
                  </ul>
                  <ul className="space-y-1 text-sm">
                    <li>• M25 Junction 14: {DRIVE_TIMES.m25Junction14} mins</li>
                    <li>• Stanwell Village: a short drive</li>
                  </ul>
                  <ul className="space-y-1 text-sm">
                    <li>• Outside the ULEZ zone</li>
                    <li>• {PARKING.capacity} free parking spaces</li>
                  </ul>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* What We Offer */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Everything You Want from Your Local Pub"
              lead="Great food, drinks, atmosphere and more"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: "Great Drinks Selection", description: "Draught lagers, bottled ales, wines, spirits and soft drinks" },
                { title: "Home-Cooked Food", description: "Traditional British pub food cooked fresh" },
                { title: "Beautiful Beer Garden", description: "Spacious outdoor area perfect for sunny days" },
                { title: "Quiz Nights & Events", description: "Music Bingo with Nikki Manfadge, quiz nights and one-off events" },
                { title: "Family Friendly", description: "Children welcome with kids menu available" },
                { title: "Sports Coverage", description: "Major sporting events on our screens" },
                { title: "Private Functions", description: "Host your special occasions with us" },
                { title: "Free Parking", description: `${PARKING.capacity} free spaces right outside` },
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

      {/* Compare to Other Pubs */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="How We Compare to Other Local Pubs"
              lead="Why locals choose The Anchor"
            />

            <Card accent>
              <CardBody className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-display text-h4 text-ink-strong mb-4">The Anchor Advantages</h3>
                    <ul className="space-y-3 text-ink">
                      <li className="flex items-start gap-2">
                        <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                        <div><strong>Free Parking:</strong> {PARKING.capacity} free spaces</div>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                        <div><strong>Kitchen Hours:</strong> Kitchen times vary by date, so check our <Link href="/find-us" className="underline">Find Us page</Link> before you come</div>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                        <div><strong>Outdoor Space:</strong> Large beer garden</div>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                        <div><strong>Value:</strong> Proper pub prices, not tourist rates</div>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg viewBox="0 0 20 20" aria-hidden="true" className="text-accent-text mt-0.5 h-5 w-5 flex-none fill-current"><path d="M7.6 14.7 3.5 10.6l1.4-1.4 2.7 2.7 7-7 1.4 1.4z" /></svg>
                        <div><strong>Entertainment:</strong> Regular quiz nights and hosted events</div>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-display text-h4 text-ink-strong mb-4">Nearby Alternatives</h3>
                    <div className="space-y-4 text-ink-muted">
                      <div>
                        <p className="font-semibold text-ink">The George (Stanwell)</p>
                        <p className="text-sm">Good pub but limited parking</p>
                      </div>
                      <div>
                        <p className="font-semibold text-ink">The Bells (Staines)</p>
                        <p className="text-sm">Town centre location, paid parking</p>
                      </div>
                      <div>
                        <p className="font-semibold text-ink">Airport Pubs</p>
                        <p className="text-sm">Convenient but 3x the price</p>
                      </div>
                      <div className="pt-3 border-t border-line">
                        <p className="font-bold text-ink">
                          The Anchor brings together location,
                          parking, food, and atmosphere
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Food and events through the week. Only what docs/SSOT.md fixes to a
          day is named: Monday (kitchen closed) and Sunday (roast). Event nights
          come from the What's On page, never a typed weekly slot. */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Food and Events"
              lead="What to expect through the week"
            />

            <div className="grid gap-4">
              <Card accent>
                <CardBody className="p-4">
                  <h3 className="font-display text-h4 text-ink-strong">Monday</h3>
                  <p className="text-ink-muted">Drinks only. The kitchen is closed.</p>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-4">
                  <h3 className="font-display text-h4 text-ink-strong">Tuesday to Saturday</h3>
                  <p className="text-ink-muted">
                    The full menu, stone-baked pizzas included. Kitchen times vary, so check our{' '}
                    <Link href="/find-us" className="underline">Find Us page</Link> for this week&apos;s hours.
                  </p>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-4">
                  <h3 className="font-display text-h4 text-ink-strong">Sunday</h3>
                  <p className="text-ink-muted">Sunday roasts, 1pm to 6pm. Walk-ins welcome.</p>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-4">
                  <h3 className="font-display text-h4 text-ink-strong">Events</h3>
                  <p className="text-ink-muted">
                    Quiz nights, Music Bingo and one-off events.{' '}
                    <Link href="/whats-on" className="underline">See what&apos;s on</Link> for dates.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Local Knowledge Section */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="A Local&rsquo;s Guide to Stanwell Moor"
            />
            <div className="prose max-w-none space-y-4 text-ink-muted">
              <p>
                Stanwell Moor is one of those villages that people drive through without realising what&rsquo;s here. Tucked between the M25 and the King George VI Reservoir, it&rsquo;s a proper little community with more going on than you&rsquo;d think. The village sits on Horton Road, which connects Stanwell to Horton and Wraysbury to the west, and The Anchor sits right at the heart of it, the village&rsquo;s gathering place since 1751.
              </p>
              <p>
                The area around Stanwell Moor is surprisingly green for somewhere so close to Heathrow. The reservoir walks are a local favourite, the path around the King George VI and Staines reservoirs gives you miles of flat, easy walking with big skies and good birdwatching. St Mary&rsquo;s Church in nearby Stanwell village dates back to the 12th century and is worth a look if you&rsquo;re interested in local history.
              </p>
              <p>
                What makes Stanwell Moor different from Stanwell village is the feel. Stanwell proper is bigger and more suburban, with its own high street and shops. Stanwell Moor has kept its village character, smaller, quieter, and with a stronger sense of community. Everyone knows everyone, and The Anchor is where those connections happen. Whether it&rsquo;s the midweek pizza crowd, the quiz night regulars, or the Sunday roast families, the pub is where the village comes together.
              </p>
              <p>
                We&rsquo;re proud to be the heart of this community. From charity fundraisers to Christmas parties, from welcoming new residents to hosting retirement dos for people who&rsquo;ve been coming here for years, this is what a village pub is supposed to be. If you&rsquo;re in Stanwell or Stanwell Moor and haven&rsquo;t been in yet, you&rsquo;re missing out on your own local.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Customer Reviews */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="What Our Guests Say"
            />
            <GoogleReviews
              layout="grid"
              showTitle={false}
            />
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "What makes The Anchor worth a visit in Stanwell Moor?",
            answer: "We're the only traditional pub in Stanwell Moor village, serving our community since 1751. We offer free parking, a large beer garden, home-cooked food, regular quiz nights and hosted events, and a genuine local atmosphere."
          },
          {
            question: "Do you have parking at the pub?",
            answer: PARKING_WORDING
          },
          {
            question: "Are families welcome at The Anchor?",
            answer: "Absolutely! We're a family-friendly pub with a children's menu available. Kids are welcome throughout the pub and in our beer garden. We provide a relaxed atmosphere where families can enjoy meals together."
          },
          {
            question: "What food do you serve?",
            answer: "We serve traditional British pub food including our famous Sunday roasts, fish & chips, stone-baked pizzas, burgers, pies, and vegetarian options. Kitchen hours vary by day, and the kitchen is closed on Mondays. Our Find Us page shows this week's times."
          },
          {
            question: "How far is The Anchor from Stanwell village?",
            answer: `We're a short drive from Stanwell village centre, at ${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.postcode}. We're also only ${DRIVE_TIMES.staines} minutes from Staines, ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5, and ${DRIVE_TIMES.m25Junction14} minutes from M25 Junction 14.`
          },
          {
            question: "Do you show sports at the pub?",
            answer: SPORT_WORDING
          },
          {
            question: "Can I book The Anchor for a private event?",
            answer: `Yes. The dining room, the garden or the whole pub can be hired by the hour, for ${PRIVATE_HIRE_CAPACITY.recommendedRange}. Prices and menus are on the private hire page, or call us on ${CONTACT.phone}.`
          }
        ]}
        className="bg-surface"
      />

      {/* CTA Section */}
      <CtaBand
        title="Visit Your Local Pub Today"
        copy="Great food, free parking, and a warm welcome await"
      >
        <Button asChild variant="primary" size="lg">
          <Link href="/book-table">Book a Table</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/private-hire#enquiry">Book an Event</Link>
        </Button>
        <DirectionsButton href={DIRECTIONS_URL} source="pubs_in_stanwell_directions" variant="outline" size="lg">
          Get Directions
        </DirectionsButton>
      </CtaBand>
    </>
  )
}

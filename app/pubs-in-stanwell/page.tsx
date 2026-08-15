import Link from 'next/link'
import { Metadata } from 'next'
import { Button, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { GoogleReviews } from '@/components/reviews'
import { DEFAULT_PAGE_HEADER_IMAGE, DEFAULT_FOOD_IMAGE } from '@/lib/image-fallbacks'
import { getBusinessHours } from '@/lib/api'
import { generateOpeningHoursSpecification } from '@/lib/schema-utils'

export const metadata: Metadata = {
  title: 'Pubs in Stanwell Moor | Village Pub & Beer Garden',
  description: 'The Anchor has been the heart of Stanwell Moor village since 1751. Traditional pub with beer garden, free parking, great food, quiz nights and hosted events. Your proper local in TW19.',
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
    "name": "The Anchor - Traditional Pub in Stanwell Moor",
    "description": "Family-friendly local pub serving Stanwell Moor and Stanwell since 1751. Traditional British pub with great food, beer garden, and free parking.",
    "url": "https://www.the-anchor.pub",
    "image": [
      `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
      'https://www.the-anchor.pub/images/garden/beer-garden/the-anchor-beer-garden-heathrow-flight-path.jpg',
      `https://www.the-anchor.pub${DEFAULT_FOOD_IMAGE}`
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Horton Road",
      "addressLocality": "Stanwell Moor",
      "addressRegion": "Surrey",
      "postalCode": "TW19 6AQ",
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 51.4592,
      "longitude": -0.5147
    },
    "telephone": "+441753682707",
    "priceRange": "££",
    "servesCuisine": ["British", "Pub Food"],
    "hasMenu": "https://www.the-anchor.pub/food-menu",
    "acceptsReservations": true,
    "publicAccess": true,
    "smokingAllowed": false,
    ...(openingHoursSpecification.length ? { "openingHoursSpecification": openingHoursSpecification } : {}),
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Free Parking", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Beer Garden", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Step-free access to most areas", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Family Friendly", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Dog Friendly (Garden)", "value": true }
    ]
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localPubSchema) }}
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
                      <li>Family-owned and operated</li>
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
                      <li>Free parking always</li>
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
                    <li>• Stanwell Village: 5 mins</li>
                    <li>• Staines: 8 mins</li>
                    <li>• Ashford: 10 mins</li>
                  </ul>
                  <ul className="space-y-1 text-sm">
                    <li>• Heathrow T5: 7 mins</li>
                    <li>• Feltham: 10 mins</li>
                    <li>• Sunbury: 12 mins</li>
                  </ul>
                  <ul className="space-y-1 text-sm">
                    <li>• M25 Junction 14: 2 mins</li>
                    <li>• Outside ULEZ zone</li>
                    <li>• 20 free parking spaces</li>
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
                { title: "Home-Cooked Food", description: "Traditional British pub food cooked fresh daily" },
                { title: "Beautiful Beer Garden", description: "Spacious outdoor area perfect for sunny days" },
                { title: "Quiz Nights & Hosted Events", description: "Music Bingo with Nikki Manfadge, quizzes, and special events (see /whats-on)" },
                { title: "Family Friendly", description: "Children welcome with kids menu available" },
                { title: "Sports Coverage", description: "Major sporting events on our screens" },
                { title: "Private Functions", description: "Host your special occasions with us" },
                { title: "Free Parking", description: "20 spaces - no parking stress" },
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
                        <span className="text-accent-text mt-1">✓</span>
                        <div><strong>Free Parking:</strong> 20 spaces always available</div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent-text mt-1">✓</span>
                        <div><strong>Kitchen Hours:</strong> Food served lunch & dinner most days</div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent-text mt-1">✓</span>
                        <div><strong>Outdoor Space:</strong> Large beer garden with covered area</div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent-text mt-1">✓</span>
                        <div><strong>Value:</strong> Proper pub prices, not tourist rates</div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent-text mt-1">✓</span>
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
                          The Anchor offers the best combination of location,
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

      {/* Weekly Schedule */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Something Special Every Day"
              lead="Our weekly lineup of food and events"
            />

            <div className="grid gap-4">
              {[
                { day: "Monday", text: "Bar open all day • Kitchen closed • Perfect for drinks" },
                { day: "Tuesday - Pizza Night", text: "Stone-baked pizzas • Kitchen 6pm-9pm" },
                { day: "Wednesday-Thursday", text: "Full menu available • Kitchen 6pm-9pm" },
                { day: "Friday - Fish & Chips", text: "Fish & chips served • Kitchen 6pm-9pm" },
                { day: "Saturday - Entertainment Night", text: "Hosted nights & one-off events • See /whats-on for details" },
                { day: "Sunday - Roast Day", text: "Traditional Sunday roast • Kitchen 1pm-6pm" },
              ].map((row) => (
                <Card key={row.day} accent>
                  <CardBody className="p-4">
                    <h3 className="font-display text-h4 text-ink-strong">{row.day}</h3>
                    <p className="text-ink-muted">{row.text}</p>
                  </CardBody>
                </Card>
              ))}
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
                The area around Stanwell Moor is surprisingly green for somewhere so close to Heathrow. The reservoir walks are a local favourite, the path around the King George VI and Staines reservoirs gives you miles of flat, easy walking with big skies and good birdwatching. The Stanwell Moor nature reserve, just off Horton Road, is a quiet spot that most visitors to the area never discover. St Mary&rsquo;s Church in nearby Stanwell village dates back to the 12th century and is worth a look if you&rsquo;re interested in local history.
              </p>
              <p>
                What makes Stanwell Moor different from Stanwell village is the feel. Stanwell proper is bigger and more suburban, with its own high street and shops. Stanwell Moor has kept its village character, smaller, quieter, and with a stronger sense of community. Everyone knows everyone, and The Anchor is where those connections happen. Whether it&rsquo;s the Tuesday night pizza crowd, the quiz night regulars, or the Sunday roast families, the pub is where the village comes together.
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
              title="What Stanwell Locals Say About Us"
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
            question: "What makes The Anchor the best pub in Stanwell Moor?",
            answer: "We're the only traditional pub in Stanwell Moor village, serving our community since 1751. We offer free parking, a large beer garden, home-cooked food, regular quiz nights and hosted events, and a genuine local atmosphere. Our combination of location, facilities, and friendly service makes us the preferred choice for locals."
          },
          {
            question: "Do you have parking at the pub?",
            answer: "Yes! We have 20 free parking spaces, which is rare for pubs in this area. You'll never have to worry about parking meters or finding a space. This is especially valuable compared to Staines town centre pubs where parking can cost £3-5."
          },
          {
            question: "Are families welcome at The Anchor?",
            answer: "Absolutely! We're a family-friendly pub with a children's menu available. Kids are welcome throughout the pub and in our beer garden. We provide a relaxed atmosphere where families can enjoy meals together."
          },
          {
            question: "What food do you serve?",
            answer: "We serve traditional British pub food including our famous Sunday roasts, fish & chips, stone-baked pizzas, burgers, pies, and vegetarian options. Kitchen hours vary by day - closed Mondays, dinner service Tuesday-Friday, lunch and dinner on weekends."
          },
          {
            question: "How far is The Anchor from Stanwell village?",
            answer: "We're just 5 minutes from Stanwell village centre, located on Horton Road in Stanwell Moor. We're also only 8 minutes from Staines, 7 minutes from Heathrow Terminal 5, and 2 minutes from M25 Junction 14."
          },
          {
            question: "Do you show sports at the pub?",
            answer: "Yes, we show major sporting events that air on BBC, ITV, Channel 4, and Channel 5. We're a great place to enjoy the big free-to-air football, rugby, and tournament fixtures with fellow fans in a proper pub atmosphere."
          },
          {
            question: "Can I book The Anchor for a private event?",
            answer: "Yes! We offer flexible private hire for parties, celebrations, wakes, and corporate events. Our spaces suit 10+ to 150 guests, with larger events by enquiry and various catering options. Contact us on 01753 682707 to discuss your requirements."
          }
        ]}
        className="bg-surface"
      />

      {/* CTA Section */}
      <CtaBand
        title="Visit Your Local Pub Today"
        copy="Great food, free parking, and a warm welcome await"
      >
        <Link href="/book-table">
          <Button variant="primary" size="lg">Book a Table</Button>
        </Link>
        <Link href="/private-hire#enquiry">
          <Button variant="outline" size="lg">Book an Event</Button>
        </Link>
        <Link href="https://maps.google.com/?q=The+Anchor+Stanwell+Moor">
          <Button variant="outline" size="lg">Get Directions</Button>
        </Link>
      </CtaBand>
    </>
  )
}

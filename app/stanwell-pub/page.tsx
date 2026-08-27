import Link from 'next/link'
import { Button, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { DirectionsButton } from '@/components/DirectionsButton'
import { generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CONTACT, BRAND, PARKING } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { SUNDAY_ROAST, getSundayRoastContent } from '@/lib/sunday-roast'
import { getSundayLunchMenuPageData, type MenuPageItem } from '@/lib/menu-page-data'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { HeroBadge } from '@/components/HeroBadge'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { jsonLdSafeStringify } from '@/lib/jsonld'

function formatMenuItemPrice(item: MenuPageItem): string {
  const price = item.price.trim()
  if (!price) return ''
  return ` - ${price.startsWith('£') ? price : `£${price}`}`
}

export function generateMetadata(): Metadata {
  const sunday = getSundayRoastContent()
  const sundayPhrase = sunday.isLive
    ? `Sunday roasts ${SUNDAY_ROAST.fromPriceLabel}`
    : `Sunday roast starts ${SUNDAY_ROAST.launchDateLabel}`

  return {
    title: 'Stanwell Moor Pub',
    description: `Your local in Stanwell Moor, near Staines and Heathrow. ${sundayPhrase}, stone-baked pizzas, a dog-friendly beer garden and free parking.`,
    openGraph: {
      title: 'Stanwell Moor Pub, Beer Garden, Food and Free Parking',
      description: `${sundayPhrase}, stone-baked pizzas and a dog-friendly beer garden at The Anchor, Stanwell Moor.`,
      images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
      type: 'website',
    },
    twitter: getTwitterMetadata({
      title: 'Stanwell Moor Pub, Beer Garden, Food and Free Parking',
      description: `${sundayPhrase}, stone-baked pizzas and a dog-friendly beer garden at The Anchor, Stanwell Moor.`,
      images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
      canonical: '/stanwell-pub'
    }
  }
}

export default async function StanwellPubPage() {
  const sunday = getSundayRoastContent()
  const sundayMenu = await getSundayLunchMenuPageData()
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "BarOrPub"],
    "@id": "https://www.the-anchor.pub/stanwell-pub#business",
    "name": `${BRAND.name} - Stanwell Village Pub`,
    "image": `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CONTACT.address.street,
      "addressLocality": "Stanwell Moor, Stanwell",
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
        "name": "Stanwell"
      },
      {
        "@type": "Place",
        "name": "Stanwell Moor"
      }
    ],
    "priceRange": "££",
    "servesCuisine": ["British", "Traditional English", "Sunday Roast"],
    "telephone": CONTACT.phoneIntl,
    "url": "https://www.the-anchor.pub/stanwell-pub"
  }
  const directionsSchema = generateHowToDirectionsSchema(
    'Stanwell Village',
    'The Anchor - Heathrow Pub & Dining',
    [
      'From Stanwell Village, head north on Oaks Road',
      'Turn left onto Stanwell Moor Road',
      'Continue for about 0.5 miles',
      'Turn right onto Horton Road',
      'The Anchor will be on your right with free parking'
    ]
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([localBusinessSchema, directionsSchema]) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.the-anchor.pub' },
          { name: 'Stanwell Pub', url: 'https://www.the-anchor.pub/stanwell-pub' }
        ]}
      />

      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/stanwell-pub/find-us.jpg"
        crumb="Stanwell"
        title="Stanwell's Traditional Village Pub"
        lead="The heart of the Stanwell community since generations"
        actions={
          <BookTableButton source="stanwell_pub_hero"
          context="local_pub" variant="primary" size="lg" fullWidth>
          Book a Table
        </BookTableButton>
        }
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <HeroBadge className="text-sm" />
        </Container>
      </section>

      {/* Page Title */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto text-center">
            <PageTitle
              seo={{
                structured: true,
                speakable: true
              }}
              className="mb-4"
            >
              Your Local Pub in Stanwell Moor and Stanwell
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Your local village pub serving the Stanwell community for generations
            </p>
          </div>
        </Container>
      </section>

      {/* Welcome Section */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto text-center">
            <SectionHeading
              title="Welcome to Your Local Stanwell Pub"
              lead="Located in the heart of Stanwell Moor, The Anchor has been serving the Stanwell community for generations. We're more than just a pub - we're where neighbours become friends and visitors become regulars."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: "Village Heart", description: "The social hub of Stanwell Moor, where locals gather daily" },
                { title: "Traditional Values", description: "Proper British pub with draught beers and honest food" },
                { title: "Family Friendly", description: "Children and dogs always welcome in our community pub" },
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

      {/* Why Stanwell Residents Choose Us */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Why Stanwell Residents Choose The Anchor"
            />

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display text-h3 text-ink-strong mb-4">Your Nearest Traditional Pub</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div className="text-ink-muted">
                      <strong className="text-ink">Walking distance from Stanwell Village</strong> - Just a pleasant stroll through Stanwell Moor
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div className="text-ink-muted">
                      <strong className="text-ink">Free parking for 20 cars</strong> - Never worry about parking charges
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div className="text-ink-muted">
                      <strong className="text-ink">Dog-friendly throughout</strong> - Bring your four-legged friends
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div className="text-ink-muted">
                      <strong className="text-ink">Large beer garden</strong> - Perfect for Stanwell's sunny days
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-display text-h3 text-ink-strong mb-4">Community Events & Activities</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div className="text-ink-muted">
                      <strong className="text-ink">Monthly Quiz Nights</strong> - Test your knowledge with fellow Stanwell residents
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div className="text-ink-muted">
                      <strong className="text-ink">Hosted Nights</strong> - Music Bingo with Nikki Manfadge and one-off events (see /whats-on)
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div className="text-ink-muted">
                      <strong className="text-ink">Pool & Darts</strong> - Join our local leagues or play casually
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-text text-xl">•</span>
                    <div className="text-ink-muted">
                      <strong className="text-ink">Stone-baked pizzas</strong> - Stanwell's favourite midweek treat
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <Card accent className="mt-8 text-center">
              <CardBody className="p-6">
                <p className="text-lg text-ink-muted">
                  <span className="font-bold text-ink">Outside ULEZ Zone</span> - Perfect for visitors from
                  London without the £12.50 daily charge
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Local Favourites */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Stanwell's Favourite Pub Food"
            />

            <div className="grid md:grid-cols-2 gap-5 mb-8">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Famous Sunday Roasts</h3>
                  <p className="text-ink-muted mb-3">
                    The talk of Stanwell! {sunday.isLive ? 'Traditional Sunday roasts served 1pm-6pm, walk in or book ahead, no pre-order needed.' : `Traditional Sunday roasts start ${SUNDAY_ROAST.launchDateLabel}.`}
                  </p>
                  {sundayMenu.mains.length > 0 ? (
                    <ul className="space-y-2 text-ink-muted">
                      {sundayMenu.mains.map((item) => (
                        <li key={item.id || item.name}>• {item.name}{formatMenuItemPrice(item)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-ink-muted">
                      Current Sunday roast dishes and prices are listed on the Sunday roast page.
                    </p>
                  )}
                  <p className="mt-3 text-sm text-accent-text">Book ahead for peak slots - walk-ins are welcome.</p>
                </CardBody>
              </Card>

              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Weekday Favourites</h3>
                  <p className="text-ink-muted mb-3">Classic British pub fare loved by Stanwell residents</p>
                  <ul className="space-y-2 text-ink-muted">
                    <li>• Fish & Chips Fridays</li>
                    <li>• Beef & Ale Pie</li>
                    <li>• Chicken Katsu Curry</li>
                    <li>• Stone-baked Pizzas</li>
                  </ul>
                  <div className="mt-3 text-sm text-accent-text"><BusinessHours showKitchen={true} /></div>
                </CardBody>
              </Card>
            </div>

            <div className="text-center">
              <Link href="/food-menu">
                <Button variant="primary" size="lg">
                  View Full Menu
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Location & Directions */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Getting to The Anchor from Stanwell"
            />

            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">From Stanwell Village</h3>
                  <ol className="space-y-3">
                    <li className="flex gap-3"><span className="font-bold text-accent-text">1.</span><span className="text-ink-muted">Head north on Oaks Road from the village centre</span></li>
                    <li className="flex gap-3"><span className="font-bold text-accent-text">2.</span><span className="text-ink-muted">Turn left onto Stanwell Moor Road</span></li>
                    <li className="flex gap-3"><span className="font-bold text-accent-text">3.</span><span className="text-ink-muted">Continue for about half a mile</span></li>
                    <li className="flex gap-3"><span className="font-bold text-accent-text">4.</span><span className="text-ink-muted">Turn right onto Horton Road</span></li>
                    <li className="flex gap-3"><span className="font-bold text-accent-text">5.</span><span className="text-ink-muted">The Anchor is on your right with free parking</span></li>
                  </ol>
                  <p className="mt-4 text-sm text-ink-muted">
                    <strong className="text-ink">Journey time:</strong> 5 minutes by car, 20 minutes walking
                  </p>
                </CardBody>
              </Card>

              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Public Transport</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-ink mb-2">Bus Route 442</p>
                      <p className="text-ink-muted">Stops directly outside The Anchor. Connects Stanwell, Stanwell Moor, and Heathrow.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink mb-2">Walking from Stanwell</p>
                      <p className="text-ink-muted">Pleasant 20-minute walk through residential areas. Popular route for dog walkers!</p>
                    </div>
                    <div className="pt-4 border-t border-line">
                      <p className="font-semibold text-accent-text">Eco-Friendly Route</p>
                      <p className="text-ink-muted">Outside ULEZ zone - no charges for any vehicles</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <DirectionsButton
                href="https://maps.google.com/maps?daddr=The+Anchor+Stanwell+Moor+TW19+6AQ"
                source="stanwell_directions"
                variant="outline"
                size="md"
              >
                Get Directions
              </DirectionsButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Stanwell Community */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto text-center">
            <SectionHeading
              title="Part of the Stanwell Community"
            />

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="text-left">
                <h3 className="font-display text-h4 text-ink-strong mb-4">Local Connections</h3>
                <ul className="space-y-3 text-ink-muted">
                  <li>• Regular meetup spot for Stanwell clubs</li>
                  <li>• Supporters of local charities</li>
                  <li>• Venue for Stanwell celebrations</li>
                  <li>• Home to local darts and pool teams</li>
                  <li>• Dog walkers' favourite refreshment stop</li>
                </ul>
              </div>

              <div className="text-left">
                <h3 className="font-display text-h4 text-ink-strong mb-4">Near Stanwell Landmarks</h3>
                <ul className="space-y-3 text-ink-muted">
                  <li>• 5 minutes from Stanwell Village</li>
                  <li>• 10 minutes from King George VI Reservoir</li>
                  {/* SSOT §2 distance table: Staines is 8 minutes. This said 15,
                      contradicting /staines-pub and both private-hire pages. */}
                  <li>• 8 minutes from Staines-upon-Thames</li>
                  <li>• 7 minutes from Heathrow Terminal 5</li>
                  <li>• Next to St Mary's Church, Stanwell Moor</li>
                </ul>
              </div>
            </div>

            <p className="text-lg text-ink-muted">
              Whether you're a lifelong Stanwell resident or new to the area,
              The Anchor welcomes you with warm hospitality and cold pints!
            </p>
          </div>
        </Container>
      </section>

      {/* Stanwell Heritage & Walking */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading
              title="Stanwell Heritage & the Village Local"
              className="text-center mb-8"
            />
            <div className="prose max-w-none text-ink-muted space-y-4">
              <p>
                Stanwell village and Stanwell Moor are neighbouring communities separated by a few fields and a
                pleasant stretch of Stanwell Moor Road. The Anchor sits on the Moor side, at the end of Horton Road,
                where the village meets open countryside and the reservoirs. It is a fifteen-to-twenty-minute walk
                from Stanwell village centre, a route many of our regulars take on summer evenings, often with
                a dog or two in tow.
              </p>
              <p>
                The area has deep roots. St Mary the Virgin in Stanwell dates back to the twelfth century, and
                the village has been a settled community since before the Domesday Book. The Anchor, established in
                1751, is part of that heritage, a proper local that has served generations of Stanwell families.
                We have hosted christenings, wakes, birthday parties, and retirement dos for people who grew up
                on these streets, and their children after them.
              </p>
              <p>
                For those who enjoy a walk before their pint, the Staines Reservoirs and the King George VI
                Reservoir are right on our doorstep. Birdwatchers, joggers, and weekend walkers regularly finish
                their circuit at The Anchor for a well-earned Sunday roast or a midweek pizza. The beer garden
                catches the afternoon sun and offers uninterrupted views of the Heathrow flight path, it is the
                natural pit-stop after a lap of the reservoir, and far more rewarding than heading back to the car
                park empty-handed.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto text-center">
            <SectionHeading
              title="Stanwell Pub Opening Hours"
            />
            <BusinessHours/>
          </div>
        </Container>
      </section>

      <OrganicSearchClusterLinks
        cluster="localPub"
        currentPath="/stanwell-pub"
        title="More local pub routes near Stanwell Moor"
        intro="Compare nearby local pub pages for Heathrow, Staines, Stanwell Moor and directions to The Anchor."
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "How far is The Anchor from Stanwell Village?",
            answer: "The Anchor is approximately 1.2 miles from Stanwell Village centre, about a 5-minute drive or a pleasant 20-minute walk. We're located in Stanwell Moor, which is part of greater Stanwell."
          },
          {
            question: "Is The Anchor the closest pub to Stanwell?",
            answer: "Yes! The Anchor is the nearest traditional British pub to Stanwell Village. We're just a short journey away in Stanwell Moor, with free parking and a warm welcome for all Stanwell residents."
          },
          {
            question: "Do you host events for Stanwell community groups?",
            answer: "Absolutely! We regularly host Stanwell community groups, clubs, and private events. Our spaces can accommodate from small meetings to large celebrations. Contact us to discuss your requirements."
          },
          {
            question: "What's the best way to get to The Anchor from Stanwell without a car?",
            answer: "The 442 bus runs from Stanwell to our doorstep, or it's a pleasant 20-minute walk through Stanwell Moor. Many Stanwell residents enjoy the walk, especially with their dogs who are welcome in our pub!"
          },
          {
            question: "Do Stanwell residents get any special offers?",
            answer: "All our regular offers are available to everyone! This includes our famous Sunday roasts and stone-baked pizzas. We're Stanwell's local, so all locals are treated like family!"
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="Visit Stanwell's Favourite Local Pub"
        copy="Join your neighbours at The Anchor - where Stanwell comes together"
      >
        <Link href="/book-table">
          <Button variant="primary" size="lg">Book a Table</Button>
        </Link>
        <Link href={CONTACT.phoneHref}>
          <Button variant="outline" size="lg">Call Us</Button>
        </Link>
        <Link href="/private-hire#enquiry">
          <Button variant="outline" size="lg">Book an Event</Button>
        </Link>
        <Link href="/whats-on">
          <Button variant="outline" size="lg">What's On</Button>
        </Link>
      </CtaBand>

      <InternalLinkingSection
        title="More about The Anchor, Stanwell Moor"
        links={[
          { href: '/blog/cosy-pub-stanwell', title: 'A Cosy Pub in Stanwell Moor', description: 'What makes The Anchor a proper local' },
          { href: '/sunday-roast', title: 'Sunday Roast', description: 'Traditional roast dinners, walk-ins welcome' },
          { href: '/near-heathrow', title: 'Near Heathrow', description: 'Close to all Heathrow terminals' },
        ]}
      />
    </>
  )
}

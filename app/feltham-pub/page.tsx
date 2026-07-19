import Link from 'next/link'
import { Button, Card, CardBody, SectionHeading, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { SUNDAY_ROAST, getSundayRoastContent } from '@/lib/sunday-roast'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { HeroBadge } from '@/components/HeroBadge'

export function generateMetadata(): Metadata {
  const sunday = getSundayRoastContent()
  const sundayPhrase = sunday.isLive
    ? `Sunday roasts ${SUNDAY_ROAST.fromPriceLabel}`
    : `Sunday roast starts ${SUNDAY_ROAST.launchDateLabel}`

  return {
    title: 'Pub Near Feltham | Free Parking & Sunday Roasts',
    description: `Looking for pubs near Feltham? The Anchor is just 10 minutes away with free parking, ${sundayPhrase}, stone-baked pizzas and quiz nights in a relaxed village pub.`,
    openGraph: {
      title: 'Pub Near Feltham | Free Parking & Sunday Roasts | The Anchor',
      description: `Pubs near Feltham, just 10 minutes away with free parking, ${sundayPhrase}, stone-baked pizzas and quiz nights.`,
      images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    },
    twitter: getTwitterMetadata({
      title: 'Pub Near Feltham | Free Parking & Sunday Roasts | The Anchor',
      description: `Pubs near Feltham, just 10 minutes away with free parking, ${sundayPhrase}, stone-baked pizzas and quiz nights.`,
      images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
      canonical: '/feltham-pub'
    }
  }
}

export default function FelthamPubPage() {
  const sunday = getSundayRoastContent()
  const directionsSchema = generateHowToDirectionsSchema(
    "Feltham Town Centre",
    "The Anchor",
    [
      "From Feltham High Street, head south on Bedfont Lane",
      "Continue for 1.5 miles through Bedfont",
      "At the roundabout, take the 2nd exit onto Staines Road",
      "After 0.8 miles, turn right onto Horton Road",
      "Continue for 0.5 miles",
      "The Anchor is on your left with free parking"
    ]
  )

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    "name": "The Anchor - Feltham's Local Pub",
    "description": "Traditional British pub serving Feltham residents with great food, drinks, and entertainment.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Horton Road",
      "addressLocality": "Stanwell Moor",
      "addressRegion": "Surrey",
      "postalCode": "TW19 6AQ",
      "addressCountry": "GB"
    },
    "areaServed": {
      "@type": "City",
      "name": "Feltham",
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": "London Borough of Hounslow"
      }
    },
    "telephone": "+441753682707",
    "url": "https://www.the-anchor.pub/feltham-pub"
  }


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, directionsSchema]) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Pub Near Feltham', url: '/feltham-pub' }
        ]}
      />

      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/feltham-pub/find-us.jpg"
        crumb="Feltham"
        title="Your Local Pub Near Feltham"
        lead="Just 10 minutes away with free parking"
        actions={
          <BookTableButton source="feltham_pub_hero"
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
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle
              seo={{
                structured: true,
                speakable: true
              }}
              className="mb-4"
            >
              Pub Near Feltham, Traditional British Pub with Free Parking
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Your local traditional pub just 10 minutes from Feltham with free parking
            </p>
          </div>
        </Container>
      </section>

      {/* Distance & Benefits */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Feltham's Favourite Village Escape"
              lead="Escape the hustle of Feltham High Street for a proper traditional pub experience"
              className="text-center mb-12"
            />

            {/* Key Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {[
                { title: "Quick Drive", description: "Just 10 minutes from Feltham via Bedfont Lane" },
                { title: "Peaceful Setting", description: "Village atmosphere away from busy Feltham traffic" },
                { title: "Plane Spotting", description: "Unique beer garden under the Heathrow flight path" },
              ].map((item) => (
                <Card key={item.title} accent>
                  <CardBody className="p-6 text-center">
                    <h3 className="font-display text-h4 text-ink-strong mb-2">{item.title}</h3>
                    <p className="text-sm text-ink-muted">{item.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Why Choose Us */}
            <Card accent>
              <CardBody className="p-8">
                <h3 className="font-display text-h3 text-ink-strong mb-6">
                  Why Feltham Residents Choose The Anchor
                </h3>
                <ul className="space-y-4 text-ink">
                  <li className="flex items-start">
                    <span className="text-accent-text font-bold mr-3">✓</span>
                    <span>Free parking - no time limits or charges</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-text font-bold mr-3">✓</span>
                    <span>Traditional pub atmosphere you won't find in chain venues</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-text font-bold mr-3">✓</span>
                    <span>Celebrated Sunday roasts {sunday.isLive ? 'served 1pm-6pm, walk in or book ahead, no pre-order needed.' : `start ${SUNDAY_ROAST.launchDateLabel}.`}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-text font-bold mr-3">✓</span>
                    <span>Regular entertainment including Music Bingo hosted by Nikki Manfadge, quiz nights and one-off events (see /whats-on)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-text font-bold mr-3">✓</span>
                    <span>Perfect for Feltham work colleagues' gatherings</span>
                  </li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Directions */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="How to Find Us from Feltham"
            />

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display text-h4 text-ink-strong mb-4">Driving Directions</h3>
                <ol className="space-y-3 text-ink">
                  <li className="flex"><span className="text-accent-text font-bold mr-3">1.</span>From Feltham High Street, head south on Bedfont Lane</li>
                  <li className="flex"><span className="text-accent-text font-bold mr-3">2.</span>Continue for 1.5 miles through Bedfont</li>
                  <li className="flex"><span className="text-accent-text font-bold mr-3">3.</span>At the roundabout, take the 2nd exit onto Staines Road</li>
                  <li className="flex"><span className="text-accent-text font-bold mr-3">4.</span>After 0.8 miles, turn right onto Horton Road</li>
                  <li className="flex"><span className="text-accent-text font-bold mr-3">5.</span>Continue for 0.5 miles</li>
                  <li className="flex"><span className="text-accent-text font-bold mr-3">6.</span>The Anchor is on your left - ample free parking available</li>
                </ol>
              </div>

              <div>
                <h3 className="font-display text-h4 text-ink-strong mb-4">Local Landmarks</h3>
                <div className="space-y-4 text-ink-muted">
                  <div>
                    <p className="font-semibold text-ink">From Feltham Station:</p>
                    <p>10-minute drive via Bedfont Lane, or take the 117 bus towards Staines.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Near Bedfont Lakes:</p>
                    <p>We're just 5 minutes from Bedfont Lakes Business Park - perfect for after-work drinks.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">From The Centre Feltham:</p>
                    <p>Head south on Bedfont Lane, follow signs for Staines/Stanwell.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Special Offers for Feltham */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Perfect for Feltham Groups"
            />
            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Work Gatherings</h3>
                  <p className="mb-3 text-ink-muted">Popular with teams from Feltham's business parks. Private areas available for corporate events.</p>
                  <ul className="space-y-2 text-ink">
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Buffet menus from current catering packages</li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Reserved areas available</li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Free parking for all guests</li>
                  </ul>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-3">Weekend Escapes</h3>
                  <p className="mb-3 text-ink-muted">Join Feltham locals who make The Anchor their weekend destination.</p>
                  <ul className="space-y-2 text-ink">
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Hosted nights like Music Bingo with Nikki Manfadge (see /whats-on)</li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Sunday roasts {sunday.isLive ? 'served 1pm-6pm, walk in or book ahead, no pre-order needed.' : `start ${SUNDAY_ROAST.launchDateLabel}.`}</li>
                    <li className="flex items-start"><span className="text-accent-text mr-2">•</span>Quiz nights & bingo</li>
                  </ul>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Event Venue for Feltham */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeading
              title="Private Events for Feltham Residents"
              lead="The perfect venue just 10 minutes from Feltham"
            />

            <div className="grid md:grid-cols-2 gap-5 mb-8">
              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Why Feltham Chooses Us</h3>
                  <ul className="space-y-3 text-ink">
                    <li className="flex items-start gap-3">
                      <span className="text-accent-text font-bold">✓</span>
                      <span><strong>Quick 10-minute drive</strong> - Closer than central London venues</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-text font-bold">✓</span>
                      <span><strong>Free parking for all guests</strong> - Save on town centre fees</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-text font-bold">✓</span>
                      <span><strong>Affordable pricing</strong> - Better value than Feltham High Street</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-text font-bold">✓</span>
                      <span><strong>Trusted by locals</strong> - Regular venue for Feltham groups</span>
                    </li>
                  </ul>
                </CardBody>
              </Card>

              <Card accent>
                <CardBody className="p-6">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Popular Feltham Events</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-ink mb-1">Birthday Parties</h4>
                      <p className="text-sm text-ink-muted">From kids parties to 50th celebrations</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink mb-1">Baby Showers</h4>
                      <p className="text-sm text-ink-muted">Perfect space for afternoon celebrations</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink mb-1">Community Events</h4>
                      <p className="text-sm text-ink-muted">Club meetings, fundraisers, social groups</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink mb-1">Wakes & Memorials</h4>
                      <p className="text-sm text-ink-muted">Respectful venue for celebrations of life</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <Card accent className="text-center">
              <CardBody className="p-6">
                <p className="text-lg text-ink mb-4">
                  <strong>Feltham groups love our flexibility!</strong>
                  Competitive rates - let's discuss your needs. Private hire for 10+ to 150 guests, with larger events by enquiry.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/private-hire">
                    <Button
                      variant="primary"
                      size="md"
                    >
                      Party Venue Info
                    </Button>
                  </Link>
                  <PhoneButton
                    phone="01753 682707"
                    source="feltham_pub_event_quote"
                    variant="outline"
                    size="md"
                  >
                     Quick Quote
                  </PhoneButton>
                  <Link href="https://wa.me/441753682707?text=Hi,%20I" target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      size="md"
                    >
                       WhatsApp
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Feltham Workers & Weekend Escape */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="The Feltham Workers' Local"
              className="text-center mb-8"
            />
            <div className="prose max-w-none text-ink-muted space-y-4">
              <p>
                Feltham's commercial corridor stretches from Bedfont Lakes Business Park through to the trading estates
                along Feltham Hill Road, thousands of people finishing shifts every evening with limited options for a
                proper sit-down meal nearby. Most end up in chain restaurants or grabbing a takeaway. The Anchor is just
                ten minutes down Feltham Hill Road and the A30, with free parking and a kitchen serving hearty pub food
                from 6pm on weeknights. It is the kind of place where you can unwind with a pint of draught beer and a
                stone-baked pizza without fighting for a table.
              </p>
              <p>
                Coming from Feltham station? A taxi takes about fifteen minutes and costs less than a tenner. For those
                heading home after an England match at Twickenham, skip the crush around the rugby ground pubs, The
                Anchor is roughly twenty minutes via the A316 and M3, even on a busy match day, with guaranteed free
                parking at the other end. It is a much more relaxed way to keep the evening going.
              </p>
              <p>
                If you have been searching for pubs in Feltham, you will know the options are fairly thin on the ground
                these days, mostly chains, a handful of takeaways, and the odd sports bar. For those after pubs near Feltham
                with real character, a proper beer garden under the Heathrow flight path, and events like Music Bingo and
                Thursday quiz nights, The Anchor is well worth the short drive. Plenty of Feltham regulars have made us their
                go-to midweek escape, and once you have tried a lazy Sunday roast here you will wonder why you ever queued
                on Feltham High Street.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Opening Hours"
            />
            <BusinessHours />
          </div>
        </Container>
      </section>

      <OrganicSearchClusterLinks
        cluster="localPub"
        currentPath="/feltham-pub"
        title="Compare local pub pages"
        intro="Use these local pages for nearby pub, food and directions searches before you visit."
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "How far is The Anchor from Feltham?",
            answer: "The Anchor is just 10 minutes (3.2 miles) from Feltham town centre. An easy drive via Bedfont Lane and Staines Road, with free parking available on arrival."
          },
          {
            question: "Is there a bus from Feltham to The Anchor?",
            answer: "Yes, the 117 bus route connects Feltham to nearby Stanwell Moor. From the bus stop, it's a short 5-minute walk to The Anchor. Alternatively, it's a quick 10-minute drive with free parking."
          },
          {
            question: "Do you deliver to Feltham?",
            answer: "We offer takeaway service for all our food menu items - just call ahead on 01753 682707 to place your order for collection. We don't offer delivery, but you're welcome to collect your order from our Stanwell Moor location."
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="Experience the Difference"
        copy="See why so many Feltham residents make the short journey to The Anchor"
      >
        <Link href="/book-table">
          <Button variant="primary" size="lg">Book a Table</Button>
        </Link>
        <Link href="tel:+441753682707">
          <Button variant="outline" size="lg">Call: 01753 682707</Button>
        </Link>
        <Link href="/private-hire#enquiry">
          <Button variant="outline" size="lg">Book an Event</Button>
        </Link>
        <Link href="/find-us">
          <Button variant="outline" size="lg">Get Directions</Button>
        </Link>
      </CtaBand>
    </>
  )
}

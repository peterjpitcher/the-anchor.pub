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
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: 'Pub Near Bedfont | 5 Mins Away | Free Parking',
  description: 'The Anchor - 5 mins from Bedfont. Traditional British pub with free parking, great food & regular events. Perfect local for Bedfont residents.',
  openGraph: {
    title: 'Pub Near Bedfont | 5 Mins Away | Free Parking | The Anchor',
    description: 'Just 5 minutes from Bedfont with free parking and great food.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
  },
  twitter: getTwitterMetadata({
    title: 'Pub Near Bedfont | 5 Mins Away | Free Parking | The Anchor',
    description: 'Just 5 minutes from Bedfont with free parking and great food.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/bedfont-pub'
  }
}

export default function BedfontPubPage() {
  const directionsSchema = generateHowToDirectionsSchema(
    "Bedfont",
    "The Anchor",
    [
      "From Bedfont Green, head south on Staines Road",
      "Continue for 0.8 miles",
      "Turn left onto Horton Road",
      "Continue for 0.5 miles",
      "The Anchor is on your left with free parking"
    ]
  )

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    "name": "The Anchor - Bedfont's Local Pub",
    "description": "Traditional British pub serving Bedfont residents with great food, drinks, and entertainment.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Horton Road",
      "addressLocality": "Stanwell Moor",
      "addressRegion": "Surrey",
      "postalCode": "TW19 6AQ",
      "addressCountry": "GB"
    },
    "areaServed": [
      {
        "@type": "Place",
        "name": "Bedfont"
      },
      {
        "@type": "Place",
        "name": "East Bedfont"
      },
      {
        "@type": "Place",
        "name": "West Bedfont"
      }
    ],
    "telephone": "+441753682707",
    "url": "https://www.the-anchor.pub/bedfont-pub"
  }


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, directionsSchema]) }}
      />

      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/bedfont-pub/find-us.jpg"
        crumb="Bedfont"
        title="Bedfont's Closest Traditional Pub"
        lead="Just 5 minutes away with free parking"
        actions={
          <BookTableButton source="bedfont_pub_hero"
          context="local_pub" variant="primary" size="lg" fullWidth>
          Book a Table
        </BookTableButton>
        }
      />

      {/* Page Title */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle
              seo={{
                structured: true,
                speakable: true
              }}
              className="mb-4"
            >
              Bedfont Pub - Traditional British Pub Near Bedfont
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Your local traditional pub just 5 minutes from Bedfont with free parking
            </p>
          </div>
        </Container>
      </section>

      {/* Distance & Benefits */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="The Anchor - Bedfont's Best Kept Secret"
              lead="Your nearest proper British pub - just 5 minutes from both East and West Bedfont"
              className="text-center mb-12"
            />

            {/* Key Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {[
                { title: "Closest Pub", description: "Just 5 minutes from Bedfont - your nearest traditional pub" },
                { title: "Business Friendly", description: "Popular with Bedfont Lakes Business Park workers" },
                { title: "Community Hub", description: "Where East and West Bedfont residents meet" },
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
                  Why Bedfont Residents Love The Anchor
                </h3>
                <ul className="space-y-4 text-ink">
                  {[
                    'Your nearest traditional pub - no need to travel to Feltham or Staines',
                    'Perfect meeting point for East and West Bedfont friends',
                    'Free parking for all - essential for family gatherings',
                    'Dog-friendly throughout - perfect for Bedfont dog walkers',
                    'Regular quiz nights popular with Bedfont teams',
                  ].map((item) => (
                    <li key={item} className="flex items-start">
                      <span className="text-accent-text font-bold mr-3">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Directions */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Easy to Find from Bedfont"
            />

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display text-h4 text-ink-strong mb-4">From East Bedfont</h3>
                <ol className="space-y-3 text-ink">
                  <li className="flex"><span className="text-accent-text font-bold mr-3">1.</span>Head west on Staines Road from Bedfont Green</li>
                  <li className="flex"><span className="text-accent-text font-bold mr-3">2.</span>Continue for 0.8 miles past the cemetery</li>
                  <li className="flex"><span className="text-accent-text font-bold mr-3">3.</span>Turn left onto Horton Road</li>
                  <li className="flex"><span className="text-accent-text font-bold mr-3">4.</span>The Anchor is 0.5 miles on your left</li>
                </ol>
              </div>

              <div>
                <h3 className="font-display text-h4 text-ink-strong mb-4">From West Bedfont</h3>
                <ol className="space-y-3 text-ink">
                  <li className="flex"><span className="text-accent-text font-bold mr-3">1.</span>Take Bedfont Road heading south</li>
                  <li className="flex"><span className="text-accent-text font-bold mr-3">2.</span>Turn left onto Staines Road</li>
                  <li className="flex"><span className="text-accent-text font-bold mr-3">3.</span>After 0.3 miles, turn left onto Horton Road</li>
                  <li className="flex"><span className="text-accent-text font-bold mr-3">4.</span>The Anchor is on your left with parking</li>
                </ol>
              </div>
            </div>

            <Card accent className="mt-8">
              <CardBody className="p-6">
                <h3 className="font-display text-h4 text-ink-strong mb-3">From Bedfont Lakes Business Park</h3>
                <p className="text-ink-muted">
                  Just 7 minutes via Bedfont Road and Staines Road. Perfect for lunch meetings, after-work drinks,
                  or team celebrations. We offer reserved areas for corporate groups.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Local Features */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Perfect for Bedfont Locals"
            />
            <div className="grid md:grid-cols-2 gap-5">
              <Card accent>
                <CardBody className="p-8">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Family Gatherings</h3>
                  <p className="text-ink-muted mb-4">
                    The go-to venue for Bedfont family celebrations
                  </p>
                  <ul className="space-y-2 text-ink">
                    <li>• Children's menu available</li>
                    <li>• High chairs provided</li>
                    <li>• Family-friendly - children always welcome</li>
                    <li>• Birthday party packages</li>
                  </ul>
                </CardBody>
              </Card>
              <Card accent>
                <CardBody className="p-8">
                  <h3 className="font-display text-h4 text-ink-strong mb-4">Local Groups Welcome</h3>
                  <p className="text-ink-muted mb-4">
                    Home to many Bedfont clubs and societies
                  </p>
                  <ul className="space-y-2 text-ink">
                    <li>• Monthly quiz nights with local teams</li>
                    <li>• Darts league participants</li>
                    <li>• Book clubs meet here</li>
                    <li>• Walking groups finish point</li>
                  </ul>
                </CardBody>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <h3 className="font-display text-h4 text-ink-strong mb-4">Weekly Highlights for Bedfont</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Card accent>
                  <CardBody className="p-4">
                    <p className="font-semibold text-ink">Tuesday</p>
                    <p className="text-ink-muted">Stone-Baked Pizza Night</p>
                  </CardBody>
                </Card>
                <Card accent>
                  <CardBody className="p-4">
                    <p className="font-semibold text-ink">Wednesday</p>
                    <p className="text-ink-muted">Quiz Night</p>
                  </CardBody>
                </Card>
                <Card accent>
                  <CardBody className="p-4">
                    <p className="font-semibold text-ink">Saturday</p>
                    <p className="text-ink-muted">Music Bingo with Nikki Manfadge (see /whats-on)</p>
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Local Knowledge Section */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Bedfont&rsquo;s Proper Local, Just Round the Corner"
            />
            <div className="prose max-w-none space-y-4 text-ink-muted">
              <p>
                If you live in Bedfont, you already know the area&rsquo;s a bit short on proper pubs. The choices are mostly chains in Feltham or a trek into Staines. The Anchor changes that equation completely, we&rsquo;re about eight minutes away, and the drive couldn&rsquo;t be simpler. From Bedfont Lane, head down the A30 or cut through on Staines Road, turn onto Horton Road, and you&rsquo;re here. Close enough for a weekday evening pint without it feeling like a mission.
              </p>
              <p>
                Bedfont Lakes Country Park is one of the area&rsquo;s hidden gems, and we&rsquo;ve become the unofficial post-walk pub for plenty of dog walkers and families who spend their mornings around the lakes. The routine is perfect: a couple of hours exploring the trails and the lakes, then a short drive over to The Anchor for lunch in the beer garden. Dogs are welcome throughout, and we always have water bowls ready.
              </p>
              <p>
                The industrial estate and business park workers along the Bedfont and Feltham corridor have cottoned on to us as well. If you work at Bedfont Lakes Business Park, DHL, or any of the units along Bedfont Road, we&rsquo;re your closest proper pub for a Friday evening wind-down or a team celebration. Seven minutes from the business park, free parking, and prices that won&rsquo;t eat into your weekend budget.
              </p>
              <p>
                We&rsquo;re genuinely close enough to be your regular. The monthly quiz, Music Bingo with Nikki Manfadge, plenty of Bedfont residents are already part of the furniture. You might as well join them.
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

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "How far is The Anchor from Bedfont?",
            answer: "The Anchor is just 5 minutes (1.5 miles) from Bedfont. We're the closest traditional British pub to both East and West Bedfont, with free parking available."
          },
          {
            question: "Is The Anchor walkable from Bedfont?",
            answer: "Yes, it's about a 20-minute walk from Bedfont Green via Staines Road and Horton Road. Many Bedfont residents enjoy the walk, especially in good weather, though most prefer the quick 5-minute drive."
          },
          {
            question: "Do you serve Bedfont Lakes Business Park?",
            answer: "Yes! We're very popular with workers from Bedfont Lakes Business Park. We offer versatile venue spaces for corporate events, team meetings, and celebrations. With comprehensive catering options and our preferred vendor network, we're perfect for business functions. Just 7 minutes away with free parking."
          }
        ]}
        className="bg-canvas"
      />

      {/* CTA Section */}
      <CtaBand
        title="Your Nearest Traditional Pub"
        copy="Join your Bedfont neighbours at The Anchor - where everyone knows your name"
      >
        <Link href="tel:+441753682707">
          <Button variant="primary" size="lg">Call: 01753 682707</Button>
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

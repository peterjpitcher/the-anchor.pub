import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, Container } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateBreadcrumbSchema, generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: 'Egham Pub Alternative - Free Parking & Sunday Roast | The Anchor',
  description: 'Skip busy town pubs. The Anchor is 12 minutes from Egham with free parking, Sunday roasts, stone-baked pizzas and a warm local welcome for Royal Holloway students.',
  keywords: 'egham pub alternative, sunday roast near egham, royal holloway pub, free parking pub egham, village pub near egham',
  openGraph: {
    title: 'Egham Pub Alternative - The Anchor Stanwell Moor',
    description: 'Traditional village pub 12 minutes from Egham with free parking, Sunday roast and stone-baked pizzas.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
  },
  twitter: getTwitterMetadata({
    title: 'Egham Pub Alternative - The Anchor Stanwell Moor',
    description: 'Traditional village pub 12 minutes from Egham with free parking, Sunday roast and stone-baked pizzas.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/egham-pub'
  }
}

export default function EghamPubPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Egham Pub', url: '/egham-pub' }
  ])

  const directionsSchema = generateHowToDirectionsSchema(
    "Egham Town Centre",
    "The Anchor",
    [
      "From Egham High Street, take the A30 towards Staines",
      "After 2 miles, turn left onto A308 Staines bypass",
      "At the roundabout, take the 3rd exit onto A3044",
      "Continue for 1.5 miles",
      "Turn right onto Horton Road",
      "The Anchor is 200 yards on your right with free parking"
    ]
  )

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    "name": "The Anchor - Egham's Local Pub",
    "description": "Traditional British pub serving Egham residents and Royal Holloway students with great food, drinks, and entertainment.",
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
        "@type": "City",
        "name": "Egham"
      },
      {
        "@type": "Place",
        "name": "Royal Holloway University"
      }
    ],
    "telephone": "+441753682707",
    "url": "https://www.the-anchor.pub/egham-pub"
  }


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema, directionsSchema]) }}
      />
      
      {/* Hero Section */}
      <HeroWrapper
        route="/egham-pub"
        title="Your Local Pub Near Egham"
        description="Just 12 minutes away with free parking"
        variant="default"
        primaryCta={
          <BookTableButton
            source="egham_pub_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            context="egham_local"
          >
             Book a Table
          </BookTableButton>
        }
        secondaryCta={
          <Link href="/food-menu">
            <Button 
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
               View Menu
            </Button>
          </Link>
        }
      />

      {/* Page Title */}
      <section className="py-8 bg-anchor-bg">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle
              seo={{
                structured: true,
                speakable: true
              }}
              className="text-anchor-cream-text mb-4"
            >
              Egham Pub - Traditional British Pub Near Egham
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Your local traditional pub just 12 minutes from Egham with free parking
            </p>
          </div>
        </Container>
      </section>

      {/* Distance & Benefits */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Egham's Favourite Surrey Escape"
              subtitle="Worth the short drive for a proper traditional pub experience"
              className="text-center mb-12"
            />

            {/* Key Benefits Grid */}
            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "12min",
                  title: "Quick Journey",
                  description: "Just 12 minutes from Egham via A30",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Student Friendly",
                  description: "Popular with Royal Holloway students & staff",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Great Value",
                  description: "Competitive prices compared to Egham venues",
                  className: "text-center"
                }
              ]}
              className="mb-12"
            />

            {/* Why Choose Us */}
            <div className="card-dark rounded-none p-8">
              <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-6">
                Why Egham Residents & Students Choose The Anchor
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3"></span>
                  <span>Free parking - no expensive Egham parking charges</span>
                </li>
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3"></span>
                  <span>Traditional pub atmosphere away from chain venues</span>
                </li>
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3"></span>
                  <span>Perfect for Royal Holloway society meetups</span>
                </li>
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3"></span>
                  <span>Regular quiz nights - build your own team</span>
                </li>
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3"></span>
                  <span>Our celebrated Sunday roasts worth the journey</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Directions */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="How to Find Us from Egham"
            />
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-xl mb-4">From Egham Town Centre</h3>
                <ol className="space-y-3">
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">1.</span>
                    Take the A30 towards Staines
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">2.</span>
                    After 2 miles, turn left onto A308 Staines bypass
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">3.</span>
                    At the roundabout, take 3rd exit onto A3044
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">4.</span>
                    Continue for 1.5 miles
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">5.</span>
                    Turn right onto Horton Road
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">6.</span>
                    The Anchor is on your right with free parking
                  </li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-bold text-xl mb-4">From Royal Holloway</h3>
                <ol className="space-y-3">
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">1.</span>
                    Exit campus and join A30 towards Staines
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">2.</span>
                    Follow A30 for 3 miles
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">3.</span>
                    Turn left onto A308 (Staines bypass)
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">4.</span>
                    Follow directions above from step 3
                  </li>
                </ol>
              </div>
            </div>

            <AlertBox
              variant="tip"
              title="Royal Holloway Students"
              className="mt-8"
              content={
                <>
                  Organising a society event? We're the perfect venue for Royal Holloway societies and sports teams. 
                  Ideal for end-of-term celebrations, social mixers, and team dinners. Contact us for group bookings.
                </>
              }
            />
          </div>
        </Container>
      </section>

      {/* Student & Local Offers */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Perfect for Egham Groups"
            />
            <InfoBoxGrid
              columns={2}
              boxes={[
                {
                  title: "Royal Holloway Gatherings",
                  content: (
                    <>
                      <p className="mb-3">Popular with Royal Holloway students and staff</p>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <span className="text-anchor-gold mr-2">•</span>
                          Perfect for society meetups
                        </li>
                        <li className="flex items-start">
                          <span className="text-anchor-gold mr-2">•</span>
                          End-of-term celebrations
                        </li>
                        <li className="flex items-start">
                          <span className="text-anchor-gold mr-2">•</span>
                          Sports team dinners
                        </li>
                        <li className="flex items-start">
                          <span className="text-anchor-gold mr-2">•</span>
                          Quiz team headquarters
                        </li>
                      </ul>
                    </>
                  ),
                  variant: "colored",
                  color: "bg-anchor-bg-card"
                },
                {
                  title: "Egham Favourites",
                  content: (
                    <>
                      <p className="mb-3">Join other Egham locals who make the journey</p>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <span className="text-anchor-gold mr-2">•</span>
                          Stone-Baked Pizzas
                        </li>
                        <li className="flex items-start">
                          <span className="text-anchor-gold mr-2">•</span>
                          Wednesday Quiz Nights
                        </li>
                        <li className="flex items-start">
                          <span className="text-anchor-gold mr-2">•</span>
                          Hosted nights like Music Bingo with Nikki Manfadge (see /whats-on)
                        </li>
                        <li className="flex items-start">
                          <span className="text-anchor-gold mr-2">•</span>
                          Sunday Roast (book early)
                        </li>
                      </ul>
                    </>
                  ),
                  variant: "colored",
                  color: "bg-anchor-bg-card"
                }
              ]}
            />

            <div className="mt-8 text-center card-dark rounded-none p-8">
              <h3 className="font-bold text-xl text-anchor-gold-vivid mb-4">Transport Options</h3>
              <div className="text-center">
                <p className="font-semibold mb-2">Taxi Services</p>
                <p className="text-anchor-cream-text/70">We can arrange taxis back to Egham/Royal Holloway</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
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
            question: "How far is The Anchor from Egham?",
            answer: "The Anchor is just 12 minutes (4.5 miles) from Egham town centre via the A30 and A3044. We offer free parking, making us a great alternative to paid parking in Egham high street."
          },
          {
            question: "Is The Anchor popular with Royal Holloway students?",
            answer: "Yes! Many Royal Holloway students and staff visit The Anchor for our relaxed atmosphere, great food, and regular events. We're just 15 minutes from the university campus."
          },
          {
            question: "Can you host Royal Holloway society events?",
            answer: "Absolutely! We regularly host Royal Holloway society events, sports team celebrations, and end-of-term parties. We can reserve areas for your society and help make your event special."
          }
        ]}
        className="bg-anchor-bg"
      />

      {/* CTA Section */}
      <CTASection
        title="Worth the Journey from Egham"
        description="Discover why so many Egham residents and Royal Holloway students make The Anchor their regular"
        buttons={[
          {
            text: " Call: 01753 682707",
            href: "tel:+441753682707",
            isPhone: true,
            phoneSource: "egham_pub_cta",
            variant: "white"
          },
          {
            text: " Book an Event",
            href: "/private-hire#enquiry",
            variant: "white"
          },
          {
            text: " Get Directions",
            href: "/find-us",
            variant: "white"
          }
        ]}
        variant="green"
        footer="Horton Road, Stanwell Moor, Surrey TW19 6AQ"
      />
    </>
  )
}

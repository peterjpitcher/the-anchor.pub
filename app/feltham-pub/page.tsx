import Link from 'next/link'
import { Button, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, Container } from '@/components/ui'
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
  title: 'Feltham Pub Alternative - Free Parking & Sunday Roast | The Anchor',
  description: 'Head 10 minutes from Feltham to The Anchor for free parking, Sunday roasts, stone-baked pizzas and quiz nights in a relaxed village setting.',
  openGraph: {
    title: 'Feltham Pub Alternative - The Anchor Stanwell Moor',
    description: '10 minutes from Feltham with free parking, Sunday roasts, stone-baked pizzas and quiz nights.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
  },
  twitter: getTwitterMetadata({
    title: 'Feltham Pub Alternative - The Anchor Stanwell Moor',
    description: '10 minutes from Feltham with free parking, Sunday roasts, stone-baked pizzas and quiz nights.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/feltham-pub'
  }
}

export default function FelthamPubPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Feltham Pub', url: '/feltham-pub' }
  ])

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema, directionsSchema]) }}
      />
      
      {/* Hero Section */}
      <HeroWrapper
        route="/feltham-pub"
        title="Your Local Pub Near Feltham"
        description="Just 10 minutes away with free parking"
        variant="default"
        primaryCta={
          <BookTableButton
            source="feltham_pub_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            context="feltham_local"
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
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
          </div>
        }
      />

      <section className="bg-anchor-bg py-6">
        <Container>
          <p className="text-center text-sm text-anchor-cream-text/70"> <strong>Rated 4.6/5 on Google</strong> · Highest-rated non-airport pub near Heathrow</p>
        </Container>
      </section>

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
              Feltham Pub - Traditional British Pub Near Feltham
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Your local traditional pub just 10 minutes from Feltham with free parking
            </p>
          </div>
        </Container>
      </section>

      {/* Distance & Benefits */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Feltham's Favourite Village Escape"
              subtitle="Escape the hustle of Feltham High Street for a proper traditional pub experience"
              className="text-center mb-12"
            />

            {/* Key Benefits Grid */}
            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "10min",
                  title: "Quick Drive",
                  description: "Just 10 minutes from Feltham via Bedfont Lane",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Peaceful Setting",
                  description: "Village atmosphere away from busy Feltham traffic",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Plane Spotting",
                  description: "Unique beer garden under the Heathrow flight path",
                  className: "text-center"
                }
              ]}
              className="mb-12"
            />

            {/* Why Choose Us */}
            <div className="card-dark rounded-none p-8">
              <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-6">
                Why Feltham Residents Choose The Anchor
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3"></span>
                  <span>Free parking - no time limits or charges</span>
                </li>
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3"></span>
                  <span>Traditional pub atmosphere you won't find in chain venues</span>
                </li>
	                <li className="flex items-start">
	                  <span className="text-anchor-gold mr-3"></span>
	                  <span>Our celebrated Sunday roasts - pre-order by 1pm Saturday. Sunday lunch bookings require a £10 per person deposit.</span>
	                </li>
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3"></span>
                  <span>Regular entertainment including Music Bingo hosted by Nikki Manfadge, quiz nights and one-off events (see /whats-on)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3"></span>
                  <span>Perfect for Feltham work colleagues' gatherings</span>
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
              title="How to Find Us from Feltham"
            />
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-xl mb-4">Driving Directions</h3>
                <ol className="space-y-3">
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">1.</span>
                    From Feltham High Street, head south on Bedfont Lane
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">2.</span>
                    Continue for 1.5 miles through Bedfont
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">3.</span>
                    At the roundabout, take the 2nd exit onto Staines Road
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">4.</span>
                    After 0.8 miles, turn right onto Horton Road
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">5.</span>
                    Continue for 0.5 miles
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">6.</span>
                    The Anchor is on your left - ample free parking available
                  </li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-bold text-xl mb-4">Local Landmarks</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-anchor-cream-text">From Feltham Station:</p>
                    <p className="text-anchor-cream-text/70">10-minute drive via Bedfont Lane, or take the 117 bus towards Staines.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-anchor-cream-text">Near Bedfont Lakes:</p>
                    <p className="text-anchor-cream-text/70">We're just 5 minutes from Bedfont Lakes Business Park - perfect for after-work drinks.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-anchor-cream-text">From The Centre Feltham:</p>
                    <p className="text-anchor-cream-text/70">Head south on Bedfont Lane, follow signs for Staines/Stanwell.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Special Offers for Feltham */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Perfect for Feltham Groups"
            />
            <InfoBoxGrid
              columns={2}
              boxes={[
                {
                  title: "Work Gatherings",
                  content: (
                    <>
                      <p className="mb-3">Popular with teams from Feltham's business parks. Private areas available for corporate events.</p>
                      <ul className="space-y-2">
	                        <li className="flex items-start">
	                          <span className="text-anchor-gold mr-2">•</span>
	                          Buffet menus from £12pp
	                        </li>
                        <li className="flex items-start">
                          <span className="text-anchor-gold mr-2">•</span>
                          Reserved areas available
                        </li>
                        <li className="flex items-start">
                          <span className="text-anchor-gold mr-2">•</span>
                          Free parking for all guests
                        </li>
                      </ul>
                    </>
                  ),
                  variant: "colored",
                  color: "bg-anchor-bg-card"
                },
                {
                  title: "Weekend Escapes",
                  content: (
                    <>
                      <p className="mb-3">Join Feltham locals who make The Anchor their weekend destination.</p>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <span className="text-anchor-gold mr-2">•</span>
                          Hosted nights like Music Bingo with Nikki Manfadge (see /whats-on)
                        </li>
	                        <li className="flex items-start">
	                          <span className="text-anchor-gold mr-2">•</span>
	                          Sunday roasts - pre-order by 1pm Saturday. Sunday lunch bookings require a £10 per person deposit.
	                        </li>
                        <li className="flex items-start">
                          <span className="text-anchor-gold mr-2">•</span>
                          Quiz nights & bingo
                        </li>
                      </ul>
                    </>
                  ),
                  variant: "colored",
                  color: "bg-anchor-bg-card"
                }
              ]}
            />
          </div>
        </Container>
      </section>

      {/* Event Venue for Feltham */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Private Events for Feltham Residents"
              subtitle="The perfect venue just 10 minutes from Feltham"
            />
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-anchor-bg-card border border-anchor-gold/15 rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Why Feltham Chooses Us</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold-vivid"></span>
                    <span><strong>Quick 10-minute drive</strong> - Closer than central London venues</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold-vivid"></span>
                    <span><strong>Free parking for all guests</strong> - Save on town centre fees</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold-vivid"></span>
                    <span><strong>Affordable pricing</strong> - Better value than Feltham High Street</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-anchor-gold-vivid"></span>
                    <span><strong>Trusted by locals</strong> - Regular venue for Feltham groups</span>
                  </li>
                </ul>
              </div>
              
              <div className="card-dark rounded-none p-6">
                <h3 className="text-xl font-bold text-anchor-gold-vivid mb-4">Popular Feltham Events</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-anchor-gold-vivid mb-1"> Birthday Parties</h4>
                    <p className="text-sm text-anchor-cream-text/70">From kids parties to 50th celebrations</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-anchor-gold-vivid mb-1"> Baby Showers</h4>
                    <p className="text-sm text-anchor-cream-text/70">Perfect space for afternoon celebrations</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-anchor-gold-vivid mb-1"> Community Events</h4>
                    <p className="text-sm text-anchor-cream-text/70">Club meetings, fundraisers, social groups</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-anchor-gold-vivid mb-1"> Wakes & Memorials</h4>
                    <p className="text-sm text-anchor-cream-text/70">Respectful venue for celebrations of life</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-dark rounded-none p-6 text-center">
              <p className="text-lg text-anchor-cream-text mb-4">
                <strong>Feltham groups love our flexibility!</strong> 
                Competitive rates - let's discuss your needs. Spaces for 10-200 guests.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/private-party-venue">
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
                  variant="secondary"
                  size="md"
                >
                   Quick Quote
                </PhoneButton>
                <Link href="https://wa.me/441753682707?text=Hi,%20I" target="_blank" rel="noopener noreferrer">
                  <Button 
                    variant="secondary"
                    size="md"
                  >
                     WhatsApp
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Feltham Workers & Weekend Escape */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="The Feltham Workers' Local"
              className="text-center mb-8"
            />
            <div className="prose prose-invert max-w-none text-anchor-cream-text/70 space-y-4">
              <p>
                Feltham's commercial corridor stretches from Bedfont Lakes Business Park through to the trading estates
                along Feltham Hill Road — thousands of people finishing shifts every evening with limited options for a
                proper sit-down meal nearby. Most end up in chain restaurants or grabbing a takeaway. The Anchor is just
                ten minutes down Feltham Hill Road and the A30, with free parking and a kitchen serving hearty pub food
                from 6pm on weeknights. It is the kind of place where you can unwind with a pint of real ale and a
                stone-baked pizza without fighting for a table.
              </p>
              <p>
                Coming from Feltham station? A taxi takes about fifteen minutes and costs less than a tenner. For those
                heading home after an England match at Twickenham, skip the crush around the rugby ground pubs — The
                Anchor is roughly twenty minutes via the A316 and M3, even on a busy match day, with guaranteed free
                parking at the other end. It is a much more relaxed way to keep the evening going.
              </p>
              <p>
                Feltham's own pub scene is fairly thin on the ground these days — mostly chains, a handful of
                takeaways, and the odd sports bar. If you want a traditional pub with character, a proper beer garden
                under the Heathrow flight path, and events like Music Bingo and Thursday quiz nights, it is well worth
                the short drive. Plenty of Feltham regulars have made The Anchor their go-to midweek escape, and once
                you have tried a lazy Sunday roast here you will wonder why you ever queued on Feltham High Street.
              </p>
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
        className="bg-anchor-bg"
      />

      {/* CTA Section */}
      <CTASection
        title="Experience the Difference"
        description="See why so many Feltham residents make the short journey to The Anchor"
        buttons={[
          {
            text: " Book a Table",
            href: "/book-table",
            variant: "secondary"
          },
          {
            text: " Call: 01753 682707",
            href: "tel:+441753682707",
            isPhone: true,
            phoneSource: "feltham_pub_cta",
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

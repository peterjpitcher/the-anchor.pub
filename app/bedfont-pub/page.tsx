import Link from 'next/link'
import { Button } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { generateBreadcrumbSchema, generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { Metadata } from 'next'
import { CTASection, SectionHeader, FeatureGrid, Container } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: 'Bedfont Pub | The Anchor - 5 Minutes Away | Surrey',
  description: 'The Anchor - 5 mins from Bedfont. Traditional British pub with free parking, great food & regular events. Perfect local for Bedfont residents.',
  keywords: 'bedfont pub, pub near bedfont, bedfont surrey pub, east bedfont pub, west bedfont pub, bedfont lakes pub',
  openGraph: {
    title: 'The Anchor - Heathrow Pub & Dining - Your Local Pub Near Bedfont',
    description: 'Just 5 minutes from Bedfont with free parking and great food.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
  },
  twitter: getTwitterMetadata({
    title: 'The Anchor - Heathrow Pub & Dining - Your Local Pub Near Bedfont',
    description: 'Just 5 minutes from Bedfont with free parking and great food.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/bedfont-pub'
  }
}

export default function BedfontPubPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Bedfont Pub', url: '/bedfont-pub' }
  ])

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, breadcrumbSchema, directionsSchema]) }}
      />
      
      {/* Hero Section */}
      <HeroWrapper
        route="/bedfont-pub"
        title="Bedfont's Closest Traditional Pub"
        description="Just 5 minutes away with free parking"
        variant="default"
        primaryCta={
          <BookTableButton
            source="bedfont_pub_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            context="bedfont_local"
          >
            📅 Book a Table
          </BookTableButton>
        }
        secondaryCta={
          <Link href="/food-menu">
            <Button 
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              🍽️ View Menu
            </Button>
          </Link>
        }
      />

      {/* Page Title */}
      <section className="py-8 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle
              seo={{
                structured: true,
                speakable: true
              }}
              className="text-anchor-green mb-4"
            >
              Bedfont Pub - Traditional British Pub Near Bedfont
            </PageTitle>
            <p className="text-lg text-gray-700">
              Your local traditional pub just 5 minutes from Bedfont with free parking
            </p>
          </div>
        </Container>
      </section>

      {/* Distance & Benefits */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="The Anchor - Bedfont's Best Kept Secret"
              subtitle="Your nearest proper British pub - just 5 minutes from both East and West Bedfont"
              className="text-center mb-12"
            />

            {/* Key Benefits Grid */}
            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "5min",
                  title: "Closest Pub",
                  description: "Just 5 minutes from Bedfont - your nearest traditional pub",
                  className: "text-center"
                },
                {
                  icon: "🏢",
                  title: "Business Friendly",
                  description: "Popular with Bedfont Lakes Business Park workers",
                  className: "text-center"
                },
                {
                  icon: "🏘️",
                  title: "Community Hub",
                  description: "Where East and West Bedfont residents meet",
                  className: "text-center"
                }
              ]}
              className="mb-12"
            />

            {/* Why Choose Us */}
            <div className="bg-anchor-cream rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-anchor-green mb-6">
                Why Bedfont Residents Love The Anchor
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3">✓</span>
                  <span>Your nearest traditional pub - no need to travel to Feltham or Staines</span>
                </li>
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3">✓</span>
                  <span>Perfect meeting point for East and West Bedfont friends</span>
                </li>
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3">✓</span>
                  <span>Free parking for all - essential for family gatherings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3">✓</span>
                  <span>Dog-friendly throughout - perfect for Bedfont dog walkers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-anchor-gold mr-3">✓</span>
                  <span>Regular quiz nights popular with Bedfont teams</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Directions */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Easy to Find from Bedfont"
            />
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-xl mb-4">From East Bedfont</h3>
                <ol className="space-y-3">
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">1.</span>
                    Head west on Staines Road from Bedfont Green
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">2.</span>
                    Continue for 0.8 miles past the cemetery
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">3.</span>
                    Turn left onto Horton Road
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">4.</span>
                    The Anchor is 0.5 miles on your left
                  </li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-bold text-xl mb-4">From West Bedfont</h3>
                <ol className="space-y-3">
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">1.</span>
                    Take Bedfont Road heading south
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">2.</span>
                    Turn left onto Staines Road
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">3.</span>
                    After 0.3 miles, turn left onto Horton Road
                  </li>
                  <li className="flex">
                    <span className="text-anchor-gold font-bold mr-3">4.</span>
                    The Anchor is on your left with parking
                  </li>
                </ol>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-xl">
              <h3 className="font-bold text-xl text-anchor-green mb-3">From Bedfont Lakes Business Park</h3>
              <p className="text-gray-700">
                Just 7 minutes via Bedfont Road and Staines Road. Perfect for lunch meetings, after-work drinks, 
                or team celebrations. We offer reserved areas for corporate groups.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Local Features */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Perfect for Bedfont Locals"
            />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-8 rounded-xl">
                <h3 className="font-bold text-xl text-anchor-green mb-4">Family Gatherings</h3>
                <p className="text-gray-700 mb-4">
                  The go-to venue for Bedfont family celebrations
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Children's menu available</li>
                  <li>• High chairs provided</li>
                  <li>• Family-friendly - children always welcome</li>
                  <li>• Birthday party packages</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl">
                <h3 className="font-bold text-xl text-anchor-green mb-4">Local Groups Welcome</h3>
                <p className="text-gray-700 mb-4">
                  Home to many Bedfont clubs and societies
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Monthly quiz nights with local teams</li>
                  <li>• Darts league participants</li>
                  <li>• Book clubs meet here</li>
                  <li>• Walking groups finish point</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 text-center">
              <h3 className="font-bold text-xl text-anchor-green mb-4">Weekly Highlights for Bedfont</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-anchor-cream p-4 rounded-lg">
                  <p className="font-bold">Tuesday</p>
                  <p className="text-gray-700">Stone-Baked Pizza Night</p>
                </div>
                <div className="bg-anchor-cream p-4 rounded-lg">
                  <p className="font-bold">Wednesday</p>
                  <p className="text-gray-700">Quiz Night</p>
                </div>
                <div className="bg-anchor-cream p-4 rounded-lg">
                  <p className="font-bold">Saturday</p>
                  <p className="text-gray-700">Music Bingo with Nikki Manfadge (see /whats-on)</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Opening Hours */}
      <section className="section-spacing bg-anchor-cream">
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
        className="bg-gray-50"
      />

      {/* CTA Section */}
      <CTASection
        title="Your Nearest Traditional Pub"
        description="Join your Bedfont neighbours at The Anchor - where everyone knows your name"
        buttons={[
          {
            text: "📞 Call: 01753 682707",
            href: "tel:+441753682707",
            isPhone: true,
            phoneSource: "bedfont_pub_cta",
            variant: "white"
          },
          {
            text: "🎉 Book an Event",
            href: "/private-hire#enquiry",
            variant: "white"
          },
          {
            text: "📍 Get Directions",
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

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, QuickInfoGrid, Container } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { JsonLd } from '@/components/JsonLd'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'
import { TrustBar, ValueProofStrip, RegretReduction } from '@/components/psychology'

export const metadata: Metadata = {
  title: 'Private Function Room Near Heathrow | 10-50 Guests',
  description: 'Private function room near Heathrow and Staines for 10-50 guests, with larger events by enquiry. Layout options, AV support and free parking included.',
  openGraph: {
    title: 'Private Function Room Near Heathrow | 10-50 Guests',
    description: 'Flexible private function room with 6 layouts, AV equipment and free parking near Heathrow. View room specs and capacities.',
    images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
  },
  twitter: getTwitterMetadata({
    title: 'Private Function Room Near Heathrow | 10-50 Guests',
    description: 'Flexible private function room with 6 layouts, AV equipment and free parking near Heathrow. View room specs and capacities.',
    images: [DEFAULT_CORPORATE_IMAGE]
  }),
  alternates: {
    canonical: '/function-room-hire'
  }
}

// Function room schema for SEO
const functionRoomSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Function Room Hire at The Anchor",
  description: "Flexible function room and event space hire for all occasions. Room bookings for 10-50 guests, with larger events by enquiry, catering and free parking.",
  provider: {
    "@type": "Organization",
    name: "The Anchor",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Horton Road",
      addressLocality: "Stanwell Moor",
      addressRegion: "Surrey",
      postalCode: "TW19 6AQ"
    },
    telephone: "+441753682707"
  },
  areaServed: ["Stanwell Moor", "Staines", "Heathrow", "Ashford", "Feltham", "Sunbury", "Egham", "Surrey"],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "GBP",
    description: "Flexible venue hire pricing - tailored to your event"
  },
  potentialAction: {
    "@type": "CommunicateAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.the-anchor.pub/private-hire#enquiry",
      "actionPlatform": [
        "https://schema.org/DesktopWebPlatform",
        "https://schema.org/MobileWebPlatform"
      ]
    }
  }
}

export default function FunctionRoomHirePage() {
  return (
    <>
      <JsonLd data={[functionRoomSchema]} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.the-anchor.pub' },
          { name: 'Function Room Hire', url: 'https://www.the-anchor.pub/function-room-hire' }
        ]}
      />

      {/* Hero Section */}
      <HeroWrapper
        showContextStrip={true}
        route="/function-room-hire"
        title="Private Function Room Near Heathrow, 10 to 50 Guests"
        description="Ground-floor rooms with 6 layout options, AV equipment, climate control and wheelchair access. Free parking included."

        tags={[
          { label: " Multiple Spaces", variant: "default" },
          { label: " Flexible Pricing", variant: "success" },
          { label: " Free Parking", variant: "default" },
          { label: " Near Heathrow", variant: "success" }
        ]}
        primaryCta={
          <PhoneButton
            phone="01753 682707"
            source="function_room_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
             Call to Check Availability
          </PhoneButton>
        }
        secondaryCta={
          <>
            <Link href="#enquiry" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Enquire Online
              </Button>
            </Link>
            <Link href="https://wa.me/441753682707?text=Hi,%20I" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                 WhatsApp Enquiry
              </Button>
            </Link>
          </>
        }
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog &amp; family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">10-50 room bookings</span>
          </div>
        }
      />
      <TrustBar variant="private-hire" />

      {/* Google Rating */}
      <section className="bg-anchor-bg-card py-6 border-b border-anchor-gold/15">
        <Container>
          <p className="text-center text-sm text-anchor-cream-text/70"> <strong>Rated 4.6/5 on Google</strong> · Trusted for private events near Heathrow</p>
        </Container>
      </section>

      {/* Quick Summary */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-anchor-bg-raised border border-anchor-gold/15 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-anchor-gold-vivid mb-3">What Makes Our Function Rooms Work</h2>
            <div className="grid gap-3 md:grid-cols-2 text-anchor-cream-text/70">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold"></span>
                <span>Flexible spaces for 10-50 guests, with larger events by enquiry</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold"></span>
                <span>Free parking outside the ULEZ zone, ideal for corporate events</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold"></span>
                <span>In-house catering: buffets, two-course dinners or canapés</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold"></span>
                <span>AV support, microphones and hybrid meeting options available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Page Title */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <PageTitle className="text-center text-anchor-cream-text mb-8" seo={{ structured: true, speakable: true }}>
            Function Room Hire - Room Specs, Layouts &amp; Capacities at The Anchor
          </PageTitle>
        </div>
      </section>

      {/* Spaces Overview */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Flexible Spaces for Every Event"
            subtitle="From intimate gatherings to large celebrations"
          />

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            <div className="bg-anchor-bg-raised rounded-xl p-8 border border-anchor-gold/15">
              <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-4">The Dining Room</h3>
              <div className="mb-4">
                <span className="inline-block bg-anchor-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
                  20-80 guests
                </span>
              </div>
              <p className="text-anchor-cream-text/70 mb-4">
                Our main function space offers complete flexibility. Perfect for formal dinners,
                presentations, parties, or meetings. Can be configured to your exact requirements.
              </p>
              <ul className="space-y-2 text-anchor-cream-text/70">
                <li> Natural daylight with dimming options</li>
                <li> Climate controlled</li>
                <li> Direct access to facilities</li>
                <li> AV equipment available</li>
              </ul>
            </div>

            <div className="bg-anchor-bg-raised rounded-xl p-8 border border-anchor-gold/15">
              <h3 className="text-2xl font-bold text-anchor-gold-vivid mb-4">Exclusive Venue Hire</h3>
              <div className="mb-4">
                <span className="inline-block bg-anchor-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
                  80-200 guests
                </span>
              </div>
              <p className="text-anchor-cream-text/70 mb-4">
                Take over the entire venue for larger events. Includes all indoor spaces,
                bar area, and outdoor terrace (weather permitting). Perfect for big celebrations.
              </p>
              <ul className="space-y-2 text-anchor-cream-text/70">
                <li> Complete privacy</li>
                <li> Multiple spaces to utilize</li>
                <li> Full bar service</li>
                <li> Dedicated event team</li>
              </ul>
            </div>
          </div>

          <AlertBox
            variant="success"
            title="Great Value Venue Hire"
            content={
              <p className="text-center">
                We offer flexible venue hire pricing tailored to your event.
                Our competitive rates vary by day/time and we're always willing to discuss your needs.
                Contact us for a personalised quote.
              </p>
            }
          />
        </div>
      </section>

      {/* Layout Options */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Configure Your Space"
            subtitle="Multiple layout options to suit your event style"
          />

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="card-dark rounded-none text-center p-6">
              <div className="text-4xl mb-4"></div>
              <h3 className="font-bold text-lg mb-2">Banquet Style</h3>
              <p className="text-3xl font-bold text-anchor-gold mb-2">80</p>
              <p className="text-anchor-cream-text/70">Round tables of 8-10 for dining and socializing</p>
            </div>

            <div className="card-dark rounded-none text-center p-6">
              <div className="text-4xl mb-4"></div>
              <h3 className="font-bold text-lg mb-2">Theatre Style</h3>
              <p className="text-3xl font-bold text-anchor-gold mb-2">40</p>
              <p className="text-anchor-cream-text/70">Rows of chairs facing front for presentations</p>
            </div>

            <div className="card-dark rounded-none text-center p-6">
              <div className="text-4xl mb-4"></div>
              <h3 className="font-bold text-lg mb-2">Cocktail Reception</h3>
              <p className="text-3xl font-bold text-anchor-gold mb-2">150</p>
              <p className="text-anchor-cream-text/70">Standing reception with high tables</p>
            </div>

            <div className="card-dark rounded-none text-center p-6">
              <div className="text-4xl mb-4"></div>
              <h3 className="font-bold text-lg mb-2">Classroom Style</h3>
              <p className="text-3xl font-bold text-anchor-gold mb-2">60</p>
              <p className="text-anchor-cream-text/70">Tables and chairs for training/workshops</p>
            </div>

            <div className="card-dark rounded-none text-center p-6">
              <div className="text-4xl mb-4"></div>
              <h3 className="font-bold text-lg mb-2">Boardroom Style</h3>
              <p className="text-3xl font-bold text-anchor-gold mb-2">30</p>
              <p className="text-anchor-cream-text/70">Single large table for meetings</p>
            </div>

            <div className="card-dark rounded-none text-center p-6">
              <div className="text-4xl mb-4"></div>
              <h3 className="font-bold text-lg mb-2">Cabaret Style</h3>
              <p className="text-3xl font-bold text-anchor-gold mb-2">70</p>
              <p className="text-anchor-cream-text/70">Round tables with stage/presentation area</p>
            </div>
          </div>
        </div>
      </section>

      {/* Suitable For */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="One Venue, Endless Possibilities"
              subtitle="Our function rooms adapt to any event type"
            />

            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-anchor-bg-raised w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl"></span>
                </div>
                <h3 className="font-bold mb-2">Business Events</h3>
                <p className="text-sm text-anchor-cream-text/70">Meetings, training, conferences, AGMs</p>
              </div>

              <div className="text-center">
                <div className="bg-anchor-bg-raised w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl"></span>
                </div>
                <h3 className="font-bold mb-2">Celebrations</h3>
                <p className="text-sm text-anchor-cream-text/70">Birthdays, anniversaries, achievements</p>
              </div>

              <div className="text-center">
                <div className="bg-anchor-bg-raised w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl"></span>
                </div>
                <h3 className="font-bold mb-2">Memorial Services</h3>
                <p className="text-sm text-anchor-cream-text/70">Wakes, celebrations of life, gatherings</p>
              </div>

              <div className="text-center">
                <div className="bg-anchor-bg-raised w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl"></span>
                </div>
                <h3 className="font-bold mb-2">Seasonal Events</h3>
                <p className="text-sm text-anchor-cream-text/70">Christmas parties, New Year celebrations</p>
              </div>

              <div className="text-center">
                <div className="bg-anchor-bg-raised w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl"></span>
                </div>
                <h3 className="font-bold mb-2">Entertainment</h3>
                <p className="text-sm text-anchor-cream-text/70">Quiz nights, hosted events, themed nights (see /whats-on)</p>
              </div>

              <div className="text-center">
                <div className="bg-anchor-bg-raised w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">‍‍‍</span>
                </div>
                <h3 className="font-bold mb-2">Community Events</h3>
                <p className="text-sm text-anchor-cream-text/70">Club meetings, fundraisers, social gatherings</p>
              </div>

              <div className="text-center">
                <div className="bg-anchor-bg-raised w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl"></span>
                </div>
                <h3 className="font-bold mb-2">Educational</h3>
                <p className="text-sm text-anchor-cream-text/70">Workshops, seminars, training days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Why Choose The Anchor for Your Function"
          />

          <FeatureGrid
            columns={3}
            features={[
              {
                icon: "",
                title: "No Hidden Costs",
                description: "Flexible pricing, no hidden charges, great value. Let's discuss your needs.",
                className: "text-center"
              },
              {
                icon: "",
                title: "Free Parking",
                description: "20 spaces on-site saves your guests money and hassle",
                className: "text-center"
              },
              {
                icon: "",
                title: "Prime Location",
                description: "7 mins from Heathrow, 3 mins from M25, outside ULEZ zone",
                className: "text-center"
              },
              {
                icon: "",
                title: "Flexible Catering",
                description: "From tea & biscuits to five-course dinners - your choice",
                className: "text-center"
              },
              {
                icon: "",
                title: "Full Support",
                description: "Experienced team handles setup, service, and cleanup",
                className: "text-center"
              },
              {
                icon: "",
                title: "Fully Accessible",
                description: "Ground floor venue with wheelchair access throughout",
                className: "text-center"
              }
            ]}
          />
        </div>
      </section>

      {/* What's Included */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Everything You Need Included"
              subtitle="Professional facilities and attentive service as standard"
            />

            <InfoBoxGrid
              columns={2}
              boxes={[
                {
                  title: "Facilities & Equipment",
                  content: (
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span>Tables and chairs in your chosen layout</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span>White table linens and napkins</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span>Background music system</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span>Microphone for speeches</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span>Basic lighting control</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span>Heating and air conditioning</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span>Cloakroom facilities</span>
                      </li>
                    </ul>
                  ),
                  variant: "default"
                },
                {
                  title: "Service & Support",
                  content: (
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span>Pre-event planning consultation</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span>Dedicated event coordinator</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span>Professional service team</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span>Setup and breakdown included</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span>Flexible access times</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span>Supplier coordination</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-anchor-gold-vivid"></span>
                        <span>Post-event cleanup</span>
                      </li>
                    </ul>
                  ),
                  variant: "default"
                }
              ]}
            />
          </div>
        </div>
      </section>

      {/* Pricing Structure */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Simple, Transparent Pricing"
              subtitle="Hourly venue hire tailored to your event"
            />

            <div className="card-dark rounded-none p-8 mb-8">
              <h3 className="text-xl font-bold text-anchor-gold-vivid mb-6 text-center">Venue Hire Rates</h3>
              <div className="text-center">
                <p className="text-3xl font-bold text-anchor-gold mb-2">From £25/hr</p>
                <p className="text-anchor-cream-text/70 mb-4">for our private dining room</p>
                <p className="text-anchor-cream-text/70">
                  Venue hire is charged at an hourly rate, with pricing based on the space you need, the day of the week, and your event requirements. Catering and drinks are quoted separately so you only pay for what you need.
                </p>
              </div>
            </div>

            <AlertBox
              variant="info"
              title="Get a Personalised Quote"
              content={
                <div>
                  <p className="mb-3">
                    Every event is different, so we tailor pricing to your needs. Tell us about your event and
                    we'll put together a clear, no-obligation quote covering venue hire, catering and any extras.
                  </p>
                  <p className="font-semibold text-center">
                    Call us on 01753 682707 or <a href="/private-hire#enquiry" className="text-anchor-gold underline">submit an enquiry online</a>.
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="Perfectly Located for Your Guests"
              subtitle="Easy access from all directions with free parking"
            />

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-anchor-bg-raised rounded-xl p-6 border border-anchor-gold/15">
                <h3 className="font-bold text-lg mb-4">By Car</h3>
                <ul className="space-y-2 text-anchor-cream-text/70 text-left">
                  <li> M25 Junction 14: 3 minutes</li>
                  <li> Heathrow T5: 7 minutes</li>
                  <li> Staines: 8 minutes</li>
                  <li> Windsor: 15 minutes</li>
                  <li> Central London: 45 minutes</li>
                  <li className="pt-2 font-semibold"> 20 free parking spaces</li>
                </ul>
              </div>

              <div className="bg-anchor-bg-raised rounded-xl p-6 border border-anchor-gold/15">
                <h3 className="font-bold text-lg mb-4">Public Transport</h3>
                <ul className="space-y-2 text-anchor-cream-text/70 text-left">
                  <li> Local bus routes from Staines</li>
                  <li> Staines station: 10 mins by taxi</li>
                  <li> Heathrow shuttle options</li>
                  <li> Uber/taxi readily available</li>
                  <li className="pt-2 font-semibold"> We can help arrange transport</li>
                </ul>
              </div>
            </div>

            <QuickInfoGrid
              items={[
                { icon: "", title: "Outside ULEZ zone - no charges" },
                { icon: "", title: "Well-lit car park" },
                { icon: "", title: "Level access from parking" },
                { icon: "", title: "Safe residential area" }
              ]}
              columns={4}
            />
          </div>
        </div>
      </section>

      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl bg-anchor-bg-raised border border-anchor-gold/15 p-5 mb-6">
              <h3 className="font-semibold text-anchor-gold-vivid mb-3">Which space suits your event?</h3>
              <ul className="space-y-2 text-sm text-anchor-cream-text/70">
                <li>• <strong>10-50 guests</strong>, our private dining room, ideal for dinners and celebrations</li>
                <li>• <strong>50+ guests</strong>, larger room, garden or full venue hire by enquiry</li>
              </ul>
            </div>
            <div className="mb-6">
              <ValueProofStrip variant="private-hire" />
            </div>
            <div className="mb-4">
              <RegretReduction variant="enquiry" />
            </div>
          </div>
        </div>
      </section>

      <PrivateBookingSection eventType="Other" />

      <InternalLinkingSection
        title="Next Steps For Your Event"
        links={[
          { href: '/our-pub', title: 'See Inside The Anchor', description: 'Photos of the bar, dining room, garden and games area' },
          { href: '/private-hire#enquiry', title: 'Submit Event Enquiry', description: 'Tell us about your celebration or meeting' },
          { href: '/corporate-events', title: 'Corporate Event Packages', description: 'See delegate rates and meeting add-ons' },
          { href: '/private-party-venue', title: 'Private Party Venue', description: 'Plan birthdays, wakes and anniversaries' },
          { href: '/food-menu', title: 'Menu Ideas', description: 'Select canapés, buffets or two-course meals' }
        ]}
        className="section-spacing-md"
      />

      <OrganicSearchClusterLinks
        cluster="privateRooms"
        currentPath="/function-room-hire"
        title="Private room hire near Heathrow and Staines"
        intro="Find the right event route from private hire, room layouts, catering packages and corporate event options."
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "What exactly is included in function room hire?",
            answer: "Everything you need is included: the space configured to your requirements, tables, chairs, linens, basic AV equipment (microphone, music system), dedicated staff, setup/breakdown, and cleaning. Venue hire is charged at an hourly rate, and catering is quoted separately."
          },
          {
            question: "How does your venue hire pricing work?",
            answer: "Venue hire is charged at an hourly rate, from £25/hr for our private dining room. Rates vary by day, time, and the space required. Catering and drinks are quoted separately. Contact us for a personalised quote tailored to your event."
          },
          {
            question: "Can I view the function rooms before booking?",
            answer: "Absolutely! We encourage site visits so you can see the spaces and discuss layout options. Call us on 01753 682707 to arrange a viewing at your convenience."
          },
          {
            question: "What catering options are available?",
            answer: "We offer everything from tea and biscuits to five-course dinners. Options include finger buffets, hot fork buffets, formal plated meals, canapés, BBQs, and more. All dietary requirements can be accommodated. We'll create a menu to match your event and budget."
          },
          {
            question: "Can I bring my own decorations or entertainment?",
            answer: "Yes! You're welcome to decorate the space and bring entertainment like DJs or live bands. We just ask that decorations don't damage walls/ceilings. We can also arrange decorations and entertainment through our suppliers if you prefer."
          },
          {
            question: "What are your minimum guest numbers?",
            answer: "We can accommodate groups from 10 people upwards. For exclusive use of the entire venue, we typically require 80+ guests. Smaller groups are perfectly welcome in our function room."
          },
          {
            question: "Is there disabled access to the function rooms?",
            answer: "Yes, we have full wheelchair access throughout the venue, including to all function spaces and facilities. Our car park has level access to the entrance."
          },
          {
            question: "How far in advance should I book?",
            answer: "We recommend booking 4-8 weeks ahead for weekends and popular dates. Weekday events often have more flexibility. December books up particularly early. The sooner you enquire, the more likely we can accommodate your preferred date."
          }
        ]}
        className="bg-anchor-bg"
      />

      {/* CTA Section */}
      <section className="bg-anchor-bg-raised border-t border-anchor-gold/15 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-anchor-gold-vivid mb-6">
              Check Availability for Your Function
            </h2>
            <p className="text-xl text-anchor-cream-text/70 mb-8">
              Competitive rates • Free parking • Professional service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookTableButton
                source="function_room_cta"
                size="lg"
                variant="primary"
                context="function_room"
              >
                 Book Function Room
              </BookTableButton>
              <Link href="tel:+441753682707">
                <Button size="lg" variant="secondary">
                   Call: 01753 682707
                </Button>
              </Link>
              <Link href="https://wa.me/441753682707?text=Hi,%20I'd%20like%20to%20enquire%20about%20function%20room%20hire" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="secondary">
                   WhatsApp Us
                </Button>
              </Link>
              <Link href="mailto:manager@the-anchor.pub?subject=Function Room Hire Enquiry">
                <Button size="lg" variant="secondary">
                   Email Enquiry
                </Button>
              </Link>
            </div>
            <div className="mt-8 bg-anchor-bg-card border border-anchor-gold/15 rounded-xl p-6 max-w-2xl mx-auto">
              <p className="text-anchor-cream-text/70 text-center">
                <strong>Viewing Welcome</strong><br />
                Pop in during opening hours or arrange a specific viewing time<br />
                We'll respond to enquiries within 2 hours
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

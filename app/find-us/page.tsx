import Image from 'next/image'
import Link from 'next/link'
import { Button, Container, Section, Card, CardBody, Grid, Alert } from '@/components/ui'
import { StatusBar } from '@/components/layout/StatusBar'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Metadata } from 'next'
import { BusinessHours } from '@/components/BusinessHours'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { findUsPlaceSchema, generateBreadcrumbSchema, generateHowToDirectionsSchema } from '@/lib/enhanced-schemas'
import { CTASection, SectionHeader, FeatureGrid, InfoBoxGrid } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneLink } from '@/components/PhoneLink'
import { EmailLink } from '@/components/EmailLink'
import { PhoneButton } from '@/components/PhoneButton'
import { DirectionsButton } from '@/components/DirectionsButton'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { SpeakableContent } from '@/components/voice/SpeakableContent'
import { parkingFacilitySchema } from '@/lib/schemas/parking'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: 'Find The Anchor Pub - Directions & Free Parking Near Heathrow Terminals',
  description: 'Get step-by-step directions from Heathrow Terminal 5, Terminal 3, Terminal 2 and Terminal 4 to The Anchor on Horton Road. Seven minutes from T5 with free parking and easy access from M25, Staines and Ashford.',
  keywords: 'find the anchor pub, directions to the anchor heathrow, heathrow terminal 5 to pub, pub with free parking stanwell moor, horton road pub location',
  openGraph: {
    title: 'Find The Anchor Pub Near Heathrow Terminals',
    description: 'Driving and public transport directions from every Heathrow terminal to The Anchor on Horton Road with free parking details.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
  },
  twitter: getTwitterMetadata({
    title: 'Find The Anchor Pub Near Heathrow',
    description: 'See directions from Heathrow Terminal 5, Terminal 3 and Terminal 4 plus free parking info for The Anchor in Stanwell Moor.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/find-us'
  }
}

export default function FindUsPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Find Us', url: '/find-us' }
  ])
  
  const howToFromHeathrowSchema = generateHowToDirectionsSchema(
    "Heathrow Terminal 5",
    "The Anchor",
    [
      "Exit Terminal 5 following signs for M25/A30",
      "At roundabout, take A3044 towards Staines",
      "Continue straight for 1.5 miles through Stanwell",
      "Turn left onto Horton Road",
      "The Anchor is 200 yards on your right",
      "Free parking available on site"
    ]
  )


  return (
    <>
      <SpeakableSchema />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([findUsPlaceSchema, breadcrumbSchema, howToFromHeathrowSchema, parkingFacilitySchema]) }}
      />
      {/* Hero Section */}
      <HeroWrapper
        route="/find-us"
        title="Find The Anchor"
        description="Easy to find, hard to leave!"
        variant="default"
        tags={[
          { label: "🏡 Independent village pub minutes from Heathrow", variant: "default" },
          { label: "✈️ Horton Road plane-spotting area", variant: "primary" },
          { label: "🚗 Free Parking", variant: "success" }
        ]}
        primaryCta={
          <DirectionsButton
            href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ"
            source="find_us_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            📍 Get Directions
          </DirectionsButton>
        }
        secondaryCta={
          <PhoneButton 
            phone="01753682707" 
            source="find_us_hero"
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
          >
            📞 Call Us
          </PhoneButton>
        }
      />

      {/* Page Title for SEO */}
      <Section background="white" spacing="sm">
        <Container>
          <PageTitle 
            className="text-center text-anchor-green"
            seo={{ structured: true, speakable: true }}
          >
            Find The Anchor - FREE Parking & Easy Directions from Heathrow
          </PageTitle>
        </Container>
      </Section>

      {/* Quick Info */}
      <Section background="white" spacing="md" className="bg-anchor-cream">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">📍</div>
              <p className="font-bold text-anchor-green">Stanwell Moor</p>
              <p className="text-sm text-gray-700">Surrey TW19 6AQ</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center border-2 border-green-200">
              <div className="text-3xl mb-2">🆓</div>
              <p className="font-bold text-green-700">FREE PARKING</p>
              <p className="text-sm text-green-600 font-semibold">For patrons • 20 spaces</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">✈️</div>
              <p className="font-bold text-anchor-green">Near Heathrow</p>
              <p className="text-sm text-gray-700">7-12 minutes</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">🚌</div>
              <p className="font-bold text-anchor-green">Bus Routes</p>
              <p className="text-sm text-gray-700">442</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">📶</div>
              <p className="font-bold text-anchor-green">Free WiFi</p>
              <p className="text-sm text-gray-700">Throughout the pub</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">🎱</div>
              <p className="font-bold text-anchor-green">Pool & Darts</p>
              <p className="text-sm text-gray-700">Games available</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">💻</div>
              <p className="font-bold text-anchor-green">Work Friendly</p>
              <p className="text-sm text-gray-700">Tables with plugs</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">🎵</div>
              <p className="font-bold text-anchor-green">Entertainment</p>
              <p className="text-sm text-gray-700">Jukebox & more</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">💳</div>
              <p className="font-bold text-anchor-green">Payment</p>
              <p className="text-sm text-gray-700">Cash & all cards inc. Amex</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Heathrow Terminal Directions */}
      <Section background="white" spacing="md">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Heathrow Terminal to Pub in Under 12 Minutes"
              subtitle="Plan your route from any Heathrow terminal with taxi times, parking tips and public transport options."
            />
            <FeatureGrid
              columns={2}
              features={[
                {
                  icon: "✈️",
                  title: "Terminal 5 → The Anchor (7 mins)",
                  description: (
                    <ul className="list-disc list-inside text-gray-700 space-y-2 text-left">
                      <li>Follow signs to exit via A3044 (Stanwell Moor Road)</li>
                      <li>Turn left onto Horton Road; pub is 200 yards on right</li>
                      <li>Taxi fare ~£18, free parking on arrival saves £20+</li>
                    </ul>
                  ),
                  variant: "default",
                  className: "bg-white rounded-2xl p-6 shadow-sm"
                },
                {
                  icon: "🧳",
                  title: "Terminals 2 & 3 (11 mins)",
                  description: (
                    <ul className="list-disc list-inside text-gray-700 space-y-2 text-left">
                      <li>Head north on Tunnel Road W → M4 Spur → A4 → A3044</li>
                      <li>Avoid multi-storey car parks; follow sat nav to TW19 6AQ</li>
                      <li>Ideal for pre-flight meals before security queues</li>
                    </ul>
                  ),
                  variant: "default",
                  className: "bg-white rounded-2xl p-6 shadow-sm"
                },
                {
                  icon: "🚖",
                  title: "Terminal 4 (12 mins)",
                  description: (
                    <ul className="list-disc list-inside text-gray-700 space-y-2 text-left">
                      <li>Take Southern Perimeter Rd → Stanwell Moor Rd</li>
                      <li>Taxis and rideshares average £22 each way</li>
                      <li>Plenty of time for a meal before evening departures</li>
                    </ul>
                  ),
                  variant: "default",
                  className: "bg-white rounded-2xl p-6 shadow-sm"
                },
                {
                  icon: "🚌",
                  title: "442 Bus & Hotel Shuttles",
                  description: (
                    <ul className="list-disc list-inside text-gray-700 space-y-2 text-left">
                      <li>442 stops outside the pub connecting Staines ↔ Heathrow</li>
                      <li>Premier Inn T5 guests can walk in 15 minutes or take local taxi</li>
                      <li>Ask your driver for The Anchor, Horton Road, Stanwell Moor</li>
                    </ul>
                  ),
                  variant: "default",
                  className: "bg-white rounded-2xl p-6 shadow-sm"
                }
              ]}
            />
          </div>
        </Container>
      </Section>

      {/* Address & Contact */}
      <Section background="white" spacing="md">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <SectionHeader
                  title="Our Address"
                />
                <div className="bg-anchor-cream rounded-2xl p-8">
                  <SpeakableContent selector="contact-info" priority="high">
                    <address className="not-italic text-lg space-y-2">
                      <p className="font-bold text-xl text-anchor-green">The Anchor</p>
                      <p>Horton Road</p>
                      <p>Stanwell Moor</p>
                      <p>Surrey</p>
                      <p className="font-bold">TW19 6AQ</p>
                    </address>
                    
                    <div className="mt-6 pt-6 border-t border-gray-300">
                      <p className="font-bold text-anchor-green mb-3">Contact</p>
                      <p className="mb-2">
                        <PhoneLink 
                          phone="01753682707" 
                          source="find_us_contact"
                          className="text-anchor-gold hover:text-anchor-gold-light"
                        />
                      </p>
                      <p className="mb-2">
                        <WhatsAppLink
                          phone="01753682707"
                          source="find_us_page"
                          className="text-anchor-gold hover:text-anchor-gold-light"
                          showIcon={false}
                        >
                          💬 WhatsApp: 01753 682707
                        </WhatsAppLink>
                      </p>
                      <p>
                        <EmailLink
                          email="manager@the-anchor.pub"
                          source="find_us_contact"
                          className="text-anchor-gold hover:text-anchor-gold-light"
                          showIcon={true}
                        />
                      </p>
                    </div>
                  </SpeakableContent>
                </div>
              </div>
              
              <div>
                <SectionHeader
                  title="Landmarks"
                />
                <div className="bg-anchor-sand/30 rounded-2xl p-8">
                  <p className="text-lg font-semibold text-anchor-green mb-4">
                    Look out for these landmarks:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <span className="text-anchor-gold">🏘️</span>
                      <span>Centre of Stanwell Moor village</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-anchor-gold">✈️</span>
                      <span>Under the Heathrow flight path</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-anchor-gold">🚗</span>
                      <span>Free parking for patrons (20 spaces)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-anchor-gold">🌳</span>
                      <span>Traditional pub building with garden</span>
                    </li>
                  </ul>
                  
                  <div className="mt-6 p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-700 italic">
                      "If you can hear the planes, you're close!"
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Business Hours */}
            <div className="mt-12">
              <SectionHeader
                title="Opening Hours"
              />
              <SpeakableContent selector="opening-hours" priority="high">
                <div className="bg-anchor-green/95 rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
                  <BusinessHours variant="condensed" showKitchen={true} />
                </div>
              </SpeakableContent>
            </div>
          </div>
        </Container>
      </Section>

      {/* Directions */}
      <Section background="gray" spacing="md">
        <Container>
          <SectionHeader
            title="Directions from Popular Locations"
          />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* From M25 */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-xl text-anchor-green mb-4">From M25</h3>
              <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                <li>Exit Junction 14</li>
                <li>Take A3113 towards Stanwell Moor</li>
                <li>At roundabout, continue straight</li>
                <li>Turn left at Horton Road</li>
                <li>The Anchor is on your right</li>
              </ol>
              <p className="mt-4 text-sm text-gray-700">Journey time: 5 minutes from M25</p>
            </div>

            {/* From Staines */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-xl text-anchor-green mb-4">From Staines</h3>
              <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                <li>Head south on A30</li>
                <li>Turn right onto A3044</li>
                <li>Continue to Stanwell Moor</li>
                <li>Turn right onto Horton Road</li>
                <li>The Anchor is on your right</li>
              </ol>
              <p className="mt-4 text-sm text-gray-700">Journey time: 10 minutes</p>
            </div>

            {/* From Windsor */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-xl text-anchor-green mb-4">From Windsor</h3>
              <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                <li>Take A308 towards Staines</li>
                <li>Join M25 at Junction 13</li>
                <li>Exit at Junction 14</li>
                <li>Follow signs to Stanwell Moor</li>
                <li>Turn left at Horton Road</li>
              </ol>
              <p className="mt-4 text-sm text-gray-700">Journey time: 20 minutes</p>
            </div>

            {/* From Ashford */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-xl text-anchor-green mb-4">From Ashford</h3>
              <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                <li>Head north on A30</li>
                <li>Turn left onto A3044</li>
                <li>Continue through Stanwell</li>
                <li>Turn left onto Horton Road</li>
                <li>The Anchor is on your right</li>
              </ol>
              <p className="mt-4 text-sm text-gray-700">Journey time: 10 minutes</p>
            </div>

            {/* From Heathrow */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-xl text-anchor-green mb-4">From Heathrow</h3>
              <p className="text-gray-700 mb-3">See our detailed terminal guides:</p>
              <ul className="space-y-2">
                <li><Link href="/near-heathrow/terminal-2" className="text-anchor-gold hover:text-anchor-gold-light">→ From Terminal 2</Link></li>
                <li><Link href="/near-heathrow/terminal-3" className="text-anchor-gold hover:text-anchor-gold-light">→ From Terminal 3</Link></li>
                <li><Link href="/near-heathrow/terminal-4" className="text-anchor-gold hover:text-anchor-gold-light">→ From Terminal 4</Link></li>
                <li><Link href="/near-heathrow/terminal-5" className="text-anchor-gold hover:text-anchor-gold-light">→ From Terminal 5</Link></li>
              </ul>
            </div>

            {/* By Public Transport */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-xl text-anchor-green mb-4">By Bus</h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>Route 442:</strong> Staines - Stanwell Moor - Heathrow</p>
                <p className="text-sm">Ask driver for The Anchor stop</p>
                <p className="text-sm text-green-600 font-semibold">✓ ULEZ Free Route</p>
              </div>
              <p className="mt-4 text-sm text-gray-700">Regular service throughout the day</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Parking Information */}
      <Section background="white" spacing="md">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="🆓 FREE Parking for Patrons - 20 Spaces Available!"
              subtitle="Complimentary parking while you're enjoying our food and drinks"
            />
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-4xl mb-3">🆓</div>
                  <h3 className="font-bold text-green-700 mb-2">ALWAYS FREE</h3>
                  <p className="text-gray-700">Unlike Heathrow (£7.50/hour!)</p>
                </div>
                <div>
                  <div className="text-4xl mb-3">⏰</div>
                  <h3 className="font-bold text-green-700 mb-2">NO TIME LIMITS</h3>
                  <p className="text-gray-700">Stay as long as you like!</p>
                </div>
                <div>
                  <div className="text-4xl mb-3">🚗</div>
                  <h3 className="font-bold text-green-700 mb-2">20 SPACES</h3>
                  <p className="text-gray-700">Well-lit with CCTV coverage</p>
                </div>
              </div>
              <div className="mt-6 bg-white rounded-lg p-4">
                <p className="text-green-700 font-bold text-lg">
                  💰 Compare: Heathrow T5 Short Stay = £7.50/hour | The Anchor = FREE!
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Perfect for picking up/dropping off at Heathrow without the parking fees!
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Book Your Visit Section */}
      <Section className="bg-anchor-green" spacing="md">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="Found us? Book your visit"
              subtitle="Reserve your table now and enjoy The Anchor experience"
              className="text-white"
            />
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Ready to Book?</h3>
              <p className="text-white/90 mb-8 text-lg">
                Book your table online through our booking system or give us a call.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/book-table">
                  <Button
                    variant="primary"
                    size="lg"
                    className="!bg-white !text-anchor-green hover:!bg-white/90"
                  >
                    📅 Book a Table Online
                  </Button>
                </Link>
                <PhoneButton
                  phone="01753682707"
                  source="find_us_booking_alternative"
                  variant="outline"
                  size="lg"
                  className="!bg-transparent !text-white !border-white hover:!bg-white/10"
                >
                  📞 Call: 01753 682707
                </PhoneButton>
              </div>
              
              {/* Quick Info */}
              <div className="grid md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-white/20">
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white mb-3">Good to Know</h4>
                  <div className="flex items-start gap-3">
                    <span className="text-anchor-gold">🚗</span>
                    <p className="text-white/90 text-sm">Free parking for patrons</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-anchor-gold">🍴</span>
                    <p className="text-white/90 text-sm">Kitchen closed Mondays</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-anchor-gold">👨‍👩‍👧‍👦</span>
                    <p className="text-white/90 text-sm">Children welcome until 9pm</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-anchor-gold">🐕</span>
                    <p className="text-white/90 text-sm">Dogs welcome in bar & garden</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Opening Hours</h4>
                  <BusinessHours variant="dark" showKitchen={false} />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Facilities */}
      <Section background="white" spacing="md" className="bg-anchor-sand/20">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Our Facilities"
            />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-anchor-green mb-6">Entertainment & Games</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">🎱</span>
                    <span><strong>Pool Table</strong> - Challenge your friends</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">🎯</span>
                    <span><strong>Darts Board</strong> - Professional setup with oche</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">🎵</span>
                    <span><strong>Jukebox</strong> - Wide selection of music</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">🎰</span>
                    <span><strong>Fruit Machine</strong> - Try your luck (18+)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">📺</span>
                    <span><strong>4 TVs</strong> - Terrestrial channels for sports & news</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-anchor-green mb-6">Work & Connectivity</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">📶</span>
                    <span><strong>Free WiFi</strong> - Fast, reliable, no time limits</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">🔌</span>
                    <span><strong>Power Points</strong> - Tables with plugs in dining room</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">☕</span>
                    <span><strong>Quiet Weekdays</strong> - Perfect for remote work</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">🚗</span>
                    <span><strong>Free Parking for Patrons</strong> - While you visit</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">🧳</span>
                    <span><strong>Luggage Storage</strong> - Safe storage for travelers</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-anchor-green mb-6 text-center">Guest Services</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <span className="text-anchor-gold text-xl mt-1">🐕</span>
                  <div>
                    <strong>Dog Friendly</strong>
                    <p className="text-sm text-gray-700">Water bowls available</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-anchor-gold text-xl mt-1">♿</span>
                  <div>
                    <strong>Accessible Entry</strong>
                    <p className="text-sm text-gray-700">Ramp available at back door</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-anchor-gold text-xl mt-1">💳</span>
                  <div>
                    <strong>All Cards Accepted</strong>
                    <p className="text-sm text-gray-700">Including American Express</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-700">
                <strong className="text-anchor-green">Digital Nomad Friendly:</strong> Our dining room is equipped with tables 
                featuring power points, making it perfect for remote workers and digital nomads. Combined with free WiFi 
                and a quiet weekday atmosphere, it's an ideal workspace near Heathrow.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ Section */}
      <FAQAccordionWithSchema 
        faqs={[
          {
            question: "Is there parking at The Anchor?",
            answer: "Yes, The Anchor offers free parking for patrons while they're visiting the pub. Our car park has 20 spaces available."
          },
          {
            question: "How far is The Anchor from Heathrow Airport?",
            answer: "The Anchor is just 7 minutes from Terminal 5, 11 minutes from Terminals 2 & 3, and 12 minutes from Terminal 4. We're the closest traditional British pub to Heathrow Airport."
          },
          {
            question: "What areas does The Anchor serve?",
            answer: "We serve Stanwell Moor, Staines, Ashford, Feltham, Bedfont, and surrounding Surrey areas. We're also convenient for all Heathrow terminals and nearby hotels."
          },
          {
            question: "Is The Anchor accessible by public transport?",
            answer: "Yes! The 442 bus runs between Staines, Stanwell Moor and Heathrow, stopping nearby. This is a ULEZ-free route, making it an environmentally friendly option."
          },
          {
            question: "Can I walk to The Anchor from nearby hotels?",
            answer: "If you're staying at the Premier Inn Heathrow Terminal 5, we're about a 15-minute walk. From other Heathrow hotels, we recommend a taxi (around £25) or take the 442 bus which stops directly outside the pub."
          },
          {
            question: "What's the best way to find The Anchor?",
            answer: "If using sat nav, our postcode is TW19 6AQ. From the A3044, turn onto Horton Road and we're on your right with free parking available."
          },
          {
            question: "Is The Anchor wheelchair accessible?",
            answer: "The Anchor has a wheelchair ramp available at the back door for step-free access to the main areas. Please note that we do not currently have accessible toilet facilities."
          },
          {
            question: "What payment methods does The Anchor accept?",
            answer: "We accept cash and all major credit and debit cards, including American Express. Whether you're enjoying a meal, drinks, or booking an event, we make payment convenient with multiple options available."
          }
        ]}
        className="bg-gray-50"
      />

      {/* Map CTA */}
      <CTASection
        title="Get Directions"
        description="Use your preferred map service to navigate directly to The Anchor"
        buttons={[
          {
            text: "📍 Google Maps",
            href: "https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ",
            variant: "white",
            external: true,
            isDirections: true,
            directionsSource: "find_us_cta_google"
          },
          {
            text: "📍 Apple Maps",
            href: "https://maps.apple.com/?q=The+Anchor+Stanwell+Moor+TW19+6AQ",
            variant: "white",
            external: true,
            isDirections: true,
            directionsSource: "find_us_cta_apple"
          },
          {
            text: "📍 Waze",
            href: "https://www.waze.com/ul?q=The+Anchor+Stanwell+Moor+TW19+6AQ",
            variant: "white",
            external: true,
            isDirections: true,
            directionsSource: "find_us_cta_waze"
          }
        ]}
        variant="green"
      >
        <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
          <p className="font-semibold mb-2">Sat Nav Postcode</p>
          <p className="text-2xl font-bold">TW19 6AQ</p>
        </div>
      </CTASection>
    </>
  )
}

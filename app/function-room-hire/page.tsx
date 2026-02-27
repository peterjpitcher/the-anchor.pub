import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { CONTACT, BRAND } from '@/lib/constants'
import { CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox, QuickInfoGrid } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneButton } from '@/components/PhoneButton'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_CORPORATE_IMAGE } from '@/lib/image-fallbacks'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { JsonLd } from '@/components/JsonLd'
import { PrivateBookingSection } from '@/components/PrivateBookingSection'

export const metadata: Metadata = {
  title: 'Function Room Hire Near Heathrow & Staines | The Anchor',
  description: 'Hire flexible function rooms near Heathrow and Staines for 10-200 guests. The Anchor offers free parking, tailored catering and AV support for meetings, parties and celebrations.',
  keywords: 'function room hire staines, private room hire staines, heathrow function room hire, venue hire near terminal 5, event space with parking, flexible venue near m25',
  openGraph: {
    title: 'Heathrow Function Room Hire - The Anchor Stanwell Moor',
    description: 'Flexible venue with free parking, catering and AV support for meetings and celebrations near Heathrow.',
    images: [{ url: DEFAULT_CORPORATE_IMAGE, width: 1200, height: 630, alt: 'Private hire venue at The Anchor near Heathrow Airport' }],
  },
  twitter: getTwitterMetadata({
    title: 'Heathrow Function Room Hire - The Anchor Stanwell Moor',
    description: 'Flexible venue with free parking, catering and AV support for meetings and celebrations near Heathrow.',
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
  description: "Flexible function room and event space hire for all occasions. Multiple rooms available for 10-200 guests with catering and free parking.",
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
  }
}

export default function FunctionRoomHirePage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Private Hire & Events', url: '/private-hire' },
    { name: 'Function Room Hire', url: '/function-room-hire' }
  ])

  return (
    <>
      <JsonLd data={[functionRoomSchema, breadcrumbSchema]} />
      
      {/* Hero Section */}
      <HeroWrapper
        route="/function-room-hire"
        title="Function Room Hire"
        description="Versatile event spaces with flexible pricing"
       
        tags={[
          { label: "🏢 Multiple Spaces", variant: "default" },
          { label: "💷 Flexible Pricing", variant: "success" },
          { label: "🚗 Free Parking", variant: "default" },
          { label: "📍 Near Heathrow", variant: "success" }
        ]}
        primaryCta={
          <BookTableButton
            source="function_room_hero"
            variant="primary"
            size="lg"
            context="function_room"
            className="w-full sm:w-auto"
          >
            🏢 Book Function Room
          </BookTableButton>
        }
        secondaryCta={
          <>
            <PhoneButton
              phone="01753 682707"
              source="function_room_hero"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              📞 Call: 01753 682707
            </PhoneButton>
            <Link href="https://wa.me/441753682707?text=Hi,%20I" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button 
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                💬 WhatsApp Enquiry
              </Button>
            </Link>
          </>
        }
      />

      {/* Quick Summary */}
      <section className="section-spacing bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-anchor-cream/40 border border-anchor-cream rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-anchor-green mb-3">What Makes Our Function Rooms Work</h2>
            <div className="grid gap-3 md:grid-cols-2 text-gray-700">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold">👥</span>
                <span>Flexible spaces for 10-200 guests with breakout areas</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold">🅿️</span>
                <span>Free parking outside the ULEZ zone, ideal for corporate events</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold">🍽️</span>
                <span>In-house catering: buffets, two-course dinners or canapés</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-anchor-gold">🎤</span>
                <span>AV support, microphones and hybrid meeting options available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Page Title */}
      <section className="section-spacing bg-white">
        <div className="container mx-auto px-4">
          <PageTitle className="text-center text-anchor-green mb-8" seo={{ structured: true, speakable: true }}>
            Function Room Hire - Private Events at The Anchor
          </PageTitle>
        </div>
      </section>

      {/* Spaces Overview */}
      <section className="section-spacing bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Flexible Spaces for Every Event"
            subtitle="From intimate gatherings to large celebrations"
          />
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-anchor-green mb-4">The Dining Room</h3>
              <div className="mb-4">
                <span className="inline-block bg-anchor-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
                  20-80 guests
                </span>
              </div>
              <p className="text-gray-700 mb-4">
                Our main function space offers complete flexibility. Perfect for formal dinners, 
                presentations, parties, or meetings. Can be configured to your exact requirements.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Natural daylight with dimming options</li>
                <li>✓ Climate controlled</li>
                <li>✓ Direct access to facilities</li>
                <li>✓ AV equipment available</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-anchor-green mb-4">Exclusive Venue Hire</h3>
              <div className="mb-4">
                <span className="inline-block bg-anchor-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
                  80-200 guests
                </span>
              </div>
              <p className="text-gray-700 mb-4">
                Take over the entire venue for larger events. Includes all indoor spaces, 
                bar area, and outdoor terrace (weather permitting). Perfect for big celebrations.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Complete privacy</li>
                <li>✓ Multiple spaces to utilize</li>
                <li>✓ Full bar service</li>
                <li>✓ Dedicated event team</li>
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
      <section className="section-spacing bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Configure Your Space"
            subtitle="Multiple layout options to suit your event style"
          />
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl mb-4">🪑</div>
              <h3 className="font-bold text-lg mb-2">Banquet Style</h3>
              <p className="text-3xl font-bold text-anchor-gold mb-2">80</p>
              <p className="text-gray-600">Round tables of 8-10 for dining and socializing</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="font-bold text-lg mb-2">Theatre Style</h3>
              <p className="text-3xl font-bold text-anchor-gold mb-2">40</p>
              <p className="text-gray-600">Rows of chairs facing front for presentations</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl mb-4">🥂</div>
              <h3 className="font-bold text-lg mb-2">Cocktail Reception</h3>
              <p className="text-3xl font-bold text-anchor-gold mb-2">150</p>
              <p className="text-gray-600">Standing reception with high tables</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl mb-4">🏫</div>
              <h3 className="font-bold text-lg mb-2">Classroom Style</h3>
              <p className="text-3xl font-bold text-anchor-gold mb-2">60</p>
              <p className="text-gray-600">Tables and chairs for training/workshops</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl mb-4">⬜</div>
              <h3 className="font-bold text-lg mb-2">Boardroom Style</h3>
              <p className="text-3xl font-bold text-anchor-gold mb-2">30</p>
              <p className="text-gray-600">Single large table for meetings</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl mb-4">🎪</div>
              <h3 className="font-bold text-lg mb-2">Cabaret Style</h3>
              <p className="text-3xl font-bold text-anchor-gold mb-2">70</p>
              <p className="text-gray-600">Round tables with stage/presentation area</p>
            </div>
          </div>
        </div>
      </section>

      {/* Suitable For */}
      <section className="section-spacing bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="One Venue, Endless Possibilities"
              subtitle="Our function rooms adapt to any event type"
            />
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💼</span>
                </div>
                <h3 className="font-bold mb-2">Business Events</h3>
                <p className="text-sm text-gray-600">Meetings, training, conferences, AGMs</p>
              </div>
              
              <div className="text-center">
                <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <h3 className="font-bold mb-2">Celebrations</h3>
                <p className="text-sm text-gray-600">Birthdays, anniversaries, achievements</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💑</span>
                </div>
                <h3 className="font-bold mb-2">Weddings</h3>
                <p className="text-sm text-gray-600">Receptions, ceremonies, engagement parties</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🕊️</span>
                </div>
                <h3 className="font-bold mb-2">Memorial Services</h3>
                <p className="text-sm text-gray-600">Wakes, celebrations of life, gatherings</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎄</span>
                </div>
                <h3 className="font-bold mb-2">Seasonal Events</h3>
                <p className="text-sm text-gray-600">Christmas parties, New Year celebrations</p>
              </div>
              
              <div className="text-center">
                <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎭</span>
                </div>
                <h3 className="font-bold mb-2">Entertainment</h3>
                <p className="text-sm text-gray-600">Quiz nights, hosted events, themed nights (see /whats-on)</p>
              </div>
              
              <div className="text-center">
                <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👨‍👩‍👧‍👦</span>
                </div>
                <h3 className="font-bold mb-2">Community Events</h3>
                <p className="text-sm text-gray-600">Club meetings, fundraisers, social gatherings</p>
              </div>
              
              <div className="text-center">
                <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎓</span>
                </div>
                <h3 className="font-bold mb-2">Educational</h3>
                <p className="text-sm text-gray-600">Workshops, seminars, training days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="section-spacing bg-anchor-cream">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Why Choose The Anchor for Your Function"
          />
          
          <FeatureGrid
            columns={3}
            features={[
              {
                icon: "💷",
                title: "No Hidden Costs",
                description: "Flexible pricing, no hidden charges, great value. Let's discuss your needs.",
                className: "text-center"
              },
              {
                icon: "🚗",
                title: "Free Parking",
                description: "20 spaces on-site saves your guests money and hassle",
                className: "text-center"
              },
              {
                icon: "📍",
                title: "Prime Location",
                description: "7 mins from Heathrow, 3 mins from M25, outside ULEZ zone",
                className: "text-center"
              },
              {
                icon: "🍽️",
                title: "Flexible Catering",
                description: "From tea & biscuits to five-course dinners - your choice",
                className: "text-center"
              },
              {
                icon: "🛠️",
                title: "Full Support",
                description: "Experienced team handles setup, service, and cleanup",
                className: "text-center"
              },
              {
                icon: "♿",
                title: "Fully Accessible",
                description: "Ground floor venue with wheelchair access throughout",
                className: "text-center"
              }
            ]}
          />
        </div>
      </section>

      {/* What's Included */}
      <section className="section-spacing bg-white">
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
                        <span className="text-green-600">✓</span>
                        <span>Tables and chairs in your chosen layout</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-600">✓</span>
                        <span>White table linens and napkins</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-600">✓</span>
                        <span>Background music system</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-600">✓</span>
                        <span>Microphone for speeches</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-600">✓</span>
                        <span>Basic lighting control</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-600">✓</span>
                        <span>Heating and air conditioning</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-600">✓</span>
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
                        <span className="text-green-600">✓</span>
                        <span>Pre-event planning consultation</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-600">✓</span>
                        <span>Dedicated event coordinator</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-600">✓</span>
                        <span>Professional service team</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-600">✓</span>
                        <span>Setup and breakdown included</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-600">✓</span>
                        <span>Flexible access times</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-600">✓</span>
                        <span>Supplier coordination</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-600">✓</span>
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
      <section className="section-spacing bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Simple, Transparent Pricing"
              subtitle="Flexible pricing tailored to your event needs"
            />
            
            <div className="bg-white rounded-xl p-8 shadow-md mb-8">
              <h3 className="text-xl font-bold text-anchor-green mb-6 text-center">Typical Minimum Spends</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
	                  <h4 className="font-bold mb-4">Weekdays (Mon-Thu)</h4>
	                  <ul className="space-y-2 text-gray-700">
	                    <li>• Morning/Afternoon: From GBP 150</li>
	                    <li>• Evening: From GBP 300</li>
	                    <li>• All Day: From GBP 400</li>
	                  </ul>
	                </div>
	                <div>
	                  <h4 className="font-bold mb-4">Weekends (Fri-Sun)</h4>
	                  <ul className="space-y-2 text-gray-700">
	                    <li>• Morning/Afternoon: From GBP 250</li>
	                    <li>• Evening: From GBP 500</li>
	                    <li>• All Day: From GBP 600</li>
	                  </ul>
	                </div>
              </div>
              <p className="text-sm text-gray-600 mt-6 text-center">
                * Exact minimums depend on specific date, time, and space required. 
                December and peak times may have higher minimums.
              </p>
            </div>
            
            <AlertBox
              variant="info"
              title="How Minimum Spend Works"
              content={
                <div>
                  <p className="mb-3">
                    Your minimum spend covers food, drinks, and any extras you choose. Most events naturally 
                    exceed minimums once you add catering and beverages for your guests.
                  </p>
	                  <p className="font-semibold">
	                    Example: 50-person evening event with buffet and drinks typically totals GBP 750-1000, 
	                    easily exceeding the GBP 500 weekend minimum.
	                  </p>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section-spacing bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="Perfectly Located for Your Guests"
              subtitle="Easy access from all directions with free parking"
            />
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-anchor-sand/20 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">By Car</h3>
                <ul className="space-y-2 text-gray-700 text-left">
                  <li>📍 M25 Junction 14: 3 minutes</li>
                  <li>📍 Heathrow T5: 7 minutes</li>
                  <li>📍 Staines: 8 minutes</li>
                  <li>📍 Windsor: 15 minutes</li>
                  <li>📍 Central London: 45 minutes</li>
                  <li className="pt-2 font-semibold">🚗 20 free parking spaces</li>
                </ul>
              </div>
              
              <div className="bg-anchor-sand/20 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">Public Transport</h3>
                <ul className="space-y-2 text-gray-700 text-left">
                  <li>🚌 Local bus routes from Staines</li>
                  <li>🚂 Staines station: 10 mins by taxi</li>
                  <li>✈️ Heathrow shuttle options</li>
                  <li>🚕 Uber/taxi readily available</li>
                  <li className="pt-2 font-semibold">📱 We can help arrange transport</li>
                </ul>
              </div>
            </div>
            
            <QuickInfoGrid
              items={[
                { icon: "✅", title: "Outside ULEZ zone - no charges" },
                { icon: "✅", title: "Well-lit car park" },
                { icon: "✅", title: "Level access from parking" },
                { icon: "✅", title: "Safe residential area" }
              ]}
              columns={4}
            />
          </div>
        </div>
      </section>

      <PrivateBookingSection eventType="Other" />

      <InternalLinkingSection
        title="Next Steps For Your Event"
        links={[
          { href: '/private-hire#enquiry', title: 'Submit Event Enquiry', description: 'Tell us about your celebration or meeting' },
          { href: '/corporate-events', title: 'Corporate Event Packages', description: 'See delegate rates and meeting add-ons' },
          { href: '/private-party-venue', title: 'Private Party Venue', description: 'Plan birthdays, wakes and anniversaries' },
          { href: '/food-menu', title: 'Menu Ideas', description: 'Select canapés, buffets or two-course meals' }
        ]}
        className="section-spacing-md"
      />

      {/* FAQ Section */}
      <FAQAccordionWithSchema 
        faqs={[
          {
            question: "What exactly is included in function room hire?",
            answer: "Everything you need is included: the space configured to your requirements, tables, chairs, linens, basic AV equipment (microphone, music system), dedicated staff, setup/breakdown, and cleaning. We offer flexible venue hire pricing tailored to your event, alongside minimum spend requirements on food and drinks."
          },
          {
            question: "How does your venue hire pricing work?",
            answer: "We offer flexible venue hire pricing that's tailored to each event. Our rates vary by day, time, and the type of event you're hosting. We're always willing to discuss your needs and work within your budget. Contact us for a personalised quote that suits your requirements."
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
            answer: "We can accommodate groups from 10 people upwards. For exclusive use of the entire venue, we typically require 80+ guests or equivalent minimum spend. Smaller groups are perfectly welcome in our function room."
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
        className="bg-gray-50"
      />

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-anchor-green to-anchor-green/90 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Check Availability for Your Function
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Competitive rates • Free parking • Professional service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookTableButton
                source="function_room_cta"
                size="lg"
                variant="secondary"
                context="function_room"
                className="bg-white text-anchor-green hover:bg-gray-100"
              >
                🏢 Book Function Room
              </BookTableButton>
              <Link href="tel:+441753682707">
                <Button size="lg" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  📞 Call: 01753 682707
                </Button>
              </Link>
              <Link href="https://wa.me/441753682707?text=Hi,%20I'd%20like%20to%20enquire%20about%20function%20room%20hire" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  💬 WhatsApp Us
                </Button>
              </Link>
              <Link href="mailto:manager@the-anchor.pub?subject=Function Room Hire Enquiry">
                <Button size="lg" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20">
                  📧 Email Enquiry
                </Button>
              </Link>
            </div>
            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
              <p className="text-white text-center">
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

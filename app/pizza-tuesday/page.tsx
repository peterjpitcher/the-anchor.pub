import Link from 'next/link'
import { Metadata } from 'next'
import { Button, Container, Section, Card, CardBody } from '@/components/ui'
import { BusinessHours } from '@/components/BusinessHours'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { EventSchema } from '@/components/EventSchema'
import { CONTACT, BRAND, PARKING } from '@/lib/constants'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import type { Event } from '@/lib/api'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PIZZA_IMAGE } from '@/lib/image-fallbacks'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'

export const metadata: Metadata = {
  title: 'Heathrow 2-for-1 Pizza Tuesday | Book The Anchor Deal',
  description: 'Buy one get one free stone-baked pizzas every Tuesday near Heathrow. Reserve your table or takeaway with free parking and night-long pizza specials.',
  keywords: 'pizza tuesday near heathrow, 2 for 1 pizza deal, bogof pizza stanwell moor, buy one get one free pizza, pizza deals near heathrow',
  openGraph: {
    title: 'Heathrow 2-for-1 Pizza Tuesday Deal',
    description: 'Buy one pizza, get one free every Tuesday at The Anchor near Heathrow. Book a table or order takeaway with free parking.',
    images: [DEFAULT_PIZZA_IMAGE],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Heathrow 2-for-1 Pizza Tuesday Deal',
    description: 'Buy one pizza, get one free every Tuesday near Heathrow. Reserve The Anchor table or takeaway with free parking.',
    images: [DEFAULT_PIZZA_IMAGE]
  }),
  alternates: {
    canonical: '/pizza-tuesday'
  }
}

const pizzaOfferSchema = {
  "@context": "https://schema.org",
  "@type": "Offer",
  "@id": "https://www.the-anchor.pub/pizza-tuesday#offer",
  "name": "Pizza Tuesday - Buy One Get One Free",
  "description": "Buy any pizza and get another pizza of equal or lesser value completely FREE. Available all day Tuesday during kitchen hours.",
  "url": "https://www.the-anchor.pub/pizza-tuesday",
  "priceSpecification": {
    "@type": "PriceSpecification",
    "price": "0",
    "priceCurrency": "GBP",
    "eligibleQuantity": {
      "@type": "QuantitativeValue",
      "value": 1,
      "unitText": "pizza"
    }
  },
  "itemOffered": {
    "@type": "Product",
    "name": "Stone-Baked Pizza",
    "category": "Food",
    "description": "Stone-baked pizzas with hand-stretched bases, San Marzano tomato sauce and generous toppings served at The Anchor near Heathrow.",
    "image": `https://www.the-anchor.pub${DEFAULT_PIZZA_IMAGE}`
  },
  "seller": {
    "@type": "Restaurant",
    "name": BRAND.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Horton Road",
      "addressLocality": "Stanwell Moor",
      "addressRegion": "Surrey",
      "postalCode": "TW19 6AQ"
    }
  },
  "validFrom": "2024-01-01",
  "validThrough": "2025-12-31",
  "availabilityStarts": "18:00:00",
  "availabilityEnds": "21:00:00",
  "availability": "https://schema.org/InStock",
  "eligibleRegion": {
    "@type": "Place",
    "name": "Stanwell Moor and surrounding areas"
  },
  "category": "Restaurant Offers"
}

// Create a proper Event object for Pizza Tuesday
const pizzaTuesdayEvent: Event = {
  '@type': 'Event',
  id: 'pizza-tuesday-weekly',
  slug: 'pizza-tuesday',
  name: 'Pizza Tuesday at The Anchor',
  description: 'Weekly BOGOF pizza deal every Tuesday. Buy one pizza, get one free on our entire stone-baked pizza menu.',
  longDescription: 'Weekly BOGOF pizza deal every Tuesday. Buy one pizza, get one free on our entire stone-baked pizza menu. Perfect for families, couples, or friends looking for great value dining near Heathrow.',
  shortDescription: 'Buy one pizza, get one FREE every Tuesday!',
  startDate: new Date().toISOString(),
  endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
  duration: 'PT3H',
  image: [DEFAULT_PIZZA_IMAGE],
  location: {
    '@type': 'Place',
    name: 'The Anchor',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Horton Road',
      addressLocality: 'Stanwell Moor',
      addressRegion: 'Surrey',
      postalCode: 'TW19 6AQ',
      addressCountry: 'GB'
    }
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'GBP',
    availability: 'https://schema.org/InStock',
    validFrom: new Date().toISOString()
  },
  category: {
    id: 'special-offers',
    name: 'Special Offers',
    slug: 'special-offers',
    color: '#D4AF37',
    icon: '🍕'
  },
  maximumAttendeeCapacity: 100,
  remainingAttendeeCapacity: 100,
  isAccessibleForFree: false,
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode'
}

const pizzaMenuItems = [
  {
    position: 1,
    name: 'Rustic Classic',
    description: 'San Marzano tomato base, mozzarella, basil and oregano.',
    url: 'https://www.the-anchor.pub/pizza-tuesday#menu-preview'
  },
  {
    position: 2,
    name: 'Speck & Truffle',
    description: 'Speck ham, truffle cream, rocket and Fior di Latte mozzarella.',
    url: 'https://www.the-anchor.pub/pizza-tuesday#menu-preview'
  },
  {
    position: 3,
    name: 'Garden Club (V)',
    description: 'Roasted vegetables, olives, pesto drizzle and vegan-friendly option.',
    url: 'https://www.the-anchor.pub/pizza-tuesday#menu-preview'
  },
  {
    position: 4,
    name: 'Nice & Spicy',
    description: 'Spicy nduja, jalapeños, chilli flakes and San Marzano sauce.',
    url: 'https://www.the-anchor.pub/pizza-tuesday#menu-preview'
  }
]

export default function PizzaTuesdayPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Special Offers', url: '/special-offers' },
    { name: 'Pizza Tuesday', url: '/pizza-tuesday' }
  ])

  return (
    <>
      <EventSchema event={pizzaTuesdayEvent} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            pizzaOfferSchema,
            breadcrumbSchema,
            {
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Pizza Tuesday Menu",
              "itemListElement": pizzaMenuItems.map(item => ({
                "@type": "ListItem",
                "position": item.position,
                "name": item.name,
                "description": item.description,
                "url": item.url
              }))
            }
          ])
        }}
      />
      
      {/* Hero Section */}
      <HeroWrapper
        route="/pizza-tuesday"
        title="2-for-1 Pizza Tuesday Near Heathrow"
        description="Hand-stretched pizzas, buy one get one free every Tuesday from 6pm. Dine-in or takeaway with free parking."
        variant="promo"
        tags={[
          { label: "🔥 BOGOF 6pm–9pm", variant: "success" },
          { label: "From £7.49 per pizza", variant: "warning" },
          { label: "7 mins from Heathrow", variant: "default" }
        ]}
        primaryCta={
          <BookTableButton
            source="pizza_tuesday_hero"
            context="pizza_tuesday"
            variant="primary"
            size="lg"
            fullWidth
            className="sm:w-auto"
          >
            Reserve Pizza Tuesday
          </BookTableButton>
        }
        secondaryCta={
          <Link href="#menu-preview" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" fullWidth className="sm:w-auto bg-white text-anchor-green hover:bg-gray-100">
              View Pizza Line-Up
            </Button>
          </Link>
        }
      />

      {/* Page Title */}
      <Section background="white" spacing="md">
        <Container>
          <PageTitle className="text-center text-anchor-green mb-8" seo={{ structured: true, speakable: true }}>
            Tuesday Pizza Deals - 2 for 1 on ALL Pizzas | The Anchor - Heathrow Pub & Dining
          </PageTitle>
        </Container>
      </Section>

      <Section background="white" spacing="md" id="groups">
        <Container>
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] max-w-5xl mx-auto">
            <Card className="bg-anchor-cream/60 shadow-md">
              <CardBody>
                <h3 className="text-xl font-semibold text-anchor-green mb-3">Perfect for Groups & Takeaway</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Crew meals, team socials and family nights all love the BOGOF saving.</li>
                  <li>• Takeaway boxes available — give us a ring when you’re on the way and we’ll get the ovens fired up.</li>
                  <li>• Add sharers, wings and desserts to turn it into a full feast.</li>
                </ul>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <BookTableButton
                    source="pizza_tuesday_group_cta"
                    context="pizza_tuesday"
                    variant="primary"
                    size="md"
                    fullWidth
                    className="sm:w-auto"
                  >
                    Book for a Group
                  </BookTableButton>
                  <Link href="tel:+441753682707" className="w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      size="md"
                      fullWidth
                      className="sm:w-auto bg-white text-anchor-green hover:bg-gray-100"
                    >
                      Call When You're En Route
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
            <Card className="bg-white shadow-md">
              <CardBody>
                <p className="text-sm uppercase tracking-[0.3em] text-anchor-gold mb-3 text-center">Guest feedback</p>
                <blockquote className="text-center text-lg font-semibold text-anchor-green">
                  “Pizza Tuesday is unbeatable value — four of us ate like kings and still spent less than in the airport. Service was super quick.”
                </blockquote>
                <p className="mt-4 text-center text-sm text-gray-600">— Google Review, September 2025</p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="md" id="availability">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            <SectionHeader
              title="Pizza Tuesday Every Week"
              subtitle="Same unbeatable value every Tuesday evening — we just ask you to book so we can pace the ovens."
            />
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-white shadow-md border border-amber-100">
                <CardBody>
                  <h3 className="text-lg font-semibold text-anchor-green">Kitchen Hours</h3>
                  <p className="mt-2 text-sm text-gray-700">
                    Pizza Tuesday runs every Tuesday from <strong>6pm – 9pm</strong>. Tell us if you need an earlier collection.
                  </p>
                </CardBody>
              </Card>
              <Card className="bg-white shadow-md border border-amber-100">
                <CardBody>
                  <h3 className="text-lg font-semibold text-anchor-green">No Limited Stock</h3>
                  <p className="mt-2 text-sm text-gray-700">
                    We make dough fresh through the evening, so the deal stays live all night. Just book or WhatsApp so we can plan staffing.
                  </p>
                </CardBody>
              </Card>
              <Card className="bg-white shadow-md border border-amber-100">
                <CardBody>
                  <h3 className="text-lg font-semibold text-anchor-green">Group Friendly</h3>
                  <p className="mt-2 text-sm text-gray-700">
                    Feeding a crew or ordering takeaway for the office? Let us know numbers and timing and we’ll stage the oven runs.
                  </p>
                </CardBody>
              </Card>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Questions or large orders? WhatsApp +44 1753 682707 and we’ll make sure the team is ready when you arrive.
            </p>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="sm">
        <Container>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: '#deal', label: '🔥 The Deal' },
              { href: '#menu-preview', label: '🍕 Pizza Menu' },
              { href: '#heathrow', label: '✈️ Heathrow Travellers' },
              { href: '#groups', label: '👨‍👩‍👧 Groups & Takeaway' },
              { href: '#faq', label: '❓ Pizza FAQ' }
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 rounded-full border border-anchor-green/20 bg-white px-4 py-2 text-sm font-semibold text-anchor-green shadow-sm transition hover:border-anchor-gold hover:text-anchor-gold"
              >
                {link.label}
              </a>
            ))}
          </div>
        </Container>
      </Section>

      {/* The Deal Section */}
      <Section background="gray" spacing="md" id="deal">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="🍕 Tuesday = 50% OFF When You Buy 2 Pizzas!"
              subtitle="Works out to just £3.75-£6.50 per pizza!"
            />
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-red-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-red-800 mb-4">🔥 The Tuesday Deal</h3>
                <ul className="space-y-3 text-lg">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 text-xl">✓</span>
                    <span><strong>Buy ANY pizza, get one FREE!</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 text-xl">✓</span>
                    <span>All sizes included (8" or 12")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 text-xl">✓</span>
                    <span>Dine-in or takeaway</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 text-xl">✓</span>
                    <span>No vouchers needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 text-xl">✓</span>
                    <span>Free pizza is equal or lesser value</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-amber-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-amber-800 mb-4">Available Times</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-lg mb-2">Every Tuesday</p>
                    <p className="text-3xl font-bold text-amber-700">6:00 PM - 9:00 PM</p>
                    <p className="text-gray-600 mt-2">During kitchen service hours</p>
                  </div>
                  <div className="pt-4 border-t border-amber-200">
                    <p className="font-semibold mb-2">📍 Location</p>
                    <p>Just 7 minutes from Heathrow Terminal 5</p>
                    <p>Free parking available</p>
                    <p className="text-green-700 font-semibold mt-2">Outside ULEZ Zone</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xl text-gray-700 mb-6">
                Perfect for families, date nights, or catching up with friends. 
                Our stone-baked pizzas are made fresh to order with authentic Italian ingredients.
              </p>
              <Link href="#menu-preview" className="inline-block">
                <Button 
                  variant="primary"
                  size="lg"
                >
                  View Our Pizza Selection
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* Pizza Menu Preview */}
      <Section background="gray" spacing="md" id="menu-preview">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Our Stone-Baked Pizza Selection"
            />
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-bold text-xl text-red-700 mb-3">Classic Favourites</h3>
                <ul className="space-y-3">
                  <li>
                    <span className="font-semibold">Rustic Classic</span>
                    <span className="text-gray-600"> - £7.49/£10.49</span>
                    <p className="text-sm text-gray-600">Rich tomato, mozzarella, oregano</p>
                  </li>
                  <li>
                    <span className="font-semibold">Simply Salami</span>
                    <span className="text-gray-600"> - £8.49/£12.99</span>
                    <p className="text-sm text-gray-600">Napoli salami, tomato, mozzarella</p>
                  </li>
                  <li>
                    <span className="font-semibold">Barbecue Chicken</span>
                    <span className="text-gray-600"> - £9.99/£13.99</span>
                    <p className="text-sm text-gray-600">BBQ sauce, chicken, speck ham</p>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-bold text-xl text-red-700 mb-3">Gourmet Selection</h3>
                <ul className="space-y-3">
                  <li>
                    <span className="font-semibold">Fully Loaded</span>
                    <span className="text-gray-600"> - £9.49/£13.99</span>
                    <p className="text-sm text-gray-600">Three meats on stone-baked base</p>
                  </li>
                  <li>
                    <span className="font-semibold">The Garden Club</span>
                    <span className="text-gray-600"> - £8.99/£12.99</span>
                    <p className="text-sm text-gray-600">Roasted veg, rocket, mozzarella</p>
                  </li>
                  <li>
                    <span className="font-semibold">Nice & Spicy</span>
                    <span className="text-gray-600"> - £8.49/£13.49</span>
                    <p className="text-sm text-gray-600">'Nduja, Ventricina, roquito peppers</p>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">Gluten-free bases available on request</p>
              <Link href="#menu-preview" className="text-anchor-gold hover:text-anchor-green font-semibold">
                View Full Pizza Menu →
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* Why Choose Us */}
      <Section background="white" spacing="md">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="Why Tuesday Pizza Night at The Anchor?"
            />
            
            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "🍕",
                  title: "Authentic Stone-Baked",
                  description: "Traditional oven, perfect crust every time",
                  variant: "colored",
                  color: "bg-amber-50",
                  className: "rounded-xl p-6 text-center"
                },
                {
                  icon: "🚗",
                  title: "Easy Access",
                  description: "Free parking, 7 mins from Heathrow",
                  variant: "colored",
                  color: "bg-amber-50",
                  className: "rounded-xl p-6 text-center"
                },
                {
                  icon: "👨‍👩‍👧‍👦",
                  title: "Family Friendly",
                  description: "Kids love our 8\" pizzas, perfect size!",
                  variant: "colored",
                  color: "bg-amber-50",
                  className: "rounded-xl p-6 text-center"
                }
              ]}
              className="mb-8"
            />
            
            <p className="text-lg text-gray-700 mb-6">
              Skip the expensive chain restaurants and enjoy authentic Italian-style pizzas 
              at proper pub prices. With our BOGOF deal, it's the best value pizza night in the area!
            </p>
          </div>
        </Container>
      </Section>

      {/* Location Benefits */}
      <Section background="gray" spacing="md" id="heathrow">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="Perfect Pizza Location Near Heathrow"
              subtitle="Beat airport queues, eat better food and still make your flight."
            />
            
            <FeatureGrid
              columns={4}
              features={[
                {
                  icon: "✈️",
                  title: "Terminal 5",
                  description: "7 minutes door-to-door",
                  variant: "default",
                  className: "bg-white rounded-lg p-6 shadow-md text-center"
                },
                {
                  icon: "🚗",
                  title: "Free Parking",
                  description: "Park outside & go",
                  variant: "default",
                  className: "bg-white rounded-lg p-6 shadow-md text-center"
                },
                {
                  icon: "🚌",
                  title: "Local Bus Links",
                  description: "442 stops by the door",
                  variant: "default",
                  className: "bg-white rounded-lg p-6 shadow-md text-center"
                },
                {
                  icon: "💳",
                  title: "Receipt Ready",
                  description: "Download & expense easily",
                  variant: "default",
                  className: "bg-white rounded-lg p-6 shadow-md text-center"
                }
              ]}
            />
            
            <AlertBox
              variant="success"
              title="Outside the ULEZ Zone"
              className="mt-8 text-center"
              content={
                <p className="text-lg">
                  Save £12.50 in charges when you dine with us before or after flying from Heathrow.
                </p>
              }
            />
          </div>
        </Container>
      </Section>

      {/* FAQs */}
      <section id="faq">
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "How does the Pizza Tuesday BOGOF deal work?",
            answer: "Simply order any pizza from our menu and get another pizza of equal or lesser value completely FREE. No vouchers needed - just mention the Tuesday deal when ordering. Available for both dine-in and takeaway during kitchen hours (6pm-9pm)."
          },
          {
            question: "What time is the pizza deal available on Tuesdays?",
            answer: "Our Pizza Tuesday BOGOF offer is available from 6pm to 9pm, which are our kitchen hours on Tuesday evenings. We recommend booking a table in advance as Tuesday nights can get busy!"
          },
          {
            question: "Can I mix and match pizza sizes with the BOGOF deal?",
            answer: "Yes! You can mix 8\" and 12\" pizzas. If you order pizzas of different prices, the lower-priced pizza is free. For example, order a 12\" Fully Loaded and get an 8\" Rustic Classic free."
          },
          {
            question: "Do I need to book a table for Pizza Tuesday?",
            answer: `We strongly recommend booking, especially during peak times (7-8pm). Call us on ${CONTACT.phone} to reserve your table. Walk-ins are welcome but subject to availability.`
          },
          {
            question: "Is the Pizza Tuesday deal available for takeaway?",
            answer: "Yes! The BOGOF deal applies to both dine-in and takeaway orders. Just call ahead on 01753 682707 to place your takeaway order and we'll have it ready for collection."
          },
          {
            question: "Do you have gluten-free pizzas for the Tuesday deal?",
            answer: "Yes, we can make any of our pizzas with a gluten-free base on request. The BOGOF deal applies to gluten-free pizzas too. Please mention when ordering as they take slightly longer to prepare."
          }
        ]}
        className="bg-white"
      />
      </section>

      <Section background="dark" spacing="md">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready for Pizza Tuesday?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Book your table now and enjoy buy-one-get-one-free pizzas this Tuesday from 6pm.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <BookTableButton
                source="pizza_tuesday_footer_cta"
                context="pizza_tuesday"
                variant="primary"
                size="lg"
                fullWidth
                className="sm:w-auto"
              >
                Reserve Pizza Tuesday
              </BookTableButton>
              <Link href={CONTACT.phoneHref} className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="sm:w-auto bg-white text-anchor-green hover:bg-gray-100"
                >
                  Call {CONTACT.phone}
                </Button>
              </Link>
            </div>
            <p className="text-white/80 text-sm">
              {BRAND.name} • {CONTACT.address.street}, {CONTACT.address.town} • Free Parking
            </p>
          </div>
        </Container>
      </Section>

      <FoodStickyCtaBar
        ctaContext="pizza_tuesday"
        whatsapp={{
          href: 'https://wa.me/441753682707?text=Hi%20Anchor%20Team!%20Please%20book%20me%20for%20Pizza%20Tuesday.',
          label: 'WhatsApp Pizza Deal',
          id: 'whatsapp_pizza_tuesday'
        }}
        label="Reserve Pizza Tuesday"
      />
    </>
  )
}

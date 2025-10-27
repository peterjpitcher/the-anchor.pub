import Link from 'next/link'
import { Metadata } from 'next'
import { Button, Section, CTASection, SectionHeader, FeatureGrid, InfoBoxGrid, AlertBox } from '@/components/ui'
import { HeroWrapper } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { DEFAULT_FOOD_IMAGE } from '@/lib/image-fallbacks'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { GoogleReviews } from '@/components/reviews'
import { generateNutritionInfo } from '@/lib/schema-utils'

export const metadata: Metadata = {
  title: 'Best Fish and Chips Near Heathrow Airport | The Anchor',
  description: 'Traditional British fish & chips near Heathrow. Beer-battered cod, triple-cooked chips, mushy peas. 50% off for over 65s every Friday. 7 minutes from Terminal 5.',
  keywords: 'best fish and chips near heathrow, fish and chips stanwell moor, traditional fish and chips, fish and chips near heathrow airport, british fish and chips, cod and chips near me',
  openGraph: {
    title: 'Traditional Fish & Chips - The Anchor',
    description: 'Proper British fish & chips. Beer-battered cod, triple-cooked chips. Senior citizens 50% off Fridays!',
    images: [DEFAULT_FOOD_IMAGE],
  },
  twitter: getTwitterMetadata({
    title: 'Traditional Fish & Chips - The Anchor',
    description: 'Proper British fish & chips. Beer-battered cod, triple-cooked chips. Senior citizens 50% off Fridays!',
    images: [DEFAULT_FOOD_IMAGE]
  }),
  alternates: {
    canonical: '/food/fish-and-chips'
  }
}

const fishAndChipsSchema = {
  "@context": "https://schema.org",
  "@type": "MenuItem",
  "@id": "https://www.the-anchor.pub/food/fish-and-chips",
  "name": "Traditional Fish & Chips",
  "description": "Beer-battered cod fillet with triple-cooked chips, mushy peas, and homemade tartare sauce",
  "image": `https://www.the-anchor.pub${DEFAULT_FOOD_IMAGE}`,
  "offers": [
    {
      "@type": "Offer",
      "price": "13.99",
      "priceCurrency": "GBP",
      "availability": "https://schema.org/InStock",
      "eligibleRegion": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Stanwell Moor"
        }
      }
    },
    {
      "@type": "Offer",
      "name": "Senior Citizens Friday Special",
      "description": "50% off for customers aged 65+ every Friday",
      "price": "6.99",
      "priceCurrency": "GBP",
      "availability": "https://schema.org/InStock",
      "validFrom": "2025-01-01",
      "validThrough": "2025-12-31",
      "eligibleCustomerType": "Seniors",
      "dayOfWeek": "Friday"
    }
  ],
  "nutrition": generateNutritionInfo("Traditional Fish & Chips", "main-course"),
  "suitableForDiet": ["https://schema.org/PescatarianDiet"]
}

const seniorOfferSchema = {
  "@context": "https://schema.org",
  "@type": "Offer",
  "name": "Friday Fish & Chips - 50% Off for Over 65s",
  "description": "Every Friday, customers aged 65 and over get 50% off our chip shop menu including fish & chips, sausage & chips, and scampi & chips",
  "url": "https://www.the-anchor.pub/food/fish-and-chips",
  "priceSpecification": {
    "@type": "PriceSpecification",
    "price": "50",
    "priceCurrency": "%",
    "valueAddedTaxIncluded": true
  },
  "itemOffered": {
    "@type": "Product",
    "name": "Chip Shop Menu Items",
    "category": "Food",
    "description": "Traditional chip shop classics including beer-battered cod, scampi and sausages served with triple-cooked chips.",
    "image": `https://www.the-anchor.pub${DEFAULT_FOOD_IMAGE}`
  },
  "seller": {
    "@type": "Restaurant",
    "name": "The Anchor",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Horton Road",
      "addressLocality": "Stanwell Moor",
      "postalCode": "TW19 6AQ"
    }
  },
  "validFrom": "2025-01-01",
  "validThrough": "2025-12-31",
  "dayOfWeek": "Friday",
  "eligibleCustomerType": "Seniors (65+)",
  "availability": "https://schema.org/InStock"
}

export default function FishAndChipsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([fishAndChipsSchema, seniorOfferSchema]) }}
      />
      
      {/* Hero Section */}
      <HeroWrapper
        route="/food/fish-and-chips"
        title="Traditional British Fish & Chips"
        description="Beer-battered cod with triple-cooked chips - a proper British classic"
        variant="default"
        tags={[
          { label: "🐟 Fresh Cod Daily", variant: "success" },
          { label: "👴 50% Off Fridays for Over 65s", variant: "warning" },
          { label: "🍟 Triple-Cooked Chips", variant: "default" },
          { label: "⏱️ Cooked Fresh in 15 mins", variant: "primary" }
        ]}
        primaryCta={
          <BookTableButton
            variant="primary"
            size="lg"
            source="fish_chips_hero"
            className="w-full sm:w-auto"
          >
            📅 Book a Table
          </BookTableButton>
        }
        secondaryCta={
          <Link href="/food-menu">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              📋 View Full Menu
            </Button>
          </Link>
        }
        secondaryInfo={
          <div className="bg-amber-600/90 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-white font-bold text-lg text-center">
              🎣 "Best Fish & Chips Near Heathrow" - Local Favourite Since 1995
            </p>
          </div>
        }
      />

      {/* Page Title for SEO */}
      <Section background="white" spacing="md" container>
        <PageTitle 
          className="text-center text-anchor-green"
          seo={{ structured: true, speakable: true }}
        >
          Best Fish and Chips Near Heathrow Airport - Traditional British Cod & Chips
        </PageTitle>
      </Section>

      {/* The Perfect Fish & Chips */}
      <Section background="white" spacing="lg" container containerSize="lg">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="What Makes Our Fish & Chips Special"
            subtitle="Traditional British recipe perfected over decades"
          />
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <InfoBoxGrid
                columns={1}
                boxes={[
                  {
                    title: "🐟 The Fish",
                    content: (
                      <div className="space-y-3">
                        <ul className="space-y-2 text-gray-700">
                          <li>✓ Fresh cod fillets delivered daily</li>
                          <li>✓ Our secret beer batter recipe</li>
                          <li>✓ Crispy golden coating</li>
                          <li>✓ Flaky white fish inside</li>
                          <li>✓ Generous portion sizes</li>
                        </ul>
                        <div className="bg-blue-50 rounded-lg p-3 mt-4">
                          <p className="text-sm font-semibold text-blue-900">
                            Also available: Half portion for lighter appetites
                          </p>
                        </div>
                      </div>
                    ),
                    variant: "colored",
                    color: "bg-sky-50 rounded-xl p-6"
                  }
                ]}
              />
              
              <InfoBoxGrid
                columns={1}
                boxes={[
                  {
                    title: "🍟 The Chips",
                    content: (
                      <div className="space-y-3">
                        <ul className="space-y-2 text-gray-700">
                          <li>✓ Triple-cooked for perfect texture</li>
                          <li>✓ Fluffy inside, crispy outside</li>
                          <li>✓ Proper British chip shop style</li>
                          <li>✓ Fresh cut, never frozen</li>
                          <li>✓ Perfectly salted</li>
                        </ul>
                        <div className="bg-amber-50 rounded-lg p-3 mt-4">
                          <p className="text-sm font-semibold text-amber-900">
                            Served with mushy peas & tartare sauce
                          </p>
                        </div>
                      </div>
                    ),
                    variant: "colored",
                    color: "bg-amber-50 rounded-xl p-6"
                  }
                ]}
              />
            </div>

            {/* Friday Senior Special Alert */}
            <AlertBox
              variant="success"
              title="🎉 Friday Special: 50% Off for Over 65s!"
              className="max-w-4xl mx-auto"
              content={
                <div className="mt-2">
                  <p className="text-gray-700 mb-3">
                    Every Friday, customers aged 65 and over enjoy HALF PRICE on our entire chip shop menu:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-bold text-green-900 mb-2">Eligible Items:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Fish & Chips - <span className="line-through">£13.99</span> <span className="font-bold text-green-600">£6.99</span></li>
                        <li>• Half Fish & Chips - <span className="line-through">£9.99</span> <span className="font-bold text-green-600">£4.99</span></li>
                        <li>• Sausage & Chips - <span className="line-through">£8.99</span> <span className="font-bold text-green-600">£4.49</span></li>
                        <li>• Scampi & Chips - <span className="line-through">£11.99</span> <span className="font-bold text-green-600">£5.99</span></li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-bold text-green-900 mb-2">How to Claim:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Available every Friday</li>
                        <li>• Proof of age may be required</li>
                        <li>• Dine-in or takeaway</li>
                        <li>• No voucher needed</li>
                        <li>• All items include mushy peas</li>
                      </ul>
                    </div>
                  </div>
                </div>
              }
            />
        </div>
      </Section>

      {/* Pricing & Options */}
      <Section background="gray" spacing="lg" container containerSize="md">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="Fish & Chips Menu Options"
            subtitle="All served with mushy peas and tartare sauce"
          />
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-anchor-green mb-4">Regular Portions</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center pb-3 border-b">
                    <div>
                      <p className="font-semibold">Fish & Chips</p>
                      <p className="text-sm text-gray-600">Full cod fillet</p>
                    </div>
                    <span className="font-bold text-lg">£13.99</span>
                  </li>
                  <li className="flex justify-between items-center pb-3 border-b">
                    <div>
                      <p className="font-semibold">Half Fish & Chips</p>
                      <p className="text-sm text-gray-600">Half portion</p>
                    </div>
                    <span className="font-bold text-lg">£9.99</span>
                  </li>
                  <li className="flex justify-between items-center pb-3 border-b">
                    <div>
                      <p className="font-semibold">Scampi & Chips</p>
                      <p className="text-sm text-gray-600">Breaded scampi</p>
                    </div>
                    <span className="font-bold text-lg">£11.99</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Sausage & Chips</p>
                      <p className="text-sm text-gray-600">Traditional sausage</p>
                    </div>
                    <span className="font-bold text-lg">£8.99</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-green-900 mb-4">Friday Over 65s Prices</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center pb-3 border-b border-green-200">
                    <div>
                      <p className="font-semibold">Fish & Chips</p>
                      <p className="text-sm text-green-700">50% off!</p>
                    </div>
                    <span className="font-bold text-lg text-green-600">£6.99</span>
                  </li>
                  <li className="flex justify-between items-center pb-3 border-b border-green-200">
                    <div>
                      <p className="font-semibold">Half Fish & Chips</p>
                      <p className="text-sm text-green-700">50% off!</p>
                    </div>
                    <span className="font-bold text-lg text-green-600">£4.99</span>
                  </li>
                  <li className="flex justify-between items-center pb-3 border-b border-green-200">
                    <div>
                      <p className="font-semibold">Scampi & Chips</p>
                      <p className="text-sm text-green-700">50% off!</p>
                    </div>
                    <span className="font-bold text-lg text-green-600">£5.99</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Sausage & Chips</p>
                      <p className="text-sm text-green-700">50% off!</p>
                    </div>
                    <span className="font-bold text-lg text-green-600">£4.49</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">All prices include mushy peas. Add curry sauce or beans for £1.50</p>
              <BookTableButton
                variant="primary"
                size="lg"
                source="fish_chips_menu"
              >
                Book Your Table
              </BookTableButton>
            </div>
        </div>
      </Section>

      {/* Why Better Than Others */}
      <Section background="white" spacing="lg" container containerSize="lg">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Why Locals Choose Our Fish & Chips"
            subtitle="Traditional British chippy experience near Heathrow"
          />
            
            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "⏱️",
                  title: "Cooked Fresh",
                  description: "Every order cooked fresh within 15 minutes. No heat lamps, no reheating.",
                  className: "text-center"
                },
                {
                  icon: "📍",
                  title: "7 mins from Terminal 5",
                  description: "Perfect for a proper British meal before or after your flight.",
                  className: "text-center"
                },
                {
                  icon: "🚗",
                  title: "Free Parking",
                  description: "20 free spaces. Save £20-40 vs airport parking while you dine.",
                  className: "text-center"
                },
                {
                  icon: "💷",
                  title: "Honest Prices",
                  description: "Half the price of airport restaurants. A proper meal at pub prices.",
                  className: "text-center"
                },
                {
                  icon: "🏆",
                  title: "Local Favourite",
                  description: "Serving Stanwell Moor since 1995. Ask any local!",
                  className: "text-center"
                },
                {
                  icon: "📦",
                  title: "Takeaway Available",
                  description: "All fish & chips available to takeaway. 20-25 minute wait.",
                  className: "text-center"
                }
              ]}
            />
        </div>
      </Section>

      {/* Customer Reviews */}
      <Section spacing="lg" container containerSize="md" className="bg-anchor-sand/10">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="What Customers Say About Our Fish & Chips"
          />
          <GoogleReviews 
            layout="carousel"
            showTitle={false}
          />
        </div>
      </Section>

      {/* FAQ Section */}
      <Section background="gray" spacing="lg" container containerSize="md">
        <FAQAccordionWithSchema 
          faqs={[
          {
            question: "What makes your fish and chips the best near Heathrow?",
            answer: "We use fresh cod delivered daily, our secret beer batter recipe, and triple-cook our chips for the perfect texture. Everything is cooked fresh to order within 15 minutes, and we're just 7 minutes from Terminal 5 with free parking."
          },
          {
            question: "How does the Friday 50% off deal for seniors work?",
            answer: "Every Friday, customers aged 65 and over get 50% off our entire chip shop menu. No voucher needed - just visit us on Friday and let us know you're claiming the offer. Proof of age may be required."
          },
          {
            question: "Do you offer takeaway fish and chips?",
            answer: "Yes! All our fish & chips menu items are available for takeaway. Orders typically take 20-25 minutes as everything is cooked fresh. Perfect if you want proper British food for your journey."
          },
          {
            question: "What comes with the fish and chips?",
            answer: "All fish & chips meals come with mushy peas and our homemade tartare sauce. You can add curry sauce or beans for £1.50 extra."
          },
          {
            question: "Do you have options for smaller appetites?",
            answer: "Yes, we offer a half fish & chips portion for £9.99 (or £4.99 for seniors on Fridays). Perfect for those who want the taste without the full portion."
          },
          {
            question: "When can I get fish and chips at The Anchor?",
            answer: "Fish & chips are available during our kitchen hours: Tuesday-Friday 6pm-9pm, Saturday 1pm-7pm, and Sunday 12pm-5pm. Kitchen is closed Mondays."
          }
        ]}
          className="bg-white"
        />
      </Section>

      {/* CTA Section */}
      <CTASection
        title="Ready for Proper Fish & Chips?"
        description="Cooked fresh to order, just 7 minutes from Heathrow"
        buttons={[
          {
            text: "📅 Book a Table",
            href: "/book-table",
            variant: "primary"
          },
          {
            text: "📞 Takeaway: 01753 682707",
            href: "tel:+441753682707",
            variant: "secondary"
          }
        ]}
        variant="green"
        footer="Remember: 50% off for over 65s every Friday! • Free parking always available"
      />
    </>
  )
}

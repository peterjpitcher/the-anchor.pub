import Link from 'next/link'
import { Button, Container, Section, Card, CardBody, InfoBoxGrid, SectionHeader, AlertBox, FeatureGrid } from '@/components/ui'
import { HeroWrapper } from '@/components/hero'
import { Metadata } from 'next'
import { Icon } from '@/components/ui/Icon'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { ReviewSection } from '@/components/reviews'
import { MenuPageTracker } from '@/components/MenuPageTracker'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { generateNutritionInfo, generateSuitableForDiet } from '@/lib/schema-utils'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BookTableButton } from '@/components/BookTableButton'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'

export const metadata: Metadata = {
  title: 'Sunday Roast Near Heathrow Airport | Book At The Anchor',
  description: 'Traditional Sunday roast with Yorkshire puddings minutes from Heathrow. Reserve with a £5 deposit, family-friendly seating and free parking.',
  keywords: 'sunday roast near heathrow airport, sunday lunch near me, roast dinner near me, best sunday roast staines, book sunday roast the anchor',
  openGraph: {
    title: 'Sunday Roast Near Heathrow Airport',
    description: 'Reserve The Anchor’s Sunday roast close to Heathrow: Yorkshire puddings, crispy potatoes and family seating with free parking.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Sunday Roast Near Heathrow Airport',
    description: 'Traditional Sunday roast minutes from Heathrow. Secure your table with a £5 booking deposit and enjoy free parking.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
  }),
  alternates: {
    canonical: '/sunday-lunch'
  }
}

const sundayRoastItems = [
  {
    position: 1,
    name: 'Roasted Chicken',
    url: 'https://www.the-anchor.pub/sunday-lunch#menu',
    description: 'Oven-roasted chicken breast with sage & onion stuffing balls and roast trimmings.'
  },
  {
    position: 2,
    name: 'Slow-Cooked Lamb Shank',
    url: 'https://www.the-anchor.pub/sunday-lunch#menu',
    description: 'Tender lamb shank in red wine gravy with seasonal vegetables and Yorkshire pudding.'
  },
  {
    position: 3,
    name: 'Crispy Pork Belly',
    url: 'https://www.the-anchor.pub/sunday-lunch#menu',
    description: 'Slow-roasted pork belly with crackling, apple sauce and roast accompaniments.'
  },
  {
    position: 4,
    name: 'Beetroot & Butternut Squash Wellington',
    url: 'https://www.the-anchor.pub/sunday-lunch#menu',
    description: 'Plant-based Wellington served with vegetarian gravy and seasonal vegetables.'
  }
]
export default function SundayLunchPage() {
  return (
    <>
      <MenuPageTracker 
        menuType="sunday_lunch"
        specialOffers={[
          "Advance booking required by 1pm Saturday"
        ]}
      />
      
      {/* Hero Section */}
      <HeroWrapper
        route="/sunday-lunch"
        title="Sunday Roast Near Heathrow Airport"
        description="Book by 1pm Saturday and enjoy Yorkshire puddings, crispy potatoes and proper gravy minutes before your flight."
        variant="default"
        tags={[
          { label: "Served Sundays 12pm–5pm", variant: "warning" },
          { label: "£5 Deposit Secures Table", variant: "default" },
          { label: "Free Parking • Family Friendly", variant: "default" }
        ]}
        primaryCta={
          <BookTableButton
            source="sunday_roast_hero"
            context="sunday_roast"
            variant="primary"
            size="lg"
            fullWidth
            className="sm:w-auto"
          >
            Book Sunday Roast
          </BookTableButton>
        }
        secondaryCta={
          <Link href="#menu" className="w-full sm:w-auto">
            <Button 
              variant="secondary"
              size="lg"
              fullWidth
              className="sm:w-auto bg-white text-anchor-green hover:bg-gray-100"
            >
              View Roast Menu
            </Button>
          </Link>
        }
        secondaryInfo={
          <div className="bg-red-600/90 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-white font-bold text-lg mb-1">
              ⚠️ IMPORTANT: Advance Booking & £5 Deposit Required
            </p>
            <p className="text-white text-sm">
              Sunday roasts require a booking with £5 per person deposit by 1pm Saturday
            </p>
            <p className="text-white/90 text-sm sm:text-xs mt-2">
              Regular menu also available on Sundays without booking ahead
            </p>
          </div>
        }
      />

      {/* Page Title for SEO */}
      <section className="bg-white py-8">
        <Container>
          <PageTitle 
            className="text-center text-anchor-green"
            seo={{ structured: true, speakable: true }}
          >
            Sunday Roast Near Me - Traditional British Sunday Lunch | The Anchor - Heathrow Pub & Dining
          </PageTitle>
        </Container>
      </section>

      <Section background="white" spacing="sm">
        <Container>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: '#why', label: '⭐ Why Choose Our Roast' },
              { href: '#heathrow', label: '✈️ Heathrow Timing Guide' },
              { href: '#families', label: '👨‍👩‍👧 Family-Friendly' },
              { href: '#menu', label: '🍽️ Roast Menu' },
              { href: '#pizza', label: '🍕 Pizza Tuesday Deal' },
              { href: '#faq', label: '❓ Roast FAQ' }
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

      {/* Why Our Roasts Are Special */}
      <section className="section-spacing bg-white" id="why">
        <Container>
          <SectionHeader
            title="Why Our Sunday Roast Near Me is Special"
            subtitle="Locals searching for 'Sunday lunch near me' choose The Anchor - here's why."
          />
          
          <FeatureGrid
            columns={3}
            features={[
              {
                icon: "👨‍🍳",
                title: "Chef's Pride",
                description: "Our head chef takes personal pride in every roast. Meat is sourced locally and cooked to perfection.",
                className: "text-center"
              },
              {
                icon: "🥘",
                title: "Generous Portions",
                description: "No one leaves hungry! Proper portions with all the trimmings. Extra Yorkshire puddings? Just ask!",
                className: "text-center"
              },
              {
                icon: "👨‍👩‍👧‍👦",
                title: "Family Atmosphere",
                description: "Sundays are for families. Relaxed atmosphere, kids welcome, and plenty of space for everyone.",
                className: "text-center"
              }
            ]}
            className="max-w-5xl mx-auto"
          />
        </Container>
      </section>

      <Section background="white" spacing="md" id="heathrow">
        <Container>
          <SectionHeader
            title="Perfect Sunday Lunch Before Heathrow"
            subtitle="7 minutes from Terminal 5, 11 minutes from Terminals 2 & 3 — enjoy a proper roast before you depart."
          />
          <InfoBoxGrid
            columns={3}
            className="max-w-5xl mx-auto"
            items={[
              {
                icon: "⏱️",
                title: "Flight-friendly Timing",
                subtitle: (
                  <>
                    T5: 7 mins • T2 & T3: 11 mins • T4: 12 mins.<br />
                    Pre-book and we’ll serve within 15 minutes.
                  </>
                )
              },
              {
                icon: "🍽️",
                title: "Proper Portions",
                subtitle: "Crispy roast potatoes, seasonal veg, giant Yorkies and homemade gravy — with cauliflower cheese add-ons."
              },
              {
                icon: "🚗",
                title: "Free Parking & Receipts",
                subtitle: "Park outside, dine in comfort, download your receipt and head straight to departures without airport prices."
              }
            ]}
          />
        </Container>
      </Section>

      <Section background="white" spacing="md" id="families">
        <Container>
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
            <Card className="bg-anchor-cream/60 shadow-md">
              <CardBody>
                <h3 className="text-lg font-semibold text-anchor-green mb-3">Bring the Whole Family</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Kids roasts and half portions available.</li>
                  <li>• High chairs, colouring packs and space for prams.</li>
                  <li>• Quiet corners for multi-generation gatherings.</li>
                </ul>
                <div className="mt-4">
                  <BookTableButton
                    source="sunday_roast_family_cta"
                    context="sunday_roast"
                    variant="primary"
                    size="md"
                  >
                    Book Family Roast
                  </BookTableButton>
                </div>
              </CardBody>
            </Card>
            <Card className="bg-white shadow-md">
              <CardBody>
                <p className="text-sm uppercase tracking-[0.3em] text-anchor-gold mb-3 text-center">
                  Guest feedback
                </p>
                <blockquote className="text-center text-lg font-semibold text-anchor-green">
                  “Best Sunday roast near Heathrow — beef was perfect, kids loved the Yorkies and staff kept us on schedule for our flight.”
                </blockquote>
                <p className="mt-4 text-center text-sm text-gray-600">— Google Review, August 2025</p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Sunday Menu */}
      <section id="menu" className="section-spacing bg-anchor-cream">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Sunday Roast Menu"
            />
            <AlertBox
              variant="warning"
              title="📝 Advance Booking (New for 2025)"
              className="mb-8 max-w-3xl mx-auto"
              content={
                <>
                  <p className="text-gray-700 mb-4">
                    Our Sunday dinners are made from scratch and to order. <strong>Sunday roasts require 
                    a confirmed booking with £5 per person deposit by 1pm Saturday.</strong> The remaining balance 
                    is paid on the day.
                  </p>
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-green-900 mb-2">🌱 Why We Book Ahead</h4>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Fresh preparation:</strong> We make your gorgeous Sunday lunch from scratch, ready when you sit down.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Reduced waste:</strong> Knowing numbers in advance helps us minimise food waste and stay sustainable.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Better prices:</strong> Less waste means we can keep our Sunday lunch prices affordable.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Guaranteed quality:</strong> Every roast is fresh and delicious, never held under heat lamps.</span>
                      </li>
                    </ul>
                    <p className="text-xs text-green-700 mt-3 italic">
                      This booking system helps us continue offering Sunday lunches close to Heathrow without raising prices.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 text-center">
                      <strong>Can't book before Saturday?</strong> No problem! Our regular menu is also available on 
                      Sundays without any advance booking.
                    </p>
                  </div>
                </>
              }
            />
            <p className="text-center text-sm text-gray-600 italic mb-12">
              All dishes served with herb and garlic-crusted roast potatoes, seasonal vegetables, 
              Yorkshire pudding, and red wine gravy. Vegetarian gravy available on request.
            </p>
            
            {/* Main Roasts */}
            <div className="space-y-6 mb-12">
              {/* Roasted Chicken */}
              <div className="bg-white rounded-2xl p-8 shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-anchor-green">Roasted Chicken</h3>
                  <span className="text-2xl font-bold text-anchor-gold">£14.99</span>
                </div>
                <p className="text-gray-700 mb-4">
                  Oven-roasted chicken breast with sage & onion stuffing balls, herb and garlic-crusted roast potatoes, 
                  seasonal vegetables, Yorkshire pudding, and red wine gravy. Vegetarian gravy available on request.
                </p>
                <p className="text-sm text-gray-600 italic">
                  Pair with: El Pico Sauvignon Blanc – crisp and refreshing | Pint of Birra Moretti – smooth and well-rounded.
                </p>
              </div>
              
              {/* Slow-Cooked Lamb Shank */}
              <div className="bg-white rounded-2xl p-8 shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-anchor-green">Slow-Cooked Lamb Shank</h3>
                  <span className="text-2xl font-bold text-anchor-gold">£15.49</span>
                </div>
                <p className="text-gray-700 mb-4">
                  Tender slow-braised lamb shank in rich red wine gravy, served with herb and garlic-crusted roast 
                  potatoes, seasonal vegetables, and a Yorkshire pudding. Vegetarian gravy available on request.
                </p>
                <p className="text-sm text-gray-600 italic">
                  Pair with: Rocoso Malbec – bold and velvety | Pint of Guinness Draught – smooth and malty.
                </p>
              </div>
              
              {/* Crispy Pork Belly */}
              <div className="bg-white rounded-2xl p-8 shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-anchor-green">Crispy Pork Belly</h3>
                  <span className="text-2xl font-bold text-anchor-gold">£15.99</span>
                </div>
                <p className="text-gray-700 mb-4">
                  Crispy crackling and tender slow-roasted pork belly with Bramley apple sauce, herb and garlic-crusted 
                  roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy. Vegetarian gravy available on request.
                </p>
                <p className="text-sm text-gray-600 italic">
                  Pair with: Counterpoint Shiraz – rich and full-bodied | Pint of Inches Cider – crisp and fruity.
                </p>
              </div>
              
              {/* Beetroot & Butternut Squash Wellington */}
              <div className="bg-white rounded-2xl p-8 shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-anchor-green">Beetroot & Butternut Squash Wellington</h3>
                  <span className="text-anchor-gold text-sm font-bold bg-green-100 px-2 py-1 rounded ml-2">(VG)</span>
                  <span className="text-2xl font-bold text-anchor-gold">£15.49</span>
                </div>
                <p className="text-gray-700 mb-4">
                  Golden puff pastry filled with beetroot & butternut squash, served with herb and garlic-crusted roast 
                  potatoes, seasonal vegetables, and vegetarian gravy.
                </p>
                <p className="text-sm text-gray-600 italic">
                  Pair with: Giotto Pinot Grigio – light and fresh | Pint of Pravha – clean and crisp.
                </p>
              </div>
              
              {/* Kids Roasted Chicken */}
              <div className="bg-white rounded-2xl p-8 shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-anchor-green">Kids Roasted Chicken</h3>
                  <span className="text-2xl font-bold text-anchor-gold">£9.99</span>
                </div>
                <p className="text-gray-700 mb-4">
                  A smaller portion of our roasted chicken with herb and garlic-crusted roast potatoes, seasonal 
                  vegetables, Yorkshire pudding, and red wine gravy. Vegetarian gravy available on request.
                </p>
              </div>
              
            </div>
            
            {/* Optional Extras */}
            <div className="bg-white rounded-2xl p-8 shadow-md mb-12">
              <h3 className="text-2xl font-bold text-anchor-green mb-6 text-center">Optional Extras</h3>
              <div className="text-center">
                <div className="inline-block">
                  <div className="flex justify-between items-center gap-8">
                    <p className="font-semibold text-lg text-anchor-green">Cauliflower Cheese</p>
                    <span className="text-lg font-bold text-anchor-gold">£3.99</span>
                  </div>
                  <p className="text-gray-700 mt-2">
                    Creamy mature cheddar sauce, baked until golden and bubbling.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Deposit Information */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 text-center animate-pulse">
              <h4 className="text-lg font-bold text-red-900 mb-2">🚨 BOOK NOW - Limited Sunday Spaces!</h4>
              <p className="text-red-800">
                <strong>Deadline: Saturday 1pm</strong> • £5 deposit secures your roast
              </p>
              <p className="text-red-700 text-sm mt-1">
                We sell out most Sundays • Don't be disappointed!
              </p>
              <p className="text-red-600 text-xs mt-2">
                {new Date().getDay() === 0 ? 'Too late for today - book for next Sunday!' : 
                 new Date().getDay() === 6 ? 'Last chance for tomorrow!' : 
                 'Book now for this Sunday!'}
              </p>
            </div>
            
            {/* Booking CTA within menu section */}
            <div className="text-center mb-12">
              <Link href="/book-table" className="w-full inline-block">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full animate-pulse"
                  fullWidth
                >
                  <Icon name="calendar" className="mr-2 flex-shrink-0" />
                  <span>🔥 Reserve Now - Before Saturday 1pm!</span>
                </Button>
              </Link>
              <p className="text-sm text-red-600 font-bold mt-3">
                ⏰ Booking closes Saturday 1pm • Limited spaces available
              </p>
            </div>
            
            {/* Allergen Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-700">
                All our dishes are prepared in a single kitchen where allergens are present. While we take every 
                precaution, we cannot guarantee dishes are free from cross-contamination. If you have allergies or 
                dietary requirements, please speak to a member of our team before ordering. We use vegetable oil 
                where necessary to keep dishes light yet warming during colder months.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Sunday Experience */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title="The Sunday Experience"
            />
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-anchor-green mb-4">What to Expect</h3>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">✓</span>
                    <span>Arrive to the smell of roasting meat and Yorkshire puddings in the oven</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">✓</span>
                    <span>Friendly service from our Sunday team who know their regulars by name</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">✓</span>
                    <span>Generous portions that'll have you loosening your belt</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">✓</span>
                    <span>Kids running around while parents enjoy a proper Sunday pint</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-anchor-gold">✓</span>
                    <span>That satisfied feeling of a proper Sunday done right</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-anchor-sand/30 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-anchor-green mb-4">Sunday Timeline</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                    <span className="font-semibold">12:00pm</span>
                    <span className="text-gray-700">Kitchen opens - first roasts out</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                    <span className="font-semibold">1:00pm</span>
                    <span className="text-gray-700">Peak time begins - buzzing atmosphere</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                    <span className="font-semibold">3:00pm</span>
                    <span className="text-gray-700">Quieter period - perfect for families</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">4:30pm</span>
                    <span className="text-gray-700">Last orders for roasts</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Link href="/book-table" className="w-full">
                    <Button variant="primary" size="md" fullWidth className="sm:w-auto">
                      <Icon name="calendar" className="mr-2 flex-shrink-0" />
                      <span>Book Your Table</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Reviews */}
      <ReviewSection 
        title="What People Say About Our Sunday Roast"
        subtitle="Real reviews from our Sunday lunch guests"
        background="gray"
        layout="carousel"
      />

      {/* The Sunday Roast Tradition */}
      <section className="section-spacing bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Why Sunday Roast at The Anchor is Special"
            />
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-xl text-center mb-8">
                In a world of chain restaurants and microwave meals, The Anchor keeps the great 
                British tradition of Sunday roast alive and thriving in Stanwell Moor.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h3 className="text-2xl font-bold text-anchor-green mb-4">The Village Tradition</h3>
                  <p className="mb-4">
                    For generations, Sunday lunch at the village pub has been a cornerstone of British 
                    life. At The Anchor, we honour this tradition with pride. Every Sunday, our kitchen 
                    starts early, filling the pub with the comforting aromas of roasting meat and fresh 
                    Yorkshire puddings rising in the oven. It's the smell that draws locals from their 
                    Sunday papers and brings families together around our tables.
                  </p>
                  <p>
                    Our Sunday roast isn't just a meal - it's a weekly ritual for many Stanwell Moor 
                    families. Grandparents, parents, and children gather here, creating memories over 
                    generous plates of perfectly roasted meat and all the trimmings. It's these moments 
                    that make a pub truly part of the community.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-anchor-green mb-4">Cooked with Care</h3>
                  <p className="mb-4">
                    Our head chef takes Sunday roast seriously - perhaps too seriously, his wife might 
                    say! Each cut of meat is carefully selected from local suppliers, seasoned with 
                    herbs from our own garden when in season, and roasted to perfection. The vegetables 
                    are fresh, not frozen. The roast potatoes are par-boiled then roasted in goose fat 
                    until golden and crispy. The Yorkshire puddings? Made from scratch, naturally.
                  </p>
                  <p className="mb-4">
                    This attention to detail is why we introduced our advance booking system. By knowing 
                    exactly how many roasts we're serving, we can prepare each one fresh to order, 
                    ensuring every plate meets our exacting standards. It's more work for us, but 
                    the results speak for themselves.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-green-900 mb-2">🌱 Our Commitment to Sustainability</h4>
                    <p className="text-sm text-green-800">
                      The £5 deposit ensures we prepare exactly what's needed, reducing food waste significantly. 
                      This sustainable approach allows us to maintain quality and affordability - keeping our 
                      Sunday roasts accessible to the community we serve.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-anchor-cream rounded-2xl p-8 mb-12">
                <h3 className="text-2xl font-bold text-anchor-green mb-4 text-center">
                  Your Local Sunday Roast Near Me
                </h3>
                <p className="text-gray-700 mb-4">
                  When you search for "Sunday roast near me" in Stanwell Moor, Staines, or anywhere 
                  near Heathrow, The Anchor is your answer. We're not just the closest traditional pub 
                  to the airport - we're a proper British pub serving authentic Sunday roasts the way 
                  they should be done. Whether you're a local from Ashford, Bedfont, or Egham, or 
                  staying at a Heathrow hotel, you'll find us perfectly located for your Sunday lunch.
                </p>
                <p className="text-gray-700 mb-4">
                  Our Sunday roast has become legendary in the area. Flight crews from Terminal 2, 3, 4, 
                  and 5 have made us their regular Sunday spot. Business travelers extend their trips 
                  just to experience a proper British Sunday lunch before flying home. Why? Because when 
                  you're looking for "Sunday lunch near me," you want more than just food - you want 
                  the full British pub experience.
                </p>
                <p className="text-gray-700">
                  "You haven't truly visited England until you've had a proper Sunday roast," one 
                  American guest told us. We couldn't agree more. At The Anchor, Sunday roast isn't 
                  just a meal - it's a tradition we've been perfecting for years, making us the go-to 
                  answer for "roast dinner near me" searches across Surrey and West London.
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-lg text-gray-700 mb-4">
                  Whether you're searching for "Sunday roast near me" in Stanwell Moor, "Sunday lunch 
                  near me" in Staines, or "roast dinner near me" anywhere near Heathrow, The Anchor is 
                  your destination. We welcome locals from Ashford, Bedfont, Egham, Feltham, Stanwell, 
                  and Windsor, plus international visitors wanting authentic British culture. Just 
                  remember to book ahead - Sundays are our busiest day for a reason.
                </p>
                <p className="text-lg text-gray-700 italic">
                  "The best Sunday roast near me" isn't just what people search for - it's what they 
                  find at The Anchor. With 4.8 stars from over 127 reviews, we're the top-rated Sunday 
                  lunch destination near Heathrow Airport.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Customer Testimonials */}
      <section className="section-spacing bg-gray-50">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="What Our Sunday Roast Guests Say"
              subtitle="Real reviews from satisfied diners"
            />
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Best Sunday roast in the area by far! The lamb shank was tender and fell off the bone. Yorkshire puddings were perfect. Will definitely be back!"
                </p>
                <p className="font-semibold text-anchor-green">Sarah M.</p>
                <p className="text-sm text-gray-500">Local Customer</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Proper British Sunday lunch! As someone who travels for work, finding authentic food near Heathrow is gold. The pork belly crackling was incredible."
                </p>
                <p className="font-semibold text-anchor-green">James T.</p>
                <p className="text-sm text-gray-500">Business Traveller</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Family tradition now! We book every other Sunday. Kids love the roast chicken, adults love the atmosphere. Portion sizes are very generous too."
                </p>
                <p className="font-semibold text-anchor-green">The Wilson Family</p>
                <p className="text-sm text-gray-500">Regular Sunday Diners</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-600">
                Join hundreds of satisfied Sunday roast diners • 4.8★ from 127+ reviews
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section id="faq">
        <FAQAccordionWithSchema
          className="bg-white"
          title="Sunday Roast FAQ"
          faqs={[
          {
            question: "Why do I need to book Sunday roast in advance?",
            answer: "We prepare each Sunday roast fresh to order, ensuring the highest quality. Booking by 1pm Saturday with a £5 deposit helps us reduce waste, maintain our affordable prices (£14.99-£15.99), and guarantee we have your chosen joint ready when you arrive. The deposit is deducted from your final bill."
          },
          {
            question: "What's included with each Sunday roast?",
            answer: "Every roast comes with herb and garlic-crusted roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy (vegetarian gravy available). The portions are generous - you won't leave hungry!"
          },
          {
            question: "Can I get Sunday roast without booking ahead?",
            answer: "Sunday roasts require an advance booking with deposit, but our regular menu is available on Sundays without any pre-booking. This includes burgers, fish & chips, pizzas, and other pub classics."
          },
          {
            question: "Do you cater for dietary requirements?",
            answer: "We offer a vegan Beetroot & Butternut Squash Wellington (£15.49) and vegetarian gravy is available for any roast. However, our small kitchen means we cannot guarantee no cross-contamination for severe allergies."
          },
          {
            question: "What time is Sunday lunch served?",
            answer: "Sunday roast is served from 12pm to 5pm every Sunday, with last orders at 4:30pm. We recommend booking your preferred time slot when confirming your roast."
          },
          {
            question: "Is there parking available?",
            answer: "Yes! We have 20 free parking spaces for our guests. This is especially convenient as we're just 7 minutes from Heathrow Terminal 5."
          },
          {
            question: "Can I book for a large group?",
            answer: "Absolutely! Sunday is perfect for family gatherings. For groups over 10, please call us on 01753 682707 to discuss your requirements. We can accommodate up to 50 diners in our main area."
          }
        ]}
        />
      </section>

      {/* Booking CTA */}
      <section className="section-spacing bg-anchor-green text-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Don't Miss Out on Sunday Roast
            </h2>
            <p className="text-lg mb-8">
              Sunday roasts require a booking with £5 per person deposit by 1pm Saturday.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <BookTableButton
                source="sunday_roast_footer_cta"
                context="sunday_roast"
                variant="secondary"
                size="lg"
                fullWidth
                className="sm:w-auto bg-white text-anchor-green hover:bg-gray-100 border-white"
              >
                Book Your Sunday Roast
              </BookTableButton>

              <Link href="tel:+441753682707" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg"
                  fullWidth
                  className="sm:w-auto border-white text-white hover:bg-white hover:text-anchor-green"
                >
                  <Icon name="phone" className="mr-2" />
                  Call: 01753 682707
                </Button>
              </Link>
            </div>
            
            <p className="text-lg mb-8 max-w-2xl mx-auto text-white/90">
              Can't book ahead? Our regular menu is available on Sundays too!
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
              <h3 className="font-bold text-xl mb-3 text-white">Sunday Roast Service</h3>
              <p className="mb-2 text-white">Every Sunday: 12:00 PM - 4:30 PM</p>
              <p className="text-sm text-white/90">Last orders 4:30 PM</p>
            </div>
          </div>
        </Container>
      </section>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Restaurant",
              "@id": "https://www.the-anchor.pub/#sunday-roast",
              "name": "The Anchor - Sunday Roast",
              "servesCuisine": ["British", "Sunday Roast"],
              "priceRange": "££",
              "telephone": "+441753682707",
              "url": "https://www.the-anchor.pub/sunday-lunch",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Horton Road",
                "addressLocality": "Stanwell Moor",
                "addressRegion": "Surrey",
                "postalCode": "TW19 6AQ",
                "addressCountry": "GB"
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Sunday",
                  "opens": "12:00",
                  "closes": "17:00",
                  "description": "Sunday Roast service hours"
                }
              ],
              "advanceBookingRequirement": {
                "@type": "QuantitativeValue",
                "minValue": 1,
                "unitCode": "DAY",
            "description": "Sunday roasts must be booked by 1pm Saturday"
              },
              "acceptsReservations": "required",
              "reservationPolicy": "Advance booking required by 1pm Saturday. £5 per person deposit required at time of booking, balance due on arrival.",
            "hasMenu": {
              "@type": "Menu",
              "name": "Sunday Roast Menu",
              "description": "Traditional British Sunday roast dinners",
              "hasMenuSection": {
                "@type": "MenuSection",
                "name": "Sunday Roasts",
                "description": "Served with roast potatoes, Yorkshire pudding, vegetables and gravy",
                "hasMenuItem": [
                  {
                    "@type": "MenuItem",
                    "name": "Roasted Chicken",
                    "description": "Oven-roasted chicken breast with sage & onion stuffing balls",
                    "offers": {
                      "@type": "Offer",
                      "price": "14.99",
                      "priceCurrency": "GBP",
                      "availability": "https://schema.org/PreOrder"
                    },
                    "nutrition": generateNutritionInfo("Roasted Chicken", "sunday-roast")
                  },
                  {
                    "@type": "MenuItem",
                    "name": "Slow-Cooked Lamb Shank",
                    "description": "Tender slow-braised lamb shank in rich red wine gravy",
                    "offers": {
                      "@type": "Offer",
                      "price": "15.49",
                      "priceCurrency": "GBP"
                    }
                  },
                  {
                    "@type": "MenuItem",
                    "name": "Crispy Pork Belly",
                    "description": "Crispy crackling and tender slow-roasted pork belly with Bramley apple sauce",
                    "offers": {
                      "@type": "Offer",
                      "price": "15.99",
                      "priceCurrency": "GBP"
                    }
                  },
                  {
                    "@type": "MenuItem",
                    "name": "Beetroot & Butternut Squash Wellington",
                    "description": "Golden puff pastry filled with beetroot & butternut squash (Vegan)",
                    "offers": {
                      "@type": "Offer",
                      "price": "15.49",
                      "priceCurrency": "GBP"
                    },
                    "suitableForDiet": ["https://schema.org/VeganDiet", "https://schema.org/VegetarianDiet"]
                  }
                ]
              },
              "inLanguage": "en-GB"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "127",
              "bestRating": "5",
              "worstRating": "1"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "Offer",
            "name": "Sunday Roast Pre-Order Special",
            "description": "Traditional British Sunday roast dinners with all the trimmings. Sunday roasts require a booking with £5 per person deposit by 1pm Saturday.",
            "url": "https://www.the-anchor.pub/sunday-lunch",
            "priceCurrency": "GBP",
            "priceRange": "£14.99 - £15.99",
            "eligibleRegion": {
              "@type": "Place",
              "name": "Stanwell Moor and surrounding areas"
            },
            "availableAtOrFrom": {
              "@type": "Place",
              "name": "The Anchor",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Horton Road",
                "addressLocality": "Stanwell Moor",
                "addressRegion": "Surrey",
                "postalCode": "TW19 6AQ"
              }
            },
            "itemOffered": {
              "@type": "MenuItem",
              "name": "Sunday Roast Selection",
              "description": "Choice of roasted meats served with Yorkshire pudding, roast potatoes, seasonal vegetables and gravy"
            },
            "validFrom": "12:00",
            "validThrough": "17:00",
            "eligibleDuration": {
              "@type": "Duration",
              "description": "Available Sundays only"
            },
            "availabilityStarts": "2025-01-01",
            "availabilityEnds": "2025-12-31",
            "seller": {
              "@id": "https://www.the-anchor.pub/#business"
            },
            "priceSpecification": {
              "@type": "CompoundPriceSpecification",
              "priceComponent": [
                {
                  "@type": "UnitPriceSpecification",
                  "name": "Deposit",
                  "price": "5.00",
                  "priceCurrency": "GBP",
                  "unitText": "per person",
                  "description": "Required at time of booking"
                },
                {
                  "@type": "UnitPriceSpecification",
                  "name": "Balance",
                  "priceCurrency": "GBP",
                  "unitText": "per person",
                  "description": "Payable on arrival"
                }
              ]
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Sunday Roast Options",
            "itemListElement": sundayRoastItems.map(item => ({
              "@type": "ListItem",
              "position": item.position,
              "name": item.name,
              "description": item.description,
              "url": item.url
            }))
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.the-anchor.pub"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Sunday Lunch",
                "item": "https://www.the-anchor.pub/sunday-lunch"
              }
            ]
          }
        ])
        }}
      />

      <FoodStickyCtaBar
        ctaContext="sunday_roast"
        whatsapp={{
          href: 'https://wa.me/441753682707?text=Hi%20Anchor%20Team!%20I%27d%20like%20to%20book%20for%20Sunday%20Roast.',
          label: 'WhatsApp Roast Team',
          id: 'whatsapp_sunday_roast'
        }}
        label="Book Sunday Roast"
      />
    </>
  )
}

import Link from 'next/link'
import { Metadata } from 'next'
import { Container, Section, Card, CardBody, Alert } from '@/components/ui'
import { CTASection, SectionHeader, FeatureGrid } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { HeroWrapper } from '@/components/hero'
import { MenuAnchorNav } from '@/components/food/MenuAnchorNav'
import { MenuSectionCta } from '@/components/food/MenuSectionCta'
import { FilteredMenuRenderer } from '@/components/FilteredMenuRenderer'
import { MenuPageTracker } from '@/components/MenuPageTracker'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { SpeakableContent } from '@/components/voice/SpeakableContent'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { parseMenuMarkdown } from '@/lib/menu-parser'
import { getBusinessHours, isKitchenOpen, type BusinessHours } from '@/lib/api'
import { formatTime12Hour } from '@/lib/time-utils'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { specialAnnouncementSchema } from '@/lib/schema'
import { DEFAULT_PIZZA_IMAGE } from '@/lib/image-fallbacks'
import { generateMenuItemOffer, generateNutritionInfo, generateSuitableForDiet } from '@/lib/schema-utils'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'

const HERO_GRADIENT =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%230f1e14"/><stop offset="50%" stop-color="%231c3a2a"/><stop offset="100%" stop-color="%230f1e14"/></linearGradient></defs><rect width="800" height="600" fill="url(%23g)"/></svg>'

const ANCHOR_LINKS = [
  { id: 'sunday-roast', label: 'Sunday Roast', icon: '🍖' },
  { id: 'pizza-tuesday', label: 'Pizza Tuesday', icon: '🍕' },
  { id: 'pub-classics', label: 'Pub Classics', icon: '🍔' },
  { id: 'dietary', label: 'Veggie & Gluten-Friendly', icon: '🌱' },
  { id: 'near-heathrow', label: 'Near Heathrow', icon: '✈️' }
]

const MENU_SECTION_LIST = [
  {
    position: 1,
    name: 'Sunday Roasts',
    url: 'https://www.the-anchor.pub/food-menu#sunday-roast'
  },
  {
    position: 2,
    name: 'Pizza Tuesday',
    url: 'https://www.the-anchor.pub/food-menu#pizza-tuesday'
  },
  {
    position: 3,
    name: 'Pub Classics',
    url: 'https://www.the-anchor.pub/food-menu#pub-classics'
  },
  {
    position: 4,
    name: 'Vegetarian & Gluten-Friendly',
    url: 'https://www.the-anchor.pub/food-menu#dietary'
  },
  {
    position: 5,
    name: 'Near Heathrow',
    url: 'https://www.the-anchor.pub/food-menu#near-heathrow'
  }
]

function buildKitchenSchedule(hours: BusinessHours): string {
  const schedule: string[] = []

  const weekdays: Array<keyof BusinessHours['regularHours']> = ['tuesday', 'wednesday', 'thursday', 'friday']
  const weekdayHours = weekdays
    .map(day => {
      const dayHours = hours.regularHours[day]
      if (!dayHours?.kitchen || !isKitchenOpen(dayHours.kitchen)) return null
      return {
        day,
        opens: formatTime12Hour(dayHours.kitchen.opens),
        closes: formatTime12Hour(dayHours.kitchen.closes)
      }
    })
    .filter(Boolean) as Array<{ day: string; opens: string; closes: string }>

  if (
    weekdayHours.length === weekdays.length &&
    weekdayHours.every(h => h.opens === weekdayHours[0].opens && h.closes === weekdayHours[0].closes)
  ) {
    schedule.push(`Tuesday to Friday ${weekdayHours[0].opens}-${weekdayHours[0].closes}`)
  } else {
    weekdayHours.forEach(h => {
      schedule.push(`${h.day.charAt(0).toUpperCase() + h.day.slice(1)} ${h.opens}-${h.closes}`)
    })
  }

  const saturdayHours = hours.regularHours.saturday?.kitchen
  if (saturdayHours && isKitchenOpen(saturdayHours)) {
    schedule.push(`Saturday ${formatTime12Hour(saturdayHours.opens)}-${formatTime12Hour(saturdayHours.closes)}`)
  }

  const sundayHours = hours.regularHours.sunday?.kitchen
  if (sundayHours && isKitchenOpen(sundayHours)) {
    schedule.push(`Sunday ${formatTime12Hour(sundayHours.opens)}-${formatTime12Hour(sundayHours.closes)}`)
  }

  return schedule.join(', ') || 'Please check our current hours'
}

export const metadata: Metadata = {
  title: 'Heathrow Pub Food Menu & Sunday Roasts | The Anchor',
  description: "See The Anchor's full menu 7 minutes from Heathrow: Sunday roasts, 2-for-1 Pizza Tuesday, pub classics and veggie options. Book your table with free parking.",
  keywords: 'heathrow food menu, sunday roast near heathrow airport, pub food near me heathrow, pizza tuesday deal heathrow, book table the anchor',
  openGraph: {
    title: 'Heathrow Pub Food Menu & Sunday Roasts',
    description: "Browse The Anchor's menu near Heathrow: Sunday roasts, stone-baked pizzas and pub favourites with free parking. Reserve your table today.",
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Heathrow Pub Food Menu & Sunday Roasts',
    description: "Explore The Anchor's menu minutes from Heathrow: Sunday roasts, Pizza Tuesday deal and pub classics. Book a table with free parking.",
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
  }),
  alternates: {
    canonical: '/food-menu'
  }
}

const pizzaBogofSchema = {
  '@context': 'https://schema.org',
  '@type': 'Offer',
  name: 'Buy One Get One Free Pizza - Every Tuesday',
  description: 'BOGOF on all stone-baked pizzas every Tuesday at The Anchor. Dine-in and takeaway available.',
  url: 'https://www.the-anchor.pub/food-menu#pizza-tuesday',
  priceCurrency: 'GBP',
  eligibleRegion: {
    '@type': 'Place',
    name: 'Stanwell Moor, Staines, Ashford, Feltham, and surrounding Surrey areas'
  },
  availabilityStarts: '2025-01-01',
  availabilityEnds: '2025-12-31',
  validFrom: '16:00',
  validThrough: '22:00',
  dayOfWeek: 'https://schema.org/Tuesday',
  itemOffered: {
    '@type': 'Product',
    name: 'Stone-Baked Pizzas',
    category: 'Pizza',
    description: 'Stone-baked pizzas with hand-stretched dough, rich tomato sauce and generous toppings available at The Anchor near Heathrow.',
    image: `https://www.the-anchor.pub${DEFAULT_PIZZA_IMAGE}`,
    offers: {
      '@type': 'Offer',
      name: 'Tuesday Pizza BOGOF',
      description: 'Buy one get one free on all pizzas every Tuesday',
      price: '9.99',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      url: 'https://www.the-anchor.pub/food-menu#pizza-tuesday'
    }
  },
  seller: {
    '@type': 'LocalBusiness',
    name: 'The Anchor',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Stanwell Moor',
      addressRegion: 'Surrey'
    }
  }
}

const fridayFishOfferSchema = {
  '@context': 'https://schema.org',
  '@type': 'Offer',
  name: '50% Off Fish & Chips for Over 65s - Every Friday',
  description: 'Half price fish and chips for senior citizens every Friday at The Anchor.',
  url: 'https://www.the-anchor.pub/food-menu#pub-classics',
  priceCurrency: 'GBP',
  eligibleRegion: {
    '@type': 'Place',
    name: 'Stanwell Moor and surrounding areas'
  },
  eligibleCustomerType: 'Senior Citizens (65+)',
  dayOfWeek: 'https://schema.org/Friday',
  seller: {
    '@type': 'LocalBusiness',
    name: 'The Anchor'
  }
}

export default async function FoodMenuPage() {
  const [menuData, businessHours] = await Promise.all([
    parseMenuMarkdown('food'),
    getBusinessHours()
  ])

  if (!menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Menu temporarily unavailable. Please call us on 01753 682707.</p>
      </div>
    )
  }

  const kitchenSchedule = businessHours
    ? buildKitchenSchedule(businessHours)
    : 'Tuesday to Friday 6pm-9pm, Saturday 1pm-7pm, Sunday 12pm-5pm'

  const heroImage = {
    src: HERO_GRADIENT,
    alt: 'Green gradient backdrop'
  }

  return (
    <>
      <SpeakableSchema />
      <MenuPageTracker
        menuType="food"
        specialOffers={[
          'Buy One Get One Free Pizza - Every Tuesday',
          '50% Off Fish & Chips for Over 65s - Every Friday'
        ]}
      />
      <ScrollDepthTracker />

      <HeroWrapper
        route="/food-menu"
        title="Book Pub Food Minutes from Heathrow"
        description="Sunday roasts, 2-for-1 Pizza Tuesday and proper pub classics with free parking and rapid service."
        size="small"
        alignment="center"
        showStatusBar
        image={heroImage}
        breadcrumbs={[{ name: 'Food & Drink' }]}
        tags={[
          { label: '🍖 Roast pre-orders', variant: 'default' },
          { label: '🍕 2-for-1 Pizza Tuesday', variant: 'default' },
          { label: '🍺 Pub classics', variant: 'default' },
          { label: '🌱 Veggie friendly', variant: 'default' }
        ]}
        cta={
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            data-sticky-cta-guard="true"
          >
            <BookTableButton
              source="food_menu_hero"
              context="food"
              variant="primary"
              size="lg"
              className="sm:w-auto"
              trackingLabel="Hero Book a Table"
            >
              Book a Table
            </BookTableButton>
            <MenuSectionCta
              label="View Full Menu"
              scrollToId="menu"
              analyticsLabel="view_full_menu"
              location="food_menu_hero"
              variant="outline"
              fullWidth
            />
          </div>
        }
      >
        <p className="mt-6 text-sm sm:text-base text-white/80 max-w-2xl mx-auto">
          Working nearby or passing through Heathrow? Pop in for proper pub food, quick service, and free parking.
        </p>
      </HeroWrapper>

      <Section background="white" spacing="sm">
        <Container>
          <MenuAnchorNav links={ANCHOR_LINKS} />
        </Container>
      </Section>

      <div id="menu" className="section-spacing bg-white">
        <Container>
          <SectionHeader
            title="Full Food Menu"
            subtitle="Use the dietary filters to tailor the menu to your table."
            align="center"
            className="mb-10"
          />
          <FilteredMenuRenderer menuData={menuData} accentColor="anchor-gold" />
        </Container>
      </div>

      <Section background="white" spacing="md">
        <Container>
          <SectionHeader
            title="What Guests Book Us For"
            subtitle="Choose the section that matches your plans and pre-book to guarantee your table."
          />
          <SpeakableContent selector="menu-highlights" priority="high">
            <FeatureGrid
              columns={4}
              features={[
                {
                  icon: '🍖',
                  title: 'Signature Sunday Roast',
                  description: (
                    <>
                      Book by 1pm Saturday to lock in roasts with Yorkshires, crispy spuds, and rich gravy.
                      <Link
                        href="/sunday-lunch"
                        className="mt-2 block text-anchor-gold font-semibold hover:text-anchor-green transition"
                      >
                        View roast options →
                      </Link>
                    </>
                  ),
                  className: 'text-left bg-anchor-cream/60 rounded-2xl p-6 shadow-sm'
                },
                {
                  icon: '🍕',
                  title: 'Pizza Tuesday BOGOF',
                  description: (
                    <>
                      Hand-stretched dough, stone-baked, and two-for-one every Tuesday evening.
                      <Link
                        href="/pizza-tuesday"
                        className="mt-2 block text-anchor-gold font-semibold hover:text-anchor-green transition"
                      >
                        Read the deal →
                      </Link>
                    </>
                  ),
                  className: 'text-left bg-white rounded-2xl p-6 shadow-sm'
                },
                {
                  icon: '🍔',
                  title: 'Pub Classics, Fast',
                  description: 'Order at the bar or from your table — mains land within 15 minutes.',
                  className: 'text-left bg-white rounded-2xl p-6 shadow-sm'
                },
                {
                  icon: '🌱',
                  title: 'Veggie & Gluten-Friendly',
                  description: 'Dedicated mains, salads and gluten-aware bases. Ask us about allergens anytime.',
                  className: 'text-left bg-white rounded-2xl p-6 shadow-sm'
                }
              ]}
            />
          </SpeakableContent>
        </Container>
      </Section>

      <Section background="white" spacing="sm">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-anchor-cream/60">
              <CardBody>
                <blockquote className="text-lg font-semibold text-anchor-green">
                  “Sunday lunch was faultless — Yorkshire puddings like clouds, quick service, and the team could not do enough for us.”
                </blockquote>
                <p className="mt-4 text-sm text-gray-600">Google review · August 2025</p>
              </CardBody>
            </Card>
            <Card className="bg-white">
              <CardBody>
                <blockquote className="text-lg font-semibold text-anchor-green">
                  “We stopped on the way past Heathrow. Proper food, fair prices, and parking was a breeze — booked again for next month.”
                </blockquote>
                <p className="mt-4 text-sm text-gray-600">Tripadvisor review · July 2025</p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="md" id="sunday-roast">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] items-start">
            <Card className="bg-white shadow-md">
              <CardBody>
                <SectionHeader
                  title="Sunday Roast Near Heathrow"
                  subtitle="Book by 1pm Saturday to secure your favourite roast and all the trimmings."
                  align="left"
                  className="mb-6"
                />
                <ul className="space-y-3 text-gray-700">
                  <li>• Beef, chicken, lamb and vegetarian roasts with lashings of gravy.</li>
                  <li>• £5 deposit secures your table — ideal for families and group catch-ups.</li>
                  <li>• Kids portions, high chairs and activity packs on request.</li>
                </ul>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <BookTableButton
                    source='food_menu_roast_preorder'
                    context='sunday_roast'
                    variant='primary'
                    size='lg'
                    className='sm:w-auto'
                    trackingLabel='Pre-Order Roast'
                  >
                    Pre-Order Roast
                  </BookTableButton>
                  <MenuSectionCta
                    label="View Roast Menu"
                    href="/sunday-lunch"
                    analyticsLabel="view_roast_menu"
                    location="food_menu_roast_section"
                    variant="outline"
                    fullWidth
                  />
                </div>
              </CardBody>
            </Card>
            <Card className="bg-anchor-cream/40 shadow-md">
              <CardBody>
                <h3 className="text-lg font-semibold text-anchor-green mb-3">Sunday Serving Notes</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><strong>Service:</strong> 12pm–5pm every Sunday.</li>
                  <li><strong>Deposits:</strong> £5 per guest, deducted from your bill.</li>
                  <li><strong>Gluten-aware:</strong> Alternative gravy available — just ask.</li>
                  <li><strong>Extras:</strong> Add cauliflower cheese, extra Yorkies, or seasonal puds.</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="md" id="pizza-tuesday">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] items-start">
            <Card className="bg-anchor-cream/40 shadow-md">
              <CardBody>
                <SectionHeader
                  title="2-for-1 Pizza Tuesday"
                  subtitle="Hand-stretched bases, San Marzano sauce, and a free pizza with every order."
                  align="left"
                  className="mb-6"
                />
                <ul className="space-y-3 text-gray-700">
                  <li>• Offer runs all evening during kitchen hours.</li>
                  <li>• Mix and match toppings — dine in or takeaway with free parking.</li>
                  <li>• Gluten-aware bases available when you pre-book.</li>
                </ul>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <BookTableButton
                    source='food_menu_pizza_cta'
                    context='pizza_tuesday'
                    variant='primary'
                    size='lg'
                    className='sm:w-auto'
                    trackingLabel='Reserve Pizza Tuesday'
                  >
                    Reserve for Tuesday
                  </BookTableButton>
                  <MenuSectionCta
                    label="Deal Details"
                    href="/pizza-tuesday"
                    analyticsLabel="deal_details"
                    location="food_menu_pizza_section"
                    variant="outline"
                    fullWidth
                  />
                </div>
              </CardBody>
            </Card>
            <Card className="bg-white shadow-md">
              <CardBody>
                <h3 className="text-lg font-semibold text-anchor-green mb-3">Pizza Highlights</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><strong>Margherita:</strong> Buffalo mozzarella, basil, and our house tomato sauce.</li>
                  <li><strong>Fully Loaded:</strong> Pepperoni, ham, mushrooms and peppers in every slice.</li>
                  <li><strong>Nice &amp; Spicy:</strong> Jalapeños and nduja for those who like heat.</li>
                  <li><strong>Garden Club:</strong> Veggie-friendly with grilled courgette and peppers.</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="md" id="pub-classics">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] items-start">
            <Card className="bg-white shadow-md">
              <CardBody>
                <SectionHeader
                  title="Pub Classics Done Properly"
                  subtitle="Order at the bar or from your table — mains usually land within 15 minutes."
                  align="left"
                  className="mb-6"
                />
                <ul className="space-y-3 text-gray-700">
                  <li>• Beer-battered fish &amp; chips with minted peas and tartar sauce.</li>
                  <li>• Double-stacked burgers with thick-cut chips and optional upgrades.</li>
                  <li>• Chicken katsu, pies, curries and hearty pub favourites served hot.</li>
                  <li>• Quick enough for lunch breaks or pre-flight dinners.</li>
                </ul>
                <div className="mt-6 max-w-xs">
                  <BookTableButton
                    source='food_menu_classics_cta'
                    context='food'
                    variant='primary'
                    size='lg'
                    trackingLabel='Book Dinner Table'
                  >
                    Book a Table for Dinner
                  </BookTableButton>
                </div>
              </CardBody>
            </Card>
            <Card className="bg-anchor-cream/30 shadow-md">
              <CardBody>
                <h3 className="text-lg font-semibold text-anchor-green mb-3">Kitchen Today</h3>
                <p className="text-sm text-gray-700">
                  Kitchen open: {kitchenSchedule}. Call ahead on <a href="tel:+441753682707" className="text-anchor-gold font-semibold hover:text-anchor-green">01753 682707</a> for large parties.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="md" id="dietary">
        <Container>
          <Card className="bg-white shadow-md">
            <CardBody>
              <SectionHeader
                title="Vegetarian & Gluten-Friendly Picks"
                subtitle="Dedicated veggie mains, salads, pizzas with gluten-aware bases, and staff ready to help with any allergen query."
                align="left"
                className="mb-6"
              />
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Veggie stack burger with charred peppers and a toasted brioche bun.</li>
                    <li>• Garden Club pizza with grilled courgette, peppers, and balsamic glaze.</li>
                    <li>• Fresh salads with optional grilled chicken or halloumi.</li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Gluten-aware pizza bases available when pre-booked.</li>
                    <li>• Allergen matrix on hand — just ask the team.</li>
                    <li>• Vegetarian roast available every Sunday.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 max-w-xs">
                <MenuSectionCta
                  label="View Dietary Picks"
                  href="?veg=1#menu"
                  analyticsLabel="dietary_picks"
                  location="food_menu_dietary_section"
                  variant="outline"
                  fullWidth
                />
              </div>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <Section background="white" spacing="md" id="near-heathrow">
        <Container>
          <Card className="bg-anchor-cream/60 shadow-md">
            <CardBody>
              <SectionHeader
                title="Near Heathrow"
                subtitle="Ideal for crews, airport teams, and anyone passing through — no airport prices, no parking stress."
                align="left"
                className="mb-6"
              />
              <ul className="space-y-3 text-gray-700">
                <li>• 7 minutes to Terminal 5 by taxi.</li>
                <li>• 11 minutes to Terminals 2 &amp; 3 avoiding car-park queues.</li>
                <li>• Free on-site parking with downloadable receipts.</li>
                <li>• Most meals served within 15 minutes.</li>
              </ul>
              <div className="mt-6 max-w-xs">
                <MenuSectionCta
                  label="Plan Your Pre-Flight Meal"
                  href="/heathrow-layover-dining"
                  analyticsLabel="near_heathrow"
                  location="food_menu_heathrow_section"
                  variant="outline"
                  fullWidth
                />
              </div>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <Section background="gray" spacing="md">
        <Container>
          <Alert
            variant="warning"
            title="Allergen Information"
            className="max-w-4xl mx-auto"
          >
            <p className="text-gray-700">
              Gluten-aware bases and vegetarian mains are available. All dishes are prepared in a single kitchen where allergens are present — speak to us about your needs before ordering.
            </p>
          </Alert>
        </Container>
      </Section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'What time is the kitchen open at The Anchor?',
            answer: `Our kitchen is open ${kitchenSchedule}. The kitchen is closed on Mondays.`
          },
          {
            question: 'Do you serve Sunday roast at The Anchor?',
            answer: 'Yes. Sunday roasts run 12pm–5pm with beef, chicken, lamb, and vegetarian plates. Book by 1pm Saturday with a £5 deposit per guest.'
          },
          {
            question: "Is there a children's menu?",
            answer: "We have smaller portions, high chairs, and colouring packs on request."
          },
          {
            question: "What's the Tuesday pizza deal?",
            answer: "Every Tuesday evening is buy-one-get-one-free on all pizzas for dine-in or takeaway."
          },
          {
            question: 'Do you cater for dietary requirements?',
            answer: 'Yes. Vegetarian dishes are marked and we can guide you through allergens at the bar.'
          },
          {
            question: 'Can I book a table for food?',
            answer: 'Absolutely. Reserve online or call 01753 682707 — ideal for larger groups or pre-flight meals.'
          },
          {
            question: 'Is takeaway available?',
            answer: 'Yes. Call ahead and we will have your order ready for collection.'
          }
        ]}
        className="bg-white"
      />

      <div data-sticky-cta-guard="true">
        <CTASection
          title="Hungry? Book Your Table Now"
          description="Weekends and roast services fill quickly. Book today and we will have your table ready."
          buttons={[
            {
              text: '📞 Call: 01753 682707',
              href: 'tel:+441753682707',
              variant: 'white',
              isPhone: true,
              phoneSource: 'food_menu_footer'
            },
            {
              text: '🍺 View Drinks Menu',
              href: '/drinks',
              variant: 'white'
            }
          ]}
          variant="green"
        />
      </div>

      <FoodStickyCtaBar
        ctaContext="food"
        label="Book a Table"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'Menu',
              '@id': 'https://www.the-anchor.pub/food-menu#menu',
              name: 'The Anchor Food Menu',
              description: 'Traditional British food menu with allergen information',
              hasMenuSection: menuData.categories.map(category => ({
                '@type': 'MenuSection',
                name: category.title,
                description: category.description,
                hasMenuItem: category.sections.flatMap(section =>
                  section.items.map(item => ({
                    '@type': 'MenuItem',
                    name: item.name,
                    description: item.description,
                    offers: generateMenuItemOffer(item, new Date().toLocaleString('en-GB', { weekday: 'long' }))?.[0] ?? {
                      '@type': 'Offer',
                      price: item.price ? item.price.replace(/£/g, '').trim() : undefined,
                      priceCurrency: 'GBP'
                    },
                    suitableForDiet: generateSuitableForDiet(item),
                    nutrition: generateNutritionInfo(item.name, category.id)
                  }))
                )
              }))
            },
            {
              '@context': 'https://schema.org',
              '@type': 'Restaurant',
              '@id': 'https://www.the-anchor.pub/#business',
              name: 'The Anchor',
              description: 'Traditional British pub restaurant near Heathrow Airport',
              servesCuisine: ['British', 'Pizza', 'Pub Food'],
              hasMenu: {
                '@id': 'https://www.the-anchor.pub/food-menu#menu'
              },
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Horton Road',
                addressLocality: 'Stanwell Moor',
                addressRegion: 'Surrey',
                postalCode: 'TW19 6AQ',
                addressCountry: 'GB'
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 51.462509,
                longitude: -0.502067
              },
              openingHoursSpecification: businessHours
                ? [
                    {
                      '@type': 'OpeningHoursSpecification',
                      name: 'Kitchen Hours',
                      dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                      opens: '18:00',
                      closes: '21:00'
                    },
                    {
                      '@type': 'OpeningHoursSpecification',
                      name: 'Kitchen Hours',
                      dayOfWeek: 'Saturday',
                      opens: '13:00',
                      closes: '19:00'
                    },
                    {
                      '@type': 'OpeningHoursSpecification',
                      name: 'Kitchen Hours',
                      dayOfWeek: 'Sunday',
                      opens: '12:00',
                      closes: '17:00'
                    }
                  ]
                : [],
              telephone: '+441753682707',
              url: 'https://www.the-anchor.pub',
              priceRange: '££'
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What time is the kitchen open at The Anchor?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Our kitchen is open ${kitchenSchedule}. The kitchen is closed on Mondays.`
                  }
                },
                {
                  '@type': 'Question',
                  name: 'Do you serve Sunday roast at The Anchor?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. Sunday roasts run 12pm–5pm with beef, chicken, lamb, and vegetarian plates. Book by 1pm Saturday with a £5 deposit per guest.'
                  }
                },
                {
                  '@type': 'Question',
                  name: "Is there a children's menu?",
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: "We have smaller portions, high chairs, and colouring packs on request."
                  }
                },
                {
                  '@type': 'Question',
                  name: "What's the Tuesday pizza deal?",
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Every Tuesday evening is buy-one-get-one-free on all pizzas for dine-in or takeaway.'
                  }
                }
              ]
            },
            {
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: 'Food Menu Sections',
              itemListElement: MENU_SECTION_LIST.map(section => ({
                '@type': 'ListItem',
                position: section.position,
                name: section.name,
                url: section.url
              }))
            },
            specialAnnouncementSchema,
            pizzaBogofSchema,
            fridayFishOfferSchema
          ])
        }}
      />
    </>
  )
}

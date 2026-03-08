import Link from 'next/link'
import { Metadata } from 'next'
import { Container, Section, Card, CardBody, Alert } from '@/components/ui'
import { CTASection, SectionHeader, FeatureGrid } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { HeroWrapper } from '@/components/hero'
import { MenuAnchorNav } from '@/components/food/MenuAnchorNav'
import { MenuSectionCta } from '@/components/food/MenuSectionCta'
import { FilteredMenuRenderer } from '@/components/FilteredMenuRenderer'
import { MenuPageTracker } from '@/components/tracking/MenuPageTracker'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { SpeakableContent } from '@/components/voice/SpeakableContent'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { parseMenuMarkdown } from '@/lib/menu-parser'
import { getBusinessHours, isKitchenOpen, type BusinessHours } from '@/lib/api'
import { formatTime12Hour } from '@/lib/time-utils'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { specialAnnouncementSchema } from '@/lib/schema'
import { generateKitchenHoursSpecification, generateMenuItemOffer, generateNutritionInfo, generateSuitableForDiet } from '@/lib/schema-utils'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TrustBar, UrgencyKitchenStatus, ValueProofStrip } from '@/components/psychology'
import type { KitchenStatusData } from '@/components/psychology'

export const revalidate = 3600 // Revalidate every hour

const ANCHOR_LINKS = [
  { id: 'sunday-roast', label: 'Sunday Roast', icon: '🍖' },
  { id: 'pizza', label: 'Pizza Menu', icon: '🍕' },
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
    name: 'Pizza Menu',
    url: 'https://www.the-anchor.pub/food-menu#pizza'
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

function buildKitchenHoursMap(hours: BusinessHours): Record<string, string> | null {
  const schedule: Record<string, string> = {}

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
    schedule['Tuesday to Friday'] = `${weekdayHours[0].opens}-${weekdayHours[0].closes}`
  } else {
    weekdayHours.forEach(h => {
      schedule[h.day.charAt(0).toUpperCase() + h.day.slice(1)] = `${h.opens}-${h.closes}`
    })
  }

  const saturdayHours = hours.regularHours.saturday?.kitchen
  if (saturdayHours && isKitchenOpen(saturdayHours)) {
    schedule.Saturday = `${formatTime12Hour(saturdayHours.opens)}-${formatTime12Hour(saturdayHours.closes)}`
  }

  const sundayHours = hours.regularHours.sunday?.kitchen
  if (sundayHours && isKitchenOpen(sundayHours)) {
    schedule.Sunday = `${formatTime12Hour(sundayHours.opens)}-${formatTime12Hour(sundayHours.closes)}`
  }

  return Object.keys(schedule).length ? schedule : null
}

function buildKitchenSchedule(hours: BusinessHours): string {
  const schedule = buildKitchenHoursMap(hours)
  if (!schedule) return ''
  return Object.entries(schedule)
    .map(([day, time]) => `${day} ${time}`)
    .join(', ')
}

function deriveKitchenStatusData(hours: BusinessHours | null): KitchenStatusData {
  if (!hours) return null

  const londonNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' }))
  const day = londonNow.getDay() // 0=Sun, 1=Mon, 2=Tue...6=Sat

  // Monday - kitchen always closed
  if (day === 1) return { type: 'closed-today' }

  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
  const dayKey = dayKeys[day] as keyof typeof hours.regularHours

  const dayHours = hours.regularHours[dayKey]
  if (!dayHours || (dayHours as any).is_closed) return { type: 'closed-today' }

  const kitchen = (dayHours as any).kitchen
  if (!kitchen || (kitchen as any).is_closed) return { type: 'closed-today' }

  if (!kitchen.opens || !kitchen.closes) return null

  const nowMinutes = londonNow.getHours() * 60 + londonNow.getMinutes()
  const [openH, openM] = kitchen.opens.split(':').map(Number)
  const [closeH, closeM] = kitchen.closes.split(':').map(Number)
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM

  const closesAtFormatted = formatTime12Hour(kitchen.closes)
  const opensAtFormatted = formatTime12Hour(kitchen.opens)

  if (nowMinutes < openMinutes) {
    return { type: 'opens-later', opensAt: opensAtFormatted }
  }
  if (nowMinutes >= closeMinutes) {
    return { type: 'closed-today' }
  }
  // Within 2 hours of closing
  if (closeMinutes - nowMinutes <= 120) {
    return { type: 'closing-soon', closesAt: closesAtFormatted }
  }
  return { type: 'open', closesAt: closesAtFormatted }
}

export const metadata: Metadata = {
  title: 'Pub Food Menu Near Heathrow | Sunday Roast, Pizza & Fish & Chips | The Anchor',
  description: 'Full pub food menu: Sunday roasts from £19.99, stone-baked pizzas, fish & chips & burgers. 7 mins from Heathrow, free parking. View menu & book a table online.',
  keywords: 'pub food menu near heathrow, sunday roast near heathrow, pizza near heathrow, fish and chips near heathrow, the anchor menu, pub food stanwell moor',
  openGraph: {
    title: 'Pub Food Menu Near Heathrow | Sunday Roast, Pizza & Fish & Chips | The Anchor',
    description: 'Full pub food menu: Sunday roasts from £19.99, stone-baked pizzas, fish & chips & burgers. 7 mins from Heathrow, free parking. Book a table online.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Food Menu | Pub Food, Sunday Roast & Pizza',
    description: "Explore The Anchor food menu near Staines and Heathrow: Sunday roast, pizza menu, pub classics and vegetarian options with free parking.",
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
  }),
  alternates: {
    canonical: '/food-menu'
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
  const kitchenHoursSpecification = generateKitchenHoursSpecification(businessHours)

  if (!menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-anchor-bg">
        <p className="text-xl text-anchor-cream-text/70">Menu temporarily unavailable. Please call us on 01753 682707.</p>
      </div>
    )
  }

  const kitchenHoursMap = businessHours ? buildKitchenHoursMap(businessHours) : null
  const kitchenSchedule = businessHours ? buildKitchenSchedule(businessHours) : null
  const kitchenStatusData = deriveKitchenStatusData(businessHours)
  const sundayKitchen = businessHours?.regularHours?.sunday?.kitchen
  const sundayKitchenHours = sundayKitchen && isKitchenOpen(sundayKitchen)
    ? `${formatTime12Hour(sundayKitchen.opens)}-${formatTime12Hour(sundayKitchen.closes)}`
    : null
  const menuDataWithKitchenHours = {
    ...menuData,
    ...(kitchenHoursMap ? { kitchenHours: kitchenHoursMap } : {})
  }

  const faqItems = [
    {
      question: 'What time is the kitchen open at The Anchor?',
      answer: kitchenSchedule
        ? `Our kitchen is open ${kitchenSchedule}.`
        : 'Our kitchen hours are updated live on this page.'
    },
    {
      question: 'Where can I view your food menu or pub menu online?',
      answer: 'You can view the full food menu and pub menu on this page. Use the filters for vegetarian menu and gluten free menu options, then book a table when you are ready.'
    },
	    {
	      question: 'Do you serve Sunday roast at The Anchor?',
	      answer: sundayKitchenHours
	        ? `Yes. Sunday roast and Sunday lunch service runs ${sundayKitchenHours} with beef, chicken, lamb, and vegetarian plates. Pre-order by 1pm Saturday. Sunday lunch bookings require a £10 per person deposit.`
	        : 'Yes. Sunday roast and Sunday lunch service runs during our Sunday kitchen hours with beef, chicken, lamb, and vegetarian plates. Pre-order by 1pm Saturday. Sunday lunch bookings require a £10 per person deposit.'
	    },
    {
      question: "Is there a children's menu?",
      answer: 'We have smaller portions, high chairs, and colouring packs on request.'
    },
    {
      question: 'Do you serve fish & chips?',
      answer: 'Yes. Our pub food menu includes beer-battered fish & chips with tartar sauce and chunky chips, plus gluten free options on request.'
    },
    {
      question: 'Do you cater for dietary requirements?',
      answer: 'Yes. We offer vegetarian menu choices and gluten free menu options, and we can guide you through allergens at the bar.'
    },
    {
      question: 'Can I book a table for food?',
      answer: 'Absolutely. Reserve online or call 01753 682707 — ideal for larger groups or pre-flight meals.'
    },
    {
      question: 'Is takeaway available?',
      answer: 'Yes. Call ahead and we will have your order ready for collection from the same food menu.'
    },
    {
      question: 'Where can I find a British pub food menu near Staines?',
      answer: 'The Anchor in Stanwell Moor is a 10-minute drive from Staines-upon-Thames and serves classic British pub dishes, Sunday roast, fish & chips, and a stone-baked pizza menu.'
    },
    {
      question: 'Do you offer Sunday roasts for Staines locals?',
      answer: 'Yes. Our Sunday roasts are popular with Staines guests; book by 1pm Saturday to reserve your table.'
    }
  ]

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Food Menu', url: '/food-menu' }
        ]}
      />
      <SpeakableSchema />
      <MenuPageTracker
        menuType="food"
        specialOffers={[
          '50% Off Fish & Chips for Over 65s - Every Friday'
        ]}
      />
      <ScrollDepthTracker />

      <HeroWrapper
        route="/food-menu"
        title="Book Pub Food Minutes from Heathrow"
        description="Sunday roasts from £19.99, stone-baked pizzas and proper pub classics. Free parking, 7 mins from Heathrow — no airport prices."
        variant="default"
        breadcrumbs={[{ name: 'Food & Drink' }]}
        tags={[
          { label: '🍖 Roast pre-orders', variant: 'default' },
          { label: '🍕 Stone-baked pizzas', variant: 'default' },
          { label: '🍺 Pub classics', variant: 'default' },
          { label: '🌱 Veggie friendly', variant: 'default' }
        ]}
        ctaContainerClassName="gap-4 sm:items-center"
        ctaContainerProps={{ 'data-sticky-cta-guard': 'true' }}
        primaryCta={
          <BookTableButton
            source="food_menu_hero"
            context="food"
            variant="primary"
            size="lg"
            className="sm:w-auto"
            trackingLabel="Hero Book a Table"
          >
            Reserve Your Table
          </BookTableButton>
        }
        secondaryCta={
          <MenuSectionCta
            label="View Full Menu"
            scrollToId="menu"
            analyticsLabel="view_full_menu"
            location="food_menu_hero"
            variant="secondary"
            fullWidth
            className="sm:w-auto sm:min-w-0"
          />
        }
        secondaryInfo={
          <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto">
            Proper pub food a stone&apos;s throw from Heathrow. Free parking, free WiFi, and kitchen open every evening.
          </p>
        }
      />

      <TrustBar variant="food" />

      {kitchenStatusData && (
        <UrgencyKitchenStatus
          status={kitchenStatusData}
          className="mx-auto max-w-5xl px-4 py-3"
        />
      )}

      <Section background="white" spacing="sm" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <MenuAnchorNav links={ANCHOR_LINKS} />
        </Container>
      </Section>

      <div className="mx-auto max-w-5xl px-4 pb-2">
        <ValueProofStrip variant="food" />
      </div>

      <Section background="white" spacing="sm" className="bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="Food Menu & Pub Food Menu for Staines & Heathrow"
                subtitle="Traditional favourites, quick service and free parking just outside the terminals."
              />
              <p className="text-anchor-cream-text/70">
                Looking for a food menu or pub menu in Staines? We sit on Horton Road in Stanwell Moor,
                just 8 minutes from Staines High Street and 7 minutes from Heathrow Terminal 5. Our pub food menu
                covers Sunday roast and Sunday lunch, a fish & chips menu, a pizza menu, plus vegetarian menu and
                gluten free menu options. It's proper British pub food, cooked to order.
              </p>
              <ul className="mt-4 space-y-2 text-anchor-cream-text/70">
                <li>• Free parking and easy access from Staines, Ashford and Feltham.</li>
                <li>• Sunday roasts and family-friendly seating every weekend.</li>
                <li>• Stone-baked pizzas and pub classics served during kitchen hours.</li>
              </ul>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <div id="menu" className="section-spacing bg-anchor-bg">
        <Container>
          <SectionHeader
            title="Full Food Menu & Pub Menu"
            subtitle="Use the dietary filters to tailor the menu to your table."
            align="center"
            className="mb-10"
          />
          <FilteredMenuRenderer menuData={menuDataWithKitchenHours} />
        </Container>
      </div>

      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
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
                        className="mt-2 block text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition"
                      >
                        View roast options →
                      </Link>
                    </>
                  ),
                  className: 'text-left bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15'
                },
                {
                  icon: '🍕',
                  title: 'Stone-Baked Pizzas',
                  description: (
                    <>
                      Hand-stretched dough, stone-baked, and topped to order during kitchen hours.
                      <Link
                        href="/food-menu#pizza"
                        className="mt-2 block text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition"
                      >
                        See pizza picks →
                      </Link>
                    </>
                  ),
                  className: 'text-left bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15'
                },
                {
                  icon: '🍔',
                  title: 'Pub Classics, Fast',
                  description: 'Order at the bar or from your table — mains land within 15 minutes.',
                  className: 'text-left bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15'
                },
                {
                  icon: '🌱',
                  title: 'Veggie & Gluten-Friendly',
                  description: 'Vegetarian menu and gluten free menu options, plus gluten-aware bases. Ask us about allergens anytime.',
                  className: 'text-left bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15'
                }
              ]}
            />
          </SpeakableContent>
        </Container>
      </Section>

      <Section background="white" spacing="sm" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-dark rounded-none">
              <CardBody>
                <blockquote className="text-lg font-semibold text-anchor-cream-text">
                  "Sunday lunch was faultless — Yorkshire puddings like clouds, quick service, and the team could not do enough for us."
                </blockquote>
                <p className="mt-4 text-sm text-anchor-cream-text/55">Google review · August 2025</p>
              </CardBody>
            </Card>
            <Card className="card-dark rounded-none">
              <CardBody>
                <blockquote className="text-lg font-semibold text-anchor-cream-text">
                  "We stopped on the way past Heathrow. Proper food, fair prices, and parking was a breeze — booked again for next month."
                </blockquote>
                <p className="mt-4 text-sm text-anchor-cream-text/55">Tripadvisor review · July 2025</p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15" id="sunday-roast">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] items-start">
            <Card className="card-dark rounded-none">
              <CardBody>
                <SectionHeader
                  title="Sunday Roast and Sunday Lunch Near Heathrow"
                  subtitle="Book by 1pm Saturday to secure your favourite roast and all the trimmings."
                  align="left"
                  className="mb-6"
                />
	                <ul className="space-y-3 text-anchor-cream-text/70">
	                  <li>• Beef, chicken, lamb and vegetarian roasts with lashings of gravy.</li>
	                  <li>• Pre-order by 1pm Saturday so we can cook everything fresh to order.</li>
	                  <li>• Sunday lunch bookings require a £10 per person deposit.</li>
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
                    className="sm:w-auto sm:min-w-0"
                  />
                </div>
              </CardBody>
            </Card>
            <Card className="card-dark rounded-none">
              <CardBody>
                <h3 className="text-lg font-semibold text-anchor-gold-vivid mb-3">Sunday Serving Notes</h3>
	                <ul className="space-y-2 text-sm text-anchor-cream-text/70">
	                  <li>
	                    <strong>Service:</strong>{' '}
	                    {sundayKitchenHours
	                      ? `${sundayKitchenHours} every Sunday.`
	                      : 'Sunday kitchen hours are updated live on this page.'}
	                  </li>
	                  <li><strong>Sunday lunch:</strong> bookings require a £10 per person deposit.</li>
	                  <li><strong>Gluten-aware:</strong> Alternative gravy available — just ask.</li>
	                  <li><strong>Extras:</strong> Extra Yorkies or seasonal sides when available.</li>
	                </ul>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15" id="pizza">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] items-start">
            <Card className="card-dark rounded-none">
              <CardBody>
                <SectionHeader
                  title="Stone-Baked Pizzas"
                  subtitle="Hand-stretched bases, San Marzano sauce, and generous toppings."
                  align="left"
                  className="mb-6"
                />
                <ul className="space-y-3 text-anchor-cream-text/70">
                  <li>• Stone-baked pizzas served during kitchen hours.</li>
                  <li>• Mix and match toppings — dine in or takeaway with free parking.</li>
                  <li>• Gluten-aware bases available when you pre-book.</li>
                </ul>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <BookTableButton
                    source='food_menu_pizza_cta'
                    context='pizza_menu'
                    variant='primary'
                    size='lg'
                    className='sm:w-auto'
                    trackingLabel='Book Pizza Table'
                  >
                    Book a Table
                  </BookTableButton>
                  <MenuSectionCta
                    label="View Pizza Menu"
                    scrollToId="menu"
                    analyticsLabel="view_full_menu"
                    location="food_menu_pizza_section"
                    variant="outline"
                    fullWidth
                    className="sm:w-auto sm:min-w-0"
                  />
                </div>
              </CardBody>
            </Card>
            <Card className="card-dark rounded-none">
              <CardBody>
                <h3 className="text-lg font-semibold text-anchor-gold-vivid mb-3">Pizza Highlights</h3>
                <ul className="space-y-2 text-sm text-anchor-cream-text/70">
                  <li><strong>Rustic Classic:</strong> Rich tomato sauce and mozzarella on a crisp stone-baked base.</li>
                  <li><strong>Fully Loaded:</strong> Napoli salami, speck ham, fennel salami and mozzarella.</li>
                  <li><strong>Nice &amp; Spicy:</strong> Nduja, Ventricina and roquito peppers for those who like heat.</li>
                  <li><strong>Garden Club:</strong> Roasted courgette, caramelised onions, rocket and mozzarella.</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15" id="pub-classics">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] items-start">
            <Card className="card-dark rounded-none">
              <CardBody>
                <SectionHeader
                  title="Pub Classics Done Properly"
                  subtitle="Order at the bar or from your table — mains usually land within 15 minutes."
                  align="left"
                  className="mb-6"
                />
                <ul className="space-y-3 text-anchor-cream-text/70">
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
            <Card className="card-dark rounded-none">
              <CardBody>
                <h3 className="text-lg font-semibold text-anchor-gold-vivid mb-3">Kitchen Today</h3>
                <p className="text-sm text-anchor-cream-text/70">
                  {kitchenSchedule ? (
                    <>Kitchen open: {kitchenSchedule}. Call ahead on <a href="tel:+441753682707" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid">01753 682707</a> for large parties.</>
                  ) : (
                    <>Kitchen hours are updated live on this page. Call ahead on <a href="tel:+441753682707" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid">01753 682707</a> for large parties.</>
                  )}
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15" id="dietary">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="Vegetarian & Gluten-Friendly Picks"
                subtitle="Dedicated veggie mains, pizzas with gluten-aware bases, and staff ready to help with any allergen query."
                align="left"
                className="mb-6"
              />
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <ul className="space-y-3 text-anchor-cream-text/70">
                    <li>• Vegetable burger served with chips and house salad.</li>
                    <li>• Garden Club pizza with grilled courgette, peppers, and balsamic glaze.</li>
                    <li>• Spinach & Ricotta Cannelloni baked with tomato sauce and garlic bread.</li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-3 text-anchor-cream-text/70">
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
                  className="sm:w-auto sm:min-w-0"
                />
              </div>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15" id="near-heathrow">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="Near Heathrow"
                subtitle="Ideal for crews, airport teams, and anyone passing through — no airport prices, no parking stress."
                align="left"
                className="mb-6"
              />
              <ul className="space-y-3 text-anchor-cream-text/70">
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
                  className="sm:w-auto sm:min-w-0"
                />
              </div>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <Section background="gray" spacing="md" className="bg-anchor-bg">
        <Container>
          <Alert
            variant="warning"
            title="Allergen Information"
            className="max-w-4xl mx-auto"
          >
            <p className="text-anchor-cream-text/70">
              Gluten-aware bases and vegetarian mains are available. All dishes are prepared in a single kitchen where allergens are present — speak to us about your needs before ordering.
            </p>
          </Alert>
        </Container>
      </Section>

      <FAQAccordionWithSchema
        faqs={faqItems}
        className="bg-anchor-bg-card"
        renderSchema={false}
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
          __html: jsonLdSafeStringify([
            {
              '@context': 'https://schema.org',
              '@type': 'Menu',
              '@id': 'https://www.the-anchor.pub/food-menu#menu',
              provider: { '@id': 'https://www.the-anchor.pub/#business' },
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
	                      price: item.price ? item.price.replace(/\u00A3/g, '').trim() : undefined,
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
              openingHoursSpecification: kitchenHoursSpecification,
	              telephone: '+441753682707',
	              url: 'https://www.the-anchor.pub',
	              priceRange: '££',
	              potentialAction: {
	                '@type': 'ReserveAction',
	                target: {
	                  '@type': 'EntryPoint',
	                  urlTemplate: 'https://www.the-anchor.pub/book-table',
	                  actionPlatform: [
	                    'https://schema.org/DesktopWebPlatform',
	                    'https://schema.org/MobileWebPlatform'
	                  ]
	                },
	                result: { '@type': 'FoodEstablishmentReservation' }
	              }
	            },
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqItems.map(faq => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer
                }
              }))
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
            fridayFishOfferSchema
          ])
        }}
      />
    </>
  )
}

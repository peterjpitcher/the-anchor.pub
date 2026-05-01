import Link from 'next/link'
import { Metadata } from 'next'
import { Container, Section, Card, CardBody, Alert } from '@/components/ui'
import { CTASection, SectionHeader, FeatureGrid } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { HeroWrapper } from '@/components/hero'
import { MenuSectionCta } from '@/components/food/MenuSectionCta'
import { FilteredMenuRenderer } from '@/components/FilteredMenuRenderer'
import { MenuPageTracker } from '@/components/tracking/MenuPageTracker'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { SpeakableContent } from '@/components/voice/SpeakableContent'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { getBusinessHours, isKitchenOpen, type BusinessHours } from '@/lib/api'
import { formatTime12Hour } from '@/lib/time-utils'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { generateKitchenHoursSpecification, generateSuitableForDiet } from '@/lib/schema-utils'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'
import { DietaryMenuNav } from '@/components/food/DietaryMenuNav'
import type { KitchenStatusData } from '@/components/psychology'
import {
  getFishAndChipsMenuPageData,
  getFoodMenuPageData,
  getMenuUnavailableMessage,
  getPizzaMenuPageData,
  getSundayLunchMenuPageData,
  type MenuPageItem
} from '@/lib/menu-page-data'

export const revalidate = 3600

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
  const day = londonNow.getDay()

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

  if (nowMinutes < openMinutes) return { type: 'opens-later', opensAt: opensAtFormatted }
  if (nowMinutes >= closeMinutes) return { type: 'closed-today' }
  if (closeMinutes - nowMinutes <= 120) return { type: 'closing-soon', closesAt: closesAtFormatted }
  return { type: 'open', closesAt: closesAtFormatted }
}

function itemPreview(items: MenuPageItem[], limit = 4): MenuPageItem[] {
  return items.slice(0, limit)
}

function joinItemNames(items: MenuPageItem[]): string {
  if (items.length === 0) return 'the current live menu'
  if (items.length === 1) return items[0].name
  return `${items.slice(0, -1).map((item) => item.name).join(', ')} and ${items[items.length - 1].name}`
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getFoodMenuPageData()
  const pricePhrase = data?.priceFromLabel ? ` Dishes ${data.priceFromLabel}.` : ''
  const description = data
    ? `Pub food menu near Heathrow from The Anchor's live menu.${pricePhrase} Free parking, 7 minutes from Terminal 5.`
    : 'Pub food menu near Heathrow at The Anchor. Current dishes and prices from the latest kitchen menu.'

  return {
    title: 'Where to Eat Near Heathrow Airport | Pub Food Menu',
    description,
    openGraph: {
      title: 'Where to Eat Near Heathrow Airport | Pub Food Menu | The Anchor',
      description,
      images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
    },
    twitter: getTwitterMetadata({
      title: 'Where to Eat Near Heathrow Airport | Pub Food Menu | The Anchor',
      description,
      images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
    }),
    alternates: {
      canonical: '/food-menu'
    }
  }
}

export default async function FoodMenuPage() {
  const [menuData, businessHours, pizzaData, fishData, sundayData] = await Promise.all([
    getFoodMenuPageData(),
    getBusinessHours().catch(() => null),
    getPizzaMenuPageData(),
    getFishAndChipsMenuPageData(),
    getSundayLunchMenuPageData()
  ])

  const kitchenHoursSpecification = businessHours ? generateKitchenHoursSpecification(businessHours) : []

  if (!menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-anchor-bg">
        <p className="text-xl text-anchor-cream-text/70">{getMenuUnavailableMessage()}</p>
      </div>
    )
  }

  const kitchenHoursMap = businessHours ? buildKitchenHoursMap(businessHours) : null
  const kitchenSchedule = businessHours ? buildKitchenSchedule(businessHours) : null
  const kitchenStatusData = deriveKitchenStatusData(businessHours)
  const menuDataWithKitchenHours = {
    ...menuData.menuData,
    ...(kitchenHoursMap ? { kitchenHours: kitchenHoursMap } : {})
  }
  const menuSections = menuData.menuData.categories.map((category, index) => ({
    position: index + 1,
    name: category.title,
    url: `https://www.the-anchor.pub/food-menu#${category.id}`
  }))
  const pizzaPreview = itemPreview(pizzaData?.pizzaItems ?? [])
  const fishPreview = itemPreview(fishData?.fishItems ?? [])
  const dietaryPreview = itemPreview([...menuData.vegetarianItems, ...menuData.veganItems, ...menuData.glutenFreeItems])

  const faqItems = [
    {
      question: 'What time is the kitchen open at The Anchor?',
      answer: kitchenSchedule
        ? `Our kitchen is open ${kitchenSchedule}.`
        : 'Our kitchen hours are updated live on this page.'
    },
    {
      question: 'Where can I view your food menu or pub menu online?',
      answer: 'You can view the full live food menu on this page. Use the filters for vegetarian, vegan and gluten-free options, then book a table when you are ready.'
    },
    {
      question: 'Do you serve Sunday roast at The Anchor?',
      answer: sundayData.menuData
        ? `Yes. The Sunday lunch page lists the current Sunday menu. ${sundayData.priceFromLabel ? `Mains ${sundayData.priceFromLabel}.` : ''}`
        : 'Yes. Sunday roast details are handled on the Sunday lunch page. Please call us for the current dish list.'
    },
    {
      question: "Is there a children's menu?",
      answer: 'We have smaller portions, high chairs, and colouring packs on request.'
    },
    {
      question: 'Do you serve fish and chips?',
      answer: fishPreview.length > 0
        ? `Yes. The current fish and chip options include ${joinItemNames(fishPreview)}.`
        : 'Please call us for the current fish and chip options if the menu is temporarily unavailable online.'
    },
    {
      question: 'Do you cater for dietary requirements?',
      answer: 'Yes. Use the live filters on this page for vegetarian, vegan and gluten-free options, and ask the bar team for allergen guidance before ordering.'
    },
    {
      question: 'Can I book a table for food?',
      answer: 'Yes. Reserve online or call 01753 682707 for larger groups or pre-flight meals.'
    },
    {
      question: 'Is takeaway available?',
      answer: 'Yes. Call ahead and order from the current live menu for collection.'
    }
  ]

  return (
    <>
      <SpeakableSchema />
      <MenuPageTracker
        menuType="food"
        specialOffers={[]}
      />
      <ScrollDepthTracker />

      <HeroWrapper
        route="/food-menu"
        title="Where to Eat Near Heathrow Airport — Our Menu"
        description="Current dishes, descriptions and prices from the latest kitchen menu."
        variant="default"
        breadcrumbs={[{ name: 'Food & Drink' }]}
        tags={[
          { label: 'Live menu', variant: 'default' },
          { label: 'Dietary filters', variant: 'default' },
          { label: 'Book a table', variant: 'default' },
          { label: 'Free parking', variant: 'default' }
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
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
            {kitchenStatusData && kitchenStatusData.type === 'closing-soon' && (
              <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                Kitchen closes at {kitchenStatusData.closesAt} — book now
              </span>
            )}
            {kitchenStatusData && kitchenStatusData.type === 'opens-later' && (
              <span className="flex items-center gap-1.5 text-anchor-gold-vivid">
                Kitchen opens at {kitchenStatusData.opensAt}
              </span>
            )}
            {kitchenStatusData && kitchenStatusData.type === 'open' && (
              <span className="flex items-center gap-1.5 text-green-300">
                Kitchen open until {kitchenStatusData.closesAt}
              </span>
            )}
          </div>
        }
      />

      <Section background="white" spacing="sm" className="bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="Live Food Menu at The Anchor"
                subtitle="Current dishes, descriptions and prices in one place."
              />
              <p className="text-anchor-cream-text/70">
                Looking for food near Heathrow Airport? The menu below is grouped by current kitchen sections and can be filtered by dietary need.
              </p>
              <ul className="mt-4 space-y-2 text-anchor-cream-text/70">
                <li>&bull; {menuData.items.length} current food items listed.</li>
                <li>&bull; Dietary labels are shown from the latest menu guidance.</li>
                <li>&bull; Free parking, 7 minutes from Heathrow Terminal 5.</li>
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
          <DietaryMenuNav />
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
                  title: 'Full Live Menu',
                  description: 'The full menu below follows the latest dish, description and price updates.',
                  className: 'text-left bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15'
                },
                {
                  title: 'Pizza Menu',
                  description: pizzaPreview.length > 0
                    ? `Current pizza choices include ${joinItemNames(pizzaPreview)}.`
                    : 'Please call us for the current pizza choices if the menu is temporarily unavailable online.',
                  className: 'text-left bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15'
                },
                {
                  title: 'Dietary Options',
                  description: dietaryPreview.length > 0
                    ? `Current dietary picks include ${joinItemNames(dietaryPreview)}.`
                    : 'Use the filters to see vegetarian, vegan and gluten-free options.',
                  className: 'text-left bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15'
                },
                {
                  title: 'Near Heathrow',
                  description: 'Free parking, easy access from Terminal 5 and a table booking flow that works well for pre-flight meals.',
                  className: 'text-left bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15'
                }
              ]}
            />
          </SpeakableContent>
        </Container>
      </Section>

      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15" id="sunday-roast">
        <Container>
          <Card className="card-dark rounded-none border border-anchor-gold/20">
            <CardBody className="text-center py-8">
              <h2 className="text-2xl font-bold text-anchor-cream-text mb-3">Sunday Roast</h2>
              <p className="text-anchor-cream-text/70 mb-4 max-w-lg mx-auto">
                Sunday lunch has a dedicated page. Current Sunday dishes and prices are shown there when available online.
              </p>
              <MenuSectionCta
                label="View Sunday Lunch Menu & Book"
                href="/sunday-lunch"
                analyticsLabel="view_roast_menu"
                location="food_menu_roast_summary"
                variant="primary"
                className="sm:w-auto sm:min-w-0 inline-flex"
              />
            </CardBody>
          </Card>
        </Container>
      </Section>

      <Section background="white" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15" id="pizza">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] items-start">
            <Card className="card-dark rounded-none">
              <CardBody>
                <SectionHeader
                  title="Pizza Menu"
                  subtitle="Current pizza items from the live food menu."
                  align="left"
                  className="mb-6"
                />
                <ul className="space-y-3 text-anchor-cream-text/70">
                  <li>&bull; Dine in or call for collection.</li>
                  <li>&bull; Dietary labels update with the menu data.</li>
                  <li>&bull; Ask at the bar for allergen guidance before ordering.</li>
                </ul>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <BookTableButton
                    source="food_menu_pizza_cta"
                    context="pizza_menu"
                    variant="primary"
                    size="lg"
                    className="sm:w-auto"
                    trackingLabel="Book Pizza Table"
                  >
                    Book a Table
                  </BookTableButton>
                  <MenuSectionCta
                    label="View Pizza Page"
                    href="/pizza-menu"
                    analyticsLabel="pizza_menu"
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
                <h3 className="text-lg font-semibold text-anchor-gold-vivid mb-3">Current Pizza Highlights</h3>
                {pizzaPreview.length > 0 ? (
                  <ul className="space-y-2 text-sm text-anchor-cream-text/70">
                    {pizzaPreview.map((item) => (
                      <li key={item.id}>
                        <strong>{item.name}:</strong> {item.description} {item.priceLabel && <span>{item.priceLabel}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-anchor-cream-text/70">Please call us for the current pizza choices if the menu is temporarily unavailable online.</p>
                )}
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15" id="current-menu">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] items-start">
            <Card className="card-dark rounded-none">
              <CardBody>
                <SectionHeader
                  title="Current Menu Picks"
                  subtitle="A live sample from the current food menu."
                  align="left"
                  className="mb-6"
                />
                <ul className="space-y-3 text-anchor-cream-text/70">
                  {itemPreview(menuData.items, 5).map((item) => (
                    <li key={item.id}>
                      &bull; <strong>{item.name}</strong>{item.description ? ` — ${item.description}` : ''} {item.priceLabel && <span>{item.priceLabel}</span>}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 max-w-xs">
                  <BookTableButton
                    source="food_menu_classics_cta"
                    context="food"
                    variant="primary"
                    size="lg"
                    trackingLabel="Book Dinner Table"
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
                title="Vegetarian, Vegan & Gluten-Free Picks"
                subtitle="Dietary pages follow the same current kitchen menu."
                align="left"
                className="mb-6"
              />
              <div className="grid gap-6 md:grid-cols-3 text-anchor-cream-text/70">
                <p>Vegetarian dishes: {menuData.vegetarianItems.length}</p>
                <p>Vegan or vegan-option dishes: {menuData.veganItems.length + menuData.veganOptionItems.length}</p>
                <p>Gluten-free or gluten-free-option dishes: {menuData.glutenFreeItems.length + menuData.glutenFreeOptionItems.length}</p>
              </div>
              <p className="mt-4 text-anchor-cream-text/70">
                View our full <Link href="/food-menu/gluten-free" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">gluten-free menu</Link>, <Link href="/food-menu/vegan" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">vegan menu</Link> or <Link href="/food-menu/vegetarian" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">vegetarian menu</Link> for detailed options.
              </p>
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
                subtitle="Ideal for crews, airport teams, and anyone passing through."
                align="left"
                className="mb-6"
              />
              <ul className="space-y-3 text-anchor-cream-text/70">
                <li>&bull; 7 minutes to Terminal 5 by taxi.</li>
                <li>&bull; 11 minutes to Terminals 2 and 3 avoiding car-park queues.</li>
                <li>&bull; Free on-site parking with downloadable receipts.</li>
                <li>&bull; Book ahead for groups and busy weekend slots.</li>
              </ul>
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
              All dishes are prepared in a single kitchen where allergens are present. Speak to us about your needs before ordering.
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
          description="Weekends and busy services fill quickly. Book today and we will have your table ready."
          buttons={[
            {
              text: 'Book a Table',
              href: '/book-table',
              variant: 'white'
            },
            {
              text: 'Call: 01753 682707',
              href: 'tel:+441753682707',
              variant: 'white',
              isPhone: true,
              phoneSource: 'food_menu_footer'
            },
            {
              text: 'View Drinks Menu',
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
              '@type': 'WebPage',
              name: 'Food Menu — The Anchor Near Heathrow',
              description: 'Food menu near Heathrow Airport from The Anchor.',
              url: 'https://www.the-anchor.pub/food-menu',
              mainEntity: { '@id': 'https://www.the-anchor.pub/food-menu#menu' }
            },
            {
              '@context': 'https://schema.org',
              '@type': 'Menu',
              '@id': 'https://www.the-anchor.pub/food-menu#menu',
              url: 'https://www.the-anchor.pub/food-menu',
              provider: { '@id': 'https://www.the-anchor.pub/#business' },
              name: 'The Anchor Food Menu',
              description: 'Current food menu near Heathrow Airport.',
              hasMenuSection: menuData.menuData.categories.map(category => ({
                '@type': 'MenuSection',
                name: category.title,
                description: category.description,
                hasMenuItem: category.sections.flatMap(section =>
                  section.items.map(item => {
                    const pageItem = item as MenuPageItem
                    return {
                      '@type': 'MenuItem',
                      name: pageItem.name,
                      description: pageItem.description,
                      offers: {
                        '@type': 'Offer',
                        price: pageItem.price,
                        priceCurrency: 'GBP',
                        availability: 'https://schema.org/InStock'
                      },
                      suitableForDiet: generateSuitableForDiet(pageItem)
                    }
                  })
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
              itemListElement: menuSections.map(section => ({
                '@type': 'ListItem',
                position: section.position,
                name: section.name,
                url: section.url
              }))
            }
          ])
        }}
      />
    </>
  )
}

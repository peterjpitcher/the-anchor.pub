import { Metadata } from 'next'
import { Badge, Button } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { InteriorHero } from '@/components/hero'
import { AmenityStrip } from '@/components/AmenityStrip'
import { CtaBand } from '@/components/CtaBand'
import { SectionHeading } from '@/components/ui'
import Link from 'next/link'
import { MenuPageTracker } from '@/components/tracking/MenuPageTracker'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { SpeakableSchema } from '@/components/seo/SpeakableSchema'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { getBusinessHours, isKitchenOpen, type BusinessHours } from '@/lib/api'
import { formatTime12Hour } from '@/lib/time-utils'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { generateKitchenHoursSpecification, generateSuitableForDiet } from '@/lib/schema-utils'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import {
  getFishAndChipsMenuPageData,
  getFoodMenuPageData,
  getMenuUnavailableMessage,
  getSundayLunchMenuPageData,
  type MenuPageItem
} from '@/lib/menu-page-data'
import { FoodMenuSection } from './_components/FoodMenuSection'
import { SundayRoastFeature } from './_components/SundayRoastFeature'

export const revalidate = 3600

function buildKitchenSchedule(hours: BusinessHours): string {
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

  return Object.entries(schedule)
    .map(([day, time]) => `${day} ${time}`)
    .join(', ')
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
    ? `Pub food menu in Stanwell Moor near Heathrow T5, with live dishes and prices.${pricePhrase} Free parking, Sunday roast and table booking.`
    : 'Food near Heathrow Airport at The Anchor. See the live pub menu with current dishes and prices from the kitchen.'

  return {
    title: 'Pub Food Menu in Stanwell Moor | Near Heathrow T5',
    description,
    openGraph: {
      title: 'Pub Food Menu in Stanwell Moor | Near Heathrow T5',
      description,
      images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
    },
    twitter: getTwitterMetadata({
      title: 'Pub Food Menu in Stanwell Moor | Near Heathrow T5',
      description,
      images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
    }),
    alternates: {
      canonical: './'
    }
  }
}

export default async function FoodMenuPage() {
  const [menuData, businessHours, fishData, sundayData] = await Promise.all([
    getFoodMenuPageData(),
    getBusinessHours().catch(() => null),
    getFishAndChipsMenuPageData(),
    getSundayLunchMenuPageData()
  ])

  const kitchenHoursSpecification = businessHours ? generateKitchenHoursSpecification(businessHours) : []

  if (!menuData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="text-xl text-ink-muted">{getMenuUnavailableMessage()}</p>
      </div>
    )
  }

  const kitchenSchedule = businessHours ? buildKitchenSchedule(businessHours) : ''
  const menuSections = menuData.menuData.categories.map((category, index) => ({
    position: index + 1,
    name: category.title,
    url: `https://www.the-anchor.pub/food-menu#${category.id}`
  }))
  const fishPreview = itemPreview(fishData?.fishItems ?? [])

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
        ? `Yes. Walk in any time from 1pm to 6pm on Sundays. There is no pre-order and no Saturday cut-off. ${sundayData.priceFromLabel ? `Mains ${sundayData.priceFromLabel}.` : ''}`
        : 'Yes. Walk in any time from 1pm to 6pm on Sundays. There is no pre-order and no Saturday cut-off.'
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
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Food Menu', url: '/food-menu' }
        ]}
      />
      <SpeakableSchema />
      <MenuPageTracker menuType="food" specialOffers={[]} />
      <ScrollDepthTracker />

      {/* 1. Hero (§7.2.1): kitchen-closed days are never hardcoded; hours are API-only. */}
      <InteriorHero
        image="/images/page-headers/food-menu/food-menu.jpg"
        crumb="Food"
        kicker="Eat, Drink, Enjoy"
        title="Proper pub food, minutes from Heathrow"
        lead="Pub classics, stone-baked pizzas, fish and chips and a proper Sunday roast in Stanwell Moor, seven minutes from Heathrow Terminal 5 with free parking."
        badges={
          <>
            <Badge variant="sand">Mains £11 to £16</Badge>
            <Badge variant="sand">Pizzas from £12</Badge>
            <Badge variant="sand">Dog friendly</Badge>
          </>
        }
        actions={
          <>
            <BookTableButton
              source="food_menu_hero"
              context="food"
              variant="primary"
              size="lg"
              fullWidth
              trackingLabel="Hero Book a Table"
            >
              Book a table
            </BookTableButton>
            <Link href="/whats-on" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" fullWidth>
                What&apos;s on
              </Button>
            </Link>
          </>
        }
      />

      {/* 2. AmenityStrip (§7.2.2) */}
      <AmenityStrip />

      {/* 3. Menu (§7.2.3): cream, live menu data, dietary filter chips. */}
      <section id="menu" className="bg-canvas py-section-y">
        <div className="container">
          <SectionHeading
            kicker="The menu"
            script="Carved, baked, poured"
            title="Today at The Anchor"
            lead="Everything below is the kitchen's current menu. All dishes are prepared in a single kitchen where allergens are present, so please tell the bar team about any requirements before ordering."
          />
          <FoodMenuSection menuData={menuData.menuData} />
        </div>
      </section>

      {/* 4. Sunday roast feature (§7.2.4): white, SSOT §4 line-up. */}
      <section id="sunday-roast" className="bg-surface py-section-y">
        <div className="container">
          <SundayRoastFeature />
        </div>
      </section>

      <FAQAccordionWithSchema faqs={faqItems} renderSchema={false} />

      <OrganicSearchClusterLinks
        cluster="heathrowDining"
        currentPath="/food-menu"
        title="Food, restaurants and layover planning"
        intro="The menu page owns live dishes and prices. Use these related pages for restaurant comparisons and Heathrow timing."
      />

      {/* 5. CtaBand (§7.2.5) */}
      <div data-sticky-cta-guard="true">
        <CtaBand
          title="Hungry? Grab a table."
          copy="Weekends and busy services fill quickly. Book ahead and we will have your table ready."
          primary={
            <BookTableButton
              source="food_menu_footer"
              context="food"
              variant="primary"
              size="lg"
              trackingLabel="Footer Book a Table"
            >
              Book a table
            </BookTableButton>
          }
          secondary={
            <Link href="/find-us">
              <Button variant="outline" size="lg">
                Find us
              </Button>
            </Link>
          }
        />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafeStringify([
            {
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: 'Food Menu, The Anchor Near Heathrow',
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

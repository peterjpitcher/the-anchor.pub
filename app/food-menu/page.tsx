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
import { getBusinessHoursSnapshot, isKitchenOpen } from '@/lib/api'
import { buildKitchenSchedule } from '@/lib/hours-utils'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { generateKitchenHoursSpecification, generateSuitableForDiet } from '@/lib/schema-utils'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { MenuAnchorNav } from '@/components/food/MenuAnchorNav'
import {
  getFishAndChipsMenuPageData,
  getFoodMenuPageData,
  getKidsMenuPageData,
  getMenuUnavailableMessage,
  getPriceFromLabel,
  getPriceRangeLabel,
  getSundayLunchMenuPageData,
  type MenuPageItem
} from '@/lib/menu-page-data'
import {
  CHRISTMAS_MINIMUM_PARTY_SIZE,
  formatChristmasWindowLabel,
  getChristmasSeasonStatus
} from '@/lib/christmas-season'
import { FoodMenuSection } from './_components/FoodMenuSection'
import { SundayRoastFeature } from './_components/SundayRoastFeature'

// Beer battered cod and chips, a dish on today's menu. The previous hero showed
// a lamb shank, which is not served anywhere now. New filenames only: Cloudflare
// caches /images for a year, so replacing a file in place would not reach anyone.
const FOOD_MENU_HERO_IMAGE = '/images/food/weekday-2026/beer-battered-cod-and-chips-hero.jpg'
const FOOD_MENU_SHARE_IMAGE = '/images/food/weekday-2026/beer-battered-cod-and-chips-share.jpg'
const FOOD_MENU_SHARE_IMAGE_ALT = 'Beer battered cod and chips at The Anchor, Stanwell Moor'

export const revalidate = 3600

// How early the Christmas link appears, in days before the service window opens.
// Festive dinner runs on its own menu, so readers of the everyday menu need
// pointing at it through the run-up, and not at all once the season has passed.
const CHRISTMAS_LINK_LEAD_DAYS = 120

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
  // No price phrase here on purpose. The menu formatter strips currency symbols
  // (deliberate, owner-confirmed), which left a bare number stranded in the
  // search snippet as "Dishes from 4". Named dishes sell the click instead.
  const description = data
    ? 'Pub food menu near Heathrow T5 with live prices. Burgers, stone-baked pizzas, pies and fish and chips. Free parking and table booking in Stanwell Moor.'
    : 'Food near Heathrow Airport at The Anchor. See the live pub menu with current dishes and prices from the kitchen.'

  return {
    title: 'Pub Food Menu & Prices Near Heathrow T5',
    description,
    openGraph: {
      title: 'Pub Food Menu & Prices | Stanwell Moor, Near Heathrow T5',
      description,
      images: [{ url: FOOD_MENU_SHARE_IMAGE, width: 1200, height: 630, alt: FOOD_MENU_SHARE_IMAGE_ALT }],
    },
    twitter: getTwitterMetadata({
      title: 'Pub Food Menu & Prices | Stanwell Moor, Near Heathrow T5',
      description,
      images: [FOOD_MENU_SHARE_IMAGE]
    }),
    alternates: {
      canonical: './'
    }
  }
}

export default async function FoodMenuPage() {
  const [menuData, kidsData, businessHours, fishData, sundayData] = await Promise.all([
    getFoodMenuPageData(),
    getKidsMenuPageData(),
    // Snapshot, not the live fetch: these hours only feed the FAQ text and the
    // schema openingHoursSpecification, never currentStatus, so caching them
    // keeps this page static.
    getBusinessHoursSnapshot().catch(() => null),
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
  const existingCategoryIds = new Set(menuData.menuData.categories.map(category => category.id))
  const kidsCategories = (kidsData?.menuData.categories ?? [])
    .filter(category => !existingCategoryIds.has(category.id))
  const dessertIndex = menuData.menuData.categories.findIndex(category => /dessert/i.test(category.title))
  const kidsInsertIndex = dessertIndex >= 0 ? dessertIndex : menuData.menuData.categories.length
  const combinedCategories = [
    ...menuData.menuData.categories.slice(0, kidsInsertIndex),
    ...kidsCategories,
    ...menuData.menuData.categories.slice(kidsInsertIndex)
  ]
  const combinedMenuData = {
    ...menuData.menuData,
    categories: combinedCategories
  }
  const menuSections = combinedCategories.map((category, index) => ({
    position: index + 1,
    name: category.title,
    url: `https://www.the-anchor.pub/food-menu#${category.id}`
  }))
  const fishPreview = itemPreview(fishData?.fishItems ?? [])
  // Mains, burgers and pizzas only. Ranging over every dish let a side of chips
  // set the bottom of the range.
  const mainsPriceRange = getPriceRangeLabel(menuData.mainsItems)
  const pizzaPriceFrom = getPriceFromLabel(menuData.pizzaItems)
  const kidsPriceRange = getPriceRangeLabel(kidsData?.items ?? [])

  const christmas = getChristmasSeasonStatus()
  const showChristmasLink =
    christmas.isBookable && christmas.daysUntilWindowStart <= CHRISTMAS_LINK_LEAD_DAYS

  const faqItems = [
    {
      question: 'What time is the kitchen open at The Anchor?',
      answer: kitchenSchedule
        ? `Our kitchen is open ${kitchenSchedule}.`
        : 'Our kitchen hours are updated live on this page.'
    },
    {
      question: 'Where can I view your food menu or pub menu online?',
      answer: 'You can view the full live food menu on this page. Use the filters for vegetarian, vegan and NGCI (No Gluten Containing Ingredients) options, then book a table when you are ready.'
    },
    {
      question: 'Do you serve Sunday roast at The Anchor?',
      answer: sundayData.menuData
        ? `Yes. Walk in any time from 1pm to 6pm on Sundays. There is no pre-order and no Saturday cut-off. ${sundayData.priceFromLabel ? `Mains ${sundayData.priceFromLabel}.` : ''}`
        : 'Yes. Walk in any time from 1pm to 6pm on Sundays. There is no pre-order and no Saturday cut-off.'
    },
    {
      question: "Is there a children's menu?",
      answer: kidsData?.items.length
        ? `Yes. Our live kids menu is included on this page${kidsPriceRange ? `, with dishes from ${kidsPriceRange}` : ''}. High chairs are available on request.`
        : 'Yes. We have a dedicated kids menu, and high chairs are available on request.'
    },
    {
      question: 'Do you serve fish and chips?',
      answer: fishPreview.length > 0
        ? `Yes. The current fish and chip options include ${joinItemNames(fishPreview)}.`
        : 'Please call us for the current fish and chip options if the menu is temporarily unavailable online.'
    },
    {
      question: 'Do you cater for dietary requirements?',
      answer: 'Yes. Use the live filters on this page for vegetarian, vegan and NGCI (No Gluten Containing Ingredients) options, and ask the bar team for allergen guidance before ordering.'
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
      <SpeakableSchema/>
      <MenuPageTracker menuType="food" specialOffers={[]} />
      <ScrollDepthTracker/>

      {/* 1. Hero (§7.2.1): kitchen-closed days are never hardcoded; hours are API-only. */}
      <InteriorHero
        image={FOOD_MENU_HERO_IMAGE}
        crumb="Food"
        kicker="Eat, Drink, Enjoy"
        title="Proper pub food, minutes from Heathrow"
        lead="Pub classics, stone-baked pizzas, fish and chips, a dedicated kids menu and a proper Sunday roast in Stanwell Moor, seven minutes from Heathrow Terminal 5 with free parking."
        badges={
          <>
            <Badge variant="sand">{mainsPriceRange ? `Mains ${mainsPriceRange}` : 'Live menu prices'}</Badge>
            <Badge variant="sand">{pizzaPriceFrom ? `Pizzas ${pizzaPriceFrom}` : 'Live pizza prices'}</Badge>
            <Badge variant="sand">{kidsPriceRange ? `Kids' meals ${kidsPriceRange}` : 'Kids menu available'}</Badge>
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
            <Button asChild variant="outline" size="lg" fullWidth>
              <Link href="/whats-on" className="w-full sm:w-auto">
                What&apos;s on
              </Link>
            </Button>
          </>
        }
      />

      {/* 2. AmenityStrip (§7.2.2) */}
      <AmenityStrip/>

      {/* 3. Menu (§7.2.3): cream, live menu data, dietary filter chips. */}
      <section id="menu" className="bg-canvas py-section-y">
        <div className="container">
          <SectionHeading
            kicker="The menu"
            script="Carved, baked, poured"
            title="Today at The Anchor"
            lead="Everything below is the kitchen's current food and kids menus. All dishes are prepared in a single kitchen where allergens are present, so please tell the bar team about any requirements before ordering."
          />
          {showChristmasLink && (
            <p className="mx-auto mb-10 text-center text-ink-muted">
              Booking a group over Christmas? Festive service runs {formatChristmasWindowLabel()} on a
              separate menu. See our{' '}
              <Link
                href="/christmas-parties"
                className="font-semibold text-accent-text hover:underline"
              >
                festive set menus and Christmas booking dates
              </Link>{' '}
              for parties of {CHRISTMAS_MINIMUM_PARTY_SIZE} or more.
            </p>
          )}
          <MenuAnchorNav
            links={combinedCategories.map(category => ({
              id: category.id,
              label: category.title
            }))}
            className="mx-auto mb-10"
          />
          <FoodMenuSection menuData={combinedMenuData} />
        </div>
      </section>

      {/* 4. Sunday roast feature (§7.2.4): white, live roast line-up. */}
      <section id="sunday-roast" className="bg-surface py-section-y">
        <div className="container">
          <SundayRoastFeature items={sundayData.mains} />
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
            <Button asChild variant="outline" size="lg">
              <Link href="/find-us">
                Find us
              </Link>
            </Button>
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
              provider: { '@id': 'https://www.the-anchor.pub/food-menu#restaurant' },
              name: 'The Anchor Food Menu',
              description: 'Current food menu near Heathrow Airport.',
              hasMenuSection: combinedCategories.map(category => ({
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
                        // Schema requires a bare numeric string; pageItem.price is the £-prefixed display label
                        price: pageItem.priceValue > 0 ? pageItem.priceValue.toFixed(2) : '',
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
              // Page-scoped @id. This node publishes the KITCHEN's service
              // windows, which are not the venue's opening hours, so it must not
              // claim the site-wide '#business' identity that carries those.
              '@id': 'https://www.the-anchor.pub/food-menu#restaurant',
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

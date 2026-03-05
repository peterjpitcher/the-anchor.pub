import Link from 'next/link'
import { AlertBox, Button, Container, SectionHeader } from '@/components/ui'
import { HeroWrapper } from '@/components/hero'
import { Metadata } from 'next'
import { Icon } from '@/components/ui/Icon'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { MenuPageTracker } from '@/components/tracking/MenuPageTracker'
import { generateNutritionInfo } from '@/lib/schema-utils'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BookTableButton } from '@/components/BookTableButton'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'
import { anchorAPI, formatPrice, getBusinessHours, isKitchenOpen } from '@/lib/api'
import { formatTime12Hour } from '@/lib/time-utils'
import { jsonLdSafeStringify } from '@/lib/jsonld'

const SUNDAY_LUNCH_BOOKING_URL = '/book-table?sunday_lunch=true&purpose=food'

export const metadata: Metadata = {
  title: 'Sunday Roast Near Heathrow | From £19.99 | Book by Saturday 1pm | The Anchor',
  description: 'Traditional British Sunday roast near Heathrow from £19.99. Chicken, lamb, pork belly & vegetarian options. Free parking. 7 mins from Terminal 5. Pre-order by Saturday 1pm.',
  keywords: 'sunday roast near heathrow, sunday lunch near heathrow airport, sunday roast stanwell moor, sunday lunch near me heathrow, book sunday lunch near heathrow',
  openGraph: {
    title: 'Sunday Roast Near Heathrow | From £19.99 | The Anchor',
    description: 'Traditional British Sunday roast from £19.99. Chicken, lamb, pork belly & vegetarian options. Free parking. 7 mins from Heathrow T5. Book by Saturday 1pm.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Sunday Lunch Near Staines & Heathrow',
    description: 'Traditional Sunday lunch near Staines and Heathrow. Sunday lunch bookings require a £10 per person deposit.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg']
  }),
  alternates: {
    canonical: '/sunday-lunch'
  }
}

export const revalidate = 120

type NormalizedMenuItem = {
  id?: string
  name: string
  description?: string | null
  price?: number
  dietary_info?: string[]
  allergens?: string[]
  included?: boolean
  is_available?: boolean
}

type NormalizedMenu = {
  menuDate?: string
  cutoffTime?: string
  mains: NormalizedMenuItem[]
  sides: NormalizedMenuItem[]
}

const FALLBACK_MENU: NormalizedMenu = {
  mains: [
    {
      name: 'Roasted Chicken',
      description: 'Oven-roasted chicken breast with sage & onion stuffing balls, herb and garlic-crusted roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy',
      price: 19.99
    },
    {
      name: 'Slow-Cooked Lamb Shank',
      description: 'Tender slow-braised lamb shank in rich red wine gravy, served with herb and garlic-crusted roast potatoes, seasonal vegetables, and a Yorkshire pudding',
      price: 23.99
    },
    {
      name: 'Crispy Pork Belly',
      description: 'Crispy crackling and tender slow-roasted pork belly with Bramley apple sauce, herb and garlic-crusted roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy',
      price: 21.99
    },
    {
      name: 'Beetroot & Butternut Squash Wellington (V)',
      description: 'Golden puff pastry filled with beetroot & butternut squash, served with herb and garlic-crusted roast potatoes, seasonal vegetables, and vegetarian gravy',
      price: 19.99,
      dietary_info: ['vegetarian']
    },
    {
      name: 'Kids Roasted Chicken',
      description: 'A smaller portion of our roasted chicken with herb and garlic-crusted roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy',
      price: 13.99
    }
  ],
  sides: [
    {
      name: 'Roast Potatoes',
      description: 'Herb and garlic-crusted roast potatoes.',
      price: 0,
      included: true
    },
    {
      name: 'Yorkshire Pudding',
      description: 'Traditional Yorkshire pudding.',
      price: 0,
      included: true
    },
    {
      name: 'Seasonal Vegetables',
      description: 'Fresh seasonal vegetables.',
      price: 0,
      included: true
    },
    {
      name: 'Red Wine Gravy',
      description: 'Red wine gravy (vegetarian gravy available on request).',
      price: 0,
      included: true
    }
  ],
  menuDate: undefined,
  cutoffTime: undefined
}

function normalizeMenu(raw: any): NormalizedMenu {
  const payload = raw?.data ?? raw ?? {}
  const mainsSource = payload.mains || payload.menu?.mains || []
  const sidesSource = payload.sides || payload.menu?.sides || []

  const mapItem = (item: any): NormalizedMenuItem => {
    const price = Number(item?.price ?? item?.selling_price ?? item?.price_at_booking ?? NaN)
    const defaultIncluded = (Number.isFinite(price) ? price <= 0 : false) || item?.is_default_side || false
    return {
      id: item?.id || item?.dish_id,
      name: item?.name || 'Sunday Lunch',
      description: item?.description,
      price: Number.isFinite(price) ? price : undefined,
      dietary_info: item?.dietary_info || item?.dietary_flags || [],
      allergens: item?.allergens || item?.allergen_flags || [],
      included: item?.included ?? defaultIncluded,
      is_available: item?.is_available ?? item?.is_active ?? true
    }
  }

  return {
    menuDate: payload.menu_date || payload.date || payload.menu?.menu_date,
    cutoffTime: payload.cutoff_time || payload.menu?.cutoff_time,
    mains: Array.isArray(mainsSource) ? mainsSource.map(mapItem) : [],
    sides: Array.isArray(sidesSource) ? sidesSource.map(mapItem) : []
  }
}

async function loadSundayMenu(): Promise<{ menu: NormalizedMenu; fromFallback: boolean; error?: string }> {
  try {
    const data = await anchorAPI.getSundayLunchMenu()
    const menu = normalizeMenu(data)

    if (menu.mains.length || menu.sides.length) {
      return { menu, fromFallback: false }
    }
  } catch (error: any) {
    console.error('Sunday lunch menu fetch failed', error)
    return {
      menu: FALLBACK_MENU,
      fromFallback: true,
      error: error?.message || 'Unable to load Sunday lunch menu'
    }
  }

  return { menu: FALLBACK_MENU, fromFallback: true }
}

function formatCutoff(cutoff?: string) {
  if (!cutoff) return 'Saturday 1pm'
  const date = new Date(cutoff)
  if (isNaN(date.getTime())) return 'Saturday 1pm'
  return date.toLocaleString('en-GB', {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export default async function SundayLunchPage() {
  const [{ menu, fromFallback, error: menuError }, businessHours] = await Promise.all([
    loadSundayMenu(),
    getBusinessHours()
  ])
  const sundayKitchen = businessHours?.regularHours?.sunday?.kitchen
  const sundayKitchenHours = sundayKitchen && isKitchenOpen(sundayKitchen)
    ? `${formatTime12Hour(sundayKitchen.opens)}–${formatTime12Hour(sundayKitchen.closes)}`
    : null
  const openingHoursSpecification = sundayKitchen && isKitchenOpen(sundayKitchen)
    ? [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: sundayKitchen.opens,
        closes: sundayKitchen.closes,
        description: 'Sunday lunch service hours'
      }]
    : []
  const sundayServiceLabel = sundayKitchenHours ? `Sundays ${sundayKitchenHours}` : 'Sunday kitchen hours'
  const sundayServiceSentence = sundayKitchenHours
    ? `Served Sundays ${sundayKitchenHours}`
    : 'Served during Sunday kitchen hours'

  const menuItemsForSchema = menu.mains.length ? menu.mains : FALLBACK_MENU.mains
  const priceValues = menuItemsForSchema.map(item => item.price).filter((p): p is number => typeof p === 'number')
  const minPrice = priceValues.length ? Math.min(...priceValues) : undefined
  const maxPrice = priceValues.length ? Math.max(...priceValues) : undefined
  const priceRangeText = minPrice !== undefined && maxPrice !== undefined
    ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
    : undefined

  const menuDateDisplay = menu.menuDate
    ? new Date(menu.menuDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    : null

  const schemaMenuItems = menuItemsForSchema.map(item => ({
    '@type': 'MenuItem',
    name: item.name,
    description: item.description,
    ...(typeof item.price === 'number'
      ? {
        offers: {
          '@type': 'Offer',
          price: item.price.toFixed(2),
          priceCurrency: 'GBP',
          availability: 'https://schema.org/PreOrder'
        }
      }
      : {}),
    nutrition: generateNutritionInfo(item.name, 'sunday-roast')
  }))

  const schemaMenuSections: any[] = [
    {
      '@type': 'MenuSection',
      name: 'Sunday Lunch',
      description: 'Served with roast potatoes, Yorkshire pudding, seasonal vegetables and gravy',
      hasMenuItem: schemaMenuItems
    }
  ]

  if (menu.sides.length) {
    schemaMenuSections.push({
      '@type': 'MenuSection',
      name: 'Sides',
      hasMenuItem: menu.sides.map(side => ({
        '@type': 'MenuItem',
        name: side.name,
        description: side.description,
        ...(typeof side.price === 'number'
          ? {
            offers: {
              '@type': 'Offer',
              price: side.price.toFixed(2),
              priceCurrency: 'GBP'
            }
          }
          : {})
      }))
    })
  }

  const schemaItemList = menuItemsForSchema.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    description: item.description,
    url: 'https://www.the-anchor.pub/sunday-lunch#menu'
  }))

  const schemaData = jsonLdSafeStringify([
    {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      '@id': 'https://www.the-anchor.pub/#sunday-lunch',
      name: 'The Anchor - Sunday Lunch',
      servesCuisine: ['British', 'Sunday Lunch'],
      priceRange: '££',
      telephone: '+441753682707',
      url: 'https://www.the-anchor.pub/sunday-lunch',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Horton Road',
        addressLocality: 'Stanwell Moor',
        addressRegion: 'Surrey',
        postalCode: 'TW19 6AQ',
        addressCountry: 'GB'
      },
      ...(openingHoursSpecification.length ? { openingHoursSpecification } : {}),
      advanceBookingRequirement: {
        '@type': 'QuantitativeValue',
        minValue: 1,
        unitCode: 'DAY',
        description: 'Sunday lunch roasts must be booked by 1pm Saturday'
      },
      acceptsReservations: 'required',
      reservationPolicy:
        'Advance booking required by 1pm Saturday. Sunday lunch bookings require a £10 per person deposit.',
      hasMenu: {
        '@type': 'Menu',
        name: 'Sunday Lunch Menu',
        description: 'Traditional British Sunday lunch roasts',
        hasMenuSection: schemaMenuSections,
        inLanguage: 'en-GB'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '127',
        bestRating: '5',
        worstRating: '1'
      },
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
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Offer',
      name: 'Sunday Lunch Pre-Order',
      description:
        'Traditional British Sunday lunch roasts with all the trimmings. Pre-order required by 1pm Saturday. Sunday lunch bookings require a £10 per person deposit.',
      url: 'https://www.the-anchor.pub/book-table',
      priceCurrency: 'GBP',
      ...(priceRangeText ? { priceRange: priceRangeText } : {}),
      eligibleRegion: {
        '@type': 'Place',
        name: 'Stanwell Moor and surrounding areas'
      },
      availableAtOrFrom: {
        '@type': 'Place',
        name: 'The Anchor',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Horton Road',
          addressLocality: 'Stanwell Moor',
          addressRegion: 'Surrey',
          postalCode: 'TW19 6AQ'
        }
      },
      itemOffered: {
        '@type': 'MenuItem',
        name: 'Sunday Lunch Roast Selection',
        description: 'Choice of roasts served with Yorkshire pudding, roast potatoes, seasonal vegetables and gravy'
      },
      ...(sundayKitchen && isKitchenOpen(sundayKitchen)
        ? { validFrom: sundayKitchen.opens, validThrough: sundayKitchen.closes }
        : {}),
      eligibleDuration: {
        '@type': 'Duration',
        description: 'Available Sundays only'
      },
      availabilityStarts: '2025-01-01',
      availabilityEnds: '2025-12-31',
      seller: {
        '@id': 'https://www.the-anchor.pub/#business'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Sunday Lunch Options',
      itemListElement: schemaItemList
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.the-anchor.pub'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Sunday Lunch',
          item: 'https://www.the-anchor.pub/sunday-lunch'
        }
      ]
    }
  ])

  return (
    <>
      <MenuPageTracker
        menuType="sunday_lunch"
        specialOffers={[
          'Pre-order required by 1pm Saturday'
        ]}
      />

      <HeroWrapper
        route="/sunday-lunch"
        title="Sunday Lunch at The Anchor"
        description={`Traditional roasts cooked fresh to order. ${sundayServiceSentence} — pre-order by Saturday 1pm. Sunday lunch bookings require a £10 per person deposit.`}
        variant="default"
        tags={[
          { label: sundayServiceLabel, variant: 'warning' },
          { label: 'Book by Saturday 1pm', variant: 'default' },
          { label: '£10pp deposit required', variant: 'default' }
        ]}
        cta={
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
              <BookTableButton
                source="sunday_roast_hero"
                context="sunday_roast"
                variant="primary"
                size="lg"
                fullWidth
                className="sm:w-auto"
                customHref={SUNDAY_LUNCH_BOOKING_URL}
              >
                Book Sunday Lunch
              </BookTableButton>
              <Link href="#menu" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="sm:w-auto bg-white text-anchor-green hover:bg-gray-100"
                >
                  View Menu
                </Button>
              </Link>
            </div>
            <div className="bg-anchor-green/90 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto text-center">
              <p className="text-white font-bold text-lg mb-1">Pre-order required</p>
              <p className="text-white text-sm">
                <strong>Deadline: {formatCutoff(menu.cutoffTime)}</strong> • Sunday lunch bookings require a <strong>£10 per person deposit</strong>
              </p>
              <p className="text-white/90 text-sm sm:text-xs mt-2">Regular menu also available on Sundays without pre-order</p>
            </div>
          </div>
        }
      />

      <section id="preorder" className="section-spacing bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="The offer"
              subtitle="Choose your roast, we cook it fresh to order."
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-anchor-green/10 bg-anchor-cream/40 p-5">
                <p className="text-sm font-semibold text-anchor-green">Choose your roast</p>
                <p className="mt-1 text-sm text-gray-700">
                  Roasted chicken, lamb shank, pork belly, Wellington (V), or kids roasted chicken.
                </p>
              </div>
              <div className="rounded-xl border border-anchor-green/10 bg-anchor-cream/40 p-5">
                <p className="text-sm font-semibold text-anchor-green">Book by {formatCutoff(menu.cutoffTime)}</p>
                <p className="mt-1 text-sm text-gray-700">We cook to order, so we need numbers in advance.</p>
              </div>
              <div className="rounded-xl border border-anchor-green/10 bg-anchor-cream/40 p-5">
                <p className="text-sm font-semibold text-anchor-green">£10 per person deposit required</p>
                <p className="mt-1 text-sm text-gray-700">Sunday lunch bookings require a £10 per person deposit.</p>
              </div>
            </div>

            {menuError && fromFallback && (
              <AlertBox
                variant="error"
                title="Live menu unavailable"
                className="mt-6"
                content="We're showing our standard Sunday lunch menu while we reconnect to the management system. Call 01753 682707 for today's details."
              />
            )}
          </div>
        </Container>
      </section>

      <section id="menu" className="section-spacing bg-anchor-cream">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Sunday Lunch menu"
              subtitle="All dishes served with herb and garlic-crusted roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy."
            />

            <p className="text-center text-sm text-gray-600 italic mb-10">
              {menuDateDisplay ? `Menu for ${menuDateDisplay}. ` : ''}Vegetarian gravy available on request.
            </p>

            <div className="space-y-6">
              {menu.mains.map(item => (
                <div key={item.id || item.name} className="bg-white rounded-2xl p-8 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-anchor-green">{item.name}</h3>
                      {item.dietary_info?.length ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.dietary_info.map(tag => (
                            <span
                              key={`${item.name}-${tag}`}
                              className="text-xs font-semibold text-anchor-gold bg-amber-50 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    {typeof item.price === 'number' && (
                      <span className="text-2xl font-bold text-anchor-gold whitespace-nowrap">{formatPrice(item.price)}</span>
                    )}
                  </div>

                  {item.description && <p className="text-gray-700 mb-3">{item.description}</p>}
                  {item.allergens?.length ? (
                    <p className="text-xs text-gray-500">Allergens: {item.allergens.join(', ')}</p>
                  ) : null}
                  {item.is_available === false && (
                    <p className="text-sm text-red-600 font-semibold mt-2">Currently unavailable</p>
                  )}
                </div>
              ))}

              {!menu.mains.length && (
                <div className="bg-white rounded-2xl p-8 shadow-md text-center text-gray-700">
                  Live menu unavailable right now. Please call us on 01753 682707 for today&apos;s roast choices.
                </div>
              )}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <BookTableButton
                source="sunday_roast_menu_cta"
                context="sunday_roast"
                variant="primary"
                size="lg"
                fullWidth
                className="sm:w-auto"
                customHref={SUNDAY_LUNCH_BOOKING_URL}
              >
                Book Sunday Lunch
              </BookTableButton>

              <Link href="tel:+441753682707" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="sm:w-auto border-anchor-green text-anchor-green hover:bg-anchor-green hover:text-white"
                >
                  <Icon name="phone" className="mr-2 flex-shrink-0" />
                  Call: 01753 682707
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-center text-sm text-gray-600">
              {sundayServiceSentence}. Free parking available.
            </p>
          </div>
        </Container>
      </section>

      <section id="faq">
        <FAQAccordionWithSchema
          className="bg-white"
          title="Sunday Lunch FAQ"
          faqs={[
            {
              question: "Do I need to pre-order Sunday lunch?",
              answer: "Yes. Our Sunday lunch roasts are cooked fresh to order, so please pre-order by 1pm Saturday."
            },
            {
              question: "What's included with each roast?",
              answer: "Every dish comes with herb and garlic-crusted roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy (vegetarian gravy available)."
            },
            {
              question: "Do you take a deposit?",
              answer: "Yes. Sunday lunch bookings require a £10 per person deposit."
            },
            {
              question: "What time is Sunday lunch served?",
              answer: sundayKitchenHours
                ? `Sunday lunch is served ${sundayKitchenHours} every Sunday.`
                : "Sunday lunch is served during our Sunday kitchen hours."
            },
            {
              question: "Can I visit on Sunday without pre-ordering?",
              answer: "Yes — our regular menu is available on Sundays without pre-order. Sunday lunch roasts require advance booking."
            }
          ]}
        />
      </section>

      <div data-sticky-cta-guard="true">
        <section className="section-spacing bg-anchor-green text-white">
          <Container>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Book Sunday Lunch</h2>
              <p className="text-lg mb-8">
                Book by <strong>{formatCutoff(menu.cutoffTime)}</strong> • Sunday lunch bookings require a <strong>£10 per person deposit</strong>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <BookTableButton
                  source="sunday_roast_footer_cta"
                  context="sunday_roast"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="sm:w-auto bg-white text-anchor-green hover:bg-gray-100 border-white"
                  customHref={SUNDAY_LUNCH_BOOKING_URL}
                >
                  Book Sunday Lunch
                </BookTableButton>

                <Link href="tel:+441753682707" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    className="sm:w-auto border-white text-white hover:bg-white hover:text-anchor-green"
                  >
                    <Icon name="phone" className="mr-2 flex-shrink-0" />
                    Call: 01753 682707
                  </Button>
                </Link>
              </div>

              <p className="text-sm mt-6 text-white/90">
                {sundayServiceSentence} • Regular menu also available without pre-order
              </p>
            </div>
          </Container>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: schemaData
        }}
      />

      <FoodStickyCtaBar
        ctaContext="sunday_roast"
        whatsapp={{
          href: 'https://wa.me/441753682707?text=Hi%20Anchor%20Team!%20I%27d%20like%20to%20book%20for%20Sunday%20Lunch.',
          label: 'WhatsApp Sunday Lunch',
          id: 'whatsapp_sunday_lunch'
        }}
        label="Book Sunday Lunch"
        bookingUrl={SUNDAY_LUNCH_BOOKING_URL}
      />
    </>
  )
}

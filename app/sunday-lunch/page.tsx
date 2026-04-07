import Link from 'next/link'
import { AlertBox, Button, Container, SectionHeader } from '@/components/ui'
import { PageTitle } from '@/components/ui/typography/PageTitle'
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
  title: 'Sunday Roast & Lunch Near Heathrow | From £19.99 | Book a Table | The Anchor',
  description: 'Traditional Sunday roast and Sunday lunch near Heathrow from £19.99. Chicken, lamb, pork belly & vegetarian options. Just 8 minutes from Staines-upon-Thames. Free parking. Book by Saturday 1pm.',
  openGraph: {
    title: 'Sunday Roast & Lunch Near Heathrow | From £19.99 | Book a Table | The Anchor',
    description: 'Traditional Sunday roast and Sunday lunch near Heathrow from £19.99. Chicken, lamb, pork belly & vegetarian options. Just 8 minutes from Staines-upon-Thames. Free parking. Book by Saturday 1pm.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Sunday Roast & Lunch Near Heathrow | From £19.99 | Book a Table | The Anchor',
    description: 'Traditional Sunday roast and Sunday lunch near Heathrow. Just 8 minutes from Staines-upon-Thames. £10pp deposit required.',
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
    },
    {
      name: 'Cauliflower Cheese',
      description: 'Creamy cauliflower cheese — the perfect add-on to your roast.',
      price: 3.99,
      included: false
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
        ratingValue: '4.6',
        reviewCount: '238',
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
      availabilityStarts: '2026-01-01',
      availabilityEnds: '2026-12-31',
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
        title="Sunday Roast & Lunch at The Anchor"
        description={`Traditional roasts cooked fresh to order. ${sundayServiceSentence} — pre-order by Saturday 1pm. Sunday lunch bookings require a £10 per person deposit.`}
        variant="default"
        tags={[
          { label: sundayServiceLabel, variant: 'warning' },
          { label: 'Book by Saturday 1pm', variant: 'default' },
          { label: '£10pp deposit — secures your table', variant: 'success' }
        ]}
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
          </div>
        }
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

      <Container>
        <PageTitle as="h1" className="text-center mb-6" seo={{ structured: true, speakable: true }}>
          Sunday Roast & Lunch Near Heathrow — From £19.99
        </PageTitle>
      </Container>

      <section className="bg-anchor-bg-raised border-b border-anchor-gold/15 py-8">
        <Container>
          <p className="text-center text-lg text-anchor-cream-text/70 max-w-4xl mx-auto">
            Sunday lunch at The Anchor costs from &pound;19.99 per person and must be pre-ordered by 1pm on Saturday, with a &pound;10 per person deposit required. Choose from chicken, lamb shank, pork belly or butternut squash wellington — all served with Yorkshire pudding and seasonal vegetables. Just 8 minutes from Staines-upon-Thames, our Sunday roast is one of the best near Heathrow.
          </p>
        </Container>
      </section>

      <section id="preorder" className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="The offer"
              subtitle="Choose your Sunday lunch roast — we cook it fresh to order."
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5">
                <p className="text-sm font-semibold text-anchor-gold-vivid">Choose your roast</p>
                <p className="mt-1 text-sm text-anchor-cream-text/70">
                  Roasted chicken, lamb shank, pork belly, Wellington (V), or kids roasted chicken.
                </p>
              </div>
              <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5">
                <p className="text-sm font-semibold text-anchor-gold-vivid">Book by {formatCutoff(menu.cutoffTime)}</p>
                <p className="mt-1 text-sm text-anchor-cream-text/70">We cook to order, so we need numbers in advance.</p>
              </div>
              <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5">
                <p className="text-sm font-semibold text-anchor-gold-vivid">£10 per person deposit required</p>
                <p className="mt-1 text-sm text-anchor-cream-text/70">Sunday lunch bookings require a £10 per person deposit.</p>
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

      <section id="menu" className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Sunday Lunch Menu"
              subtitle="All dishes served with herb and garlic-crusted roast potatoes, seasonal vegetables, Yorkshire pudding, and red wine gravy."
            />

            <p className="text-center text-sm text-anchor-cream-text/55 italic mb-10">
              {menuDateDisplay ? `Menu for ${menuDateDisplay}. ` : ''}Vegetarian gravy available on request.
            </p>

            <div role="list" className="divide-y divide-anchor-gold/10">
              {menu.mains.map(item => (
                <div key={item.id || item.name} className="py-3 last:border-0" role="listitem">
                  <p className="text-anchor-cream-text leading-snug">
                    <span className="font-semibold">{item.name}</span>
                    {item.dietary_info?.map(tag => (
                      <span
                        key={`${item.name}-${tag}`}
                        className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded leading-none ml-1.5"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.description && (
                      <span className="text-anchor-cream-text/60 font-normal"> — {item.description}</span>
                    )}
                    {typeof item.price === 'number' && item.price > 0 && (
                      <span className="text-anchor-cream-text/50 font-normal ml-1"> · £{item.price.toFixed(2)}</span>
                    )}
                  </p>
                  {item.allergens?.length ? (
                    <p className="text-[11px] text-anchor-cream-text/40 mt-0.5 leading-snug">
                      Contains: {item.allergens.join(', ')}
                    </p>
                  ) : null}
                  {item.is_available === false && (
                    <p className="text-sm text-red-400 font-semibold mt-1">Currently unavailable</p>
                  )}
                </div>
              ))}
              {!menu.mains.length && (
                <div className="py-4 text-anchor-cream-text/70">
                  Live menu unavailable right now. Please call us on 01753 682707 for today&apos;s roast choices.
                </div>
              )}
            </div>

            <div className="mt-6 rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5">
              <p className="text-sm font-semibold text-anchor-gold-vivid">Add-ons</p>
              <p className="mt-1 text-anchor-cream-text">
                <span className="font-semibold">Cauliflower Cheese</span>
                <span className="text-anchor-cream-text/60 font-normal"> — creamy cauliflower cheese, the perfect add-on to your roast.</span>
                <span className="text-anchor-cream-text/50 font-normal ml-1"> · £3.99</span>
              </p>
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
                  className="sm:w-auto border-anchor-gold/30 text-anchor-cream-text hover:bg-anchor-bg-raised"
                >
                  <Icon name="phone" className="mr-2 flex-shrink-0" />
                  Call: 01753 682707
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-center text-sm text-anchor-cream-text/55">
              {sundayServiceSentence}. Free parking available. Just 8 minutes from Staines-upon-Thames.
            </p>
          </div>
        </Container>
      </section>

      {/* The Sunday Roast Experience */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="The Sunday Roast Experience"
              subtitle="What makes our Sunday lunch worth the drive."
            />
            <div className="prose prose-invert max-w-none text-anchor-cream-text/70 space-y-4">
              <p>
                A proper Sunday roast is more than a meal &mdash; it&rsquo;s the centrepiece of the week. At The Anchor, we take that seriously. Every roast is cooked fresh to order, which is exactly why we ask you to pre-order by Saturday 1pm. No batch cooking, no heat lamps, no shortcuts.
              </p>
              <p>
                Each plate arrives with herb and garlic-crusted roast potatoes &mdash; golden on the outside, fluffy in the middle &mdash; a proper Yorkshire pudding that&rsquo;s risen tall and crisp, fresh seasonal vegetables, and rich red wine gravy made in-house. Vegetarian gravy is always available on request.
              </p>
              <p>
                Our roasted chicken comes with sage and onion stuffing balls. The slow-cooked lamb shank is braised until it falls off the bone in a red wine gravy that&rsquo;s had hours of attention. The crispy pork belly has proper crackling and is served alongside Bramley apple sauce &mdash; tart enough to cut through the richness. And for vegetarians, the beetroot and butternut squash Wellington in golden puff pastry is a genuine centrepiece, not a token afterthought.
              </p>
              <p>
                For the little ones, our kids&rsquo; roasted chicken is a smaller portion of the real thing &mdash; same quality, same trimmings, just sized right. And if you fancy something extra, add a side of our creamy cauliflower cheese for &pound;3.99.
              </p>
              <p>
                Whether you&rsquo;re looking for a Sunday roast near Heathrow before a flight, a roast dinner near me after a long week, or a proper Sunday lunch near me with the family &mdash; this is the kind of meal that makes you glad you booked ahead.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Best Sunday Roast in Surrey */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Best Sunday Roast Near Heathrow &amp; Surrey"
              subtitle="A proper roast worth travelling for."
            />
            <div className="prose prose-invert max-w-none text-anchor-cream-text/70 space-y-4">
              <p>
                If you&rsquo;re searching for the best Sunday roast in Surrey, you&rsquo;ll find us at The Anchor in Stanwell Moor &mdash; a village pub that&rsquo;s been part of the community since 1751. We&rsquo;re not a chain restaurant or a hotel dining room. We&rsquo;re an independent British pub where the landlord knows your name and the roasts are cooked with care.
              </p>
              <p>
                What sets our Sunday lunch apart? Every dish is cooked fresh to your order. The lamb shank braises for hours. The pork belly is slow-roasted until the crackling shatters. The roast potatoes are hand-tossed in herb and garlic before they hit the oven. It&rsquo;s Sunday lunch the way it should be done &mdash; properly.
              </p>
              <p>
                We&rsquo;re rated 4.6 out of 5 on Google, with regulars travelling from Staines-upon-Thames, Ashford, Egham, and Windsor specifically for our Sunday roasts. We&rsquo;re also popular with Heathrow travellers looking for a real meal before or after a flight &mdash; just 7 minutes from Terminal 5 with 20 free parking spaces on site.
              </p>
              <p>
                Our Sunday lunch starts from &pound;19.99 per person. You get a full roast with all the trimmings, served in a proper pub with a beer garden, dog-friendly spaces, and a warm welcome. Whether you&rsquo;re celebrating a birthday, catching up with the family, or just fancy a roast dinner near me without cooking it yourself &mdash; we&rsquo;ve got you covered.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Book With Us */}
      <section className="section-spacing bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Why Book Sunday Lunch at The Anchor?"
              subtitle="More than just great food."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5">
                <p className="text-sm font-semibold text-anchor-gold-vivid">Free Parking</p>
                <p className="mt-1 text-sm text-anchor-cream-text/70">
                  20 free on-site parking spaces. No meters, no time limits, no stress. Park up and enjoy your Sunday lunch without watching the clock.
                </p>
              </div>
              <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5">
                <p className="text-sm font-semibold text-anchor-gold-vivid">Dog &amp; Family Friendly</p>
                <p className="mt-1 text-sm text-anchor-cream-text/70">
                  Dogs welcome throughout the pub and beer garden. We have water bowls, treats, and high chairs for the little humans. Everyone&rsquo;s part of the family here.
                </p>
              </div>
              <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5">
                <p className="text-sm font-semibold text-anchor-gold-vivid">Rated 4.6/5 on Google</p>
                <p className="mt-1 text-sm text-anchor-cream-text/70">
                  With over 238 Google reviews, our Sunday lunch is one of the highest-rated in the area. Don&rsquo;t just take our word for it.
                </p>
              </div>
              <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5">
                <p className="text-sm font-semibold text-anchor-gold-vivid">7 Minutes from Heathrow T5</p>
                <p className="mt-1 text-sm text-anchor-cream-text/70">
                  Perfect for a Sunday roast near Heathrow before or after a flight. We&rsquo;re closer than most airport restaurants &mdash; and the food is infinitely better.
                </p>
              </div>
              <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5">
                <p className="text-sm font-semibold text-anchor-gold-vivid">Beer Garden</p>
                <p className="mt-1 text-sm text-anchor-cream-text/70">
                  On a sunny day, enjoy your post-roast pint in the beer garden &mdash; directly under Heathrow&rsquo;s flight path. Watch planes land every 90 seconds at peak times.
                </p>
              </div>
              <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-5">
                <p className="text-sm font-semibold text-anchor-gold-vivid">Outside ULEZ</p>
                <p className="mt-1 text-sm text-anchor-cream-text/70">
                  We&rsquo;re outside the ULEZ zone, saving you &pound;12.50 a day. Drive over without the congestion charge hanging over your roast.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Seasonal Roasts */}
      <section className="section-spacing bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Seasonal Sunday Roasts"
              subtitle="Our menu moves with the seasons."
            />
            <div className="prose prose-invert max-w-none text-anchor-cream-text/70 space-y-4">
              <p>
                While our core roast options &mdash; chicken, lamb shank, pork belly, and vegetarian wellington &mdash; are available year-round, we adjust what goes on the plate with the seasons. In spring, expect lighter seasonal vegetables and fresh greens. Summer brings garden herbs and vibrant side dishes. Come autumn and winter, portions get heartier, root vegetables take centre stage, and the gravy gets richer.
              </p>
              <p>
                We occasionally introduce seasonal specials too. Keep an eye on our social media or call ahead on 01753 682707 to find out what&rsquo;s on this week. Our pre-order system means we source ingredients fresh each week, so you&rsquo;re always getting the best of what&rsquo;s available.
              </p>
              <p>
                Looking for a Sunday lunch near me that changes with the calendar? The Anchor&rsquo;s Sunday roast is never quite the same twice &mdash; and that&rsquo;s exactly the point.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section id="faq">
        <FAQAccordionWithSchema
          className="bg-anchor-bg"
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
            },
            {
              question: "Is The Anchor a good Sunday roast near Heathrow?",
              answer: "Yes. We're just 7 minutes from Heathrow Terminal 5 with 20 free parking spaces. Many guests stop in for a proper Sunday roast before or after a flight — much better than airport food."
            },
            {
              question: "Do you have a kids' Sunday roast?",
              answer: "Yes. Our kids' roasted chicken is a smaller portion of the same quality roast, served with all the trimmings for £13.99. Perfect for younger diners."
            },
            {
              question: "Is there a vegetarian Sunday roast option?",
              answer: "Yes — our beetroot and butternut squash Wellington is a proper vegetarian Sunday roast in golden puff pastry, served with roast potatoes, seasonal vegetables, and vegetarian gravy. From £19.99."
            },
            {
              question: "Can I book for a group on Sunday?",
              answer: "Absolutely. We seat groups of all sizes. For parties of 20 or more, please call us on 01753 682707 to arrange. The pub is also available for private hire."
            },
            {
              question: "Is parking free on Sundays?",
              answer: "Yes. We have 20 free on-site parking spaces available every day, including Sundays. No meters, no time limits while you're dining with us."
            },
            {
              question: "Are dogs welcome during Sunday lunch?",
              answer: "Yes — dogs are welcome throughout the pub and in the beer garden. We have water bowls and treats. Just mention it when you book."
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

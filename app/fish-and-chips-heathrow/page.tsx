import { Badge, Card, CardBody, SectionHeading } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { CtaBand } from '@/components/CtaBand'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { formatMenuAllergenLine, getMenuItemAllergens } from '@/lib/menu-allergens'
import {
  getFishAndChipsMenuPageData,
  getGlutenFreeFishAndChipsNotice,
  getMenuUnavailableMessage,
  type MenuPageItem
} from '@/lib/menu-page-data'

export const revalidate = 3600

function joinItemNames(items: MenuPageItem[]): string {
  if (items.length === 0) return 'the current fish and chip options'
  if (items.length === 1) return items[0].name
  return `${items.slice(0, -1).map((item) => item.name).join(', ')} and ${items[items.length - 1].name}`
}

function extractSchemaPrice(item?: MenuPageItem): string | undefined {
  if (!item?.price) return undefined
  const match = item.price.match(/(\d+[.,]?\d*)/)
  return match ? match[1].replace(',', '.') : undefined
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getFishAndChipsMenuPageData()
  const description = data
    ? "Fish and chips in Staines, see The Anchor's live menu with prices. Free parking, 7 mins from Heathrow Terminal 5."
    : 'Fish and chips in Staines at The Anchor pub near Heathrow. Current menu with prices and free parking.'

  return {
    title: 'Fish and Chips Staines | Pub Food Near Heathrow',
    description,
    openGraph: {
      title: 'Fish and Chips Staines | Pub Food Near Heathrow',
      description,
      images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
      type: 'website',
    },
    twitter: getTwitterMetadata({
      title: 'Fish and Chips Staines | Pub Food Near Heathrow',
      description,
      images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
      canonical: '/fish-and-chips-heathrow'
    }
  }
}

export default async function FishAndChipsPage() {
  const data = await getFishAndChipsMenuPageData()
  const fishItems = data?.fishItems ?? []
  const signatureFish = fishItems[0]
  const signaturePrice = extractSchemaPrice(signatureFish)

  const productSchema = signatureFish
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: signatureFish.name,
        image: DEFAULT_PAGE_HEADER_IMAGE,
        description: signatureFish.description,
        brand: {
          '@type': 'Brand',
          name: BRAND.name
        },
        offers: {
          '@type': 'Offer',
          ...(signaturePrice ? { price: signaturePrice } : {}),
          priceCurrency: 'GBP',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Restaurant',
            name: BRAND.name
          }
        }
      }
    : null

  const menuSchema = data
    ? {
        '@context': 'https://schema.org',
        '@type': 'Menu',
        name: 'Fish and Chips Menu',
        hasMenuSection: [
          {
            '@type': 'MenuSection',
            name: 'Fish and Chips',
            hasMenuItem: fishItems.map((item) => ({
              '@type': 'MenuItem',
              name: item.name,
              description: item.description,
              offers: {
                '@type': 'Offer',
                price: extractSchemaPrice(item),
                priceCurrency: 'GBP'
              }
            }))
          }
        ]
      }
    : null

  return (
    <>
      {(productSchema || menuSchema) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([productSchema, menuSchema].filter(Boolean)) }}
        />
      )}

      <InteriorHero
        image="/images/page-headers/food-menu/food-menu.jpg"
        crumb="Fish and Chips"
        title="Fish and Chips Near Heathrow"
        lead={signatureFish?.description || 'Current fish and chip options from our latest kitchen menu.'}
      />

      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="mx-auto text-center">
            <SectionHeading
              title="Fish and Chips Near Heathrow"
              lead="Current dish names, descriptions and prices are shown here when available online."
            />
          </div>
        </div>
      </section>

      <section className="bg-surface py-section-y">
        <div className="container">
          <SectionHeading
            title="Current Fish and Chip Options"
            lead="From the current food menu."
          />

          {fishItems.length > 0 ? (
            <div className="mx-auto grid gap-6 text-left md:grid-cols-2">
              {fishItems.map((item) => {
                const allergens = getMenuItemAllergens(item)
                return (
                  <Card key={item.id} accent hover>
                    <CardBody>
                      <h2 className="mb-2 text-h4 text-ink-strong">
                        {item.name}
                        {item.priceLabel && (
                          <span className="ml-2 whitespace-nowrap font-display text-xl text-accent-text">
                            {item.priceLabel}
                          </span>
                        )}
                      </h2>
                      {item.description && (
                        <p className="mb-3 text-sm text-ink-muted">{item.description}</p>
                      )}
                      <p className="mb-3 text-xs text-ink-muted">{item.categoryTitle}</p>
                      <Badge variant="outline">
                        {formatMenuAllergenLine(allergens)}
                      </Badge>
                    </CardBody>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card accent className="mx-auto">
              <CardBody>
                <h2 className="mb-2 text-h4 text-ink-strong">Menu temporarily unavailable</h2>
                <p className="text-ink-muted">{getMenuUnavailableMessage()}</p>
              </CardBody>
            </Card>
          )}

          <Card accent className="mx-auto mt-8">
            <CardBody>
              <h2 className="mb-2 text-h4 text-ink-strong">Do We Do Gluten Free Fish and Chips?</h2>
              <p className="text-ink-muted">{getGlutenFreeFishAndChipsNotice()}</p>
            </CardBody>
          </Card>
        </div>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'What fish and chip dishes are on the menu?',
            answer: fishItems.length > 0
              ? `The current menu lists ${joinItemNames(fishItems)}.`
              : 'Please call us for the current fish and chip dishes if the menu is temporarily unavailable online.'
          },
          {
            question: 'Do you offer gluten free fish and chips?',
            answer: getGlutenFreeFishAndChipsNotice()
          },
          {
            question: 'Can I get takeaway?',
            answer: 'Yes. Call us to order from the current menu and collect from the pub.'
          }
        ]}
      />

      <InternalLinkingSection
        title="More Fish and Food Guides"
        links={[
          {
            href: '/blog/fish-chips-guide',
            title: 'Fish and Chips Guide',
            description: 'A deeper guide to pub fish and chips near Heathrow.',
          },
          {
            href: '/food-menu',
            title: 'Full Food Menu',
            description: 'See the full live food menu.',
          },
          {
            href: '/food-menu/gluten-free',
            title: 'NGCI Menu',
            description: 'See current NGCI and NGCI-on-request dishes.',
          },
        ]}
      />

      <CtaBand
        title="Ready to eat?"
        copy="Book a table or call for collection from the live menu."
      >
        <BookTableButton
          source="fish_chips_cta"
          context="food"
          variant="primary"
          size="lg"
          trackingLabel="Fish and Chips Book a Table"
        >
          Book a table
        </BookTableButton>
        <PhoneButton
          phone={CONTACT.phone}
          source="fish_takeaway_cta"
          variant="outline"
          size="lg"
        >
          Order for collection
        </PhoneButton>
      </CtaBand>
    </>
  )
}

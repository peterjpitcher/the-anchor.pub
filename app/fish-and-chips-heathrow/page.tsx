import { CTASection, SectionHeading, AlertBox, Container } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT, BRAND } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
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
    ? "Fish and chips in Staines — see The Anchor's live menu with prices. Free parking, 7 mins from Heathrow Terminal 5."
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

      <section className="section-spacing-sm bg-anchor-green-card border-b border-anchor-gold-dark/15">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle className="text-anchor-cream-text mb-4">
              Fish and Chips Near Heathrow
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Current dish names, descriptions and prices are shown here when available online.
            </p>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-green-deep border-t border-anchor-gold-dark/15">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeading
              title="Current Fish and Chip Options"
              subtitle="From the current food menu."
            />

            {fishItems.length > 0 ? (
              <div className="mt-12 mb-12">
                <div className="grid md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
                  {fishItems.map((item) => (
                    <div key={item.id} className="bg-anchor-green-raised p-6 rounded-xl border border-anchor-gold-dark/15 hover:border-anchor-gold-dark transition-colors">
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <h2 className="font-bold text-xl text-anchor-cream-text">{item.name}</h2>
                        {item.priceLabel && <span className="font-bold text-anchor-gold-dark bg-anchor-green-card px-2 py-1 rounded text-sm whitespace-nowrap">{item.priceLabel}</span>}
                      </div>
                      {item.description && (
                        <p className="text-anchor-cream-text/55 text-sm mb-3">{item.description}</p>
                      )}
                      <p className="text-xs text-anchor-cream-text/40 mb-3">{item.categoryTitle}</p>

                      {item.allergens && item.allergens.length > 0 && (
                        <span className="inline-flex text-xs text-anchor-cream-text/60 border border-anchor-gold-dark/15 px-2 py-1 rounded-full">
                          Contains: {item.allergens.join(', ')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <AlertBox
                variant="info"
                title="Menu temporarily unavailable"
                className="max-w-2xl mx-auto mt-8"
                content={getMenuUnavailableMessage()}
              />
            )}

            <AlertBox
              variant="info"
              title="Gluten-Free Fish and Chips"
              className="max-w-2xl mx-auto mt-8"
              content={getGlutenFreeFishAndChipsNotice()}
            />
          </div>
        </Container>
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
            question: 'Do you offer gluten-free fish and chips?',
            answer: getGlutenFreeFishAndChipsNotice()
          },
          {
            question: 'Can I get takeaway?',
            answer: 'Yes. Call us to order from the current menu and collect from the pub.'
          }
        ]}
        className="bg-anchor-green-card"
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
            title: 'Gluten-Free Menu',
            description: 'See current gluten-free and gluten-free-option dishes.',
          },
        ]}
      />

      <CTASection
        title="Ready to Eat?"
        description="Book a table or call for collection from the live menu."
        buttons={[
          {
            text: 'Book a Table',
            href: '/book-table',
            variant: 'primary'
          },
          {
            text: 'Order for Collection',
            href: `${CONTACT.phoneHref}`,
            isPhone: true,
            phoneSource: 'fish_takeaway_cta',
            variant: 'outline'
          }
        ]}
        variant="green"
      />
    </>
  )
}

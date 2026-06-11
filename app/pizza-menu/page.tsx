import { CTASection, SectionHeading, Container, AlertBox } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { CONTACT } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import Image from 'next/image'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import {
  getMenuUnavailableMessage,
  getPizzaMenuPageData,
  type MenuPageItem
} from '@/lib/menu-page-data'

export const revalidate = 3600

function extractSchemaPrice(item: MenuPageItem): string | undefined {
  const match = item.price.match(/(\d+[.,]?\d*)/)
  return match ? match[1].replace(',', '.') : undefined
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPizzaMenuPageData()
  const pricePhrase = data?.priceFromLabel ? ` ${data.priceFromLabel}.` : ''
  const description = data
    ? `Pizza near Heathrow from The Anchor's live menu.${pricePhrase} Free parking, 7 minutes from Terminal 5.`
    : 'Pizza near Heathrow at The Anchor. Current dishes and prices from the latest kitchen menu.'

  return {
    title: 'Pizza Near Heathrow | The Anchor',
    description,
    openGraph: {
      title: 'Pizza Near Heathrow | The Anchor',
      description,
      images: ['/images/page-headers/pizza-tuesday/pizza-tuesday.jpg'],
      type: 'website',
    },
    twitter: getTwitterMetadata({
      title: 'Pizza Near Heathrow | The Anchor',
      description,
      images: ['/images/page-headers/pizza-tuesday/pizza-tuesday.jpg']
    }),
    alternates: {
      canonical: '/pizza-menu'
    }
  }
}

export default async function PizzaMenuPage() {
  const data = await getPizzaMenuPageData()
  const pizzaItems = data?.pizzaItems ?? []
  const gfAvailable = pizzaItems.some((item) => item.glutenFreeAvailable)
  const veganOptions = pizzaItems.filter((item) => item.veganOptionAvailable)

  const menuSchema = data
    ? {
        '@context': 'https://schema.org',
        '@type': 'Menu',
        '@id': 'https://www.the-anchor.pub/pizza-menu#menu',
        name: 'Pizza Menu',
        description: 'Current pizza menu at The Anchor.',
        provider: { '@id': 'https://www.the-anchor.pub/#business' },
        hasMenuSection: data.menuData.categories.flatMap((category) =>
          category.sections.map((section) => ({
            '@type': 'MenuSection',
            name: section.title || category.title,
            hasMenuItem: section.items.map((item) => {
              const pageItem = item as MenuPageItem
              return {
                '@type': 'MenuItem',
                name: pageItem.name,
                description: pageItem.description,
                offers: {
                  '@type': 'Offer',
                  price: extractSchemaPrice(pageItem),
                  priceCurrency: 'GBP'
                }
              }
            })
          }))
        ),
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
      }
    : null

  return (
    <>
      {menuSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([menuSchema]) }}
        />
      )}

      <HeroWrapper
        route="/pizza-menu"
        title="Pizza at The Anchor"
        description="Current pizza dishes, descriptions and prices from the latest kitchen menu."
        image={{
          src: '/images/page-headers/pizza-tuesday/pizza-tuesday.jpg',
          alt: 'Stone-baked pizza at The Anchor'
        }}
        variant="default"
        enableSmartCtas={true}
        showContextStrip={true}
      />

      <section className="section-spacing-lg bg-anchor-green-deep border-b border-anchor-gold-dark/15">
        <Container>
          <div className="max-w-4xl mx-auto text-center mb-12">
            <PageTitle className="text-anchor-cream-text mb-6">
              Pizza Near Heathrow
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70 leading-relaxed">
              If a pizza name, description or price changes, this page follows that update.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative h-[400px] w-full rounded-none overflow-hidden">
              <Image
                src="/images/page-headers/pizza-tuesday/pizza-tuesday.jpg"
                alt="Fresh pizza at The Anchor"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6 text-left">
              <h2 className="text-3xl font-bold text-anchor-gold-bright">Dietary Notes</h2>
              <ul className="space-y-4 text-anchor-cream-text/70">
                <li>Gluten-free availability is shown on each live menu item when available.</li>
                <li>Vegan-option dishes are labelled from the menu data and should be requested at the bar.</li>
                <li>Allergen guidance is available before you order.</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-green-raised border-b border-anchor-gold-dark/15">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeading
              title="Current Pizza Menu"
              subtitle="From the current food menu."
            />

            {pizzaItems.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
                {pizzaItems.map((item) => (
                  <div key={item.id} className="bg-anchor-green-card rounded-none border border-anchor-gold-dark/15 p-6 hover:border-anchor-gold-dark/40 transition-shadow">
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <h2 className="font-bold text-xl text-anchor-gold-bright">{item.name}</h2>
                      {item.priceLabel && <span className="font-semibold text-anchor-gold-dark bg-anchor-green-deep px-2 py-1 rounded text-sm whitespace-nowrap">{item.priceLabel}</span>}
                    </div>
                    {item.description && (
                      <p className="text-anchor-cream-text/70 mb-3 text-sm leading-relaxed">{item.description}</p>
                    )}
                    <div className="flex gap-2 text-xs flex-wrap">
                      {item.vegetarian && <span className="bg-green-900/30 text-anchor-gold-bright px-2 py-0.5 rounded-full font-medium">Vegetarian</span>}
                      {item.vegan && <span className="bg-green-900/30 text-green-300 px-2 py-0.5 rounded-full font-medium">Vegan</span>}
                      {item.veganOptionAvailable && <span className="bg-green-900/30 text-green-300 px-2 py-0.5 rounded-full font-medium">Vegan option</span>}
                      {item.glutenFreeAvailable && <span className="bg-amber-900/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">GF option</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <AlertBox
                variant="info"
                title="Menu temporarily unavailable"
                className="max-w-2xl mx-auto"
                content={getMenuUnavailableMessage()}
              />
            )}
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'Do you do gluten-free bases?',
            answer: gfAvailable
              ? 'The current pizza menu includes gluten-free-base options. Please ask at the bar when ordering and tell us about any allergies.'
              : 'Please ask at the bar for the latest gluten-free pizza and allergen guidance.'
          },
          {
            question: 'Can pizzas be made vegan?',
            answer: veganOptions.length > 0
              ? `The current menu marks ${veganOptions.map((item) => item.name).join(', ')} as vegan-option dishes. Ask at the bar when ordering.`
              : 'Please ask at the bar for the latest vegan-option dishes.'
          },
          {
            question: 'Can I order takeaway?',
            answer: 'Yes. Call us on 01753 682707 to order from the current menu for collection.'
          }
        ]}
        className="bg-anchor-green-deep"
      />

      <CTASection
        title="Ready for Pizza?"
        description="Book a table or call to order from the live menu."
        buttons={[
          {
            text: 'Book Table',
            href: '/book-table',
            variant: 'primary'
          },
          {
            text: 'Order for Collection',
            href: `${CONTACT.phoneHref}`,
            isPhone: true,
            phoneSource: 'pizza_takeaway_cta',
            variant: 'outline'
          }
        ]}
        variant="green"
      />
    </>
  )
}

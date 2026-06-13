import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { Badge, Button, Card, CardBody, SectionHeading } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { CtaBand } from '@/components/CtaBand'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { CONTACT } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { FoodMenuSection } from '../food-menu/_components/FoodMenuSection'
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

function formatPoundPrice(price: number): string {
  return price % 1 === 0 ? `£${price}` : `£${price.toFixed(2)}`
}

function getPriceFromLabel(items: MenuPageItem[]): string | null {
  const prices = items
    .map((item) => item.priceValue)
    .filter((price) => Number.isFinite(price) && price > 0)

  if (prices.length === 0) return null
  return `from ${formatPoundPrice(Math.min(...prices))}`
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
  const pizzaPriceFrom = getPriceFromLabel(pizzaItems)

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

      <InteriorHero
        image="/images/page-headers/pizza-tuesday/pizza-tuesday.jpg"
        crumb="Pizza"
        title="Pizza at The Anchor"
        lead="Current pizza dishes, descriptions and prices from the latest kitchen menu."
        badges={<Badge variant="sand">{pizzaPriceFrom ? `Pizzas ${pizzaPriceFrom}` : 'Live pizza prices'}</Badge>}
      />

      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <SectionHeading
              title="Pizza Near Heathrow"
              lead="If a pizza name, description or price changes, this page follows that update."
            />
          </div>

          <div className="mt-4 grid items-center gap-10 md:grid-cols-2">
            <div className="relative h-[400px] w-full overflow-hidden rounded-md shadow-lg">
              <Image
                src="/images/page-headers/pizza-tuesday/pizza-tuesday.jpg"
                alt="Fresh pizza at The Anchor"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-6 text-left">
              <h2 className="text-h3 text-ink-strong">Dietary Notes</h2>
              <ul className="space-y-4 text-ink-muted">
                <li>Allergens are listed on each pizza from the live menu data.</li>
                <li>Vegan-option dishes are labelled from the menu data and should be requested at the bar.</li>
                <li>Allergen guidance is available before you order.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-section-y">
        <div className="container">
          <SectionHeading
            title="Current Pizza Menu"
            lead="From the current food menu."
          />
          {data && pizzaItems.length > 0 ? (
            <FoodMenuSection menuData={data.menuData} showFilters={false} />
          ) : (
            <Card accent className="mx-auto max-w-2xl">
              <CardBody>
                <h2 className="mb-2 text-h4 text-ink-strong">Menu temporarily unavailable</h2>
                <p className="text-ink-muted">{getMenuUnavailableMessage()}</p>
              </CardBody>
            </Card>
          )}
        </div>
      </section>

      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'Do you do gluten-free bases?',
            answer: gfAvailable
              ? 'Some pizzas have change options in the live menu. Please ask at the bar when ordering and tell us about any allergies.'
              : 'Please ask at the bar for the latest pizza allergen guidance.'
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
      />

      <CtaBand
        title="Ready for pizza?"
        copy="Book a table or call to order from the live menu."
      >
        <BookTableButton
          source="pizza_page_cta"
          context="food"
          variant="primary"
          size="lg"
          trackingLabel="Pizza Book a Table"
        >
          Book a table
        </BookTableButton>
        <PhoneButton
          phone={CONTACT.phone}
          source="pizza_takeaway_cta"
          variant="outline"
          size="lg"
        >
          Order for collection
        </PhoneButton>
        <Link href="/food-menu">
          <Button variant="outline" size="lg">
            Full food menu
          </Button>
        </Link>
      </CtaBand>
    </>
  )
}

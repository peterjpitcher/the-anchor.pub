import Link from 'next/link'
import { Metadata } from 'next'
import { Card, CardBody, SectionHeading } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { CtaBand } from '@/components/CtaBand'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { DietaryMenuNav } from '@/components/food/DietaryMenuNav'
import { FoodMenuSection } from '../_components/FoodMenuSection'
import {
  getMenuUnavailableMessage,
  getVegetarianMenuPageData,
  type MenuPageItem
} from '@/lib/menu-page-data'

export const revalidate = 3600

function joinPreview(items: MenuPageItem[]): string {
  const names = items.slice(0, 5).map((item) => item.name)
  if (names.length === 0) return 'the current vegetarian options'
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getVegetarianMenuPageData()
  const description = data
    ? `Vegetarian pub food near Heathrow from The Anchor's live menu. ${data.items.length} current vegetarian and vegan dishes. Free parking, 7 minutes from Terminal 5.`
    : 'Vegetarian pub food near Heathrow at The Anchor. Current options from the latest kitchen menu.'

  return {
    title: 'Vegetarian Menu | Pub Food Near Heathrow',
    description,
    openGraph: {
      title: 'Vegetarian Menu | Pub Food Near Heathrow',
      description,
      images: [
        {
          url: '/images/page-headers/home/page-headers-homepage.jpg',
          width: 1200,
          height: 630,
          alt: 'The Anchor in Stanwell Moor',
        },
      ],
    },
    twitter: getTwitterMetadata({
      title: 'Vegetarian Menu | Pub Food Near Heathrow',
      description,
    }),
    alternates: {
      canonical: '/food-menu/vegetarian',
    },
  }
}

export default async function VegetarianMenuPage() {
  const data = await getVegetarianMenuPageData()
  const totalVegetarianItems = data?.items.length ?? 0

  const faqItems = [
    {
      question: 'Does The Anchor have a vegetarian menu?',
      answer: data
        ? `Yes. This page lists ${totalVegetarianItems} current vegetarian and vegan dishes.`
        : 'Yes. Please call us for the current vegetarian options if the menu is temporarily unavailable online.',
    },
    {
      question: 'What vegetarian dishes are currently listed?',
      answer: data
        ? `The current vegetarian list includes ${joinPreview(data.items)}. Check the live menu section on this page for descriptions and prices.`
        : getMenuUnavailableMessage(),
    },
    {
      question: 'Is the vegetarian food cooked separately?',
      answer: 'Our dishes are prepared in one kitchen, so we cannot guarantee no cross-contamination. Ask at the bar for allergen information before ordering.',
    },
    {
      question: 'Is there a vegan menu too?',
      answer: 'Yes. See our vegan menu for items that are vegan as standard or can be made vegan on request.',
    },
    {
      question: 'Can I book a table for a vegetarian meal near Heathrow?',
      answer: 'Yes. Reserve online or call 01753 682707. We are 7 minutes from Heathrow Terminal 5 with free parking.',
    },
  ]

  return (
    <>
      <InteriorHero
        image="/images/page-headers/food-menu/food-menu.jpg"
        crumb="Vegetarian"
        title="Vegetarian Menu"
        lead="Current vegetarian dishes, descriptions and prices from the latest kitchen menu."
      />

      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              align="left"
              title="Vegetarian Pub Food Near Heathrow"
              lead="Current vegetarian and vegan options."
            />
            <p className="text-ink-muted">
              If the kitchen updates a dish, description or price, this page follows that update.
            </p>
            <ul className="mt-4 space-y-2 text-ink-muted">
              <li>&bull; Vegetarian and vegan dishes are grouped by their live menu section.</li>
              <li>&bull; Prices and descriptions are shown from the current menu.</li>
              <li>&bull; Ask at the bar for allergen guidance before ordering.</li>
            </ul>
          </div>
          <div className="mt-8">
            <DietaryMenuNav />
          </div>
        </div>
      </section>

      <section id="menu" className="bg-surface py-section-y">
        <div className="container">
          <SectionHeading
            title="Current Vegetarian Menu"
            lead={data ? `${totalVegetarianItems} vegetarian and vegan dishes from the live food menu.` : getMenuUnavailableMessage()}
          />
          {data ? (
            <FoodMenuSection menuData={data.menuData} showFilters={false} />
          ) : (
            <Card accent className="mx-auto max-w-4xl">
              <CardBody>
                <h2 className="mb-2 text-h4 text-ink-strong">Menu temporarily unavailable</h2>
                <p className="text-ink-muted">{getMenuUnavailableMessage()}</p>
              </CardBody>
            </Card>
          )}
        </div>
      </section>

      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              align="left"
              title="Vegetarian Dining Near Heathrow Airport"
              lead="A proper meal before, after, or instead of a flight."
            />
            <div className="space-y-4 text-ink-muted">
              <p>
                The Anchor is 7 minutes from Heathrow Terminal 5, with free parking and a current menu that stays in sync with the kitchen.
              </p>
              <p>
                If you have specific allergen needs, speak to the team at the bar and we will walk you through the current options.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div data-sticky-cta-guard="true">
        <CtaBand
          title="Hungry? Book your table now."
          copy="Reserve online or call ahead and we will have your table ready."
        >
          <BookTableButton
            source="vegetarian_menu_footer"
            context="food"
            variant="primary"
            size="lg"
            trackingLabel="Vegetarian Footer Book a Table"
          >
            Book a table
          </BookTableButton>
          <PhoneButton
            phone="01753 682707"
            source="vegetarian_menu_footer"
            variant="outline"
            size="lg"
          >
            01753 682707
          </PhoneButton>
        </CtaBand>
      </div>

      <section className="bg-surface-sunk py-section-y">
        <div className="container">
          <Card accent className="mx-auto max-w-4xl">
            <CardBody>
              <h2 className="mb-2 text-h4 text-ink-strong">Allergen Information</h2>
              <p className="text-ink-muted">
                All dishes are prepared in a single kitchen where allergens are present. Speak to us about your needs before ordering.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      <FAQAccordionWithSchema faqs={faqItems} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafeStringify({
            '@context': 'https://schema.org',
            '@type': 'Menu',
            '@id': 'https://www.the-anchor.pub/food-menu/vegetarian#menu',
            name: 'Vegetarian Menu at The Anchor',
            description: 'Vegetarian pub food at The Anchor near Heathrow.',
            url: 'https://www.the-anchor.pub/food-menu/vegetarian',
            isPartOf: { '@id': 'https://www.the-anchor.pub/#business' },
          }),
        }}
      />

      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="mb-6 text-h3 text-ink-strong">Explore More</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/food-menu" className="inline-flex min-h-[44px] items-center rounded-pill border-[1.5px] border-line-strong bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-anchor-gold-dark">
                Full Food Menu
              </Link>
              <Link href="/food-menu/vegan" className="inline-flex min-h-[44px] items-center rounded-pill border-[1.5px] border-line-strong bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-anchor-gold-dark">
                Vegan Menu
              </Link>
              <Link href="/food-menu/gluten-free" className="inline-flex min-h-[44px] items-center rounded-pill border-[1.5px] border-line-strong bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-anchor-gold-dark">
                NGCI Menu
              </Link>
              <Link href="/book-table" className="inline-flex min-h-[44px] items-center rounded-pill border-[1.5px] border-line-strong bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-anchor-gold-dark">
                Book a Table
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

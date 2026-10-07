import Link from 'next/link'
import { Metadata } from 'next'
import { Button, Card, CardBody, SectionHeading } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { CtaBand } from '@/components/CtaBand'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { DietaryMenuNav } from '@/components/food/DietaryMenuNav'
import { DietaryItemList } from '../_components/DietaryItemList'
import {
  getGlutenFreeFishAndChipsNotice,
  getGlutenFreeMenuPageData,
  getMenuUnavailableMessage
} from '@/lib/menu-page-data'
import { NGCI_WORDING, ONE_KITCHEN_WORDING } from '@/lib/approved-wording'
import {
  NGCI_PIZZA_BASE_WORDING,
  describeNgciDishCount,
  joinNgciDishNames
} from '@/lib/ngci-menu-copy'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const data = await getGlutenFreeMenuPageData()
  // Only the dishes the kitchen flags as NGCI are counted. Pizzas that can be
  // made on an NGCI base on request are a different thing and are never added
  // to this number.
  const flaggedCount = data ? data.glutenFreeItems.length : 0
  const hasPizzaBase = data ? data.glutenFreeOptionItems.length > 0 : false
  const countPhrase = flaggedCount > 0 ? ` ${describeNgciDishCount(flaggedCount)}.` : ''
  const pizzaPhrase = hasPizzaBase ? ' Pizzas on an NGCI base on request.' : ''
  // The metadata deliberately keeps the phrase "gluten free": it is what guests
  // search for, and the SSOT allows it on search-facing surfaces only. The
  // visible on-page label is NGCI, because we cannot make the regulated claim.
  const description = data
    ? `NGCI pub food near Heathrow, our gluten free options from The Anchor's live menu.${countPhrase}${pizzaPhrase} Free parking, 7 minutes from Terminal 5.`
    : 'NGCI pub food near Heathrow, our gluten free options at The Anchor. Current dishes from the latest kitchen menu.'

  return {
    title: 'NGCI Pub Food, Gluten Free Options Near Heathrow',
    description,
    openGraph: {
      title: 'NGCI Menu, Gluten Free Options | The Anchor, Stanwell Moor',
      description,
      images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
    },
    twitter: getTwitterMetadata({
      title: 'NGCI Menu, Gluten Free Options | The Anchor, Stanwell Moor',
      description,
      images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
    }),
    alternates: {
      canonical: '/food-menu/gluten-free',
    },
  }
}

export default async function GlutenFreeMenuPage() {
  const data = await getGlutenFreeMenuPageData()
  // Dishes the kitchen flags as NGCI in the management app. These are the only
  // dishes this page counts or names.
  const flaggedNgci = data?.glutenFreeItems ?? []
  // Pizzas that can be made on an NGCI base on request. Said separately, and
  // never named or counted as NGCI dishes.
  const hasPizzaBase = (data?.glutenFreeOptionItems.length ?? 0) > 0
  const pizzaSentence = hasPizzaBase ? ` ${NGCI_PIZZA_BASE_WORDING}` : ''

  const faqItems = [
    {
      question: 'Does The Anchor have gluten free options?',
      answer: data
        ? `${flaggedNgci.length > 0 ? `Our kitchen flags ${describeNgciDishCount(flaggedNgci.length, 'short')} as NGCI. ` : ''}${NGCI_WORDING}${pizzaSentence} Please check with the team before ordering.`
        : getMenuUnavailableMessage(),
    },
    {
      question: 'What is NGCI, and why not just say gluten-free?',
      answer:
        'NGCI means No Gluten Containing Ingredients. "Gluten-free" is a regulated term meaning the food has been verified below 20 parts per million, which needs a separate preparation area we do not have. NGCI is the honest description of what we can offer.',
    },
    {
      question: 'What NGCI dishes are currently listed?',
      answer: data
        ? `${flaggedNgci.length > 0 ? `Our kitchen flags ${joinNgciDishNames(flaggedNgci)} as NGCI.` : 'Our kitchen does not flag any dish as NGCI right now.'}${pizzaSentence} ${ONE_KITCHEN_WORDING}`
        : getMenuUnavailableMessage(),
    },
    {
      question: 'Do you offer gluten free fish and chips?',
      answer: getGlutenFreeFishAndChipsNotice(),
    },
    {
      question: 'Is there a risk of cross-contamination?',
      answer: 'Our dishes are prepared in one kitchen, so we cannot guarantee no cross-contamination. Please inform us of any allergies when ordering and we will do our best to accommodate you.',
    },
    {
      question: 'Do you charge extra for NGCI dishes?',
      answer: 'Please check the current item prices on this page or ask at the bar before ordering.',
    },
  ]

  return (
    <>
      <InteriorHero
        image="/images/food/weekday-2026/stone-baked-pizza.jpg"
        crumb="NGCI"
        title="NGCI Pub Food"
        lead="No Gluten Containing Ingredients. The dishes our kitchen flags as NGCI, from the live menu."
      />

      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="mx-auto text-center">
            <SectionHeading
              title="NGCI Pub Food at The Anchor"
              lead="The dishes our kitchen flags as NGCI, from the live menu."
            />
            <p className="text-ink-muted">{NGCI_WORDING}</p>
            <p className="mt-4 text-ink-muted">{getGlutenFreeFishAndChipsNotice()}</p>
          </div>
          <div className="mt-8">
            <DietaryMenuNav/>
          </div>
        </div>
      </section>

      <section className="bg-surface py-section-y">
        <div className="container">
          <SectionHeading
            title="Dishes Our Kitchen Flags as NGCI"
            lead="Please check with the team before ordering."
          />
          {flaggedNgci.length > 0 ? (
            <DietaryItemList items={flaggedNgci} />
          ) : (
            <p className="text-center text-ink-muted">
              {data ? 'Our kitchen does not flag any dish as NGCI right now. Please ask the bar team.' : getMenuUnavailableMessage()}
            </p>
          )}
        </div>
      </section>

      {hasPizzaBase && (
        <section className="bg-canvas py-section-y">
          <div className="container">
            <div className="mx-auto text-center">
              <SectionHeading
                title="Pizzas on an NGCI Base"
                lead={NGCI_PIZZA_BASE_WORDING}
              />
              <p className="text-ink-muted">
                It is the base that changes, so ask the bar team about the toppings before you order. {ONE_KITCHEN_WORDING}
              </p>
              <p className="mt-4">
                <Link href="/pizza-menu" className="font-semibold text-accent-text hover:underline">
                  See the pizza menu
                </Link>
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="bg-surface py-section-y">
        <div className="container">
          <div className="mx-auto">
            <SectionHeading
              align="left"
              title="What to Tell Us When Ordering"
              lead="A quick word at the bar is all it takes."
            />
            <p className="text-ink-muted">
              Let the bar staff know about gluten or any other allergen needs before ordering. Our dishes are prepared in one kitchen, so we cannot guarantee zero cross-contamination.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface-sunk py-section-y">
        <div className="container">
          <Card accent className="mx-auto">
            <CardBody>
              <h2 className="mb-2 text-h4 text-ink-strong">Allergen Information</h2>
              <p className="text-ink-muted">
                Our dishes are prepared in one kitchen, so we cannot guarantee no cross-contamination. Please ask at the bar for full allergen information.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="mx-auto text-center">
            <h2 className="mb-2 text-h3 text-ink-strong">Kitchen Hours</h2>
            <p className="text-ink-muted">
              These options are available during regular kitchen hours. See the{' '}
              <Link href="/food-menu" className="font-semibold text-accent-text hover:underline">
                full food menu
              </Link>{' '}
              for live kitchen times.
            </p>
          </div>
        </div>
      </section>

      <FAQAccordionWithSchema faqs={faqItems} />

      <section className="bg-surface py-section-y">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/food-menu" className="font-semibold text-accent-text hover:underline">
              Full Food Menu
            </Link>
            <span className="text-ink-muted">|</span>
            <Link href="/food-menu/vegetarian" className="font-semibold text-accent-text hover:underline">
              Vegetarian Menu
            </Link>
            <span className="text-ink-muted">|</span>
            <Link href="/food-menu/vegan" className="font-semibold text-accent-text hover:underline">
              Vegan Menu
            </Link>
            <span className="text-ink-muted">|</span>
            <Link href="/book-table" className="font-semibold text-accent-text hover:underline">
              Book a Table
            </Link>
          </div>
        </div>
      </section>

      <div data-sticky-cta-guard="true">
        <CtaBand
          title="Hungry? Book your table now."
          copy="Reserve online or call ahead and we will have your table ready."
        >
          <BookTableButton
            source="gluten_free_menu_footer"
            context="food"
            variant="primary"
            size="lg"
            trackingLabel="Gluten Footer Book a Table"
          >
            Book a table
          </BookTableButton>
          <PhoneButton
            phone="01753 682707"
            source="gluten_free_menu_footer"
            variant="outline"
            size="lg"
          >
            01753 682707
          </PhoneButton>
          <Button asChild variant="outline" size="lg">
            <Link href="/food-menu">
              View full menu
            </Link>
          </Button>
        </CtaBand>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafeStringify({
            '@context': 'https://schema.org',
            '@type': 'Menu',
            '@id': 'https://www.the-anchor.pub/food-menu/gluten-free#menu',
            name: 'NGCI Menu at The Anchor',
            description: `Pub food with No Gluten Containing Ingredients at The Anchor near Heathrow. ${ONE_KITCHEN_WORDING}`,
            url: 'https://www.the-anchor.pub/food-menu/gluten-free',
            isPartOf: { '@id': 'https://www.the-anchor.pub/#business' },
          }),
        }}
      />
    </>
  )
}

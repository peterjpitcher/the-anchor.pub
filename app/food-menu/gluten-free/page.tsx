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
  getMenuUnavailableMessage,
  type MenuPageItem
} from '@/lib/menu-page-data'

export const revalidate = 3600

function joinItemNames(items: MenuPageItem[]): string {
  const names = items.slice(0, 5).map((item) => item.name)
  if (names.length === 0) return 'the current filtered options'
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getGlutenFreeMenuPageData()
  const filteredCount = data ? data.glutenFreeItems.length + data.glutenFreeOptionItems.length : 0
  // The metadata deliberately keeps the phrase "gluten free": it is what guests
  // search for, and the SSOT allows it on search-facing surfaces only. The
  // visible on-page label is NGCI, because we cannot make the regulated claim.
  const description = data
    ? `NGCI pub food near Heathrow, our gluten free options from The Anchor's live menu. ${filteredCount} current dishes with allergen details. Free parking, 7 minutes from Terminal 5.`
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
  const naturallyGf = data?.glutenFreeItems ?? []
  const gfoItems = data?.glutenFreeOptionItems ?? []
  const totalGfItems = naturallyGf.length + gfoItems.length

  const faqItems = [
    {
      question: 'Does The Anchor have gluten free options?',
      answer: data
        ? `We list ${totalGfItems} current dishes as NGCI, meaning No Gluten Containing Ingredients. We do not call them gluten-free, because everything is prepared in one kitchen and we cannot guarantee zero cross-contamination. Please check with the team before ordering.`
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
        ? `The current filtered list includes ${joinItemNames([...naturallyGf, ...gfoItems])}. Check the live menu sections for descriptions, prices and allergens.`
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
        image="/images/page-headers/food-menu/food-menu.jpg"
        crumb="NGCI"
        title="NGCI Pub Food"
        lead="No Gluten Containing Ingredients. Current dishes with allergen details from the latest kitchen menu."
      />

      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="mx-auto text-center">
            <SectionHeading
              title="NGCI Pub Food at The Anchor"
              lead="Current dishes with allergen details from the live menu."
            />
            <p className="text-ink-muted">
              NGCI stands for No Gluten Containing Ingredients. We use it rather than
              &ldquo;gluten-free&rdquo; because that is a regulated term, and every dish here is
              prepared in one shared kitchen where we cannot guarantee zero cross-contamination.
            </p>
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
            title="No Gluten Allergen Listed"
            lead="These dishes have no gluten allergen listed in the live menu data. Please check with the team before ordering."
          />
          {naturallyGf.length > 0 ? (
            <DietaryItemList items={naturallyGf} />
          ) : (
            <p className="text-center text-ink-muted">{getMenuUnavailableMessage()}</p>
          )}
        </div>
      </section>

      {gfoItems.length > 0 && (
        <section className="bg-canvas py-section-y">
          <div className="container">
            <SectionHeading
              title="Possible Changes on Request"
              lead="These dishes may be changed on request. Please check with the team before ordering."
            />
            <DietaryItemList items={gfoItems} />
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
          <Link href="/food-menu">
            <Button variant="outline" size="lg">
              View full menu
            </Button>
          </Link>
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
            description: 'Pub food with No Gluten Containing Ingredients and allergen details at The Anchor near Heathrow. Prepared in a shared kitchen, so zero cross-contamination cannot be guaranteed.',
            url: 'https://www.the-anchor.pub/food-menu/gluten-free',
            isPartOf: { '@id': 'https://www.the-anchor.pub/#business' },
          }),
        }}
      />
    </>
  )
}

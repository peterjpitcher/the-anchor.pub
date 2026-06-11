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
  if (names.length === 0) return 'the current gluten-free options'
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getGlutenFreeMenuPageData()
  const gfCount = data ? data.glutenFreeItems.length + data.glutenFreeOptionItems.length : 0
  const description = data
    ? `Gluten-free pub food near Heathrow from The Anchor's live menu. ${gfCount} current gluten-free or gluten-free-option dishes. Free parking, 7 minutes from Terminal 5.`
    : 'Gluten-free pub food near Heathrow at The Anchor. Current options from the latest kitchen menu.'

  return {
    title: 'Gluten-Free Pub Food Near Heathrow | The Anchor',
    description,
    openGraph: {
      title: 'Gluten-Free Pub Food | The Anchor, Stanwell Moor',
      description,
      images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
    },
    twitter: getTwitterMetadata({
      title: 'Gluten-Free Pub Food | The Anchor, Stanwell Moor',
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
      question: 'Does The Anchor have gluten-free options?',
      answer: data
        ? `Yes. This page lists ${totalGfItems} current gluten-free or gluten-free-option dishes.`
        : getMenuUnavailableMessage(),
    },
    {
      question: 'What gluten-free dishes are currently listed?',
      answer: data
        ? `The current gluten-free list includes ${joinItemNames([...naturallyGf, ...gfoItems])}. Check the live menu sections for descriptions and prices.`
        : getMenuUnavailableMessage(),
    },
    {
      question: 'Do you offer gluten-free fish and chips?',
      answer: getGlutenFreeFishAndChipsNotice(),
    },
    {
      question: 'Is there a risk of cross-contamination?',
      answer: 'Our dishes are prepared in one kitchen, so we cannot guarantee no cross-contamination. Please inform us of any allergies when ordering and we will do our best to accommodate you.',
    },
    {
      question: 'Do you charge extra for gluten-free?',
      answer: 'Please check the current item prices on this page or ask at the bar before ordering.',
    },
  ]

  return (
    <>
      <InteriorHero
        image="/images/page-headers/food-menu/food-menu.jpg"
        crumb="Gluten-Free"
        title="Gluten-Free Pub Food"
        lead="Current gluten-free and gluten-free-option dishes from the latest kitchen menu."
      />

      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <SectionHeading
              title="Gluten-Free Pub Food at The Anchor"
              lead="Current gluten-free and gluten-free-option dishes."
            />
            <p className="text-ink-muted">
              We do not offer gluten-free fish and chips, gluten-free batter, gluten-free fried fish, grilled gluten-free fish, or a dedicated gluten-free fryer for fish and chips.
            </p>
          </div>
          <div className="mt-8">
            <DietaryMenuNav />
          </div>
        </div>
      </section>

      <section className="bg-surface py-section-y">
        <div className="container">
          <SectionHeading
            title="Gluten-Free (GF)"
            lead="These dishes are gluten-free as standard according to the live menu."
          />
          {naturallyGf.length > 0 ? (
            <DietaryItemList items={naturallyGf} badge="GF" />
          ) : (
            <p className="text-center text-ink-muted">{getMenuUnavailableMessage()}</p>
          )}
        </div>
      </section>

      {gfoItems.length > 0 && (
        <section className="bg-canvas py-section-y">
          <div className="container">
            <SectionHeading
              title="Gluten-Free Options (GFO)"
              lead="These dishes can be made gluten-free on request."
            />
            <DietaryItemList items={gfoItems} badge="GFO" />
          </div>
        </section>
      )}

      <section className="bg-surface py-section-y">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              align="left"
              title="What to Tell Us When Ordering"
              lead="A quick word at the bar is all it takes."
            />
            <p className="text-ink-muted">
              Let the bar staff know you need gluten-free options before ordering. Our dishes are prepared in one kitchen, so we cannot guarantee zero cross-contamination.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface-sunk py-section-y">
        <div className="container">
          <Card accent className="mx-auto max-w-4xl">
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
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-2 text-h3 text-ink-strong">Kitchen Hours</h2>
            <p className="text-ink-muted">
              Gluten-free options are available during regular kitchen hours. See the{' '}
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
            trackingLabel="GF Footer Book a Table"
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
            name: 'Gluten-Free Menu at The Anchor',
            description: 'Gluten-free pub food options at The Anchor near Heathrow.',
            url: 'https://www.the-anchor.pub/food-menu/gluten-free',
            isPartOf: { '@id': 'https://www.the-anchor.pub/#business' },
          }),
        }}
      />
    </>
  )
}

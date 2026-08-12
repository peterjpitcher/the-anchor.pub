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
  getMenuUnavailableMessage,
  getVeganMenuPageData,
  type MenuPageItem
} from '@/lib/menu-page-data'

export const revalidate = 3600

function joinItemNames(items: MenuPageItem[]): string {
  const names = items.slice(0, 5).map((item) => item.name)
  if (names.length === 0) return 'the current vegan options'
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getVeganMenuPageData()
  const veganCount = data ? data.veganItems.length + data.veganOptionItems.length : 0
  const description = data
    ? `Vegan pub food near Heathrow from The Anchor's live menu. ${veganCount} current vegan or vegan-option dishes. Free parking, 7 minutes from Terminal 5.`
    : 'Vegan pub food near Heathrow at The Anchor. Current options from the latest kitchen menu.'

  return {
    title: 'Vegan Pub Food Near Heathrow',
    description,
    openGraph: {
      title: 'Vegan Pub Food | The Anchor Near Heathrow',
      description,
      images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
    },
    twitter: getTwitterMetadata({
      title: 'Vegan Pub Food | The Anchor Near Heathrow',
      description,
      images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
    }),
    alternates: {
      canonical: '/food-menu/vegan',
    },
  }
}

export default async function VeganMenuPage() {
  const data = await getVeganMenuPageData()
  const fullyVegan = data?.veganItems ?? []
  const veganOption = data?.veganOptionItems ?? []
  const totalVeganItems = fullyVegan.length + veganOption.length

  const faqItems = [
    {
      question: 'Does The Anchor have vegan food?',
      answer: data
        ? `Yes. This page lists ${totalVeganItems} current vegan or vegan-option dishes.`
        : getMenuUnavailableMessage(),
    },
    {
      question: 'What vegan dishes are currently listed?',
      answer: data
        ? `The current vegan list includes ${joinItemNames([...fullyVegan, ...veganOption])}. Check the live menu sections for descriptions and prices.`
        : getMenuUnavailableMessage(),
    },
    {
      question: 'Can some dishes be made vegan?',
      answer: veganOption.length > 0
        ? `Yes. The live menu currently marks ${joinItemNames(veganOption)} as vegan-option dishes. Ask at the bar when ordering.`
        : 'Ask at the bar for the current vegan-option dishes.',
    },
    {
      question: 'Do you label vegan items on your menu?',
      answer: 'Yes. Fully vegan dishes are labelled VE and dishes that can be made vegan on request are labelled VEO where that data is available.',
    },
    {
      question: 'Is The Anchor good for vegan travellers near Heathrow?',
      answer: 'We are 7 minutes from Heathrow Terminal 5 with free parking. Check the live menu on this page and ask at the bar for allergen guidance before ordering.',
    },
  ]

  return (
    <>
      <InteriorHero
        image="/images/page-headers/food-menu/food-menu.jpg"
        crumb="Vegan"
        title="Vegan Menu"
        lead="Current vegan and vegan-option dishes from the latest kitchen menu."
      />

      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="mx-auto text-center">
            <SectionHeading
              title="Vegan Pub Food Near Heathrow"
              lead="Current vegan and vegan-option dishes."
            />
            <p className="text-ink-muted">
              If the kitchen updates a vegan dish, description or price, this page follows that update.
            </p>
          </div>
          <div className="mt-8">
            <DietaryMenuNav/>
          </div>
        </div>
      </section>

      <section className="bg-surface py-section-y">
        <div className="container">
          <SectionHeading
            title="Fully Vegan (VE)"
            lead="These dishes are vegan as standard according to the live menu."
          />
          {fullyVegan.length > 0 ? (
            <DietaryItemList items={fullyVegan} badge="VE" />
          ) : (
            <p className="text-center text-ink-muted">{getMenuUnavailableMessage()}</p>
          )}
        </div>
      </section>

      {veganOption.length > 0 && (
        <section className="bg-canvas py-section-y">
          <div className="container">
            <SectionHeading
              title="Can Be Made Vegan (VEO)"
              lead="These dishes can be made vegan on request."
            />
            <DietaryItemList
              items={veganOption}
              badge="VEO"
              optionFlag={(item) => Boolean(item.veganOptionAvailable)}
              optionNote="Ask at the bar for vegan preparation."
            />
          </div>
        </section>
      )}

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

      <section className="bg-surface py-section-y">
        <div className="container">
          <div className="mx-auto text-center">
            <h2 className="mb-2 text-h3 text-ink-strong">Kitchen Hours</h2>
            <p className="text-ink-muted">
              Vegan options are available during regular kitchen hours. See the{' '}
              <Link href="/food-menu" className="font-semibold text-accent-text hover:underline">
                full food menu
              </Link>{' '}
              for live kitchen times.
            </p>
          </div>
        </div>
      </section>

      <FAQAccordionWithSchema faqs={faqItems} />

      <section className="bg-canvas py-section-y">
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
            <Link href="/food-menu/gluten-free" className="font-semibold text-accent-text hover:underline">
              NGCI Menu
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
          title="Ready to eat? Book your table."
          copy="Reserve online or call ahead and we will have your table ready."
        >
          <BookTableButton
            source="vegan_menu_footer"
            context="food"
            variant="primary"
            size="lg"
            trackingLabel="Vegan Footer Book a Table"
          >
            Book a table
          </BookTableButton>
          <PhoneButton
            phone="01753 682707"
            source="vegan_menu_footer"
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
            '@id': 'https://www.the-anchor.pub/food-menu/vegan#menu',
            name: 'Vegan Menu at The Anchor',
            description: 'Vegan pub food at The Anchor near Heathrow.',
            url: 'https://www.the-anchor.pub/food-menu/vegan',
            isPartOf: { '@id': 'https://www.the-anchor.pub/#business' },
          }),
        }}
      />
    </>
  )
}

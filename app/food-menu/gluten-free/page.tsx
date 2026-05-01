import Link from 'next/link'
import { Metadata } from 'next'
import { Container, Section, Card, CardBody, Alert } from '@/components/ui'
import { CTASection, SectionHeader } from '@/components/ui'
import { HeroWrapper } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { DietaryMenuNav } from '@/components/food/DietaryMenuNav'
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

function MenuItemCard({ item, badge }: { item: MenuPageItem; badge: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-4 border-b border-anchor-gold/10 last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="font-semibold text-anchor-cream-text">{item.name}</h2>
          <span className="inline-flex items-center rounded-full bg-blue-900/40 border border-blue-500/30 px-2 py-0.5 text-xs font-medium text-blue-300">
            {badge}
          </span>
        </div>
        {item.description && (
          <p className="text-sm text-anchor-cream-text/60 mt-1">{item.description}</p>
        )}
        {item.glutenFreeAvailable && (
          <p className="text-sm text-amber-400/80 mt-1 italic">Ask at the bar for gluten-free preparation.</p>
        )}
        <p className="text-xs text-anchor-cream-text/40 mt-1">{item.categoryTitle}</p>
      </div>
      {item.priceLabel && (
        <span className="text-anchor-gold-vivid font-semibold whitespace-nowrap">{item.priceLabel}</span>
      )}
    </div>
  )
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
      <HeroWrapper
        route="/food-menu/gluten-free"
        title="Gluten-Free Pub Food"
        description="Current gluten-free and gluten-free-option dishes from the latest kitchen menu."
        variant="default"
        breadcrumbs={[
          { name: 'Food & Drink', href: '/food-menu' },
          { name: 'Gluten-Free' },
        ]}
        enableSmartCtas={true}
        showContextStrip={true}
      />

      <Section background="white" spacing="sm" className="bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="Gluten-Free Pub Food at The Anchor"
                subtitle="Current gluten-free and gluten-free-option dishes."
              />
              <p className="text-anchor-cream-text/70">
                We do not offer gluten-free fish and chips, gluten-free batter, gluten-free fried fish, grilled gluten-free fish, or a dedicated gluten-free fryer for fish and chips.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <Section background="white" spacing="sm" className="bg-anchor-bg">
        <Container>
          <DietaryMenuNav />
        </Container>
      </Section>

      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Gluten-Free (GF)"
            subtitle="These dishes are gluten-free as standard according to the live menu."
            align="center"
            className="mb-8"
          />
          <Card className="card-dark rounded-none max-w-3xl mx-auto">
            <CardBody>
              {naturallyGf.length > 0 ? (
                naturallyGf.map((item) => (
                  <MenuItemCard key={item.id} item={item} badge="GF" />
                ))
              ) : (
                <p className="text-anchor-cream-text/70">{getMenuUnavailableMessage()}</p>
              )}
            </CardBody>
          </Card>
        </Container>
      </Section>

      {gfoItems.length > 0 && (
        <Section background="white" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
          <Container>
            <SectionHeader
              title="Gluten-Free Options (GFO)"
              subtitle="These dishes can be made gluten-free on request."
              align="center"
              className="mb-8"
            />
            <Card className="card-dark rounded-none max-w-3xl mx-auto">
              <CardBody>
                {gfoItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} badge="GFO" />
                ))}
              </CardBody>
            </Card>
          </Container>
        </Section>
      )}

      <Section background="white" spacing="sm" className="bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none max-w-3xl mx-auto">
            <CardBody>
              <SectionHeader
                title="What to Tell Us When Ordering"
                subtitle="A quick word at the bar is all it takes."
                align="left"
                className="mb-4"
              />
              <p className="text-anchor-cream-text/70">
                Let the bar staff know you need gluten-free options before ordering. Our dishes are prepared in one kitchen, so we cannot guarantee zero cross-contamination.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <Section background="gray" spacing="sm" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <Alert
            variant="warning"
            title="Allergen Information"
            className="max-w-4xl mx-auto"
          >
            <p className="text-anchor-cream-text/70">
              Our dishes are prepared in one kitchen, so we cannot guarantee no cross-contamination. Please ask at the bar for full allergen information.
            </p>
          </Alert>
        </Container>
      </Section>

      <Section background="white" spacing="sm" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none text-center">
            <CardBody>
              <h2 className="text-xl font-bold text-anchor-cream-text mb-2">Kitchen Hours</h2>
              <p className="text-anchor-cream-text/70">
                Gluten-free options are available during regular kitchen hours. See the{' '}
                <Link href="/food-menu" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">
                  full food menu
                </Link>{' '}
                for live kitchen times.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <FAQAccordionWithSchema
        faqs={faqItems}
        className="bg-anchor-bg-card"
      />

      <Section background="white" spacing="sm" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/food-menu" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">
              Full Food Menu
            </Link>
            <span className="text-anchor-cream-text/30">|</span>
            <Link href="/food-menu/vegetarian" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">
              Vegetarian Menu
            </Link>
            <span className="text-anchor-cream-text/30">|</span>
            <Link href="/food-menu/vegan" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">
              Vegan Menu
            </Link>
            <span className="text-anchor-cream-text/30">|</span>
            <Link href="/book-table" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">
              Book a Table
            </Link>
          </div>
        </Container>
      </Section>

      <div data-sticky-cta-guard="true">
        <CTASection
          title="Hungry? Book Your Table Now"
          description="Reserve online or call ahead and we will have your table ready."
          buttons={[
            {
              text: 'Book a Table',
              href: '/book-table',
              variant: 'white',
            },
            {
              text: 'Call: 01753 682707',
              href: 'tel:+441753682707',
              variant: 'white',
              isPhone: true,
              phoneSource: 'gluten_free_menu_footer',
            },
            {
              text: 'View Full Menu',
              href: '/food-menu',
              variant: 'white',
            },
          ]}
          variant="green"
        />
      </div>

      <FoodStickyCtaBar
        ctaContext="food"
        label="Book a Table"
      />

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

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
import { PageTitle } from '@/components/ui/typography/PageTitle'
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

function MenuItemCard({ item, badge }: { item: MenuPageItem; badge: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-4 border-b border-anchor-gold/10 last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="font-semibold text-anchor-cream-text">{item.name}</h2>
          <span className="inline-flex items-center rounded-full bg-green-900/40 border border-green-500/30 px-2 py-0.5 text-xs font-medium text-green-300">
            {badge}
          </span>
        </div>
        {item.description && (
          <p className="text-sm text-anchor-cream-text/60 mt-1">{item.description}</p>
        )}
        {item.veganOptionAvailable && (
          <p className="text-sm text-amber-400/80 mt-1 italic">Ask at the bar for vegan preparation.</p>
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
  const data = await getVeganMenuPageData()
  const veganCount = data ? data.veganItems.length + data.veganOptionItems.length : 0
  const description = data
    ? `Vegan pub food near Heathrow from The Anchor's live menu. ${veganCount} current vegan or vegan-option dishes. Free parking, 7 minutes from Terminal 5.`
    : 'Vegan pub food near Heathrow at The Anchor. Current options from the latest kitchen menu.'

  return {
    title: 'Vegan Pub Food Near Heathrow | The Anchor',
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
      <HeroWrapper
        route="/food-menu/vegan"
        title="Vegan Menu"
        description="Current vegan and vegan-option dishes from the latest kitchen menu."
        variant="default"
        breadcrumbs={[
          { name: 'Food & Drink', href: '/food-menu' },
          { name: 'Vegan' },
        ]}
        enableSmartCtas={true}
        showContextStrip={true}
      />

      <Section background="white" spacing="sm" className="bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <PageTitle as="h2" className="text-anchor-cream-text mb-2">
                Vegan Pub Food Near Heathrow
              </PageTitle>
              <p className="text-anchor-cream-text/55 mb-4">Current vegan and vegan-option dishes.</p>
              <p className="text-anchor-cream-text/70">
                If the kitchen updates a vegan dish, description or price, this page follows that update.
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
            title="Fully Vegan (VE)"
            subtitle="These dishes are vegan as standard according to the live menu."
            align="center"
            className="mb-8"
          />
          <Card className="card-dark rounded-none max-w-3xl mx-auto">
            <CardBody>
              {fullyVegan.length > 0 ? (
                fullyVegan.map((item) => (
                  <MenuItemCard key={item.id} item={item} badge="VE" />
                ))
              ) : (
                <p className="text-anchor-cream-text/70">{getMenuUnavailableMessage()}</p>
              )}
            </CardBody>
          </Card>
        </Container>
      </Section>

      {veganOption.length > 0 && (
        <Section background="white" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
          <Container>
            <SectionHeader
              title="Can Be Made Vegan (VEO)"
              subtitle="These dishes can be made vegan on request."
              align="center"
              className="mb-8"
            />
            <Card className="card-dark rounded-none max-w-3xl mx-auto">
              <CardBody>
                {veganOption.map((item) => (
                  <MenuItemCard key={item.id} item={item} badge="VEO" />
                ))}
              </CardBody>
            </Card>
          </Container>
        </Section>
      )}

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
                Vegan options are available during regular kitchen hours. See the{' '}
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
            <Link href="/food-menu/gluten-free" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">
              Gluten-Free Menu
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
          title="Ready to Eat? Book Your Table"
          description="Reserve online or call ahead and we will have your table ready."
          buttons={[
            {
              text: 'Call: 01753 682707',
              href: 'tel:+441753682707',
              variant: 'white',
              isPhone: true,
              phoneSource: 'vegan_menu_footer',
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

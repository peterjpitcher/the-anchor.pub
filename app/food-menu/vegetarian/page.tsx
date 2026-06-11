import Link from 'next/link'
import { Metadata } from 'next'
import { Container, Section, Card, CardBody, Alert, CTASection, SectionHeading } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { MenuRenderer } from '@/components/MenuRenderer'
import { DietaryMenuNav } from '@/components/food/DietaryMenuNav'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'
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

      <Section background="white" spacing="sm" className="bg-anchor-green-card border-b border-anchor-gold-dark/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <PageTitle as="h2" className="text-anchor-cream-text mb-2">
                Vegetarian Pub Food Near Heathrow
              </PageTitle>
              <p className="text-anchor-cream-text/55 mb-4">Current vegetarian and vegan options.</p>
              <p className="text-anchor-cream-text/70">
                If the kitchen updates a dish, description or price, this page follows that update.
              </p>
              <ul className="mt-4 space-y-2 text-anchor-cream-text/70">
                <li>&bull; Vegetarian and vegan dishes are grouped by their live menu section.</li>
                <li>&bull; Prices and descriptions are shown from the current menu.</li>
                <li>&bull; Ask at the bar for allergen guidance before ordering.</li>
              </ul>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <Section background="white" spacing="sm" className="bg-anchor-green-deep">
        <Container>
          <DietaryMenuNav />
        </Container>
      </Section>

      <div id="menu" className="section-spacing bg-anchor-green-deep">
        <Container>
          <SectionHeading
            title="Current Vegetarian Menu"
            subtitle={data ? `${totalVegetarianItems} vegetarian and vegan dishes from the live food menu.` : getMenuUnavailableMessage()}
            align="center"
            className="mb-10"
          />
        </Container>

        {data ? (
          <MenuRenderer menuData={data.menuData} eyebrow="Vegetarian menu" />
        ) : (
          <Container>
            <Alert variant="info" title="Menu temporarily unavailable" className="max-w-4xl mx-auto">
              <p className="text-anchor-cream-text/70">{getMenuUnavailableMessage()}</p>
            </Alert>
          </Container>
        )}
      </div>

      <Section background="white" spacing="md" className="bg-anchor-green-deep border-b border-anchor-gold-dark/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeading
                title="Vegetarian Dining Near Heathrow Airport"
                subtitle="A proper meal before, after, or instead of a flight."
                align="left"
                className="mb-6"
              />
              <div className="text-anchor-cream-text/70 space-y-4">
                <p>
                  The Anchor is 7 minutes from Heathrow Terminal 5, with free parking and a current menu that stays in sync with the kitchen.
                </p>
                <p>
                  If you have specific allergen needs, speak to the team at the bar and we will walk you through the current options.
                </p>
              </div>
            </CardBody>
          </Card>
        </Container>
      </Section>

      <div data-sticky-cta-guard="true">
        <CTASection
          title="Hungry? Book Your Table Now"
          description="Reserve online or call ahead and we will have your table ready."
          buttons={[
            {
              text: 'Call: 01753 682707',
              href: 'tel:+441753682707',
              variant: 'white',
              isPhone: true,
              phoneSource: 'vegetarian_menu_footer',
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

      <Section background="gray" spacing="md" className="bg-anchor-green-deep">
        <Container>
          <Alert
            variant="warning"
            title="Allergen Information"
            className="max-w-4xl mx-auto"
          >
            <p className="text-anchor-cream-text/70">
              All dishes are prepared in a single kitchen where allergens are present. Speak to us about your needs before ordering.
            </p>
          </Alert>
        </Container>
      </Section>

      <FAQAccordionWithSchema faqs={faqItems} className="bg-anchor-green-card" />

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

      <Section background="white" spacing="md" className="bg-anchor-green-raised border-b border-anchor-gold-dark/15">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-anchor-cream-text mb-6">Explore More</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/food-menu" className="inline-flex items-center px-4 py-2 rounded-full border border-anchor-gold-dark/30 text-anchor-cream-text/80 hover:bg-anchor-gold-dark/10 hover:text-anchor-cream-text transition text-sm font-medium">
                Full Food Menu
              </Link>
              <Link href="/food-menu/vegan" className="inline-flex items-center px-4 py-2 rounded-full border border-anchor-gold-dark/30 text-anchor-cream-text/80 hover:bg-anchor-gold-dark/10 hover:text-anchor-cream-text transition text-sm font-medium">
                Vegan Menu
              </Link>
              <Link href="/food-menu/gluten-free" className="inline-flex items-center px-4 py-2 rounded-full border border-anchor-gold-dark/30 text-anchor-cream-text/80 hover:bg-anchor-gold-dark/10 hover:text-anchor-cream-text transition text-sm font-medium">
                Gluten-Free Menu
              </Link>
              <Link href="/book-table" className="inline-flex items-center px-4 py-2 rounded-full border border-anchor-gold-dark/30 text-anchor-cream-text/80 hover:bg-anchor-gold-dark/10 hover:text-anchor-cream-text transition text-sm font-medium">
                Book a Table
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      <FoodStickyCtaBar
        ctaContext="food"
        label="Book a Table"
      />
    </>
  )
}

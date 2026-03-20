import Link from 'next/link'
import { Metadata } from 'next'
import { Container, Section, Card, CardBody, Alert } from '@/components/ui'
import { CTASection, SectionHeader } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { HeroWrapper } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { parseMenuMarkdown, type MenuCategory } from '@/lib/menu-parser'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Vegan Menu | Pub Food Near Heathrow',
  description: 'Vegan pub food near Heathrow Airport. Stone-baked pizzas, veggie burgers, sides and puddings — all vegan or made vegan on request. Free parking, 7 mins from T5.',
  openGraph: {
    title: 'Vegan Menu | Pub Food Near Heathrow',
    description: 'Vegan pub food near Heathrow Airport. Stone-baked pizzas, veggie burgers, sides and puddings — all vegan or made vegan on request.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Vegan Menu | Pub Food Near Heathrow',
    description: 'Vegan pub food near Heathrow. Garden Veg Burger, stone-baked pizzas, chips, sweet potato fries and more — all vegan or made vegan on request.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
  }),
  alternates: {
    canonical: '/food-menu/vegan',
  },
}

interface DietaryMenuItem {
  name: string
  price: string
  description: string
  category: string
  note?: string
}

function extractVeganItems(categories: MenuCategory[]): {
  fullyVegan: DietaryMenuItem[]
  veganOption: DietaryMenuItem[]
} {
  const fullyVegan: DietaryMenuItem[] = []
  const veganOption: DietaryMenuItem[] = []
  const seenVegan = new Set<string>()

  for (const category of categories) {
    for (const section of category.sections) {
      for (const item of section.items) {
        if (item.vegan && !seenVegan.has(item.name)) {
          seenVegan.add(item.name)
          fullyVegan.push({
            name: item.name,
            price: item.price,
            description: item.description,
            category: category.title,
          })
        }
      }
    }
  }

  for (const category of categories) {
    for (const section of category.sections) {
      for (const item of section.items) {
        if (item.veganOptionAvailable && !item.vegan && !seenVegan.has(item.name)) {
          seenVegan.add(item.name)
          const note = item.name.includes('pizza') || item.name === 'Rustic Classic' || item.name === 'The Garden Club'
            ? 'Ask for no mozzarella'
            : 'Ask at the bar for vegan preparation'
          veganOption.push({
            name: item.name,
            price: item.price,
            description: item.description,
            category: category.title,
            note,
          })
        }
      }
    }
  }

  return { fullyVegan, veganOption }
}

function MenuItemCard({ item, badge }: { item: DietaryMenuItem; badge: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-4 border-b border-anchor-gold/10 last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-anchor-cream-text">{item.name}</h3>
          <span className="inline-flex items-center rounded-full bg-green-900/40 border border-green-500/30 px-2 py-0.5 text-xs font-medium text-green-300">
            {badge}
          </span>
        </div>
        {item.description && (
          <p className="text-sm text-anchor-cream-text/60 mt-1">{item.description}</p>
        )}
        {item.note && (
          <p className="text-sm text-amber-400/80 mt-1 italic">{item.note}</p>
        )}
        <p className="text-xs text-anchor-cream-text/40 mt-1">{item.category}</p>
      </div>
      {item.price && (
        <span className="text-anchor-gold-vivid font-semibold whitespace-nowrap">&pound;{item.price}</span>
      )}
    </div>
  )
}

export default async function VeganMenuPage() {
  const menuData = await parseMenuMarkdown('food')

  if (!menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-anchor-bg">
        <p className="text-xl text-anchor-cream-text/70">Menu temporarily unavailable. Please call us on 01753 682707.</p>
      </div>
    )
  }

  const { fullyVegan, veganOption } = extractVeganItems(menuData.categories)

  const faqItems = [
    {
      question: 'Does The Anchor have vegan food?',
      answer: 'Yes, several dishes are fully vegan and more can be made vegan on request. Our Garden Veg Burger, Garden Stack, garlic bread, chips, sweet potato fries and onion rings are all vegan.',
    },
    {
      question: 'Can pizzas be made vegan?',
      answer: 'Yes, our Rustic Classic and Garden Club pizzas can be made vegan by removing the mozzarella. The stone-baked bases and tomato sauce are already vegan.',
    },
    {
      question: 'Are the chips vegan?',
      answer: 'Yes, our chips, chunky chips, sweet potato fries and onion rings are all vegan.',
    },
    {
      question: 'Is the garlic bread vegan?',
      answer: "Yes, our stone-baked garlic bread is vegan — we don\u2019t use butter.",
    },
    {
      question: 'Is there a vegan Sunday roast?',
      answer: 'Currently our Sunday roast options include a vegetarian butternut squash wellington but it contains dairy. Ask about seasonal vegan options when you visit.',
    },
  ]

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Food Menu', url: '/food-menu' },
          { name: 'Vegan Menu', url: '/food-menu/vegan' },
        ]}
      />

      <HeroWrapper
        route="/food-menu/vegan"
        title="Vegan Menu"
        description="Proper vegan pub food near Heathrow — from stone-baked pizzas and veggie burgers to chips, sweet potato fries and more."
        variant="default"
        breadcrumbs={[
          { name: 'Food & Drink', href: '/food-menu' },
          { name: 'Vegan' },
        ]}
        tags={[
          { label: 'Vegan burgers', variant: 'default' },
          { label: 'Stone-baked pizzas', variant: 'default' },
          { label: 'Vegan sides', variant: 'default' },
        ]}
        ctaContainerClassName="gap-4 sm:items-center"
        ctaContainerProps={{ 'data-sticky-cta-guard': 'true' }}
        primaryCta={
          <BookTableButton
            source="vegan_menu_hero"
            context="food"
            variant="primary"
            size="lg"
            className="sm:w-auto"
            trackingLabel="Hero Book a Table"
          >
            Reserve Your Table
          </BookTableButton>
        }
      />

      {/* Definitive answer paragraph */}
      <Section background="white" spacing="sm" className="bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="Vegan Pub Food at The Anchor"
                subtitle="More than you might expect from a traditional British pub."
              />
              <p className="text-anchor-cream-text/70">
                The Anchor offers a growing selection of vegan dishes and vegan-friendly options across our menu.
                From our Garden Veg Burger and stone-baked garlic bread to chips, sweet potato fries and onion rings,
                there&rsquo;s more here than you might expect from a traditional British pub. Several more dishes can
                be made vegan on request &mdash; just ask at the bar.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* Editorial content */}
      <Section background="white" spacing="sm" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <p className="text-anchor-cream-text/70">
                Finding decent vegan pub food near Heathrow isn&rsquo;t easy. Most airport-area pubs offer a token
                veggie burger and not much else. We&rsquo;ve made a proper effort &mdash; our Garden Veg Burger and
                Garden Stack are both fully vegan, and we&rsquo;ve kept our garlic bread dairy-free so everyone can
                enjoy it.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* Fully Vegan items */}
      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Fully Vegan (VE)"
            subtitle="These dishes are vegan as standard — no changes needed."
            align="center"
            className="mb-8"
          />
          <Card className="card-dark rounded-none max-w-3xl mx-auto">
            <CardBody>
              {fullyVegan.map((item, index) => (
                <MenuItemCard key={index} item={item} badge="VE" />
              ))}
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* Can Be Made Vegan items */}
      {veganOption.length > 0 && (
        <Section background="white" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
          <Container>
            <SectionHeader
              title="Can Be Made Vegan (VEO)"
              subtitle="These dishes can be made vegan on request — just ask at the bar."
              align="center"
              className="mb-8"
            />
            <Card className="card-dark rounded-none max-w-3xl mx-auto">
              <CardBody>
                {veganOption.map((item, index) => (
                  <MenuItemCard key={index} item={item} badge="VEO" />
                ))}
              </CardBody>
            </Card>
          </Container>
        </Section>
      )}

      {/* Pizza editorial */}
      <Section background="white" spacing="sm" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="Vegan Stone-Baked Pizzas"
                subtitle="A proper pizza, not a sad substitute."
                align="left"
                className="mb-4"
              />
              <p className="text-anchor-cream-text/70">
                Our stone-baked pizzas are a great vegan option. The bases are made fresh without dairy, and the
                tomato sauce is naturally vegan. Just ask for no mozzarella and you&rsquo;ve got a proper pizza,
                not a sad substitute.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* What to ask at the bar */}
      <Section background="white" spacing="sm" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="What to Ask at the Bar"
                align="left"
                className="mb-4"
              />
              <p className="text-anchor-cream-text/70">
                To make a VEO item vegan, simply ask at the bar when ordering. For pizzas, we remove the mozzarella.
                All our stone-baked bases, tomato sauce and vegetable toppings are already vegan.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* Allergen note */}
      <Section background="gray" spacing="sm" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <Alert
            variant="warning"
            title="Allergen Information"
            className="max-w-4xl mx-auto"
          >
            <p className="text-anchor-cream-text/70">
              Our dishes are prepared in one kitchen, so we cannot guarantee no cross-contamination.
              Please ask at the bar for full allergen information.
            </p>
          </Alert>
        </Container>
      </Section>

      {/* Kitchen hours */}
      <Section background="white" spacing="sm" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none text-center">
            <CardBody>
              <h2 className="text-xl font-bold text-anchor-cream-text mb-2">Kitchen Hours</h2>
              <p className="text-anchor-cream-text/70">
                Our vegan options are available during all regular kitchen hours.
                See the{' '}
                <Link href="/food-menu" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">
                  full food menu
                </Link>{' '}
                for live kitchen times.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* FAQ */}
      <FAQAccordionWithSchema
        faqs={faqItems}
        className="bg-anchor-bg-card"
      />

      {/* Internal links */}
      <Section background="white" spacing="sm" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/food-menu"
              className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition"
            >
              Full Food Menu
            </Link>
            <span className="text-anchor-cream-text/30">|</span>
            <Link
              href="/food-menu/vegetarian"
              className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition"
            >
              Vegetarian Menu
            </Link>
            <span className="text-anchor-cream-text/30">|</span>
            <Link
              href="/food-menu/gluten-free"
              className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition"
            >
              Gluten-Free Menu
            </Link>
          </div>
        </Container>
      </Section>

      {/* Booking CTA */}
      <div data-sticky-cta-guard="true">
        <CTASection
          title="Ready to Eat? Book Your Table"
          description="Reserve online or call ahead — we will have your table ready."
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
            '@type': 'FAQPage',
            mainEntity: faqItems.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </>
  )
}

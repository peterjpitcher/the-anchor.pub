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
  title: 'Gluten-Free Menu | Pub Food Near Heathrow',
  description: 'Gluten-free pub food near Heathrow Airport. GF pizza bases, sticky toffee pudding, chocolate brownie, and sides. Ask at the bar for GF options. Free parking.',
  openGraph: {
    title: 'Gluten-Free Menu | Pub Food Near Heathrow',
    description: 'Gluten-free pub food near Heathrow Airport. GF pizza bases, sticky toffee pudding, chocolate brownie, and sides. Ask at the bar for GF options.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Gluten-Free Menu | Pub Food Near Heathrow',
    description: 'Gluten-free pub food near Heathrow. GF pizza bases, naturally gluten-free puddings and sides. Ask at the bar for GF options.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
  }),
  alternates: {
    canonical: '/food-menu/gluten-free',
  },
}

interface DietaryMenuItem {
  name: string
  price: string
  description: string
  category: string
  note?: string
}

function extractGlutenFreeItems(categories: MenuCategory[]): {
  naturallyGf: DietaryMenuItem[]
  gfAvailable: DietaryMenuItem[]
} {
  const naturallyGf: DietaryMenuItem[] = []
  const gfAvailable: DietaryMenuItem[] = []
  const seenGf = new Set<string>()

  for (const category of categories) {
    for (const section of category.sections) {
      for (const item of section.items) {
        if (item.glutenFree && !seenGf.has(item.name)) {
          seenGf.add(item.name)
          naturallyGf.push({
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
        if (item.glutenFreeAvailable && !item.glutenFree && !seenGf.has(item.name)) {
          seenGf.add(item.name)
          const isPizza = category.id === 'pizza'
          const note = isPizza
            ? 'Available on a gluten-free base — ask at the bar'
            : 'Gluten-free option available — ask at the bar'
          gfAvailable.push({
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

  return { naturallyGf, gfAvailable }
}

function MenuItemCard({ item, badge }: { item: DietaryMenuItem; badge: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-4 border-b border-anchor-gold/10 last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-anchor-cream-text">{item.name}</h3>
          <span className="inline-flex items-center rounded-full bg-blue-900/40 border border-blue-500/30 px-2 py-0.5 text-xs font-medium text-blue-300">
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

export default async function GlutenFreeMenuPage() {
  const menuData = await parseMenuMarkdown('food')

  if (!menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-anchor-bg">
        <p className="text-xl text-anchor-cream-text/70">Menu temporarily unavailable. Please call us on 01753 682707.</p>
      </div>
    )
  }

  const { naturallyGf, gfAvailable } = extractGlutenFreeItems(menuData.categories)

  const faqItems = [
    {
      question: 'Does The Anchor have gluten-free options?',
      answer: 'Yes, several dishes are naturally gluten-free and all our stone-baked pizzas can be made on a gluten-free base. Our sticky toffee pudding and chocolate fudge brownie are also naturally gluten-free.',
    },
    {
      question: 'Is there a gluten-free pizza base?',
      answer: 'Yes, all our stone-baked pizzas are available on a 12-inch gluten-free base at no extra charge. Just ask at the bar when ordering.',
    },
    {
      question: 'Are the puddings gluten-free?',
      answer: 'Our sticky toffee pudding and chocolate fudge brownie are both naturally gluten-free. The ice cream sundae is also available as a gluten-free option.',
    },
    {
      question: 'Is there a risk of cross-contamination?',
      answer: 'Our dishes are prepared in one kitchen, so we cannot guarantee no cross-contamination. Please inform us of any allergies when ordering and we will do our best to accommodate you.',
    },
    {
      question: 'Do you charge extra for gluten-free?',
      answer: 'No, gluten-free pizza bases are the same price as our standard bases. There is no surcharge for any gluten-free option.',
    },
  ]

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Food Menu', url: '/food-menu' },
          { name: 'Gluten-Free Menu', url: '/food-menu/gluten-free' },
        ]}
      />

      <HeroWrapper
        route="/food-menu/gluten-free"
        title="Gluten-Free Menu"
        description="Proper gluten-free pub food near Heathrow — GF pizza bases, naturally gluten-free puddings and sides."
        variant="default"
        breadcrumbs={[
          { name: 'Food & Drink', href: '/food-menu' },
          { name: 'Gluten-Free' },
        ]}
        tags={[
          { label: 'GF pizza bases', variant: 'default' },
          { label: 'GF puddings', variant: 'default' },
          { label: 'No surcharge', variant: 'default' },
        ]}
        ctaContainerClassName="gap-4 sm:items-center"
        ctaContainerProps={{ 'data-sticky-cta-guard': 'true' }}
        primaryCta={
          <BookTableButton
            source="gluten_free_menu_hero"
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
                title="Gluten-Free Pub Food at The Anchor"
                subtitle="Proper options, not afterthoughts."
              />
              <p className="text-anchor-cream-text/70">
                The Anchor offers several naturally gluten-free dishes plus gluten-free options available on request.
                Our stone-baked pizzas can all be made on a gluten-free base, and two of our puddings &mdash; sticky
                toffee pudding and chocolate fudge brownie &mdash; are naturally gluten-free. Just ask at the bar
                when ordering.
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
                Eating out with coeliac disease or gluten sensitivity near Heathrow can be frustrating. Most pubs
                can offer you a jacket potato and not much else. We&rsquo;ve made sure there are proper options
                here &mdash; from full-size stone-baked pizzas on gluten-free bases to naturally GF puddings.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* Naturally Gluten-Free items */}
      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Naturally Gluten-Free (GF)"
            subtitle="These dishes are gluten-free as standard — no changes needed."
            align="center"
            className="mb-8"
          />
          <Card className="card-dark rounded-none max-w-3xl mx-auto">
            <CardBody>
              {naturallyGf.map((item, index) => (
                <MenuItemCard key={index} item={item} badge="GF" />
              ))}
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* Gluten-Free Option Available items */}
      {gfAvailable.length > 0 && (
        <Section background="white" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
          <Container>
            <SectionHeader
              title="Gluten-Free Option Available (GFO)"
              subtitle="These dishes can be made gluten-free on request — just ask at the bar."
              align="center"
              className="mb-8"
            />
            <Card className="card-dark rounded-none max-w-3xl mx-auto">
              <CardBody>
                {gfAvailable.map((item, index) => (
                  <MenuItemCard key={index} item={item} badge="GFO" />
                ))}
              </CardBody>
            </Card>
          </Container>
        </Section>
      )}

      {/* GF pizza bases editorial */}
      <Section background="white" spacing="sm" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="About Our Gluten-Free Bases"
                subtitle="Same size, same oven, same toppings — just a different base."
                align="left"
                className="mb-4"
              />
              <p className="text-anchor-cream-text/70">
                All our stone-baked pizzas can be made on a 12-inch gluten-free base at no extra charge. The
                toppings and sauces remain the same &mdash; just the base changes. Our gluten-free pizza bases are
                proper 12-inch stone-baked bases, not the sad little pre-made ones you get elsewhere. Same size,
                same oven, same toppings &mdash; just a different base.
              </p>
              <p className="text-anchor-cream-text/70 mt-3">
                Please note that our pizzas are prepared in the same kitchen, so we cannot guarantee zero
                cross-contamination.
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
                Our gluten-free options are available during all regular kitchen hours.
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
              href="/food-menu/vegan"
              className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition"
            >
              Vegan Menu
            </Link>
          </div>
        </Container>
      </Section>

      {/* Booking CTA */}
      <div data-sticky-cta-guard="true">
        <CTASection
          title="Hungry? Book Your Table Now"
          description="Reserve online or call ahead — we will have your table ready."
          buttons={[
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

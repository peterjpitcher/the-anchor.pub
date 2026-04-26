import Link from 'next/link'
import { Metadata } from 'next'
import { Container, Section, Card, CardBody, Alert } from '@/components/ui'
import { CTASection, SectionHeader } from '@/components/ui'

import { HeroWrapper } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { FoodStickyCtaBar } from '@/components/food/FoodStickyCtaBar'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { parseMenuMarkdown, type MenuCategory } from '@/lib/menu-parser'
import { DietaryMenuNav } from '@/components/food/DietaryMenuNav'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Gluten-Free Pub Food Near Heathrow | GF Menu',
  description: 'Proper gluten-free pub food near Heathrow Airport. GF pizza bases, sticky toffee pudding, chocolate brownie and sides — no surcharge. Free parking, 7 mins from T5.',
  openGraph: {
    title: 'Gluten-Free Pub Food | The Anchor, Stanwell Moor',
    description: 'Proper gluten-free pub food near Heathrow. GF pizza bases, naturally gluten-free puddings and sides — no surcharge.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Gluten-Free Pub Food | The Anchor, Stanwell Moor',
    description: 'Proper gluten-free pub food near Heathrow. GF pizza bases, naturally gluten-free puddings and sides — no surcharge.',
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
  gfoPizzas: DietaryMenuItem[]
  gfoOther: DietaryMenuItem[]
} {
  const naturallyGf: DietaryMenuItem[] = []
  const gfoPizzas: DietaryMenuItem[] = []
  const gfoOther: DietaryMenuItem[] = []
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
          const entry: DietaryMenuItem = {
            name: item.name,
            price: item.price,
            description: item.description,
            category: category.title,
            note,
          }
          if (isPizza) {
            gfoPizzas.push(entry)
          } else {
            gfoOther.push(entry)
          }
        }
      }
    }
  }

  return { naturallyGf, gfoPizzas, gfoOther }
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

  const { naturallyGf, gfoPizzas, gfoOther } = extractGlutenFreeItems(menuData.categories)

  const faqItems = [
    {
      question: 'Does The Anchor have gluten-free options?',
      answer: 'Yes, several dishes are naturally gluten-free and all our stone-baked pizzas can be made on a gluten-free base. Our sticky toffee pudding and chocolate fudge brownie are also naturally gluten-free. Both garlic bread options are available on a GF base too.',
    },
    {
      question: 'Is there a gluten-free pizza base?',
      answer: 'Yes, all our stone-baked pizzas are available on a 12-inch gluten-free base at no extra charge. Just ask at the bar when ordering.',
    },
    {
      question: 'Is the garlic bread available gluten-free?',
      answer: 'Yes, both our Garlic Bread and Garlic Bread with Mozzarella are available on a gluten-free base at no extra charge. Just ask at the bar when ordering.',
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
      answer: 'No, gluten-free pizza bases and garlic bread bases are the same price as our standard bases. There is no surcharge for any gluten-free option.',
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
        title="Gluten-Free Pub Food"
        description="Proper gluten-free pub food near Heathrow — GF pizza bases, naturally gluten-free puddings and sides."
        variant="default"
        breadcrumbs={[
          { name: 'Food & Drink', href: '/food-menu' },
          { name: 'Gluten-Free' },
        ]}
        enableSmartCtas={true}
        showContextStrip={true}
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
                Looking for gluten-free pub food near Heathrow? Eating out with coeliac disease or gluten sensitivity can be a challenge &mdash; most
                pubs can offer you a jacket potato and not much else. At The Anchor, we&rsquo;ve made sure there are
                proper options. All our stone-baked pizzas can be made on a gluten-free base at no extra charge, our
                garlic bread comes in a GF version, and two of our puddings are naturally gluten-free. It&rsquo;s not
                a separate menu bolted on as an afterthought &mdash; these are dishes from our main menu that happen
                to work for GF diners.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* Dietary menu navigation */}
      <Section background="white" spacing="sm" className="bg-anchor-bg">
        <Container>
          <DietaryMenuNav />
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

      {/* Editorial after GF items */}
      <Section background="white" spacing="sm" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none max-w-3xl mx-auto">
            <CardBody>
              <p className="text-anchor-cream-text/70">
                Our sticky toffee pudding and chocolate fudge brownie are both naturally gluten-free &mdash; not
                GF substitutes, but the actual puddings from our main menu. The sweet potato fries are another
                safe bet, and they go well alongside pretty much anything.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* GFO Pizza items */}
      {gfoPizzas.length > 0 && (
        <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
          <Container>
            <SectionHeader
              title="Pizzas on Gluten-Free Bases (GFO)"
              subtitle="All our stone-baked pizzas can be made on a GF base — just ask at the bar."
              align="center"
              className="mb-8"
            />
            <Card className="card-dark rounded-none max-w-3xl mx-auto">
              <CardBody>
                {gfoPizzas.map((item, index) => (
                  <MenuItemCard key={index} item={item} badge="GFO" />
                ))}
              </CardBody>
            </Card>
          </Container>
        </Section>
      )}

      {/* Editorial after GFO pizza section */}
      <Section background="white" spacing="sm" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none max-w-3xl mx-auto">
            <CardBody>
              <SectionHeader
                title="About Our Gluten-Free Bases"
                subtitle="Same size, same oven, same toppings — just a different base."
                align="left"
                className="mb-4"
              />
              <p className="text-anchor-cream-text/70">
                Our gluten-free pizza bases are proper 12-inch stone-baked bases, not the sad little pre-made
                rounds you get at most places. Same size as our regular bases, same oven, same toppings &mdash;
                just a different base. All eight of our pizzas and both garlic bread options are available on
                GF bases at no extra charge.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* GFO Other items */}
      {gfoOther.length > 0 && (
        <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
          <Container>
            <SectionHeader
              title="Other Gluten-Free Options (GFO)"
              subtitle="These dishes can be made gluten-free on request — just ask at the bar."
              align="center"
              className="mb-8"
            />
            <Card className="card-dark rounded-none max-w-3xl mx-auto">
              <CardBody>
                {gfoOther.map((item, index) => (
                  <MenuItemCard key={index} item={item} badge="GFO" />
                ))}
              </CardBody>
            </Card>
          </Container>
        </Section>
      )}

      {/* Editorial after GFO other items */}
      <Section background="white" spacing="sm" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none max-w-3xl mx-auto">
            <CardBody>
              <p className="text-anchor-cream-text/70">
                The Ice Cream Sundae is a good GF dessert option too &mdash; three scoops with chocolate or
                strawberry sauce. Just let us know about any allergies when you order.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* What to tell us when ordering */}
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
                When you arrive, let the bar staff know you need gluten-free options. They&rsquo;ll talk you
                through what&rsquo;s available and flag your order to the kitchen. Our dishes are prepared in
                one kitchen, so we can&rsquo;t guarantee zero cross-contamination &mdash; but we take allergies
                seriously and will do our best to accommodate you.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* Beyond the menu */}
      <Section background="white" spacing="sm" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none max-w-3xl mx-auto">
            <CardBody>
              <SectionHeader
                title="Beyond the Menu"
                subtitle="Call ahead if you'd like to check what's available."
                align="left"
                className="mb-4"
              />
              <p className="text-anchor-cream-text/70">
                If you&rsquo;re visiting with a group and worried about options, give us a ring on{' '}
                <a href="tel:+441753682707" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">
                  01753 682707
                </a>{' '}
                before you come. We can talk through the menu and let you know what&rsquo;s available that day.
                We&rsquo;d rather you called ahead and had a great meal than turned up and felt limited.
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
            <span className="text-anchor-cream-text/30">|</span>
            <Link
              href="/book-table"
              className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition"
            >
              Book a Table
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
              '@type': 'Restaurant',
              '@id': 'https://www.the-anchor.pub/#business',
              name: 'The Anchor',
              description: 'Traditional British pub near Heathrow Airport with gluten-free pub food options including GF pizza bases, naturally gluten-free puddings and sides.',
              servesCuisine: ['British', 'Pizza', 'Pub Food'],
              hasMenu: {
                '@type': 'Menu',
                name: 'Gluten-Free Menu',
                url: 'https://www.the-anchor.pub/food-menu/gluten-free',
                description: 'Gluten-free pub food options at The Anchor near Heathrow — GF pizza bases, naturally gluten-free puddings and sides, no surcharge.',
              },
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Horton Road',
                addressLocality: 'Stanwell Moor',
                addressRegion: 'Surrey',
                postalCode: 'TW19 6AQ',
                addressCountry: 'GB',
              },
              telephone: '+441753682707',
              url: 'https://www.the-anchor.pub',
              priceRange: '££',
              potentialAction: {
                '@type': 'ReserveAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://www.the-anchor.pub/book-table',
                  actionPlatform: [
                    'https://schema.org/DesktopWebPlatform',
                    'https://schema.org/MobileWebPlatform',
                  ],
                },
                result: { '@type': 'FoodEstablishmentReservation' },
              },
            }),
        }}
      />
    </>
  )
}

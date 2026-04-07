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
import { parseMenuMarkdown, type MenuCategory } from '@/lib/menu-parser'
import { DietaryMenuNav } from '@/components/food/DietaryMenuNav'
import { PageTitle } from '@/components/ui/typography/PageTitle'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Vegan Pub Food Near Me | Menu & Prices | The Anchor',
  description: 'Vegan pub food near Heathrow Airport. Stone-baked garlic bread, chips, sweet potato fries, onion rings and pizzas that can be made vegan. Free parking, 7 mins from T5.',
  openGraph: {
    title: 'Vegan Pub Food | The Anchor Near Heathrow',
    description: 'Vegan pub food near Heathrow Airport. Stone-baked garlic bread, chips, sweet potato fries, onion rings and pizzas that can be made vegan on request.',
    images: ['/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Vegan Pub Food | The Anchor Near Heathrow',
    description: 'Vegan pub food near Heathrow. Stone-baked garlic bread, chips, sweet potato fries, onion rings and pizzas that can be made vegan on request.',
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
      answer: 'Yes. Our garlic bread, chips, chunky chips, sweet potato fries and onion rings are all fully vegan. Two of our stone-baked pizzas can also be made vegan by removing the mozzarella.',
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
      answer: "Yes, our stone-baked garlic bread is vegan \u2014 we don\u2019t use butter. It\u2019s been accidentally vegan since day one.",
    },
    {
      question: 'Is there a vegan Sunday roast?',
      answer: 'Currently our Sunday roast options include a vegetarian butternut squash wellington but it contains dairy. Ask about seasonal vegan options when you visit.',
    },
    {
      question: 'Are the burgers vegan?',
      answer: 'No. Our Garden Veg Burger and Garden Stack are vegetarian but not vegan. If you\u2019re looking for a vegan main, the stone-baked pizzas without mozzarella are your best option.',
    },
    {
      question: 'Can I build a full vegan meal at The Anchor?',
      answer: 'Yes. A vegan pizza (ask for no mozzarella) with chips, sweet potato fries and garlic bread makes a proper full meal. Everything on that list is fully plant-based as standard.',
    },
    {
      question: 'Is The Anchor good for vegan travellers near Heathrow?',
      answer: 'Yes. We are 7 minutes from Heathrow Terminal 5 with free parking. We have vegan options available and can accommodate dietary requirements \u2014 far better than the limited options inside the terminal.',
    },
    {
      question: 'Do you label vegan items on your menu?',
      answer: 'Yes. Fully vegan dishes are labelled VE on our menu. Dishes that can be made vegan on request are labelled VEO. Just ask at the bar if you are unsure.',
    },
    {
      question: 'Are your vegan options gluten-free too?',
      answer: 'Some vegan items overlap with gluten-free options. Our chips and sweet potato fries are naturally gluten-free and vegan. Stone-baked pizzas are available with a gluten-free base and can be made vegan. Ask at the bar for full allergen details.',
    },
    {
      question: 'What is the best vegan main course at The Anchor?',
      answer: 'Our stone-baked Rustic Classic or Garden Club pizza without mozzarella is our most popular vegan main. The bases and tomato sauce are naturally dairy-free, and the toppings work brilliantly without cheese.',
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
        description="Genuine vegan options at a traditional pub near Heathrow — garlic bread, chips, sides and stone-baked pizzas made vegan on request."
        variant="default"
        breadcrumbs={[
          { name: 'Food & Drink', href: '/food-menu' },
          { name: 'Vegan' },
        ]}
        tags={[
          { label: 'Stone-baked garlic bread', variant: 'default' },
          { label: 'Vegan sides', variant: 'default' },
          { label: 'Pizzas (VEO)', variant: 'default' },
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

      {/* Honest opening paragraph */}
      <Section background="white" spacing="sm" className="bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <PageTitle as="h1" className="text-anchor-cream-text mb-2">
                Vegan Pub Food Near Heathrow &mdash; Our Plant-Based Menu
              </PageTitle>
              <p className="text-anchor-cream-text/55 mb-4">Honest about what we offer.</p>
              <p className="text-anchor-cream-text/70">
                We&rsquo;ll be straight with you &mdash; we&rsquo;re a traditional British pub, not a vegan restaurant.
                But if you&rsquo;re searching for vegan pub food near me, we&rsquo;ve got you covered with proper options and more dishes that can be made vegan on request. Our stone-baked
                garlic bread is naturally vegan (no butter), our chips and sweet potato fries are vegan, and two of our
                pizzas can be made vegan by removing the mozzarella. It&rsquo;s not a huge list, but everything on it
                is genuinely good.
              </p>
              <p className="text-anchor-cream-text/70 mt-3">
                For a plant-based main, our stone-baked Rustic Classic and Garden Club pizzas work brilliantly without
                mozzarella &mdash; the tomato sauce and bases are dairy-free. Combine with chips, chunky chips,
                sweet potato fries or onion rings for a fully vegan pub meal. We accommodate dietary requirements where
                we can, so if you have a specific need, ask at the bar and we will do our best.
              </p>
              <p className="text-anchor-cream-text/70 mt-3">
                We&rsquo;re 7 minutes from Heathrow Terminal 5 with 20 free parking spaces &mdash; a proper pub
                stopover before or after your flight, with food everyone at the table can eat.
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

      {/* Garlic bread editorial */}
      <Section background="white" spacing="sm" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <p className="text-anchor-cream-text/70">
                Our garlic bread deserves a special mention &mdash; it&rsquo;s stone-baked without butter, which means
                it&rsquo;s been accidentally vegan since day one. At &pound;10, it&rsquo;s a proper starter or side
                that everyone at the table can share.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* Can Be Made Vegan items */}
      {veganOption.length > 0 && (
        <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
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
      <Section background="white" spacing="sm" className="bg-anchor-bg border-b border-anchor-gold/15">
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
                The Rustic Classic and Garden Club pizzas both work brilliantly without mozzarella. The stone-baked
                bases are naturally vegan, and the tomato sauce is made without dairy. Just ask for no mozzarella
                when you order &mdash; the kitchen knows what to do.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* Sides editorial */}
      <Section background="white" spacing="sm" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="Build a Vegan Meal from Sides"
                align="left"
                className="mb-4"
              />
              <p className="text-anchor-cream-text/70">
                Our chips, chunky chips, sweet potato fries and onion rings are all vegan. So even if you&rsquo;re not
                ordering a main, you can put together a solid vegan meal from the sides &mdash; a garlic bread, some
                chips and onion rings makes a proper pub snack.
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

      {/* We're working on it */}
      <Section background="white" spacing="sm" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="We&rsquo;re Working on It"
                align="left"
                className="mb-4"
              />
              <p className="text-anchor-cream-text/70">
                We know our vegan selection isn&rsquo;t huge yet. We&rsquo;re a village pub that&rsquo;s been around
                since 1751, and we&rsquo;re gradually expanding our plant-based options. If you&rsquo;d like to see
                something specific on the menu, tell us &mdash; we listen to what our customers want.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* Vegan Dining Near Heathrow */}
      <Section background="white" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="Vegan Dining Near Heathrow Airport"
                subtitle="Honest options at a traditional pub, just minutes from the terminal."
                align="left"
                className="mb-6"
              />
              <div className="text-anchor-cream-text/70 space-y-4">
                <p>
                  If you&rsquo;re looking for a vegan restaurant near Heathrow, we should be upfront &mdash; we&rsquo;re a traditional British pub, not a plant-based specialist. But that doesn&rsquo;t mean vegan diners get short-changed. We have genuine vegan pub food options, and we&rsquo;re honest about what we can and can&rsquo;t do.
                </p>
                <p>
                  Our garlic bread has been vegan since day one &mdash; stone-baked without butter. Our chips, chunky chips, sweet potato fries, and onion rings are all fully plant-based. And two of our stone-baked pizzas (Rustic Classic and Garden Club) can be made vegan by removing the mozzarella, with the bases and tomato sauce already dairy-free.
                </p>
                <p>
                  We&rsquo;re 7 minutes from Heathrow Terminal 5, with 20 free parking spaces and luggage storage available. For Heathrow travellers, crew members, and airport hotel guests looking for vegan pub food near me that&rsquo;s better than anything inside the terminal &mdash; we&rsquo;re the closest traditional pub to the airport and one of the few with proper vegan options.
                </p>
                <p>
                  Our kitchen team is happy to talk through what works for you. If you have allergies beyond dairy and animal products, let us know when you order and we&rsquo;ll advise. We prepare all food in a single kitchen, so we can&rsquo;t guarantee zero cross-contamination &mdash; but we can tell you exactly what&rsquo;s in every dish.
                </p>
              </div>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* How to Build a Full Vegan Meal */}
      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="How to Build a Full Vegan Meal"
                subtitle="Our recommendations for putting together a proper vegan pub meal."
                align="left"
                className="mb-6"
              />
              <div className="text-anchor-cream-text/70 space-y-4">
                <p>
                  <strong className="text-anchor-cream-text">The Full Vegan Spread:</strong> Start with stone-baked garlic bread to share, order a Rustic Classic or Garden Club pizza without mozzarella as your main, and add a side of sweet potato fries or onion rings. That&rsquo;s a proper three-course vegan pub meal without a single compromise.
                </p>
                <p>
                  <strong className="text-anchor-cream-text">Quick Bite:</strong> Short on time? A garlic bread and chips makes a solid vegan snack. Fast, filling, and fully plant-based.
                </p>
                <p>
                  <strong className="text-anchor-cream-text">Sides as a Meal:</strong> Our vegan sides &mdash; chips, chunky chips, sweet potato fries, and onion rings &mdash; are all generous portions. Order two or three sides and you&rsquo;ve got a perfectly good meal without needing a main course.
                </p>
                <p>
                  <strong className="text-anchor-cream-text">Drinks:</strong> We carry a range of beers, wines, and soft drinks. Ask at the bar about vegan-friendly options &mdash; many of our drinks are naturally plant-based.
                </p>
              </div>
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

    </>
  )
}

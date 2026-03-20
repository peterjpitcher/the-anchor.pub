import Link from 'next/link'
import { Metadata } from 'next'
import { Container, Section, Card, CardBody, Alert } from '@/components/ui'
import { CTASection, SectionHeader } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { HeroWrapper } from '@/components/hero'
import { MenuSectionCta } from '@/components/food/MenuSectionCta'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { parseMenuMarkdown, type MenuData, type MenuCategory } from '@/lib/menu-parser'
import { getBusinessHours, isKitchenOpen } from '@/lib/api'
import { formatTime12Hour } from '@/lib/time-utils'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { MenuRenderer } from '@/components/MenuRenderer'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Vegetarian Menu | Pub Food Near Heathrow',
  description: 'Vegetarian pub food near Heathrow Airport. From butternut squash pie to stone-baked pizzas and mac & cheese. Proper meat-free meals, not afterthoughts. Free parking.',
  keywords: 'vegetarian menu near heathrow, vegetarian pub food, veggie pub menu stanwell moor, vegetarian pizza near heathrow, vegetarian sunday roast near heathrow',
  openGraph: {
    title: 'Vegetarian Menu | Pub Food Near Heathrow',
    description: 'Vegetarian pub food near Heathrow Airport. From butternut squash pie to stone-baked pizzas and mac & cheese. Proper meat-free meals, not afterthoughts.',
  },
  twitter: getTwitterMetadata({
    title: 'Vegetarian Menu | Pub Food Near Heathrow',
    description: 'Vegetarian pub food near Heathrow Airport. From butternut squash pie to stone-baked pizzas and mac & cheese. Proper meat-free meals, not afterthoughts.',
  }),
  alternates: {
    canonical: '/food-menu/vegetarian',
  },
}

/** Filter menu data to only include vegetarian and vegan items */
function filterVegetarianMenu(menuData: MenuData): MenuData {
  return {
    ...menuData,
    categories: menuData.categories
      .map((category): MenuCategory => ({
        ...category,
        sections: category.sections
          .map((section) => ({
            ...section,
            items: section.items.filter(
              (item) => item.vegetarian === true || item.vegan === true
            ),
          }))
          .filter((section) => section.items.length > 0),
      }))
      .filter((category) => category.sections.length > 0),
  }
}

/** Editorial copy to insert between specific menu categories */
const EDITORIAL_COPY: Record<string, string> = {
  pies: 'Our butternut squash, mixed bean and mature cheddar pie is the vegetarian star of the classics section \u2014 the same golden pastry and rich filling as our meat pies.',
  pizza: 'Every pizza on our menu can be ordered vegetarian. The Rustic Classic and Garden Club are vegetarian as standard, and both can be made vegan by removing the mozzarella.',
  desserts: 'Four of our five puddings are vegetarian, including our sticky toffee pudding and chocolate fudge brownie \u2014 both gluten-free too.',
}

export default async function VegetarianMenuPage() {
  const [menuData, businessHours] = await Promise.all([
    parseMenuMarkdown('food'),
    getBusinessHours(),
  ])

  if (!menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-anchor-bg">
        <p className="text-xl text-anchor-cream-text/70">
          Menu temporarily unavailable. Please call us on 01753 682707.
        </p>
      </div>
    )
  }

  const vegetarianMenu = filterVegetarianMenu(menuData)

  // Count total vegetarian items
  const totalVegetarianItems = vegetarianMenu.categories.reduce(
    (total, category) =>
      total +
      category.sections.reduce((s, section) => s + section.items.length, 0),
    0
  )

  // Kitchen hours
  const kitchenScheduleParts: string[] = []
  if (businessHours) {
    const weekdays = [
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
    ] as const
    const weekdayHours = weekdays
      .map((day) => {
        const dayHours = businessHours.regularHours[day]
        if (!dayHours?.kitchen || !isKitchenOpen(dayHours.kitchen)) return null
        return {
          opens: formatTime12Hour(dayHours.kitchen.opens),
          closes: formatTime12Hour(dayHours.kitchen.closes),
        }
      })
      .filter(Boolean) as Array<{ opens: string; closes: string }>

    if (
      weekdayHours.length === weekdays.length &&
      weekdayHours.every(
        (h) =>
          h.opens === weekdayHours[0].opens &&
          h.closes === weekdayHours[0].closes
      )
    ) {
      kitchenScheduleParts.push(
        `Tuesday to Friday ${weekdayHours[0].opens}\u2013${weekdayHours[0].closes}`
      )
    } else {
      weekdayHours.forEach((h, i) => {
        const dayName =
          weekdays[i].charAt(0).toUpperCase() + weekdays[i].slice(1)
        kitchenScheduleParts.push(`${dayName} ${h.opens}\u2013${h.closes}`)
      })
    }

    const satKitchen = businessHours.regularHours.saturday?.kitchen
    if (satKitchen && isKitchenOpen(satKitchen)) {
      kitchenScheduleParts.push(
        `Saturday ${formatTime12Hour(satKitchen.opens)}\u2013${formatTime12Hour(satKitchen.closes)}`
      )
    }

    const sunKitchen = businessHours.regularHours.sunday?.kitchen
    if (sunKitchen && isKitchenOpen(sunKitchen)) {
      kitchenScheduleParts.push(
        `Sunday ${formatTime12Hour(sunKitchen.opens)}\u2013${formatTime12Hour(sunKitchen.closes)}`
      )
    }
  }

  const kitchenSchedule = kitchenScheduleParts.length > 0
    ? kitchenScheduleParts.join(', ')
    : null

  const faqItems = [
    {
      question: 'Does The Anchor have a vegetarian menu?',
      answer: `Yes, we serve over ${totalVegetarianItems} vegetarian dishes including pies, pizzas, pasta, burgers, sides and puddings.`,
    },
    {
      question: 'Is the vegetarian food cooked separately?',
      answer: 'Our dishes are prepared in one kitchen, so we cannot guarantee no cross-contamination. Ask at the bar for allergen info.',
    },
    {
      question: 'Can I get a vegetarian Sunday roast?',
      answer: 'Yes, butternut squash wellington is our vegetarian Sunday roast option (from \u00A319.99, pre-order by Saturday 1pm).',
    },
    {
      question: 'Are the vegetarian pizzas stone-baked?',
      answer: 'Yes, all pizzas including the Rustic Classic and Garden Club are stone-baked to order. Gluten-free bases available.',
    },
    {
      question: 'Is there a vegan menu too?',
      answer: 'Yes, see our vegan menu. Several items are vegan or can be made vegan on request.',
    },
    {
      question: 'Can I book a table for a vegetarian meal near Heathrow?',
      answer: 'Absolutely. Reserve online or call 01753 682707 \u2014 we\u2019re 7 minutes from Heathrow with free parking.',
    },
  ]

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Food Menu', url: '/food-menu' },
          { name: 'Vegetarian Menu', url: '/food-menu/vegetarian' },
        ]}
      />

      {/* Hero */}
      <HeroWrapper
        route="/food-menu/vegetarian"
        title="Vegetarian Menu"
        description="Meat-free meals made with the same care as everything else on our menu. Proper vegetarian pub food, not afterthoughts."
        variant="default"
        breadcrumbs={[
          { name: 'Food & Drink', href: '/food-menu' },
          { name: 'Vegetarian' },
        ]}
        tags={[
          { label: 'Stone-baked pizzas', variant: 'default' },
          { label: 'Veggie pies', variant: 'default' },
          { label: 'Proper puddings', variant: 'default' },
          { label: 'Free parking', variant: 'default' },
        ]}
        primaryCta={
          <BookTableButton
            source="vegetarian_menu_hero"
            context="food"
            variant="primary"
            size="lg"
            className="sm:w-auto"
            trackingLabel="Hero Book a Table"
          >
            Reserve Your Table
          </BookTableButton>
        }
        secondaryCta={
          <MenuSectionCta
            label="View Vegetarian Menu"
            scrollToId="menu"
            analyticsLabel="view_full_menu"
            location="vegetarian_menu_hero"
            variant="secondary"
            fullWidth
            className="sm:w-auto sm:min-w-0"
          />
        }
      />

      {/* Definitive answer paragraph */}
      <Section background="white" spacing="sm" className="bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="Vegetarian Pub Food at The Anchor"
                subtitle="Meat-free dishes we are genuinely proud of."
              />
              <p className="text-anchor-cream-text/70">
                The Anchor serves over {totalVegetarianItems} vegetarian dishes across our full menu &mdash;
                from butternut squash and mature cheddar pie to stone-baked pizzas, mac &amp; cheese,
                and proper puddings. These aren&rsquo;t afterthoughts bolted onto a meat menu;
                they&rsquo;re dishes we&rsquo;re genuinely proud of.
              </p>
              <ul className="mt-4 space-y-2 text-anchor-cream-text/70">
                <li>&bull; Vegetarian pies, burgers, pasta and pizzas &mdash; all cooked fresh to order.</li>
                <li>&bull; Vegan options available, including the Garden Veg Burger and Garden Stack.</li>
                <li>&bull; Free parking, 7 minutes from Heathrow, dog and family friendly.</li>
              </ul>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* Filtered vegetarian menu */}
      <div id="menu" className="section-spacing bg-anchor-bg">
        <Container>
          <SectionHeader
            title="Vegetarian Menu"
            subtitle={`${totalVegetarianItems} vegetarian and vegan dishes from our full food menu, grouped by category.`}
            align="center"
            className="mb-10"
          />
        </Container>

        {vegetarianMenu.categories.map((category, index) => (
          <div key={category.id}>
            <MenuRenderer
              menuData={{
                ...vegetarianMenu,
                categories: [category],
              }}
            />

            {/* Editorial copy after specific categories */}
            {EDITORIAL_COPY[category.id] && (
              <Section background="white" spacing="sm" className={index % 2 === 0 ? 'bg-anchor-bg' : 'bg-anchor-bg-raised'}>
                <Container>
                  <p className="text-center text-anchor-cream-text/70 max-w-2xl mx-auto italic">
                    {EDITORIAL_COPY[category.id]}
                  </p>
                </Container>
              </Section>
            )}
          </div>
        ))}
      </div>

      {/* Vegan options callout */}
      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none border border-anchor-gold/20">
            <CardBody className="text-center py-8">
              <h2 className="text-2xl font-bold text-anchor-cream-text mb-3">Looking for Vegan?</h2>
              <p className="text-anchor-cream-text/70 mb-4 max-w-lg mx-auto">
                Many of our vegetarian dishes can be made vegan on request.
                See our{' '}
                <Link href="/food-menu/vegan" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">
                  vegan menu
                </Link>{' '}
                for the full list.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* Kitchen hours */}
      <Section background="white" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="Kitchen Hours"
                subtitle="Our vegetarian dishes are available during all regular kitchen hours."
                align="left"
                className="mb-6"
              />
              {kitchenSchedule ? (
                <p className="text-anchor-cream-text/70">
                  Kitchen open: {kitchenSchedule}. Monday kitchen closed.
                  Call ahead on{' '}
                  <a
                    href="tel:+441753682707"
                    className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid"
                  >
                    01753 682707
                  </a>{' '}
                  for large parties.
                </p>
              ) : (
                <p className="text-anchor-cream-text/70">
                  Kitchen hours are updated live on this page. Monday kitchen closed.
                  Call ahead on{' '}
                  <a
                    href="tel:+441753682707"
                    className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid"
                  >
                    01753 682707
                  </a>{' '}
                  for large parties.
                </p>
              )}
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* Booking CTA */}
      <div data-sticky-cta-guard="true">
        <CTASection
          title="Hungry? Book Your Table Now"
          description="Whether it&rsquo;s a veggie pie, a stone-baked pizza or a proper pudding &mdash; book today and we&rsquo;ll have your table ready."
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

      {/* Allergen notice */}
      <Section background="gray" spacing="md" className="bg-anchor-bg">
        <Container>
          <Alert
            variant="warning"
            title="Allergen Information"
            className="max-w-4xl mx-auto"
          >
            <p className="text-anchor-cream-text/70">
              All dishes are prepared in a single kitchen where allergens are present.
              Speak to us about your needs before ordering.
            </p>
          </Alert>
        </Container>
      </Section>

      {/* FAQ Section */}
      <FAQAccordionWithSchema faqs={faqItems} className="bg-anchor-bg-card" />

      {/* Internal links */}
      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-anchor-cream-text mb-6">Explore More</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/food-menu"
                className="inline-flex items-center px-4 py-2 rounded-full border border-anchor-gold/30 text-anchor-cream-text/80 hover:bg-anchor-gold/10 hover:text-anchor-cream-text transition text-sm font-medium"
              >
                Full Food Menu
              </Link>
              <Link
                href="/food-menu/vegan"
                className="inline-flex items-center px-4 py-2 rounded-full border border-anchor-gold/30 text-anchor-cream-text/80 hover:bg-anchor-gold/10 hover:text-anchor-cream-text transition text-sm font-medium"
              >
                Vegan Menu
              </Link>
              <Link
                href="/food-menu/gluten-free"
                className="inline-flex items-center px-4 py-2 rounded-full border border-anchor-gold/30 text-anchor-cream-text/80 hover:bg-anchor-gold/10 hover:text-anchor-cream-text transition text-sm font-medium"
              >
                Gluten-Free Menu
              </Link>
              <Link
                href="/sunday-lunch"
                className="inline-flex items-center px-4 py-2 rounded-full border border-anchor-gold/30 text-anchor-cream-text/80 hover:bg-anchor-gold/10 hover:text-anchor-cream-text transition text-sm font-medium"
              >
                Sunday Lunch
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* Structured data */}
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

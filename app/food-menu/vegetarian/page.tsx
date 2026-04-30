import Link from 'next/link'
import { Metadata } from 'next'
import { Container, Section, Card, CardBody, Alert } from '@/components/ui'
import { CTASection, SectionHeader } from '@/components/ui'
import { HeroWrapper } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { parseMenuMarkdown, type MenuData, type MenuCategory } from '@/lib/menu-parser'
import { getBusinessHours, isKitchenOpen } from '@/lib/api'
import { formatTime12Hour } from '@/lib/time-utils'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { MenuRenderer } from '@/components/MenuRenderer'
import { DietaryMenuNav } from '@/components/food/DietaryMenuNav'
import { PageTitle } from '@/components/ui/typography/PageTitle'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Vegetarian Menu | Pub Food Near Heathrow',
  description: 'Vegetarian pub food near Heathrow Airport. From butternut squash pie to stone-baked pizzas and mac & cheese. Proper meat-free meals, not afterthoughts. Free parking.',
  openGraph: {
    title: 'Vegetarian Menu | Pub Food Near Heathrow',
    description: 'Vegetarian pub food near Heathrow Airport. From butternut squash pie to stone-baked pizzas and mac & cheese. Proper meat-free meals, not afterthoughts.',
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
  pies: 'Our butternut squash, mixed bean and mature cheddar pie is the vegetarian star of the classics \u2014 same golden pastry and rich filling as our meat pies, just without the meat. It\u2019s the dish vegetarian regulars keep coming back for.',
  burgers: 'The Garden Veg Burger is a proper burger, not a token afterthought. Served with onion ring, salad and chips for \u00A311 \u2014 or go for the Garden Stack at \u00A314 if you\u2019re properly hungry. Upgrade to sweet potato fries or cheesy chips for a couple of quid more.',
  'comfort-favourites': 'Mac and cheese with crispy onions and garlic bread is the kind of comfort food that makes you forget you\u2019re eating vegetarian. Our spinach and ricotta cannelloni is another favourite \u2014 baked in tomato sauce and served with salad.',
  pizza: 'Every pizza on our menu can be ordered vegetarian. The Rustic Classic and Garden Club are vegetarian as standard \u2014 and both can be made vegan by removing the mozzarella. Gluten-free bases available on all pizzas too.',
  desserts: 'Four of our five puddings are vegetarian, and two \u2014 sticky toffee pudding and chocolate fudge brownie \u2014 are naturally gluten-free as well. Save room.',
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
      answer: 'Yes, butternut squash wellington is our vegetarian Sunday roast option (from \u00A319). Walk in 1pm-6pm or book ahead.',
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
    {
      question: 'What vegetarian mains do you serve?',
      answer: 'Our vegetarian mains include butternut squash, mixed bean and mature cheddar pie; Garden Veg Burger; Garden Stack; spinach and ricotta cannelloni; mac and cheese; and stone-baked pizzas. All are cooked fresh to order.',
    },
    {
      question: 'Is the mac and cheese vegetarian?',
      answer: 'Yes, our mac and cheese with crispy onions and garlic bread is fully vegetarian. It is one of our most popular comfort dishes.',
    },
    {
      question: 'Are your vegetarian options suitable for Heathrow travellers?',
      answer: 'Yes. We are just 7 minutes from Heathrow Terminal 5 with free parking. Many vegetarian travellers stop in before or after a flight for a proper sit-down meal rather than airport food.',
    },
    {
      question: 'Can vegetarian dishes be made gluten-free?',
      answer: 'Several of our vegetarian dishes are naturally gluten-free or can be adapted. Our stone-baked pizzas are available with a gluten-free base. Ask at the bar for full allergen and gluten-free information.',
    },
  ]

  return (
    <>

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
        enableSmartCtas={true}
        showContextStrip={true}
      />

      {/* Definitive answer paragraph */}
      <Section background="white" spacing="sm" className="bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <PageTitle as="h2" className="text-anchor-cream-text mb-2">
                Vegetarian Pub Food Near Heathrow
              </PageTitle>
              <p className="text-anchor-cream-text/55 mb-4">Meat-free dishes we are genuinely proud of.</p>
              <p className="text-anchor-cream-text/70">
                Whether you&rsquo;re a committed vegetarian or just fancy a meat-free meal,
                The Anchor serves over {totalVegetarianItems} vegetarian dishes across our full menu &mdash;
                from a proper butternut squash pie to stone-baked pizzas, creamy mac and cheese,
                and indulgent puddings. We&rsquo;re just 7 minutes from Heathrow Terminal 5
                with 20 free parking spaces, so there&rsquo;s no excuse not to pop in.
              </p>
              <p className="text-anchor-cream-text/70 mt-3">
                Our kitchen handles vegetarian orders with care. Every dish on this page is cooked fresh to order,
                and we clearly label vegetarian and vegan items on our menu. For Sunday lunch, our butternut squash
                wellington is a genuine centrepiece &mdash; walk in 1pm-6pm or book ahead.
              </p>
              <ul className="mt-4 space-y-2 text-anchor-cream-text/70">
                <li>&bull; Vegetarian pies, burgers, pasta and pizzas &mdash; all cooked fresh to order.</li>
                <li>&bull; Garden Veg Burger and Garden Stack &mdash; proper vegetarian burgers, not token afterthoughts.</li>
                <li>&bull; Stone-baked pizzas with gluten-free bases available.</li>
                <li>&bull; Free parking, 7 minutes from Heathrow, dog and family friendly.</li>
              </ul>
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

      {/* Vegetarian Dining Near Heathrow */}
      <Section background="white" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="Vegetarian Dining Near Heathrow Airport"
                subtitle="A proper meal before, after, or instead of a flight."
                align="left"
                className="mb-6"
              />
              <div className="text-anchor-cream-text/70 space-y-4">
                <p>
                  Finding a vegetarian restaurant near Heathrow that serves more than a limp salad and overpriced airport pasta can be a challenge. At The Anchor, we take a different approach &mdash; our vegetarian pub food is made with the same care, the same fresh ingredients, and the same generous portions as everything else on our menu.
                </p>
                <p>
                  We&rsquo;re just 7 minutes from Heathrow Terminal 5, with 20 free parking spaces and step-free access from the car park. Whether you&rsquo;re a Heathrow traveller stopping in for a pre-flight meal, an airport hotel guest looking for something better than room service, or a local who simply wants vegetarian pub food that doesn&rsquo;t feel like an afterthought &mdash; you&rsquo;re welcome here.
                </p>
                <p>
                  Our kitchen is open Tuesday to Saturday from 4pm to 9pm, Saturday from noon to 7pm, and Sunday from 1pm to 6pm. The kitchen is closed on Mondays. Every vegetarian dish is cooked fresh to order, and we clearly label all vegetarian (V) and vegan (VE) items. If you have specific allergen needs, speak to the team at the bar and we&rsquo;ll walk you through what works for you.
                </p>
                <p>
                  We also accommodate groups &mdash; from a quiet meal for two to a table of ten, we can handle it. For parties of 20 or more, call us on{' '}
                  <a href="tel:+441753682707" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid">01753 682707</a> and we&rsquo;ll sort you out.
                </p>
              </div>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* Expanded dish descriptions */}
      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="Our Favourite Vegetarian Dishes"
                subtitle="What our regulars keep ordering."
                align="left"
                className="mb-6"
              />
              <div className="text-anchor-cream-text/70 space-y-4">
                <p>
                  <strong className="text-anchor-cream-text">Butternut Squash, Mixed Bean &amp; Mature Cheddar Pie</strong> &mdash; This is the dish that puts our vegetarian menu on the map. A proper pie with golden pastry, a rich filling of roasted butternut squash, mixed beans, and mature cheddar, served with creamy mash and seasonal vegetables (or chips, if you prefer). <em>Contains: gluten, dairy.</em>
                </p>
                <p>
                  <strong className="text-anchor-cream-text">Garden Veg Burger</strong> &mdash; Not a generic frozen patty. Our Garden Veg Burger is served with onion ring, salad and chips in a brioche bun. For bigger appetites, upgrade to the Garden Stack which adds extra toppings. <em>Contains: gluten, dairy, egg.</em>
                </p>
                <p>
                  <strong className="text-anchor-cream-text">Spinach &amp; Ricotta Cannelloni</strong> &mdash; Baked in tomato sauce and served with side salad. Creamy ricotta and spinach wrapped in pasta tubes, topped with melted cheese. Comfort food at its finest. <em>Contains: gluten, dairy, egg.</em>
                </p>
                <p>
                  <strong className="text-anchor-cream-text">Mac &amp; Cheese with Crispy Onions</strong> &mdash; Creamy, cheesy, and served with garlic bread. This is the vegetarian comfort dish that non-vegetarians order too. <em>Contains: gluten, dairy.</em>
                </p>
                <p>
                  <strong className="text-anchor-cream-text">Stone-Baked Pizzas</strong> &mdash; The Rustic Classic and Garden Club are vegetarian as standard and can be made vegan by removing the mozzarella. All pizzas are available with a gluten-free base. <em>Contains: gluten, dairy (standard); gluten-free base available.</em>
                </p>
              </div>
            </CardBody>
          </Card>
        </Container>
      </Section>

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

      {/* Why choose The Anchor */}
      <Section background="white" spacing="md" className="bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <Card className="card-dark rounded-none">
            <CardBody>
              <SectionHeader
                title="Why Choose The Anchor for Vegetarian Food?"
                subtitle="More than a token veggie option."
                align="left"
                className="mb-6"
              />
              <ul className="space-y-3 text-anchor-cream-text/70">
                <li>&bull; Over {totalVegetarianItems} vegetarian dishes &mdash; not just one token option on a meat menu.</li>
                <li>&bull; Proper portions at pub prices, with mains from &pound;11.</li>
                <li>&bull; Stone-baked pizzas can be made vegan on request &mdash; just ask for no mozzarella.</li>
                <li>&bull; Gluten-free pizza bases available on every pizza.</li>
                <li>&bull; 7 minutes from Heathrow Terminal 5, with 20 free parking spaces.</li>
                <li>&bull; Dog-friendly &mdash; bring the dog, eat veggie, enjoy your afternoon.</li>
              </ul>
              <p className="mt-6">
                <Link
                  href="/book-table"
                  className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition"
                >
                  Book a table
                </Link>
                {' '}or call us on{' '}
                <a
                  href="tel:+441753682707"
                  className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition"
                >
                  01753 682707
                </a>.
              </p>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* FAQ Section */}
      <FAQAccordionWithSchema faqs={faqItems} className="bg-anchor-bg-card" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafeStringify({
              '@context': 'https://schema.org',
              '@type': 'Restaurant',
              '@id': 'https://www.the-anchor.pub/#business',
              name: 'The Anchor',
              description: 'Traditional British pub near Heathrow Airport with a vegetarian menu including pies, pizzas, pasta, burgers and puddings.',
              servesCuisine: ['British', 'Pizza', 'Pub Food', 'Vegetarian'],
              hasMenu: {
                '@type': 'Menu',
                name: 'Vegetarian Menu',
                url: 'https://www.the-anchor.pub/food-menu/vegetarian',
                description: 'Vegetarian pub food at The Anchor near Heathrow — butternut squash pie, stone-baked pizzas, mac and cheese, garden veg burger and more.',
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
              <Link
                href="/book-table"
                className="inline-flex items-center px-4 py-2 rounded-full border border-anchor-gold/30 text-anchor-cream-text/80 hover:bg-anchor-gold/10 hover:text-anchor-cream-text transition text-sm font-medium"
              >
                Book a Table
              </Link>
            </div>
          </div>
        </Container>
      </Section>

    </>
  )
}

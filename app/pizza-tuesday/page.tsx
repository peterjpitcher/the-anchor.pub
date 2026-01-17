import Link from 'next/link'
import type { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { BookTableButton } from '@/components/BookTableButton'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { Button, Card, CardBody, Container, CTASection, Section, SectionHeader } from '@/components/ui'
import { parseMenuMarkdown } from '@/lib/menu-parser'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
  title: 'Pizza Tuesday (Two for Tuesday) Near Heathrow | 2-for-1 Pizzas',
  description:
    'Get 2-for-1 stone-baked pizzas every Tuesday at The Anchor in Stanwell Moor near Heathrow Terminal 5. Buy one get one free during Tuesday kitchen hours with free parking.',
  keywords:
    'pizza tuesday, pizza tuesday deals, tuesday pizza offers, buy one get one free pizza, bogof pizza near heathrow, 2 for 1 pizza staines, pizza deals near terminal 5',
  openGraph: {
    title: 'Pizza Tuesday – Buy One Get One Free at The Anchor',
    description: 'Every Tuesday: buy one get one free stone-baked pizzas near Heathrow Terminal 5 with free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Pizza Tuesday – Buy One Get One Free at The Anchor',
    description: 'Every Tuesday: buy one get one free stone-baked pizzas near Heathrow Terminal 5 with free parking.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
  }),
  alternates: {
    canonical: '/pizza-tuesday',
  },
}

export const revalidate = 60 * 60

const FAQS = [
  {
    question: 'What is Pizza Tuesday at The Anchor?',
    answer:
      'Pizza Tuesday is our weekly 2-for-1 pizza offer: buy one stone-baked pizza and get a second pizza free when dining in on Tuesdays.'
  },
  {
    question: 'When is the Pizza Tuesday deal available?',
    answer:
      'The offer runs on Tuesdays during kitchen service. If you are travelling from Heathrow, it is best to book ahead or call 01753 682707 to confirm times for your date.'
  },
  {
    question: 'Do I need a voucher to get buy one get one free?',
    answer:
      'No voucher is needed. Book a table and mention Pizza Tuesday when you arrive so the team can look after you.'
  },
  {
    question: 'Where is The Anchor and is there parking?',
    answer:
      'We are in Stanwell Moor, around 7 minutes from Heathrow Terminal 5, and we have free on-site parking for diners.'
  }
]

export default async function PizzaTuesdayPage() {
  const menuData = await parseMenuMarkdown('food')
  const pizzaCategory = menuData?.categories.find(category => category.id === 'pizza')
  const pizzaHighlights = pizzaCategory?.sections.flatMap(section => section.items).slice(0, 6) ?? []

  const offerSchema = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    '@id': 'https://www.the-anchor.pub/pizza-tuesday#offer',
    name: 'Pizza Tuesday (Two for Tuesday) – Buy One Get One Free',
    description:
      'Buy one stone-baked pizza and get a second pizza free when dining in on Tuesdays at The Anchor near Heathrow Terminal 5.',
    url: 'https://www.the-anchor.pub/pizza-tuesday',
    priceCurrency: 'GBP',
    availability: 'https://schema.org/InStock',
    validFrom: '2026-01-01',
    category: 'https://schema.org/FoodAndDrink'
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Pizza Tuesday', url: '/pizza-tuesday' }
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(offerSchema) }} />

      <HeroWrapper
        route="/pizza-tuesday"
        title="Pizza Tuesday"
        description="Buy one get one free stone-baked pizzas near Heathrow Terminal 5"
        variant="promo"
        tags={[
          { label: '🍕 Two for Tuesday (2-for-1)', variant: 'success' },
          { label: '✈️ 7 mins from T5', variant: 'default' },
          { label: '🚗 Free Parking', variant: 'default' }
        ]}
        primaryCta={
          <BookTableButton
            source="pizza_tuesday_hero"
            context="pizza_menu"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            Book Pizza Tuesday
          </BookTableButton>
        }
        secondaryCta={
          <Link href="/pizza-menu" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              View Pizza Menu
            </Button>
          </Link>
        }
      />

      <Section background="white" spacing="sm">
        <Container>
          <PageTitle className="text-center text-anchor-green" seo={{ structured: true, speakable: true }}>
            Pizza Tuesday (Two for Tuesday) Deals Near Heathrow
          </PageTitle>
          <p className="mt-4 text-center text-gray-700 max-w-3xl mx-auto">
            If you are searching for Two for Tuesday deals or Tuesday pizza deals near Heathrow, Pizza Tuesday at The
            Anchor is the simple one: buy one stone-baked pizza and get a second pizza free when dining in on Tuesdays.
            We’re in Stanwell Moor with free parking and easy access from Heathrow Terminal 5 and Staines.
          </p>
        </Container>
      </Section>

      <Section background="gray" spacing="md">
        <Container>
          <div className="max-w-5xl mx-auto">
            <SectionHeader
              title="How Pizza Tuesday Works"
              subtitle="No vouchers. No apps. Just proper pizzas and good value."
              align="center"
            />
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-white">
                <CardBody>
                  <h3 className="text-lg font-semibold text-anchor-green mb-2">1) Book a table</h3>
                  <p className="text-sm text-gray-700">
                    Tuesdays get busy. Reserve ahead so the kitchen can time your pizzas—especially if you’re coming from
                    Heathrow.
                  </p>
                </CardBody>
              </Card>
              <Card className="bg-white">
                <CardBody>
                  <h3 className="text-lg font-semibold text-anchor-green mb-2">2) Order any two pizzas</h3>
                  <p className="text-sm text-gray-700">
                    Choose your favourites from our stone-baked selection. The offer is dine-in on Tuesdays during
                    kitchen service.
                  </p>
                </CardBody>
              </Card>
              <Card className="bg-white">
                <CardBody>
                  <h3 className="text-lg font-semibold text-anchor-green mb-2">3) The second pizza is free</h3>
                  <p className="text-sm text-gray-700">
                    Pay for one pizza and the second is on us. If you have any questions on the day, call 01753 682707.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {pizzaHighlights.length > 0 && (
        <Section background="white" spacing="md">
          <Container>
            <div className="max-w-5xl mx-auto">
              <SectionHeader
                title="Pizza Highlights"
                subtitle="A few favourites—see the full menu for the complete line-up."
                align="center"
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pizzaHighlights.map(item => (
                  <Card key={item.name} className="bg-anchor-cream/40">
                    <CardBody>
                      <h3 className="font-semibold text-anchor-green">{item.name}</h3>
                      {item.description && <p className="mt-2 text-sm text-gray-700">{item.description}</p>}
                    </CardBody>
                  </Card>
                ))}
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/pizza-menu">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    View Full Pizza Menu
                  </Button>
                </Link>
                <Link href="/find-us">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Get Directions
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </Section>
      )}

      <FAQAccordionWithSchema title="Pizza Tuesday FAQs" faqs={FAQS} />

      <CTASection
        title="Ready for 2-for-1 Pizza Tuesday?"
        description="Book ahead for the best table. Coming from Heathrow? We’re around 7 minutes from Terminal 5 with free parking."
        variant="dark"
        buttons={[
          {
            text: 'Book Pizza Tuesday',
            href: '/book-table',
            variant: 'primary',
          },
          {
            text: 'See Drinks Menu',
            href: '/drinks',
            variant: 'secondary',
          }
        ]}
      />
    </>
  )
}

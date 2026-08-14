import Link from 'next/link'
import { Button, Card, CardBody, SectionHeading, Badge } from '@/components/ui'
import { parseMenuMarkdown } from '@/lib/menu-parser'
import { InteriorHero } from '@/components/hero'
import { AmenityStrip } from '@/components/AmenityStrip'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { MenuPageTracker } from '@/components/tracking/MenuPageTracker'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { generateNutritionInfo, generateOpeningHoursSpecification } from '@/lib/schema-utils'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { CONTACT } from '@/lib/constants'
import { DEFAULT_DRINKS_IMAGE } from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getBusinessHours } from '@/lib/api'
import { getDrinksHeroImage } from '@/lib/drinks-hero-image'
import { getMenuUnavailableMessage } from '@/lib/menu-page-data'
import { FoodMenuSection } from '../food-menu/_components/FoodMenuSection'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Drinks Menu Near Heathrow | Draught Beers, Cocktails & Wine',
  description: 'Draught beers, cocktails, wines, spirits and soft drinks at The Anchor near Heathrow. Free parking, 7 mins from T5. View the drinks menu.',
  openGraph: {
    title: 'Drinks Menu Near Heathrow | Draught Beers, Cocktails & Wine',
    description: 'Draught beers, cocktails, wines, spirits and soft drinks at The Anchor near Heathrow. Free parking, 7 mins from T5. View the drinks menu.',
    images: [{ url: DEFAULT_DRINKS_IMAGE, width: 1200, height: 630, alt: 'Drinks menu at The Anchor pub near Heathrow' }],
  },
  twitter: getTwitterMetadata({
    title: 'Drinks Menu Near Heathrow | Draught Beers, Cocktails & Wine',
    description: 'Draught beers, cocktails, wines, spirits and soft drinks at The Anchor near Heathrow. Free parking, 7 mins from T5. View the drinks menu.',
    images: [DEFAULT_DRINKS_IMAGE]
  }),
  alternates: {
    canonical: '/drinks'
  }
}

export default async function DrinksMenuPage() {
  const [menuData, businessHours] = await Promise.all([
    parseMenuMarkdown('drinks'),
    getBusinessHours()
  ])

  if (!menuData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="text-xl text-ink-muted">{getMenuUnavailableMessage()}</p>
      </div>
    )
  }

  const menuDataWithoutManagersSpecial = {
    ...menuData,
    categories: menuData.categories.map(category => {
      if (category.id !== 'spirits') return category
      return {
        ...category,
        sections: category.sections.filter(section => section.title !== "Manager's Special")
      }
    })
  }

  const enhancedDrinksMenuSchema = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": "https://www.the-anchor.pub/drinks#menu",
    "name": "The Anchor Drinks Menu",
    "description": "Full bar service with draught beers, lagers, wines, spirits and soft drinks at The Anchor in Stanwell Moor, Surrey",
    "hasMenuSection": menuDataWithoutManagersSpecial.categories.map(category => ({
      "@type": "MenuSection",
      "name": category.title,
      "description": `${category.title} selection at The Anchor`,
      "hasMenuItem": category.sections.flatMap(section =>
        section.items.map(item => ({
          "@type": "MenuItem",
          "name": item.name,
          "description": item.description || item.name,
          "offers": {
            "@type": "Offer",
            "price": item.price.replace(/[£$]/, '').split(' / ')[0],
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock"
          },
          ...(category.title.toLowerCase().includes('cocktail') && {
            "nutrition": generateNutritionInfo(item.name, 'cocktails')
          })
        }))
      )
    })),
    "inLanguage": "en-GB",
    "provider": {
      "@type": "BarOrPub",
      "@id": "https://www.the-anchor.pub/#business",
      "name": "The Anchor",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Horton Road",
        "addressLocality": "Stanwell Moor",
        "addressRegion": "Surrey",
        "postalCode": "TW19 6AQ",
        "addressCountry": "GB"
      },
      "priceRange": "££",
      "servesCuisine": ["British"],
      "telephone": "+441753682707",
      "url": "https://www.the-anchor.pub"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://www.the-anchor.pub/drinks"
    }
  }

  const openingHoursSpecification = generateOpeningHoursSpecification(businessHours)
  const drinksHeroImage = getDrinksHeroImage()

  // BarOrPub specific schema
  const barSchema = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    "@id": "https://www.the-anchor.pub/#bar",
    "name": "The Anchor Bar",
    "description": "Traditional British pub bar with extensive drinks selection",
    "hasMenu": {
      "@id": "https://www.the-anchor.pub/drinks#menu"
    },
    "servesCuisine": "British",
    ...(openingHoursSpecification.length ? { "openingHoursSpecification": openingHoursSpecification } : {}),
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Draught Beers", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Craft Beers", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Premium Spirits", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Wine Selection", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Cocktail Menu", "value": true }
    ]
  }

  return (
    <>
      <MenuPageTracker
        menuType="drinks"
        specialOffers={[]}
      />
      <ScrollDepthTracker/>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([
          enhancedDrinksMenuSchema,
          barSchema
        ]) }}
      />

      <InteriorHero
        image={drinksHeroImage.src}
        focal="center center"
        crumb="Drinks"
        title="Drinks at The Anchor"
        lead="Start with the taps, browse the bottles, or ask the bar team for a proper serve"
        badges={
          <>
            <Badge variant="sand">Draught Beers</Badge>
            <Badge variant="sand">Premium Spirits</Badge>
            <Badge variant="sand">Wine Selection</Badge>
            <Badge variant="sand">Cocktails</Badge>
          </>
        }
        actions={
          <>
            <BookTableButton
              source="drinks_hero"
              variant="primary"
              size="lg"
              fullWidth
            >
              Reserve a Table
            </BookTableButton>
            <Link href="#menu" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" fullWidth>
                Jump to Menu
              </Button>
            </Link>
          </>
        }
      />

      <AmenityStrip/>

      {/* Page Title */}
      <section className="bg-canvas py-section-y" id="menu">
        <div className="container">
          <div className="mx-auto text-center">
            <PageTitle
              seo={{ structured: true, speakable: true }}
              className="mb-4 text-ink-strong"
            >
              The Drinks List
            </PageTitle>
            <p className="text-lg text-ink-muted">
              Browse the bar before you arrive: draught pints first, then bottles, cocktails, spirits, wine and soft drinks.
            </p>
          </div>

          {/* Quick links */}
          <div className="mt-8">
            <p className="mb-5 text-center text-sm font-semibold uppercase tracking-[0.18em] text-accent-text">Jump straight to</p>
            <div className="flex flex-wrap justify-center gap-3">
              {menuData.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`#${category.id}`}
                  className="inline-flex min-h-[44px] items-center rounded-pill border-[1.5px] border-line-strong bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-anchor-gold-dark"
                >
                  {category.title}
                </Link>
              ))}
              <Link
                href="/food-menu#pizza"
                className="inline-flex min-h-[44px] items-center rounded-pill border-[1.5px] border-line-strong bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-anchor-gold-dark"
              >
                Pizza Menu
              </Link>
              <Link
                href="/sunday-roast"
                className="inline-flex min-h-[44px] items-center rounded-pill border-[1.5px] border-line-strong bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-anchor-gold-dark"
              >
                Sunday Roast Booking
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Content */}
      <section className="bg-surface py-section-y">
        <div className="container">
          <FoodMenuSection menuData={menuDataWithoutManagersSpecial} showFilters={false} showAllergens={false} />
        </div>
      </section>

      {/* Popular Draught & Spirits */}
      <section className="bg-canvas py-section-y" id="featured-offers">
        <div className="container">
          <SectionHeading
            title="Bar Team Favourites"
            lead="A few easy places to start if you are not sure what to order first."
          />
          <div className="mx-auto grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Birra Moretti & Stella Artois',
                body: 'Familiar, cold and quick to choose. These are the pints people ask for when they want a reliable lager before food, after work or while waiting for a flight to land.'
              },
              {
                title: "Guinness & Inch's Cider",
                body: "Guinness for a slower, creamier pint; Inch's for a brighter cider in the garden. Both work well when you are settling in rather than rushing through a round."
              },
              {
                title: 'Premium Spirits & Chambord',
                body: 'If you want something longer, sweeter or more cocktail-led, start with the spirits shelves. Chambord, Disaronno, rum, gin and tequila give the bar team plenty to build from.'
              }
            ].map((item) => (
              <Card key={item.title} accent>
                <CardBody>
                  <h3 className="mb-2 text-h4 text-ink-strong">{item.title}</h3>
                  <p className="text-ink-muted">{item.body}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Your Local After Landing */}
      <section className="bg-surface py-section-y">
        <div className="container">
          <div className="mx-auto">
            <SectionHeading
              title="Your Local After Landing, 7 Minutes from Terminal 5"
            />
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: 'Airport Staff Haven',
                  body: 'Perfect spot for crews and airport workers to unwind after long shifts. Join your colleagues for a well-deserved pint.'
                },
                {
                  title: 'Meeting Point',
                  body: 'Picking someone up? Skip expensive airport parking. Meet here for a relaxed drink while they clear customs.'
                },
                {
                  title: "Traveller's Rest",
                  body: "Just landed or about to fly? We're your local. A quick taxi from every terminal (7 to 12 minutes), free parking if you drive, and a proper British welcome."
                }
              ].map((item) => (
                <Card key={item.title} accent>
                  <CardBody className="text-center">
                    <h3 className="mb-2 text-h4 text-ink-strong">{item.title}</h3>
                    <p className="text-ink-muted">{item.body}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why The Anchor for Drinks */}
      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="mx-auto">
            <SectionHeading
              title="Why Drink With Us in Stanwell Moor"
            />
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  title: 'The Beer Garden Experience',
                  body: "Sixty-four seats directly under the Heathrow flight path, with a plane over your head roughly every 90 seconds at peak. Heated areas keep the garden usable when the evening turns cool.",
                  note: 'Dog-friendly outdoor areas, so bring your four-legged friends.'
                },
                {
                  title: 'Sports & Atmosphere',
                  body: 'Multiple screens showing major sporting events on BBC and ITV. Catch the Six Nations, World Cup, Euros, and other big tournaments with great views from every seat.',
                  note: 'Big matches get busy, so arrive early for a good seat.'
                },
                {
                  title: 'Local Institution',
                  body: 'Serving Stanwell Moor and Staines for generations. Where locals meet, airport workers unwind, and visitors become regulars. Your neighbourhood bar with a global touch.',
                  note: "Ask about our locals' card for exclusive offers!"
                },
                {
                  title: 'Quality & Choice',
                  body: 'From draught beers to handcrafted cocktails, we take drinks seriously. Expert bar staff, proper glassware, and drinks served exactly how they should be. No shortcuts.',
                  note: "Can't see your favourite? Just ask, we might have it."
                }
              ].map((item) => (
                <Card key={item.title} accent>
                  <CardBody>
                    <h3 className="mb-2 text-h4 text-ink-strong">{item.title}</h3>
                    <p className="mb-4 text-ink-muted">{item.body}</p>
                    <p className="text-sm text-ink-muted">{item.note}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seasonal Highlights */}
      <section className="bg-surface py-section-y">
        <div className="container">
          <div className="mx-auto text-center">
            <SectionHeading
              title="Drinks for Every Season"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Summer', body: "Pimm's jugs, ice-cold lagers, and frozen cocktails in the sun-drenched beer garden" },
                { title: 'Autumn', body: 'Warming ales, harvest ciders, and our famous hot toddy as the evenings draw in' },
                { title: 'Winter', body: "Bailey's hot chocolate, hearty stouts and warming spirits by the cosy fire" },
                { title: 'Spring', body: 'Fresh G&Ts, crisp rosé, and the return of beer garden season' }
              ].map((item) => (
                <Card key={item.title} accent>
                  <CardBody className="text-center">
                    <h3 className="mb-2 text-h4 text-ink-strong">{item.title}</h3>
                    <p className="text-sm text-ink-muted">{item.body}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-canvas py-section-y">
        <div className="container">
          <SectionHeading
            title="Popular Shots & Cocktails Near Heathrow"
            lead="Ask the bar team for favourites alongside the full drinks menu."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <Card accent>
              <CardBody>
                <h3 className="mb-2 text-h4 text-ink-strong">Popular shots at the bar</h3>
                <p className="mb-3 text-sm text-ink-muted">
                  Guests regularly order popular shots like Baby Guinness at our Heathrow bar, alongside creamy
                  liqueurs and seasonal specials. Tell us what you like and we will recommend a pour.
                </p>
                <Link
                  href="/drinks/baby-guinness"
                  className="text-sm font-semibold text-accent-text hover:underline"
                >
                  Baby Guinness guide →
                </Link>
              </CardBody>
            </Card>
            <Card accent>
              <CardBody>
                <h3 className="mb-2 text-h4 text-ink-strong">Cocktails, mixers and long drinks</h3>
                <p className="text-sm text-ink-muted">
                  Espresso martinis, mojitos and classic G&Ts share the menu with premium spirits and
                  alcohol-free options, perfect for pre-flight meetups or Staines nights out near Heathrow.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Internal Links for SEO */}
      <section className="bg-surface py-section-y">
        <div className="container">
          <InternalLinkingSection
            links={commonLinkGroups.dining}
            className="mx-auto"
          />
        </div>
      </section>

      {/* FAQ Section */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: "What beers are on tap at The Anchor?",
            answer: "Our draught line-up includes Birra Moretti, Guinness, Stella Artois, Aspall Cider, Inch's Apple Cider, Fosters and Carlsberg, so it runs from crisp lagers through to rich stouts."
          },
          {
            question: "Do you serve cocktails at The Anchor?",
            answer: "Yes! We have a full cocktail menu featuring classics like Mojitos, Margaritas, Espresso Martinis, and many more. Our skilled bartenders can also make your favourite cocktail on request."
          },
          {
            question: "Where can I find well-kept draught beer near Heathrow?",
            answer: "The Anchor is just 7 minutes from Heathrow Terminal 5, and 7 to 12 minutes from the other terminals, with a proper choice of draught beers and premium lagers. We're much better value than airport bars and have a proper pub atmosphere with our beer garden."
          },
          {
            question: "Do you have non-alcoholic drink options?",
            answer: "Yes. We offer a full range of soft drinks, mocktails, coffee, tea, and non-alcoholic beers, so everyone can enjoy their visit whether they're drinking alcohol or not."
          },
          {
            question: "Can I book the bar area for a private drinks party?",
            answer: "Yes, our bar area can be reserved exclusively for cocktail receptions and casual events. We offer comprehensive drinks packages including welcome drinks, wine packages, and bar tabs. Our experienced team will help create the perfect drinks solution for your celebration. Contact us on 01753 682707 to discuss your requirements."
          },
          {
            question: "What wines do you serve at The Anchor?",
            answer: "We offer a carefully selected wine list including our iHeart house wines available in 187ml bottles (perfect single-serve size) or 700ml bottles. We also have premium wine options by the bottle. Our selection includes red, white, rosé, and sparkling wines to suit all tastes and budgets."
          },
          {
            question: "What payment methods are accepted at the bar?",
            answer: "We accept cash and all major credit and debit cards, including American Express. Whether you're settling a tab, buying rounds, or paying for events, we make it easy with multiple payment options."
          }
        ]}
      />

      {/* CTA Section */}
      <CtaBand
        title="Join us for a drink"
        copy="Book ahead for stone-baked pizzas, Sunday roast or a post-flight celebration with pints and cocktails."
      >
        <BookTableButton
          source="drinks_page_cta"
          size="lg"
          variant="primary"
        >
          Reserve a Table
        </BookTableButton>
        <PhoneButton phone={CONTACT.phone} source="drinks_cta" size="lg" variant="outline">
          Call Us
        </PhoneButton>
        <Link href="/food-menu#pizza">
          <Button size="lg" variant="outline">
            Pizza Menu
          </Button>
        </Link>
      </CtaBand>
    </>
  )
}

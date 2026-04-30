import Link from 'next/link'
import { Button, Container, Section, Card, CardBody } from '@/components/ui'
import { StatusBar } from '@/components/layout/StatusBar'
import { parseMenuMarkdown } from '@/lib/menu-parser'
import { MenuRenderer } from '@/components/MenuRenderer'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { drinksMenuSchema } from '@/lib/enhanced-schemas'
import { SectionHeader, FeatureGrid, InfoBoxGrid } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { MenuPageTracker } from '@/components/tracking/MenuPageTracker'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { generateNutritionInfo, generateOpeningHoursSpecification } from '@/lib/schema-utils'
import { BookTableButton } from '@/components/BookTableButton'
import { DEFAULT_DRINKS_IMAGE } from '@/lib/image-fallbacks'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getBusinessHours } from '@/lib/api'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Drinks Menu Near Heathrow | Draught Beers, Cocktails & Wine',
  description: 'Draught beers, draught beers, cocktails, wines & spirits at The Anchor near Heathrow. Pints from £4.95, cocktails from £8. Free parking, 7 mins from T5. View menu.',
  openGraph: {
    title: 'Drinks Menu Near Heathrow | Draught Beers, Cocktails & Wine',
    description: 'Draught beers, draught beers, cocktails, wines & spirits at The Anchor near Heathrow. Pints from £4.95, cocktails from £8. Free parking, 7 mins from T5. View menu.',
    images: [{ url: DEFAULT_DRINKS_IMAGE, width: 1200, height: 630, alt: 'Drinks menu at The Anchor pub near Heathrow' }],
  },
  twitter: getTwitterMetadata({
    title: 'Drinks Menu Near Heathrow | Draught Beers, Cocktails & Wine',
    description: 'Draught beers, draught beers, cocktails, wines & spirits at The Anchor near Heathrow. Pints from £4.95, cocktails from £8. Free parking, 7 mins from T5. View menu.',
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
      <div className="min-h-screen flex items-center justify-center bg-anchor-bg">
        <p className="text-xl text-anchor-cream-text/70">Menu temporarily unavailable. Please call us on 01753 682707.</p>
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
            "price": item.price.replace(/[\u00A3$]/, '').split(' / ')[0],
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
      {
        "@type": "LocationFeatureSpecification",
        "name": "Draught Beers",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Craft Beers",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Premium Spirits",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Wine Selection",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Cocktail Menu",
        "value": true
      }
    ]
  }

  return (
    <>
      <MenuPageTracker 
        menuType="drinks"
        specialOffers={[]}
      />
      <ScrollDepthTracker />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([
          enhancedDrinksMenuSchema,
          barSchema
        ]) }}
      />
      {/* Hero Section */}
      <HeroWrapper
        route="/drinks"
        title="Drinks at The Anchor"
        description="From draught beers to premium spirits - something for everyone"
        variant="default"
        tags={[
          { label: 'Draught Beers', variant: 'default' },
          { label: 'Premium Spirits', variant: 'default' },
          { label: 'Wine Selection', variant: 'default' },
          { label: 'Cocktails', variant: 'primary' }
        ]}
        primaryCta={
          <BookTableButton
            source="drinks_hero"
            variant="secondary"
            size="lg"
            fullWidth
            className="w-full sm:w-auto bg-white text-anchor-green hover:bg-gray-100"
          >
            Reserve a Table
          </BookTableButton>
        }
        secondaryCta={
          <>
            <Link href="#menu" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                className="sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                Jump to Menu
              </Button>
            </Link>
            <Link href="/food-menu#pizza" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                className="sm:w-auto"
              >
                Pizza Menu
              </Button>
            </Link>
            <Link href="/sunday-lunch" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                className="sm:w-auto"
              >
                Sunday Roast Info
              </Button>
            </Link>
          </>
        }
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
          </div>
        }
      />

      {/* Popular Draught & Spirits */}
      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15" id="featured-offers">
        <Container>
          <SectionHeader
            title="Your Favourite Drinks on Tap Near Heathrow"
            subtitle="From Birra Moretti and Stella Artois to Guinness and premium spirits, we pour what travellers and locals ask for most."
          />
          <InfoBoxGrid
            columns={3}
            className="max-w-5xl mx-auto"
            boxes={[
              {
                title: "Birra Moretti & Stella Artois",
                content: (
                  <p className="text-anchor-cream-text/70">
                    Ice-cold Birra Moretti and Stella Artois served properly every day. Popular with airport crew looking for a familiar pint before or after shifts.
                  </p>
                ),
                variant: "colored",
                color: "bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15"
              },
              {
                title: "Guinness & Inch’s Cider",
                content: (
                  <p className="text-anchor-cream-text/70">
                    Pour-perfect Guinness plus Inch&apos;s Medium Apple Cider for those sunny beer garden sessions under the Heathrow flight path.
                  </p>
                ),
                variant: "colored",
                color: "bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15"
              },
              {
                title: "Premium Spirits & Chambord",
                content: (
                  <p className="text-anchor-cream-text/70">
                    Build cocktails with Chambord, Disaronno, Duppy Share rum and plenty of premium spirits. Ask for Baby Guinness shots too.
                  </p>
                ),
                variant: "colored",
                color: "bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15"
              }
            ]}
          />
        </Container>
      </Section>

      {/* Page Title */}
      <Section className="py-8 bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <PageTitle
              seo={{
                structured: true,
                speakable: true
              }}
              className="text-anchor-cream-text mb-4"
            >
              Drinks Menu - Beers, Wines & Spirits
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Explore our extensive selection of draught beers, lagers, premium spirits, wines, and cocktails
            </p>
          </div>
        </Container>
      </Section>

      {/* Quick Links */}
      <Section background="gray" spacing="md">
        <Container>
          <div className="flex flex-wrap justify-center gap-4">
            {menuData.categories.map((category) => (
              <Link
                key={category.id}
                href={`#${category.id}`}
                className="rounded-none bg-anchor-bg-card px-6 py-3 border border-anchor-gold/15 transition-colors hover:border-anchor-gold/30 text-anchor-cream-text"
              >
                {category.title}
              </Link>
            ))}
            <Link
              href="/food-menu#pizza"
              className="rounded-none bg-anchor-bg-card px-6 py-3 border border-anchor-gold/15 transition-colors hover:border-anchor-gold/30 text-anchor-cream-text"
            >
              Pizza Menu
            </Link>
            <Link
              href="/sunday-lunch"
              className="rounded-none bg-anchor-bg-card px-6 py-3 border border-anchor-gold/15 transition-colors hover:border-anchor-gold/30 text-anchor-cream-text"
            >
              Sunday Roast Booking
            </Link>
          </div>
        </Container>
      </Section>

      {/* Your Local After Landing */}
      <Section background="white" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Your Local After Landing - Just 5 Minutes from Heathrow"
            />
            <FeatureGrid
              columns={3}
              features={[
                {
                  icon: "",
                  title: "Airport Staff Haven",
                  description: "Perfect spot for crews and airport workers to unwind after long shifts. Join your colleagues for a well-deserved pint.",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Meeting Point",
                  description: "Picking someone up? Skip expensive airport parking. Meet here for a relaxed drink while they clear customs.",
                  className: "text-center"
                },
                {
                  icon: "",
                  title: "Traveller's Rest",
                  description: "Just landed or about to fly? We're your local. Quick taxi from all terminals, open late, proper British welcome.",
                  className: "text-center"
                }
              ]}
            />
          </div>
        </Container>
      </Section>

      {/* Why The Anchor for Drinks */}
      <Section background="gray" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Stanwell Moor's Premier Drinks Destination"
            />
            <InfoBoxGrid
              columns={2}
              boxes={[
                {
                  title: "The Beer Garden Experience",
                  content: (
                    <>
                      <p className="text-anchor-cream-text/70 mb-4">Stanwell Moor's largest beer garden. Watch planes overhead while enjoying perfectly poured pints in the sunshine. Heated areas and covered sections mean the garden's open year-round.</p>
                      <p className="text-sm text-anchor-cream-text/70">Dog-friendly outdoor areas - bring your four-legged friends!</p>
                    </>
                  ),
                  variant: "default",
                  className: "bg-anchor-bg-card rounded-none p-8 border border-anchor-gold/15"
                },
                {
                  title: "Sports & Atmosphere",
                  content: (
                    <>
                      <p className="text-anchor-cream-text/70 mb-4">Multiple screens showing major sporting events on BBC and ITV. Catch the Six Nations, World Cup, Euros, and other big tournaments with great views from every seat.</p>
                      <p className="text-sm text-anchor-cream-text/70">Big matches get busy - arrive early for the best seats!</p>
                    </>
                  ),
                  variant: "default",
                  className: "bg-anchor-bg-card rounded-none p-8 border border-anchor-gold/15"
                },
                {
                  title: "Local Institution",
                  content: (
                    <>
                      <p className="text-anchor-cream-text/70 mb-4">Serving Stanwell Moor and Staines for generations. Where locals meet, airport workers unwind, and visitors become regulars. Your neighbourhood bar with a global touch.</p>
                      <p className="text-sm text-anchor-cream-text/70">Ask about our locals' card for exclusive offers!</p>
                    </>
                  ),
                  variant: "default",
                  className: "bg-anchor-bg-card rounded-none p-8 border border-anchor-gold/15"
                },
                {
                  title: "Quality & Choice",
                  content: (
                    <>
                      <p className="text-anchor-cream-text/70 mb-4">From draught beers to handcrafted cocktails, we take drinks seriously. Expert bar staff, proper glassware, and drinks served exactly how they should be. No shortcuts.</p>
                      <p className="text-sm text-anchor-cream-text/70">Can't see your favourite? Just ask - we might have it!</p>
                    </>
                  ),
                  variant: "default",
                  className: "bg-anchor-bg-card rounded-none p-8 border border-anchor-gold/15"
                }
              ]}
            />
            
          </div>
        </Container>
      </Section>

      {/* Seasonal Highlights */}
      <Section background="white" className="bg-anchor-bg-raised border-b border-anchor-gold/15" spacing="md">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              title="Drinks for Every Season"
            />
            <FeatureGrid
              columns={4}
              features={[
                {
                  icon: "",
                  title: "Summer",
                  description: "Pimm's jugs, ice-cold lagers, and frozen cocktails in the sun-drenched beer garden",
                  variant: "default",
                  className: "bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15 text-center"
                },
                {
                  icon: "",
                  title: "Autumn",
                  description: "Warming ales, harvest ciders, and our famous hot toddy as the evenings draw in",
                  variant: "default",
                  className: "bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15 text-center"
                },
                {
                  icon: "",
                  title: "Winter",
                  description: "Mulled wine, Bailey's hot chocolate, and hearty stouts by the cosy fire",
                  variant: "default",
                  className: "bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15 text-center"
                },
                {
                  icon: "",
                  title: "Spring",
                  description: "Fresh G&Ts, crisp rosé, and the return of beer garden season",
                  variant: "default",
                  className: "bg-anchor-bg-card rounded-none p-6 border border-anchor-gold/15 text-center"
                }
              ]}
            />
          </div>
        </Container>
      </Section>

      <Section background="white" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Popular Shots & Cocktails Near Heathrow"
            subtitle="Ask the bar team for favourites alongside the full drinks menu."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-dark rounded-none shadow-none">
              <CardBody>
                <h3 className="text-lg font-semibold text-anchor-gold-vivid mb-2">Popular shots at the bar</h3>
                <p className="text-sm text-anchor-cream-text/70 mb-3">
                  Guests regularly order popular shots like Baby Guinness at our Heathrow bar, alongside creamy
                  liqueurs and seasonal specials. Tell us what you like and we will recommend a pour.
                </p>
                <Link
                  href="/drinks/baby-guinness"
                  className="text-sm text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition"
                >
                  Baby Guinness guide →
                </Link>
              </CardBody>
            </Card>
            <Card className="card-dark rounded-none shadow-none">
              <CardBody>
                <h3 className="text-lg font-semibold text-anchor-gold-vivid mb-2">Cocktails, mixers and long drinks</h3>
                <p className="text-sm text-anchor-cream-text/70">
                  Espresso martinis, mojitos and classic G&Ts share the menu with premium spirits and
                  alcohol-free options, perfect for pre-flight meetups or Staines nights out near Heathrow.
                </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Menu Content */}
      <div id="menu">
        <MenuRenderer menuData={menuDataWithoutManagersSpecial} />
      </div>

      {/* Internal Links for SEO */}
      <Section background="white" spacing="md">
        <Container>
          <InternalLinkingSection 
            links={commonLinkGroups.dining}
            className="mx-auto max-w-5xl"
          />
        </Container>
      </Section>

      {/* FAQ Section */}
      <FAQAccordionWithSchema 
        faqs={[
          {
            question: "What beers are on tap at The Anchor?",
            answer: "We have a fantastic selection of draught beers including Birra Moretti, Guinness, Stella Artois, Aspall Cider, Inch's Apple Cider, Fosters and Carlsberg. Our draught selection offers something for every taste, from crisp lagers to rich stouts."
          },
          {
            question: "Do you serve cocktails at The Anchor?",
            answer: "Yes! We have a full cocktail menu featuring classics like Mojitos, Margaritas, Espresso Martinis, and many more. Our skilled bartenders can also make your favourite cocktail on request."
          },
          {
            question: "Where can I find well-kept draught beer near Heathrow?",
            answer: "The Anchor is just 7 minutes from Heathrow and offers an excellent selection of draught beers and premium lagers. We're much better value than airport bars and have a proper pub atmosphere with our beer garden."
          },
          {
            question: "Do you have non-alcoholic drink options?",
            answer: "Absolutely! We offer a full range of soft drinks, mocktails, premium coffee, tea, and non-alcoholic beers. We ensure everyone can enjoy their visit regardless of whether they're drinking alcohol."
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
        className="bg-anchor-bg"
      />

      {/* CTA Section */}
      <Section className="bg-gradient-to-br from-anchor-green to-anchor-green/90 py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Join Us for a Drink
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Book ahead for stone-baked pizzas, Sunday roast or a post-flight celebration with pints and cocktails.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookTableButton
                source="drinks_page_cta"
                size="lg"
                variant="secondary"
                fullWidth
                className="w-full sm:w-auto bg-white text-anchor-green hover:bg-gray-100"
              >
                Reserve a Table
              </BookTableButton>
              <Link href="tel:+441753682707" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" fullWidth className="sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  Call Us
                </Button>
              </Link>
              <Link href="/food-menu#pizza" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" fullWidth className="sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  Pizza Menu
                </Button>
              </Link>
              <Link href="/sunday-lunch" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" fullWidth className="sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  Sunday Roast Info
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}

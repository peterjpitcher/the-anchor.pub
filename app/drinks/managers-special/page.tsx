import { Metadata } from 'next'
import Image from 'next/image'
import { Button, Card, CardBody, Badge, SectionHeading } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { CtaBand } from '@/components/CtaBand'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { MenuPageTracker } from '@/components/tracking/MenuPageTracker'
import { PhoneButton } from '@/components/PhoneButton'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_DRINKS_IMAGE } from '@/lib/image-fallbacks'
import {
  getCurrentPromotion as getCurrentManagersSpecial,
  getPromotionById,
  getPromotionImage
} from '@/lib/managers-special'
import { getDrinksHeroImage } from '@/lib/drinks-hero-image'
import type { ManagersSpecial } from '@/types/managers-special'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const dynamic = 'force-dynamic'

type PageSearchParams = {
  preview?: string | string[]
  token?: string | string[]
  date?: string | string[]
}

function formatDateLong(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00Z`)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatPriceGBP(value: string): string {
  const numeric = Number(value.replace(/[£\s]/g, ''))
  if (!Number.isFinite(numeric)) return value
  return `£${numeric.toFixed(2)}`
}

type ManagerEducation = NonNullable<ManagersSpecial['education']>

function getEducation(promotion: ManagersSpecial): ManagerEducation {
  if (promotion.education) return promotion.education

  const { spirit } = promotion
  return {
    story: spirit.longDescription || spirit.description || promotion.promotion.offerText,
    whyPicked: `We picked ${spirit.name} because it gives guests a clear way into ${spirit.category.toLowerCase()} without needing to know the back bar inside out.`,
    flavourProfile: spirit.tastingNotes?.join(', ') || spirit.description || 'Ask the bar team for the flavour profile.',
    perfectServe: spirit.servingSuggestions?.[0] || 'Ask the bar team for the best serve.',
    foodPairings: [
      'Stone-baked pizza',
      'Salty bar snacks',
      'A relaxed drink before or after food'
    ],
    tryIfYouLike: [
      spirit.category,
      'Trying something new without buying a full bottle',
      'Asking the bar team for a recommendation'
    ],
    barTeamTip: 'Start with the simplest serve first. Once you know the flavour, it is easier to decide whether you want it longer, drier or sweeter.',
    glossary: [
      {
        term: spirit.category,
        definition: `The drink style for this month's special. Ask the bar team how it differs from similar bottles on the shelf.`
      }
    ]
  }
}

function resolvePromotion(searchParams: PageSearchParams = {}): { promotion: ManagersSpecial | null; mode: 'live' | 'preview' | 'time-travel' } {
  const previewId = Array.isArray(searchParams.preview) ? searchParams.preview[0] : searchParams.preview
  const token = Array.isArray(searchParams.token) ? searchParams.token[0] : searchParams.token
  const overrideDate = Array.isArray(searchParams.date) ? searchParams.date[0] : searchParams.date

  const expectedToken = process.env.MS_PREVIEW_TOKEN
  const tokenMatches = expectedToken ? token === expectedToken : process.env.NODE_ENV !== 'production'

  if (previewId && token && tokenMatches) {
    const previewPromotion = getPromotionById(previewId)
    if (previewPromotion) {
      return { promotion: previewPromotion, mode: 'preview' }
    }
  }

  if (overrideDate && process.env.NODE_ENV !== 'production') {
    const parsedDate = new Date(`${overrideDate}T12:00:00Z`)
    if (!Number.isNaN(parsedDate.valueOf())) {
      const futurePromotion = getCurrentManagersSpecial(parsedDate)
      if (futurePromotion) {
        return { promotion: futurePromotion, mode: 'time-travel' }
      }
    }
  }

  return { promotion: getCurrentManagersSpecial(), mode: 'live' }
}

// This function runs at build time and request time
export async function generateMetadata({ searchParams }: { searchParams: PageSearchParams }): Promise<Metadata> {
  const { promotion: currentPromotion, mode } = resolvePromotion(searchParams)
  const canonical = '/drinks/managers-special'
  const shouldNoIndex = mode !== 'live'

  if (!currentPromotion) {
    const title = "Manager's Special"
    const description = "Enjoy 25% off a different featured spirit each month at The Anchor near Heathrow. Ask at the bar for today's special price and tasting notes."

    return {
      title,
      description,
      alternates: {
        canonical
      },
      robots: shouldNoIndex
        ? {
            index: false,
            follow: false,
            googleBot: {
              index: false,
              follow: false,
            },
          }
        : undefined,
      openGraph: {
        title,
        description,
        images: [{ url: DEFAULT_DRINKS_IMAGE, width: 1200, height: 630, alt: 'Drinks menu at The Anchor pub near Heathrow' }],
      },
      twitter: getTwitterMetadata({
        title,
        description,
        images: [DEFAULT_DRINKS_IMAGE],
      })
    }
  }

  const { promotion } = currentPromotion
  const description = promotion.metaDescription || currentPromotion.spirit.description || promotion.offerText
  const openGraphImage = getPromotionImage(currentPromotion.imageFolder) || DEFAULT_DRINKS_IMAGE

  return {
    title: promotion.metaTitle || `Manager's Special - ${currentPromotion.spirit.name}`,
    description,
    alternates: {
      canonical
    },
    robots: shouldNoIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : undefined,
    openGraph: {
      title: promotion.metaTitle || `Manager's Special - ${currentPromotion.spirit.discount} ${currentPromotion.spirit.name}`,
      description,
      images: [openGraphImage],
    },
    twitter: getTwitterMetadata({
      title: promotion.metaTitle || `Manager's Special - ${currentPromotion.spirit.discount} ${currentPromotion.spirit.name}`,
      description: description || '',
      images: [openGraphImage]
    })
  }
}

export default function ManagersSpecialPage({ searchParams }: { searchParams: PageSearchParams }) {
  const { promotion: currentPromotion } = resolvePromotion(searchParams)
  const drinksHeroImage = getDrinksHeroImage()

  if (!currentPromotion) {
    const fallbackFaqs = [
      {
        question: "What is the Manager's Special?",
        answer: "Each month, we pick one standout premium spirit and take 25% off every serve. It’s our way of giving back to the community that keeps The Anchor feeling like home."
      },
      {
        question: "Why do you run it?",
        answer: "To make it easier for everyone to try our best bottles at pub prices, whether you’re a regular, visiting from nearby, or stopping off after Heathrow."
      },
      {
        question: "When does it change?",
        answer: "The offer refreshes every month. We keep the next bottle under wraps and reveal the active special on the 1st."
      },
      {
        question: "How do I get the offer?",
        answer: "Just ask at the bar. It’s available all month during normal opening hours, subject to availability. Challenge 25 applies."
      }
    ]

    return (
      <>
        <MenuPageTracker menuType="managers_special" />
        <InteriorHero
          image={drinksHeroImage.src}
          focal="center center"
          crumb="Manager's Special"
          title="Manager's Special"
          lead="25% off a featured spirit each month, our way of giving back, and a great excuse to try something new."
        />
        <section className="bg-canvas py-section-y">
          <div className="container">
            <div className="mx-auto flex flex-col items-center gap-6 text-center">
              <PageTitle className="text-ink-strong" seo={{ structured: true }}>
                Manager&apos;s Special at The Anchor
              </PageTitle>
              <p className="text-lg text-ink-muted">
                Each month we hand-pick one premium spirit and take 25% off every serve. It&apos;s a simple way to share
                the best of our back bar with the people who support us, and to help everyone discover something new.
              </p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link href="/drinks" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" fullWidth>
                    Explore Drinks
                  </Button>
                </Link>
                <Link href="/whats-on" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" fullWidth>
                    See What&apos;s On
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface py-section-y" id="why">
          <div className="container">
            <div className="mx-auto grid gap-10 md:grid-cols-2 md:gap-12">
              <div>
                <h2 className="text-h3 text-ink-strong">Why we do it</h2>
                <p className="mt-4 text-lg text-ink-muted">
                  The Anchor has always been about good value, good company and doing right by our locals. The Manager&apos;s Special is a monthly thank-you: a way to give back, keep things interesting, and make premium spirits feel accessible.
                </p>
                <ul className="mt-6 space-y-3 text-ink-muted">
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-anchor-gold" aria-hidden="true" />
                    <span>Give back to our community with a proper discount on a standout bottle.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-anchor-gold" aria-hidden="true" />
                    <span>Help everyone explore new flavours without committing to a full bottle.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-anchor-gold" aria-hidden="true" />
                    <span>Showcase what we love from the top shelf, with simple, great serves at the bar.</span>
                  </li>
                </ul>
              </div>
              <Card accent>
                <CardBody className="md:p-8">
                  <h3 className="text-h4 text-ink-strong">How it works</h3>
                  <ol className="mt-5 space-y-4 text-ink-muted">
                    <li className="flex gap-3">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-anchor-green text-white font-bold">1</span>
                      <span>We pick one premium spirit for the month.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-anchor-green text-white font-bold">2</span>
                      <span>Every serve of that bottle is 25% off for the whole month.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-anchor-green text-white font-bold">3</span>
                      <span>Ask the bar team for the best serve, tasting notes and garnish.</span>
                    </li>
                  </ol>
                  <p className="mt-6 text-sm text-ink-muted">
                    Subject to availability. Challenge 25 applies. Doubles available at standard bar pricing.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>

        <FAQAccordionWithSchema
          title="Manager's Special FAQs"
          faqs={fallbackFaqs}
        />
      </>
    )
  }

  const { spirit, promotion } = currentPromotion
  const dynamicImagePath = getPromotionImage(currentPromotion.imageFolder)
  const education = getEducation(currentPromotion)

  const promotionMonthDate = new Date(`${currentPromotion.startDate}T12:00:00Z`)
  const promotionMonthName = promotionMonthDate.toLocaleDateString('en-GB', { month: 'long' })
  const promotionMonthYearLabel = promotionMonthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const offerEndsLabel = formatDateLong(currentPromotion.endDate)

  const specialPriceLabel = formatPriceGBP(spirit.specialPrice)
  const originalPriceLabel = formatPriceGBP(spirit.originalPrice)
  const savingsLabel = spirit.discount.replace(/\s*OFF\s*/i, '').trim()

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": spirit.name,
    "description": spirit.longDescription || spirit.description || promotion.offerText,
    "brand": {
      "@type": "Brand",
      "name": spirit.distillery
    },
    "image": `https://www.the-anchor.pub${dynamicImagePath || DEFAULT_DRINKS_IMAGE}`,
    "offers": {
      "@type": "Offer",
      "url": "https://www.the-anchor.pub/drinks/managers-special",
      "priceCurrency": "GBP",
      "price": spirit.specialPrice.replace(/[£\s]/g, ''),
      "priceValidUntil": currentPromotion.endDate,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "BarOrPub",
        "name": "The Anchor",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Horton Road",
          "addressLocality": "Stanwell Moor",
          "addressRegion": "Surrey",
          "postalCode": "TW19 6AQ"
        }
      }
    }
  }

  const faqs = [
    {
      question: "What is the Manager's Special?",
      answer: "Each month, we pick one standout premium spirit and take 25% off every serve. It’s our way of giving back to the community that keeps The Anchor feeling like home."
    },
    {
      question: "What’s this month’s offer?",
      answer: `${spirit.discount} off ${spirit.name} all ${promotionMonthName}. Singles are £${spirit.specialPrice} (was £${spirit.originalPrice}).`
    },
    {
      question: "Do I need to book to get the offer?",
      answer: "No booking is required for drinks. If you’re planning to eat as well, booking a table is recommended - especially on weekends."
    },
    {
      question: "When does it change?",
      answer: "The special refreshes on the 1st of each month. We only show the current bottle, so next month stays a surprise until it is live."
    },
    {
      question: "Any terms?",
      answer: "Subject to availability. Discount applies to serves of the featured bottle. Challenge 25 applies."
    }
  ]

  return (
    <>
      <MenuPageTracker
        menuType="managers_special"
        specialOffers={[
          `${spirit.discount} ${spirit.name} - Valid until ${offerEndsLabel}`
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([productSchema]) }}
      />

      <InteriorHero
        image={drinksHeroImage.src}
        focal="center center"
        crumb="Manager's Special"
        kicker={`Manager's Special · ${promotionMonthYearLabel}`}
        title={`${spirit.discount} ${spirit.name}`}
        lead={`${promotion.subheadline || education.flavourProfile} ${promotion.offerText}. Single measures are ${specialPriceLabel} throughout ${promotionMonthName}, subject to availability.`}
        badges={
          <>
            <Badge variant="sand">{spirit.category}</Badge>
            <Badge variant="sand">{specialPriceLabel} single</Badge>
            <Badge variant="sand">Was {originalPriceLabel}</Badge>
          </>
        }
        actions={
          <>
            <BookTableButton
              source="managers_special_hero"
              variant="primary"
              size="lg"
              fullWidth
            />
            <Link href="/drinks" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" fullWidth>
                View Drinks Menu
              </Button>
            </Link>
          </>
        }
      />

      <section className="bg-canvas py-section-y">
        <div className="container">
          <PageTitle
            className="text-center text-ink-strong"
            seo={{ structured: true }}
          >
            {promotionMonthName}&apos;s Product of the Month: {spirit.name}
          </PageTitle>
          <p className="mx-auto mt-4 text-center text-lg text-ink-muted">
            The Manager&apos;s Special is not just a discount sticker on a bottle. Each month we pick one spirit, explain what makes it interesting, and give you a simple way to try it properly at the bar.
          </p>
        </div>
      </section>

      <section className="bg-surface py-section-y">
        <div className="container">
          <div id="details" className="mx-auto grid gap-10 lg:grid-cols-[minmax(0,0.95fr),minmax(0,1.05fr)] lg:items-start lg:gap-14">
            <div className="space-y-6">
              <div className="overflow-hidden rounded-md border border-line bg-surface p-3 shadow-lg">
                <div className="relative aspect-square overflow-hidden rounded-sm bg-surface-sunk">
                  <Image
                    src={dynamicImagePath || DEFAULT_DRINKS_IMAGE}
                    alt={promotion.heroAlt || `${spirit.name} Manager's Special at The Anchor`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover object-center"
                    priority={false}
                  />
                </div>
              </div>

              {/* Light pricing card (replaces dark PricingCard) */}
              <Card accent>
                <CardBody className="text-center">
                  <h3 className="text-h4 text-ink-strong">Single Measure</h3>
                  <p className="mt-1 text-sm text-ink-muted">25ml</p>
                  <div className="mt-4">
                    <div className="font-display text-4xl text-accent-text">{specialPriceLabel}</div>
                    <div className="text-lg text-ink-muted line-through">{originalPriceLabel}</div>
                  </div>
                  <div className="mt-3">
                    <Badge variant="gold">{savingsLabel} off</Badge>
                  </div>
                </CardBody>
              </Card>
              <p className="text-center text-sm text-ink-muted">
                Doubles available at standard bar pricing. Subject to availability. Challenge 25 applies.
              </p>
            </div>

            <div>
              <SectionHeading
                align="left"
                kicker="Learn the bottle"
                title={`What makes ${spirit.name} worth trying?`}
              />
              <p className="text-lg leading-relaxed text-ink-muted">
                {education.story}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Card accent>
                  <CardBody>
                    <h3 className="text-h4 text-ink-strong">Why we picked it</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted">{education.whyPicked}</p>
                  </CardBody>
                </Card>
                <Card accent>
                  <CardBody>
                    <h3 className="text-h4 text-ink-strong">What to taste for</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted">{education.flavourProfile}</p>
                  </CardBody>
                </Card>
              </div>

              <Card accent className="mt-8">
                <CardBody>
                  <h3 className="text-h4 text-ink-strong">Best first serve</h3>
                  <p className="mt-3 text-ink-muted">{education.perfectServe}</p>
                  <p className="mt-5 border-l-4 border-line-gold pl-4 text-sm italic text-ink-muted">
                    Bar team tip: {education.barTeamTip}
                  </p>
                </CardBody>
              </Card>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <BookTableButton
                  source="managers_special_details"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                />
                <Link href="/drinks" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" fullWidth>
                    See the Full Bar
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-canvas py-section-y">
        <div className="container">
          <div className="mx-auto">
            <SectionHeading
              align="left"
              kicker="Tasting guide"
              title="How to get more from the glass"
              lead="You do not need to be a spirits expert. Use these notes to decide whether this month's bottle suits your taste."
            />

            <div className="mt-2 grid gap-6 lg:grid-cols-3">
              <Card accent>
                <CardBody>
                  <h3 className="text-h4 text-ink-strong">Pairs well with</h3>
                  <ul className="mt-5 space-y-3 text-ink-muted">
                    {education.foodPairings.map((pairing) => (
                      <li key={pairing} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-anchor-gold" aria-hidden="true" />
                        <span>{pairing}</span>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>

              <Card accent>
                <CardBody>
                  <h3 className="text-h4 text-ink-strong">Try it if you like</h3>
                  <ul className="mt-5 space-y-3 text-ink-muted">
                    {education.tryIfYouLike.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-anchor-gold" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>

              <Card accent>
                <CardBody>
                  <h3 className="text-h4 text-ink-strong">Useful words</h3>
                  <div className="mt-5 space-y-4">
                    {education.glossary.map((item) => (
                      <div key={item.term}>
                        <p className="font-semibold text-accent-text">{item.term}</p>
                        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.definition}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-section-y" id="why">
        <div className="container">
          <div className="mx-auto grid gap-10 md:grid-cols-2 md:gap-12">
            <div>
              <h2 className="text-h3 text-ink-strong">Why we do it</h2>
              <p className="mt-4 text-lg text-ink-muted">
                The Anchor is a community pub at heart. The Manager&apos;s Special is our monthly thank-you, a way to share premium spirits at a price that feels fair, and to keep the back bar fun for everyone.
              </p>
              <ul className="mt-6 space-y-3 text-ink-muted">
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-anchor-gold" aria-hidden="true" />
                  <span>Give back to our locals with a proper discount on a standout bottle.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-anchor-gold" aria-hidden="true" />
                  <span>Make it easy to try something premium without committing to a full bottle.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-anchor-gold" aria-hidden="true" />
                  <span>Showcase the best of our spirits range at genuine pub prices.</span>
                </li>
              </ul>
            </div>
            <Card accent>
              <CardBody className="md:p-8">
                <h3 className="text-h4 text-ink-strong">How it works</h3>
                <ol className="mt-5 space-y-4 text-ink-muted">
                  <li className="flex gap-3">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-anchor-green text-white font-bold">1</span>
                    <span>We pick one premium spirit for the month.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-anchor-green text-white font-bold">2</span>
                    <span>Every serve of that bottle is 25% off for the whole month.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-anchor-green text-white font-bold">3</span>
                    <span>Ask the bar team for the best serve, tasting notes and garnish.</span>
                  </li>
                </ol>
                <p className="mt-6 text-sm text-ink-muted">
                  No memberships, no vouchers, no happy-hour window, just one great bottle, all month.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      <FAQAccordionWithSchema
        title="Manager's Special FAQs"
        faqs={faqs}
      />

      <CtaBand
        title="Try it while it is the bottle of the month"
        copy={`${spirit.discount} off ${spirit.name} all ${promotionMonthName}. Ask the bar team for the serve above, or tell us what you normally drink and we'll steer you.`}
      >
        <BookTableButton
          source="managers_special_cta"
          variant="primary"
          size="lg"
        />
        <PhoneButton
          phone="01753 682707"
          source="managers_special_cta"
          variant="outline"
          size="lg"
        >
          01753 682707
        </PhoneButton>
        <Link href="/find-us">
          <Button variant="outline" size="lg">
            Get Directions
          </Button>
        </Link>
      </CtaBand>

      <section className="bg-canvas py-6">
        <div className="container">
          <p className="text-center text-sm text-ink-muted">Offer valid until {offerEndsLabel}</p>
        </div>
      </section>
    </>
  )
}

import { Metadata } from 'next'
import { Button, Section, FullWidthSection } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import Link from 'next/link'
import { PricingCard } from '@/components/PricingCard'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { MenuPageTracker } from '@/components/tracking/MenuPageTracker'
import { PhoneButton } from '@/components/PhoneButton'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { getPromotionImage } from '@/lib/managers-special-utils'
import { DEFAULT_DRINKS_IMAGE } from '@/lib/image-fallbacks'
import { getCurrentPromotion as getCurrentManagersSpecial, getNextPromotion, getPromotionById } from '@/lib/managers-special'
import { nowInLondonComponents } from '@/lib/time-london'
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

function formatNextCountdown(daysUntil: number | null): string | null {
  if (daysUntil === null) return null
  if (daysUntil <= 0) return 'Next month starts today'
  if (daysUntil === 1) return 'Next month starts tomorrow'
  return `Next month starts in ${daysUntil} days`
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
    keywords: `${currentPromotion.spirit.name.toLowerCase()} offer, monthly drinks specials near heathrow, premium spirit deals stanwell moor, pub offers staines`,
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
  const { year, month, day } = nowInLondonComponents()
  const today = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const toUtcMidnightMs = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }

  const nextPromotion = getNextPromotion()
  const daysUntilNext = nextPromotion
    ? Math.max(0, Math.ceil((toUtcMidnightMs(nextPromotion.startDate) - toUtcMidnightMs(today)) / (1000 * 60 * 60 * 24)))
    : null
  const nextCountdownLabel = formatNextCountdown(daysUntilNext)
  
  if (!currentPromotion) {
    const fallbackFaqs = [
      {
        question: "What is the Manager's Special?",
        answer: "Each month, we pick one standout premium spirit and take 25% off every serve. It’s our way of giving back to the community that keeps The Anchor feeling like home."
      },
      {
        question: "Why do you run it?",
        answer: "To make it easier for everyone to try our best bottles at pub prices — whether you’re a regular, visiting from nearby, or stopping off after Heathrow."
      },
      {
        question: "When does it change?",
        answer: "The offer refreshes every month. We keep next month’s bottle under wraps — check back on the 1st for the reveal."
      },
      {
        question: "How do I get the offer?",
        answer: "Just ask at the bar. It’s available all month during normal opening hours, subject to availability. Challenge 25 applies."
      }
    ]

    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Drinks Menu', url: '/drinks' },
      { name: "Manager's Special", url: '/drinks/managers-special' }
    ])

    return (
      <>
        <MenuPageTracker menuType="managers_special" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([breadcrumbSchema]) }}
        />
        <HeroWrapper
          route="/drinks/managers-special"
          title="Manager's Special"
          description="25% off a featured spirit each month — our way of giving back, and a great excuse to try something new."
         
          showStatusBar
          statusBarPosition="below"
          tags={[
            { label: '25% off featured spirit', variant: 'primary' as const },
            { label: 'Updated monthly', variant: 'default' as const }
          ]}
          breadcrumbs={[
            { name: 'Drinks', href: '/drinks' },
            { name: "Manager's Special" }
          ]}
          primaryCta={(
            <BookTableButton
              source="managers_special_hero"
              variant="secondary"
              size="lg"
              className="w-full bg-white text-purple-700 hover:bg-gray-100 sm:w-auto"
            />
          )}
          secondaryCta={(
            <Link href="/drinks">
              <Button
                variant="secondary"
                size="lg"
                className="w-full bg-white/10 text-white hover:bg-white/20 sm:w-auto"
              >
                View Drinks Menu
              </Button>
            </Link>
          )}
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
        <Section spacing="md" container className="bg-anchor-bg border-b border-anchor-gold/15">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <PageTitle className="text-anchor-gold-vivid" seo={{ structured: true }}>
              Manager&apos;s Special at The Anchor
            </PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              Each month we hand-pick one premium spirit and take 25% off every serve. It&apos;s a simple way to share
              the best of our back bar with the people who support us — and to help everyone discover something new.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/drinks">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore Drinks
                </Button>
              </Link>
              <Link href="/whats-on">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  See What&apos;s On
                </Button>
              </Link>
            </div>
          </div>
        </Section>

        <FullWidthSection className="bg-gradient-to-r from-anchor-green to-emerald-800 py-12 md:py-16">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                Next Month&apos;s Reveal
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                {nextCountdownLabel || "Coming soon"}
              </h2>
              <p className="mt-4 text-white/90">
                We keep the next bottle under wraps to build anticipation. Check back on the 1st for the reveal.
              </p>
            </div>
          </div>
        </FullWidthSection>

        <Section spacing="lg" container className="bg-anchor-bg-raised border-b border-anchor-gold/15" id="why">
          <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-12">
            <div>
              <h2 className="text-3xl font-bold text-anchor-cream-text">Why we do it</h2>
              <p className="mt-4 text-lg text-anchor-cream-text/70">
                The Anchor has always been about good value, good company and doing right by our locals. The Manager&apos;s Special is a monthly thank-you: a way to give back, keep things interesting, and make premium spirits feel accessible.
              </p>
              <ul className="mt-6 space-y-3 text-anchor-cream-text/70">
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
                  <span>Showcase what we love from the top shelf — with simple, great serves at the bar.</span>
                </li>
              </ul>
            </div>
            <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-6 shadow-sm md:p-8">
              <h3 className="text-xl font-bold text-anchor-cream-text">How it works</h3>
              <ol className="mt-5 space-y-4 text-anchor-cream-text/70">
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-anchor-bg text-anchor-gold-vivid font-bold">
                    1
                  </span>
                  <span>We pick one premium spirit for the month.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-anchor-bg text-anchor-gold-vivid font-bold">
                    2
                  </span>
                  <span>Every serve of that bottle is 25% off for the whole month.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-anchor-bg text-anchor-gold-vivid font-bold">
                    3
                  </span>
                  <span>Ask the bar team for the best serve, tasting notes and garnish.</span>
                </li>
              </ol>
              <p className="mt-6 text-sm text-anchor-cream-text/55">
                Subject to availability. Challenge 25 applies. Doubles available at standard bar pricing.
              </p>
            </div>
          </div>
        </Section>

        <Section spacing="lg" container className="bg-anchor-bg">
          <FAQAccordionWithSchema
            title="Manager's Special FAQs"
            faqs={fallbackFaqs}
            className="bg-anchor-bg"
          />
        </Section>
      </>
    )
  }
  
  const { spirit, promotion } = currentPromotion
  const dynamicImagePath = getPromotionImage(currentPromotion.imageFolder)

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Drinks Menu', url: '/drinks' },
    { name: "Manager's Special", url: '/drinks/managers-special' }
  ])

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
	      "price": spirit.specialPrice.replace(/[\u00A3\s]/g, ''),
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
      answer: "The special refreshes every month. We keep next month’s bottle under wraps — check back on the 1st for the reveal."
    },
    {
      question: "Any terms?",
      answer: "Subject to availability. Discount applies to serves of the featured bottle. Challenge 25 applies."
    }
  ]

  const heroTags = [
    { label: '25% off this month', variant: 'primary' as const },
    { label: `Valid until ${offerEndsLabel}`, variant: 'default' as const },
    ...(spirit.abv ? [{ label: spirit.abv, variant: 'default' as const }] : []),
    ...(spirit.origin ? [{ label: spirit.origin, variant: 'default' as const }] : [])
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
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([productSchema, breadcrumbSchema]) }}
      />
      
      <HeroWrapper
        route="/drinks/managers-special"
        title={`${spirit.discount} ${spirit.name}`}
        description={promotion.subheadline || promotion.offerText}
       
        showStatusBar
        statusBarPosition="below"
        tags={heroTags}
        eyebrow={`Manager's Special · ${promotionMonthYearLabel}`}
        breadcrumbs={[
          { name: 'Drinks', href: '/drinks' },
          { name: "Manager's Special" }
        ]}
        primaryCta={
          <BookTableButton
            source="managers_special_hero"
            variant="secondary"
            size="lg"
            className="bg-white text-purple-700 hover:bg-gray-100 w-full sm:w-auto"
          />
        }
        secondaryCta={
          <>
            <Link href="#why">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm w-full sm:w-auto"
              >
                Why We Do It
              </Button>
            </Link>
            <PhoneButton
              phone="01753 682707"
              variant="secondary"
              size="lg"
              className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm w-full sm:w-auto"
              source="managers_special_hero"
            />
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

      <Section spacing="sm" container className="bg-anchor-bg border-b border-anchor-gold/15">
        <PageTitle
          className="text-center text-anchor-gold-vivid"
          seo={{ structured: true }}
        >
          Manager&apos;s Special — {promotionMonthName}
        </PageTitle>
        <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-anchor-cream-text/70">
          Every month we hand-pick one premium spirit and take 25% off every serve. It&apos;s a simple way to give back to our community — and make it easy for everyone to try the best of our back bar.
        </p>
      </Section>

      <Section spacing="lg" container className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:items-start md:gap-12">
          <div>
            <h2 className="text-3xl font-bold text-anchor-cream-text">This month&apos;s featured bottle</h2>
            <p className="mt-4 text-lg text-anchor-cream-text/70">
              <span className="font-semibold text-anchor-cream-text">{spirit.name}</span>
              {spirit.description || promotion.offerText ? ` — ${spirit.description || promotion.offerText}` : null}
            </p>
            <p className="mt-4 text-anchor-cream-text/70">
              Ask at the bar for the best serve and tasting notes. The discount applies to every serve of this bottle all month, while stocks last.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/drinks" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Drinks Menu
                </Button>
              </Link>
              <Link href="#why" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Why We Do It
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-6 shadow-sm md:p-8">
            <PricingCard
              title="Single Measure"
              volume="25ml"
              currentPrice={specialPriceLabel}
              originalPrice={originalPriceLabel}
              savings={savingsLabel}
              featured={true}
            />
            <p className="mt-4 text-center text-sm text-anchor-cream-text/55">
              Doubles available at standard bar pricing • Subject to availability • Challenge 25 applies
            </p>
          </div>
        </div>
      </Section>

      <FullWidthSection className="bg-gradient-to-r from-anchor-green to-emerald-800 py-12 md:py-16">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Next Month&apos;s Reveal
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
              {nextCountdownLabel || "Coming soon"}
            </h2>
            <p className="mt-4 text-white/90">
              We keep the next bottle under wraps to build anticipation. Check back on the 1st for the reveal.
            </p>
          </div>
        </div>
      </FullWidthSection>

      <Section spacing="lg" container className="bg-anchor-bg-raised border-b border-anchor-gold/15" id="why">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-12">
          <div>
            <h2 className="text-3xl font-bold text-anchor-cream-text">Why we do it</h2>
            <p className="mt-4 text-lg text-anchor-cream-text/70">
              The Anchor is a community pub at heart. The Manager&apos;s Special is our monthly thank-you — a way to share premium spirits at a price that feels fair, and to keep the back bar fun for everyone.
            </p>
            <ul className="mt-6 space-y-3 text-anchor-cream-text/70">
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
          <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-card p-6 shadow-sm md:p-8">
            <h3 className="text-xl font-bold text-anchor-cream-text">How it works</h3>
            <ol className="mt-5 space-y-4 text-anchor-cream-text/70">
              <li className="flex gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-anchor-bg text-anchor-gold-vivid font-bold">
                  1
                </span>
                <span>We pick one premium spirit for the month.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-anchor-bg text-anchor-gold-vivid font-bold">
                  2
                </span>
                <span>Every serve of that bottle is 25% off for the whole month.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-anchor-bg text-anchor-gold-vivid font-bold">
                  3
                </span>
                <span>Ask the bar team for the best serve, tasting notes and garnish.</span>
              </li>
            </ol>
            <p className="mt-6 text-sm text-anchor-cream-text/55">
              No memberships, no vouchers, no happy-hour window — just one great bottle, all month.
            </p>
          </div>
        </div>
      </Section>

      <Section spacing="lg" container className="bg-anchor-bg">
        <FAQAccordionWithSchema
          title="Manager's Special FAQs"
          faqs={faqs}
          className="bg-anchor-bg"
        />
      </Section>

      <FullWidthSection className="bg-gradient-to-br from-purple-600 to-purple-800 py-16 md:py-24">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-5xl">
              Come try this month&apos;s Manager&apos;s Special
            </h2>
            <p className="mt-6 text-xl text-purple-100">
              {spirit.discount} off {spirit.name} all {promotionMonthName}. Ask at the bar for the perfect serve.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <BookTableButton
                source="managers_special_cta"
                size="lg"
                variant="secondary"
                className="bg-white text-purple-700 hover:bg-gray-100"
              />
              <Link href="/find-us">
                <Button size="lg" variant="secondary" className="bg-purple-700 text-white hover:bg-purple-600">
                  Get Directions
                </Button>
              </Link>
              <PhoneButton
                phone="01753 682707"
                size="lg"
                variant="secondary"
                className="bg-purple-700 text-white hover:bg-purple-600"
                source="managers_special_cta"
              />
            </div>
            <p className="mt-6 text-purple-200">
              Offer valid until {offerEndsLabel}
            </p>
          </div>
        </div>
      </FullWidthSection>
    </>
  )
}

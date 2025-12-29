import { Metadata } from 'next'
import Image from 'next/image'
import { Button, Section, FullWidthSection } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import Link from 'next/link'
import { PricingCard } from '@/components/PricingCard'
import { ProductDetails } from '@/components/ProductDetails'
import { BotanicalsGrid } from '@/components/BotanicalsGrid'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { MenuPageTracker } from '@/components/tracking/MenuPageTracker'
import { PhoneButton } from '@/components/PhoneButton'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { getPromotionImage } from '@/lib/managers-special-utils'
import { DEFAULT_DRINKS_IMAGE } from '@/lib/image-fallbacks'
import { getCurrentPromotion as getCurrentManagersSpecial, getPromotionById } from '@/lib/managers-special'
import type { ManagersSpecial } from '@/types/managers-special'

export const dynamic = 'force-dynamic'

type PageSearchParams = {
  preview?: string | string[]
  token?: string | string[]
  date?: string | string[]
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
  const { promotion: currentPromotion } = resolvePromotion(searchParams)
  
  if (!currentPromotion) {
    return {
      title: "Manager's Special | The Anchor - Heathrow Pub & Dining",
      description: "Check back soon for our latest Manager's Special offers at The Anchor.",
    }
  }

  const { promotion } = currentPromotion
  
  return {
    title: promotion.metaTitle || `Manager's Special - ${currentPromotion.spirit.name} | The Anchor - Heathrow Pub & Dining`,
    description: promotion.metaDescription || currentPromotion.spirit.description || promotion.offerText,
    keywords: `${currentPromotion.spirit.name.toLowerCase()} offer, gin promotion stanwell moor, pub drinks special heathrow`,
    openGraph: {
      title: promotion.metaTitle || `Manager's Special - ${currentPromotion.spirit.discount} ${currentPromotion.spirit.name}`,
      description: promotion.metaDescription || currentPromotion.spirit.description || promotion.offerText,
      images: [getPromotionImage(currentPromotion.imageFolder) || DEFAULT_DRINKS_IMAGE],
    },
    twitter: getTwitterMetadata({
      title: promotion.metaTitle || `Manager's Special - ${currentPromotion.spirit.discount} ${currentPromotion.spirit.name}`,
      description: promotion.metaDescription || currentPromotion.spirit.description || promotion.offerText || '',
      images: [getPromotionImage(currentPromotion.imageFolder) || DEFAULT_DRINKS_IMAGE]
    })
  }
}

export default function ManagersSpecialPage({ searchParams }: { searchParams: PageSearchParams }) {
  const { promotion: currentPromotion } = resolvePromotion(searchParams)
  
  if (!currentPromotion) {
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <HeroWrapper
          route="/drinks/managers-special"
          title="Manager's Special"
          description="Our monthly drink offer is being refreshed. Check back soon, or explore the full drinks menu today."
          variant="promo"
          tags={[
            { label: 'New offer coming soon', variant: 'primary' as const },
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
        />
        <Section spacing="md" container className="bg-white">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <PageTitle className="text-purple-700" seo={{ structured: true }}>
              Manager&apos;s Special at The Anchor
            </PageTitle>
            <p className="text-lg text-gray-700">
              We&apos;re curating the next spirit feature. In the meantime, explore
              our full drinks selection or see what&apos;s on this month.
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
      </>
    )
  }
  
  const { spirit, promotion } = currentPromotion
  const spiritName = spirit.name.toLowerCase()
  const isBotanist = spiritName.includes('botanist')
  const isWarners = spiritName.includes('warners')
  const isRedleg = spiritName.includes('redleg')
  const isHennessy = spiritName.includes('hennessy')
  const isChaseSloe = spiritName.includes('chase') && spiritName.includes('sloe')
  const dynamicImagePath = getPromotionImage(currentPromotion.imageFolder)

  const promotionMonthName = new Date(currentPromotion.startDate).toLocaleDateString('en-GB', {
    month: 'long'
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Drinks Menu', url: '/drinks' },
    { name: "Manager's Special", url: '/drinks/managers-special' }
  ])

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": spirit.name,
    "description": spirit.longDescription,
    "brand": {
      "@type": "Brand",
      "name": spirit.distillery
    },
    "image": `https://www.the-anchor.pub${dynamicImagePath || DEFAULT_DRINKS_IMAGE}`,
    "offers": {
      "@type": "Offer",
      "url": "https://www.the-anchor.pub/drinks/managers-special",
      "priceCurrency": "GBP",
      "price": spirit.specialPrice.replace('£', ''),
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

  const faqs = isBotanist ? [
    {
      question: "What makes The Botanist gin special?",
      answer: "The Botanist features 22 hand-foraged botanicals from the Isle of Islay, making it one of the most complex gins in the world. Each botanical is picked at its peak and contributes to the gin's unique layered flavor profile."
    },
    {
      question: "How should I serve The Botanist?",
      answer: "The Botanist is versatile - try it with premium tonic and lemon peel, elderflower tonic with fresh thyme, in a classic martini, or neat over ice to appreciate its complexity. Each serve highlights different botanical notes."
    },
    {
      question: "What's included in the 25% off offer?",
      answer: "The discount applies to all serves of The Botanist throughout the promotion period. Singles are £2.78 (was £3.70). The offer is available at the bar - no booking required."
    },
    {
      question: "Can I book a table to try The Botanist?",
      answer: "Walk-ins are always welcome at The Anchor! While you don't need to book for drinks, if you're planning to dine with us too, you can book a table online or call 01753 682707."
    }
  ] : isWarners ? [
    {
      question: "What makes Warners Elderflower gin special?",
      answer: "Warners Elderflower gin is infused with fresh elderflowers handpicked from the hedgerows surrounding Falls Farm in Northamptonshire. It captures the essence of British summertime with natural floral sweetness balanced by classic gin botanicals."
    },
    {
      question: "What's the best way to serve Warners Elderflower?",
      answer: "We recommend pairing it with Schweppes Slimline Elderflower tonic and fresh lime for a double elderflower experience. The elderflower tonic amplifies the gin's floral notes while keeping things light and refreshing."
    },
    {
      question: "What's included in the 25% off offer?",
      answer: "The discount applies to all serves of Warners Elderflower throughout August. Singles are £2.85 (was £3.80). Available every day at the bar - no booking required."
    },
    {
      question: "Is Warners Elderflower good for gin cocktails?",
      answer: "Absolutely! Beyond G&Ts, try it in an Elderflower Collins with lemon and soda, or with premium tonic and cucumber ribbon. The natural elderflower sweetness makes it perfect for refreshing summer cocktails."
    }
  ] : isRedleg ? [
    {
      question: "What makes Redleg Spiced Rum special?",
      answer: "Redleg is a Caribbean spiced rum infused with Jamaican ginger and vanilla. Named after the red leg hermit crab, it brings authentic island warmth with its smooth blend of spices - perfect for those first chilly autumn evenings."
    },
    {
      question: "What's the best way to serve Redleg?",
      answer: "Redleg shines with premium ginger beer and fresh lime for a warming serve, or keep it classic with cola and a lime squeeze. As September nights draw in, it's also exceptional neat over ice to appreciate the vanilla and spice notes."
    },
    {
      question: "What's included in the 25% off offer?",
      answer: "The discount applies to all serves of Redleg Spiced Rum throughout September. Singles are £3.00 (was £4.00). Available every day at the bar - no booking required."
    },
    {
      question: "Why is spiced rum perfect for September?",
      answer: "As summer transitions to autumn, Redleg's warming spices - ginger, vanilla, and cinnamon - provide the perfect golden glow for cooler evenings. It's like Caribbean sunshine in a glass, ideal for the changing season."
    }
  ] : isChaseSloe ? [
    {
      question: "What is Chase Sloe Gin?",
      answer: "Chase Sloe Gin starts life as the Chase family's award-winning potato spirit before being steeped with wild Herefordshire sloes for up to six months. The result is a richly fruited liqueur that balances tart hedgerow berries with almond sweetness."
    },
    {
      question: "Is sloe gin very sweet?",
      answer: "Chase Sloe Gin is luscious but not syrupy. The natural tartness from the sloes is rounded off with a touch of demerara sugar and the juniper backbone of the base gin, so you still get a proper gin character rather than a dessert drink."
    },
    {
      question: "How should I drink Chase Sloe Gin?",
      answer: "Sip it neat over ice to savour the berry jam flavours, pair it with premium tonic and an orange twist for a refreshing highball, or ask for our November special Sloe Gin Fizz topped with Prosecco. It's also delicious warmed gently with apple juice and spices."
    },
    {
      question: "Why is it November's Manager's Special?",
      answer: "As the evenings turn frosty, Chase Sloe Gin delivers comforting hedgerow flavours that feel tailor-made for fireside moments. It's a seasonal British classic that pairs perfectly with November walks along the Thames or a cosy night in our snug."
    }
  ] : isHennessy ? [
    {
      question: "What makes Hennessy VS a 'Very Special' cognac?",
      answer: "Hennessy VS is blended from more than 40 eaux-de-vie aged up to eight years in French oak. The maturation develops the toasted oak, vanilla and spice notes that make it one of the world's most celebrated entry points into cognac."
    },
    {
      question: "How do you recommend serving Hennessy VS at The Anchor?",
      answer: "Ask our bar team for it neat or over a single cube to appreciate the oak, or try our October serve with premium ginger ale and an orange twist. We also shake it into an Autumn Sidecar if you fancy a cocktail."
    },
    {
      question: "Is the 25% discount just for singles?",
      answer: "The headline offer covers 25ml singles at £3.38 (was £4.50). Doubles are still available at the bar's standard pricing if you'd like a longer sip."
    },
    {
      question: "Does Hennessy pair well with food?",
      answer: "Absolutely. Hennessy VS works beautifully alongside our slow-cooked short rib, rich desserts like sticky toffee pudding, or simply as a digestif after Sunday roast."
    }
  ] : []

  const defaultHeroTags = [
    { label: '🎯 Limited Time', variant: 'primary' as const },
    { label: `Valid until ${new Date(currentPromotion.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`, variant: 'default' as const },
    ...(spirit.abv ? [{ label: spirit.abv, variant: 'default' as const }] : []),
    ...(spirit.origin ? [{ label: spirit.origin, variant: 'default' as const }] : [])
  ]

  const heroTags = isChaseSloe
    ? [
        { label: '🍇 Hedgerow Crafted', variant: 'primary' as const },
        { label: '🔥 Cosy Winter Serve', variant: 'primary' as const },
        ...defaultHeroTags
      ]
    : defaultHeroTags

  const heroEyebrow = isChaseSloe ? "Manager's Special · November 2025" : undefined

  const heroLead = isChaseSloe ? (
    <div className="flex w-full flex-col gap-4 rounded-2xl bg-black/25 p-4 backdrop-blur-sm shadow-lg shadow-black/30 sm:flex-row sm:items-center sm:justify-center sm:gap-6">
      <div className="flex items-center gap-3 text-white/90">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg font-semibold text-white">
          £
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Offer Price</p>
          <p className="text-base font-semibold">Singles {spirit.specialPrice} (was {spirit.originalPrice})</p>
        </div>
      </div>
      <div className="hidden h-10 w-px bg-white/20 sm:block" />
      <div className="flex items-center gap-3 text-white/90">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg">
          🍸
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Signature Serves</p>
          <p className="text-base font-semibold">Sloe Fizz · Hedgerow Highball · Orchard Warmer</p>
        </div>
      </div>
    </div>
  ) : undefined

  const heroOverlay = isChaseSloe ? 'gradient' : undefined

  const heroContentClassName = isChaseSloe ? 'max-w-4xl' : undefined

  const spiritDetails = [
    spirit.abv ? { label: 'ABV', value: spirit.abv } : null,
    spirit.origin ? { label: 'Origin', value: spirit.origin } : null,
    spirit.distillery ? { label: 'Distillery', value: spirit.distillery } : null,
    spirit.category ? { label: 'Category', value: spirit.category } : null
  ].filter((detail): detail is { label: string; value: string } => Boolean(detail))

  return (
    <>
      <MenuPageTracker 
        menuType="managers_special"
        specialOffers={[
          `${spirit.discount} ${spirit.name} - Valid until ${new Date(currentPromotion.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([productSchema, breadcrumbSchema]) }}
      />
      
      {/* Hero Section */}
      <HeroWrapper
        route="/drinks/managers-special"
        title={`${spirit.discount} ${spirit.name}`}
        description={promotion.subheadline}
        variant="promo"
        overlay={heroOverlay}
        eyebrow={heroEyebrow}
        lead={heroLead}
        tags={heroTags}
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
            <Link href="#details">
              <Button 
                variant="secondary"
                size="lg"
                className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm w-full sm:w-auto"
              >
                🍸 View Details
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
        contentClassName={heroContentClassName}
      />

      {/* Page Title for SEO */}
      <Section spacing="sm" container className="bg-white">
        <PageTitle 
          className="text-center text-purple-700"
          seo={{ structured: true }}
        >
          {promotion.headline} - {spirit.name} at The Anchor
        </PageTitle>
      </Section>

      {/* Product showcase with image */}
      <FullWidthSection id="details" className="bg-gradient-to-br from-purple-50 to-purple-100/50 py-12 md:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Product Image */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity blur-xl"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 md:p-12">
                {dynamicImagePath && (
                  <Image 
                    src={dynamicImagePath}
                    alt={`${spirit.name} - ${promotion.headline}`}
                    width={400}
                    height={600}
                    className="w-full h-auto rounded-lg"
                    unoptimized
                  />
                )}
                <div className="absolute -top-6 -right-6 bg-gradient-to-br from-amber-400 to-amber-500 text-white px-6 py-3 rounded-full shadow-lg font-bold text-xl transform rotate-12">
                  {spirit.discount}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <ProductDetails 
              title="Spirit Details"
              details={spiritDetails}
            />
          </div>
        </div>
      </FullWidthSection>

      {/* Pricing Section */}
      <Section background="white" spacing="lg" container containerSize="md">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Special Prices This {promotionMonthName}
            </h2>
            <p className="text-xl text-gray-600">
              Available at the bar • No booking required • While stocks last
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <PricingCard
              title="Single Measure"
              currentPrice={spirit.specialPrice}
              originalPrice={spirit.originalPrice}
              savings={spirit.discount}
              featured={true}
            />
            <p className="text-center text-gray-600 mt-4">
              Doubles available at bar prices
            </p>
          </div>
        </div>
      </Section>

      {/* Tasting & Botanicals */}
      <FullWidthSection className="bg-gradient-to-b from-gray-50 to-white py-12 md:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
              {/* Tasting Notes */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Tasting Notes</h2>
                <div className="space-y-4">
                  {spirit.tastingNotes && spirit.tastingNotes.length > 0 ? (
                    spirit.tastingNotes.map((note: string, index: number) => (
                      <div key={index} className="flex items-start bg-white rounded-xl shadow-sm p-6">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-purple-600 font-bold">{index + 1}</span>
                        </div>
                        <p className="text-gray-700 text-lg">{note}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 italic">Tasting notes coming soon.</p>
                  )}
                </div>
              </div>

              {/* Perfect Serves */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Perfect Serves</h2>
                <div className="space-y-4">
                  {spirit.servingSuggestions && spirit.servingSuggestions.length > 0 ? (
                    spirit.servingSuggestions.map((suggestion: string, index: number) => (
                      <div key={index} className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">🍸</span>
                          <h3 className="font-semibold text-gray-900">Serve {index + 1}</h3>
                        </div>
                        <p className="text-gray-700">{suggestion}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 italic">Serving suggestions coming soon.</p>
                  )}
                </div>
              </div>
          </div>
        </div>
      </FullWidthSection>

      {isChaseSloe && (
        <FullWidthSection className="py-12 md:py-20 bg-gradient-to-r from-rose-50 via-purple-50 to-rose-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-purple-900 mb-4">
                Why Chase Sloe Gin Is November's Pick
              </h2>
              <p className="text-lg md:text-xl text-purple-900/80 leading-relaxed">
                Hedgerow berries, winter spice and silky almond sweetness make Chase Sloe Gin the definition of a British cosy season classic. We pour it as our November special because it celebrates local fruit, artisan craft and evenings spent warming up after crisp walks along the Colne Valley.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="bg-white border border-rose-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-purple-900 mb-2">Farm-to-Glass Provenance</h3>
                <p className="text-purple-900/80">Every bottle is made at the Chase family farm in Herefordshire using their field-to-bottle potato spirit before sloes from surrounding hedgerows are steeped for half a year.</p>
              </div>
              <div className="bg-white border border-rose-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-purple-900 mb-2">Seasonal Comfort</h3>
                <p className="text-purple-900/80">Think mulled berries, almond frangipane and a whisper of cinnamon. It's the flavour profile we crave when the first frosts arrive and the fire is lit in the snug.</p>
              </div>
              <div className="bg-white border border-rose-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-purple-900 mb-2">Versatile Serves</h3>
                <p className="text-purple-900/80">From sparkling Sloe Gin Fizzes to hot toddies spiked with apple juice, this liqueur adapts to whatever November night you're planning at The Anchor.</p>
              </div>
            </div>
          </div>
        </FullWidthSection>
      )}

      {isChaseSloe && (
        <Section spacing="lg" container containerSize="md" className="bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Cosy Sloe Gin Serves To Try This Month</h2>
            <div className="space-y-6">
              <div className="border border-rose-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">The Anchor Sloe Fizz</h3>
                <p className="text-gray-700">Chase Sloe Gin shaken with fresh lemon, a touch of sugar and crowned with Giorgio &amp; Gianni Prosecco. It's bright, bubbly and perfect as a pre-dinner celebration.</p>
              </div>
              <div className="border border-rose-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">Hedgerow Highball</h3>
                <p className="text-gray-700">Lengthen with Fever-Tree Elderflower, a squeeze of orange and a star anise pod. The mixer lifts the berry notes while keeping the serve refreshing.</p>
              </div>
              <div className="border border-rose-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">Mulled Orchard Warmer</h3>
                <p className="text-gray-700">Ask the bar team to warm Chase Sloe Gin gently with cloudy apple juice, cinnamon and clove. It's like mulled wine's sophisticated cousin and ideal post-walk.</p>
              </div>
            </div>
          </div>
        </Section>
      )}

      {isHennessy && (
        <FullWidthSection className="py-12 md:py-20 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">
                Why Hennessy VS Is October's Pick
              </h2>
              <p className="text-lg md:text-xl text-amber-900/80 leading-relaxed">
                Autumn evenings at The Anchor call for something rich, warming and iconic. Hennessy VS delivers toasted oak, caramelised fruit and spice that feel tailor-made for fireside chats after a crisp walk along the Thames moorings.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-amber-900 mb-2">Signature Serve</h3>
                <p className="text-amber-900/80">Order it neat or over a single cube to let the vanilla and spice bloom. Prefer sparkle? Ask for our Hennessy Ginger with Fever-Tree ginger ale and an orange twist.</p>
              </div>
              <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-amber-900 mb-2">Perfect Moment</h3>
                <p className="text-amber-900/80">Nurse a glass while catching up after Sunday lunch, or treat yourself before a Heathrow red-eye. Cognac's slow sip pace rewards taking the evening down a notch.</p>
              </div>
              <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-amber-900 mb-2">Food Pairing</h3>
                <p className="text-amber-900/80">Pair it with our short rib, charcuterie boards or sticky toffee pudding. The caramel notes in Hennessy link beautifully with roasted and spiced dishes.</p>
              </div>
            </div>
          </div>
        </FullWidthSection>
      )}

      {isHennessy && (
        <Section spacing="lg" container containerSize="md" className="bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Cognac Cocktails To Try This Month</h2>
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">Autumn Sidecar</h3>
                <p className="text-gray-700">Hennessy VS, triple sec, fresh lemon and a cinnamon sugar rim. Bright citrus meets warming spice - ideal before dinner.</p>
              </div>
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">VS Old Fashioned</h3>
                <p className="text-gray-700">A cognac twist on the classic with brown sugar, Angostura bitters and orange oils. Smooth, sophisticated and perfect for unwinding at the bar.</p>
              </div>
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">Apple Orchard Highball</h3>
                <p className="text-gray-700">Hennessy VS lengthened with cloudy apple juice, soda and a dash of aromatic bitters. A refreshing nod to harvest season.</p>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Botanicals Grid */}
      {spirit.botanicals && spirit.botanicals.length > 0 && (
        <Section spacing="lg" container containerSize="md" className="bg-purple-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {spirit.botanicals.length === 22 ? '22 Hand-Foraged ' : ''}Botanicals
              </h2>
              {spirit.name.includes('Botanist') && (
                <p className="text-xl text-gray-600">
                  Foraged from the hills, shores and bogs of Islay
                </p>
              )}
            </div>

            <BotanicalsGrid botanicals={spirit.botanicals} />
          </div>
        </Section>
      )}

      {/* Story Section */}
      <FullWidthSection className="py-12 md:py-20 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="bg-white border-2 border-purple-200 rounded-xl p-8 md:p-12 lg:p-16">
            <div className="flex items-center justify-center mb-6">
              <span className="text-5xl">🌿</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-anchor-green mb-8">
              The {spirit.name} Story
            </h2>
            <div className="space-y-6 text-gray-700 max-w-none">
              <p className="text-lg md:text-xl leading-relaxed">{spirit.longDescription}</p>
              {isBotanist ? (
                <>
                  <p className="text-lg leading-relaxed">
                    Created at the Bruichladdich Distillery on Islay, The Botanist represents a unique 
                    approach to gin-making. Master Distiller Jim McEwan set out to create a gin that 
                    would reflect the wild, untamed nature of the Hebridean island.
                  </p>
                  <p className="text-lg leading-relaxed">
                    The result is a gin that tells the story of Islay in every sip - from the coastal 
                    herbs that face the Atlantic storms to the delicate flowers found in sheltered glens.
                  </p>
                </>
              ) : isWarners ? (
                <>
                  <p className="text-lg leading-relaxed">
                    Founded by farmer Tom Warner, Warners Distillery began as a way to use surplus 
                    produce from Falls Farm. What started in a barn has grown into one of Britain's 
                    most celebrated craft distilleries.
                  </p>
                  <p className="text-lg leading-relaxed">
                    The elderflowers are picked at their peak in early summer, when the hedgerows are 
                    heavy with creamy white blossoms. These are then infused into their award-winning 
                    gin, creating that distinctive floral character.
                  </p>
                </>
              ) : isRedleg ? (
                <>
                  <p className="text-lg leading-relaxed">
                    Named after the red leg hermit crab native to the Caribbean, Redleg represents 
                    the spirit of island life - vibrant, warm, and full of character. This spiced 
                    rum captures the essence of the tropics in every golden drop.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Distilled using traditional Jamaican pot stills and aged in oak barrels, Redleg 
                    is then infused with vanilla and ginger from the islands. The result is a smooth, 
                    warming rum that brings Caribbean sunshine to even the greyest British autumn day.
                  </p>
                </>
              ) : isChaseSloe ? (
                <>
                  <p className="text-lg leading-relaxed">
                    William Chase built his eponymous distillery on the family farm in Herefordshire, turning potatoes grown in their own fields into an award-winning neutral spirit. After the autumn harvest, the team hand-picks sloes from local hedgerows and leaves them to macerate slowly with that spirit for months.
                  </p>
                  <p className="text-lg leading-relaxed">
                    The patient infusion captures the deep crimson colour and marzipan richness that define a proper sloe gin. Expect flavours of blackberry conserve, baked plum crumble and toasted almonds - a liquid love letter to the British countryside as winter closes in.
                  </p>
                </>
              ) : isHennessy ? (
                <>
                  <p className="text-lg leading-relaxed">
                    Maison Hennessy has crafted cognac on the banks of the Charente River since 1765. The VS (Very Special) expression blends youthful eaux-de-vie aged in French oak barrels to capture vibrant fruit, toasted almond and warming spice.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Each barrel contributes subtly different layers; cellar masters marry them to create the signature house style. The result is a cognac that feels both luxurious and approachable - perfect for making October evenings at The Anchor feel that little bit elevated.
                  </p>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </FullWidthSection>

      {/* FAQs */}
      <Section background="gray" spacing="lg" container containerSize="md">
        <FAQAccordionWithSchema 
          title="Frequently Asked Questions"
          faqs={faqs}
          className="bg-white"
        />
      </Section>

      {/* CTA Section */}
      <FullWidthSection className="bg-gradient-to-br from-purple-600 to-purple-800 py-16 md:py-24">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              {promotion.ctaText}
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Visit The Anchor this {promotionMonthName} 
              and discover why {spirit.name} is our Manager's Special
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookTableButton
                source="managers_special_cta"
                size="lg"
                variant="secondary"
                className="bg-white text-purple-700 hover:bg-gray-100"
              />
              <Link href="/find-us">
                <Button size="lg" variant="secondary" className="bg-purple-700 text-white hover:bg-purple-600">
                  📍 Get Directions
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
            <p className="text-purple-200 mt-6">
              Offer valid until {new Date(currentPromotion.endDate).toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </FullWidthSection>
    </>
  )
}

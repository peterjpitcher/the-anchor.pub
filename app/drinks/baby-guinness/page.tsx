import { Metadata } from 'next'
import Link from 'next/link'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Section, Card, CardBody, Button, Badge } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'

import { DEFAULT_DRINKS_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export const metadata: Metadata = {
  title: 'Baby Guinness Shot £3.50 | Near Heathrow',
  description: 'Perfect Baby Guinness shots at The Anchor, just 7 minutes from Heathrow. £3.50 each. Popular for hen parties and celebrations. Much cheaper than airport bars.',
  alternates: {
    canonical: '/drinks/baby-guinness'
  },
  openGraph: {
    title: 'Baby Guinness Shot at The Anchor',
    description: 'The perfect layered shot that looks like a tiny Guinness. £3.50 each.',
    images: [{ url: DEFAULT_DRINKS_IMAGE, width: 1200, height: 630, alt: 'Drinks menu at The Anchor pub near Heathrow' }],
  },
  twitter: getTwitterMetadata({
    title: 'Baby Guinness Shot at The Anchor',
    description: 'The perfect layered shot that looks like a tiny Guinness. £3.50 each.',
    images: [DEFAULT_DRINKS_IMAGE]
  })
}

export default function BabyGuinnessPage() {
  return (
    <>
      <HeroWrapper
        route="/drinks/baby-guinness"
        title="Baby Guinness Shot"
        description="Stanwell Moor's Favourite Party Starter"
        breadcrumbs={[
          { name: 'Drinks', href: '/drinks' },
          { name: 'Baby Guinness' }
        ]}
        enableSmartCtas={true}
        showContextStrip={true}
      />

      {/* Main Content */}
      <Section background="white" spacing="lg" container containerSize="md" className="bg-anchor-green-deep">
        <article className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl md:text-4xl font-bold text-anchor-gold-bright mb-6">
                Baby Guinness Shot at The Anchor - Heathrow Pub & Dining's Favourite Party Starter
              </h2>
              
              {/* Price Badge */}
	              <div className="flex gap-4 mb-8">
	                <Badge variant="primary" className="text-lg px-4 py-2">
	                  £3.50 each
	                </Badge>
	              </div>

              {/* What is a Baby Guinness */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-anchor-gold-bright mb-4">What is a Baby Guinness?</h2>
                <p className="text-anchor-cream-text/70 leading-relaxed mb-4">
                  The Baby Guinness is our most popular layered shot that looks exactly like a tiny pint
                  of Guinness - complete with the distinctive dark body and creamy white head. Despite its
                  name, it contains no actual Guinness! Instead, it's made with coffee liqueur (usually Kahlúa)
                  as the base and Irish cream liqueur (typically Bailey's) floated on top.
                </p>
                <p className="text-anchor-cream-text/70 leading-relaxed">
                  This clever visual trick makes it one of the most Instagram-worthy shots you can order,
                  and at The Anchor, we've perfected the art of pouring them. Located just 7 minutes from
                  Heathrow Terminal 5, we're the perfect spot for pre-flight celebrations or welcoming
                  friends back from their travels.
                </p>
              </section>

              {/* Recipe Card */}
              <Card className="card-dark rounded-none mb-12">
                <CardBody>
                  <h3 className="text-xl font-bold text-anchor-gold-bright mb-4">How We Make Our Baby Guinness</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Ingredients:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <span className="mr-2"></span>
                          <span>2/3 shot Kahlúa coffee liqueur (bottom layer)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2"></span>
                          <span>1/3 shot Bailey's Irish Cream (floated on top)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2"></span>
                          <span>Served in a shot glass</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">The Perfect Pour:</h4>
                      <ol className="space-y-2">
                        <li>1. Fill shot glass 2/3 with Kahlúa</li>
                        <li>2. Hold spoon upside down over the Kahlúa</li>
                        <li>3. Slowly pour Bailey's over the spoon</li>
                        <li>4. The Bailey's will float on top</li>
                        <li>5. Admire, photograph, then shoot!</li>
                      </ol>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Perfect For Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-anchor-gold-bright mb-4">Perfect for Celebrations at The Anchor</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-anchor-green-card rounded-none p-4 border border-anchor-gold-dark/15">
                    <h3 className="font-semibold mb-2 text-anchor-cream-text"> Party Occasions</h3>
                    <ul className="space-y-1 text-anchor-cream-text/70">
                      <li>• Hen parties and stag dos</li>
                      <li>• Birthday celebrations</li>
                      <li>• Work leaving parties</li>
                      <li>• Pre-flight send-offs</li>
                    </ul>
                  </div>
                  <div className="bg-anchor-green-card rounded-none p-4 border border-anchor-gold-dark/15">
                    <h3 className="font-semibold mb-2 text-anchor-cream-text"> Perfect Timing</h3>
                    <ul className="space-y-1 text-anchor-cream-text/70">
                      <li>• After your Sunday roast</li>
                      <li>• Before our monthly quiz night</li>
                      <li>• During hosted event nights (see /whats-on)</li>
                      <li>• Happy endings to any meal</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* History Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-anchor-gold-bright mb-4">The History of the Baby Guinness</h2>
                <p className="text-anchor-cream-text/70 leading-relaxed mb-4">
                  The Baby Guinness shot was invented in the 1980s and has become a staple of British and Irish
                  pub culture. The genius behind this shot was its visual appeal - creating something that looked
                  exactly like a miniature pint of Ireland's most famous stout, but tasted completely different.
                </p>
                <p className="text-anchor-cream-text/70 leading-relaxed">
                  The combination of coffee and cream flavours makes it surprisingly smooth and easy to drink,
                  which is why it's become one of the most ordered shots in pubs across the UK. At The Anchor,
                  we've been serving Baby Guinness shots for years, and they remain one of our top sellers -
                  especially during our weekend events.
                </p>
              </section>

              {/* Pricing */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-anchor-gold-bright mb-4">Baby Guinness Pricing</h2>
                <Card className="card-dark rounded-none">
                  <CardBody className="text-center">
                    <h3 className="font-semibold mb-2 text-anchor-cream-text">Classic Baby Guinness</h3>
                    <p className="text-sm text-anchor-cream-text/55">Kahlúa & Bailey's</p>
                    <p className="text-anchor-gold-dark font-bold text-2xl">£3.50</p>
                  </CardBody>
                </Card>
              </section>

              {/* Why Choose The Anchor */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-anchor-gold-bright mb-4">
                  Why Order Baby Guinness at The Anchor?
                </h2>
                <div className="bg-anchor-green-card rounded-none p-6 border border-anchor-gold-dark/15">
                  <ul className="space-y-3">
	                    <li className="flex items-start">
	                      <span className="text-anchor-gold-dark mr-3"></span>
	                      <span><strong>Better Value:</strong> £3.50 vs £8+ at Heathrow Airport bars</span>
	                    </li>
                    <li className="flex items-start">
                      <span className="text-anchor-gold-dark mr-3"></span>
                      <span><strong>Perfect Location:</strong> Just 7 minutes from Terminal 5</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-anchor-gold-dark mr-3"></span>
                      <span><strong>Experienced Staff:</strong> We make hundreds every month</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-anchor-gold-dark mr-3"></span>
                      <span><strong>Great Atmosphere:</strong> Friendly local pub, not a chain</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-anchor-gold-dark mr-3"></span>
                      <span><strong>FREE Parking:</strong> No airport parking fees here!</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* FAQs */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-anchor-gold-bright mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-anchor-cream-text">Does a Baby Guinness contain actual Guinness?</h3>
                    <p className="text-anchor-cream-text/70">No, despite the name, there's no Guinness in a Baby Guinness.
                    It's called that because it looks like a tiny pint of Guinness when properly layered.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-anchor-cream-text">How strong is a Baby Guinness?</h3>
                    <p className="text-anchor-cream-text/70">It's relatively mild at around 17% ABV when mixed. The Kahlúa
                    is 20% ABV and Bailey's is 17% ABV, making it lighter than most straight spirits.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-anchor-cream-text">Can I order Baby Guinness for a large group?</h3>
                    <p className="text-anchor-cream-text/70">Absolutely! They're perfect for celebrations. For groups of
                    10 or more, give us a heads up and we'll have them ready when you arrive.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-anchor-cream-text">How much is a Baby Guinness?</h3>
                    <p className="text-anchor-cream-text/70">Our Baby Guinness shots are £3.50 each - great value
                    compared to airport bars where you'd pay £8 or more for the same thing.</p>
                  </div>
                </div>
              </section>
            </div>
          </article>
      </Section>

      {/* CTA Section */}
      <Section background="dark" spacing="md" container containerSize="md">
        <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for a Baby Guinness?</h2>
            <p className="text-xl mb-8">Visit The Anchor today for the perfect shot</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <BookTableButton
                source="baby_guinness_page"
                variant="outline"
                size="lg"
                className="!text-anchor-gold-dark !border-anchor-gold-dark hover:!bg-anchor-gold-dark hover:!text-anchor-green"
              />
              <Link href="/drinks">
                <Button variant="outline" size="lg" className="!text-anchor-gold-dark !border-anchor-gold-dark hover:!bg-anchor-gold-dark hover:!text-anchor-green">
                  View Full Drinks Menu
                </Button>
              </Link>
            </div>
            
            <div className="text-white/90">
              <p className="mb-2"> Just 7 minutes from Heathrow Terminal 5</p>
              <p className="mb-2"> FREE parking available</p>
              <p> Call: 01753 682707</p>
            </div>
          </div>
      </Section>

      {/* Recipe Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafeStringify({
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": "Baby Guinness Shot",
            "description": "A layered shot that looks like a tiny pint of Guinness, made with Kahlúa and Bailey's",
            "image": `https://www.the-anchor.pub${DEFAULT_DRINKS_IMAGE}`,
            "author": {
              "@type": "Organization",
              "name": "The Anchor"
            },
            "prepTime": "PT1M",
            "cookTime": "PT0M",
            "totalTime": "PT1M",
            "recipeYield": "1 shot",
            "recipeCategory": "Shot",
            "recipeCuisine": "British",
            "keywords": "baby guinness, shot, layered shot, kahlua, baileys",
            "recipeIngredient": [
              "20ml Kahlúa coffee liqueur",
              "10ml Bailey's Irish Cream"
            ],
            "recipeInstructions": [
              {
                "@type": "HowToStep",
                "text": "Fill shot glass 2/3 with Kahlúa"
              },
              {
                "@type": "HowToStep",
                "text": "Hold a spoon upside down over the Kahlúa"
              },
              {
                "@type": "HowToStep",
                "text": "Slowly pour Bailey's over the spoon to create a layer"
              },
              {
                "@type": "HowToStep",
                "text": "Serve immediately"
              }
            ],
            "nutrition": {
              "@type": "NutritionInformation",
              "servingSize": "1 shot (30ml)",
              "calories": "95 calories"
            }
          }),
        }}
      />

      {/* Breadcrumb Schema */}
    </>
  )
}

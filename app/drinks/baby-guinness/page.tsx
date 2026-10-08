import { Metadata } from 'next'
import Link from 'next/link'
import { InteriorHero } from '@/components/hero'
import { Button, Card, CardBody, Badge } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'

import { DEFAULT_DRINKS_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { HEATHROW_TIMES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Baby Guinness Shot | Near Heathrow',
  description: `Perfect Baby Guinness shots at The Anchor, just ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5. Ask the bar team for the current price.`,
  alternates: {
    canonical: '/drinks/baby-guinness'
  },
  openGraph: {
    title: 'Baby Guinness Shot at The Anchor',
    description: 'The perfect layered shot that looks like a tiny Guinness. Ask the bar team for the current price.',
    images: [{ url: DEFAULT_DRINKS_IMAGE, width: 1200, height: 630, alt: 'Drinks menu at The Anchor pub near Heathrow' }],
  },
  twitter: getTwitterMetadata({
    title: 'Baby Guinness Shot at The Anchor',
    description: 'The perfect layered shot that looks like a tiny Guinness. Ask the bar team for the current price.',
    images: [DEFAULT_DRINKS_IMAGE]
  })
}

export default function BabyGuinnessPage() {
  return (
    <>
      <InteriorHero
        image="/images/page-headers/drinks/drinks-summery.png"
        crumb="Baby Guinness"
        title="Baby Guinness Shot"
        lead="A tiny pint in a shot glass"
      />

      <section className="bg-canvas py-section-y">
        <div className="container">
          <article className="mx-auto">
            <h2 className="mb-6 text-h2 text-ink-strong">
              Baby Guinness Shots at The Anchor
            </h2>

            <div className="mb-8 flex gap-4">
              <Badge variant="green">Ask for current price</Badge>
            </div>

            <section className="mb-12">
              <h2 className="mb-4 text-h3 text-ink-strong">What is a Baby Guinness?</h2>
              <p className="mb-4 leading-relaxed text-ink-muted">
                The Baby Guinness is a layered shot that looks exactly like a tiny pint
                of Guinness - complete with the distinctive dark body and creamy white head. Despite its
                name, it contains no actual Guinness! Instead, it&apos;s made with coffee liqueur (usually Kahlúa)
                as the base and Irish cream liqueur (typically Bailey&apos;s) floated on top.
              </p>
              <p className="leading-relaxed text-ink-muted">
                It&apos;s a clever visual trick, and we love pouring them. We&apos;re {HEATHROW_TIMES.terminal5} minutes from
                Heathrow Terminal 5, so it&apos;s an easy stop for a pre-flight celebration or for welcoming
                friends back from their travels.
              </p>
            </section>

            <Card accent className="mb-12">
              <CardBody>
                <h3 className="mb-4 text-h4 text-ink-strong">How We Make Our Baby Guinness</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold text-ink-strong">Ingredients:</h4>
                    <ul className="space-y-2 text-ink-muted">
                      <li>2/3 shot Kahlúa coffee liqueur (bottom layer)</li>
                      <li>1/3 shot Bailey&apos;s Irish Cream (floated on top)</li>
                      <li>Served in a shot glass</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-ink-strong">The Perfect Pour:</h4>
                    <ol className="space-y-2 text-ink-muted">
                      <li>1. Fill shot glass 2/3 with Kahlúa</li>
                      <li>2. Hold spoon upside down over the Kahlúa</li>
                      <li>3. Slowly pour Bailey&apos;s over the spoon</li>
                      <li>4. The Bailey&apos;s will float on top</li>
                      <li>5. Admire, photograph, then shoot!</li>
                    </ol>
                  </div>
                </div>
              </CardBody>
            </Card>

            <section className="mb-12">
              <h2 className="mb-4 text-h3 text-ink-strong">Perfect for Celebrations at The Anchor</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Card accent>
                  <CardBody>
                    <h3 className="mb-2 font-semibold text-ink-strong">Party Occasions</h3>
                    <ul className="space-y-1 text-ink-muted">
                      <li>Birthday celebrations</li>
                      <li>Work leaving parties</li>
                      <li>Pre-flight send-offs</li>
                    </ul>
                  </CardBody>
                </Card>
                <Card accent>
                  <CardBody>
                    <h3 className="mb-2 font-semibold text-ink-strong">Perfect Timing</h3>
                    <ul className="space-y-1 text-ink-muted">
                      <li>After your Sunday roast</li>
                      <li>Before our monthly quiz night</li>
                      <li>
                        On one of our{' '}
                        <Link href="/whats-on" className="text-accent-text underline underline-offset-4">
                          hosted nights
                        </Link>
                      </li>
                      <li>Happy endings to any meal</li>
                    </ul>
                  </CardBody>
                </Card>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-h3 text-ink-strong">The History of the Baby Guinness</h2>
              <p className="mb-4 leading-relaxed text-ink-muted">
                The Baby Guinness shot was invented in the 1980s and has become a staple of British and Irish
                pub culture. The genius behind this shot was its visual appeal - creating something that looked
                exactly like a miniature pint of Ireland&apos;s most famous stout, but tasted completely different.
              </p>
              <p className="leading-relaxed text-ink-muted">
                The combination of coffee and cream flavours makes it smooth and sweet.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-h3 text-ink-strong">Baby Guinness Pricing</h2>
              <Card accent>
                <CardBody className="text-center">
                  <h3 className="mb-2 font-semibold text-ink-strong">Classic Baby Guinness</h3>
                  <p className="text-sm text-ink-muted">Kahlúa &amp; Bailey&apos;s</p>
                  <p className="font-display text-2xl text-accent-text">Ask at the bar</p>
                </CardBody>
              </Card>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-h3 text-ink-strong">
                Why Order Baby Guinness at The Anchor?
              </h2>
              <Card accent>
                <CardBody>
                  <ul className="space-y-3 text-ink-muted">
                    <li><strong className="text-ink-strong">Perfect Location:</strong> Just {HEATHROW_TIMES.terminal5} minutes from Terminal 5</li>
                    <li><strong className="text-ink-strong">A proper local:</strong> A friendly village pub</li>
                    <li><strong className="text-ink-strong">Free Parking:</strong> Right outside while you&apos;re with us</li>
                  </ul>
                </CardBody>
              </Card>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-h3 text-ink-strong">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold text-ink-strong">Does a Baby Guinness contain actual Guinness?</h3>
                  <p className="text-ink-muted">No, despite the name, there&apos;s no Guinness in a Baby Guinness.
                  It&apos;s called that because it looks like a tiny pint of Guinness when properly layered.</p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-ink-strong">Can I order Baby Guinness for a large group?</h3>
                  <p className="text-ink-muted">Yes. Order a round at the bar and we&apos;ll pour them for you.</p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-ink-strong">How much is a Baby Guinness?</h3>
                  <p className="text-ink-muted">Ask the bar team for the current Baby Guinness price.</p>
                </div>
              </div>
            </section>
          </article>
        </div>
      </section>

      <CtaBand
        title="Ready for a Baby Guinness?"
        copy={`Visit The Anchor today for the perfect shot. Just ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5, with free parking.`}
      >
        <BookTableButton
          source="baby_guinness_page"
          variant="primary"
          size="lg"
        >
          Book a table
        </BookTableButton>
        <PhoneButton phone="01753 682707" source="baby_guinness_page" variant="outline" size="lg">
          01753 682707
        </PhoneButton>
        <Button asChild variant="outline" size="lg">
          <Link href="/drinks">
            View Full Drinks Menu
          </Link>
        </Button>
      </CtaBand>

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
              { "@type": "HowToStep", "text": "Fill shot glass 2/3 with Kahlúa" },
              { "@type": "HowToStep", "text": "Hold a spoon upside down over the Kahlúa" },
              { "@type": "HowToStep", "text": "Slowly pour Bailey's over the spoon to create a layer" },
              { "@type": "HowToStep", "text": "Serve immediately" }
            ],
            "nutrition": {
              "@type": "NutritionInformation",
              "servingSize": "1 shot (30ml)",
              "calories": "95 calories"
            }
          }),
        }}
      />
    </>
  )
}

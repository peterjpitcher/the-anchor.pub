import Link from 'next/link'
import { Button, Container, Section, SectionHeading } from '@/components/ui'
import { HeroWrapper } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneLink } from '@/components/PhoneLink'
import { PhoneButton } from '@/components/PhoneButton'
import { CONTACT } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Accessibility | Stanwell Moor Pub',
  description: 'Step-free access to the bar and dining area, with a ramp available for the beer garden. Everything you need to know to plan your visit to The Anchor, Stanwell Moor.',
  alternates: {
    canonical: '/accessibility'
  }
}

export default function AccessibilityPage() {
  return (
    <>

      <HeroWrapper
        route="/accessibility"
        title="Accessibility at The Anchor"
        description="Practical information to help you plan your visit"
        variant="default"
        enableSmartCtas={true}
        showContextStrip={true}
      />

      {/* Intro */}
      <Section background="white" spacing="lg">
        <Container>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-anchor-cream-text/70 leading-relaxed">
              We want everyone to enjoy visiting The Anchor. This page gives you honest, practical
              information about our facilities so you can plan your visit with confidence. If you
              have questions not covered here, call us, we&apos;re happy to help.
            </p>
          </div>
        </Container>
      </Section>

      {/* What's Step-Free */}
      <Section background="white" spacing="lg">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeading title="What's step-free" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { area: 'Bar area', icon: '' },
                { area: 'Dining area', icon: '' },
                { area: 'Beer garden', icon: '', note: 'There are steps from the bar to the garden, but a ramp is available on request' },
                { area: 'Car park', icon: '', note: 'Level surface, close to the entrance' },
              ].map(({ area, icon, note }) => (
                <div
                  key={area}
                  className="flex items-start gap-4 rounded-xl border border-anchor-gold-dark/15 bg-anchor-green-card p-5"
                >
                  <span className="text-2xl" aria-hidden="true">{icon}</span>
                  <div>
                    <p className="font-semibold text-anchor-gold-bright">{area}</p>
                    {area !== 'Beer garden' && <p className="text-sm text-anchor-gold-bright font-medium">Step-free</p>}
                    {note && <p className="text-sm text-anchor-cream-text/55 mt-1">{note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Accessible Toilet */}
      <Section background="white" spacing="lg">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeading title="Accessible toilet" />
            <div className="rounded-xl border border-anchor-gold-dark/15 bg-anchor-green-raised p-6">
              <p className="text-anchor-cream-text/70 leading-relaxed">
                We currently don&apos;t have an accessible toilet. If you&apos;d like to visit and want to
                check what will work best for you, give us a call on{' '}
                <PhoneLink phone={CONTACT.phone} source="accessibility_toilet" className="font-semibold text-anchor-gold-dark hover:underline" showIcon={false} />{' '}
                and we&apos;ll help you plan your visit.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Getting Here */}
      <Section background="white" spacing="lg">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeading title="Getting here" />
            <div className="space-y-4">
              <div className="rounded-xl border border-anchor-gold-dark/15 bg-anchor-green-card p-6">
                <ul className="space-y-3 text-anchor-cream-text/70">
                  <li className="flex items-start gap-3">
                    <span className="text-xl" aria-hidden="true"></span>
                    <span>Free on-site parking for approximately 20 cars, level surface</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl" aria-hidden="true"></span>
                    <span>Close to the entrance, no significant distances to navigate</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl" aria-hidden="true"></span>
                    <span>Horton Road, Stanwell Moor, Surrey TW19 6AQ</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl" aria-hidden="true"></span>
                    <span>7 minutes from Heathrow Terminal 5 / 11 minutes from Terminals 2 &amp; 3</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Call Ahead */}
      <Section background="white" spacing="lg">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeading title="Call ahead" />
            <p className="text-anchor-cream-text/70 leading-relaxed mb-6">
              If you&apos;d like to talk through your visit before you come, what to expect, where
              to park, what might work best for you, give us a call. We&apos;re happy to have
              that conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <PhoneButton phone={CONTACT.phone} source="accessibility_call-ahead" variant="primary" size="lg" className="w-full sm:w-auto">
                  Call {CONTACT.phone}
              </PhoneButton>
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <FAQAccordionWithSchema
        title="Accessibility FAQ"
        className="bg-anchor-green-deep"
        faqs={[
          {
            question: 'Is The Anchor wheelchair accessible?',
            answer: 'The bar and dining area are step-free. The beer garden has steps but a ramp is available on request. Our car park has a level surface close to the entrance. We currently don\'t have an accessible toilet, please call ahead if you\'d like to talk through your visit.'
          },
          {
            question: 'Is the beer garden step-free?',
            answer: 'There are steps from the bar to the beer garden, but a ramp is available on request. It\'s a great spot for watching aircraft overhead with a drink or a meal.'
          },
          {
            question: 'Do you have an accessible toilet?',
            answer: 'We currently don\'t have an accessible toilet. If you\'d like to discuss what will work best for your visit, please give us a call on +44 1753 682707 and we\'ll do our best to help.'
          },
          {
            question: 'Where should I park?',
            answer: 'We have free on-site parking for around 20 cars. The surface is level and the entrance is close by.'
          },
          {
            question: 'Can I bring a wheelchair or mobility aid?',
            answer: 'Yes. The bar and dining area are step-free. The beer garden has steps but a ramp is available on request. If you\'d like to check specific details in advance, please call us.'
          },
          {
            question: 'Are assistance dogs welcome?',
            answer: 'Absolutely. Assistance dogs are always welcome throughout The Anchor, including the beer garden.'
          }
        ]}
      />

      {/* Internal Links / CTA */}
      <section className="bg-gradient-to-br from-anchor-green to-anchor-green/90 section-spacing-lg">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Plan Your Visit
            </h2>
            <p className="text-lg text-white/90 mb-8">
              We&apos;re 7 minutes from Heathrow with free parking, step-free access and a warm
              welcome waiting for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookTableButton
                source="accessibility_cta"
                size="lg"
                variant="outline"
                className="bg-anchor-green-card text-anchor-gold-bright hover:bg-anchor-green-raised"
              />
              <Link href="/near-heathrow">
                <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm w-full sm:w-auto">
                  Near Heathrow Info
                </Button>
              </Link>
              <Link href="/beer-garden">
                <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm w-full sm:w-auto">
                  Beer Garden
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

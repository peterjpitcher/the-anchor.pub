import Link from 'next/link'
import { Button, Card, CardBody, Container, SectionHeading } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { CtaBand } from '@/components/CtaBand'
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

      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Accessibility"
        title="Accessibility at The Anchor"
        lead="Practical information to help you plan your visit"
      />

      {/* Intro */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <p className="text-lg text-ink-muted leading-relaxed">
              We want everyone to enjoy visiting The Anchor. This page gives you honest, practical
              information about our facilities so you can plan your visit with confidence. If you
              have questions not covered here, call us, we&apos;re happy to help.
            </p>
          </div>
        </Container>
      </section>

      {/* What's Step-Free */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading title="What's step-free" align="left" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { area: 'Bar area', icon: '' },
                { area: 'Dining area', icon: '' },
                { area: 'Beer garden', icon: '', note: 'There are steps from the bar to the garden, but a ramp is available on request' },
                { area: 'Car park', icon: '', note: 'Level surface, close to the entrance' },
              ].map(({ area, icon, note }) => (
                <Card key={area}>
                  <CardBody className="flex items-start gap-4 p-5">
                  <span className="text-2xl" aria-hidden="true">{icon}</span>
                  <div>
                    <p className="font-semibold text-ink-strong">{area}</p>
                    {area !== 'Beer garden' && <p className="text-sm text-accent-text font-medium">Step-free</p>}
                    {note && <p className="text-sm text-ink-muted mt-1">{note}</p>}
                  </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Accessible Toilet */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading title="Accessible toilet" align="left" />
            <Card>
              <CardBody>
              <p className="text-ink-muted leading-relaxed">
                We currently don&apos;t have an accessible toilet. If you&apos;d like to visit and want to
                check what will work best for you, give us a call on{' '}
                <PhoneLink phone={CONTACT.phone} source="accessibility_toilet" className="font-semibold text-accent-text hover:underline" showIcon={false} />{' '}
                and we&apos;ll help you plan your visit.
              </p>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      {/* Getting Here */}
      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto">
            <SectionHeading title="Getting here" align="left" />
            <div className="space-y-4">
              <Card>
                <CardBody>
                <ul className="space-y-3 text-ink-muted">
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
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Call Ahead */}
      <section className="py-section-y bg-surface">
        <Container>
          <div className="mx-auto">
            <SectionHeading title="Call ahead" align="left" />
            <p className="text-ink-muted leading-relaxed mb-6">
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
      </section>

      {/* FAQ */}
      <FAQAccordionWithSchema
        title="Accessibility FAQ"
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
      <CtaBand
        title="Plan Your Visit"
        copy="We're 7 minutes from Heathrow with free parking, step-free access to most areas and a warm welcome waiting for you."
      >
        <BookTableButton source="accessibility_cta" size="lg" variant="primary" />
        <Button asChild size="lg" variant="outline">
          <Link href="/near-heathrow">Near Heathrow Info</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/beer-garden">Beer Garden</Link>
        </Button>
      </CtaBand>
    </>
  )
}

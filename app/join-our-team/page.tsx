import Link from 'next/link'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero'
import { CareersForm } from '@/components/features/CareersForm'
import {
  Button,
  Container,
  Section,
  SectionHeader,
  FeatureGrid,
  Card,
  CardBody,
} from '@/components/ui'
import {
  getActiveCareerRoles,
  formatCareerPay,
} from '@/lib/careers'

export const metadata: Metadata = {
  title: 'Bar & Kitchen Jobs in Surrey | The Anchor Pub Near Heathrow',
  description:
    'Bar staff and kitchen jobs at The Anchor, Stanwell Moor. Independent village pub 7 mins from Heathrow T5. Part-time roles, free parking. Apply online.',
  alternates: { canonical: '/join-our-team' },
  openGraph: {
    title: 'Join Our Team | Jobs at The Anchor',
    description:
      'Bar and kitchen roles at The Anchor, Stanwell Moor. Part-time pub jobs near Heathrow. Apply online.',
    url: '/join-our-team',
    siteName: 'The Anchor',
    locale: 'en_GB',
    type: 'website',
  },
}

export default function JoinOurTeamPage(): React.JSX.Element {
  const activeRoles = getActiveCareerRoles()

  return (
    <>
      {/* Hero */}
      <HeroWrapper
        route="/join-our-team"
        title="Join Our Team at The Anchor"
        description="We are an independent village pub in Stanwell Moor, seven minutes from Heathrow Terminal 5. We are looking for reliable, experienced people to join our bar and kitchen teams."
        variant="default"
        primaryCta={
          <Button asChild size="lg" variant="primary" className="w-full sm:w-auto">
            <a href="#apply">Apply Now</a>
          </Button>
        }
        secondaryCta={
          <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
            <a href="#roles">See Current Roles</a>
          </Button>
        }
      />

      {/* Why Work Here */}
      <Section background="dark" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <SectionHeader
            title="Why Work Here"
            subtitle="A few reasons people enjoy working at The Anchor"
          />

          <FeatureGrid
            columns={3}
            features={[
              {
                icon: '',
                title: 'Shifts Planned in Advance',
                description:
                  'Your rota is confirmed up to two months ahead so you can plan your life around your shifts. No last-minute guesswork.',
                className: 'text-center',
              },
              {
                icon: '',
                title: 'Overtime Available',
                description:
                  'Additional hours are available as business needs require. If you want to pick up extra shifts, there are regular opportunities.',
                className: 'text-center',
              },
              {
                icon: '',
                title: 'Training Provided',
                description:
                  'We cover the cost of Level 2 Food Hygiene, Health and Safety, COSHH, and Licensing awareness. You do not need to arrive with certificates.',
                className: 'text-center',
              },
              {
                icon: '',
                title: 'Part of the Village',
                description:
                  'Stanwell Moor is a proper village with regulars who come back every week. You will get to know people by name and feel part of the community.',
                className: 'text-center',
              },
              {
                icon: '',
                title: 'Free Staff Parking',
                description:
                  'We have 20 free parking spaces on site. No meters, no apps, no charges. Useful for late finishes when public transport has stopped.',
                className: 'text-center',
              },
              {
                icon: '',
                title: 'Independent, Not Corporate',
                description:
                  'The Anchor is owner-managed, not a chain. Decisions are made by people who are here every day. You will know the people you work with and for.',
                className: 'text-center',
              },
            ]}
            className="max-w-6xl mx-auto"
          />
        </Container>
      </Section>

      {/* Current Roles */}
      <Section
        id="roles"
        background="dark"
        spacing="md"
        className="bg-anchor-bg-raised border-b border-anchor-gold/15"
      >
        <Container>
          <SectionHeader
            title="Current Roles"
            subtitle="We are hiring for the following positions"
          />

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {activeRoles.map((role) => (
              <Link key={role.slug} href={`/join-our-team/${role.slug}`} className="group">
                <Card
                  variant="default"
                  className="h-full transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
                >
                  <CardBody>
                    <h3 className="text-xl font-bold text-anchor-cream-text mb-2 group-hover:text-anchor-gold-vivid">
                      {role.title}
                    </h3>
                    <p className="text-anchor-cream-text/70 mb-4">
                      {role.summary}
                    </p>
                    <div className="space-y-1 text-sm text-anchor-cream-text/60 mb-4">
                      <p>{formatCareerPay(role)}</p>
                      <p>{role.hours}</p>
                    </div>
                    <p className="text-anchor-gold-vivid font-semibold">
                      View Full Details &rarr;
                    </p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>

          <p className="text-center text-anchor-cream-text/60 mt-8 text-sm">
            Don&apos;t see the right role? You can still{' '}
            <a href="#apply" className="text-anchor-gold-vivid hover:underline">
              send us your details
            </a>{' '}
            and we will keep your application on file.
          </p>
        </Container>
      </Section>

      {/* What We Are Looking For */}
      <Section background="dark" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              title="What We Are Looking For"
              subtitle="The basics we need from every applicant"
            />

            <ul className="space-y-3 text-lg text-anchor-cream-text/80">
              <li className="flex items-start gap-3">
                <span className="text-anchor-gold-vivid mt-1 flex-shrink-0" aria-hidden="true">&#10003;</span>
                Minimum one year of relevant experience in a pub, bar, restaurant, or catering environment
              </li>
              <li className="flex items-start gap-3">
                <span className="text-anchor-gold-vivid mt-1 flex-shrink-0" aria-hidden="true">&#10003;</span>
                Right to work in the UK
              </li>
              <li className="flex items-start gap-3">
                <span className="text-anchor-gold-vivid mt-1 flex-shrink-0" aria-hidden="true">&#10003;</span>
                Reliability and punctuality
              </li>
              <li className="flex items-start gap-3">
                <span className="text-anchor-gold-vivid mt-1 flex-shrink-0" aria-hidden="true">&#10003;</span>
                Ability to work weekends and evenings
              </li>
              <li className="flex items-start gap-3">
                <span className="text-anchor-gold-vivid mt-1 flex-shrink-0" aria-hidden="true">&#10003;</span>
                Reliable transport to and from TW19 6AQ, including late finishes
              </li>
              <li className="flex items-start gap-3">
                <span className="text-anchor-gold-vivid mt-1 flex-shrink-0" aria-hidden="true">&#10003;</span>
                Students welcome if available for at least 12 months
              </li>
            </ul>

            <p className="mt-6 text-anchor-cream-text/60">
              Hospitality jobs in Surrey suit people who enjoy working with the public and are comfortable
              on their feet. If you have worked in{' '}
              <Link href="/food-menu" className="text-anchor-gold-vivid hover:underline">
                a busy kitchen
              </Link>{' '}
              or behind a bar, you already know what to expect.
            </p>
          </div>
        </Container>
      </Section>

      {/* This May Not Suit You If */}
      <Section background="dark" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              title="This May Not Suit You If"
              subtitle="We believe in being upfront"
            />

            <ul className="space-y-3 text-lg text-anchor-cream-text/80">
              <li className="flex items-start gap-3">
                <span className="text-anchor-cream-text/40 mt-1 flex-shrink-0" aria-hidden="true">&#10005;</span>
                You need temporary or short-term work
              </li>
              <li className="flex items-start gap-3">
                <span className="text-anchor-cream-text/40 mt-1 flex-shrink-0" aria-hidden="true">&#10005;</span>
                You cannot reliably get to or from TW19 6AQ
              </li>
              <li className="flex items-start gap-3">
                <span className="text-anchor-cream-text/40 mt-1 flex-shrink-0" aria-hidden="true">&#10005;</span>
                You are not confident working independently during quieter periods
              </li>
            </ul>

            <p className="mt-6 text-anchor-cream-text/60">
              If any of those apply, this probably is not the right fit, and that is fine.
              We would rather be honest now than waste your time.
            </p>
          </div>
        </Container>
      </Section>

      {/* Apply Now */}
      <Section
        id="apply"
        background="dark"
        spacing="md"
        className="bg-anchor-bg border-b border-anchor-gold/15"
      >
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              title="Apply Now"
              subtitle="Fill in the form below and we will be in touch"
            />

            <CareersForm />
          </div>
        </Container>
      </Section>

      {/* Location & Getting Here */}
      <Section background="dark" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              title="Location and Getting Here"
              subtitle="How to find us"
            />

            <div className="space-y-6 text-lg text-anchor-cream-text/80 leading-relaxed">
              <p>
                The Anchor is at Horton Road, Stanwell Moor, Surrey, TW19 6AQ. We are seven
                minutes by car from Heathrow Terminal 5 and two minutes from M25 Junction 14.
              </p>

              <p>
                We are easily accessible from Staines, Ashford, Feltham, Hounslow, Slough,
                Colnbrook, Egham, Windsor, and west London. If you are looking for pub jobs
                near Heathrow Airport or hospitality jobs in Surrey, we are well connected by
                road.
              </p>

              <p>
                Bus routes 441, 442, and 555 run from Heathrow Central Bus Station.
                Be aware that some routes stop early in the evening, so check the timetable
                if you rely on buses for late finishes.
              </p>

              <p>
                Free staff parking is available on site. There is no charge and no time limit
                while you are working.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button asChild size="md" variant="primary">
                  <Link href="/find-us">Find Us and Get Directions</Link>
                </Button>
                <Button asChild size="md" variant="secondary">
                  <Link href="/about">Learn More About The Anchor</Link>
                </Button>
              </div>

              <p className="text-sm text-anchor-cream-text/50 mt-4">
                Explore{' '}
                <Link href="/our-pub" className="text-anchor-gold-vivid hover:underline">
                  our pub
                </Link>
                , the{' '}
                <Link href="/beer-garden" className="text-anchor-gold-vivid hover:underline">
                  beer garden
                </Link>
                , our{' '}
                <Link href="/drinks" className="text-anchor-gold-vivid hover:underline">
                  drinks menu
                </Link>
                , or see{' '}
                <Link href="/whats-on" className="text-anchor-gold-vivid hover:underline">
                  what&apos;s on
                </Link>
                {' '}this week. If you fancy a{' '}
                <Link href="/sunday-lunch" className="text-anchor-gold-vivid hover:underline">
                  Sunday roast
                </Link>
                {' '}before you apply, you are welcome to walk in.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}

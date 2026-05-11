import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HeroWrapper } from '@/components/hero'
import { JsonLd } from '@/components/JsonLd'
import { CareersForm } from '@/components/features/CareersForm'
import {
  Button,
  Container,
  Section,
  SectionHeader,
  Card,
  CardBody,
} from '@/components/ui'
import {
  getActiveCareerRoles,
  getCareerRole,
  buildJobPostingSchema,
  formatCareerPay,
} from '@/lib/careers'

type Props = {
  params: Promise<{ role: string }>
}

export function generateStaticParams(): { role: string }[] {
  return getActiveCareerRoles().map((role) => ({ role: role.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role: slug } = await params
  const role = getCareerRole(slug)
  if (!role) return {}

  return {
    title: role.metaTitle,
    description: role.metaDescription,
    alternates: { canonical: `/join-our-team/${role.slug}` },
    openGraph: {
      title: role.metaTitle,
      description: role.metaDescription,
      url: `/join-our-team/${role.slug}`,
      siteName: 'The Anchor',
      locale: 'en_GB',
      type: 'website',
    },
  }
}

export default async function CareerRolePage({ params }: Props): Promise<React.JSX.Element> {
  const { role: slug } = await params
  const role = getCareerRole(slug)

  if (!role) {
    notFound()
  }

  const jobPostingSchema = buildJobPostingSchema(role)
  const payDisplay = formatCareerPay(role)

  const isBarStaff = role.slug === 'bar-staff'
  const locationKeywords = isBarStaff
    ? 'bar staff jobs in Surrey'
    : 'kitchen jobs in Surrey'

  return (
    <>
      <JsonLd data={jobPostingSchema} />

      {/* Hero */}
      <HeroWrapper
        route="/join-our-team"
        title={role.title}
        description={role.summary}
        variant="default"
        breadcrumbs={[
          { name: 'Join Our Team', href: '/join-our-team' },
          { name: role.title },
        ]}
        primaryCta={
          <Button asChild size="lg" variant="primary" className="w-full sm:w-auto">
            <a href="#apply">Apply for This Role</a>
          </Button>
        }
        secondaryCta={
          <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
            <Link href="/join-our-team">View All Roles</Link>
          </Button>
        }
      />

      {/* Role Overview */}
      <Section background="dark" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              title="About This Role"
              subtitle={`${role.title} at The Anchor, Stanwell Moor`}
            />

            <div className="space-y-4 text-lg text-anchor-cream-text/80 leading-relaxed">
              {isBarStaff ? (
                <>
                  <p>
                    We are looking for an experienced bar team member to join us at The Anchor
                    in Stanwell Moor, near Heathrow Airport. This is a part-time{' '}
                    {locationKeywords.replace('jobs in Surrey', 'role in Surrey')} at an independent
                    village pub with a loyal local following.
                  </p>
                  <p>
                    You will be serving drinks, taking food orders, looking after tables, and
                    helping run our regular events including{' '}
                    <Link href="/whats-on" className="text-anchor-gold-vivid hover:underline">
                      quiz nights, music bingo, and karaoke
                    </Link>
                    . On busy evenings and weekends you will be working alongside the rest of the team.
                    During quieter periods you may be the only person on the bar, so confidence
                    and self-reliance matter.
                  </p>
                  <p>
                    Our customers are mostly regulars, families, and visitors stopping in on
                    their way to or from the airport. The atmosphere is relaxed and friendly,
                    and we are looking for someone who fits that. You can see more about the
                    venue on our{' '}
                    <Link href="/our-pub" className="text-anchor-gold-vivid hover:underline">
                      pub page
                    </Link>{' '}
                    and{' '}
                    <Link href="/beer-garden" className="text-anchor-gold-vivid hover:underline">
                      beer garden page
                    </Link>
                    .
                  </p>
                </>
              ) : (
                <>
                  <p>
                    We are looking for an experienced kitchen team member to join the team at
                    The Anchor in Stanwell Moor, near Heathrow Airport. This is a part-time
                    kitchen role in Surrey at an independent village pub with a 5-star food
                    hygiene rating.
                  </p>
                  <p>
                    You will be preparing and cooking dishes from our{' '}
                    <Link href="/food-menu" className="text-anchor-gold-vivid hover:underline">
                      food menu
                    </Link>
                    , which includes pub classics, stone-baked pizzas, burgers, and sharers.
                    On Sundays you will help prepare and serve our{' '}
                    <Link href="/sunday-lunch" className="text-anchor-gold-vivid hover:underline">
                      traditional Sunday roasts
                    </Link>
                    , which are one of our busiest services.
                  </p>
                  <p>
                    We take food safety seriously and hold the highest Food Standards Agency
                    rating. If you have worked as a chef or in catering in the Staines,
                    Ashford, or Hounslow area, you will know what a busy service looks like.
                    This role suits someone who is comfortable working in a small kitchen team
                    and can manage their station independently.
                  </p>
                </>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* Pay and Hours */}
      <Section background="dark" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              title="Pay and Hours"
            />

            <div className="grid sm:grid-cols-2 gap-6">
              <Card variant="default">
                <CardBody>
                  <h3 className="text-lg font-bold text-anchor-gold-vivid mb-2">Pay</h3>
                  <p className="text-anchor-cream-text/80 text-lg">
                    {payDisplay}
                  </p>
                  {role.pay.holidayPayRolledUp && role.pay.rolledUpEquivalentHourly && (
                    <div className="mt-4 text-sm text-anchor-cream-text/60 space-y-2">
                      <p>
                        If you work 10 hours a week, you would earn &pound;142.40 per week
                        (&pound;{role.pay.baseHourly.toFixed(2)} base plus &pound;1.53 holiday
                        pay per hour). That is about &pound;617 per month or &pound;7,405 per year.
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card variant="default">
                <CardBody>
                  <h3 className="text-lg font-bold text-anchor-gold-vivid mb-2">Hours</h3>
                  <p className="text-anchor-cream-text/80 text-lg">
                    {role.hours}
                  </p>
                  <p className="mt-2 text-sm text-anchor-cream-text/60">
                    Shifts include weekday evenings, weekends, and some bank holidays.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* Responsibilities */}
      <Section background="dark" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              title="What You Will Be Doing"
            />

            <ul className="space-y-3 text-lg text-anchor-cream-text/80">
              {role.responsibilities.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-anchor-gold-vivid mt-1 flex-shrink-0" aria-hidden="true">&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* Requirements */}
      <Section background="dark" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              title="What We Need From You"
            />

            <ul className="space-y-3 text-lg text-anchor-cream-text/80">
              {role.requirements.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-anchor-gold-vivid mt-1 flex-shrink-0" aria-hidden="true">&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* Training and Working Environment */}
      <Section background="dark" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              title="Training and Working Environment"
            />

            <div className="space-y-4 text-lg text-anchor-cream-text/80 leading-relaxed">
              <p>
                We provide training where needed. For this role, that may include:
              </p>

              <ul className="space-y-2">
                {role.training.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-anchor-gold-vivid mt-1 flex-shrink-0" aria-hidden="true">&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>

              <p>
                The Anchor is a traditional village pub, not a chain. The team is small and you
                will work closely with the manager and other staff. We run regular events including{' '}
                <Link href="/whats-on" className="text-anchor-gold-vivid hover:underline">
                  quiz nights, music bingo, karaoke, and live music
                </Link>
                , so no two weeks are quite the same.
              </p>

              <p>
                Our{' '}
                <Link href="/beer-garden" className="text-anchor-gold-vivid hover:underline">
                  beer garden
                </Link>{' '}
                sits under the Heathrow flight path, which is one of the things that
                makes this place different. If you are looking for {locationKeywords} at
                a pub with real character, this could be a good fit.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Application Form */}
      <Section
        id="apply"
        background="dark"
        spacing="md"
        className="bg-anchor-bg-raised border-b border-anchor-gold/15"
      >
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              title={`Apply for ${role.title}`}
              subtitle="Fill in the form below and we will be in touch"
            />

            <CareersForm defaultRole={role.slug} />
          </div>
        </Container>
      </Section>

      {/* Location and Transport */}
      <Section background="dark" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
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
                Colnbrook, Egham, Windsor, and west London. If you are looking for {locationKeywords} near
                Heathrow, we are well connected by road.
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
                  <Link href="/join-our-team">View All Roles</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}

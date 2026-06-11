import Link from 'next/link'
import type { Metadata } from 'next'
import { Button, Card, Container, Icon } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import {
  BulletListSection,
  LocationTransportSection,
  PayNotice,
  QuickFactsBox,
  RecruitmentImageStrip,
  RoleCards,
  StandardsPledge
} from './_components/RecruitmentSections'
import { RecruitmentApplicationForm } from './_components/RecruitmentApplicationForm'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import {
  mainRoleCards,
  poorFitSignals,
  quickFacts,
  recruitmentFaqs,
  roleExpectations,
  strongCandidateTraits,
  workBenefits,
  type RecruitmentRoleValue
} from './recruitmentContent'

type JoinOurTeamPageProps = {
  searchParams?: {
    role?: string | string[]
  }
}

type PublicRecruitmentPosting = {
  id: string
  title: string
  slug: string
  description: string
  requirements: string
  employment_type: string
  positions_available: number
}

export const metadata: Metadata = {
  title: {
    absolute: 'Jobs at The Anchor Pub Near Staines | Bar & Kitchen Roles'
  },
  description:
    'Apply for part-time bar and kitchen jobs at The Anchor, a friendly village pub in Stanwell Moor near Staines and Heathrow Terminal 5. Free parking, clear shifts and a small team.',
  alternates: {
    canonical: '/join-our-team'
  },
  openGraph: {
    title: 'Jobs at The Anchor Pub Near Staines | Bar & Kitchen Roles',
    description:
      'Apply for part-time bar and kitchen jobs at The Anchor in Stanwell Moor near Staines and Heathrow Terminal 5.',
    url: '/join-our-team',
    images: [
      {
        url: '/images/our-pub/the-anchor-bar.jpg',
        width: 1200,
        height: 630,
        alt: 'The Anchor bar in Stanwell Moor near Heathrow'
      }
    ]
  },
  twitter: getTwitterMetadata({
    title: 'Jobs at The Anchor Pub Near Staines | Bar & Kitchen Roles',
    description:
      'Part-time bar and kitchen jobs at The Anchor in Stanwell Moor near Staines and Heathrow Terminal 5.',
    images: ['/images/our-pub/the-anchor-bar.jpg']
  })
}

function rawRoleParam(searchParams?: JoinOurTeamPageProps['searchParams']): string | undefined {
  const rawRole = Array.isArray(searchParams?.role) ? searchParams?.role[0] : searchParams?.role
  return rawRole
}

function resolveInitialRole(searchParams?: JoinOurTeamPageProps['searchParams']): RecruitmentRoleValue {
  const rawRole = rawRoleParam(searchParams)

  if (rawRole === 'bar-staff') return 'Bar Staff'
  if (rawRole === 'kitchen-team') return 'Kitchen Team'
  if (rawRole === 'either-role') return 'Either role'
  return 'Not sure yet'
}

function normalizeManagementApiBaseUrl(value: string): string {
  const normalized = value.trim().replace(/\/+$/, '')
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`
}

function recruitmentManagementApiBaseUrl(): string {
  const configuredBaseUrl =
    process.env.RECRUITMENT_MANAGEMENT_API_BASE_URL ||
    process.env.MANAGEMENT_API_BASE_URL ||
    process.env.NEXT_PUBLIC_MANAGEMENT_APP_URL

  return configuredBaseUrl
    ? normalizeManagementApiBaseUrl(configuredBaseUrl)
    : getManagementApiBaseUrl()
}

async function getPublicRecruitmentPostings(): Promise<PublicRecruitmentPosting[]> {
  try {
    const response = await fetch(`${recruitmentManagementApiBaseUrl()}/recruitment/postings`, {
      cache: 'no-store'
    })
    if (!response.ok) return []
    const payload = await response.json()
    return Array.isArray(payload?.data?.postings) ? payload.data.postings : []
  } catch {
    return []
  }
}

function roleCardsFromPostings(postings: PublicRecruitmentPosting[]) {
  if (postings.length === 0) return mainRoleCards

  return postings.map((posting) => ({
    title: posting.title,
    href: `/join-our-team?role=${encodeURIComponent(posting.slug || posting.title)}#apply`,
    description: posting.description,
    outcome: posting.requirements,
    cta: 'Apply for this role'
  }))
}

export default async function JoinOurTeamPage({ searchParams }: JoinOurTeamPageProps) {
  const dynamicPostings = await getPublicRecruitmentPostings()
  const currentRoleCards = roleCardsFromPostings(dynamicPostings)
  const requestedRole = rawRoleParam(searchParams)
  const dynamicInitialRole = dynamicPostings.find((posting) =>
    posting.slug === requestedRole || posting.title === requestedRole
  )?.title
  const initialRole = dynamicInitialRole ?? resolveInitialRole(searchParams)

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.the-anchor.pub' },
          { name: 'Join Our Team', url: 'https://www.the-anchor.pub/join-our-team' }
        ]}
      />

      <InteriorHero
        image="/images/our-pub/the-anchor-bar.jpg"
        focal="50% 45%"
        crumb="Join Our Team"
        title="Join a small, friendly pub team near Staines"
        lead="We are looking for experienced bar and kitchen team members who want regular part-time shifts, a well-run rota, free parking, and a friendly village pub environment."
        actions={
          <>
            <Button asChild size="lg">
              <Link href="#current-roles">
                <Icon name="briefcase" className="h-4 w-4" aria-hidden="true" />
                View Current Roles
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#apply">
                <Icon name="send" className="h-4 w-4" aria-hidden="true" />
                Apply Now
              </Link>
            </Button>
          </>
        }
      />

      <section className="theme-dark bg-anchor-green-deep border-b border-anchor-gold-dark/15 py-8">
        <Container>
          <Card variant="dark" accent className="max-w-4xl p-6">
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <RecruitmentFact label="Current roles" value="Bar Staff and Kitchen Team" />
              <RecruitmentFact label="Location" value="The Anchor, Stanwell Moor, TW19 6AQ" />
              <RecruitmentFact label="Pay" value="£12.71 per hour base rate" />
              <RecruitmentFact label="Hours" value="Part-time, mainly evenings and weekends" />
            </dl>
          </Card>
        </Container>
      </section>

      <section className="py-section-y bg-canvas border-b border-line">
        <Container>
          <div className="mb-8 max-w-4xl space-y-4 text-ink-muted">
            <p>
              You will be working in a proper local pub with regular customers, busy event nights, Sunday
              roasts, private bookings and a small team that expects people to turn up, work properly and take
              pride in the job.
            </p>
            <p>
              At The Anchor, our aim is simple: deliver brilliant basics every day, then go the extra mile to
              give guests a warm, memorable experience that makes them want to come back.
            </p>
          </div>
          <QuickFactsBox facts={quickFacts} />
        </Container>
      </section>

      <section id="current-roles" className="py-section-y bg-surface border-b border-line">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 max-w-3xl">
              <h2 className="text-3xl text-ink-strong">Current roles</h2>
              <p className="mt-3 text-ink-muted">
                We are recruiting for part-time pub jobs near Heathrow, including bar staff jobs in Stanwell
                Moor and kitchen jobs in Stanwell Moor.
              </p>
            </div>
            <RoleCards roles={currentRoleCards} />
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas border-b border-line">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <div>
              <h2 className="text-3xl text-ink-strong">Why work at The Anchor?</h2>
              <div className="mt-5 space-y-4 text-ink-muted">
                <p>
                  The Anchor is a village pub near Heathrow Terminal 5 with regular local customers, food
                  service, events, private bookings and a growing reputation.
                </p>
                <p>
                  We are not trying to be just another pub. We are working to build a stronger business with
                  better food, better service, better events and a meaningful place in the local community.
                </p>
                <p>
                  That means we need people who care about the details: clean tables, warm welcomes,
                  consistent food, good service, tidy working areas and guests who feel properly looked after.
                </p>
              </div>
              <BulletListSection
                title="You can expect"
                items={workBenefits}
                className="mt-8"
              />
            </div>
            <div className="space-y-6">
              <PayNotice />
              <StandardsPledge />
              <RecruitmentImageStrip />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface border-b border-line">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <BulletListSection
              title="Who does well at The Anchor?"
              intro="You will probably enjoy working here if you:"
              items={strongCandidateTraits}
            />
            <BulletListSection
              title="What we expect"
              intro="We are looking for people who are reliable, experienced and proud of doing things properly. That means:"
              items={roleExpectations}
            />
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas border-b border-line">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr]">
            <BulletListSection
              title="This may not suit you if"
              intro="This probably is not the right role if:"
              items={poorFitSignals}
            />
            <div className="rounded-md border border-line border-t-[3px] border-t-anchor-gold bg-surface p-6 shadow-sm">
              <h2 className="text-3xl text-ink-strong">A note from the owner, Billy</h2>
              <div className="mt-5 space-y-4 text-ink-muted">
                <p>
                  At The Anchor, I want to build the kind of pub people are proud to work in and guests are
                  pleased to come back to. That starts with the basics:{' '}
                  <strong className="text-ink-strong">
                    a clean pub, warm welcomes, well-kept drinks, good food and reliable service
                  </strong>
                  .
                </p>
                <p>
                  I can set the direction, but{' '}
                  <strong className="text-ink-strong">the team is what makes it happen</strong> on every
                  shift. The bar team, kitchen team and floor team all shape how guests experience The Anchor,
                  from a well-poured pint and a clean table to a properly prepared plate of food and a calm,
                  helpful attitude.
                </p>
                <p>
                  I am looking for reliable, experienced people who{' '}
                  <strong className="text-ink-strong">care about standards</strong>. Being on time,
                  keeping working areas clean, speaking to guests well, following food safety and hygiene
                  standards, and helping the rest of the team all matter here.
                </p>
                <p>
                  My aim is for The Anchor to keep growing in the right way: better food, better service,
                  better events and{' '}
                  <strong className="text-ink-strong">a stronger place in the local community</strong>.
                  If you are friendly, reliable, experienced and proud of good service, I would be very happy
                  to hear from you.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="apply" className="py-section-y bg-surface border-b border-line scroll-mt-28">
        <Container>
          <div className="mx-auto max-w-4xl">
            <RecruitmentApplicationForm
              initialRole={initialRole}
              postingOptions={dynamicPostings.map((posting) => ({
                id: posting.id,
                title: posting.title,
                slug: posting.slug
              }))}
            />
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas border-b border-line">
        <Container>
          <LocationTransportSection />
        </Container>
      </section>

      <FAQAccordionWithSchema
        title="Recruitment FAQs"
        faqs={recruitmentFaqs}
      />
    </>
  )
}

function RecruitmentFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-anchor-gold-bright">{label}</dt>
      <dd className="mt-1 font-medium text-anchor-cream-text">{value}</dd>
    </div>
  )
}

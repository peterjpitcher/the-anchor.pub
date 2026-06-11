import Link from 'next/link'
import { Button, Container, Icon } from '@/components/ui'
import { CONTACT } from '@/lib/constants'
import {
  recruitmentDatePosted,
  recruitmentValidThrough,
  type RecruitmentRolePage as RecruitmentRolePageContent
} from '../recruitmentContent'
import {
  BulletListSection,
  LocationTransportSection,
  RoleQuickFacts,
  StandardsPledge
} from './RecruitmentSections'

export function buildJobPostingSchema(role: RecruitmentRolePageContent) {
  const roleUrl = `https://www.the-anchor.pub/join-our-team/${role.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: `${role.role} at The Anchor`,
    description: role.jobPostingDescription,
    datePosted: recruitmentDatePosted,
    validThrough: recruitmentValidThrough,
    directApply: true,
    employmentType: 'PART_TIME',
    industry: ['Hospitality', 'Pub', 'Food and Beverage'],
    url: roleUrl,
    workHours: role.workHours,
    hiringOrganization: {
      '@type': 'Organization',
      name: 'The Anchor',
      sameAs: 'https://www.the-anchor.pub',
      logo: 'https://www.the-anchor.pub/images/branding/the-anchor-pub-logo-black-transparent.png'
    },
    jobLocation: {
      '@type': 'Place',
      name: 'The Anchor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: CONTACT.address.street,
        addressLocality: CONTACT.address.town,
        addressRegion: CONTACT.address.county,
        postalCode: CONTACT.address.postcode,
        addressCountry: CONTACT.address.country
      }
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'GBP',
      value: {
        '@type': 'QuantitativeValue',
        value: 12.71,
        unitText: 'HOUR'
      }
    }
  }
}

export function RecruitmentRoleBody({ role }: { role: RecruitmentRolePageContent }) {
  return (
    <>
      <section className="py-section-y bg-canvas border-b border-line">
        <Container>
          <RoleQuickFacts role={role.role} />
        </Container>
      </section>

      <section className="py-section-y bg-surface border-b border-line">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl text-ink-strong">{role.aboutTitle}</h2>
            <div className="mt-5 space-y-4 text-ink-muted">
              {role.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas border-b border-line">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <BulletListSection
              title={role.shiftsTitle}
              intro="Typical shifts may include:"
              items={role.shifts}
            />
            <BulletListSection
              title={role.dutiesTitle}
              intro={role.dutiesIntro}
              items={role.duties}
            />
          </div>
        </Container>
      </section>

      {role.standards && role.standardsTitle && role.standardsIntro ? (
        <section className="py-section-y bg-surface border-b border-line">
          <Container>
            <BulletListSection
              title={role.standardsTitle}
              intro={role.standardsIntro}
              items={role.standards}
            />
          </Container>
        </section>
      ) : null}

      <section className="py-section-y bg-canvas border-b border-line">
        <Container>
          <StandardsPledge />
        </Container>
      </section>

      <section className="py-section-y bg-surface border-b border-line">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <BulletListSection
              title="What we are looking for"
              intro="We are looking for someone who:"
              items={role.lookingFor}
            />
            <BulletListSection
              title="Nice to have"
              intro="These are helpful, but not essential:"
              items={role.niceToHave}
            />
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-canvas border-b border-line">
        <Container>
          <div className="mx-auto max-w-4xl rounded-md border border-line border-t-[3px] border-t-anchor-gold bg-surface p-6 text-center shadow-sm">
            <h2 className="text-3xl text-ink-strong">What you can expect from us</h2>
            <p className="mx-auto mt-4 max-w-3xl text-ink-muted">{role.expectationIntro}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={`/join-our-team?role=${role.slug}#apply`}>
                  <Icon name="send" className="h-4 w-4" aria-hidden="true" />
                  Apply Now
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/join-our-team#current-roles">
                  <Icon name="arrowLeft" className="h-4 w-4" aria-hidden="true" />
                  Compare Roles
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-section-y bg-surface border-b border-line">
        <Container>
          <LocationTransportSection />
        </Container>
      </section>
    </>
  )
}

export function RoleHeroFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/20 bg-black/25 px-4 py-3 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-anchor-gold-bright">{label}</p>
      <p className="mt-1 text-white">{value}</p>
    </div>
  )
}

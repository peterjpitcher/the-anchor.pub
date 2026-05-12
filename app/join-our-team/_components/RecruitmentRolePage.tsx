import Link from 'next/link'
import { Button, Container, Icon } from '@/components/ui'
import { CONTACT } from '@/lib/constants'
import {
  recruitmentDatePosted,
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
      <section className="section-spacing-md bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <RoleQuickFacts role={role.role} />
        </Container>
      </section>

      <section className="section-spacing-md bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-anchor-gold-vivid">{role.aboutTitle}</h2>
            <div className="mt-5 space-y-4 text-anchor-cream-text/75">
              {role.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing-md bg-anchor-bg border-b border-anchor-gold/15">
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
        <section className="section-spacing-md bg-anchor-bg-raised border-b border-anchor-gold/15">
          <Container>
            <BulletListSection
              title={role.standardsTitle}
              intro={role.standardsIntro}
              items={role.standards}
            />
          </Container>
        </section>
      ) : null}

      <section className="section-spacing-md bg-anchor-bg-card border-b border-anchor-gold/15">
        <Container>
          <StandardsPledge />
        </Container>
      </section>

      <section className="section-spacing-md bg-anchor-bg border-b border-anchor-gold/15">
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

      <section className="section-spacing-md bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="mx-auto max-w-4xl rounded-lg border border-anchor-gold/20 bg-anchor-bg-card p-6 text-center">
            <h2 className="text-3xl font-bold text-anchor-gold-vivid">What you can expect from us</h2>
            <p className="mx-auto mt-4 max-w-3xl text-anchor-cream-text/75">{role.expectationIntro}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={`/join-our-team?role=${role.slug}#apply`}>
                  <Icon name="send" className="h-4 w-4" aria-hidden="true" />
                  Apply Now
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                <Link href="/join-our-team#current-roles">
                  <Icon name="arrowLeft" className="h-4 w-4" aria-hidden="true" />
                  Compare Roles
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing-md bg-anchor-bg border-b border-anchor-gold/15">
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

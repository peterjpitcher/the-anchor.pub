import type { Metadata } from 'next'
import Link from 'next/link'
import { Button, Card, Container, Icon } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { buildJobPostingSchema, RecruitmentRoleBody } from '../_components/RecruitmentRolePage'
import { recruitmentRolePages } from '../recruitmentContent'

const role = recruitmentRolePages['kitchen-team']

export const metadata: Metadata = {
  title: {
    absolute: role.metaTitle
  },
  description: role.metaDescription,
  alternates: {
    canonical: '/join-our-team/kitchen-team'
  },
  openGraph: {
    title: role.metaTitle,
    description: role.metaDescription,
    url: '/join-our-team/kitchen-team',
    images: [
      {
        url: role.image.src,
        width: 1200,
        height: 630,
        alt: role.image.alt
      }
    ]
  },
  twitter: getTwitterMetadata({
    title: role.metaTitle,
    description: role.metaDescription,
    images: [role.image.src]
  })
}

export default function KitchenTeamRecruitmentPage() {
  const applyHref = `/join-our-team?role=${role.slug}#apply`

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.the-anchor.pub' },
          { name: 'Join Our Team', url: 'https://www.the-anchor.pub/join-our-team' },
          { name: role.title, url: `https://www.the-anchor.pub/join-our-team/${role.slug}` }
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(buildJobPostingSchema(role)) }}
      />

      <InteriorHero
        image={role.image.src}
        crumb={role.title}
        title={role.heroTitle}
        lead={role.heroIntro[0]}
        actions={
          <>
            <Button asChild size="lg">
              <Link href={applyHref}>
                <Icon name="send" className="h-4 w-4" aria-hidden="true" />
                Apply for Kitchen Team Role
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/join-our-team">
                <Icon name="briefcase" className="h-4 w-4" aria-hidden="true" />
                View All Roles
              </Link>
            </Button>
          </>
        }
      />

      <section className="bg-surface-sunk border-b border-line py-8">
        <Container>
          <Card accent className="p-6">
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <RoleFact label="Pay" value="£12.71 per hour base rate" />
              <RoleFact label="Hours" value="Part-time, mainly evenings and weekends" />
              <RoleFact label="Location" value="The Anchor, Stanwell Moor, TW19 6AQ" />
              <RoleFact label="Parking" value="Free on-site parking" />
            </dl>
          </Card>
        </Container>
      </section>

      <RecruitmentRoleBody role={role} />
    </>
  )
}

function RoleFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-accent-text">{label}</dt>
      <dd className="mt-1 font-medium text-ink-strong">{value}</dd>
    </div>
  )
}

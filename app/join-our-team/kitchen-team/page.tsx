import type { Metadata } from 'next'
import Link from 'next/link'
import { Button, Icon } from '@/components/ui'
import { HeroWrapper } from '@/components/hero'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { buildJobPostingSchema, RecruitmentRoleBody, RoleHeroFact } from '../_components/RecruitmentRolePage'
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

      <HeroWrapper
        route={`/join-our-team/${role.slug}`}
        title={role.heroTitle}
        titleClassName="text-4xl sm:text-5xl md:text-5xl lg:text-5xl"
        variant="feature"
        size="large"
        alignment="left"
        overlay="dark"
        contentClassName="!max-w-6xl pb-28 lg:pb-32"
        image={{
          src: role.image.src,
          alt: role.image.alt,
          objectPosition: '50% 50%'
        }}
        lead={
          <div className="max-w-3xl space-y-4 text-base text-white/90 sm:text-lg">
            <p>{role.heroIntro[0]}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={applyHref}>
                  <Icon name="send" className="h-4 w-4" aria-hidden="true" />
                  Apply for Kitchen Team Role
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                <Link href="/join-our-team">
                  <Icon name="briefcase" className="h-4 w-4" aria-hidden="true" />
                  View All Roles
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 pt-2 text-sm sm:grid-cols-2">
              <RoleHeroFact label="Pay" value="£12.71 per hour base rate" />
              <RoleHeroFact label="Hours" value="Part-time, mainly evenings and weekends" />
              <RoleHeroFact label="Location" value="The Anchor, Stanwell Moor, TW19 6AQ" />
              <RoleHeroFact label="Parking" value="Free on-site parking" />
            </div>
          </div>
        }
      />

      <RecruitmentRoleBody role={role} />
    </>
  )
}

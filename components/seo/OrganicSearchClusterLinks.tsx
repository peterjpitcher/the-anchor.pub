import Link from 'next/link'
import {
  getOrganicSearchCluster,
  type OrganicSearchClusterKey
} from '@/lib/seo/organic-search-map'
import { Container, Section } from '@/components/ui'

type OrganicSearchClusterLinksProps = {
  cluster: OrganicSearchClusterKey
  title?: string
  intro?: string
  currentPath?: string
  className?: string
}

export function OrganicSearchClusterLinks({
  cluster,
  title,
  intro,
  currentPath,
  className = ''
}: OrganicSearchClusterLinksProps) {
  const seoCluster = getOrganicSearchCluster(cluster)
  const links = [
    {
      href: seoCluster.primaryRoute,
      label: seoCluster.primaryAnchor,
      description: seoCluster.targetIntent
    },
    ...seoCluster.supportingRoutes.map((link) => ({
      href: link.href,
      label: link.anchor,
      description: link.description
    }))
  ].filter((link) => link.href !== currentPath)

  if (links.length === 0) return null

  return (
    <Section className={`bg-anchor-bg-raised border-y border-anchor-gold/15 ${className}`}>
      <Container>
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-anchor-gold">
              {seoCluster.label}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-anchor-cream-text">
              {title || 'Related Heathrow guides'}
            </h2>
            {intro && (
              <p className="mt-3 text-anchor-cream-text/70">
                {intro}
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {links.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block border border-anchor-gold/15 bg-anchor-bg-card p-5 transition-colors hover:border-anchor-gold/45"
              >
                <h3 className="text-lg font-semibold text-anchor-gold-vivid">
                  {link.label}
                </h3>
                <p className="mt-2 text-sm text-anchor-cream-text/70">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}

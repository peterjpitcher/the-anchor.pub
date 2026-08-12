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
    <Section className={`bg-surface-sunk border-y border-line ${className}`}>
      <Container>
        <div className="mx-auto">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent-text">
              {seoCluster.label}
            </p>
            <h2 className="mt-2 text-h3 text-ink-strong">
              {title || 'Related Heathrow guides'}
            </h2>
            {intro && (
              <p className="mt-3 text-ink-muted">
                {intro}
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {links.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md border border-line bg-surface p-5 shadow-sm transition-colors hover:border-line-strong"
              >
                <h3 className="text-lg font-semibold text-accent-text">
                  {link.label}
                </h3>
                <p className="mt-2 text-sm text-ink-muted">
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

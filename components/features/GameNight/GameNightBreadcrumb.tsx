import type { ReactElement } from 'react'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import type { GameNightConfig } from '@/lib/game-nights'

/**
 * `BreadcrumbList` markup for a game night page.
 *
 * All four pages render a visible `Home / <crumb>` trail through InteriorHero
 * and none of them emitted the matching markup, while /whats-on and /live-sport
 * both did. Google requires the markup to describe the trail the visitor can
 * actually see, so both halves are built from the same `config.hero.crumb`
 * rather than being typed out twice and left to drift.
 *
 * The trail is two levels on purpose. There is no /whats-on parent in the
 * visible breadcrumb on these pages, so putting one in the markup would
 * describe a path that is not on the page.
 */
export function GameNightBreadcrumb({ config }: { config: GameNightConfig }): ReactElement {
  return (
    <BreadcrumbJsonLd
      items={[
        { name: 'Home', url: '/' },
        { name: config.hero.crumb, url: `/${config.slug}` }
      ]}
    />
  )
}

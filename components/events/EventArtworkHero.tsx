import { type CSSProperties, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface EventArtworkHeroProps {
  /** The event's own artwork. Never a generic fallback image. */
  image: string
  imageAlt: string
  /** True when the artwork is the 16:9 landscape rather than the 1:1 square. */
  wide: boolean
  title: string
  lead?: string
  crumb: string
  badges?: ReactNode
  actions?: ReactNode
}

/**
 * The event hero for nights that have their own designed artwork.
 *
 * InteriorHero washes its background in a scrim from 92% down to 34% opacity so
 * white text stays readable over a photograph. That is right for photography and
 * wrong for a designed poster: the artwork already carries the event name, date,
 * time and price as part of the design, so the scrim buries it and the hero copy
 * then repeats it on top of itself.
 *
 * So the artwork gets shown clean, at its own shape, with nothing over it, and
 * the breadcrumb, heading, lead and actions sit underneath on the same dark band.
 * Events with no artwork of their own keep InteriorHero.
 */
export function EventArtworkHero({
  image,
  imageAlt,
  wide,
  title,
  lead,
  crumb,
  badges,
  actions
}: EventArtworkHeroProps) {
  return (
    <section data-hero className="theme-dark relative overflow-hidden bg-anchor-green-deep">
      {/* Capped by viewport height as well as width, so the artwork is fully
          visible on a laptop instead of pushing the whole page below the fold.
          object-contain because a poster that has been cropped has lost the
          point of being a poster. */}
      <div className="mx-auto flex w-full items-center justify-center px-4 pt-6 sm:px-6">
        {/* Width drives the box and the aspect ratio derives the height, with the
            max-width picked so the height lands near 500px at full size. Setting
            an explicit height instead letterboxed the artwork on mobile, because
            the width clamp does not feed back into an already-definite height. */}
        <div
          className="relative w-full overflow-hidden rounded-xl shadow-lg"
          style={{
            aspectRatio: wide ? '16 / 9' : '1 / 1',
            maxWidth: wide ? '890px' : '500px'
          }}
        >
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 1180px) 100vw, 1180px"
            className="object-contain"
          />
        </div>
      </div>

      {/* Film grain only, matching the interior hero's dark surface texture. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] opacity-[0.06] bg-[var(--grain)]" />

      <div className="container relative z-[2] w-full">
        <div
          className="flex max-w-[760px] flex-col gap-4"
          style={{ paddingBlock: 'clamp(1.75rem, 4vw, 3rem)' } as CSSProperties}
        >
          <nav aria-label="Breadcrumb" className="text-xs text-anchor-cream-text/[0.72]">
            <Link href="/" className="transition-colors hover:text-anchor-gold-bright">
              Home
            </Link>
            <span aria-hidden className="px-1.5">
              /
            </span>
            <span>{crumb}</span>
          </nav>

          <h1 className="font-display text-h1 text-anchor-cream-text">{title}</h1>

          {lead && <p className="max-w-[54ch] text-xl text-anchor-cream-text/90">{lead}</p>}

          {badges && <div className="flex flex-wrap gap-2">{badges}</div>}

          {actions && (
            <div className="flex flex-col flex-wrap gap-3 sm:flex-row [&>*]:w-full sm:[&>*]:w-auto">
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

import { type CSSProperties, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cva } from 'class-variance-authority'

/**
 * The artwork frame.
 *
 * Width drives the box and the aspect ratio derives the height. Setting an
 * explicit height instead letterboxed the artwork on mobile, because the width
 * clamp does not feed back into an already-definite height, so the desktop cap
 * is expressed as a max-width too: for a square that is the height, for a 16:9
 * poster it is the height multiplied by 16/9. The ratio is therefore never
 * touched and the poster is neither cropped nor stretched, only smaller.
 *
 * The `lg:` cap is the fold fix (EV-010). At 1440x900 the poster ran from y150
 * to y651 and pushed the H1, the date and price line and the "Book tickets"
 * button (bottom at y1067) below the fold, so the only thing selling the event
 * above it was the artwork. Below the poster the hero needs a fixed 416px for
 * the breadcrumb, heading, lead, badges and buttons, and the header plus the
 * top padding take 150px above it, so the poster may have `100vh - 592px`
 * (37rem) and still leave the primary CTA about 26px clear of the fold. The
 * 220px floor stops a short desktop window shrinking the artwork to nothing.
 *
 * Nothing below `lg` changes: at 375x812 the name, date, price and Book button
 * were already in the first viewport, and the mobile max-width is untouched.
 *
 * The cap travels as a custom property that the element's own `max-width` reads,
 * rather than as a `max-w-[...]` utility, because scripts/audit-page-width.js
 * bans arbitrary width caps of 600px and up in class names. That rule is about
 * page-content width fighting `.container`; this is the frame around one image,
 * and it carried exactly this 890px cap as an inline style before the fold fix.
 * Keeping the declaration inline leaves the audit's surface where it was.
 */
const artworkFrame = cva('relative w-full overflow-hidden rounded-xl shadow-lg', {
  variants: {
    wide: {
      true: 'aspect-[16/9] [--artwork-frame-max:890px] lg:[--artwork-frame-max:clamp(391px,calc((100vh_-_37rem)*16/9),890px)]',
      false: 'aspect-square [--artwork-frame-max:500px] lg:[--artwork-frame-max:clamp(220px,calc(100vh_-_37rem),500px)]'
    }
  },
  defaultVariants: {
    wide: false
  }
})

export interface EventArtworkHeroProps {
  /** The event's own artwork. Never a generic fallback image. */
  image: string
  imageAlt: string
  /** True when the artwork is the 16:9 landscape rather than the 1:1 square. */
  wide: boolean
  title: string
  lead?: string
  crumb: string
  /**
   * Where the crumb leads: the event's category hub, the same URL the
   * BreadcrumbList JSON-LD declares. Plain text when absent.
   */
  crumbHref?: string
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
  crumbHref,
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
        <div
          className={artworkFrame({ wide })}
          data-event-artwork-frame
          style={{ maxWidth: 'var(--artwork-frame-max)' }}
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
          className="flex flex-col gap-4"
          style={{ paddingBlock: 'clamp(1.75rem, 4vw, 3rem)' } as CSSProperties}
        >
          <nav aria-label="Breadcrumb" className="text-xs text-anchor-cream-text/[0.72]">
            <Link href="/" className="transition-colors hover:text-anchor-gold-bright">
              Home
            </Link>
            <span aria-hidden className="px-1.5">
              /
            </span>
            {/* A link, as the JSON-LD breadcrumb already declares it. As plain
                text it was a dead end, and the hub link further down sits
                below the form on a phone. */}
            {crumbHref ? (
              <Link href={crumbHref} className="transition-colors hover:text-anchor-gold-bright">
                {crumb}
              </Link>
            ) : (
              <span>{crumb}</span>
            )}
          </nav>

          <h1 className="font-display text-h1 text-anchor-cream-text">{title}</h1>

          {lead && <p className="text-xl text-anchor-cream-text/90">{lead}</p>}

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

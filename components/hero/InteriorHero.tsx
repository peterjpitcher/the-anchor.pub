import { type CSSProperties, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface InteriorHeroProps {
  /** Full-bleed background image src (decorative). */
  image: string
  /** CSS object-position for the background image. */
  focal?: string
  /** Small uppercase label above the title (gold-bright). */
  kicker?: string
  /** The page H1. */
  title: string
  /** Supporting sentence below the title. */
  lead?: string
  /** Human-readable breadcrumb label for the current page (e.g. "Food"). */
  crumb: string
  /** Pill badges — render as <Badge variant="sand"> elements. */
  badges?: ReactNode
  /** Hero actions — one primary lg + at most one outline lg. */
  actions?: ReactNode
}

// Exact two-gradient scrim from spec §5.1 (source: site.css .ta-hero--interior).
const SCRIM_BACKGROUND =
  'linear-gradient(95deg, rgba(12,29,17,0.92) 0%, rgba(12,29,17,0.74) 46%, rgba(12,29,17,0.34) 100%), linear-gradient(0deg, rgba(12,29,17,0.55) 0%, rgba(12,29,17,0) 45%)'

/**
 * InteriorHero — the single hero used by every interior page (spec §5.1).
 *
 * Dark, image-led band: full-bleed background photo behind a fixed green scrim
 * and film grain, with breadcrumb, kicker, H1, lead, badges and actions stacked
 * at the bottom-left inside the 1280 container. Only the image, copy and CTAs
 * change between pages. The homepage hero is the sole exception.
 */
export function InteriorHero({
  image,
  focal = '50% 50%',
  kicker,
  title,
  lead,
  crumb,
  badges,
  actions
}: InteriorHeroProps) {
  return (
    <section
      className="theme-dark relative flex min-h-[clamp(380px,50vh,540px)] items-end overflow-hidden bg-anchor-green-deep"
    >
      {/* Full-bleed decorative background image. */}
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: focal }}
      />

      {/* Scrim layer — fixed two-gradient wash for legible text on any photo. */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1]"
        style={{ background: SCRIM_BACKGROUND }}
      />

      {/* Film grain — dark-surface texture at 6% opacity. */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1] opacity-[0.06] bg-[var(--grain)]"
      />

      {/* Content — bottom-left, capped at 760px inside the 1280 container. */}
      <div className="container relative z-[2] w-full">
        <div
          className="flex max-w-[760px] flex-col gap-4"
          style={{ paddingBlock: 'clamp(2.5rem, 6vw, 4.5rem)' } as CSSProperties}
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

          {kicker && (
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-anchor-gold-bright">
              {kicker}
            </p>
          )}

          <h1 className="font-display text-h1 text-anchor-cream-text">{title}</h1>

          {lead && (
            <p className="max-w-[54ch] text-xl text-anchor-cream-text/90">{lead}</p>
          )}

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

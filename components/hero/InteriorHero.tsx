import { type CSSProperties, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HeroFrost } from '@/components/seasonal/HeroFrost'
import { HERO_BADGE_FILL, HERO_SCRIM_BANDS, heroScrimBackground } from '@/lib/hero-scrim'

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
  /** One short line above the actions, for what the buttons do not say. */
  note?: string
}

// The wash over the photo, one per width band. The numbers and the reasons are
// in lib/hero-scrim.ts: under the text column it never drops below the level at
// which every text style here reads at 4.5:1 over a pure white photo.
// Each band is shown only at its own widths (the classes are written out in
// full because Tailwind cannot see a class name that is built at run time).
const SCRIM_BAND_CLASSES = ['lg:hidden', 'hidden lg:block xl:hidden', 'hidden xl:block'] as const

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
  actions,
  note
}: InteriorHeroProps) {
  return (
    <section
      data-hero
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

      {/* Seasonal frost, drawn UNDER the wash (owner decision 19, 7 October
          2026). It used to sit on top, where it lightened the corners the
          breadcrumb and badges sit in. Underneath, it shows where the wash is
          thin, which is where there is no text, and cannot lighten anything the
          text sits on. Invisible outside 1 Nov to 31 Dec: its opacity comes
          from --winter-frost, which the root layout only emits in season. */}
      <HeroFrost />

      {/* Scrim layer: the wash that keeps text legible on any photo. */}
      {HERO_SCRIM_BANDS.map((band, index) => (
        <div
          key={band.minWidth}
          aria-hidden
          data-hero-scrim={band.minWidth}
          className={`absolute inset-0 z-[1] ${SCRIM_BAND_CLASSES[index]}`}
          style={{ background: heroScrimBackground(band) }}
        />
      ))}

      {/* Film grain: dark-surface texture at 6% opacity. */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1] opacity-[0.06] bg-[var(--grain)]"
      />

      {/* Content: bottom-left, capped at 760px inside the 1280 container from
          lg up, so it stays on the part of the photo the wash holds dark. */}
      <div className="container relative z-[2] w-full">
        <div
          data-hero-text
          className="flex flex-col gap-4 lg:max-w-[760px]"
          style={{ paddingBlock: 'clamp(2.5rem, 6vw, 4.5rem)' } as CSSProperties}
        >
          <nav aria-label="Breadcrumb" className="text-xs text-anchor-cream-text/90">
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
            <p className="text-xl text-anchor-cream-text/90">{lead}</p>
          )}

          {/* Sand badges get a solid fill here. Their dark-surface fill is gold
              at 16%, which let a light photo show through the pill. */}
          {badges && (
            <div className="flex flex-wrap gap-2" style={{ '--tile': HERO_BADGE_FILL } as CSSProperties}>
              {badges}
            </div>
          )}

          {/* Above the actions, not below them. On a phone three stacked buttons
              pushed it to the foot of the first screen, 23px clear of the cookie
              banner at 375 x 812 and hidden behind it on anything shorter, and
              most ad visitors never scroll (owner decision, 3 October 2026). */}
          {note && (
            <p data-hero-note className="text-base font-semibold text-anchor-cream-text">
              {note}
            </p>
          )}

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

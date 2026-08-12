import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { StatusBar } from '@/components/layout/StatusBar'
import { BookTableButton } from '@/components/BookTableButton'
import { HeroFrost } from '@/components/seasonal/HeroFrost'
import type { MonthlyHomepageCopy } from '@/lib/monthly-copy'

// HomeHero — the homepage's special hero (redesign spec §7.1). This is the ONLY
// non-InteriorHero hero on the site. A full-bleed photographic hero with a green
// scrim + 6% grain, centred content (max-width 880px), the white wordmark, the
// brand H1/script lines, the live StatusBar pill, a Google review row, and four
// sand amenity chips.
//
// Stable facts are SSOT-confirmed: around 7 mins from T5, free parking, dog
// friendly, beer garden (SSOT §2/§3/§4). Review counts are volatile and not
// hardcoded.

interface HomeHeroProps {
  /** Full-bleed background image src. */
  image: string
  /** Alt text — decorative scrim sits over it, but a meaningful alt aids SEO. */
  imageAlt: string
  /** CSS object-position for the background image (e.g. '50% 40%'). */
  focal?: string
  /** Optional low-quality blur placeholder. */
  blurDataURL?: string
  /**
   * This month's copy, from lib/monthly-copy.ts. Passed in rather than read
   * here so the hero stays presentational and the copy stays unit-testable on
   * its own. The H1 is deliberately absent: "Eat, Drink, Enjoy." is the brand
   * motto (SSOT section 1) and never changes.
   */
  copy: MonthlyHomepageCopy
}

export function HomeHero({ image, imageAlt, focal = '50% 50%', blurDataURL, copy }: HomeHeroProps) {
  return (
    <section
      className="theme-dark relative flex items-center justify-center overflow-hidden bg-anchor-green-deep"
      style={{ minHeight: 'clamp(560px, 84vh, 760px)' }}
    >
      {/* Full-bleed background image (decorative scrim over it) */}
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        quality={85}
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: focal }}
        {...(blurDataURL ? { placeholder: 'blur' as const, blurDataURL } : {})}
      />

      {/* Scrim (radial + linear) per spec §7.1 */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 30%, rgba(12,29,17,0.55) 0%, rgba(12,29,17,0.82) 100%), linear-gradient(0deg, rgba(12,29,17,0.7) 0%, rgba(12,29,17,0) 55%)'
        }}
      />

      {/* Film grain (6%) */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1]"
        style={{ backgroundImage: 'var(--grain)', opacity: 0.06 }}
      />

      {/* Seasonal frost. Invisible outside 1 Nov to 31 Dec: its opacity comes
          from --winter-frost, which the root layout only emits in season. */}
      <HeroFrost />

      {/* Content */}
      <div className="container relative z-[2]">
        <div className="mx-auto flex max-w-[880px] flex-col items-center gap-5 py-16 text-center">
          {/* White wordmark */}
          <Image
            src="/images/branding/the-anchor-pub-logo-white-transparent.png"
            alt="The Anchor"
            width={300}
            height={300}
            priority
            quality={85}
            sizes="(max-width: 640px) 180px, 300px"
            className="h-auto w-[clamp(180px,26vw,300px)] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
          />

          {/* H1 */}
          <h1
            className="font-display text-display text-anchor-cream-text drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]"
            style={{ lineHeight: 0.95 }}
          >
            Eat, Drink, Enjoy.
          </h1>

          {/* Script line */}
          <p
            className="font-script leading-none text-anchor-gold-bright"
            style={{ fontSize: 'calc(clamp(1.75rem, 3vw, 2.75rem) * 1.2)' }}
          >
            {copy.script}
          </p>

          {/* Lead */}
          <p className="max-w-[54ch] text-lg text-anchor-cream-text/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] sm:text-xl">
            {copy.lead}
          </p>

          {/* Actions */}
          <div className="flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            {copy.primaryHref ? (
              <Link href={copy.primaryHref} className="w-full sm:w-auto">
                <Button variant="primary" size="lg" fullWidth className="sm:w-auto">
                  {copy.primaryCta}
                </Button>
              </Link>
            ) : (
              <BookTableButton
                source="homepage_hero"
                variant="primary"
                size="lg"
                fullWidth
                className="sm:w-auto"
              >
                {copy.primaryCta}
              </BookTableButton>
            )}
            <Link href={copy.secondaryHref} className="w-full sm:w-auto">
              <Button variant="outline" size="lg" fullWidth className="sm:w-auto">
                {copy.secondaryCta}
              </Button>
            </Link>
          </div>

          {/* Live status pill */}
          <StatusBar variant="pill" />

          {/* Google review row, without volatile hardcoded counts */}
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-anchor-cream-text/90">
            <span aria-hidden className="flex items-center gap-0.5 text-anchor-gold-bright">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
              ))}
            </span>
            <span>
              Highly rated on Google · Independent village pub near Heathrow
            </span>
          </p>

          {/* Amenity chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {copy.badges.map((badge) => (
              <Badge key={badge} variant="sand">
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

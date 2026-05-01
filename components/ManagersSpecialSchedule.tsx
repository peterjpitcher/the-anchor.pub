import Image from 'next/image'
import Link from 'next/link'
import type { ManagersSpecial } from '@/types/managers-special'
import { BookTableButton } from '@/components/BookTableButton'
import { Button, Container, Section } from '@/components/ui'
import { BotanicalsGrid } from '@/components/BotanicalsGrid'
import { getPromotionImage } from '@/lib/managers-special'
import { DEFAULT_DRINKS_IMAGE } from '@/lib/image-fallbacks'

function formatMonthYear(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00Z`)
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function formatDateLong(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00Z`)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatPriceGBP(value: string): string {
  const numeric = Number(value.replace(/[£\s]/g, ''))
  if (!Number.isFinite(numeric)) return value
  return `£${numeric.toFixed(2)}`
}

function formatDaysUntil(daysUntil: number | null): string | null {
  if (daysUntil === null) return null
  if (daysUntil <= 0) return 'Starts today'
  if (daysUntil === 1) return 'Starts tomorrow'
  return `Starts in ${daysUntil} days`
}

type ManagersSpecialScheduleProps = {
  promotions: ManagersSpecial[]
  currentPromotionId?: string | null
  nextPromotionId?: string | null
  daysUntilNext?: number | null
  className?: string
}

export function ManagersSpecialSchedule({
  promotions,
  currentPromotionId,
  nextPromotionId,
  daysUntilNext = null,
  className = ''
}: ManagersSpecialScheduleProps) {
  if (!promotions || promotions.length === 0) {
    return (
      <Section className={`bg-anchor-bg ${className}`}>
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-anchor-cream-text">Upcoming Manager&apos;s Specials</h2>
            <p className="mt-4 text-lg text-anchor-cream-text/70">Our monthly 25% off featured spirit schedule will be published here soon.</p>
          </div>
        </Container>
      </Section>
    )
  }

  const nextPromotion = nextPromotionId ? promotions.find((promo) => promo.id === nextPromotionId) : null
  const nextCountdownLabel = formatDaysUntil(daysUntilNext)

  return (
    <Section className={`bg-anchor-bg ${className}`}>
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-anchor-cream-text">Upcoming Manager&apos;s Specials</h2>
          <p className="mt-4 text-lg text-anchor-cream-text/70">
            Each month we take 25% off a featured premium spirit. Here&apos;s what&apos;s coming up - with this month&apos;s special highlighted and the next offer counting down.
          </p>
        </div>

        {nextPromotion && nextCountdownLabel && (
          <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl bg-gradient-to-r from-anchor-green to-emerald-800 p-6 text-white shadow-xl md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Next Manager&apos;s Special</p>
                <h3 className="mt-2 text-2xl font-bold md:text-3xl">
                  {formatMonthYear(nextPromotion.startDate)}: {nextPromotion.spirit.name}
                </h3>
                <p className="mt-2 text-white/90">
                  {nextPromotion.promotion.subheadline || nextPromotion.promotion.offerText}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="rounded-xl bg-white/10 px-5 py-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Countdown</p>
                  <p className="mt-2 text-xl font-bold">{nextCountdownLabel}</p>
                  <p className="mt-1 text-sm text-white/80">Starts {formatDateLong(nextPromotion.startDate)}</p>
                </div>
                <Link href="#upcoming-schedule" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full bg-anchor-gold text-anchor-charcoal hover:bg-anchor-gold-light sm:w-auto"
                  >
                    View the Schedule
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div id="upcoming-schedule" className="mx-auto mt-12 max-w-5xl space-y-4">
          {promotions.map((promo) => {
            const isCurrent = !!currentPromotionId && promo.id === currentPromotionId
            const isNext = !!nextPromotionId && promo.id === nextPromotionId
            const monthLabel = formatMonthYear(promo.startDate)
            const imagePath = getPromotionImage(promo.imageFolder)
            const priceLabel = `${formatPriceGBP(promo.spirit.specialPrice)} (was ${formatPriceGBP(promo.spirit.originalPrice)})`

            if (isCurrent) {
              return (
                <div key={promo.id} className="card-dark rounded-none border border-anchor-gold/30 p-6 md:p-8">
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-anchor-gold/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-anchor-gold-vivid">
                        Current Offer
                      </div>
                      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-anchor-gold">{monthLabel}</p>
                      <h3 className="mt-2 text-2xl font-bold text-anchor-cream-text md:text-3xl">{promo.spirit.name}</h3>
                      <p className="mt-3 text-anchor-cream-text/70">
                        {promo.promotion.offerText}
                      </p>
                      {promo.education?.whyPicked && (
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-anchor-cream-text/60">
                          {promo.education.whyPicked}
                        </p>
                      )}
                      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-anchor-cream-text/70">
                        <span className="rounded-full bg-anchor-gold/20 px-3 py-1 font-semibold text-anchor-gold-vivid">{promo.spirit.discount}</span>
                        <span className="font-semibold text-anchor-cream-text">{priceLabel}</span>
                        <span className="text-anchor-cream-text/55">• 25ml single</span>
                      </div>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <BookTableButton
                          source="managers_special_schedule_current"
                          size="lg"
                          className="w-full sm:w-auto"
                        />
                        <Link href="#details" className="w-full sm:w-auto">
                          <Button variant="outline" size="lg" className="w-full sm:w-auto">
                            View This Month&apos;s Tasting Notes
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {imagePath && (
                      <div className="mx-auto hidden w-full max-w-xs md:mx-0 md:block md:max-w-[220px]">
                        <div className="rounded-none bg-anchor-bg-raised p-3">
                          <Image
                            src={imagePath}
                            alt={promo.promotion.heroAlt || `${promo.spirit.name} - ${promo.promotion.headline}`}
                            width={360}
                            height={540}
                            className="h-auto w-full rounded-xl"
                            unoptimized
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            return (
              <details
                key={promo.id}
                className="group card-dark rounded-none border border-anchor-gold/15 transition-shadow open:border-anchor-gold/30"
              >
                <summary className="flex cursor-pointer list-none flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:gap-8 md:p-8">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-anchor-cream-text/55">{monthLabel}</p>
                      {isNext && (
                        <span className="rounded-full bg-anchor-gold text-anchor-charcoal px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                          Next
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-anchor-cream-text md:text-2xl">
                      {promo.spirit.name}
                    </h3>
                    <p className="mt-2 text-anchor-cream-text/70">
                      {promo.promotion.subheadline || promo.promotion.offerText}
                    </p>
                    <p className="mt-3 text-sm text-anchor-cream-text/55">
                      {isNext && nextCountdownLabel ? `${nextCountdownLabel}. ` : ''}Runs {formatDateLong(promo.startDate)} – {formatDateLong(promo.endDate)}.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 md:justify-end">
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-anchor-cream-text/55">Preview</p>
                      <p className="mt-2 text-lg font-bold text-anchor-gold-vivid">{promo.spirit.discount}</p>
                      <p className="mt-1 text-sm text-anchor-cream-text/55">Tap for price &amp; tasting notes</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-anchor-bg-raised text-anchor-cream-text/70 transition-transform group-open:rotate-180">
                      <span aria-hidden="true">⌄</span>
                    </div>
                  </div>
                </summary>

                <div className="border-t border-anchor-gold/15 px-6 pb-8 pt-6 md:px-8">
                  <div className="grid gap-8 md:grid-cols-12 md:items-start">
                    <div className="md:col-span-4">
                      <div className="rounded-none bg-anchor-bg-raised p-3">
                        <Image
                          src={imagePath || DEFAULT_DRINKS_IMAGE}
                          alt={promo.promotion.heroAlt || `${promo.spirit.name} - ${promo.promotion.headline}`}
                          width={600}
                          height={900}
                          className="h-auto w-full rounded-xl"
                          unoptimized
                        />
                      </div>
                    </div>

                    <div className="md:col-span-8">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-anchor-gold/20 px-3 py-1 text-sm font-semibold text-anchor-gold-vivid">{promo.spirit.discount}</span>
                        <span className="text-sm font-semibold text-anchor-cream-text">{priceLabel}</span>
                        <span className="text-sm text-anchor-cream-text/55">• 25ml single</span>
                      </div>

                      <p className="mt-4 text-anchor-cream-text/70">
                        {promo.spirit.longDescription || promo.spirit.description || promo.promotion.offerText}
                      </p>

                      {promo.education && (
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                          <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-raised p-4">
                            <h4 className="font-bold text-anchor-cream-text">Why it is in the line-up</h4>
                            <p className="mt-2 text-sm leading-relaxed text-anchor-cream-text/70">{promo.education.whyPicked}</p>
                          </div>
                          <div className="rounded-none border border-anchor-gold/15 bg-anchor-bg-raised p-4">
                            <h4 className="font-bold text-anchor-cream-text">Best first serve</h4>
                            <p className="mt-2 text-sm leading-relaxed text-anchor-cream-text/70">{promo.education.perfectServe}</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-8 grid gap-6 md:grid-cols-2">
                        <div>
                          <h4 className="text-lg font-bold text-anchor-cream-text">Tasting notes</h4>
                          {promo.spirit.tastingNotes && promo.spirit.tastingNotes.length > 0 ? (
                            <ul className="mt-4 list-disc space-y-2 pl-5 text-anchor-cream-text/70">
                              {promo.spirit.tastingNotes.map((note, index) => (
                                <li key={index}>{note}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-3 text-anchor-cream-text/55">Tasting notes will be added soon.</p>
                          )}
                        </div>

                        <div>
                          <h4 className="text-lg font-bold text-anchor-cream-text">Perfect serves</h4>
                          {promo.spirit.servingSuggestions && promo.spirit.servingSuggestions.length > 0 ? (
                            <ul className="mt-4 list-disc space-y-2 pl-5 text-anchor-cream-text/70">
                              {promo.spirit.servingSuggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-3 text-anchor-cream-text/55">Serving suggestions will be added soon.</p>
                          )}
                        </div>
                      </div>

                      {promo.spirit.botanicals && promo.spirit.botanicals.length > 0 && (
                        <div className="mt-10">
                          <BotanicalsGrid
                            botanicals={promo.spirit.botanicals}
                            title="Key botanicals"
                            description="A quick look at what shapes the flavour."
                            columns={4}
                          />
                        </div>
                      )}

                      <div className="mt-10 rounded-none bg-anchor-bg-raised p-5">
                        <p className="text-sm text-anchor-cream-text/70">
                          Offer runs for the month shown (subject to availability, 18+ only, Challenge 25 applies). Ask at the bar for the current serve and full terms.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}

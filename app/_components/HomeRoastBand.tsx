import Image from 'next/image'
import Link from 'next/link'
import { BookTableButton } from '@/components/BookTableButton'
import { FestiveKitchenNotice } from '@/components/seasonal/FestiveKitchenNotice'
import { Button, SectionHeading } from '@/components/ui'
import { BEST_ROAST_CLAIM } from '@/lib/approved-wording'
import { DRIVE_TIMES } from '@/lib/constants'
import { getFestiveKitchenStatus } from '@/lib/festive-kitchen-closure'
import { GOOGLE_REVIEWS } from '@/lib/google-reviews'
import { SUNDAY_ROAST } from '@/lib/sunday-roast'

/**
 * The homepage's Sunday roast section. It carries the one "best" line the owner
 * approved (SSOT section 16), so it never shows without the real reviews beside
 * it, and it comes down while the kitchen is shut for its break.
 */
const ROAST_REVIEW_AUTHORS = ['Kathryn Barker', 'IJ']

export function HomeRoastBand(): React.JSX.Element | null {
  const reviews = GOOGLE_REVIEWS.filter((entry) => ROAST_REVIEW_AUTHORS.includes(entry.author))
  if (reviews.length !== ROAST_REVIEW_AUTHORS.length || getFestiveKitchenStatus().state === 'closed') return null

  return (
    <section className="bg-surface py-section-y">
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-md shadow-sm">
            <Image
              src="/images/food/sunday-roast/the-anchor-sunday-roast-stanwell-moor.jpg"
              alt="A carved Sunday roast served at The Anchor in Stanwell Moor"
              width={1920}
              height={1072}
              className="h-full w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div>
            <SectionHeading
              align="left"
              kicker="Sundays, 1pm to 6pm"
              title={BEST_ROAST_CLAIM}
              lead={`Roasts carved fresh from 1pm to 6pm on Sundays, ${DRIVE_TIMES.staines} minutes from Staines. Walk in whenever suits you, or book if you're a group or want a set time. There's nothing to order in advance.`}
              className="mb-6"
            />

            <FestiveKitchenNotice className="mb-6" />

            <div className="mb-6 space-y-4">
              {reviews.map((review) => (
                <figure key={review.author} className="border-l-2 border-line pl-4">
                  <blockquote className="text-lg italic text-ink">&ldquo;{review.quote}&rdquo;</blockquote>
                  <figcaption className="mt-2 text-sm text-ink-muted">
                    {review.author}, Google review, {review.date}
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <BookTableButton
                source="homepage_roast_band"
                context="sunday_roast"
                variant="primary"
                size="lg"
                fullWidth
                className="sm:w-auto"
                customHref={SUNDAY_ROAST.bookingHref}
                trackingLabel="Book a Sunday roast"
              >
                Book your Sunday table
              </BookTableButton>
              <Button asChild variant="outline" size="lg" fullWidth className="sm:w-auto">
                <Link href="/sunday-roast" className="w-full sm:w-auto">
                  See the Sunday roast
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

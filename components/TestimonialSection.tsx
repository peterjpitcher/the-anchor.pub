import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/layout/Card'
import { SectionHeading } from '@/components/ui'

export interface Testimonial {
  quote: string      // Raw text, no surrounding quotes — component adds them
  author: string     // Display name
  source?: string    // e.g. "Google Review"
  rating?: number    // 1-5, defaults to 5
}

export interface TestimonialSectionProps {
  variant?: 'full' | 'compact' | 'pull-quote'
  reviews: Testimonial[]
  title?: string       // full variant only, default: "What Our Guests Say"
  subtitle?: string    // full variant only, default: "From Google Reviews"
  className?: string
}

const testimonialSectionVariants = cva('', {
  variants: {
    variant: {
      full: '',
      compact: '',
      'pull-quote': '',
    },
  },
  defaultVariants: {
    variant: 'full',
  },
})

/** Star rating display — accessible, purely presentational. */
function StarRating({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn('flex gap-0.5', className)} aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={i < rating ? 'text-anchor-gold' : 'text-ink-muted/30'}
        >
          &#9733;
        </span>
      ))}
    </div>
  )
}

/** Individual testimonial card for full and compact variants. */
function TestimonialCard({
  review,
  compact = false,
}: {
  review: Testimonial
  compact?: boolean
}) {
  const rating = review.rating ?? 5

  return (
    <Card className={compact ? 'p-4' : 'p-6'}>
      <StarRating rating={rating} className="mb-3" />
      <p className={cn(
        'text-base italic text-ink mb-3',
        compact && 'line-clamp-3'
      )}>
        &ldquo;{review.quote}&rdquo;
      </p>
      <p className="text-sm text-ink-muted">
        {review.author}
        {review.source && <> &mdash; {review.source}</>}
      </p>
    </Card>
  )
}

/**
 * TestimonialSection — displays customer testimonials in three layout variants.
 *
 * - `full`: Heading + subheading + responsive card grid (default)
 * - `compact`: Horizontal scrollable strip of condensed cards
 * - `pull-quote`: Single prominent blockquote with text attribution
 *
 * Server Component — pure RSC, no client directive.
 */
export function TestimonialSection({
  variant = 'full',
  reviews,
  title = 'What Our Guests Say',
  subtitle = 'From Google Reviews',
  className,
}: TestimonialSectionProps) {
  if (reviews.length === 0) {
    return null
  }

  // Pull-quote variant — single blockquote
  if (variant === 'pull-quote') {
    const review = reviews[0]
    const rating = review.rating ?? 5

    return (
      <section className={cn('py-10 md:py-12', className)}>
        <div className="mx-auto text-center px-4">
          <blockquote className="text-2xl text-ink italic leading-relaxed">
            &ldquo;{review.quote}&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-ink-muted">
            {review.author}
            {review.source && <>, {review.source}</>}
            , rated {rating}/5
          </p>
        </div>
      </section>
    )
  }

  // Compact variant — horizontal scroll strip
  if (variant === 'compact') {
    return (
      <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
        {reviews.map((review, index) => (
          <div key={index} className="min-w-[280px] max-w-[320px] flex-shrink-0">
            <TestimonialCard review={review} compact />
          </div>
        ))}
      </div>
    )
  }

  // Full variant (default) — heading + grid
  return (
    <section className={cn(testimonialSectionVariants({ variant }), className)}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={title} subtitle={subtitle} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <TestimonialCard key={index} review={review} />
          ))}
        </div>
      </div>
    </section>
  )
}

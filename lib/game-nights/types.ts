/**
 * Shared config shape for the four hosted-game category pages: /quiz-night,
 * /cash-bingo, /music-bingo and /karaoke.
 *
 * These four pages each carried their own hero, their own fold and their own
 * booking hand-off, which meant a conversion fix had to be made four times and
 * drifted between them. Everything genuinely per-game now lives in one config
 * object per game, and the page files render shared components from it.
 *
 * Every customer-facing string here is copy. It must be supportable by
 * docs/SSOT.md. Prices that the SSOT marks as live (food, drinks) must never
 * appear here: quiz and bingo entry fees are the confirmed exception.
 */

export interface GameNightFact {
  /** Short label, e.g. "Entry". */
  label: string
  /** Short value, e.g. "£3 per player". */
  value: string
}

export interface GameNightObjection {
  /** The worry, phrased the way a customer would say it. */
  question: string
  /** The answer, in one or two sentences. */
  answer: string
}

export interface GameNightConfig {
  /** Route segment, also the tracking suffix. */
  slug: 'quiz-night' | 'cash-bingo' | 'music-bingo' | 'karaoke'
  /**
   * Lower-case display name used inside generated sentences and CTA labels,
   * e.g. "quiz night" in "Book your table for quiz night".
   */
  name: string
  /** Category lookup against the management API. Name or slug may match. */
  category: { name: string; slug: string }

  hero: {
    /** Per-game hero image. Must show the game, not the building. */
    image: string
    /** CSS object-position for the hero image. */
    focal?: string
    /** Breadcrumb label for the current page. */
    crumb: string
    /** The page H1. */
    title: string
    /** Supporting sentence under the H1. */
    lead: string
  }

  /**
   * At-a-glance chips rendered in the hero, under the H1. Four or five maximum:
   * these are scanned in about two seconds, not read. Anything that needs a
   * sentence belongs in `objections` instead.
   */
  facts: GameNightFact[]

  /**
   * Leading words of the primary CTA. The next confirmed date is appended by
   * the component, so this must read correctly followed by a date, e.g.
   * "Book your table for" gives "Book your table for Wed 19 Aug".
   */
  bookingCtaPrefix: string

  /** Primary CTA label used when no date is confirmed yet. */
  bookingCtaFallback: string

  /**
   * Payment and arrival reassurance, shown against the booking form. This is
   * the single cheapest friction cut on these pages: for the £3 nights the
   * visitor's unspoken question is "am I about to be asked for card details".
   */
  bookingNote: string

  /**
   * Answered beside the booking CTA rather than buried in the FAQ, because an
   * unanswered objection at the point of decision is a lost booking.
   */
  objections: GameNightObjection[]

  /**
   * False for formats that run only occasionally rather than to a schedule.
   *
   * Karaoke is the case this exists for. docs/SSOT.md: karaoke is "not a
   * regular feature in 2026", has no fixed host, and must never be presented
   * as a weekly, monthly or Friday slot. When false, the page must not emit a
   * recurring EventSeries schema and must not imply a cadence, while still
   * being free to convert anyone who lands on it.
   */
  promotable: boolean
}

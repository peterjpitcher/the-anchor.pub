/**
 * The 2026 private-hire event brochures.
 *
 * One 15 or 16 page PDF per occasion, each covering the same spaces, menus and
 * packages with an occasion-specific cover and "suggested for your day" page.
 *
 * Every price and minimum in these PDFs was verified against the management
 * database (`venue_spaces`, `catering_packages`) on 17 August 2026. Prices in the
 * brochures are frozen at print time and shown excluding VAT, which is why the
 * download CTA never repeats a price: the live figures belong to the cost
 * estimator, not to a static file. If catering prices or minimums change in the
 * management app, these PDFs need re-exporting, see
 * `tasks/brochure-changes-2026-08-17.md` for the check that was run.
 */
export interface Brochure {
  /** Stable key, also used as the GTM `brochure_occasion` value. */
  key: string
  /** Customer-facing name of the brochure. */
  title: string
  /** One line on what the brochure is for, used under the download CTA. */
  description: string
  /** Public path to the PDF. */
  file: string
  /** Page count, surfaced so the reader knows what they are opening. */
  pages: number
  /** Approximate download size, shown so the size is never a surprise. */
  sizeLabel: string
}

const BROCHURE_LIST: Brochure[] = [
  {
    key: 'general',
    title: '2026 Event Brochure',
    description: 'Every space, menu and package we offer, in one place.',
    file: '/downloads/the-anchor-2026-event-brochure.pdf',
    pages: 16,
    sizeLabel: '1.2 MB'
  },
  {
    key: 'birthdays',
    title: 'Birthday Celebrations Brochure',
    description: 'Room to dance, food you can hold, and a bar that keeps up.',
    file: '/downloads/the-anchor-2026-birthday-party-brochure.pdf',
    pages: 16,
    sizeLabel: '1.1 MB'
  },
  {
    key: 'baby_shower',
    title: 'Baby Showers Brochure',
    description: 'Afternoon tea on proper stands, in a room of your own.',
    file: '/downloads/the-anchor-2026-baby-shower-brochure.pdf',
    pages: 16,
    sizeLabel: '1.2 MB'
  },
  {
    key: 'christenings',
    title: 'Christenings Brochure',
    description: 'Afternoon tea for the grown-ups, chips for the little ones.',
    file: '/downloads/the-anchor-2026-christening-brochure.pdf',
    pages: 16,
    sizeLabel: '1.1 MB'
  },
  {
    key: 'gender_reveal',
    title: 'Gender Reveals Brochure',
    description: 'A garden for the big moment, a bar for the toast afterwards.',
    file: '/downloads/the-anchor-2026-gender-reveal-brochure.pdf',
    pages: 16,
    sizeLabel: '1.2 MB'
  },
  {
    key: 'engagement',
    title: 'Engagement Parties Brochure',
    description: 'Your people around you, a glass in every hand, no washing up.',
    file: '/downloads/the-anchor-2026-engagement-party-brochure.pdf',
    pages: 16,
    sizeLabel: '1.2 MB'
  },
  {
    key: 'retirement',
    title: 'Retirement Parties Brochure',
    description: 'A proper send-off, with the drinks, food and speeches sorted.',
    file: '/downloads/the-anchor-2026-retirement-party-brochure.pdf',
    pages: 16,
    sizeLabel: '1.2 MB'
  },
  {
    key: 'celebration_of_life',
    title: 'Celebrations of Life Brochure',
    description: 'A calm, welcoming place to gather and raise a glass.',
    file: '/downloads/the-anchor-2026-celebration-of-life-brochure.pdf',
    pages: 15,
    sizeLabel: '1.2 MB'
  },
  {
    key: 'corporate',
    title: 'Corporate & Business Events Brochure',
    description: 'Meetings, away days and work dos, minutes from Heathrow.',
    file: '/downloads/the-anchor-2026-corporate-events-brochure.pdf',
    pages: 16,
    sizeLabel: '1.2 MB'
  }
]

export const BROCHURES: Record<string, Brochure> = Object.fromEntries(
  BROCHURE_LIST.map((brochure) => [brochure.key, brochure])
)

/** All brochures, in the order they should be listed on the index page. */
export const ALL_BROCHURES: Brochure[] = BROCHURE_LIST

/**
 * Look up a brochure by key. Throws rather than returning undefined so a typo in
 * a page's brochure key fails the build instead of silently rendering nothing.
 */
export function getBrochure(key: string): Brochure {
  const brochure = BROCHURES[key]
  if (!brochure) {
    throw new Error(
      `Unknown brochure key "${key}". Valid keys: ${Object.keys(BROCHURES).join(', ')}`
    )
  }
  return brochure
}

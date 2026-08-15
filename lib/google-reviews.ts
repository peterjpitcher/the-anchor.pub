/**
 * The Anchor's real Google reviews: the ONLY approved source of testimonials.
 *
 * Supplied by the owner from the Google Business Profile review export on
 * 15 August 2026. Every entry below is a genuine review left by a real person
 * under their own Google display name.
 *
 * WHY THIS FILE EXISTS
 *
 * Until 15 August 2026 the site published 14 invented testimonials across five
 * pages, attributed to "Google Review" and to names that appear nowhere in the
 * review export: Sarah/Staines, James/Ashford, Priya/Feltham and others, all
 * following an identical "FirstName, Town" pattern. They were removed that day.
 *
 * Writing or publishing a fake review is a civil offence under the Digital
 * Markets, Competition and Consumers Act 2024, with penalties of up to 10% of
 * global turnover, and it is banned outright by the no-invented-facts rule in
 * docs/SSOT.md. The exposure was worst on /private-hire/wakes, where the
 * audience is bereaved families choosing a venue for a funeral.
 *
 * THE RULES
 *
 * 1. Add an entry ONLY by copying a real review from the Google export.
 * 2. Quote verbatim. Trimming to whole sentences is fine; rewording is not.
 * 3. Attribute to the reviewer's own Google display name. Never invent a
 *    surname, an initial or a town.
 * 4. Never tag a review with a topic the reviewer did not actually describe.
 *    There are no wake or funeral reviews, so `wake` is deliberately absent
 *    from the topic union: a page about funerals must not imply otherwise.
 *
 * tests/unit/testimonials-are-real.test.ts enforces 1 and 3 across every page.
 */

export type ReviewTopic =
  /** Christmas dinner or a Christmas party specifically. */
  | 'christmas'
  /** A private party, function or hired space. */
  | 'private-hire'
  /** A baby shower, gender reveal or similar family celebration. */
  | 'gender-reveal'
  /** A group of families, or a group given its own area. */
  | 'family-group'
  /** The team's care and attentiveness, rather than the food or the room. */
  | 'hospitality'
  /** Food quality, including the Sunday roast. */
  | 'food'

export interface GoogleReview {
  /** Verbatim from the review. Whole sentences only. */
  quote: string
  /** The reviewer's own Google display name. */
  author: string
  /** Month and year the review was left, for the attribution line. */
  date: string
  topics: ReviewTopic[]
}

/**
 * Real reviews, newest first within each topic group. Not exhaustive: this is
 * the subset with enough substance to quote. Add more from the export as they
 * arrive rather than writing anything new.
 */
export const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    quote: 'Held our christmas party here for last 2 years and many more to come.',
    author: 'Dean Croad',
    date: 'December 2023',
    topics: ['christmas', 'private-hire']
  },
  {
    quote: 'Great pub. We had a delicious Christmas meal, with perfect hosting. Couldn’t have asked for more!',
    author: 'Ally Miller',
    date: 'December 2022',
    topics: ['christmas', 'food']
  },
  {
    quote: 'We hired the garden for a 60th birthday party and couldn’t have been happier with the experience.',
    author: 'Milly Ganatra',
    date: 'June 2026',
    topics: ['private-hire', 'christmas']
  },
  {
    quote: 'Had my gender reveal here, the staff and owners billy and pete are amazing. We had a great day, definitely will be booking again.',
    author: 'Tia J',
    date: 'July 2026',
    topics: ['gender-reveal', 'private-hire', 'hospitality']
  },
  {
    quote: 'We recently visited with 4 other families with young kids. We were kindly given the whole conservatory area.',
    author: 'Gobika Saiganesh',
    date: 'March 2023',
    topics: ['family-group', 'private-hire']
  },
  {
    quote: 'Welcoming. Had party there, buffet very good. Had great time.',
    author: 'Mary Cullinan',
    date: 'September 2023',
    topics: ['private-hire', 'food']
  },
  {
    quote: 'Everyone had an amazing evening the staff was very good the management are the best definitely recommended them.',
    author: 'Denise Trowbridge',
    date: 'October 2025',
    topics: ['private-hire', 'hospitality']
  },
  {
    quote: 'Lovely family run pub. Staff are friendly, service was good and food was brilliant. Good choice of menu. Glad we found this pub for our family get together',
    author: 'Tracey Knight',
    date: 'July 2026',
    topics: ['family-group', 'hospitality', 'food']
  },
  {
    quote: 'Had my mum who has dementia with me and all the staff were fantastic with her.',
    author: 'Sharon Buckley',
    date: 'February 2022',
    topics: ['hospitality']
  },
  {
    quote: 'Outstanding atmosphere and the host was absolutely fantastic, I will definitely go again',
    author: 'Denise Lewis',
    date: 'July 2026',
    topics: ['hospitality']
  },
  {
    quote: 'Absolutely love it here..amazing atmosphere lovely owners and a fun family and dog friendly place which is rare to find',
    author: 'Louise Kitchener',
    date: 'February 2026',
    topics: ['hospitality', 'family-group']
  },
  {
    quote: 'Mum described the roast dinner as the best she has ever had! It was absolutely delicious and the puddings were very yummy too! Really reasonably priced and very friendly staff.',
    author: 'Kathryn Barker',
    date: 'May 2026',
    topics: ['food', 'family-group']
  }
]

/** The shape TestimonialSection consumes. */
export interface TestimonialInput {
  quote: string
  author: string
  source: string
  rating: number
}

/**
 * Real reviews for a topic, ready to hand to TestimonialSection.
 *
 * Returns fewer than `limit` rather than padding: a page with two genuine
 * reviews shows two. There is no topic that invents a third.
 */
export function getReviewsByTopic(topic: ReviewTopic, limit = 3): TestimonialInput[] {
  return GOOGLE_REVIEWS
    .filter(review => review.topics.includes(topic))
    .slice(0, limit)
    .map(review => ({
      quote: review.quote,
      author: review.author,
      source: `Google review, ${review.date}`,
      rating: 5
    }))
}

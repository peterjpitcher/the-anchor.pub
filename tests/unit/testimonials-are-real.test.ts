/**
 * Site-wide guard: every published testimonial must be a real Google review.
 *
 * On 15 August 2026 the site was found to be publishing 14 invented
 * testimonials across five pages, all attributed to "Google Review" or
 * "TripAdvisor", from people who appear nowhere in the owner's Google Business
 * Profile export. They followed an identical "FirstName, Town" pattern:
 * Sarah/Staines, James/Ashford, Priya/Feltham, Emma/Staines, Jasmine/Ashford,
 * Rachel/Staines, David/Ashford, Chloe & Dan/Staines, Priya & Raj/Feltham, plus
 * one attributed to an author literally named "Google Review" and one to
 * "Anonymous". The worst sat on /private-hire/wakes, aimed at bereaved families.
 *
 * Publishing a fake review is a civil offence under the Digital Markets,
 * Competition and Consumers Act 2024 (penalties up to 10% of global turnover)
 * and breaks the no-invented-facts rule in docs/SSOT.md.
 *
 * The rule this enforces: a page may not hand TestimonialSection a hand-written
 * quote. It must pass reviews from lib/google-reviews.ts, which is traceable to
 * the export. That makes inventing one a code change that fails the build,
 * rather than a copy tweak nobody notices.
 *
 * WHY THIS GUARD GREW ON 13 SEPTEMBER 2026
 *
 * The original version only looked at pages containing `<TestimonialSection`,
 * so two whole review surfaces walked straight past it:
 *
 * 1. `/reviews` kept its own array of nine quotes attributed to bare first
 *    names (Sarah, James, Rachel, Dave, Louise, Mark, Tom, Karen, Priya) with
 *    its own star ratings. It rendered them in a local card grid, never through
 *    TestimonialSection. A tenth, "Helen", was pulled on 12 September for
 *    promising cash prizes the quiz does not give.
 * 2. `lib/google/review-utils.ts` held four invented reviews under a
 *    "mock data for development" comment ("Sarah M.", "Michael T.", "Emma R.",
 *    "The Johnson Family"). They were not development-only: `/api/reviews`
 *    served them to `/beer-garden`, `/pubs-in-stanwell`,
 *    `/restaurants-near-heathrow` and `/heathrow-parking` in production.
 *
 * So the guard is now shape-based, not component-based: nothing under app/,
 * components/, lib/ or content/ may carry a review-shaped literal, whichever
 * component eventually renders it. lib/google-reviews.ts is the one exemption,
 * because it is the export.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'
import { GOOGLE_REVIEWS, getAllReviews, getReviewsByTopic } from '@/lib/google-reviews'
import { approvedReviews } from '@/lib/google/review-utils'

const ROOT = join(__dirname, '..', '..')

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (full.endsWith('.tsx') || full.endsWith('.ts')) acc.push(full)
  }
  return acc
}

const pagesUsingTestimonials = walk(join(ROOT, 'app'))
  .filter(file => readFileSync(file, 'utf8').includes('<TestimonialSection'))

/** The approved source, and the only place a review literal may live. */
const APPROVED_SOURCE = join(ROOT, 'lib', 'google-reviews.ts')

/** Test fixtures carry invented quotes on purpose; none of them ship. */
const EXEMPT = [APPROVED_SOURCE, join(ROOT, 'lib', 'test-utils')]

/** Everything that reaches a visitor's browser. */
const shippedFiles = ['app', 'components', 'lib', 'content']
  .map(dir => join(ROOT, dir))
  .filter(existsSync)
  .flatMap(dir => walk(dir))
  .filter(file => !EXEMPT.some(prefix => file === prefix || file.startsWith(prefix + '/')))

const read = (file: string) => readFileSync(file, 'utf8')
const rel = (file: string) => relative(ROOT, file)

/** `quote: 'Best Sunday roast...'`, the shape /reviews used. */
const HARD_CODED_QUOTE = /\bquote:\s*['"`]/

/**
 * Google Places field names. A string literal for either one can only be a
 * review typed by hand: real ones arrive as data, never as source.
 */
const HARD_CODED_GOOGLE_FIELD = /\b(author_name|relative_time_description):\s*['"`]/

/**
 * The general shape the task keeps rediscovering: a star rating sitting beside
 * a sentence of praise, in whatever object literal someone invented this time.
 */
function ratingsBesideProse(source: string): string[] {
  const prose = /\b(quote|text|review|comment|testimonial|body)\s*:\s*['"`][^'"`]{25,}/
  const found: string[] = []
  for (const match of source.matchAll(/\brating:\s*\d/g)) {
    const window = source.slice(Math.max(0, match.index! - 500), match.index! + 500)
    const hit = window.match(prose)
    if (hit) found.push(hit[0].replace(/\s+/g, ' ').slice(0, 60))
  }
  return found
}

describe('published testimonials are real Google reviews', () => {
  it('finds the pages that publish testimonials, so this guard is not vacuous', () => {
    expect(pagesUsingTestimonials.length).toBeGreaterThan(0)
  })

  it.each(pagesUsingTestimonials)('%s passes reviews from the approved source', file => {
    const source = readFileSync(file, 'utf8')

    // A hand-written quote is exactly what the fabricated ones were. Reviews
    // must come from lib/google-reviews.ts instead.
    expect(source).not.toMatch(HARD_CODED_QUOTE)
    expect(source).toMatch(/getReviewsByTopic|getAllReviews/)
  })

  it.each(pagesUsingTestimonials)('%s names no fabricated reviewer', file => {
    const source = readFileSync(file, 'utf8')

    // The exact names that shipped, plus the two shapes they took: a first name
    // with a town, and an unattributable placeholder.
    for (const name of [
      'Sarah, Staines', 'James, Ashford', 'Priya, Feltham',
      'Emma, Staines', 'Jasmine, Ashford', 'Rachel, Staines',
      'David, Ashford', 'Chloe & Dan, Staines', 'Priya & Raj, Feltham'
    ]) {
      expect(source).not.toContain(name)
    }
    expect(source).not.toMatch(/author:\s*["'](Anonymous|Google Review)["']/)
    expect(source).not.toMatch(/author:\s*["'][A-Z][a-z]+,\s*[A-Z][a-z]+["']/)
  })
})

describe('nothing that ships carries a review written by hand', () => {
  it('scans the whole shipped tree, so this guard is not vacuous', () => {
    // /reviews is the page that slipped through the component-shaped guard, so
    // name it explicitly: a rename must break this test, not silence it.
    expect(shippedFiles.length).toBeGreaterThan(200)
    expect(shippedFiles).toContain(join(ROOT, 'app', 'reviews', 'page.tsx'))
    expect(shippedFiles).toContain(join(ROOT, 'lib', 'google', 'review-utils.ts'))
  })

  it('declares no quote literal outside lib/google-reviews.ts', () => {
    const offenders = shippedFiles.filter(file => HARD_CODED_QUOTE.test(read(file)))
    expect(offenders.map(rel)).toEqual([])
  })

  it('types no Google review field by hand', () => {
    // author_name and relative_time_description come off the Google payload.
    // Written into source, they are always someone inventing a reviewer.
    const offenders = shippedFiles.filter(file => HARD_CODED_GOOGLE_FIELD.test(read(file)))
    expect(offenders.map(rel)).toEqual([])
  })

  it('puts no star rating next to a sentence of praise', () => {
    // The shape itself, whatever the field names: a local array of named
    // quotes with ratings is a fabricated review section every time so far.
    const offenders = shippedFiles
      .map(file => ({ file: rel(file), hits: ratingsBesideProse(read(file)) }))
      .filter(entry => entry.hits.length > 0)
    expect(offenders).toEqual([])
  })

  it('builds /reviews from the approved source', () => {
    const page = read(join(ROOT, 'app', 'reviews', 'page.tsx'))
    expect(page).toContain("@/lib/google-reviews")
    expect(page).toMatch(/getAllReviews|getReviewsByTopic/)
  })

  it('serves the reviews API from the approved source', () => {
    // /api/reviews feeds /beer-garden, /pubs-in-stanwell,
    // /restaurants-near-heathrow and /heathrow-parking. It once served four
    // invented reviewers from an array in this file.
    const utils = read(join(ROOT, 'lib', 'google', 'review-utils.ts'))
    expect(utils).toContain('@/lib/google-reviews')

    expect(approvedReviews).toHaveLength(GOOGLE_REVIEWS.length)
    for (const served of approvedReviews) {
      expect(GOOGLE_REVIEWS.some(review => review.quote === served.text
        && review.author === served.author_name)).toBe(true)
    }
  })
})

describe('the approved review source', () => {
  it('attributes every review to a real display name and a date', () => {
    expect(GOOGLE_REVIEWS.length).toBeGreaterThan(0)

    for (const review of GOOGLE_REVIEWS) {
      expect(review.quote.trim().length).toBeGreaterThan(20)
      // A real Google display name, never "FirstName, Town" or an initial.
      expect(review.author).not.toMatch(/,/)
      expect(review.author).not.toMatch(/\s[A-Z]\.$/)
      expect(review.author).not.toMatch(/^(Anonymous|Google Review)$/)
      expect(review.date).toMatch(/^[A-Z][a-z]+ \d{4}$/)
    }
  })

  it('carries no wake or funeral review, because none exists', () => {
    // /private-hire/wakes must never imply it has reviews from bereaved
    // families. If a genuine one is ever left, add the topic deliberately.
    const text = JSON.stringify(GOOGLE_REVIEWS).toLowerCase()
    expect(text).not.toContain('"wake"')
    expect(text).not.toContain('funeral')
  })

  it('returns fewer results rather than padding a topic that is short', () => {
    // The failure mode this prevents: someone "topping up" a thin topic with
    // something invented so a three-column grid looks full.
    const hospitality = getReviewsByTopic('hospitality', 99)
    expect(hospitality.length).toBeLessThanOrEqual(GOOGLE_REVIEWS.length)
    for (const entry of hospitality) {
      expect(GOOGLE_REVIEWS.some(review => review.quote === entry.quote)).toBe(true)
      expect(entry.source).toMatch(/^Google review, /)
    }
  })

  it('hands /reviews every real review and nothing else', () => {
    // getAllReviews is what stops the page inventing a tenth card when the
    // export only has twelve entries: it can only return what is in the export.
    const all = getAllReviews()
    expect(all).toHaveLength(GOOGLE_REVIEWS.length)
    for (const entry of all) {
      expect(GOOGLE_REVIEWS.some(review => review.quote === entry.quote
        && review.author === entry.author)).toBe(true)
      expect(entry.source).toMatch(/^Google review, /)
    }
  })
})

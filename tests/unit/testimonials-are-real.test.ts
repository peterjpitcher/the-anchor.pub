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
 */
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { GOOGLE_REVIEWS, getReviewsByTopic } from '@/lib/google-reviews'

const ROOT = join(__dirname, '..', '..')

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (full.endsWith('.tsx')) acc.push(full)
  }
  return acc
}

const pagesUsingTestimonials = walk(join(ROOT, 'app'))
  .filter(file => readFileSync(file, 'utf8').includes('<TestimonialSection'))

describe('published testimonials are real Google reviews', () => {
  it('finds the pages that publish testimonials, so this guard is not vacuous', () => {
    expect(pagesUsingTestimonials.length).toBeGreaterThan(0)
  })

  it.each(pagesUsingTestimonials)('%s passes reviews from the approved source', file => {
    const source = readFileSync(file, 'utf8')

    // A hand-written quote is exactly what the fabricated ones were. Reviews
    // must come from lib/google-reviews.ts instead.
    expect(source).not.toMatch(/quote:\s*["'`]/)
    expect(source).toContain('getReviewsByTopic')
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
})

import fs from 'fs'
import path from 'path'

/**
 * The themed quiz hub once published a wrong charity partner.
 *
 * It said "the Stanwell Moor Village Hall team", copied from the event record
 * as a string literal. The partner later changed to the Community Wellbeing
 * Garden, the database was corrected, and this page was not. Nothing failed;
 * the site simply told people the wrong thing about a charity night.
 *
 * Two guards follow from that:
 *
 *  1. Facts that can change without anyone editing this file must not be in
 *     this file. Partner names, charity names and prices live on the event
 *     page, which reads them live.
 *  2. The dates the hub does state must match the event slugs it links to.
 *     Slugs end in the event date, so this is checkable without the database.
 */
const PAGE = path.join(process.cwd(), 'app/quiz-night/themed/page.tsx')
const src = fs.readFileSync(PAGE, 'utf8')

/** Strip block comments so the history note does not trip the content checks. */
const body = src.replace(/\/\*[\s\S]*?\*\//g, '')

describe('themed quiz hub does not duplicate volatile facts', () => {
  it.each([
    ['a charity name', /Macmillan/],
    ['a partner organisation', /Wellbeing Garden|Village Hall/],
  ])('does not hardcode %s', (_label, pattern) => {
    expect(body).not.toMatch(pattern)
  })

  it('states a date for every night, and it matches the slug it links to', () => {
    const entries = [...src.matchAll(/date:\s*'([^']+)'[\s\S]*?href:\s*'([^']+)'/g)]
    expect(entries.length).toBeGreaterThan(0)

    for (const [, stated, href] of entries) {
      const slugDate = href.match(/(\d{4})-(\d{2})-(\d{2})$/)
      expect(slugDate).not.toBeNull()

      const [, y, m, d] = slugDate!
      const fromSlug = new Date(`${y}-${m}-${d}T00:00:00Z`)
      const rendered = fromSlug.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
      // House style omits the comma after the weekday ("Friday 25 September
      // 2026"). The assertion is about the date being right, not punctuation.
      const normalise = (v: string) => v.replace(/,/g, '').replace(/\s+/g, ' ').trim()
      expect(normalise(stated)).toBe(normalise(rendered))
    }
  })

  it('carries a verifiedAt date for every night, so staleness is visible', () => {
    const nights = [...src.matchAll(/name:\s*'[^']+',\s*\n\s*fullName:/g)].length
    const verified = [...src.matchAll(/verifiedAt:\s*'(\d{4}-\d{2}-\d{2})'/g)]
    expect(verified.length).toBe(nights)
    for (const [, when] of verified) {
      expect(Number.isNaN(Date.parse(when))).toBe(false)
    }
  })
})

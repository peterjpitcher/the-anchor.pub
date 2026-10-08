/**
 * Numbers typed into blog posts stay in step with SSOT.json (site review
 * finding B2-042, 7 October 2026).
 *
 * Capacities, the parking count and the buffet minimums are typed into a dozen
 * party and Christmas guides. They matched the SSOT on the day of the review,
 * but nothing kept them in step. The owner's ruling was to keep the numbers and
 * add a test that fails as soon as one stops matching. This is that test.
 *
 * It reads the numbers a post states, not the ones it could have stated: a
 * post is free to leave a figure out and link to /private-hire instead.
 */

import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const BLOG = path.join(ROOT, 'content', 'blog')
const ssot = JSON.parse(fs.readFileSync(path.join(ROOT, 'SSOT.json'), 'utf8'))

interface Post {
  slug: string
  lines: string[]
}

const posts: Post[] = fs
  .readdirSync(BLOG, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(BLOG, entry.name, 'index.md')))
  .map((entry) => ({
    slug: entry.name,
    lines: fs.readFileSync(path.join(BLOG, entry.name, 'index.md'), 'utf8').split('\n'),
  }))

/** Every number a pattern captures across the posts, as "slug: number in line". */
function stated(pattern: RegExp, allowed: Set<number>): string[] {
  return posts.flatMap(({ slug, lines }) =>
    lines.flatMap((line) =>
      [...line.matchAll(pattern)]
        .map((match) => Number(match.slice(1).find((group) => group !== undefined)))
        .filter((value) => !allowed.has(value))
        .map((value) => `${slug}: ${value} in "${line.trim().slice(0, 110)}"`),
    ),
  )
}

describe('numbers typed into blog posts match SSOT.json', () => {
  const capacity = ssot.venue.capacity

  it('reads a sensible number of posts', () => {
    expect(posts.length).toBeGreaterThan(80)
  })

  it('states only seated capacities the SSOT holds', () => {
    const seated = new Set<number>([
      capacity.dining_room_seated,
      capacity.main_area_seated,
      capacity.beer_garden_seats,
      capacity.christmas_seated,
      capacity.maximum_seated,
    ])
    expect(seated).toEqual(new Set([26, 29, 64, 60, 119]))
    expect(stated(/\b(\d{1,3})\s+(?:guests?\s+|people\s+)?seated\b/gi, seated)).toEqual([])
  })

  it('states only standing capacities the SSOT holds', () => {
    const standing = new Set<number>([
      capacity.dining_room_standing,
      capacity.main_area_standing,
      capacity.beer_garden_standing,
      capacity.christmas_standing,
      capacity.maximum,
    ])
    expect(standing).toEqual(new Set([50, 150, 250, 200, 300]))
    expect(stated(/\b(\d{1,3})\s+(?:guests?\s+|people\s+)?standing\b/gi, standing)).toEqual([])
  })

  it('gives the car park as 20 free spaces, never another count and never hedged', () => {
    // Section 8: "20 free spaces on site. (This is the correct number.)"
    expect(stated(/\b(\d{1,3}) (?:free )?(?:on-site )?(?:parking |car park )?spaces\b/gi, new Set([20]))).toEqual([])
    const hedged = posts.flatMap(({ slug, lines }) =>
      lines
        .filter((line) => /(?:approximately|about|around|roughly|~)\s*20 (?:free )?(?:parking )?spaces/i.test(line))
        .map((line) => `${slug}: "${line.trim().slice(0, 110)}"`),
    )
    expect(hedged).toEqual([])
  })

  it('gives each named buffet the minimum the SSOT holds for it', () => {
    const packages: Array<{ name: string; min_guests: number }> = [
      ...ssot.private_hire.catering_packages.buffet,
    ].filter((item) => typeof item.min_guests === 'number')
    expect(packages.length).toBeGreaterThan(5)

    const wrong: string[] = []
    for (const { slug, lines } of posts) {
      for (const line of lines) {
        for (const { name, min_guests } of packages) {
          const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/&/g, '(?:&|and)')
          // "**Burger Buffet:** minimum 20 guests", "Burger Buffet (minimum of 20)"
          const pattern = new RegExp(`\\b${escaped}\\b[^.;|\\n]{0,40}?\\bminimum (?:of )?(\\d{1,3})\\b`, 'gi')
          for (const match of line.matchAll(pattern)) {
            if (Number(match[1]) !== min_guests) {
              wrong.push(`${slug}: ${name} minimum ${match[1]}, SSOT says ${min_guests}`)
            }
          }
        }
      }
    }
    expect(wrong).toEqual([])
  })

  it('never gives a festive buffet a minimum other than 30', () => {
    // Section 7: "Minimum 30 guests, everywhere, no exceptions."
    const wrong = posts.flatMap(({ slug, lines }) =>
      lines.flatMap((line) =>
        [...line.matchAll(/\bfestive (?:[\w&]+ ){0,4}?buffets?\b[^.;|\n]{0,60}?\bminimum (?:of )?(\d{1,3})\b/gi)]
          .filter((match) => Number(match[1]) !== 30)
          .map((match) => `${slug}: festive buffet minimum ${match[1]}`),
      ),
    )
    expect(wrong).toEqual([])
  })
})

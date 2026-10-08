/**
 * The blog post template (site review 7 October 2026, work package P15).
 *
 * Posts used to show no date, so a 2019 timetable read as this week's. Every
 * post now says when it was written and points at the pages that hold today's
 * hours, prices and events; old posts kept out of search say they are an
 * archive. These checks run under both TZ=Europe/London and TZ=UTC.
 */

import fs from 'fs'
import path from 'path'
import { getPostDateLine, getPostDateParts } from '@/lib/blog/post-dates'
import { blogAuthorSchema, blogDateModified } from '@/lib/blog/post-schema'
import matter from 'gray-matter'
import { organicSearchClusters } from '@/lib/seo/organic-search-map'

const ROOT = process.cwd()
const template = fs.readFileSync(path.join(ROOT, 'app', 'blog', '[slug]', 'page.tsx'), 'utf8')
const clusterLinks = fs.readFileSync(path.join(ROOT, 'components', 'seo', 'OrganicSearchClusterLinks.tsx'), 'utf8')

// Front matter is read here directly: lib/markdown.ts pulls in remark, which Jest cannot load.
const BLOG = path.join(ROOT, 'content', 'blog')
const posts = fs
  .readdirSync(BLOG, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(BLOG, entry.name, 'index.md')))
  .map((entry) => {
    const { data } = matter(fs.readFileSync(path.join(BLOG, entry.name, 'index.md'), 'utf8'))
    return {
      slug: entry.name,
      date: data.date as unknown,
      updated: data.updated as unknown,
      hideDate: data.hideDate === true,
      noindex: data.noindex === true,
    }
  })

describe('blog post dates', () => {
  it('formats a front matter date without a clock, the same in any time zone', () => {
    expect(getPostDateParts('2023-03-28')).toEqual({
      iso: '2023-03-28',
      long: '28 March 2023',
      monthYear: 'March 2023',
    })
    // The last day of a month must not slip into the next one, or the one before.
    expect(getPostDateParts('2024-12-31')?.monthYear).toBe('December 2024')
    expect(getPostDateParts('2025-01-01')?.long).toBe('1 January 2025')
  })

  it('prints nothing for a date that is not a real calendar date', () => {
    for (const bad of ['', 'March 2023', '2023-02-30', '2023-13-01', '2023-00-10', undefined, null]) {
      expect(getPostDateParts(bad)).toBeNull()
    }
  })

  it('marks an old post kept out of search as an archive, until it is brought up to date', () => {
    expect(getPostDateLine({ date: '2019-10-03', noindex: true }).isArchive).toBe(true)
    expect(getPostDateLine({ date: '2019-10-03', noindex: false }).isArchive).toBe(false)

    const refreshed = getPostDateLine({ date: '2019-10-03', updated: '2026-09-12', noindex: true })
    expect(refreshed.isArchive).toBe(false)
    expect(refreshed.updated?.long).toBe('12 September 2026')
  })

  it('ignores an updated date that is not later than the published date', () => {
    expect(getPostDateLine({ date: '2026-03-20', updated: '2026-03-20' }).updated).toBeNull()
    expect(getPostDateLine({ date: '2026-03-20', updated: '2025-01-01' }).updated).toBeNull()
    expect(getPostDateLine({ date: '2026-03-20', updated: 'soon' }).updated).toBeNull()
  })

  it('hides a placeholder date but still says the post is an archive', () => {
    const line = getPostDateLine({ date: '2025-01-15', hideDate: true, noindex: true })
    expect(line.published).toBeNull()
    expect(line.isArchive).toBe(true)
  })

  it('every post in content/blog carries a date the template can print', () => {
    expect(posts.length).toBeGreaterThan(80)
    const unprintable = posts
      .filter((post) => !post.hideDate && getPostDateParts(post.date as string) === null)
      .map((post) => `${post.slug}: ${String(post.date)}`)
    expect(unprintable).toEqual([])

    const badUpdated = posts
      .filter(
        (post) =>
          post.updated !== undefined &&
          getPostDateLine({ date: post.date as string, updated: post.updated as string }).updated === null,
      )
      .map((post) => `${post.slug}: ${String(post.updated)}`)
    expect(badUpdated).toEqual([])
  })
})

describe('blog post template', () => {
  it('prints the dated notice on every post, with links to the pages that hold today\'s details', () => {
    expect(template).toContain('data-blog-dated-notice')
    expect(template).toContain('Published <time dateTime={dateLine.published.iso}>')
    expect(template).toContain('is kept as an archive. Times, prices, menus and events change.')
    expect(template).toContain('Hours, prices and events change.')
    for (const href of ['/find-us', '/food-menu', '/whats-on', '/book-table']) {
      expect(template).toContain(`<Link href="${href}" className={noticeLinkClass}>`)
    }
  })

  it('uses the updated date for dateModified when a post has one', () => {
    // One helper answers for the page, the share tags and the sitemap. It reads
    // `updated` by the same rule as the printed "Updated" line.
    expect(template).toContain('"dateModified": blogDateModified(post)')
    expect(blogDateModified({ slug: 'no-such-post', date: '2023-03-28', updated: '2026-10-08' })).toBe('2026-10-08')
    expect(blogDateModified({ slug: 'no-such-post', date: '2023-03-28' })).toBe('2023-03-28')
  })

  it('shows the plane spotting block only on plane spotting and beer garden posts', () => {
    // It used to appear on any post with "heathrow" in its address, so a
    // Christmas buffet guide ended with "a proper base for a day of spotting".
    expect(template).toContain(
      "const showSpottingCta = organicSearchCluster === 'planeSpotting' || organicSearchCluster === 'beerGarden'",
    )
    expect(template).not.toContain('HEATHROW_SLUG_KEYWORDS')
  })

  it('ends a party guide on a quote and a Christmas guide on the Christmas page', () => {
    expect(template).toContain('<Link href="/private-hire">Get a quote</Link>')
    expect(template).toContain('<Link href="/christmas-parties">Enquire about Christmas</Link>')
    expect(template).not.toContain('Experience everything we write about firsthand')
    expect(template).not.toContain('great food, drinks, and atmosphere')
  })

  it('does not describe the pub team as a person in structured data', () => {
    expect(template).toContain('"author": blogAuthorSchema(post.author)')
    expect(blogAuthorSchema('The Anchor Team')).toMatchObject({
      '@type': 'Organization',
      '@id': 'https://www.the-anchor.pub/#organization',
    })
    expect(blogAuthorSchema('Billy')['@type']).toBe('Person')
    // The Blog node points at this identifier, so the BlogPosting must carry it.
    expect(template.match(/#blogposting/g)?.length).toBe(2)
  })

  it('never shows the internal targeting note under a post', () => {
    expect(clusterLinks).not.toContain('description: seoCluster.targetIntent')
    expect(template).toContain('headings="label"')
    for (const cluster of Object.values(organicSearchClusters)) {
      expect(cluster.primaryLabel).toBeTruthy()
      expect(cluster.primaryDescription).toBeTruthy()
      expect(cluster.primaryDescription).not.toBe(cluster.targetIntent)
      // Written for a reader, not about one.
      expect(cluster.primaryDescription).not.toMatch(/^(People|Travellers|Drivers|Organisers|Nearby)\b/)
    }
  })

  it('keeps the wake card off celebration guides', () => {
    expect(template).toContain("!post.slug.includes('wake') ? ['/private-hire/wakes'] : []")
  })
})

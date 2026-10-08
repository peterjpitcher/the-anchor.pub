/**
 * Guards for what the site tells search engines: structured data, share
 * pictures, blog bylines and dates, and the sitemap's "last changed" dates.
 *
 * Each block names the fault that shipped, because every one of them passed
 * the suite that existed at the time. Site review of 7 October 2026, P16.
 */
import fs from 'fs'
import path from 'path'

import { generateBreadcrumbSchema, toAbsoluteSiteUrl } from '@/lib/enhanced-schemas'
import { organizationSchema } from '@/lib/schema'
import { blogAuthorSchema, blogDateModified, isTeamByline } from '@/lib/blog/post-schema'
import { buildSpecialOpeningHoursSchema } from '@/lib/opening-hours-schema'
import { getBlogLastModified, getRouteLastModified } from '@/lib/sitemap-lastmod'
import { getAllBlogPosts } from '@/lib/markdown'
import { lookupRedirect } from '@/lib/middleware-redirects'
import { pageOpenGraph } from '@/lib/page-open-graph'
import lastmod from '@/config/sitemap-lastmod.json'

// remark is ESM-only and Jest cannot load it. Listing posts reads frontmatter
// only and never calls it, so empty stand-ins are enough.
jest.mock('remark', () => ({ remark: jest.fn() }))
jest.mock('remark-gfm', () => ({ __esModule: true, default: {} }))
jest.mock('remark-html', () => ({ __esModule: true, default: {} }))

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { latestDates, findPageRoutes } = require('../../scripts/generate-sitemap-lastmod.js')

const ROOT = path.join(__dirname, '..', '..')
const SITE = 'https://www.the-anchor.pub'

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

describe('breadcrumb addresses', () => {
  // Six pages published "https://www.the-anchor.pubhttps://www.the-anchor.pub/x".
  it('builds one address from a path', () => {
    expect(toAbsoluteSiteUrl('/private-hire')).toBe(`${SITE}/private-hire`)
    expect(toAbsoluteSiteUrl('/')).toBe(`${SITE}/`)
  })

  it('leaves a full address alone instead of adding the site to it again', () => {
    expect(toAbsoluteSiteUrl(`${SITE}/private-hire`)).toBe(`${SITE}/private-hire`)
    const schema = generateBreadcrumbSchema([
      { name: 'Home', url: SITE },
      { name: 'Private Hire', url: `${SITE}/private-hire` },
    ])
    for (const element of schema.itemListElement) {
      expect(element.item.match(/https:\/\//g)).toHaveLength(1)
    }
  })

  it('no page hands a full address to the breadcrumb component', () => {
    const offenders = walk(path.join(ROOT, 'app'))
      .filter((file) => /page\.tsx$/.test(file))
      .filter((file) => {
        const source = fs.readFileSync(file, 'utf8')
        const blocks = source.match(/<BreadcrumbJsonLd[\s\S]*?\/>/g) || []
        return blocks.some((block) => /url:\s*['"`]https?:\/\//.test(block))
      })
      .map((file) => path.relative(ROOT, file))
    expect(offenders).toEqual([])
  })
})

describe('pictures named in code exist', () => {
  // The logo on every page and the What's On share picture named files that
  // were never in public/. Nothing checked, so both sat broken for months.
  // lib/static-events.ts is left out: it is read only by a test, is not
  // served, and still names eight pictures that were never added.
  const NOT_SERVED = new Set(['lib/static-events.ts'])

  it('every picture, download and font path in app, components and lib is a real file', () => {
    const pattern = /["'`]((?:https:\/\/www\.the-anchor\.pub)?\/(?:images|downloads|fonts)\/[^"'`$\s]+\.(?:png|jpe?g|webp|avif|svg|gif|pdf|woff2?))["'`]/g
    const missing: string[] = []
    for (const dir of ['app', 'components', 'lib']) {
      for (const file of walk(path.join(ROOT, dir))) {
        const relative = path.relative(ROOT, file).split(path.sep).join('/')
        if (!/\.(tsx?|json)$/.test(relative) || /__tests__|\.test\./.test(relative) || NOT_SERVED.has(relative)) continue
        const source = fs.readFileSync(file, 'utf8')
        for (const match of source.matchAll(pattern)) {
          const local = decodeURIComponent(match[1].replace(SITE, ''))
          if (!fs.existsSync(path.join(ROOT, 'public', local))) missing.push(`${relative}: ${local}`)
        }
      }
    }
    expect(missing).toEqual([])
  })

  it('the logo given to search engines is the file in /images/branding', () => {
    expect(organizationSchema.logo).toBe(`${SITE}/images/branding/the-anchor-pub-logo-black-transparent.png`)
    expect(fs.existsSync(path.join(ROOT, 'public', organizationSchema.logo.replace(SITE, '')))).toBe(true)
  })

  it('SSOT.json names logo files that exist', () => {
    const ssot = fs.readFileSync(path.join(ROOT, 'SSOT.json'), 'utf8')
    const logos = [...ssot.matchAll(/"(\/images\/[^"]*logo[^"]*\.png)"/g)].map((match) => match[1])
    expect(logos.length).toBeGreaterThan(0)
    for (const logo of logos) expect(fs.existsSync(path.join(ROOT, 'public', logo))).toBe(true)
  })
})

describe('profiles claimed as the pub', () => {
  it('does not claim an OpenTable listing nobody has confirmed', () => {
    for (const file of ['lib/schema.ts', 'lib/schema-with-reviews.ts']) {
      expect(fs.readFileSync(path.join(ROOT, file), 'utf8').toLowerCase()).not.toContain('opentable')
    }
    expect(organizationSchema.sameAs.join(' ').toLowerCase()).not.toContain('opentable')
  })
})

describe('share blocks', () => {
  it('the root layout sets no share address, so a page never shares as the homepage', () => {
    const layout = fs.readFileSync(path.join(ROOT, 'app/layout.tsx'), 'utf8')
    const block = layout.slice(layout.indexOf('openGraph: {'), layout.indexOf('twitter: {'))
    // Four spaces is the block's own level; the picture's url sits deeper.
    expect(block).toContain('siteName')
    expect(block).not.toMatch(/^ {4}url:/m)
  })

  it('pageOpenGraph gives a page its own title and a picture, and no address', () => {
    const block = pageOpenGraph({ title: 'Accessibility', description: 'Step free.' }) as Record<string, unknown>
    expect(block.title).toBe('Accessibility | The Anchor')
    expect(block.url).toBeUndefined()
    expect(Array.isArray(block.images) && (block.images as unknown[]).length).toBe(1)
  })
})

describe('blog bylines and dates', () => {
  it('a team byline is the business, not a person', () => {
    expect(isTeamByline('The Anchor Team')).toBe(true)
    expect(isTeamByline('the anchor')).toBe(true)
    expect(isTeamByline('Billy')).toBe(false)
    expect(blogAuthorSchema('The Anchor Team')).toMatchObject({ '@type': 'Organization', name: 'The Anchor' })
    expect(blogAuthorSchema('Billy')).toEqual({ '@type': 'Person', name: 'Billy' })
  })

  it("uses the editor's lastUpdated date when a post has one", () => {
    expect(blogDateModified({ slug: 'no-such-post', date: '2025-01-01', lastUpdated: '2026-03-04' })).toBe('2026-03-04')
  })

  it('never dates a change before the post was published', () => {
    // No commit recorded for this slug, so the published date stands as written.
    expect(blogDateModified({ slug: 'no-such-post', date: '2025-01-01' })).toBe('2025-01-01')
    const future = { slug: Object.keys(lastmod.blog)[0], date: '2999-01-01' }
    expect(blogDateModified(future)).toBe('2999-01-01')
    expect(getBlogLastModified(future)?.toISOString().slice(0, 10)).toBe('2999-01-01')
  })

  it('a post whose address redirects is in no listing', () => {
    // Related reading and previous or next links pointed at four such posts.
    const redirected = getAllBlogPosts().filter((post) => lookupRedirect(`/blog/${post.slug}`))
    expect(redirected.map((post) => post.slug)).toEqual([])
  })
})

describe('opening hours for special days', () => {
  const regularDay = { opens: '12:00:00', closes: '22:00:00', is_closed: false }
  const regularHours = Object.fromEntries(
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => [day, regularDay]),
  )
  const now = new Date('2026-12-01T12:00:00Z')
  const build = (specialHours: unknown[]) =>
    buildSpecialOpeningHoursSchema({ regularHours, specialHours } as never, now)

  it('publishes a closed day as 00:00 to 00:00 on that date only', () => {
    expect(build([{ date: '2026-12-25', is_closed: true }])).toEqual([
      { '@type': 'OpeningHoursSpecification', opens: '00:00', closes: '00:00', validFrom: '2026-12-25', validThrough: '2026-12-25' },
    ])
  })

  it('publishes changed times for a day that opens differently', () => {
    expect(build([{ date: '2026-12-31', is_closed: false, opens: '12:00:00', closes: '01:00:00' }])).toEqual([
      { '@type': 'OpeningHoursSpecification', opens: '12:00:00', closes: '01:00:00', validFrom: '2026-12-31', validThrough: '2026-12-31' },
    ])
  })

  it('says nothing about a day when only the kitchen is shut', () => {
    expect(build([{ date: '2026-12-22', is_closed: false, is_kitchen_closed: true, kitchen: null }])).toEqual([])
  })

  it('says nothing about a day that has already gone', () => {
    expect(build([{ date: '2026-11-30', is_closed: true }])).toEqual([])
  })

  it('says nothing at all when the hours could not be read', () => {
    expect(buildSpecialOpeningHoursSchema(null, now)).toEqual([])
    expect(buildSpecialOpeningHoursSchema({ regularHours } as never, now)).toEqual([])
  })
})

describe('sitemap dates come from git, not from typing', () => {
  it('app/sitemap.ts holds no typed date', () => {
    const source = fs.readFileSync(path.join(ROOT, 'app/sitemap.ts'), 'utf8')
    expect(source).not.toMatch(/new Date\(\s*['"`]\d{4}-/)
  })

  it('never answers with today when a page has no recorded date', () => {
    expect(getRouteLastModified('/no-such-page')).toBeUndefined()
  })

  it('finds a page built from a template by its real address', () => {
    expect(getRouteLastModified('/heathrow-parking/terminal-2')).toEqual(
      new Date(lastmod.routes['/heathrow-parking/[terminal]']),
    )
    expect(getRouteLastModified('')).toEqual(new Date(lastmod.routes['/']))
  })

  it('records real pages only, with real dates, none of them in the future', () => {
    // A page added since the file was last written has no entry yet, and so
    // gets no lastmod. That is allowed. An entry for a page that no longer
    // exists, or a date that is not one, is not.
    const routes = new Set<string>(findPageRoutes().map((entry: { route: string }) => entry.route))
    const unknown = Object.keys(lastmod.routes).filter((route) => !routes.has(route))
    expect(unknown).toEqual([])
    expect(Object.keys(lastmod.routes).length).toBeGreaterThan(80)
    const now = Date.now()
    for (const value of [...Object.values(lastmod.routes), ...Object.values(lastmod.blog)]) {
      expect(Number.isNaN(Date.parse(value))).toBe(false)
      expect(Date.parse(value)).toBeLessThanOrEqual(now)
    }
  })

  it('takes the latest commit for each file', () => {
    const log = ['\0aaa\t2026-10-02T10:00:00+01:00', '', 'app/a/page.tsx', '\0bbb\t2026-09-01T10:00:00+01:00', '', 'app/a/page.tsx', 'app/b/page.tsx'].join('\n')
    const dates = latestDates(log)
    expect(dates.get('app/a/page.tsx')).toBe('2026-10-02T10:00:00+01:00')
    expect(dates.get('app/b/page.tsx')).toBe('2026-09-01T10:00:00+01:00')
  })

  it('ignores the oldest commit of a shallow clone, which appears to add every file', () => {
    // Vercel clones ten commits. The boundary commit lists the whole site as
    // new, so trusting it would date every page to that one commit.
    const log = ['\0new\t2026-10-02T10:00:00+01:00', '', 'app/a/page.tsx', '\0edge\t2026-09-30T10:00:00+01:00', '', 'app/a/page.tsx', 'app/b/page.tsx'].join('\n')
    const dates = latestDates(log, new Set(['edge']))
    expect(dates.get('app/a/page.tsx')).toBe('2026-10-02T10:00:00+01:00')
    expect(dates.has('app/b/page.tsx')).toBe(false)
  })
})

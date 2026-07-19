/**
 * SEO regression tests — guards against contradictions between robots.txt,
 * sitemap.xml, the redirects table, and noindex blog posts.
 *
 * These tests exist because each of the failure modes below has shipped at
 * least once and required manual remediation:
 *
 * 1. robots.txt blocked deployment-tagged static assets (`/*?dpl=*`),
 *    breaking page rendering for crawlers and triggering "Indexed, though
 *    blocked by robots.txt" in GSC.
 * 2. A sitemap URL was also a 301 redirect source (e.g. `/drinks/baby-guinness`),
 *    triggering "Page with redirect" in GSC.
 * 3. A noindex blog post was still listed in the sitemap.
 * 4. A redirect destination was the source of another redirect, creating a
 *    301 chain (which Google follows but penalises in crawl budget).
 *
 * If a future SEO edit re-introduces any of these, the corresponding test
 * here will fail.
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { NextRequest } from 'next/server'

// Mock the events API so the sitemap test does not hit the network. The
// sitemap calls `anchorAPI.getEvents` inside `getSitemapEvents`; returning
// an empty list keeps the test deterministic and isolated from production.
jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getEvents: jest.fn().mockResolvedValue({ events: [] }),
  },
}))

/**
 * Mock the markdown pipeline. The real `getAllBlogPosts` pulls in `remark`,
 * which is published as ESM and breaks Jest's CommonJS transformer. We
 * replace it with a lightweight reader that walks `content/blog/*` directly
 * and returns the same shape the sitemap consumes (slug + tags + noindex
 * + date). This keeps the test dependent on real frontmatter — including
 * `noindex: true` posts — while sidestepping the markdown-to-HTML stage.
 */
jest.mock('@/lib/markdown', () => {
  const fs = jest.requireActual<typeof import('fs')>('fs')
  const path = jest.requireActual<typeof import('path')>('path')
  const matter = jest.requireActual<typeof import('gray-matter')>('gray-matter')

  function getAllBlogPosts() {
    const blogDir = path.join(process.cwd(), 'content', 'blog')
    if (!fs.existsSync(blogDir)) return []

    return fs
      .readdirSync(blogDir)
      .map((entry: string) => {
        const indexPath = path.join(blogDir, entry, 'index.md')
        if (!fs.existsSync(indexPath)) return null
        const { data } = matter(fs.readFileSync(indexPath, 'utf8'))
        const tags = Array.isArray(data.tags)
          ? data.tags.filter((t: unknown): t is string => typeof t === 'string')
          : []
        return {
          slug: entry,
          title: data.title || '',
          description: data.description || '',
          date: data.date || '',
          author: data.author || '',
          keywords: [],
          tags,
          hero: '',
          images: [],
          imageAlts: [],
          content: '',
          noindex: data.noindex === true,
        }
      })
      .filter(Boolean)
  }

  function getIndexableBlogPosts() {
    return getAllBlogPosts().filter((post): post is NonNullable<typeof post> => post !== null && !post.noindex)
  }

  return { getAllBlogPosts, getIndexableBlogPosts }
})

import robots from '@/app/robots'
import sitemap from '@/app/sitemap'
import {
  generateMetadata as generateBlogTagMetadata,
  generateStaticParams as generateBlogTagStaticParams,
} from '@/app/blog/tag/[tag]/page'
import BlogTagPage from '@/app/blog/tag/[tag]/page'
import { isNoindexBlogTag } from '@/lib/blog-tag-policy'
import { middleware } from '@/middleware'
import {
  lookupRedirect,
  getRedirectStatus,
  getRedirectMapSize,
  resolveRedirectUrl,
} from '@/lib/middleware-redirects'
import { seasonalOccasionLinks, trustLinks } from '@/lib/internal-linking-data'
import { landmarks } from '@/lib/local-seo-data'
import { buildBreadcrumbItemList } from '@/lib/breadcrumb-schema'
import { buildJobPostingSchema } from '@/app/join-our-team/_components/RecruitmentRolePage'
import { recruitmentDatePosted, recruitmentValidThrough } from '@/app/join-our-team/recruitmentContent'

import additionalRedirects from '@/config/redirects/additional-redirects.json'
import blogRedirects from '@/config/redirects/blog-redirects.json'
import drinksRedirects from '@/config/redirects/drinks-redirects.json'
import legacyRedirects from '@/config/redirects/legacy-redirects.json'
import tagRedirects from '@/config/redirects/tag-redirects.json'
import wixRedirects from '@/config/redirects/wix-redirects.json'

interface RedirectRule {
  source: string
  destination: string
  permanent?: boolean
  statusCode?: number
}

const BASE_URL = 'https://www.the-anchor.pub'

const ALL_REDIRECTS: RedirectRule[] = [
  ...(additionalRedirects as RedirectRule[]),
  ...(blogRedirects as RedirectRule[]),
  ...(drinksRedirects as RedirectRule[]),
  ...(legacyRedirects as RedirectRule[]),
  ...(tagRedirects as RedirectRule[]),
  ...(wixRedirects as RedirectRule[]),
]

/**
 * Strips the base URL from a sitemap entry so it can be compared directly
 * against a redirect `source` (which is always an absolute path).
 */
function toPath(absoluteUrl: string): string {
  if (absoluteUrl.startsWith(BASE_URL)) {
    return absoluteUrl.slice(BASE_URL.length) || '/'
  }
  return absoluteUrl
}

/**
 * Redirect sources may contain Next.js path patterns like `:slug` or
 * `:path*`. These should not be treated as concrete URLs when comparing
 * against the sitemap (the sitemap only ever emits concrete URLs). Strip
 * patterned sources so they cannot produce false positives.
 */
function isConcretePath(source: string): boolean {
  return !source.includes(':') && !source.includes('*')
}

describe('robots.txt', () => {
  const result = robots()
  const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules
  const disallow = Array.isArray(rules.disallow)
    ? rules.disallow
    : rules.disallow
      ? [rules.disallow]
      : []
  const allow = Array.isArray(rules.allow)
    ? rules.allow
    : rules.allow
      ? [rules.allow]
      : []

  it('does not disallow the deployment-tag query parameter (`/*?dpl=*`)', () => {
    // Vercel appends `?dpl=<deployment-id>` to static asset URLs for cache
    // busting. Disallowing it caused crawlers to skip those assets and
    // surfaced "Indexed, though blocked by robots.txt" warnings.
    const offending = disallow.filter((rule) => rule.includes('dpl='))
    expect(offending).toEqual([])
  })

  it('allows root and static assets so crawlers can render pages', () => {
    expect(allow).toEqual(expect.arrayContaining(['/', '/_next/static/']))
  })

  it('does not disallow event opengraph-image routes', () => {
    // OG-image routes must remain crawlable so social previews can fetch them.
    // They opt out of search indexing via X-Robots-Tag (set on the route),
    // not via robots.txt, so robots.txt should never block them.
    const offending = disallow.filter((rule) => rule.includes('opengraph-image'))
    expect(offending).toEqual([])
  })

  it('allows AI crawlers (no per-bot disallow group)', () => {
    // The previous policy blocked AI scraper / model-training crawlers via a
    // dedicated rule group. That opt-out has been removed so AI crawlers can
    // index the site (LLM/AEO visibility). Guards against re-introducing a
    // blanket disallow for any of these user agents.
    const groups = Array.isArray(result.rules) ? result.rules : [result.rules]
    const aiBots = [
      'Amazonbot',
      'Applebot-Extended',
      'Bytespider',
      'CCBot',
      'ClaudeBot',
      'CloudflareBrowserRenderingCrawler',
      'Google-Extended',
      'GPTBot',
      'meta-externalagent',
    ]
    const blockedAiGroup = groups.find((g) => {
      const ua = Array.isArray(g.userAgent) ? g.userAgent : g.userAgent ? [g.userAgent] : []
      if (!ua.some((agent) => aiBots.includes(agent))) return false
      const dis = Array.isArray(g.disallow) ? g.disallow : g.disallow ? [g.disallow] : []
      return dis.includes('/')
    })
    expect(blockedAiGroup).toBeUndefined()
  })
})

describe('middleware redirect lookup (apex/host chain flattening)', () => {
  // The seven URLs reported by GSC as "Redirect error" — see
  // tasks/gsc-indexing-fix/FINAL-SPEC.md §P0.1. Both www and apex variants of
  // these tags must resolve in a single hop to the consolidated destination,
  // not via the apex -> www -> destination chain.
  const REDIRECT_ERROR_URLS: Array<{ source: string; destination: string }> = [
    { source: '/blog/tag/rugby', destination: '/blog/tag/sports' },
    { source: '/blog/tag/premier-league', destination: '/blog/tag/sports' },
    { source: '/blog/tag/pet-friendly', destination: '/blog/tag/community' },
    { source: '/blog/tag/dog-friendly', destination: '/blog/tag/community' },
  ]

  it('does not let broad Vercel redirects preempt middleware flattening', () => {
    // Vercel routing runs before Next middleware. Broad host/trailing-slash
    // redirects in vercel.json recreate the apex -> www -> destination chain
    // before middleware can combine the host and path redirect.
    const vercelConfig = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf8'),
    )
    const broadRedirects = (vercelConfig.redirects || []).filter(
      (rule: { source?: string }) =>
        rule.source === '/(.*)' || rule.source === '/(.*)/',
    )

    expect(broadRedirects).toEqual([])
  })

  it('keeps concrete redirects out of next.config.js so middleware owns one-hop flattening', async () => {
    const nextConfig = require('../next.config.js')
    const frameworkRedirects = await nextConfig.redirects()
    const concreteFrameworkRedirects = frameworkRedirects.filter((rule: RedirectRule) =>
      isConcretePath(rule.source),
    )

    expect(concreteFrameworkRedirects).toEqual([])
  })

  it.each(REDIRECT_ERROR_URLS)(
    'flattens $source to $destination in one hop',
    ({ source, destination }) => {
      const rule = lookupRedirect(source)
      expect(rule).toBeDefined()
      expect(rule!.destination).toBe(destination)
      expect(getRedirectStatus(rule!)).toBe(301)
    },
  )

  it('middleware emits the canonical host and destination for apex concrete redirects', () => {
    const request = new NextRequest('https://the-anchor.pub/blog/tag/rugby', {
      headers: {
        host: 'the-anchor.pub',
        'x-forwarded-proto': 'https',
      },
    })

    const response = middleware(request)

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe(
      'https://www.the-anchor.pub/blog/tag/sports',
    )
  })

  it('returns undefined for paths that should not redirect', () => {
    expect(lookupRedirect('/')).toBeUndefined()
    expect(lookupRedirect('/sunday-roast')).toBeUndefined()
    expect(lookupRedirect('/whats-on')).toBeUndefined()
  })

  it('preserves external redirect destinations', () => {
    const rule = lookupRedirect('/leave-review')
    expect(rule).toBeDefined()
    expect(rule!.destination).toBe('https://g.page/r/CQz1W5fqSTqPEAI/review')

    const redirectUrl = resolveRedirectUrl(
      new URL('https://www.the-anchor.pub/leave-review'),
      rule!,
    )

    expect(redirectUrl.toString()).toBe('https://g.page/r/CQz1W5fqSTqPEAI/review')
  })

  it('preserves query strings for same-site concrete redirects', () => {
    const rule = lookupRedirect('/blog/tag/rugby')
    expect(rule).toBeDefined()

    const redirectUrl = resolveRedirectUrl(
      new URL('https://www.the-anchor.pub/blog/tag/rugby?utm_source=test'),
      rule!,
    )

    expect(redirectUrl.toString()).toBe(
      'https://www.the-anchor.pub/blog/tag/sports?utm_source=test',
    )
  })

  it('preserves section fragments for same-site concrete redirects', () => {
    const rule = lookupRedirect('/food/pizza')
    expect(rule).toBeDefined()
    expect(rule!.destination).toBe('/food-menu#pizza')

    const redirectUrl = resolveRedirectUrl(
      new URL('https://www.the-anchor.pub/food/pizza?utm_source=test'),
      rule!,
    )

    expect(redirectUrl.toString()).toBe(
      'https://www.the-anchor.pub/food-menu?utm_source=test#pizza',
    )
  })

  it('redirects the retired burger page to the burger section', () => {
    const rule = lookupRedirect('/burger-menu')
    expect(rule).toBeDefined()
    expect(rule!.destination).toBe('/food-menu#burgers')
    expect(getRedirectStatus(rule!)).toBe(301)
  })

  it('middleware preserves the section fragment for retired menu pages', () => {
    const request = new NextRequest('https://www.the-anchor.pub/burger-menu', {
      headers: {
        host: 'www.the-anchor.pub',
        'x-forwarded-proto': 'https',
      },
    })

    const response = middleware(request)

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe(
      'https://www.the-anchor.pub/food-menu#burgers',
    )
  })

  it('redirects the retired open-mic page to live music', () => {
    const rule = lookupRedirect('/open-mic')
    expect(rule).toBeDefined()
    expect(rule!.destination).toBe('/live-music')
    expect(getRedirectStatus(rule!)).toBe(301)
  })

  it('does not include pattern-based sources (those stay in next.config.js)', () => {
    // Pattern rules use `:slug` or `:path*` syntax — middleware can not match
    // them with a simple Map lookup, so they remain in the framework redirects
    // pipeline. This guards against accidentally precompiling them and
    // producing literal `/profile/:path*` matches.
    expect(lookupRedirect('/profile/:path*')).toBeUndefined()
    expect(lookupRedirect('/_api/:path*')).toBeUndefined()
  })

  it('flattening map is non-empty and bounded by total concrete rules', () => {
    // Sanity check: the map should contain at least one rule per redirect file
    // (defended via a soft lower bound) and no more than the total rule count.
    const size = getRedirectMapSize()
    expect(size).toBeGreaterThan(100)
    expect(size).toBeLessThanOrEqual(ALL_REDIRECTS.length)
  })

  it('flattened destinations are not themselves redirect sources', () => {
    // If a destination is also a source, middleware would still emit a single
    // 301 but the result would land on a redirect, recreating a chain on the
    // next request. Guards against accidental chain reintroduction.
    const sources = new Set(
      ALL_REDIRECTS.filter((r) => isConcretePath(r.source)).map((r) => r.source),
    )
    const offending = REDIRECT_ERROR_URLS.filter(({ destination }) =>
      sources.has(destination),
    )
    expect(offending).toEqual([])
  })
})

describe('sitemap-vs-redirects', () => {
  it('does not list any URL that is also a redirect source', async () => {
    const sitemapEntries = await sitemap()
    const sitemapPaths = new Set(sitemapEntries.map((entry) => toPath(entry.url)))

    const redirectSources = new Set(
      ALL_REDIRECTS.filter((r) => isConcretePath(r.source)).map((r) => r.source),
    )

    const offending = Array.from(sitemapPaths).filter((p) => redirectSources.has(p))

    // If any sitemap URL is also a redirect source we will trigger
    // "Page with redirect" in Google Search Console. Either remove the
    // page from the sitemap or remove the redirect.
    expect(offending).toEqual([])
  })
})

describe('orphan-page internal linking guards', () => {
  // Bonfire Night, Boxing Day, St Patrick's and Bank Holidays were 301'd to
  // evergreen parents (June 2026 SEO cleanup) and removed from the link set.
  const previouslyOrphanedSeasonalPaths = [
    '/easter-sunday',
    '/fathers-day',
    '/halloween',
    '/new-years-eve',
  ]

  const previouslyOrphanedTrustPaths = [
    '/reviews',
    '/safety-and-respect',
    '/sustainability',
  ]

  it('keeps previously orphaned seasonal pages in the shared occasion link set', () => {
    const seasonalPaths = seasonalOccasionLinks.map((link) => link.href)
    expect(seasonalPaths).toEqual(expect.arrayContaining(previouslyOrphanedSeasonalPaths))
  })

  it('keeps previously orphaned trust pages in the shared footer link set', () => {
    const linkedTrustPaths = trustLinks.map((link) => link.href)
    expect(linkedTrustPaths).toEqual(expect.arrayContaining(previouslyOrphanedTrustPaths))
  })

  it('has local landmark pages available for the private-hire hub', () => {
    const landmarkPaths = landmarks.map((landmark) => `/private-hire/near/${landmark.slug}`)

    expect(landmarkPaths).toEqual(expect.arrayContaining([
      '/private-hire/near/ashford-town-fc',
      '/private-hire/near/bedfont-lakes',
      '/private-hire/near/great-fosters-egham',
      '/private-hire/near/heathrow-airport',
      '/private-hire/near/spelthorne-registration-office',
      '/private-hire/near/staines-registration-office',
      '/private-hire/near/staines-rugby-club',
      '/private-hire/near/stockley-park',
      '/private-hire/near/windsor-register-office',
    ]))
  })

  it('wires the orphan repair link sets into crawlable hubs', () => {
    const whatsOnPage = fs.readFileSync(path.join(process.cwd(), 'app', 'whats-on', 'page.tsx'), 'utf8')
    const privateHirePage = fs.readFileSync(path.join(process.cwd(), 'app', 'private-hire', 'page.tsx'), 'utf8')
    const footer = fs.readFileSync(path.join(process.cwd(), 'components', 'layout', 'Footer.tsx'), 'utf8')

    expect(whatsOnPage).toContain('seasonalOccasionLinks')
    expect(whatsOnPage).toContain('getRecentEvents')
    expect(privateHirePage).toContain('landmarkGroups')
    expect(footer).toContain('trustLinks')
  })

  it('strengthens the one-link commercial blog posts from relevant pages', () => {
    const fishPage = fs.readFileSync(path.join(process.cwd(), 'app', 'fish-and-chips-heathrow', 'page.tsx'), 'utf8')
    const christmasPage = fs.readFileSync(path.join(process.cwd(), 'app', 'christmas-parties', 'page.tsx'), 'utf8')

    expect(fishPage).toContain('/blog/fish-chips-guide')
    expect(christmasPage).toContain('/blog/office-christmas-party-planning-guide')
  })
})

describe('sitemap-vs-noindex', () => {
  /**
   * Read blog frontmatter directly so the test does not depend on the
   * `getAllBlogPosts` helper (which exercises the full markdown pipeline
   * and pulls in image-existence side effects). We only need the slug
   * and the `noindex` flag.
   */
  function readNoindexBlogSlugs(): string[] {
    const blogDir = path.join(process.cwd(), 'content', 'blog')
    if (!fs.existsSync(blogDir)) return []

    const slugs: string[] = []
    for (const entry of fs.readdirSync(blogDir)) {
      const indexPath = path.join(blogDir, entry, 'index.md')
      if (!fs.existsSync(indexPath)) continue
      const { data } = matter(fs.readFileSync(indexPath, 'utf8'))
      if (data.noindex === true) {
        slugs.push(entry)
      }
    }
    return slugs
  }

  it('does not include any blog post that has noindex: true in its frontmatter', async () => {
    const noindexSlugs = readNoindexBlogSlugs()

    // Sanity check: this protection is meaningful only if we actually have
    // some noindex posts in the corpus.
    expect(noindexSlugs.length).toBeGreaterThan(0)

    const sitemapEntries = await sitemap()
    const sitemapPaths = new Set(sitemapEntries.map((entry) => toPath(entry.url)))

    const offending = noindexSlugs.filter((slug) => sitemapPaths.has(`/blog/${slug}`))
    expect(offending).toEqual([])
  })
})

describe('blog archive-vs-noindex', () => {
  function readBlogTagIndexability(): Map<string, { indexable: string[]; noindex: string[] }> {
    const blogDir = path.join(process.cwd(), 'content', 'blog')
    const tagStats = new Map<string, { indexable: string[]; noindex: string[] }>()
    if (!fs.existsSync(blogDir)) return tagStats

    for (const entry of fs.readdirSync(blogDir)) {
      const indexPath = path.join(blogDir, entry, 'index.md')
      if (!fs.existsSync(indexPath)) continue
      const { data } = matter(fs.readFileSync(indexPath, 'utf8'))
      const tags = Array.isArray(data.tags)
        ? data.tags.filter((t: unknown): t is string => typeof t === 'string')
        : []

      for (const tag of tags) {
        const key = tag.trim().toLowerCase()
        const current = tagStats.get(key) || { indexable: [], noindex: [] }
        if (data.noindex === true) {
          current.noindex.push(entry)
        } else {
          current.indexable.push(entry)
        }
        tagStats.set(key, current)
      }
    }

    return tagStats
  }

  function collectHrefs(node: unknown): string[] {
    if (node == null || typeof node === 'boolean') return []
    if (Array.isArray(node)) return node.flatMap(collectHrefs)
    if (typeof node !== 'object') return []

    const element = node as { props?: { href?: unknown; children?: unknown } }
    const ownHref = typeof element.props?.href === 'string' ? [element.props.href] : []
    return ownHref.concat(collectHrefs(element.props?.children))
  }

  it('does not generate tag archive pages for tags that only contain noindex posts', async () => {
    const tagStats = readBlogTagIndexability()
    const noindexOnlyTags = [...tagStats.entries()]
      .filter(([, stats]) => stats.noindex.length > 0 && stats.indexable.length === 0)
      .map(([tag]) => tag)

    const generatedTags = new Set(
      (await generateBlogTagStaticParams()).map(({ tag }) => tag),
    )
    const offending = noindexOnlyTags.filter((tag) => generatedTags.has(tag))

    expect(offending).toEqual([])
  })

  it('does not surface noindex posts on indexable tag archive pages', async () => {
    const tagStats = readBlogTagIndexability()
    const candidate = [...tagStats.entries()].find(
      ([, stats]) => stats.indexable.length > 0 && stats.noindex.length > 0,
    )

    // The real corpus has mixed tags like `news` and `events`, where legacy
    // noindex posts should not dilute the indexable archive page.
    expect(candidate).toBeDefined()

    const [tag, stats] = candidate!
    const rendered = await BlogTagPage({ params: { tag } })
    const hrefs = new Set(collectHrefs(rendered))
    const offending = stats.noindex.filter((slug) => hrefs.has(`/blog/${slug}`))

    expect(offending).toEqual([])
  })
})

describe('blog tag index policy', () => {
  const broadArchiveTags = ['events', 'food-and-drink', 'news', 'sports']

  it.each(broadArchiveTags)(
    'keeps broad archive tag %s noindexed and out of the sitemap',
    async (tag) => {
      expect(isNoindexBlogTag(tag)).toBe(true)

      const metadata = await generateBlogTagMetadata({ params: { tag } })
      expect(metadata.robots).toEqual({ index: false, follow: true })

      const sitemapEntries = await sitemap()
      const sitemapPaths = new Set(sitemapEntries.map((entry) => toPath(entry.url)))
      expect(sitemapPaths.has(`/blog/tag/${tag}`)).toBe(false)
    },
  )
})

describe('redirect-loops', () => {
  it('has no redirect whose destination matches its own source', () => {
    const selfLoops = ALL_REDIRECTS.filter((r) => r.destination === r.source)
    expect(selfLoops).toEqual([])
  })

  it('has no two-step redirect chains (a redirect destination is not also a redirect source)', () => {
    // A destination that is also a source forces Googlebot to follow a
    // chain (A -> B -> C). One-step chains waste crawl budget; longer
    // chains can stop being followed entirely.
    const sources = new Set(
      ALL_REDIRECTS.filter((r) => isConcretePath(r.source)).map((r) => r.source),
    )

    const chained = ALL_REDIRECTS.filter(
      (r) => isConcretePath(r.destination) && sources.has(r.destination),
    ).map((r) => `${r.source} -> ${r.destination}`)

    expect(chained).toEqual([])
  })
})

describe('structured data — breadcrumbs', () => {
  // Guards GSC "Breadcrumbs: Missing field 'item' (in 'itemListElement')".
  // The shape below mirrors HeroWrapper.generateBreadcrumbsFromRoute output for
  // /private-hire/near/slough-crematorium: Home + a clickable parent + the
  // section-only `near` segment (no page) + the current page (url, no href).
  it('emits an item URL for every ListItem, including the current page', () => {
    const trail = [
      { name: 'Home', href: '/' },
      { name: 'Private Hire', href: '/private-hire', url: '/private-hire' },
      { name: 'Near' },
      { name: 'Slough Crematorium', url: '/private-hire/near/slough-crematorium' },
    ]

    const items = buildBreadcrumbItemList(trail)

    // Every ListItem carries a non-empty `item` (the previous bug emitted
    // `item: undefined`, which JSON.stringify drops entirely).
    expect(items.every((i) => typeof i.item === 'string' && i.item.length > 0)).toBe(true)
    // The section-only `near` segment is dropped, leaving contiguous positions.
    expect(items.map((i) => i.name)).toEqual(['Home', 'Private Hire', 'Slough Crematorium'])
    expect(items.map((i) => i.position)).toEqual([1, 2, 3])
    expect(items[2].item).toBe('https://www.the-anchor.pub/private-hire/near/slough-crematorium')
  })
})

describe('structured data — JobPosting', () => {
  // Guards GSC "Job Postings: Missing field 'validThrough'". Google can drop a
  // posting once validThrough passes, so it must be present and in the future
  // relative to datePosted.
  it('sets validThrough later than datePosted so postings do not silently expire', () => {
    const role = {
      slug: 'bar-staff',
      role: 'Bar Staff',
      jobPostingDescription: 'Test description',
      workHours: 'Part-time, evenings and weekends',
    } as unknown as Parameters<typeof buildJobPostingSchema>[0]

    const schema = buildJobPostingSchema(role)

    expect(schema.datePosted).toBe(recruitmentDatePosted)
    expect(schema.validThrough).toBe(recruitmentValidThrough)
    expect(new Date(schema.validThrough).getTime()).toBeGreaterThan(
      new Date(schema.datePosted).getTime(),
    )
  })
})

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

  return { getAllBlogPosts }
})

import robots from '@/app/robots'
import sitemap from '@/app/sitemap'

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

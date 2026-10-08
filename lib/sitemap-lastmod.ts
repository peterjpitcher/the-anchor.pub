import lastmod from '@/config/sitemap-lastmod.json'
import { getPostDateLine } from '@/lib/blog/post-dates'

/**
 * When each page last changed, worked out from git by
 * scripts/generate-sitemap-lastmod.js. Nothing here is typed by hand.
 *
 * A page with no entry has no trustworthy date, and callers must then give
 * none at all rather than fall back to today or to a guess.
 */

const ROUTE_DATES: Record<string, string> = lastmod.routes
const BLOG_DATES: Record<string, string> = lastmod.blog

/** '/heathrow-parking/[terminal]' matches '/heathrow-parking/terminal-2'. */
function patternMatches(pattern: string, path: string): boolean {
  const patternParts = pattern.split('/')
  const pathParts = path.split('/')
  if (patternParts.length !== pathParts.length) return false
  return patternParts.every((part, index) => (/^\[[^.\]]+\]$/.test(part) ? pathParts[index] !== '' : part === pathParts[index]))
}

function toDate(value: string | undefined): Date | undefined {
  if (!value) return undefined
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

/** The last change to a page, by its path ('' or '/' is the homepage). */
export function getRouteLastModified(path: string): Date | undefined {
  const route = path === '' ? '/' : path
  const exact = ROUTE_DATES[route]
  if (exact) return toDate(exact)
  const pattern = Object.keys(ROUTE_DATES).find((key) => key.includes('[') && patternMatches(key, route))
  return pattern ? toDate(ROUTE_DATES[pattern]) : undefined
}

/**
 * The last change to a blog post.
 *
 * `updated` in the post's frontmatter wins when an editor has set it: it is
 * the date the page prints as "Updated", read by the same rule (a real date,
 * later than the published one). If not, it is the later of the published date
 * and the last commit to the post's folder, so a post scheduled ahead is never
 * dated before it was published.
 */
export function getBlogLastModified(post: { slug: string; date: string; updated?: string }): Date | undefined {
  const stated = toDate(getPostDateLine(post).updated?.iso)
  if (stated) return stated
  const published = toDate(post.date)
  const committed = toDate(BLOG_DATES[post.slug])
  if (published && committed) return committed.getTime() > published.getTime() ? committed : published
  return committed ?? published
}

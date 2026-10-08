import { getBlogLastModified } from '@/lib/sitemap-lastmod'
import { getPostDateLine } from '@/lib/blog/post-dates'

/**
 * The two blog facts that the structured data used to get wrong.
 *
 * Author: 30 posts are credited to "The Anchor Team" or "The Anchor", and the
 * page told Google that was a person. A team byline is the business itself.
 *
 * Date changed: every post said it was last changed on the day it was first
 * published. It is now `updated` from the post's frontmatter when an editor has
 * set one, and otherwise the last commit to the post's folder.
 */

const ORGANIZATION_ID = 'https://www.the-anchor.pub/#organization'

const TEAM_BYLINES = new Set(['the anchor team', 'the anchor'])

export function isTeamByline(author: string): boolean {
  const byline = author.trim().toLowerCase()
  // A post with no byline is the pub's own too.
  return byline === '' || TEAM_BYLINES.has(byline)
}

export function blogAuthorSchema(author: string): Record<string, string> {
  if (isTeamByline(author)) {
    return {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: 'The Anchor',
      url: 'https://www.the-anchor.pub',
    }
  }
  return {
    '@type': 'Person',
    name: author,
  }
}

/**
 * The date a post was last changed, for `dateModified`. It is the same answer
 * the sitemap gives for the post's lastmod, so the two cannot disagree.
 */
export function blogDateModified(post: { slug: string; date: string; updated?: string }): string {
  // The editor's own date, exactly as the page prints it beside "Updated".
  const stated = getPostDateLine(post).updated?.iso
  if (stated) return stated
  const modified = getBlogLastModified(post)
  const published = new Date(post.date)
  // Unchanged since it was published: keep the date exactly as it was written.
  if (!modified || Number.isNaN(published.getTime()) || modified.getTime() <= published.getTime()) return post.date
  return modified.toISOString()
}

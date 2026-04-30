/**
 * Concrete redirect lookup used by `middleware.ts` to flatten apex -> www -> path
 * chains into a single 301.
 *
 * Background:
 *   Without this, an apex URL like `the-anchor.pub/blog/tag/rugby` produced two
 *   hops: middleware first redirected to `www.the-anchor.pub/blog/tag/rugby`, and
 *   only then did Next.js redirects (configured in `next.config.js`) collapse the
 *   tag onto its consolidated destination (`/blog/tag/sports`). GSC reported the
 *   chain as a "Redirect error" for the seven URLs listed in
 *   `tasks/gsc-indexing-fix/FINAL-SPEC.md` §P0.1.
 *
 * Strategy:
 *   - Eager-load every concrete (non-pattern) redirect rule into a `Map` keyed by
 *     source path.
 *   - Skip rules whose `source` contains `:` `*` or `(` — those are pattern rules
 *     handled exclusively by Next.js.
 *   - Middleware can then resolve `path -> destination` in O(1) and apply both
 *     host change and path change in a single 301 response.
 *
 * Pattern-based rules (e.g. `/_api/:path*`, `/profile/:path*`) intentionally
 * remain in the `next.config.js` pipeline.
 */

import additionalRedirects from '@/config/redirects/additional-redirects.json'
import blogRedirects from '@/config/redirects/blog-redirects.json'
import drinksRedirects from '@/config/redirects/drinks-redirects.json'
import legacyRedirects from '@/config/redirects/legacy-redirects.json'
import tagRedirects from '@/config/redirects/tag-redirects.json'
import wixRedirects from '@/config/redirects/wix-redirects.json'

export interface RedirectRule {
  source: string
  destination: string
  permanent?: boolean
  statusCode?: number
}

const ALL_RULES: RedirectRule[] = [
  ...(additionalRedirects as RedirectRule[]),
  ...(blogRedirects as RedirectRule[]),
  ...(drinksRedirects as RedirectRule[]),
  ...(legacyRedirects as RedirectRule[]),
  ...(tagRedirects as RedirectRule[]),
  ...(wixRedirects as RedirectRule[]),
]

function isConcreteSource(source: string): boolean {
  if (typeof source !== 'string' || source.length === 0) return false
  return !source.includes(':') && !source.includes('*') && !source.includes('(')
}

function buildRedirectMap(): Map<string, RedirectRule> {
  const map = new Map<string, RedirectRule>()
  for (const rule of ALL_RULES) {
    if (!isConcreteSource(rule.source)) continue
    map.set(rule.source, rule)
  }
  return map
}

const REDIRECT_MAP = buildRedirectMap()

export function lookupRedirect(pathname: string): RedirectRule | undefined {
  return REDIRECT_MAP.get(pathname)
}

export function resolveRedirectUrl(currentUrl: URL, rule: RedirectRule): URL {
  if (/^https?:\/\//i.test(rule.destination)) {
    return new URL(rule.destination)
  }

  const redirectUrl = new URL(rule.destination, currentUrl)
  if (!redirectUrl.search && currentUrl.search) {
    redirectUrl.search = currentUrl.search
  }
  return redirectUrl
}

export function getRedirectStatus(rule: RedirectRule): number {
  if (typeof rule.statusCode === 'number') return rule.statusCode
  if (rule.permanent === true) return 301
  if (rule.permanent === false) return 302
  return 301
}

/**
 * Exposed for tests so we can assert the size and shape of the lookup table
 * without exporting the live Map (callers should not mutate it).
 */
export function getRedirectMapSize(): number {
  return REDIRECT_MAP.size
}

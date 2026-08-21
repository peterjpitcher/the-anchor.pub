import {
  lookupRedirect,
  lookupFallbackRedirect,
  FALLBACK_PATTERN_SOURCES,
} from '@/lib/middleware-redirects'
import blogRedirects from '@/config/redirects/blog-redirects.json'
import wixRedirects from '@/config/redirects/wix-redirects.json'

/**
 * Next's redirects() runs BEFORE middleware, so a catch-all registered there
 * beats every concrete rule in the middleware map.
 *
 * `/post/:slug -> /blog` was registered there, which silently killed all 232
 * concrete /post/* rules. 172 old Wix URLs that each had a specific migrated
 * post to land on were dumped on the blog index instead. Nothing errored: a
 * 301 to /blog looks healthy in every check that only asks "does it reach a
 * 200?", which is why it survived an audit that tested exactly that.
 */
const CONCRETE_POST_RULES = [
  ...(blogRedirects as Array<{ source: string; destination: string }>),
  ...(wixRedirects as Array<{ source: string; destination: string }>),
].filter((r) => r.source.startsWith('/post/') && !/[:*(]/.test(r.source))

describe('/post/* redirect precedence', () => {
  it('has concrete rules worth preserving', () => {
    expect(CONCRETE_POST_RULES.length).toBeGreaterThan(200)
  })

  it('resolves a concrete /post/ rule to its specific post, not the blog index', () => {
    const specific = CONCRETE_POST_RULES.find((r) => r.destination !== '/blog')
    expect(specific).toBeDefined()
    const hit = lookupRedirect(specific!.source)
    expect(hit?.destination).toBe(specific!.destination)
    expect(hit?.destination).not.toBe('/blog')
  })

  it('every concrete /post/ rule is reachable through the concrete lookup', () => {
    const unreachable = CONCRETE_POST_RULES.filter((r) => !lookupRedirect(r.source))
    expect(unreachable).toEqual([])
  })

  it('falls back to the blog index only for /post/ URLs with no concrete rule', () => {
    expect(lookupFallbackRedirect('/post/never-existed')?.destination).toBe('/blog')
    expect(lookupFallbackRedirect('/post/nested/deeper/path')?.destination).toBe('/blog')
    expect(lookupFallbackRedirect('/blog/some-post')).toBeUndefined()
    expect(lookupFallbackRedirect('/sunday-roast')).toBeUndefined()
  })

  it('keeps the fallback source list in step with next.config.js', () => {
    // next.config.js excludes exactly these from redirects(). If one is added
    // here without excluding it there, it runs early again and shadows the map.
    expect([...FALLBACK_PATTERN_SOURCES]).toEqual(['/post/:slug', '/post/:slug/:rest*'])
  })
})

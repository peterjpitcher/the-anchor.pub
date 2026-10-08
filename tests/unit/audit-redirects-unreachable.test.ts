/**
 * Redirect rules that can never fire (site review finding SM-020).
 *
 * Three rules sat in config/redirects for months doing nothing: a source ending
 * in a slash, a source middleware never sees, and a path Cloudflare answers
 * itself. The redirect audit passed them, because it only asked where a rule
 * points. It now fails on each, and this test puts each one back to prove it.
 */

import fs from 'fs'
import path from 'path'

const redirects = require('../../scripts/audit-redirects.js')

describe('unreachableReason', () => {
  it.each([
    ['/whats-new/', /trailing slash/],
    ['/old-page/', /trailing slash/],
    ['/favicon.ico', /middleware/],
    ['/_next/static/chunk.js', /middleware/],
    ['/_next/image', /middleware/],
    ['/cdn-cgi/:path*', /Cloudflare/],
    ['/cdn-cgi/l/email-protection', /Cloudflare/]
  ])('%s can never fire', (source, why) => {
    expect(redirects.unreachableReason(source)).toMatch(why)
  })

  it.each(['/', '/whats-new', '/blog/old-post', '/post/:slug', '/events/:id/book', '/favicon.png', '/_api/:path*'])(
    '%s can fire',
    (source) => {
      expect(redirects.unreachableReason(source)).toBeNull()
    }
  )
})

describe('the rules in the repository', () => {
  it('has no rule that can never fire', () => {
    const unreachable = redirects
      .audit()
      .problems.filter((problem: { kind: string }) => problem.kind === 'unreachable-source')
    expect(unreachable).toEqual([])
  })

  it('no longer carries the three dead rules', () => {
    const sources = redirects.audit().rules.map((rule: { source: string }) => rule.source)
    expect(sources).not.toContain('/favicon.ico')
    expect(sources).not.toContain('/whats-new/')
    expect(sources).not.toContain('/cdn-cgi/:path*')
    // The working rule without the slash stays.
    expect(sources).toContain('/whats-new')
  })

  it('keeps no redirect in vercel.json, where the two dead Peroni rules were', () => {
    const vercel = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf8'))
    expect(vercel.redirects ?? []).toEqual([])
  })
})

describe('the audit and middleware agree on what middleware skips', () => {
  it('lists the same three paths as the matcher in middleware.ts', () => {
    const middleware = fs.readFileSync(path.join(process.cwd(), 'middleware.ts'), 'utf8')
    expect(middleware).toContain("'/((?!_next/static|_next/image|favicon.ico).*)'")
    expect(redirects.MIDDLEWARE_SKIPS).toEqual(['/_next/static', '/_next/image', '/favicon.ico'])
  })
})

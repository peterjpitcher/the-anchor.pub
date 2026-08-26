// eslint-disable-next-line @typescript-eslint/no-var-requires
const { audit } = require('../../scripts/audit-redirects.js')

/**
 * The redirect set must reach the pages it claims to reach.
 *
 * The previous audit asked "does this source end on a 200?". Everything passed
 * and it was still wrong: a `/post/:slug -> /blog` pattern in next.config.js
 * beat 232 concrete rules in middleware, so 172 old URLs landed on the blog
 * index rather than their specific migrated post. A 301 to /blog satisfies
 * "ends on a 200" perfectly, which is exactly why that test never fired.
 *
 * scripts/audit-redirects.js models the real two-layer order instead, using
 * Next's own bundled path-to-regexp so matching is identical to production.
 * This test runs it in CI; `npm run lint` runs it at the terminal.
 */
type Problem = { kind: string; source?: string; [k: string]: unknown }

describe('redirect audit', () => {
  const result = audit() as {
    rules: unknown[]
    concrete: unknown[]
    patterns: unknown[]
    layer1: unknown[]
    problems: Problem[]
  }
  const of = (kind: string) => result.problems.filter((p) => p.kind === kind)

  it('has a redirect set worth auditing', () => {
    expect(result.rules.length).toBeGreaterThan(600)
    expect(result.patterns.length).toBeGreaterThan(0)
  })

  it('has no concrete rule silently doing something other than it says', () => {
    // The 172-URL defect. A pattern beating a concrete rule that wanted a
    // DIFFERENT destination.
    expect(of('shadowed-by-pattern')).toEqual([])
  })

  it('has no two rules claiming the same source with different destinations', () => {
    expect(of('conflicting-source')).toEqual([])
  })

  it('has no redirect chains, so no source spends two hops', () => {
    expect(of('chain')).toEqual([])
    expect(of('destination-redirects-again')).toEqual([])
  })

  it('has no self-redirect and no malformed destination', () => {
    expect(of('self-redirect')).toEqual([])
    expect(of('invalid-destination')).toEqual([])
    expect(of('invalid-pattern')).toEqual([])
  })

  it('has no dead duplicate rules left in the config', () => {
    expect(of('duplicate-source')).toEqual([])
    expect(of('shadowed-but-harmless')).toEqual([])
  })

  it('keeps the two /post/ catch-alls out of the pre-middleware layer', () => {
    // These must stay in middleware, AFTER the concrete lookup. Putting them
    // back in redirects() is what caused the original defect.
    const layer1Sources = (result.layer1 as Array<{ source: string }>).map((r) => r.source)
    expect(layer1Sources).not.toContain('/post/:slug')
    expect(layer1Sources).not.toContain('/post/:slug/:rest*')
  })
})

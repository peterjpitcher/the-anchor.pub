#!/usr/bin/env node
/**
 * Redirect audit: does every rule reach the page it is SUPPOSED to reach?
 *
 * The previous audit asked "does this source end on a 200?". Everything passed,
 * and it was still wrong: a catch-all `/post/:slug -> /blog` registered in
 * next.config.js beat 232 concrete rules in middleware, so 172 old URLs landed
 * on the blog index instead of their specific migrated post. A 301 to /blog
 * satisfies "ends on a 200" perfectly.
 *
 * So this audit models the real two-layer resolution order instead:
 *
 *   1. next.config.js redirects()  -- PATTERN rules only, runs FIRST
 *   2. middleware.ts               -- concrete rules, runs SECOND
 *
 * Anything registered in layer 1 outranks every rule in layer 2, regardless of
 * which JSON file it came from or what order that file is loaded in.
 *
 * Uses Next's own bundled path-to-regexp so matching semantics are identical to
 * production, not an approximation. A hand-rolled matcher reported
 * `/events/:id/book` as shadowing 26 concrete /events/ rules; it does not,
 * because it only matches paths ending in /book.
 */
const fs = require('fs')
const path = require('path')
const { pathToRegexp } = require('next/dist/compiled/path-to-regexp')

const RD = path.join(__dirname, '..', 'config', 'redirects')

// Same order next.config.js builds allRedirects in.
const LOAD_ORDER = [
  'wix-redirects.json',
  'blog-redirects.json',
  'tag-redirects.json',
  'legacy-redirects.json',
  'drinks-redirects.json',
  'additional-redirects.json',
]

// Kept in step with MIDDLEWARE_FALLBACK_SOURCES in next.config.js and
// FALLBACK_PATTERN_SOURCES in lib/middleware-redirects.ts.
const MIDDLEWARE_FALLBACK_SOURCES = new Set(['/post/:slug', '/post/:slug/:rest*'])

const isPattern = (s) => s.includes(':') || s.includes('*') || s.includes('(')

function load() {
  const rules = []
  for (const file of LOAD_ORDER) {
    const full = path.join(RD, file)
    if (!fs.existsSync(full)) throw new Error(`missing redirect file: ${file}`)
    for (const r of JSON.parse(fs.readFileSync(full, 'utf8'))) rules.push({ ...r, file })
  }
  return rules
}

function audit() {
  const rules = load()
  const problems = []
  const add = (kind, detail) => problems.push({ kind, ...detail })

  const patterns = rules.filter((r) => isPattern(r.source))
  const concrete = rules.filter((r) => !isPattern(r.source))

  // Layer 1: patterns that actually run in next.config.js redirects().
  const layer1 = patterns.filter((r) => !MIDDLEWARE_FALLBACK_SOURCES.has(r.source))
  const compiled = layer1.map((r) => {
    try {
      return { rule: r, re: pathToRegexp(r.source) }
    } catch (e) {
      add('invalid-pattern', { source: r.source, file: r.file, message: e.message })
      return null
    }
  }).filter(Boolean)

  // 1. Concrete rules that can never fire because a layer-1 pattern eats them.
  for (const c of concrete) {
    const beatenBy = compiled.find(({ re }) => re.test(c.source))
    if (!beatenBy) continue
    // Shadowed with the SAME destination is harmless redundancy: the visitor
    // ends up in the right place either way, the concrete rule is just dead
    // config. Shadowed with a DIFFERENT destination is the defect that hid 172
    // URLs, because the rule silently does something other than it says.
    const sameOutcome = beatenBy.rule.destination === c.destination
    add(sameOutcome ? 'shadowed-but-harmless' : 'shadowed-by-pattern', {
      source: c.source,
      file: c.file,
      wants: c.destination,
      pattern: beatenBy.rule.source,
      patternFile: beatenBy.rule.file,
      actuallyGets: beatenBy.rule.destination,
    })
  }

  // 2. Duplicate sources. Same destination is redundancy; different is a conflict.
  const seen = new Map()
  for (const r of rules) {
    const prior = seen.get(r.source)
    if (!prior) { seen.set(r.source, r); continue }
    add(prior.destination === r.destination ? 'duplicate-source' : 'conflicting-source', {
      source: r.source,
      winner: `${prior.destination} [${prior.file}]`,
      loser: `${r.destination} [${r.file}]`,
    })
  }

  // 3. Chains: a destination that is itself a redirect source. Two hops lose signal.
  const concreteSources = new Set(concrete.map((r) => r.source))
  for (const r of rules) {
    const dest = String(r.destination || '').replace(/^https?:\/\/[^/]+/, '').replace(/[?#].*$/, '')
    if (!dest.startsWith('/')) continue
    const normalised = dest.replace(/\/$/, '') || '/'
    if (normalised === r.source) { add('self-redirect', { source: r.source, file: r.file }); continue }
    if (concreteSources.has(normalised)) {
      add('chain', { source: r.source, via: normalised, file: r.file })
    }
    const eatenBy = compiled.find(({ re }) => re.test(normalised))
    if (eatenBy && eatenBy.rule.source !== r.source) {
      add('destination-redirects-again', {
        source: r.source, destination: normalised, pattern: eatenBy.rule.source,
      })
    }
  }

  // 4. Destinations that are neither an absolute URL nor a rooted path.
  for (const r of rules) {
    const d = String(r.destination || '')
    if (!d.startsWith('/') && !/^https?:\/\//i.test(d)) {
      add('invalid-destination', { source: r.source, destination: d, file: r.file })
    }
  }

  return { rules, patterns, concrete, layer1, problems }
}

module.exports = { audit, isPattern, MIDDLEWARE_FALLBACK_SOURCES, LOAD_ORDER }

if (require.main === module) {
  const { rules, patterns, concrete, layer1, problems } = audit()
  console.log(`redirect rules: ${rules.length}  (${concrete.length} concrete, ${patterns.length} pattern)`)
  console.log(`patterns running in next.config redirects(): ${layer1.length}`)
  console.log(`patterns deferred to middleware:             ${patterns.length - layer1.length}`)

  const byKind = problems.reduce((a, p) => { (a[p.kind] = a[p.kind] || []).push(p); return a }, {})
  const FATAL = ['shadowed-by-pattern', 'conflicting-source', 'self-redirect', 'invalid-destination', 'invalid-pattern', 'chain', 'destination-redirects-again']

  if (!problems.length) {
    console.log('\nNo problems found.')
    process.exit(0)
  }
  let fatal = 0
  for (const [kind, list] of Object.entries(byKind)) {
    const isFatal = FATAL.includes(kind)
    if (isFatal) fatal += list.length
    console.log(`\n${isFatal ? 'FAIL' : 'warn'}  ${kind}: ${list.length}`)
    for (const p of list.slice(0, 8)) console.log('   ', JSON.stringify(p))
    if (list.length > 8) console.log(`    ... and ${list.length - 8} more`)
  }
  process.exit(fatal ? 1 : 0)
}

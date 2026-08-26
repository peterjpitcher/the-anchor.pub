#!/usr/bin/env node
/**
 * Crawl the rendered site and assert what search engines actually receive.
 *
 * Unit tests pass while metadata is wrong. That is not hypothetical here: 88
 * pages shipped with the brand twice in the title, 75 meta descriptions ran
 * past the visible length, 172 redirects landed on the wrong page, and every
 * suite was green throughout. None of it is visible without rendering.
 *
 * Usage:
 *   npm run dev                       # or a production build
 *   node scripts/audit-rendered.js    # defaults to http://localhost:3000
 *   node scripts/audit-rendered.js --base http://localhost:56217
 *   node scripts/audit-rendered.js --json out.json
 *
 * Exits non-zero on any ERROR. Warnings are reported and do not fail, because
 * title and description length are editorial targets, not platform rules:
 * Google publishes no fixed limit and truncates to the device.
 */
const fs = require('fs')

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}
const BASE = arg('--base', 'http://localhost:3000').replace(/\/$/, '')
const JSON_OUT = arg('--json', null)
const CONCURRENCY = Number(arg('--concurrency', '5'))

const decode = (s = '') =>
  s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const text = (html) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim()

async function inspect(pathname) {
  const url = BASE + pathname
  const res = await fetch(url, { redirect: 'manual' })
  if (res.status >= 300 && res.status < 400) {
    return { pathname, status: res.status, location: res.headers.get('location') }
  }
  const html = await res.text()
  const grab = (re) => decode((html.match(re) || [])[1] || '')

  const ld = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1])
  const types = []
  let ldErrors = 0
  for (const block of ld) {
    try {
      const parsed = JSON.parse(block)
      const walk = (o) => {
        if (!o || typeof o !== 'object') return
        if (o['@type']) types.push(...[].concat(o['@type']))
        if (Array.isArray(o['@graph'])) o['@graph'].forEach(walk)
      }
      ;(Array.isArray(parsed) ? parsed : [parsed]).forEach(walk)
    } catch {
      ldErrors++
    }
  }

  const main = (html.match(/<main[\s\S]*?<\/main>/i) || [html])[0].replace(/<script[\s\S]*?<\/script>/gi, ' ')

  return {
    pathname,
    status: res.status,
    title: grab(/<title[^>]*>([\s\S]*?)<\/title>/i),
    description: grab(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i),
    canonical: grab(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i),
    robots: grab(/<meta[^>]+name="robots"[^>]+content="([^"]*)"/i),
    h1: [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => text(m[1])),
    words: text(main).split(' ').filter(Boolean).length,
    schemaTypes: types,
    ldErrors,
    bytes: html.length,
  }
}

async function main() {
  const smRes = await fetch(`${BASE}/sitemap.xml`)
  if (!smRes.ok) throw new Error(`sitemap.xml returned ${smRes.status}. Is the server running at ${BASE}?`)
  const sm = await smRes.text()
  const paths = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)

  const pages = []
  for (let i = 0; i < paths.length; i += CONCURRENCY) {
    pages.push(...(await Promise.all(paths.slice(i, i + CONCURRENCY).map(inspect))))
  }

  const errors = []
  const warnings = []
  const err = (pathname, rule, detail) => errors.push({ pathname, rule, detail })
  const warn = (pathname, rule, detail) => warnings.push({ pathname, rule, detail })

  const byTitle = new Map()
  const byDescription = new Map()

  for (const p of pages) {
    if (p.status !== 200) { err(p.pathname, 'sitemap-url-not-200', `${p.status} -> ${p.location || ''}`); continue }

    if (!p.title) err(p.pathname, 'missing-title', '')
    if (!p.description) err(p.pathname, 'missing-description', '')
    if (!p.canonical) err(p.pathname, 'missing-canonical', '')
    if (/noindex/i.test(p.robots)) err(p.pathname, 'noindex-in-sitemap', p.robots)
    if (p.ldErrors) err(p.pathname, 'invalid-json-ld', `${p.ldErrors} unparseable block(s)`)
    if (p.h1.length !== 1) err(p.pathname, 'h1-count', `${p.h1.length} h1 elements`)

    // The defect that shipped on 88 pages.
    if ((p.title.match(/The Anchor/g) || []).length > 1) {
      err(p.pathname, 'doubled-brand-title', p.title)
    }
    if (p.canonical && p.canonical.replace(/\/$/, '') !== `https://www.the-anchor.pub${p.pathname}`.replace(/\/$/, '')) {
      err(p.pathname, 'canonical-mismatch', p.canonical)
    }

    for (const [map, value, rule] of [[byTitle, p.title, 'duplicate-title'], [byDescription, p.description, 'duplicate-description']]) {
      if (!value) continue
      const seen = map.get(value)
      if (seen) err(p.pathname, rule, `same as ${seen}`)
      else map.set(value, p.pathname)
    }

    // Editorial targets, not platform rules.
    if (p.title.length > 75) warn(p.pathname, 'long-title', `${p.title.length} chars`)
    if (p.description.length > 165) warn(p.pathname, 'long-description', `${p.description.length} chars`)
    if (p.description.length < 70) warn(p.pathname, 'short-description', `${p.description.length} chars`)
    if (p.words < 300) warn(p.pathname, 'thin-content', `${p.words} words`)
  }

  const ok = pages.filter((p) => p.status === 200)
  console.log(`crawled ${pages.length} sitemap URLs at ${BASE}`)
  console.log(`  200: ${ok.length}   non-200: ${pages.length - ok.length}`)
  console.log(`  with a canonical: ${ok.filter((p) => p.canonical).length}`)
  console.log(`  with BreadcrumbList: ${ok.filter((p) => p.schemaTypes.includes('BreadcrumbList')).length}`)

  if (JSON_OUT) {
    fs.writeFileSync(JSON_OUT, JSON.stringify({ base: BASE, pages, errors, warnings }, null, 2))
    console.log(`  inventory written to ${JSON_OUT}`)
  }

  const group = (list) => list.reduce((a, x) => { (a[x.rule] = a[x.rule] || []).push(x); return a }, {})

  if (warnings.length) {
    console.log(`\nwarnings: ${warnings.length}`)
    for (const [rule, list] of Object.entries(group(warnings))) console.log(`  ${rule}: ${list.length}`)
  }

  if (!errors.length) {
    console.log('\nNo errors.')
    return
  }
  console.log(`\nFAIL  errors: ${errors.length}`)
  for (const [rule, list] of Object.entries(group(errors))) {
    console.log(`\n  ${rule}: ${list.length}`)
    for (const e of list.slice(0, 6)) console.log(`     ${e.pathname}  ${e.detail}`)
    if (list.length > 6) console.log(`     ... and ${list.length - 6} more`)
  }
  process.exitCode = 1
}

main().catch((e) => { console.error(e.message); process.exit(1) })

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
const path = require('path')

const SITE = 'https://www.the-anchor.pub'
const PUBLIC_DIR = path.join(__dirname, '..', 'public')

/**
 * Live pages that are deliberately not in the sitemap (noindex, or reached
 * only by a link). The sitemap crawl could not see them, which is how twelve
 * of them carried the pub's name twice in the title unnoticed. The blog tag
 * pages are added at run time from the links on /blog/tags.
 */
const EXTRA_ROUTES = [
  '/live-sport/world-cup/sweepstake',
  '/whats-on/archive',
  '/quiz-night-competition-terms',
]

/** True when a same-site picture address has no file behind it in public/. */
function missingPublicFile(url) {
  if (typeof url !== 'string') return false
  let local = null
  if (url.startsWith(SITE + '/')) local = url.slice(SITE.length)
  else if (url.startsWith('/') && !url.startsWith('//')) local = url
  if (local === null) return false
  local = decodeURIComponent(local.split('?')[0].split('#')[0])
  // Served by a route, not from public/.
  if (/^\/(content\/blog|_next|api)\//.test(local) || /(opengraph|social)-image/.test(local)) return false
  if (!/\.(png|jpe?g|webp|avif|svg|gif)$/i.test(local)) return false
  return !fs.existsSync(path.join(PUBLIC_DIR, local))
}

const arg =(name, fallback) => {
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
  const breadcrumbItems = []
  const schemaImages = []
  let ldErrors = 0
  // Every node, at any depth: breadcrumb addresses and picture addresses.
  const deep = (o) => {
    if (Array.isArray(o)) return o.forEach(deep)
    if (!o || typeof o !== 'object') return
    if ([].concat(o['@type'] || []).includes('BreadcrumbList')) {
      for (const li of o.itemListElement || []) {
        const item = typeof li.item === 'string' ? li.item : li.item && (li.item['@id'] || li.item.url)
        if (item !== undefined) breadcrumbItems.push(item)
      }
    }
    for (const key of ['logo', 'image']) {
      for (const value of [].concat(o[key] || [])) {
        const address = typeof value === 'string' ? value : value && value.url
        if (address) schemaImages.push(address)
      }
    }
    Object.values(o).forEach(deep)
  }
  for (const block of ld) {
    try {
      const parsed = JSON.parse(block)
      deep(parsed)
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
    breadcrumbItems,
    schemaImages,
    ogUrl: grab(/<meta[^>]+property="og:url"[^>]+content="([^"]*)"/i),
    ogImage: grab(/<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i),
    tagLinks: [...html.matchAll(/<a\b[^>]*\bhref="(\/blog\/tag\/[^"/?#]+)"/g)].map((m) => decode(m[1])),
    ldErrors,
    bytes: html.length,
  }
}

async function main() {
  const smRes = await fetch(`${BASE}/sitemap.xml`)
  if (!smRes.ok) throw new Error(`sitemap.xml returned ${smRes.status}. Is the server running at ${BASE}?`)
  const sm = await smRes.text()
  const paths = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)

  const crawl = async (list) => {
    const out = []
    for (let i = 0; i < list.length; i += CONCURRENCY) {
      out.push(...(await Promise.all(list.slice(i, i + CONCURRENCY).map(inspect))))
    }
    return out
  }

  const pages = await crawl(paths)

  // Pages outside the sitemap. They are held to the rules that apply to any
  // live page, not to the ones that only make sense for an indexed one.
  const tagIndex = pages.find((p) => p.pathname === '/blog/tags')
  const extraPaths = [...new Set([...EXTRA_ROUTES, ...((tagIndex && tagIndex.tagLinks) || [])])].filter(
    (p) => !paths.includes(p),
  )
  const extraPages = await crawl(extraPaths)

  const errors = []
  const warnings = []
  const err = (pathname, rule, detail) => errors.push({ pathname, rule, detail })
  const warn = (pathname, rule, detail) => warnings.push({ pathname, rule, detail })

  const byTitle = new Map()
  const byDescription = new Map()

  // Rules for every live page, in the sitemap or not.
  const checkAnyPage = (p) => {
    if (p.ldErrors) err(p.pathname, 'invalid-json-ld', `${p.ldErrors} unparseable block(s)`)

    // The defect that shipped on 88 pages, and later on 12 outside the sitemap.
    if ((p.title.match(/The Anchor/g) || []).length > 1) {
      err(p.pathname, 'doubled-brand-title', p.title)
    }
    if (p.canonical && p.canonical.replace(/\/$/, '') !== `${SITE}${p.pathname}`.replace(/\/$/, '')) {
      err(p.pathname, 'canonical-mismatch', p.canonical)
    }

    // "https://www.the-anchor.pubhttps://www.the-anchor.pub/x" shipped on six pages.
    for (const item of p.breadcrumbItems) {
      const ok =
        typeof item === 'string' &&
        (item === SITE || item.startsWith(SITE + '/')) &&
        !item.slice(SITE.length).includes('://')
      if (!ok) err(p.pathname, 'breadcrumb-bad-address', String(item))
    }

    // The logo on every page, and one share picture, named files that did not exist.
    for (const image of new Set([...p.schemaImages, p.ogImage])) {
      if (missingPublicFile(image)) err(p.pathname, 'picture-file-missing', image)
    }

    // Warnings: a share with no picture, or one that claims to be another page.
    if (!p.ogImage) warn(p.pathname, 'missing-share-picture', '')
    if (p.ogUrl && p.ogUrl.replace(/\/$/, '') !== `${SITE}${p.pathname}`.replace(/\/$/, '')) {
      warn(p.pathname, 'shares-as-another-page', p.ogUrl)
    }
  }

  for (const p of extraPages) {
    if (p.status !== 200) { err(p.pathname, 'extra-route-not-200', `${p.status} -> ${p.location || ''}`); continue }
    checkAnyPage(p)
  }

  for (const p of pages) {
    if (p.status !== 200) { err(p.pathname, 'sitemap-url-not-200', `${p.status} -> ${p.location || ''}`); continue }

    if (!p.title) err(p.pathname, 'missing-title', '')
    if (!p.description) err(p.pathname, 'missing-description', '')
    if (!p.canonical) err(p.pathname, 'missing-canonical', '')
    if (/noindex/i.test(p.robots)) err(p.pathname, 'noindex-in-sitemap', p.robots)
    if (p.h1.length !== 1) err(p.pathname, 'h1-count', `${p.h1.length} h1 elements`)
    checkAnyPage(p)

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
  console.log(`crawled ${pages.length} sitemap URLs and ${extraPages.length} pages outside the sitemap at ${BASE}`)
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

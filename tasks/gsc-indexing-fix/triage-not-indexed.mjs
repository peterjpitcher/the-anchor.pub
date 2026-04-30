#!/usr/bin/env node
/**
 * Triage script: "Crawled - currently not indexed" cohort.
 *
 * Reads the canonical audit CSV produced by `audit-gsc-csvs.mjs`, enriches the
 * 116 "Crawled - currently not indexed" rows with local rendered HTML evidence,
 * live fetch evidence for real page candidates, redirect knowledge,
 * canonical/robots metadata, and rendered incoming-link counts, then emits a
 * per-URL triage CSV.
 *
 * Run after `npm run build` so rendered HTML exists under `.next/server/app`.
 */

import { readFile, writeFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, '..', '..')
const BASE_URL = 'https://www.the-anchor.pub'
const NEXT_APP_DIR = path.join(REPO_ROOT, '.next', 'server', 'app')

const AUDIT_CSV = path.join(
  REPO_ROOT,
  'tasks',
  'gsc-indexing-fix',
  'orchestration',
  'wave-1',
  'gsc-audit-script',
  'sample-output.csv',
)
const OUTPUT_CSV = path.join(
  REPO_ROOT,
  'tasks',
  'gsc-indexing-fix',
  'evidence',
  'crawled-not-indexed-triage.csv',
)

const TARGET_ISSUE = 'Crawled - currently not indexed'
const LIVE_FETCH_TIMEOUT_MS = 6_000
const LIVE_FETCH_CONCURRENCY = 6
const REDIRECT_FILES = [
  'config/redirects/additional-redirects.json',
  'config/redirects/blog-redirects.json',
  'config/redirects/drinks-redirects.json',
  'config/redirects/legacy-redirects.json',
  'config/redirects/tag-redirects.json',
  'config/redirects/wix-redirects.json',
]

function parseCsv(input) {
  if (input.charCodeAt(0) === 0xfeff) input = input.slice(1)
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i]
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
      continue
    }
    if (ch === '"') {
      inQuotes = true
      continue
    }
    if (ch === ',') {
      row.push(field)
      field = ''
      continue
    }
    if (ch === '\r') continue
    if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      continue
    }
    field += ch
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function csvEscape(value) {
  if (value == null) return ''
  const s = String(value)
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function isConcreteSource(source) {
  return (
    typeof source === 'string' &&
    source.length > 0 &&
    !source.includes(':') &&
    !source.includes('*') &&
    !source.includes('(')
  )
}

function redirectStatus(rule) {
  if (typeof rule.statusCode === 'number') return rule.statusCode
  if (rule.permanent === false) return 302
  return 301
}

function normalizePathKey(pathname) {
  if (!pathname || pathname === '/') return '/'
  return pathname.replace(/\/+$/, '')
}

function urlInfo(url) {
  const parsed = new URL(url, BASE_URL)
  return {
    href: parsed.href,
    pathname: normalizePathKey(parsed.pathname),
    pathWithSearch: `${normalizePathKey(parsed.pathname)}${parsed.search}`,
  }
}

async function readRedirectMap() {
  const redirectMap = new Map()
  for (const file of REDIRECT_FILES) {
    const rules = JSON.parse(await readFile(path.join(REPO_ROOT, file), 'utf8'))
    for (const rule of rules) {
      if (!isConcreteSource(rule.source)) continue
      redirectMap.set(rule.source, { ...rule, file })
    }
  }
  return redirectMap
}

async function walkHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walkHtmlFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath)
    }
  }
  return files
}

function routeFromHtmlPath(file) {
  let rel = path.relative(NEXT_APP_DIR, file).replace(/\.html$/, '')
  if (rel === 'index') return '/'
  rel = rel.replace(/\/index$/, '')
  return normalizePathKey(`/${rel}`)
}

function extractCanonical(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)
  return match ? match[1] : ''
}

function extractRobots(html) {
  const match = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i)
  return match ? match[1] : 'index,follow-default'
}

function extractRobotsIfPresent(html) {
  const match = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i)
  return match ? match[1] : ''
}

function extractHrefPaths(html) {
  const hrefs = []
  const pattern = /href=["']([^"']+)["']/gi
  let match
  while ((match = pattern.exec(html))) {
    const href = match[1]
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:')
    ) {
      continue
    }

    try {
      const parsed = new URL(href, BASE_URL)
      if (parsed.hostname !== 'www.the-anchor.pub' && parsed.hostname !== 'the-anchor.pub') {
        continue
      }
      hrefs.push(normalizePathKey(parsed.pathname))
    } catch {
      // Ignore malformed hrefs; they are not useful for this SEO link graph.
    }
  }
  return hrefs
}

async function buildRenderedEvidence() {
  const htmlFiles = await walkHtmlFiles(NEXT_APP_DIR)
  const pageMeta = new Map()
  const incoming = new Map()

  for (const file of htmlFiles) {
    const route = routeFromHtmlPath(file)
    const html = await readFile(file, 'utf8')
    pageMeta.set(route, {
      route,
      canonical: extractCanonical(html),
      robots: extractRobots(html),
    })

    for (const hrefPath of extractHrefPaths(html)) {
      if (hrefPath === route) continue
      if (!incoming.has(hrefPath)) incoming.set(hrefPath, new Set())
      incoming.get(hrefPath).add(route)
    }
  }

  return { pageMeta, incoming }
}

function actionFor(row) {
  if (row.url_type === 'og_image' || row.url_type === 'static_asset' || row.url_type === 'parameter_variant') {
    return 'no-action-non-page'
  }
  if (row.url_type === 'redirect_source') return 'validate-redirect-chain'
  if (row.url_type === 'legacy_wix') return 'wait-for-recrawl'
  return 'manual-review-page'
}

function actionWithLiveEvidence(action, live) {
  if (
    action === 'manual-review-page' &&
    live?.status >= 300 &&
    live.status < 400 &&
    live.location
  ) {
    return 'validate-redirect-chain'
  }
  return action
}

function actionWithCurrentBranchEvidence(row, action, meta, live) {
  if (action === 'manual-review-page' && meta?.robots?.toLowerCase().includes('noindex')) {
    return 'wait-for-recrawl-noindex'
  }
  if (
    action === 'manual-review-page' &&
    row.cohort === 'event' &&
    live?.status === 200 &&
    !live?.robots?.toLowerCase().includes('noindex')
  ) {
    return 'monitor-event-lifecycle'
  }
  return actionWithLiveEvidence(action, live)
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await mapper(items[index], index)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  )
  return results
}

async function fetchLiveEvidence(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), LIVE_FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'user-agent': 'Anchor-GSC-Triage/1.0 (+https://www.the-anchor.pub)',
      },
    })
    const contentType = response.headers.get('content-type') || ''
    const location = response.headers.get('location') || ''
    const xRobots = response.headers.get('x-robots-tag') || ''
    let canonical = ''
    let robots = ''

    if (response.ok && contentType.includes('text/html')) {
      const html = await response.text()
      canonical = extractCanonical(html)
      robots = extractRobotsIfPresent(html) || 'index,follow-default'
    }

    return {
      status: response.status,
      contentType,
      location,
      canonical,
      robots,
      xRobots,
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.name : 'fetch-error',
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchLiveEvidenceMap(urls) {
  const uniqueUrls = [...new Set(urls)]
  const entries = await mapWithConcurrency(
    uniqueUrls,
    LIVE_FETCH_CONCURRENCY,
    async (url) => [url, await fetchLiveEvidence(url)],
  )
  return new Map(entries)
}

function currentStatus(row, redirectRule, meta, live) {
  if (redirectRule) return `${redirectStatus(redirectRule)} -> ${redirectRule.destination}`
  if (meta?.robots?.toLowerCase().includes('noindex')) return 'local-rendered-noindex'
  if (meta) return 'local-rendered-200'
  if (live?.status) {
    if (live.location) return `live-${live.status} -> ${live.location}`
    return `live-${live.status}`
  }
  if (live?.error) return `live-fetch-${live.error}`
  if (row.url_type === 'og_image') return 'image-route-200-expected'
  if (row.url_type === 'static_asset') return 'static-asset-200-after-robots-recrawl'
  if (row.url_type === 'parameter_variant') return 'canonical-variant'
  if (row.cohort === 'event') return 'dynamic-event-route-review'
  return 'not-rendered-in-static-build'
}

function canonicalFor(row, info, redirectRule, meta, live) {
  if (redirectRule) return redirectRule.destination
  if (meta?.canonical) return meta.canonical
  if (live?.canonical) return live.canonical
  if (live?.location) return live.location
  if (row.url_type === 'parameter_variant') return `${BASE_URL}${info.pathname}`
  if (row.url_type === 'og_image') return `${BASE_URL}${info.pathname.replace(/\/opengraph-image$/, '')}`
  if (row.url_type === 'page') return `${BASE_URL}${info.pathname}`
  return ''
}

function robotsFor(row, redirectRule, meta, live) {
  if (redirectRule) return 'redirect-source'
  if (meta?.robots) return meta.robots
  if (live?.robots) return live.robots
  if (live?.xRobots) return `X-Robots-Tag ${live.xRobots}`
  if (live?.error) return `live-fetch-${live.error}`
  if (row.url_type === 'og_image') return 'X-Robots-Tag noindex,nofollow,noimageindex expected'
  if (row.url_type === 'static_asset') return 'crawlable static asset'
  if (row.url_type === 'parameter_variant') return 'canonical controls indexing'
  return 'manual-check'
}

function recommendationFor(row, action, incomingCount, status) {
  if (action === 'no-action-non-page') {
    if (row.url_type === 'og_image') {
      return 'Non-page image resource. Keep crawlable and noindexable via X-Robots-Tag; no content work.'
    }
    if (row.url_type === 'static_asset') {
      return 'Hashed static asset. Should clear after robots.txt recrawl following the dpl= unblock; no content work.'
    }
    return 'Parameter variant. Confirm canonical points to the clean URL; no content work.'
  }

  if (action === 'validate-redirect-chain') {
    if (row.url_type === 'page' && status.startsWith('live-')) {
      return 'Live page candidate now redirects. Verify the live chain reaches a relevant 200 in one hop, then wait for Google recrawl; no content rewrite.'
    }
    return 'Redirect source. Verify final live chain reaches a 200 in one hop after deploy; no content rewrite.'
  }

  if (action === 'wait-for-recrawl') {
    return 'Legacy URL. Validate configured redirect destination and remove any internal links still pointing here; wait for Google recrawl.'
  }

  if (action === 'wait-for-recrawl-noindex') {
    return 'Current branch renders this URL with noindex. Keep it out of sitemap and indexable archives; wait for Google to reclassify after deploy/recrawl.'
  }

  if (action === 'monitor-event-lifecycle') {
    return 'Live event page is indexable under the event lifecycle policy. No content rewrite; monitor until it redirects or noindexes after the lifecycle threshold.'
  }

  if (status === 'dynamic-event-route-review') {
    return 'Real dynamic page candidate. Inspect live status/canonical/robots, then classify as stale event lifecycle, technical issue, or content opportunity.'
  }

  if (incomingCount === 0) {
    return 'Real page candidate with 0 rendered incoming links in the local build. Review internal linking, search intent, and content quality before proposing growth edits.'
  }

  return `Real page candidate with ${incomingCount} rendered incoming links. Focus manual review on search intent, canonical/robots state, and content usefulness rather than orphan fixes.`
}

async function main() {
  const raw = await readFile(AUDIT_CSV, 'utf8')
  const rows = parseCsv(raw)
  if (rows.length === 0) throw new Error(`No rows parsed from ${AUDIT_CSV}`)

  const [header, ...records] = rows
  const idx = {
    url: header.indexOf('url'),
    issue: header.indexOf('issue'),
    url_type: header.indexOf('url_type'),
    cohort: header.indexOf('cohort'),
  }
  if (Object.values(idx).some((i) => i === -1)) {
    throw new Error(`Unexpected header in audit CSV: ${header.join(',')}`)
  }

  const redirectMap = await readRedirectMap()
  const { pageMeta, incoming } = await buildRenderedEvidence()
  const target = records.filter((row) => row[idx.issue] === TARGET_ISSUE)
  const targetRows = target.map((record) => {
    const row = {
      url: record[idx.url],
      issue: record[idx.issue],
      url_type: record[idx.url_type],
      cohort: record[idx.cohort],
    }
    return {
      row,
      info: urlInfo(row.url),
      action: actionFor(row),
    }
  })
  const liveEvidence = await fetchLiveEvidenceMap(
    targetRows
      .filter(({ action }) => action === 'manual-review-page')
      .map(({ row }) => row.url),
  )

  const counts = new Map()
  const outRows = [[
    'url',
    'gsc_issue',
    'url_type',
    'cohort',
    'current_status',
    'canonical',
    'robots',
    'incoming_rendered_links',
    'sample_referrers',
    'action',
    'recommendation',
  ]]

  for (const { row, info, action } of targetRows) {
    const redirectRule = redirectMap.get(info.pathname)
    const meta = pageMeta.get(info.pathname)
    const live = liveEvidence.get(row.url)
    const referrers = [...(incoming.get(info.pathname) || new Set())].sort()
    const finalAction = actionWithCurrentBranchEvidence(row, action, meta, live)
    const status = currentStatus(row, redirectRule, meta, live)
    const recommendation = recommendationFor(row, finalAction, referrers.length, status)

    counts.set(finalAction, (counts.get(finalAction) || 0) + 1)
    outRows.push([
      row.url,
      TARGET_ISSUE,
      row.url_type,
      row.cohort,
      status,
      canonicalFor(row, info, redirectRule, meta, live),
      robotsFor(row, redirectRule, meta, live),
      String(referrers.length),
      referrers.slice(0, 5).join('|'),
      finalAction,
      recommendation,
    ])
  }

  const csv = outRows.map((r) => r.map(csvEscape).join(',')).join('\n') + '\n'
  await writeFile(OUTPUT_CSV, csv, 'utf8')

  console.log(`Triage written to: ${path.relative(REPO_ROOT, OUTPUT_CSV)}`)
  console.log(`Total rows: ${target.length}`)
  console.log('Action counts:')
  for (const [action, count] of [...counts.entries()].sort()) {
    console.log(`  ${action.padEnd(28)}  ${count}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

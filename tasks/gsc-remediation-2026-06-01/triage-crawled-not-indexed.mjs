/**
 * Phase 2 triage — "Crawled - currently not indexed" (2026-06-01 export).
 *
 * Reuses the url_type / cohort taxonomy from
 * tasks/gsc-indexing-fix/audit-gsc-csvs.mjs, then live-enriches the `page`
 * rows (HTTP status, redirect target, x-robots-tag, canonical, robots meta)
 * to separate genuine content pages from noise (assets, OG images, redirects,
 * param variants, intentional noindex).
 *
 * Output: crawled-not-indexed-triage-2026-06-01.csv + a console summary.
 * Run: node tasks/gsc-remediation-2026-06-01/triage-crawled-not-indexed.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const PROJECT = '/Users/peterpitcher/Cursor/OJ-The-Anchor.pub'
const DRILLDOWN =
  '/Users/peterpitcher/Library/Mobile Documents/com~apple~CloudDocs/Downloads/the-anchor.pub-Coverage-Drilldown-2026-06-01 (5)'
const OUT = path.join(PROJECT, 'tasks/gsc-remediation-2026-06-01/crawled-not-indexed-triage-2026-06-01.csv')
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }

// ── minimal RFC4180 CSV parser (GSC quotes URL fields) ──
function parseCsv(text) {
  const rows = []
  let row = [], field = '', inQ = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else inQ = false }
      else field += c
    } else if (c === '"') inQ = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c !== '\r') field += c
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows
}

function getPathname(url) { try { return new URL(url).pathname } catch { return url } }
function normalisePath(p) { return p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p }
function hasQueryParams(url) { return url.includes('?') }

function loadRedirectSources() {
  const dir = path.join(PROJECT, 'config/redirects')
  const set = new Set()
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue
    const arr = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
    for (const r of arr) if (r && typeof r.source === 'string') set.add(normalisePath(r.source))
  }
  return set
}

function classifyUrlType(url, redirectSources) {
  const lower = getPathname(url).toLowerCase()
  if (/^\/_next\/static\//.test(lower) || /\.(?:css|js|woff2|png|jpg|jpeg|svg|webp|gif|ico)$/.test(lower)) return 'static_asset'
  if (lower.includes('/opengraph-image') || /^\/_next\/image/.test(lower)) return 'og_image'
  if (/^\/post\//.test(lower) || /^\/event-details\//.test(lower)) return 'legacy_wix'
  if (redirectSources.has(normalisePath(getPathname(url)))) return 'redirect_source'
  if (hasQueryParams(url)) return 'parameter_variant'
  if (lower.length > 0) return 'page'
  return 'unknown'
}

function classifyCohort(url) {
  const lower = getPathname(url).toLowerCase()
  if (/^\/_next\//.test(lower) || /\.(?:css|js|woff2|png|jpg|jpeg|svg|webp|gif|ico)$/.test(lower)) return 'static_asset'
  if (/^\/blog\/tag\//.test(lower)) return 'tag'
  if (/^\/blog\//.test(lower)) return 'post'
  if (/^\/post\//.test(lower)) return 'post'
  if (/^\/events\//.test(lower) || /^\/event-details\//.test(lower)) return 'event'
  if (/^\/drinks\//.test(lower)) return 'drink'
  if (/^\/private-hire\//.test(lower)) return 'private_hire'
  if (/^\/food-menu\//.test(lower) || /^\/food\//.test(lower)) return 'food_menu'
  return 'other'
}

async function live(url) {
  try {
    const r = await fetch(url, { redirect: 'manual', headers: UA })
    const ct = r.headers.get('content-type') || ''
    let canonical = '', robots = ''
    if (r.status === 200 && ct.includes('text/html')) {
      const html = await r.text()
      canonical = (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || [])[1] || ''
      robots = (html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i) || [])[1] || ''
    }
    return { status: r.status, location: r.headers.get('location') || '', xRobots: r.headers.get('x-robots-tag') || '', canonical, robots }
  } catch (e) { return { status: 0, location: '', xRobots: '', canonical: '', robots: '', error: String(e.message || e) } }
}

function recoNonPage(t) {
  return {
    static_asset: 'Hashed/static asset — clears after the robots dpl= recrawl; no content work.',
    og_image: 'OG-image route — noindex by design; expected, no action.',
    parameter_variant: 'Tracking-param variant — canonical consolidates it; no action.',
    redirect_source: 'Redirects to a canonical destination; informational, no action.',
    legacy_wix: 'Legacy Wix URL — confirm it 301s/404s; no content work.',
  }[t] || 'Non-page; no action.'
}

function actionFor(urlType, lv) {
  if (urlType !== 'page') return ['no-action-non-page', recoNonPage(urlType)]
  if (!lv || lv.status === 0) return ['manual-review-page', 'Could not fetch live; recheck.']
  if (lv.status >= 300 && lv.status < 400) return ['now-redirects', `Live ${lv.status} -> ${lv.location}; will reclassify on recrawl, no content work.`]
  if (lv.status >= 400) return ['broken', `Live ${lv.status} — investigate: restore, 301, or 410.`]
  const noindex = `${lv.robots} ${lv.xRobots}`.toLowerCase().includes('noindex')
  if (noindex) return ['intentional-noindex', 'noindex present — expected; no action.']
  return ['manual-review-page', 'Indexable 200 but not indexed — add internal links from strong hubs (home, /whats-on, /food-menu) + ensure distinct search intent; then Request Indexing.']
}

async function pool(items, size, fn) {
  const out = new Array(items.length)
  let i = 0
  await Promise.all(Array.from({ length: size }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx], idx) }
  }))
  return out
}

async function main() {
  const meta = fs.existsSync(path.join(DRILLDOWN, 'Metadata.csv')) ? fs.readFileSync(path.join(DRILLDOWN, 'Metadata.csv'), 'utf8').trim() : '(no metadata)'
  console.log('Drilldown:', path.basename(DRILLDOWN))
  console.log('Metadata:', meta.replace(/\n/g, ' | '))

  const redirectSources = loadRedirectSources()
  const rows = parseCsv(fs.readFileSync(path.join(DRILLDOWN, 'Table.csv'), 'utf8'))
  const data = rows.slice(1).filter((r) => r[0] && r[0].startsWith('http'))
  const records = data.map((r) => {
    const url = r[0].trim()
    return { url, lastCrawled: (r[1] || '').trim(), urlType: classifyUrlType(url, redirectSources), cohort: classifyCohort(url) }
  })
  console.log(`\nTotal URLs: ${records.length}`)

  // Live-enrich only the rows that might be actionable / need confirmation.
  const toCheck = records.filter((r) => r.urlType === 'page' || r.urlType === 'legacy_wix')
  console.log(`Live-checking ${toCheck.length} page/legacy rows…`)
  const liveResults = await pool(toCheck, 6, (r) => live(r.url))
  const liveByUrl = new Map(toCheck.map((r, i) => [r.url, liveResults[i]]))

  for (const r of records) {
    const lv = liveByUrl.get(r.url)
    const [action, reco] = actionFor(r.urlType, lv)
    r.live = lv; r.action = action; r.reco = reco
  }

  // ── CSV out ──
  const header = ['url', 'url_type', 'cohort', 'live_status', 'redirect_to', 'robots', 'canonical', 'action', 'recommendation', 'last_crawled']
  const esc = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`
  const csv = [header.join(',')]
  for (const r of records) {
    csv.push([
      r.url, r.urlType, r.cohort, r.live?.status ?? '', r.live?.location ?? '',
      (r.live?.robots || r.live?.xRobots || ''), r.live?.canonical ?? '', r.action, r.reco, r.lastCrawled,
    ].map(esc).join(','))
  }
  fs.writeFileSync(OUT, csv.join('\n'))

  // ── summary ──
  const tally = (key) => records.reduce((m, r) => m.set(r[key], (m.get(r[key]) || 0) + 1), new Map())
  const fmt = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v.toString().padStart(4)}  ${k}`).join('\n')
  console.log('\n── by url_type ──\n' + fmt(tally('urlType')))
  console.log('\n── by action ──\n' + fmt(tally('action')))

  const review = records.filter((r) => r.action === 'manual-review-page')
  const broken = records.filter((r) => r.action === 'broken')
  console.log(`\n── ACTIONABLE: genuine content pages not indexed (${review.length}) ──`)
  for (const r of review) console.log(`  [${r.cohort}] ${r.url.replace('https://www.the-anchor.pub', '')}  (${r.live?.status})`)
  if (broken.length) {
    console.log(`\n── BROKEN (live 4xx/5xx) (${broken.length}) ──`)
    for (const r of broken) console.log(`  ${r.url.replace('https://www.the-anchor.pub', '')} -> ${r.live?.status}`)
  }
  console.log(`\nCSV written: ${OUT}`)
}

main()

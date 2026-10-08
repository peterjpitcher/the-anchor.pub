#!/usr/bin/env node
/**
 * Finds internal links that lead nowhere, or that only arrive by a redirect.
 *
 * It collects every internal address written in app/, components/, content/
 * and lib/ (link targets in code, markdown links, and full
 * https://www.the-anchor.pub/ addresses), then checks each one against what
 * the site really serves:
 *
 *   - a file in public/,
 *   - a route in the production build (.next/routes-manifest.json and the
 *     prerendered pages), so run `npm run build` first,
 *   - the redirect rules in config/redirects/*.json and next.config.js.
 *
 * A link is reported when it would 404, or when it passes through a redirect
 * instead of naming the final address. A redirect is followed to its end, so a
 * chain is reported with the address it finally lands on.
 *
 * Usage:
 *   npm run build && npm run audit:links
 *   node scripts/audit-internal-links.js --json out.json
 *   node scripts/audit-internal-links.js --ignore-dir content/blog
 *
 * Exits non-zero when anything is reported.
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const SITE_HOSTS = /^https?:\/\/(www\.)?the-anchor\.pub(?=\/|$|[?#])/i
const SCAN_DIRS = ['app', 'components', 'content', 'lib']
const SCAN_EXT = /\.(tsx?|jsx?|mdx?|json)$/
// Tests, the redirect tables themselves, and files that are not served.
// robots.ts lists crawl rules, and content/copy-decks holds drafts.
const SKIP_FILE = /(^|\/)(__tests__|__mocks__)\/|\.test\.[tj]sx?$|^lib\/(middleware-redirects\.ts|test-utils\/|static-events\.ts)|^content\/(blog\/redirects\.json$|copy-decks\/)|^app\/robots\.ts$/

/**
 * Addresses that look like links to this script but are not pages: prefixes
 * used to build an address, or patterns compared against one.
 */
const NOT_A_LINK = new Set(['/events', '/blog/tag', '/content/blog', '/drinks/', '/api'])

const args = process.argv.slice(2)
const argValue = (name) => {
  const index = args.indexOf(name)
  return index > -1 ? args[index + 1] : null
}
const JSON_OUT = argValue('--json')
const IGNORE_DIRS = args.flatMap((value, index) => (value === '--ignore-dir' && args[index + 1] ? [args[index + 1].replace(/\/$/, '') + '/'] : []))

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'))
}

// ---------------------------------------------------------------- what is served

function loadBuild() {
  const manifestPath = path.join(ROOT, '.next', 'routes-manifest.json')
  if (!fs.existsSync(manifestPath)) {
    console.error('No production build found. Run `npm run build` first.')
    process.exit(2)
  }
  const manifest = readJson('.next/routes-manifest.json')
  const prerender = readJson('.next/prerender-manifest.json')
  const staticRoutes = new Set(manifest.staticRoutes.map((route) => route.page))
  // The catch-all exists to answer 404, so matching it means "not found".
  const dynamicRoutes = manifest.dynamicRoutes
    .filter((route) => !route.page.includes('[...unmatched]'))
    .map((route) => ({ page: route.page, regex: new RegExp(route.regex) }))
  const prerendered = new Set(Object.keys(prerender.routes))
  // Pattern redirects from next.config.js. The trailing-slash rule Next adds
  // itself is left out: every address here is compared without one.
  const patternRedirects = (manifest.redirects || [])
    .filter((rule) => !rule.internal)
    .map((rule) => ({ source: rule.source, destination: rule.destination, regex: new RegExp(rule.regex), has: rule.has }))
  return { staticRoutes, dynamicRoutes, prerendered, patternRedirects }
}

function loadConcreteRedirects() {
  const map = new Map()
  const dir = path.join(ROOT, 'config', 'redirects')
  // Same order as lib/middleware-redirects.ts, where a later file wins.
  const order = ['additional', 'blog', 'drinks', 'legacy', 'tag', 'wix']
  for (const name of order) {
    const file = path.join(dir, `${name}-redirects.json`)
    if (!fs.existsSync(file)) continue
    for (const rule of JSON.parse(fs.readFileSync(file, 'utf8'))) {
      if (typeof rule.source !== 'string' || /[:*(]/.test(rule.source)) continue
      map.set(rule.source, rule.destination)
    }
  }
  return map
}

function blogPostExists(slug) {
  return fs.existsSync(path.join(ROOT, 'content', 'blog', slug, 'index.md'))
}

function publicFileExists(pathname) {
  let decoded = pathname
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    // keep the raw path
  }
  if (decoded.startsWith('/content/blog/')) {
    try {
      return fs.statSync(path.join(ROOT, decoded)).isFile()
    } catch {
      return false
    }
  }
  try {
    return fs.statSync(path.join(ROOT, 'public', decoded)).isFile()
  } catch {
    return false
  }
}

// ------------------------------------------------------------- collect the links

function normalise(raw) {
  let value = raw.trim()
  const absolute = value.match(SITE_HOSTS)
  if (absolute) value = value.slice(absolute[0].length) || '/'
  if (!value.startsWith('/') || value.startsWith('//')) return null
  value = value.split('#')[0].split('?')[0]
  if (value.length > 1) value = value.replace(/\/+$/, '')
  return value || '/'
}

function collect() {
  const found = [] // { file, line, raw, pathname }
  const files = SCAN_DIRS.map((dir) => path.join(ROOT, dir))
    .filter((dir) => fs.existsSync(dir))
    .flatMap((dir) => walk(dir))
    .map((file) => path.relative(ROOT, file).split(path.sep).join('/'))
    .filter((file) => SCAN_EXT.test(file) && !SKIP_FILE.test(file))
    .filter((file) => !IGNORE_DIRS.some((dir) => file.startsWith(dir)))

  const patterns = [
    // A quoted address: "/find-us", '/private-hire#enquiry'. Template strings
    // that build an address from a variable are skipped, since only the built
    // site knows what they become.
    /(["'`])(\/[a-z0-9][^"'`\s<>{}$\\]*)\1/gi,
    // A markdown link: [text](/find-us)
    /\]\((\/[a-z0-9][^)\s]*)\)/gi,
    // A full address on this site, anywhere.
    /(https?:\/\/(?:www\.)?the-anchor\.pub(?:\/[^\s"'`<>)\\]*)?)/gi,
  ]

  // In lib/ a quoted "/something" is as often a management API path or a
  // prefix as it is a link, so there it must sit beside a link-like name:
  // href: '/x', url: "/x", ctaHref = '/x', redirect('/x').
  const LINK_CONTEXT = /(?:\b(?:href|url|link|to|path|destination|canonical|[a-z]+(?:Href|Url|Link|Path))\s*[:=]\s*[({]?\s*|\b(?:redirect|permanentRedirect|push|replace)\(\s*)$/i

  for (const file of files) {
    const lines = fs.readFileSync(path.join(ROOT, file), 'utf8').split('\n')
    const needsContext = file.startsWith('lib/')
    lines.forEach((text, index) => {
      // An import or require names a module, not a page.
      if (/^\s*import\s|require\(/.test(text)) return
      // `oldUrl` in a post's frontmatter records where the post used to live.
      // It is a note, not a link, and may sit on the line after the key.
      if (/^oldUrl:/.test(text) || (index > 0 && /^oldUrl:\s*[>|]/.test(lines[index - 1]))) return
      for (const [patternIndex, pattern] of patterns.entries()) {
        pattern.lastIndex = 0
        let match
        while ((match = pattern.exec(text))) {
          const raw = match[2] || match[1]
          if (raw.includes('${') || raw.includes('*') || raw.includes('[')) continue
          if (needsContext && patternIndex === 0 && !LINK_CONTEXT.test(text.slice(0, match.index))) continue
          const pathname = normalise(raw)
          if (!pathname || NOT_A_LINK.has(raw) || NOT_A_LINK.has(pathname)) continue
          found.push({ file, line: index + 1, raw, pathname })
        }
      }
    })
  }
  return found
}

// --------------------------------------------------------------------- classify

function main() {
  const build = loadBuild()
  const concrete = loadConcreteRedirects()

  const served = (pathname) => {
    if (build.staticRoutes.has(pathname) || build.prerendered.has(pathname)) return true
    if (publicFileExists(pathname)) return true
    const dynamic = build.dynamicRoutes.find((route) => route.regex.test(pathname))
    if (!dynamic) return false
    // A page built from data: confirm the data exists where we can.
    if (dynamic.page === '/blog/[slug]') return blogPostExists(pathname.split('/')[2])
    return true
  }

  const redirectOnce = (pathname) => {
    // middleware.ts does not run for /favicon.ico, so the file is served and
    // the redirect rule written for it never fires.
    if (pathname === '/favicon.ico' && publicFileExists(pathname)) return null
    if (concrete.has(pathname)) return concrete.get(pathname)
    if (served(pathname)) return null
    const rule = build.patternRedirects.find((candidate) => !candidate.has && candidate.regex.test(pathname))
    return rule ? rule.destination : null
  }

  const resolve = (pathname) => {
    let current = pathname
    const seen = new Set()
    for (let hop = 0; hop < 6; hop += 1) {
      const next = redirectOnce(current)
      if (next === null) return { final: current, hops: hop, external: false }
      if (/^https?:\/\//i.test(next) && !SITE_HOSTS.test(next)) return { final: next, hops: hop + 1, external: true }
      const normalised = normalise(next)
      if (!normalised || seen.has(normalised)) return { final: next, hops: hop + 1, external: false }
      seen.add(normalised)
      current = normalised
    }
    return { final: current, hops: 6, external: false }
  }

  const links = collect()
  const broken = new Map()
  const redirected = new Map()
  const skip = (pathname) => /^\/(api|_next)\//.test(pathname) || pathname === '/api'

  for (const link of links) {
    if (skip(link.pathname)) continue
    const { final, hops, external } = resolve(link.pathname)
    const where = `${link.file}:${link.line}`
    if (hops === 0) {
      if (served(link.pathname)) continue
      if (!broken.has(link.pathname)) broken.set(link.pathname, [])
      broken.get(link.pathname).push(where)
      continue
    }
    const key = `${link.pathname} -> ${final}${external || served(normalise(final) || final) ? '' : ' (which is not found)'}`
    if (!redirected.has(key)) redirected.set(key, [])
    redirected.get(key).push(where)
  }

  const unique = new Set(links.map((link) => link.pathname)).size
  console.log(`checked ${links.length} internal links (${unique} different addresses) in ${SCAN_DIRS.join(', ')}`)

  const print = (title, map) => {
    if (map.size === 0) return
    console.log(`\n${title}: ${map.size}`)
    for (const [key, places] of [...map].sort(([a], [b]) => a.localeCompare(b))) {
      console.log(`  ${key}`)
      for (const place of places.slice(0, 5)) console.log(`      ${place}`)
      if (places.length > 5) console.log(`      ... and ${places.length - 5} more`)
    }
  }
  print('NOT FOUND', broken)
  print('THROUGH A REDIRECT', redirected)

  if (JSON_OUT) {
    fs.writeFileSync(
      JSON_OUT,
      JSON.stringify({ checked: links.length, notFound: Object.fromEntries(broken), redirected: Object.fromEntries(redirected) }, null, 2),
    )
  }

  if (broken.size === 0 && redirected.size === 0) {
    console.log('\nEvery internal link names a page or file that is served.')
    return
  }
  process.exitCode = 1
}

main()

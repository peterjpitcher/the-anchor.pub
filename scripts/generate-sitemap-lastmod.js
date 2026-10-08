#!/usr/bin/env node
/**
 * Works out when each page last changed, from git, and writes
 * config/sitemap-lastmod.json. app/sitemap.ts reads that file for <lastmod>.
 *
 * Why: the dates used to be typed by hand in app/sitemap.ts, in a dozen named
 * batches. Nobody moved them when a page changed, so 150 of 157 were older than
 * the page's real last change. Google only uses <lastmod> when it is
 * consistently accurate, so a wrong date is worse than none.
 *
 * What counts as a page's files:
 *   1. everything in its own route folder (not folders that are other pages),
 *   2. any file in content/, lib/ or components/ that this page imports and no
 *      other file does, which is that page's own copy or data by construction,
 *   3. the few extra files named in EXTRA_SOURCES below.
 * Shared code (the header, the footer, the schema helpers) is left out on
 * purpose: a change there is not a change to the page's main content.
 *
 * A blog post's date is the last commit to its folder in content/blog.
 *
 * Shallow clones. Vercel clones the last ten commits only. In a shallow clone
 * the oldest commits appear to add every file, so their dates are worthless.
 * Those boundary commits are ignored, and any file with no trustworthy commit
 * keeps the date already in the committed JSON. So the committed file is the
 * baseline and recent commits move it forward. With the whole history present
 * (locally, or on Vercel with VERCEL_DEEP_CLONE=true) git alone decides.
 *
 * Usage:
 *   node scripts/generate-sitemap-lastmod.js           writes on Vercel or CI,
 *                                                       otherwise reports only
 *   node scripts/generate-sitemap-lastmod.js --write   always writes
 *
 * It never fails a build: with no git it leaves the committed file alone.
 */

const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const ROOT = path.join(__dirname, '..')
const OUT = path.join(ROOT, 'config', 'sitemap-lastmod.json')

/** Files that hold a page's copy or data but that the import rule cannot see. */
const EXTRA_SOURCES = {
  '/': ['lib/monthly-copy.ts'],
  '/drinks': ['content/menu/drinks.json'],
  '/private-hire/near/[slug]': ['lib/local-seo-data.ts'],
}

const CODE_EXT = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md']
const PAGE_FILE = /^page\.(tsx|ts|jsx|js|mdx)$/
const ROUTE_FILE = /^(page|route)\.(tsx|ts|jsx|js|mdx)$/
const TEST_PATH = /(^|\/)(__tests__|__mocks__)\/|\.test\.[tj]sx?$/

function toPosix(p) {
  return p.split(path.sep).join('/')
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function containsRoute(dir) {
  return walk(dir).some((file) => ROUTE_FILE.test(path.basename(file)))
}

/** Every page under app/, as { route, dir }. Route groups "(x)" are dropped. */
function findPageRoutes() {
  const appDir = path.join(ROOT, 'app')
  return walk(appDir)
    .filter((file) => PAGE_FILE.test(path.basename(file)))
    .map((file) => path.dirname(file))
    .filter((dir) => !toPosix(path.relative(appDir, dir)).split('/').includes('api'))
    .map((dir) => {
      const segments = toPosix(path.relative(appDir, dir))
        .split('/')
        .filter((segment) => segment && !/^\(.*\)$/.test(segment))
      return { route: '/' + segments.join('/'), dir }
    })
}

/** A route's own files: its folder, minus any sub-folder that is another page. */
function ownFiles(dir) {
  const isAppRoot = dir === path.join(ROOT, 'app')
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || containsRoute(full)) continue
      files.push(...walk(full))
    } else if (!isAppRoot || PAGE_FILE.test(entry.name)) {
      // In app/ itself only the homepage file belongs to the homepage; the
      // layout, sitemap and robots files there belong to the whole site.
      files.push(full)
    }
  }
  return files.map((file) => toPosix(path.relative(ROOT, file))).filter((file) => !TEST_PATH.test(file))
}

function resolveImport(fromFile, specifier) {
  let base
  if (specifier.startsWith('@/')) base = path.join(ROOT, specifier.slice(2))
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(path.join(ROOT, fromFile)), specifier)
  else return null
  const candidates = [base, ...CODE_EXT.map((ext) => base + ext), ...CODE_EXT.map((ext) => path.join(base, 'index' + ext))]
  for (const candidate of candidates) {
    try {
      if (fs.statSync(candidate).isFile()) return toPosix(path.relative(ROOT, candidate))
    } catch {
      // try the next spelling
    }
  }
  return null
}

function importsOf(file) {
  let source
  try {
    source = fs.readFileSync(path.join(ROOT, file), 'utf8')
  } catch {
    return []
  }
  const found = new Set()
  const pattern = /(?:from\s+|import\s*\(\s*|require\s*\(\s*|import\s+)['"]([^'"]+)['"]/g
  let match
  while ((match = pattern.exec(source))) {
    const resolved = resolveImport(file, match[1])
    if (resolved) found.add(resolved)
  }
  return [...found]
}

/** For each route, the files that only that route's own files import. */
function exclusiveImports(routes) {
  const ownerOf = new Map()
  for (const { route, files } of routes) for (const file of files) ownerOf.set(file, route)

  const importers = new Map()
  const sources = ['app', 'components', 'lib', 'hooks', 'content']
    .map((dir) => path.join(ROOT, dir))
    .filter((dir) => fs.existsSync(dir))
    .flatMap((dir) => walk(dir))
    .map((file) => toPosix(path.relative(ROOT, file)))
    .filter((file) => /\.(tsx?|jsx?)$/.test(file) && !TEST_PATH.test(file))

  for (const file of sources) {
    const owner = ownerOf.get(file) ?? `shared:${file}`
    for (const imported of importsOf(file)) {
      if (!/^(content|lib|components)\//.test(imported)) continue
      if (!importers.has(imported)) importers.set(imported, new Set())
      importers.get(imported).add(owner)
    }
  }

  const byRoute = new Map()
  for (const [file, owners] of importers) {
    if (owners.size !== 1) continue
    const [owner] = owners
    if (owner.startsWith('shared:')) continue
    if (!byRoute.has(owner)) byRoute.set(owner, [])
    byRoute.get(owner).push(file)
  }
  return byRoute
}

/**
 * Latest trustworthy commit date for each path, from `git log --name-only`
 * output. Commits named in `untrusted` (the shallow boundary) are skipped.
 * Exported for the unit test.
 */
function latestDates(logText, untrusted = new Set()) {
  const dates = new Map()
  for (const block of logText.split('\0')) {
    const lines = block.split('\n').filter(Boolean)
    if (lines.length === 0) continue
    const [hash, date] = lines[0].split('\t')
    if (!hash || !date || untrusted.has(hash)) continue
    for (const file of lines.slice(1)) {
      const previous = dates.get(file)
      if (!previous || Date.parse(date) > Date.parse(previous)) dates.set(file, date)
    }
  }
  return dates
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })
}

function readGit() {
  try {
    const shallow = git(['rev-parse', '--is-shallow-repository']).trim() === 'true'
    const untrusted = new Set()
    if (shallow) {
      const shallowFile = path.resolve(ROOT, git(['rev-parse', '--git-path', 'shallow']).trim())
      if (fs.existsSync(shallowFile)) {
        for (const line of fs.readFileSync(shallowFile, 'utf8').split('\n')) if (line.trim()) untrusted.add(line.trim())
      }
    }
    // Merge commits list no files by default, which is what we want: the date
    // that counts is the commit that made the change.
    const log = git(['log', '--format=%x00%H%x09%cI', '--name-only', 'HEAD'])
    return { shallow, dates: latestDates(log, untrusted) }
  } catch {
    return null
  }
}

function latestOf(files, dates) {
  let latest = null
  for (const file of files) {
    const date = dates.get(file)
    if (date && (!latest || Date.parse(date) > Date.parse(latest))) latest = date
  }
  return latest
}

function later(a, b) {
  if (!a) return b || null
  if (!b) return a
  return Date.parse(a) >= Date.parse(b) ? a : b
}

function toUtc(date) {
  return new Date(date).toISOString().replace('.000Z', 'Z')
}

function build(baseline, gitInfo) {
  const routes = findPageRoutes().map(({ route, dir }) => ({ route, files: ownFiles(dir) }))
  const exclusive = exclusiveImports(routes)
  const result = { routes: {}, blog: {} }

  for (const { route, files } of routes) {
    const sources = [...files, ...(exclusive.get(route) || []), ...(EXTRA_SOURCES[route] || [])]
    const fromGit = latestOf(sources, gitInfo.dates)
    // With the whole history git is the authority. In a shallow clone it only
    // knows the recent past, so it may move a date forward but never back.
    const date = gitInfo.shallow ? later(fromGit, baseline.routes?.[route]) : fromGit || baseline.routes?.[route]
    if (date) result.routes[route] = toUtc(date)
  }

  const blogDir = path.join(ROOT, 'content', 'blog')
  const slugs = fs.existsSync(blogDir)
    ? fs.readdirSync(blogDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name)
    : []
  for (const slug of slugs) {
    const prefix = `content/blog/${slug}/`
    let fromGit = null
    for (const [file, date] of gitInfo.dates) if (file.startsWith(prefix)) fromGit = later(fromGit, date)
    const date = gitInfo.shallow ? later(fromGit, baseline.blog?.[slug]) : fromGit || baseline.blog?.[slug]
    if (date) result.blog[slug] = toUtc(date)
  }

  const sortKeys = (object) => Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)))
  return { routes: sortKeys(result.routes), blog: sortKeys(result.blog) }
}

function main() {
  const args = new Set(process.argv.slice(2))
  const baseline = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { routes: {}, blog: {} }
  const gitInfo = readGit()

  if (!gitInfo) {
    console.log('sitemap-lastmod: no git history here, keeping the committed dates')
    return
  }

  const next = build(baseline, gitInfo)
  const nextText = JSON.stringify(next, null, 2) + '\n'
  const changed = nextText !== (fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '')
  const summary = `${Object.keys(next.routes).length} pages, ${Object.keys(next.blog).length} posts, ${gitInfo.shallow ? 'shallow clone (recent commits over the committed dates)' : 'full history'}`

  const deployBuild = Boolean(process.env.VERCEL || process.env.CI)
  if (!args.has('--write') && !deployBuild) {
    console.log(`sitemap-lastmod: ${changed ? 'dates have moved' : 'no change'} (${summary}). Not a deploy build, so nothing written. Run npm run sitemap:lastmod to save.`)
    return
  }

  if (changed) fs.writeFileSync(OUT, nextText)
  console.log(`sitemap-lastmod: ${changed ? 'written' : 'no change'} (${summary})`)
}

module.exports = { latestDates, findPageRoutes, ownFiles, EXTRA_SOURCES }

if (require.main === module) {
  try {
    main()
  } catch (error) {
    // A date file must never stop a deploy. The committed dates stay in place.
    console.warn(`sitemap-lastmod: skipped (${error instanceof Error ? error.message : String(error)})`)
  }
}

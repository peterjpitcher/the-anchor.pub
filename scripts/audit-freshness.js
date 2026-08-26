#!/usr/bin/env node
/**
 * Volatile claims must carry a check date, and that date must not be stale.
 *
 * The site published a wrong charity partner. app/quiz-night/themed/page.tsx
 * hardcoded "the Stanwell Moor Village Hall team", copied out of an event record.
 * The partner later changed to the Community Wellbeing Garden, the database was
 * corrected, and the page was not. Nothing failed. The site simply told people
 * the wrong thing about a charity night until the owner noticed.
 *
 * The lesson is not "check harder". It is that a fact which can change without
 * anyone touching a file needs an expiry, so staleness becomes visible instead
 * of silent.
 *
 * Convention: any file declaring facts that decay carries
 *
 *   verifiedAt: 'YYYY-MM-DD'
 *
 * on each entry, or a file-level
 *
 *   FRESHNESS: { verifiedAt: 'YYYY-MM-DD', owner: '...', source: '...' }
 *
 * Owner of every claim below: Peter Pitcher (decision 5, 26 August 2026).
 *
 * Warns rather than fails. An overdue check is a prompt for a human, not a
 * reason to block an unrelated release.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const TODAY = new Date()

/**
 * Files whose claims decay, with how long a check stays good for.
 * Shorter windows for things that move faster or cost more when wrong.
 */
const WATCHED = [
  { file: 'app/quiz-night/themed/page.tsx', days: 90, why: 'event dates, charity partners' },
  { file: 'app/halloween/page.tsx', days: 180, why: 'annual event, theme changes yearly' },
  { file: 'app/heathrow-parking/page.tsx', days: 90, why: 'parking prices and transfer claims' },
  { file: 'lib/local-seo-data.ts', days: 365, why: 'landmark drive times and addresses' },
  { file: 'app/near-heathrow/page.tsx', days: 180, why: 'terminal drive times' },
]

const daysSince = (iso) => Math.floor((TODAY - new Date(`${iso}T00:00:00Z`)) / 86400000)

function audit() {
  const results = []
  for (const entry of WATCHED) {
    const full = path.join(ROOT, entry.file)
    if (!fs.existsSync(full)) {
      results.push({ ...entry, state: 'missing-file' })
      continue
    }
    const src = fs.readFileSync(full, 'utf8')
    const dates = [...src.matchAll(/verifiedAt:\s*'(\d{4}-\d{2}-\d{2})'/g)].map((m) => m[1])
    if (!dates.length) {
      results.push({ ...entry, state: 'no-verifiedAt' })
      continue
    }
    const oldest = dates.sort()[0]
    const age = daysSince(oldest)
    results.push({ ...entry, state: age > entry.days ? 'overdue' : 'ok', oldest, age, count: dates.length })
  }
  return results
}

module.exports = { audit, WATCHED }

if (require.main === module) {
  const results = audit()
  const bad = results.filter((r) => r.state !== 'ok')
  for (const r of results) {
    const label = r.state === 'ok' ? `ok      ${r.age}d old` : `${r.state.toUpperCase()}`
    console.log(`  ${label.padEnd(22)} ${r.file}  (${r.why})`)
  }
  if (!bad.length) {
    console.log('\nAll watched files carry a current verifiedAt date.')
  } else {
    console.log(`\n${bad.length} file(s) need a human check. Owner: Peter Pitcher.`)
    console.log('Re-check the claims against the management database, then update verifiedAt.')
  }
  // Warn only. An overdue check should not block an unrelated release.
  process.exit(0)
}

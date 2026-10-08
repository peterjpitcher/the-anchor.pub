#!/usr/bin/env node
/**
 * Dates that go wrong by themselves.
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
 * This script reads ONE register, config/date-register.json, and checks two
 * kinds of thing in it:
 *
 *   dates          Dates typed into a file that a visitor or Google will see
 *                  pass: a job advert's expiry, a brochure's year, the end of a
 *                  promotion. Each says what happens when it passes and how many
 *                  days of warning it needs. Listed once inside that warning.
 *
 *   checkedFiles   Files whose claims decay (prices, drive times, partners).
 *                  Each carries `verifiedAt: 'YYYY-MM-DD'` stamps, and a check
 *                  stays good for a set number of days.
 *
 * Before 8 October 2026 this looked at five files and one kind of date, and
 * nothing ran it (site review finding DT-017): it passed on the day a page went
 * stale. It now runs in `npm run lint`, in CI, and weekly from
 * .github/workflows/dated-content.yml, which opens an issue.
 *
 * Exit code. A date coming due is a prompt for a human, never a reason to block
 * an unrelated release, so it exits 0. It exits 1 only when the register itself
 * is wrong: an entry names a file that is gone, or text that is no longer in
 * the file. That means someone changed a date without changing the register,
 * and a register nobody can trust is worse than none.
 *
 * Usage:
 *   node scripts/audit-freshness.js
 *   node scripts/audit-freshness.js --today 2026-12-01     pin the clock
 *   node scripts/audit-freshness.js --report report.md     also write a summary
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const REGISTER_PATH = path.join(ROOT, 'config', 'date-register.json')
const MS_PER_DAY = 86400000
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Today's calendar date in London, as YYYY-MM-DD. CI runs in UTC. */
function londonToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** Whole days from one calendar date to another. Both are read as dates, never as times. */
function daysBetween(fromIso, toIso) {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / MS_PER_DAY)
}

function loadRegister(registerPath = REGISTER_PATH) {
  return JSON.parse(fs.readFileSync(registerPath, 'utf8'))
}

function isRealDate(iso) {
  if (typeof iso !== 'string' || !ISO_DATE.test(iso)) return false
  const parsed = new Date(`${iso}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === iso
}

/**
 * The typed dates.
 *
 * state:
 *   'out-of-step'  the entry is malformed, the file is gone, or the text is no
 *                  longer in it. The register is wrong. This is the only failure.
 *   'passed'       the date has gone and the entry says someone must act
 *   'due'          inside its warning period
 *   'done'         the date has gone and the site handled it by itself
 *   'ok'           not yet inside its warning period
 */
function auditDates(register, todayIso, root = ROOT) {
  return (register.dates || []).map((entry) => {
    const problems = []
    for (const field of ['id', 'what', 'file', 'find', 'date', 'whenItPasses', 'action']) {
      if (typeof entry[field] !== 'string' || !entry[field].trim()) problems.push(`"${field}" is missing`)
    }
    if (entry.date !== undefined && !isRealDate(entry.date)) problems.push(`"date" is not a real YYYY-MM-DD date`)
    if (!Number.isInteger(entry.warnDays) || entry.warnDays < 0) problems.push('"warnDays" must be a whole number, 0 or more')
    if (entry.afterPassing !== 'act' && entry.afterPassing !== 'nothing') {
      problems.push(`"afterPassing" must be 'act' or 'nothing'`)
    }

    if (!problems.length) {
      const full = path.join(root, entry.file)
      if (!fs.existsSync(full)) {
        problems.push(`${entry.file} does not exist`)
      } else if (!fs.readFileSync(full, 'utf8').includes(entry.find)) {
        problems.push(`${entry.file} no longer contains ${JSON.stringify(entry.find)}`)
      }
    }

    if (problems.length) return { ...entry, state: 'out-of-step', problems }

    const daysLeft = daysBetween(todayIso, entry.date)
    let state = 'ok'
    if (daysLeft < 0) state = entry.afterPassing === 'act' ? 'passed' : 'done'
    else if (daysLeft <= entry.warnDays) state = 'due'
    return { ...entry, state, daysLeft }
  })
}

/** The files that carry `verifiedAt` stamps. */
function auditCheckedFiles(register, todayIso, root = ROOT) {
  const results = []
  for (const entry of (register.checkedFiles && register.checkedFiles.files) || []) {
    const full = path.join(root, entry.file)
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
    const age = daysBetween(oldest, todayIso)
    results.push({ ...entry, state: age > entry.days ? 'overdue' : 'ok', oldest, age, count: dates.length })
  }
  return results
}

/** Kept for callers of the older single-purpose audit. */
function audit(todayIso = londonToday()) {
  return auditCheckedFiles(loadRegister(), todayIso)
}

function auditAll(todayIso = londonToday(), register = loadRegister(), root = ROOT) {
  const dates = auditDates(register, todayIso, root)
  const checkedFiles = auditCheckedFiles(register, todayIso, root)
  const outOfStep = dates.filter((r) => r.state === 'out-of-step')
  const needsAttention = [
    ...dates.filter((r) => r.state === 'due' || r.state === 'passed'),
    ...checkedFiles.filter((r) => r.state !== 'ok'),
  ]
  return { today: todayIso, dates, checkedFiles, outOfStep, needsAttention }
}

function describeWhen(result) {
  if (result.state === 'passed') return `passed ${-result.daysLeft} day(s) ago`
  if (result.daysLeft === 0) return 'today'
  return `in ${result.daysLeft} day(s)`
}

/** A summary for the weekly issue. Empty when there is nothing to do. */
function buildReport(result) {
  const lines = []
  const dates = result.dates.filter((r) => r.state === 'due' || r.state === 'passed')
  const files = result.checkedFiles.filter((r) => r.state !== 'ok')
  if (!dates.length && !files.length && !result.outOfStep.length) return ''

  lines.push(`Dated content check for ${result.today} (London). Source: \`config/date-register.json\`.`, '')

  if (dates.length) {
    lines.push('## Dates coming up or passed', '')
    for (const r of dates) {
      lines.push(`- **${r.what}** ${r.date}, ${describeWhen(r)}. \`${r.file}\``)
      lines.push(`  - When it passes: ${r.whenItPasses}`)
      lines.push(`  - To do: ${r.action}`)
    }
    lines.push('')
  }

  if (files.length) {
    lines.push('## Claims due a re-check', '')
    for (const r of files) {
      const detail =
        r.state === 'overdue'
          ? `last checked ${r.oldest}, ${r.age} days ago; a check is good for ${r.days} days`
          : r.state === 'missing-file'
            ? 'the file no longer exists; remove it from the register'
            : 'the file carries no verifiedAt date'
      lines.push(`- \`${r.file}\` (${r.why}): ${detail}.`)
    }
    lines.push('', 'Re-check each claim against the management app, then update `verifiedAt` in the file.', '')
  }

  if (result.outOfStep.length) {
    lines.push('## The register does not match the code', '')
    for (const r of result.outOfStep) lines.push(`- \`${r.id || '(no id)'}\`: ${r.problems.join('; ')}.`)
    lines.push('')
  }

  return lines.join('\n')
}

module.exports = {
  audit,
  auditAll,
  auditCheckedFiles,
  auditDates,
  buildReport,
  daysBetween,
  loadRegister,
  londonToday,
}

if (require.main === module) {
  const arg = (name) => {
    const i = process.argv.indexOf(name)
    return i > -1 ? process.argv[i + 1] : undefined
  }
  const pinned = arg('--today')
  if (pinned !== undefined && !isRealDate(pinned)) {
    console.error(`--today must be a real YYYY-MM-DD date, got "${pinned}"`)
    process.exit(1)
  }
  const result = auditAll(pinned || londonToday())

  console.log(`Dated content, as of ${result.today} (London)\n`)
  console.log('Typed dates')
  for (const r of result.dates) {
    const label =
      r.state === 'out-of-step'
        ? 'OUT OF STEP'
        : r.state === 'passed'
          ? `PASSED ${-r.daysLeft}d ago`
          : r.state === 'due'
            ? `DUE ${describeWhen(r)}`
            : r.state === 'done'
              ? 'done, no action'
              : `ok, ${r.daysLeft}d to go`
    console.log(`  ${label.padEnd(22)} ${String(r.date || '').padEnd(11)} ${r.file}  (${r.id})`)
    if (r.state === 'out-of-step') console.log(`      ${r.problems.join('; ')}`)
    if (r.state === 'due' || r.state === 'passed') {
      console.log(`      when it passes: ${r.whenItPasses}`)
      console.log(`      to do: ${r.action}`)
    }
  }

  console.log('\nClaims with a check date')
  for (const r of result.checkedFiles) {
    const label = r.state === 'ok' ? `ok, ${r.age}d old` : r.state.toUpperCase()
    console.log(`  ${label.padEnd(22)} ${r.file}  (${r.why})`)
  }

  const reportPath = arg('--report')
  if (reportPath) fs.writeFileSync(reportPath, buildReport(result))

  if (result.outOfStep.length) {
    console.log(
      `\n${result.outOfStep.length} register entr${result.outOfStep.length === 1 ? 'y does' : 'ies do'} not match the code.` +
        '\nA date was changed without changing config/date-register.json. Update the entry, or remove it if the date is gone.'
    )
    process.exit(1)
  }

  if (result.needsAttention.length) {
    console.log(`\n${result.needsAttention.length} item(s) need a human. Owner: Peter Pitcher.`)
  } else {
    console.log('\nNothing is inside its warning period.')
  }
  // Warn only. A date coming due should not block an unrelated release.
  process.exit(0)
}

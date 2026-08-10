import fs from 'fs'
import path from 'path'
import { LARGE_GROUP_DEPOSIT_THRESHOLD } from '@/lib/constants'

/**
 * The threshold moved from 10 to 15 on 2026-08-09, and seven customer-facing sentences
 * were missed because they spelled it as the word "ten" rather than the digit. One page
 * ended up with two adjacent bullets contradicting each other: "No deposits for groups
 * under 15" directly above "Groups of 10+: £10 per person deposit".
 *
 * A stale deposit promise is not cosmetic. It is a price the guest was quoted, and the
 * till charges something else.
 *
 * This scans the customer-facing tree for every way the OLD rule can be written. It is
 * deliberately about the deposit specifically: "groups of 10 to 150" is a room capacity,
 * "10 or more, give us a heads up" is about pre-ordering a round, and neither is a price.
 */

const ROOTS = ['app', 'components', 'lib']
const EXTENSIONS = new Set(['.ts', '.tsx'])

function walk(dir: string, found: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, found)
    } else if (EXTENSIONS.has(path.extname(entry.name)) && !full.includes('__tests__')) {
      found.push(full)
    }
  }
  return found
}

/**
 * Ways a deposit threshold of ten has been written in this repo. Each requires a deposit
 * word nearby, so capacity and pre-order sentences do not trip it.
 */
const STALE_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: 'the word "ten"', pattern: /(groups?|parties|party) of ten or more[^.]{0,80}deposit/i },
  { label: '"ten or more ... £10 per person"', pattern: /ten or more[^.]{0,60}£10 per person/i },
  { label: '"10+" beside a deposit', pattern: /(groups?|parties) of 10\+[^.]{0,60}deposit/i },
  { label: '"Groups of 10+: ... deposit"', pattern: /groups? of 10\+\s*:[^.]{0,60}deposit/i },
  { label: '"10 or more" beside a deposit', pattern: /(groups?|parties) of 10 or more[^.]{0,60}deposit/i },
]

describe('no page still quotes the old deposit threshold', () => {
  const files = ROOTS.flatMap((root) => walk(path.join(process.cwd(), root)))

  it('scans a meaningful number of files', () => {
    // Guards the guard: a walk that silently found nothing would pass everything below.
    expect(files.length).toBeGreaterThan(100)
  })

  it.each(STALE_PATTERNS)('finds no customer-facing $label', ({ pattern }) => {
    const offenders = files.filter((file) => pattern.test(fs.readFileSync(file, 'utf8')))
    expect(offenders.map((f) => path.relative(process.cwd(), f))).toEqual([])
  })

  it('keeps the shared policy copy in step with the constant', () => {
    const constants = fs.readFileSync(path.join(process.cwd(), 'lib/constants.ts'), 'utf8')
    const copy = /LARGE_GROUP_DEPOSIT_POLICY_COPY =\s*\n?\s*"([^"]+)"/.exec(constants)?.[1]
    expect(copy).toBeDefined()
    expect(copy).toContain(`${LARGE_GROUP_DEPOSIT_THRESHOLD} or more`)
  })

  it('keeps the SSOT free of a contradicting threshold', () => {
    const ssot = fs.readFileSync(path.join(process.cwd(), 'docs/SSOT.md'), 'utf8')
    // The changelog note legitimately mentions the old number while explaining the
    // change, so only rule statements are checked.
    const ruleStatements = ssot.match(/groups? of \d+\+?[^.\n]{0,60}(deposit|applies)/gi) || []
    const stale = ruleStatements.filter((line) => !line.includes(String(LARGE_GROUP_DEPOSIT_THRESHOLD)))
    expect(stale).toEqual([])
  })
})

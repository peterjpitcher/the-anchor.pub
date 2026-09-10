export {}

import { readFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

// docs/SSOT.md section 8: getting in from the car park is step free, the beer
// garden is step free from the car park, and there is exactly ONE step, between
// the bar and the garden, with one ramp that staff put out on request.
//
// Until 10 September 2026 twenty-two places across eleven pages and blog posts
// got this wrong in the same two ways. They said "steps", where there is one,
// and they described the garden only from the bar, which reads to a wheelchair
// user as "the garden is not for you" when it is the one space they can reach
// with no step at all. /find-us also described a permanent ramp at a back door,
// which does not exist. A guest plans a visit around sentences like these.

const ROOT = join(__dirname, '..')

function customerFacingFiles(): string[] {
  const out = execSync(
    "git ls-files 'app/**/*.tsx' 'app/**/*.ts' 'components/**/*.tsx' 'components/**/*.ts' 'lib/**/*.ts' 'content/**/*.md'",
    { cwd: ROOT, encoding: 'utf8' }
  )
  return out.split('\n').map(f => f.trim()).filter(Boolean)
}

const FORBIDDEN: ReadonlyArray<readonly [RegExp, string]> = [
  [/garden has steps/i, 'there is one step, not steps'],
  [/steps (?:from|down from|up from) the bar/i, 'there is one step, not steps'],
  [/steps (?:down|up) (?:to|into) the (?:beer )?garden/i, 'there is one step, not steps'],
  [/back door/i, 'there is no ramp at a back door; entry from the car park is step free'],
  [/ramp access/i, 'the ramp is put out on request, it is not a permanent fixture'],
]

describe('accessibility copy states the route, and the one step', () => {
  it('never says the garden has steps, or invents a back-door ramp', () => {
    const offenders: string[] = []

    for (const file of customerFacingFiles()) {
      let contents: string
      try {
        contents = readFileSync(join(ROOT, file), 'utf8')
      } catch {
        continue
      }
      contents.split('\n').forEach((line, i) => {
        for (const [pattern, why] of FORBIDDEN) {
          if (pattern.test(line)) offenders.push(`${file}:${i + 1} (${why})`)
        }
      })
    }

    expect(offenders).toEqual([])
  })

  it('keeps the approved wording in the SSOT, so there is always a right sentence to paste', () => {
    const ssot = readFileSync(join(ROOT, 'docs/SSOT.md'), 'utf8').replace(/\s+/g, ' ')
    expect(ssot).toContain('We have exactly one ramp, and it is not a permanent fixture.')
    expect(ssot).toContain('State the route: step free from the car park, one step from the bar, ramp on request.')
    expect(ssot).toContain("there's one step between the bar and the garden, and we'll put our ramp out for it if you ask")
  })
})

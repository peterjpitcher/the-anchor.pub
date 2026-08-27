export {}

import { readFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

// docs/SSOT.md section 9 says only "Directly under Heathrow's southern runway
// approach path". Until 27 August 2026 ten places across /beer-garden and
// /plane-spotting-heathrow asserted "27R", structured data included, which
// contradicted that line: Heathrow's southern runway is not 27R. The designator
// tells a visitor nothing they need and is exactly the kind of detail an
// aviation enthusiast corrects in public.

const ROOT = join(__dirname, '..')

function customerFacingFiles(): string[] {
  const out = execSync(
    "git ls-files 'app/**/*.tsx' 'app/**/*.ts' 'components/**/*.tsx' 'components/**/*.ts' 'lib/**/*.ts'",
    { cwd: ROOT, encoding: 'utf8' }
  )
  return out.split('\n').map(f => f.trim()).filter(Boolean)
}

describe('no Heathrow runway designator appears in customer-facing code', () => {
  it('finds none of 27R, 27L, 09L or 09R', () => {
    // Word boundaries so an unrelated token such as a hex colour cannot match.
    const designator = /\b(?:27[RL]|09[RL])\b/
    const offenders: string[] = []

    for (const file of customerFacingFiles()) {
      let contents: string
      try {
        contents = readFileSync(join(ROOT, file), 'utf8')
      } catch {
        continue
      }
      contents.split('\n').forEach((line, i) => {
        if (designator.test(line)) offenders.push(`${file}:${i + 1}`)
      })
    }

    expect(offenders).toEqual([])
  })

  it('keeps the SSOT wording available to use instead', () => {
    const ssot = readFileSync(join(ROOT, 'docs/SSOT.md'), 'utf8')
    expect(ssot).toContain("southern runway approach path")
    expect(ssot).toContain('Never publish a runway designator')
  })
})

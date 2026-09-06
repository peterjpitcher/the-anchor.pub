import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import path from 'path'

/**
 * An anchor may not contain interactive content. `<Link><Button>...</Button></Link>`
 * renders `<a><button>...</button></a>`, which is invalid HTML, gives one action two
 * tab stops, and reads oddly to screen readers. The design system's asChild pattern
 * is the fix: `<Button asChild><Link ...>...</Link></Button>`.
 *
 * This guards the whole tree, because the pattern was reintroduced by hand 146 times
 * before it was cleared out.
 */

const repoRoot = path.resolve(__dirname, '../..')

/**
 * Index of the '>' closing the JSX tag that starts at `from`, ignoring braces and
 * strings. A plain `[^>]*` scan misses tags holding an arrow function, which is how
 * two of these instances hid from the first sweep.
 */
function openTagEnd(source: string, from: number): number {
  let depth = 0
  let quote: string | null = null

  for (let i = from; i < source.length; i++) {
    const char = source[i]

    if (quote) {
      if (char === quote && source[i - 1] !== '\\') quote = null
      continue
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char
      continue
    }
    if (char === '{') depth++
    else if (char === '}') depth--
    else if (char === '>' && depth === 0) return i
  }

  return -1
}

function findAnchorWrappedButtons(source: string): number[] {
  const lines: number[] = []
  const openers = /<(Link|a)(?=[\s/>])/g
  let match: RegExpExecArray | null

  while ((match = openers.exec(source))) {
    const tagEnd = openTagEnd(source, match.index)
    // Skip malformed and self-closing tags: neither can wrap anything.
    if (tagEnd < 0 || source[tagEnd - 1] === '/') continue

    const afterTag = source.slice(tagEnd + 1)
    const whitespace = afterTag.match(/^\s*/)![0]
    if (!/^<Button(?=[\s/>])/.test(afterTag.slice(whitespace.length))) continue

    lines.push(source.slice(0, match.index).split('\n').length)
  }

  return lines
}

describe('no anchor-wrapped buttons', () => {
  const files = execSync('git ls-files "*.tsx"', { cwd: repoRoot, encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean)

  it('finds .tsx files to check', () => {
    expect(files.length).toBeGreaterThan(100)
  })

  it('has no <Link> or <a> wrapping a <Button> anywhere in the tree', () => {
    const offenders: string[] = []

    for (const file of files) {
      const source = readFileSync(path.join(repoRoot, file), 'utf8')
      for (const line of findAnchorWrappedButtons(source)) {
        offenders.push(`${file}:${line}`)
      }
    }

    expect(offenders).toEqual([])
  })

  it('detects the defect it is meant to catch', () => {
    const bad = `
      <Link href="/whats-on" onClick={() => track('x')}>
        <Button variant="primary">See what is on</Button>
      </Link>
    `
    const good = `
      <Button asChild variant="primary">
        <Link href="/whats-on" onClick={() => track('x')}>See what is on</Link>
      </Button>
    `

    expect(findAnchorWrappedButtons(bad)).toHaveLength(1)
    expect(findAnchorWrappedButtons(good)).toHaveLength(0)
  })
})

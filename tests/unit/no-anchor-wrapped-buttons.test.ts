import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import path from 'path'
import ts from 'typescript'

/**
 * An anchor may not contain interactive content. `<Link><Button>...</Button></Link>`
 * renders `<a><button>...</button></a>`, which is invalid HTML, gives one action two
 * tab stops, and reads oddly to screen readers. The design system's asChild pattern
 * is the fix: `<Button asChild><Link ...>...</Link></Button>`.
 *
 * This guards the whole tree, because the pattern was reintroduced by hand 146 times
 * before it was cleared out.
 *
 * The detector walks the TSX syntax tree rather than scanning text. The first version
 * matched only a `<Button` sitting immediately after the anchor's opening tag, so it
 * missed a button nested one level deeper, a button following a sibling, and a plain
 * lowercase `<button>`. All three are the same defect and all three are covered below.
 */

const repoRoot = path.resolve(__dirname, '../..')

// What actually renders an interactive control in this codebase. `Button` is the
// design system primitive, which emits a real <button> unless it is given asChild.
// There is no IconButton or similar wrapper to add here yet.
const INTERACTIVE = /^(Button|button)$/
const ANCHOR = /^(Link|a)$/

function hasAsChild(node: ts.JsxOpeningElement | ts.JsxSelfClosingElement, source: ts.SourceFile): boolean {
  return node.attributes.properties.some(
    property => ts.isJsxAttribute(property) && property.name.getText(source) === 'asChild'
  )
}

/**
 * Line numbers of every interactive element sitting inside an anchor, at any depth.
 */
function findAnchorWrappedButtons(source: string): number[] {
  const sourceFile = ts.createSourceFile('scan.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const lines: number[] = []

  const visit = (node: ts.Node, insideAnchor: boolean): void => {
    let inside = insideAnchor

    const inspect = (tag: string, element: ts.Node, asChild: boolean) => {
      if (ANCHOR.test(tag)) {
        inside = true
        return
      }
      // A Button with asChild renders no <button> of its own: it clones its child,
      // so `<Button asChild><Link /></Button>` is the fix rather than the defect.
      if (inside && !asChild && INTERACTIVE.test(tag)) {
        lines.push(sourceFile.getLineAndCharacterOfPosition(element.getStart(sourceFile)).line + 1)
      }
    }

    if (ts.isJsxElement(node)) {
      const opening = node.openingElement
      inspect(opening.tagName.getText(sourceFile), node, hasAsChild(opening, sourceFile))
    } else if (ts.isJsxSelfClosingElement(node)) {
      inspect(node.tagName.getText(sourceFile), node, hasAsChild(node, sourceFile))
    }

    ts.forEachChild(node, child => visit(child, inside))
  }

  visit(sourceFile, false)
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

  it('detects every shape of the defect it is meant to catch', () => {
    const direct = `
      <Link href="/whats-on" onClick={() => track('x')}>
        <Button variant="primary">See what is on</Button>
      </Link>
    `
    const nestedDeeper = `
      <a href="/whats-on">
        <div className="wrap">
          <Button variant="primary">See what is on</Button>
        </div>
      </a>
    `
    const afterASibling = `
      <a href="/whats-on">
        <span aria-hidden="true" />
        <Button variant="primary">See what is on</Button>
      </a>
    `
    const lowercaseButton = `
      <Link href="/whats-on">
        <button type="button">See what is on</button>
      </Link>
    `

    expect(findAnchorWrappedButtons(direct)).toHaveLength(1)
    expect(findAnchorWrappedButtons(nestedDeeper)).toHaveLength(1)
    expect(findAnchorWrappedButtons(afterASibling)).toHaveLength(1)
    expect(findAnchorWrappedButtons(lowercaseButton)).toHaveLength(1)
  })

  it('accepts the asChild pattern that replaced it', () => {
    const asChildWithLink = `
      <Button asChild variant="primary">
        <Link href="/whats-on" onClick={() => track('x')}>See what is on</Link>
      </Button>
    `
    const asChildWithAnchor = `
      <Button asChild variant="primary" icon={<Icon name="download" />}>
        <a href="/brochure.pdf" target="_blank" rel="noopener">
          Download
          <span className="sr-only"> Opens in a new tab.</span>
        </a>
      </Button>
    `
    const buttonWithNoAnchor = `
      <div>
        <Button variant="primary" onClick={open}>Book a table</Button>
      </div>
    `

    expect(findAnchorWrappedButtons(asChildWithLink)).toEqual([])
    expect(findAnchorWrappedButtons(asChildWithAnchor)).toEqual([])
    expect(findAnchorWrappedButtons(buttonWithNoAnchor)).toEqual([])
  })
})

export {}

import { readFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'
import ts from 'typescript'

// An anchor may not contain interactive content. A <button> inside an <a> is
// invalid HTML, gives a single action two tab stops, and reads oddly to screen
// readers. On 6 September 2026 the codebase held 152 of them: DirectionsButton,
// PhoneButton, the two brochure components and 148 hand written pairs across 55
// page files. They were all converted to the design system's asChild pattern,
// which renders one anchor styled as a button. This test keeps them gone.

const ROOT = join(__dirname, '..')
const INTERACTIVE = /^(Button|button|IconButton)$/
const ANCHOR = /^(Link|a)$/

function sourceFiles(): string[] {
  const out = execSync("git ls-files 'app/**/*.tsx' 'components/**/*.tsx'", {
    cwd: ROOT,
    encoding: 'utf8',
  })
  return out.split('\n').map(f => f.trim()).filter(Boolean)
}

describe('no interactive element is nested inside an anchor', () => {
  it('finds no Button or button inside a Link or a', () => {
    const offenders: string[] = []

    for (const file of sourceFiles()) {
      const text = readFileSync(join(ROOT, file), 'utf8')
      const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

      const visit = (node: ts.Node, anchorLine: number): void => {
        let insideAnchor = anchorLine
        const record = (tag: string, node: ts.Node) => {
          const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1
          if (ANCHOR.test(tag)) {
            insideAnchor = line
          } else if (insideAnchor && INTERACTIVE.test(tag)) {
            offenders.push(`${file}:${line} <${tag}> inside the anchor opened at line ${insideAnchor}`)
          }
        }

        if (ts.isJsxElement(node)) {
          const tag = node.openingElement.tagName.getText(sf)
          // A Button with asChild renders no <button> of its own: it clones its
          // child, so <Button asChild><a/></Button> is the fix, not the defect.
          const asChild = node.openingElement.attributes.properties.some(
            p => ts.isJsxAttribute(p) && p.name.getText(sf) === 'asChild'
          )
          if (!asChild) record(tag, node)
        } else if (ts.isJsxSelfClosingElement(node)) {
          record(node.tagName.getText(sf), node)
        }

        ts.forEachChild(node, child => visit(child, insideAnchor))
      }

      visit(sf, 0)
    }

    expect(offenders).toEqual([])
  })
})

import fs from 'fs'
import path from 'path'

import { GOOGLE_REVIEWS_URL, REVIEW_REQUEST_URL } from '@/lib/constants'

const ROOT = process.cwd()
const SOURCE_DIRS = ['app', 'components', 'lib', 'config']

function collectSourceFiles(dir: string): string[] {
  const absolute = path.join(ROOT, dir)
  if (!fs.existsSync(absolute)) return []

  const entries = fs.readdirSync(absolute, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const relative = path.join(dir, entry.name)
    if (entry.isDirectory()) return collectSourceFiles(relative)
    if (!/\.(ts|tsx|js|jsx|json)$/.test(entry.name)) return []
    return [relative]
  })
}

/**
 * Strips block and line comments so the guards below only inspect live code.
 * lib/constants.ts documents the dead URLs in a comment on purpose.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

describe('review links', () => {
  const files = SOURCE_DIRS.flatMap(collectSourceFiles)

  it('never links to a g.page short URL', () => {
    // Two g.page links rotted silently and took every review ask on the site
    // with them. `g.page/r/CQz1W5fqSTqPEAI/review` encoded the wrong Google CID
    // and bounced to google.com; the `g.page/theanchorpubsm` vanity link
    // resolved to a Google search for the literal string. Neither returned an
    // error, so nothing caught it for thirteen months. Use the CID instead.
    const offending = files.filter((file) =>
      stripComments(fs.readFileSync(path.join(ROOT, file), 'utf8')).includes('g.page'),
    )

    expect(offending).toEqual([])
  })

  it('sends /leave-review and /leave-a-review to the feedback page', () => {
    // Owner rule: review requests only ever go through the feedback page, which
    // asks how the visit went before sending anyone to Google.
    const redirects: Array<{ source: string; destination: string }> = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'config/redirects/additional-redirects.json'), 'utf8'),
    )

    for (const source of ['/leave-review', '/leave-a-review']) {
      const rule = redirects.find((r) => r.source === source)
      expect(rule).toBeDefined()
      expect(rule!.destination).toBe(REVIEW_REQUEST_URL)
    }
  })

  it('keeps the review request off Google and the reviews link on it', () => {
    expect(REVIEW_REQUEST_URL).toBe('https://l.the-anchor.pub/feedback')
    expect(GOOGLE_REVIEWS_URL).toContain('cid=17928230944823812473')
  })

  it('has no route shadowing the /leave-review redirect', () => {
    // app/leave-review/page.tsx sat here for a year redirecting somewhere else
    // entirely. It never ran (the middleware redirect wins), but it made the
    // real destination look like something it was not.
    expect(fs.existsSync(path.join(ROOT, 'app/leave-review'))).toBe(false)
  })
})

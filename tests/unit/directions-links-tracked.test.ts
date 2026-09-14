import fs from 'fs'
import path from 'path'

// A map link on a page must go through DirectionsButton or DirectionsLink, which push the
// directions_click event. A plain <Link> or <a> to Google Maps records nothing: by September
// 2026, 14 page templates had drifted that way, including the Music Bingo and Cash Bingo pages.
const APP_DIR = path.join(process.cwd(), 'app')
const MAP_HREF =
  /href=\{?\s*[`"']?\s*(?:https:\/\/(?:maps\.google\.[a-z.]+|www\.google\.[a-z.]+\/maps|maps\.app\.goo\.gl)|[A-Z_]*(?:MAPS|DIRECTIONS)_URL\b)/

function listTsxFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listTsxFiles(fullPath))
    } else if (entry.name.endsWith('.tsx')) {
      files.push(fullPath)
    }
  }
  return files
}

function findMapLinks(source: string): number[] {
  const pattern = new RegExp(MAP_HREF.source, 'g')
  const positions: number[] = []
  let match: RegExpExecArray | null
  while ((match = pattern.exec(source)) !== null) {
    positions.push(match.index)
  }
  return positions
}

describe('map links on pages', () => {
  const files = listTsxFiles(APP_DIR)

  it('all go through DirectionsButton or DirectionsLink, so the click is tracked', () => {
    const untracked: string[] = []

    for (const file of files) {
      const source = fs.readFileSync(file, 'utf8')
      for (const position of findMapLinks(source)) {
        const tagStart = source.lastIndexOf('<', position)
        const tagName = /^<([A-Za-z.]+)/.exec(source.slice(tagStart))?.[1] ?? 'unknown'
        if (tagName !== 'DirectionsButton' && tagName !== 'DirectionsLink') {
          const line = source.slice(0, position).split('\n').length
          untracked.push(`${path.relative(process.cwd(), file)}:${line} <${tagName}>`)
        }
      }
    }

    expect(untracked).toEqual([])
  })

  it('still finds the map links it guards', () => {
    // A pattern that matched nothing would let the check above pass for the wrong reason.
    const total = files.reduce(
      (count, file) => count + findMapLinks(fs.readFileSync(file, 'utf8')).length,
      0
    )
    expect(total).toBeGreaterThan(20)
  })
})

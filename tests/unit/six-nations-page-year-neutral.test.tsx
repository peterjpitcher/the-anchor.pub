/**
 * `/live-sport/six-nations` is year-neutral (7 October 2026).
 *
 * In October 2026 the page still advertised the tournament that ended in March:
 * a dated title and hero, the 2026 fixture list, and Event structured data with
 * an end date of 14 March 2026. docs/SSOT.md has no Six Nations entry, so the
 * page may not name a year, a fixture or a match day, and may not promise what
 * the SSOT does not confirm (a screen count, commentary, every match).
 *
 * This reads the page source as well as the rendered page, because metadata and
 * JSON-LD are not in the rendered tree.
 */

import fs from 'fs'
import path from 'path'
import { render } from '@testing-library/react'
import SixNationsPage, { metadata } from '@/app/live-sport/six-nations/page'

jest.mock('next/navigation', () => ({
  usePathname: () => '/live-sport/six-nations'
}))

const source = fs.readFileSync(
  path.join(process.cwd(), 'app', 'live-sport', 'six-nations', 'page.tsx'),
  'utf8'
)
/** The page's code without its comments, which explain the history and so name the year. */
const code = source.replace(/^\s*\/\/.*$/gm, '')

function pageText(): string {
  const { container } = render(<SixNationsPage />)
  return container.textContent ?? ''
}

describe('/live-sport/six-nations is year-neutral', () => {
  it('names no year in its metadata', () => {
    expect(JSON.stringify(metadata)).not.toMatch(/\b20\d{2}\b/)
  })

  it('keeps the title pattern and the relative canonical', () => {
    expect(metadata.title).toEqual({ absolute: 'Six Nations Rugby | The Anchor Stanwell Moor' })
    expect(metadata.alternates?.canonical).toBe('./')
  })

  it('names no year, fixture list or match day on the page', () => {
    const text = pageText()
    expect(text).not.toMatch(/\b20\d{2}\b/)
    expect(text).not.toMatch(/fixtures? (?:list|below)|super saturday|kick[- ]?off/i)
  })

  it('carries no Event structured data and no fixture component', () => {
    expect(code).not.toMatch(/["']@type["']\s*:\s*["'](?:Sports)?Event["']/)
    expect(code).not.toMatch(/startDate|endDate/)
    expect(code).not.toContain('SixNationsFixtures')
  })

  it('promises nothing the SSOT does not confirm', () => {
    const text = `${pageText()} ${JSON.stringify(metadata)}`
    expect(text).not.toMatch(/every (?:six nations )?match|\b\d+\s+(?:HD\s+)?screens?\b|commentary|sound on/i)
  })

  it('uses the approved sport wording from SSOT section 16', () => {
    expect(pageText()).toContain(
      "We show live sport on BBC, ITV and Channel 4. We don't have Sky Sports or TNT Sports."
    )
  })

  it('has at most one exclamation mark, and never says "guests" or "cheeky"', () => {
    const text = pageText()
    expect((text.match(/!/g) ?? []).length).toBeLessThanOrEqual(1)
    expect(text).not.toMatch(/\bguests?\b|\bcheeky\b/i)
  })
})

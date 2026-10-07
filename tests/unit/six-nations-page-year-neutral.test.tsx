/**
 * `/live-sport/six-nations` is year-neutral (7 October 2026).
 *
 * In October 2026 the page still advertised the tournament that ended in March:
 * a dated title and hero, the 2026 fixture list, and Event structured data with
 * an end date of 14 March 2026. SSOT section 10 (owner decision, 7 October 2026)
 * confirms Six Nations games on terrestrial TV, on 4 TVs, with the commentary
 * on. It names no year, fixture or match day, so the page may not, and the page
 * may not go past it ("every match", "big screens", "HD", another screen count).
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
    expect(text).not.toMatch(/every (?:six nations )?(?:match|game)|big screens?|\bHD\b|sound on/i)
    const counts = [...text.matchAll(/\b(\d+|two|three|five|six|multiple|several)\s+(?:TVs|screens)\b/gi)].map((m) => m[1])
    expect(counts.filter((count) => count !== '4')).toEqual([])
  })

  it('uses the approved sport and Six Nations wording from SSOT section 16', () => {
    const text = pageText()
    expect(text).toContain(
      "We show live sport on BBC, ITV and Channel 4. We don't have Sky Sports or TNT Sports."
    )
    expect(text).toContain(
      'We show Six Nations games that are on BBC, ITV or Channel 4, on 4 TVs with the commentary on. Call us on 01753 682707 to check a particular game.'
    )
  })

  it('carries the same approved wording as docs/SSOT.md', () => {
    const ssot = fs.readFileSync(path.join(process.cwd(), 'docs', 'SSOT.md'), 'utf8')
    expect(ssot).toContain(
      '> We show Six Nations games that are on BBC, ITV or Channel 4, on 4 TVs with the commentary on. Call us on 01753 682707 to check a particular game.'
    )
  })

  it('has at most one exclamation mark, and never says "guests" or "cheeky"', () => {
    const text = pageText()
    expect((text.match(/!/g) ?? []).length).toBeLessThanOrEqual(1)
    expect(text).not.toMatch(/\bguests?\b|\bcheeky\b/i)
  })
})

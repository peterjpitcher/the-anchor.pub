import fs from 'fs'
import path from 'path'
import { stripBrandSuffix } from '@/lib/metadata/strip-brand-suffix'

/**
 * The root layout applies `%s | The Anchor`, so no page-level title may carry
 * the brand itself. At the August 2026 audit, 88 of 226 live pages rendered
 * the brand twice, one of them at 111 characters, where search results show
 * roughly the first 60.
 *
 * Two guards:
 *  1. Blog front matter, which is authored by hand.
 *  2. The shared helper that DB-sourced titles pass through.
 *
 * openGraph and twitter titles are exempt: no template runs on those, so they
 * should carry the brand.
 */
const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

function blogTitles(): Array<{ slug: string; title: string }> {
  return fs
    .readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const file = path.join(BLOG_DIR, e.name, 'index.md')
      if (!fs.existsSync(file)) return null
      const src = fs.readFileSync(file, 'utf8')
      const m = src.match(/^title:\s*(.+?)\s*$/m)
      return m ? { slug: e.name, title: m[1].replace(/^["']|["']$/g, '') } : null
    })
    .filter((x): x is { slug: string; title: string } => x !== null)
}

describe('page titles never double the brand', () => {
  it('no blog title survives the helper still containing the brand', () => {
    const offenders = blogTitles()
      .filter(({ title }) => /The Anchor/.test(stripBrandSuffix(title)))
      .map(({ slug, title }) => `${slug}: ${title}`)
    expect(offenders).toEqual([])
  })

  /**
   * Ratchet, not a target. 42 blog titles still render over 75 characters
   * (worst is 100), because shortening them is editorial work that changes
   * what each post targets, not a brand-doubling fix. This guard stops the
   * count growing while that work is outstanding.
   */
  it('does not let the count of over-long blog titles grow', () => {
    const tooLong = blogTitles().filter(
      ({ title }) => stripBrandSuffix(title).length + ' | The Anchor'.length > 75,
    )
    expect(tooLong.length).toBeLessThanOrEqual(42)
  })

  it('strips the brand from the DB-sourced title shapes staff actually write', () => {
    for (const written of [
      'Quiz Night | The Anchor',
      'Cash Bingo Night at The Anchor',
      'A Hint of Halloween Quiz Night at The Anchor | 7 October',
      'Event Brochures | The Anchor Stanwell Moor',
    ]) {
      expect(stripBrandSuffix(written)).not.toMatch(/The Anchor/)
    }
  })
})

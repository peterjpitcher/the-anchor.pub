/**
 * Six Nations and screen claims stay inside docs/SSOT.md (7 October 2026).
 *
 * SSOT section 10 confirms Six Nations games on terrestrial TV, on 4 TVs, with
 * the commentary on. Section 8 confirms the 4 TVs and rules out "big screens",
 * "HD" and any other count. Until this change /live-sport, /drinks, the blog
 * tag copy and two posts promised every Six Nations match, big screens,
 * multiple HD screens and full audio.
 *
 * Of the blog, only the two posts that describe what we show now are read: the
 * live sport guide and the sports update. Older dated posts (the 2023 Six
 * Nations post by owner instruction; the 2019 to 2025 match and season posts
 * pending an owner decision) are dated editorial and are not read here.
 */

import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const CURRENT_POSTS = ['live-sport-pubs-near-heathrow', 'sports-update']

function filesUnder(dir: string, extensions: string[]): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return filesUnder(full, extensions)
    return extensions.some((extension) => entry.name.endsWith(extension)) ? [full] : []
  })
}

const sources = [
  ...filesUnder(path.join(ROOT, 'app'), ['page.tsx']),
  path.join(ROOT, 'lib', 'tag-seo-content.ts'),
  ...CURRENT_POSTS.map((slug) => path.join(ROOT, 'content', 'blog', slug, 'index.md'))
].map((file) => ({ file: path.relative(ROOT, file), text: fs.readFileSync(file, 'utf8') }))

/** Lines of our own copy matching `pattern`, as "file: line". */
function offenders(pattern: RegExp, only: (line: string) => boolean = () => true): string[] {
  return sources.flatMap(({ file, text }) =>
    text
      .split('\n')
      .filter((line) => pattern.test(line) && only(line))
      .map((line) => `${file}: ${line.trim().slice(0, 140)}`)
  )
}

describe('Six Nations and screen claims match the SSOT', () => {
  it('reads a sensible number of files', () => {
    expect(sources.length).toBeGreaterThan(100)
  })

  it('never promises every Six Nations match', () => {
    const everyMatch = /every (?:single )?(?:six nations )?(?:match|game|round)/i
    expect(offenders(everyMatch, (line) => /six nations/i.test(line))).toEqual([])
  })

  it('never names a broadcaster for the Six Nations beyond the terrestrial-only rule', () => {
    expect(offenders(/six nations (?:is|are) (?:broadcast|shown|on) /i)).toEqual([])
  })

  it('never calls our TVs big screens, HD or multiple', () => {
    // "big screen" as a search phrase or a question is not a claim about the pub.
    const claim = /\bbig screens\b|\bHD screens?\b|\bmultiple (?:HD )?screens\b(?! and full subscription)/i
    const isOurs = (line: string): boolean => !/^\s*(?:-|description:)/.test(line) || !line.includes('Which pubs')
    expect(offenders(claim, isOurs)).toEqual([])
  })

  it('never promises full audio', () => {
    expect(offenders(/\bfull audio\b/i)).toEqual([])
  })

  it('gives no screen count other than 4', () => {
    const counts = sources.flatMap(({ file, text }) =>
      [...text.matchAll(/\b(\d+)\s+(?:HD\s+)?(?:TVs|screens)\b/gi)]
        .filter((match) => match[1] !== '4')
        // The guide compares us with "a sports bar with 40 screens".
        .filter((match) => match[1] !== '40')
        .map((match) => `${file}: ${match[0]}`)
    )
    expect(counts).toEqual([])
  })
})

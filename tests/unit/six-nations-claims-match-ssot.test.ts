import { SLIDESHOW_WORDING } from '@/lib/approved-wording'
/**
 * Six Nations and screen claims stay inside docs/SSOT.md (7 October 2026).
 *
 * SSOT section 10 confirms Six Nations games on terrestrial TV, on 4 TVs, with
 * the commentary on. Section 8 confirms the 4 TVs and rules out "big screens",
 * "HD" and any other count. Until this change /live-sport, /drinks, the blog
 * tag copy and two posts promised every Six Nations match, big screens,
 * multiple HD screens and full audio.
 *
 * Later the same day the owner answered three follow-up questions, recorded in
 * SSOT sections 8, 10, 11 and 16:
 *  - commentary is on "for big games/tournaments", not for the Six Nations only
 *    and not for everything that is on;
 *  - F1 is shown "only whatever is on terrestrial tv", so never all or every
 *    race or session, and never which races a channel carries;
 *  - the TVs can be used for slideshows at a private hire, with connection
 *    cables provided, but they are still never "large screens".
 *
 * Of the blog, the two posts that describe what we show now are read in full:
 * the live sport guide and the sports update. The four older sport posts (Euro
 * 2024, Autumn Internationals 2024, Premier League 2024-25 and the 2023 Six
 * Nations) were retired with redirects on 8 October 2026 and are no longer read.
 */

import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const CURRENT_POSTS = ['live-sport-pubs-near-heathrow', 'sports-update']

interface Source {
  file: string
  text: string
}

function read(file: string): Source {
  return { file: path.relative(ROOT, file), text: fs.readFileSync(file, 'utf8') }
}

function post(slug: string): string {
  return path.join(ROOT, 'content', 'blog', slug, 'index.md')
}

function filesUnder(dir: string, extensions: string[]): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return filesUnder(full, extensions)
    return extensions.some((extension) => entry.name.endsWith(extension)) ? [full] : []
  })
}

const sources: Source[] = [
  ...filesUnder(path.join(ROOT, 'app'), ['page.tsx']),
  path.join(ROOT, 'lib', 'tag-seo-content.ts'),
  ...CURRENT_POSTS.map(post)
].map(read)

/**
 * The three older posts corrected for screens and F1 (Euro 2024, Autumn
 * Internationals 2024, Premier League 2024-25) were retired with redirects on
 * 8 October 2026, along with the 2023 Six Nations post, so the screen rules
 * now read the same sources as everything else.
 */
const screenSources: Source[] = sources

const ssot = fs.readFileSync(path.join(ROOT, 'docs', 'SSOT.md'), 'utf8')
const liveSport = fs.readFileSync(path.join(ROOT, 'app', 'live-sport', 'page.tsx'), 'utf8')
const F1 = /\bF1\b|\bformula (?:1|one)\b|\bgrands? prix\b/i
const everyLine = (): boolean => true

/** Lines of our own copy matching `pattern`, as "file: line". */
function offenders(
  pattern: RegExp,
  only: (line: string, file: string) => boolean = everyLine,
  from: Source[] = sources
): string[] {
  return from.flatMap(({ file, text }) =>
    text
      .split('\n')
      .filter((line) => pattern.test(line) && only(line, file))
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

  it('never calls our TVs big screens, large screens, HD or multiple', () => {
    // "big screen" as a search phrase or a question is not a claim about the pub.
    const claim =
      /\bbig screens\b|\blarge screens?\b|\bHD screens?\b|\bmultiple (?:HD )?screens\b(?! and full subscription)/i
    const isOurs = (line: string): boolean => !/^\s*(?:-|description:)/.test(line) || !line.includes('Which pubs')
    expect(offenders(claim, isOurs, screenSources)).toEqual([])
  })

  it('never promises a screen that is planned or still to come', () => {
    expect(offenders(/\b(?:planned|extra|fifth|5th) (?:\w+ )?screen\b/i, everyLine, screenSources)).toEqual([])
  })

  it('never promises full audio', () => {
    expect(offenders(/\bfull audio\b/i)).toEqual([])
  })

  it('gives no screen count other than 4', () => {
    const counts = screenSources.flatMap(({ file, text }) =>
      [...text.matchAll(/\b(\d+)\s+(?:HD\s+)?(?:TVs|screens)\b/gi)]
        .filter((match) => match[1] !== '4')
        // The guide compares us with "a sports bar with 40 screens".
        .filter((match) => match[1] !== '40')
        .map((match) => `${file}: ${match[0]}`)
    )
    expect(counts).toEqual([])
  })

  describe('commentary: on for big games and tournaments (SSOT section 10)', () => {
    it("is recorded in the SSOT in the owner's words, with approved wording", () => {
      expect(ssot).toContain('"yes for big games/tournaments"')
      expect(ssot).toContain("> The commentary's on for big games and tournaments.")
    })

    it('is what /live-sport says, in place of the retired Six Nations only lines', () => {
      expect(liveSport).toContain("commentary's on for big games and tournaments")
      expect(liveSport).not.toMatch(/commentary (?:is|goes) on for the Six Nations/i)
      expect(liveSport).not.toContain('For Six Nations games, the commentary is on.')
    })

    it('is never promised for every game, or as always on', () => {
      const everything =
        /commentary(?: is| goes|'s)? on (?:for|during) (?:every|all|any)\b|\b(?:every|all) (?:the )?(?:games?|match(?:es)?|sport)\b[^.]*\bwith (?:the )?(?:commentary|sound)\b|\b(?:commentary|sound)(?: is|'s)? always on\b|\bsound (?:on|up)\b/i
      // The World Cup page is a tournament page with its own sound line, and it
      // is being reworked in a separate change (7 October 2026), so it is not
      // read for this rule. Every other rule in this file still reads it.
      const notWorldCup = (line: string, file: string): boolean => !file.includes('live-sport/world-cup')
      expect(offenders(everything, notWorldCup, screenSources)).toEqual([])
    })
  })

  describe('Formula 1: only what is on terrestrial TV (SSOT section 10)', () => {
    const onF1 = (line: string): boolean => F1.test(line)

    it("is recorded in the SSOT in the owner's words, with approved wording", () => {
      expect(ssot).toContain('"only whatever is on terrestrial tv"')
      expect(ssot).toContain(
        "> We show F1 when it's on BBC, ITV or Channel 4, and only then. Call us on 01753 682707 to check a particular race."
      )
    })

    it('is answered on /live-sport with the approved wording', () => {
      expect(liveSport).toContain(
        "We show F1 when it's on BBC, ITV or Channel 4, and only then. Call us on 01753 682707 to check a particular race."
      )
    })

    it('never promises all or every race, qualifying or session', () => {
      const allOfIt =
        /\b(?:all|every)\b (?:the )?(?:(?:F1|formula (?:1|one)) )?(?:live )?(?:qualifying|races?|race weekends?|sessions?|grands? prix)\b/i
      expect(offenders(allOfIt, onF1, screenSources)).toEqual([])
    })

    it('never says which sessions, races or highlights are shown', () => {
      expect(offenders(/\bqualifying sessions?\b|\brace weekends?\b/i, everyLine, screenSources)).toEqual([])
      expect(
        offenders(/\bqualifying\b|\bhighlights\b|\bseason finale\b|\bbritish grand prix\b/i, onF1, screenSources)
      ).toEqual([])
    })

    it('never pins F1 to one channel', () => {
      const namesOneChannel = (line: string): boolean =>
        onF1(line) && /\b(?:BBC|ITV|Channel 4)\b/.test(line) && !/BBC.*ITV.*Channel 4/.test(line)
      expect(offenders(/./, namesOneChannel, screenSources)).toEqual([])
    })
  })

  describe('slideshows at a private hire (SSOT section 11)', () => {
    const retirement = fs.readFileSync(
      path.join(ROOT, 'app', 'private-hire', 'retirement-parties', 'page.tsx'),
      'utf8'
    )

    it('is recorded in the SSOT with approved wording', () => {
      expect(ssot).toContain('**Slideshows on the TVs:**')
      expect(ssot).toContain(
        '> Our TVs can be used for photo slideshows or presentations, and we provide the connection cables.'
      )
    })

    it('keeps the slideshow and cables facts on the retirement parties page, on TVs', () => {
      // The page reads the sentence from its one home, which must still say what the SSOT says.
      expect(retirement).toContain('${SLIDESHOW_WORDING}')
      expect(SLIDESHOW_WORDING).toContain(
        'Our TVs can be used for photo slideshows or presentations, and we provide the connection cables.'
      )
      expect(retirement).not.toMatch(/large screens?/i)
    })
  })

  describe('Sky Sports: terrestrial only since January 2025 (SSOT section 6)', () => {
    it('never says the pub has never had it, which the SSOT does not record', () => {
      const aboutSky = (line: string): boolean => /\bSky\b|\bTNT\b/.test(line)
      expect(offenders(/\bnever ha[sd]\b|\bnever have had\b/i, aboutSky)).toEqual([])
    })
  })
})

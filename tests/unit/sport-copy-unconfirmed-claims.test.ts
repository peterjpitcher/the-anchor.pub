/**
 * Sport copy keeps to what docs/SSOT.md confirms (7 October 2026).
 *
 * A sibling of six-nations-claims-match-ssot.test.ts. That file guards the
 * Six Nations, the screens, the commentary and F1. This one guards four things
 * the owner asked to be removed on 7 October 2026 so they cannot come back:
 *
 *  - a promise to show every match, game or fixture. SSOT sections 6 and 10
 *    confirm only the games that are on BBC, ITV or Channel 4;
 *  - club rugby's top league and a paid streaming service, which /live-sport
 *    listed and the SSOT confirms nowhere;
 *  - "a TVs", a grammar slip left behind by an earlier find and replace in the
 *    private hire posts. SSOT section 11 says "TVs and sound system";
 *  - a tournament year, or a promise of fixtures and bookings, in the labels
 *    that link to the standing World Cup page.
 *
 * The 2023 Six Nations post, once left alone by owner instruction, was retired
 * with a redirect on 8 October 2026. The CheersAI feed code and its fixture data are not
 * read either: they are data about a tournament, not our copy.
 */

import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const BLOG = path.join(ROOT, 'content', 'blog')
// The four older sport posts (Euro 2024, Autumn Internationals 2024, Premier
// League 2024-25 and the 2023 Six Nations) were retired with redirects on
// 8 October 2026, so only the two posts that are still served are read.
const SPORT_POSTS = ['live-sport-pubs-near-heathrow', 'sports-update']

interface Source {
  file: string
  text: string
}

function read(file: string): Source {
  return { file: path.relative(ROOT, file), text: fs.readFileSync(file, 'utf8') }
}

function post(slug: string): string {
  return path.join(BLOG, slug, 'index.md')
}

function filesUnder(dir: string, extensions: string[]): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return filesUnder(full, extensions)
    return extensions.some((extension) => entry.name.endsWith(extension)) ? [full] : []
  })
}

const pages = filesUnder(path.join(ROOT, 'app'), ['page.tsx']).map(read)
const tagCopy = read(path.join(ROOT, 'lib', 'tag-seo-content.ts'))
const sportSources: Source[] = [...pages, tagCopy, ...SPORT_POSTS.map(post).map(read)]
const allPosts: Source[] = fs
  .readdirSync(BLOG, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(post(entry.name)))
  .map((entry) => read(post(entry.name)))

const liveSport = fs.readFileSync(path.join(ROOT, 'app', 'live-sport', 'page.tsx'), 'utf8')
const htmlSitemap = fs.readFileSync(path.join(ROOT, 'app', 'sitemap-page', 'page.tsx'), 'utf8')
const xmlSitemap = fs.readFileSync(path.join(ROOT, 'app', 'sitemap.ts'), 'utf8')

/** Lines matching `pattern`, as "file: line". */
function offenders(pattern: RegExp, from: Source[]): string[] {
  return from.flatMap(({ file, text }) =>
    text
      .split('\n')
      .filter((line) => pattern.test(line))
      .map((line) => `${file}: ${line.trim().slice(0, 140)}`)
  )
}

describe('sport copy keeps to what the SSOT confirms', () => {
  it('reads a sensible number of files', () => {
    expect(pages.length).toBeGreaterThan(100)
    expect(allPosts.length).toBeGreaterThan(50)
  })

  describe('no promise to show every match', () => {
    // "Showing every match", "watch all these fixtures", "every fixture we can
    // tune in", "Watch Every Match" and "Join Us for Every Premier League
    // Match" are promises. "Every match matters" and a bingo book that "covers
    // every game" are not, so the pattern wants a showing or watching word
    // first, or the promise shape itself.
    const promise = new RegExp(
      [
        String.raw`\b(?:show(?:s|ing|n)?|screen(?:s|ing|ed)?|watch(?:ing)?|catch|follow|covers?|join us for)\b[^.!?\n]{0,40}\b(?:every|each|all)\b (?:the |these |of the )?(?:single )?(?:[\w-]+ ){0,3}(?:match(?:es)?|games?|fixtures?)\b`,
        String.raw`\bevery (?:single )?(?:match|game|fixture) (?:live|shown|on)\b`,
        String.raw`\bnever miss a (?:match|game|fixture)\b`,
        String.raw`\b(?:complete|full) coverage\b`,
        String.raw`\ball the action\b`
      ].join('|'),
      'i'
    )
    // Honest lines the pattern would otherwise catch.
    const honest = /\bbingo\b|\bbooks?\b.*\bgames\b|shown on terrestrial TV/i

    it('catches the promises this change removed, and lets the honest lines through', () => {
      const removed = [
        "we're showing every match live on our 4 TVs.",
        "At The Anchor, we'll be showing every match with:",
        '## **Watch Every Match at The Anchor - Your Local Rugby Pub Near Heathrow**',
        '- **4 TVs** showing every match live',
        'Watch all these fixtures at The Anchor, your **sports pub near Heathrow Airport**:',
        'Our **sports pub near Heathrow** covers every free-to-air fixture we can tune in:',
        '### Never Miss a Match',
        '### Join Us for Every Premier League Match',
        '- **UEFA Euros** - Complete coverage',
        'The Anchor shows all the action on terrestrial TV.'
      ]
      removed.forEach((line) => expect(line).toMatch(promise))
      expect('Join us at The Anchor where every match matters and every fan is welcome.').not.toMatch(promise)
      expect("we're showing the games that are on BBC, ITV or Channel 4 on our 4 TVs.").not.toMatch(promise)
    })

    it('is made nowhere on the pages, the tag copy or the two sport posts', () => {
      const found = offenders(promise, sportSources).filter((line) => !honest.test(line))
      expect(found).toEqual([])
    })
  })

  describe('nothing the SSOT does not confirm on /live-sport', () => {
    it('does not list club rugby, which no section of the SSOT mentions', () => {
      expect(offenders(/\bpremiership rugby\b/i, sportSources)).toEqual([])
      expect(liveSport).not.toMatch(/premiership/i)
    })

    it('names no paid streaming service as a source of games', () => {
      expect(offenders(/\bamazon prime\b|\bprime video\b/i, sportSources)).toEqual([])
      expect(liveSport).not.toMatch(/amazon/i)
    })

    it('leaves the rugby card with a tidy list', () => {
      const card = liveSport.slice(liveSport.indexOf('>Rugby</h3>'), liveSport.indexOf('>Formula 1</h3>'))
      const items = [...card.matchAll(/<li>• ([^<]+)<\/li>/g)].map((match) => match[1])
      // The Six Nations and the Nations Championship are the two the SSOT holds (section 10).
      // "Autumn Internationals" and "World Cups" were on nobody's record (site review finding C2-010).
      expect(items).toEqual(['Six Nations', 'Nations Championship', "Only when they're on BBC, ITV or Channel 4"])
    })
  })

  describe('"a TVs" grammar slip (SSOT section 11: "TVs and sound system")', () => {
    it('is in no post, page or tag copy', () => {
      expect(offenders(/\ban? TVs\b/i, [...pages, tagCopy, ...allPosts])).toEqual([])
    })

    it('was not swapped for a screen size nobody has confirmed', () => {
      const hirePosts = allPosts.filter(({ text }) => /TVs and a sound system/.test(text))
      expect(hirePosts.length).toBeGreaterThanOrEqual(6)
      expect(offenders(/\b(?:large|big|HD) screens?\b/i, hirePosts)).toEqual([])
    })
  })

  describe('links to the standing World Cup page are year-neutral', () => {
    const labels = [
      ...[...liveSport.matchAll(/<Link href="\/live-sport\/world-cup">([^<]+)<\/Link>/g)].map((match) => match[1]),
      ...[...liveSport.matchAll(/<h2[^>]*>(World Cup[^<]*)<\/h2>/g)].map((match) => match[1]),
      ...[...htmlSitemap.matchAll(/label: '([^']+)', href: '\/live-sport\/world-cup'/g)].map((match) => match[1])
    ]

    it('finds the heading and link on /live-sport and the HTML sitemap label', () => {
      expect(labels).toHaveLength(3)
    })

    it('carries no year and promises no fixtures or bookings', () => {
      labels.forEach((label) => {
        expect(label).not.toMatch(/\d{4}/)
        expect(label).not.toMatch(/fixtures?|bookings?/i)
      })
    })

    it('no longer describes a fixture list and table bookings on /live-sport', () => {
      expect(liveSport).not.toContain('Full fixtures with UK kick-off times')
      expect(liveSport).toContain('We show World Cup games that are on BBC, ITV or Channel 4')
    })

    it('lists the World Cup page in the XML sitemap with a date no older than the 7 October 2026 rewrite', () => {
      // The date is no longer typed into app/sitemap.ts. It comes from git, by
      // way of config/sitemap-lastmod.json, so it can only move forward.
      expect(xmlSitemap).toContain("'/live-sport/world-cup',")
      const lastmod = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'sitemap-lastmod.json'), 'utf8'))
      expect(Date.parse(lastmod.routes['/live-sport/world-cup'])).toBeGreaterThanOrEqual(Date.parse('2026-10-07T00:00:00Z'))
    })
  })
})

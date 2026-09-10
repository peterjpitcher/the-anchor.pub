import fs from 'fs'
import path from 'path'

/**
 * SSOT pricing policy: our food and drink prices come live from the management menu API
 * and are never typed into copy. On 10 September 2026 fifteen posts still typed them out,
 * and most of the figures had gone stale ("Roast Beef Topside (£22)" against a live 18).
 * They now point to /food-menu, /sunday-roast or /private-hire instead.
 *
 * Posts may still quote other people's prices (airport restaurants, hotels, taxis, other
 * pubs) and our fixed figures that are not food or drink (deposits, quiz and bingo entry,
 * room hire by the hour). So a pound figure only counts when it is about us: the sentence
 * names The Anchor, says "our", "we" or "us", or names one of our dishes; the nearest
 * heading that names anyone names The Anchor; or it sits in a table row or column
 * labelled The Anchor. It is a tripwire for the ways prices were actually typed, not a
 * proof that no post can ever quote one.
 */

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

// Dated offer and event posts from 2023 to 2025, where the price is the point of the
// post. Whether to retire them is the owner's call (raised 10 September 2026), so they
// are left out rather than stripped.
const DATED_OFFER_POSTS = new Set([
  'botanist-gin-july-2025',
  'double-up-offer',
  'events-offers-2025',
  'prices-frozen-until-autumn-theanchor-pub',
  'rum-tasting-caribbean',
  'salami-day-pizza',
])

const POUND = /£\s?\d/
const US_BY_NAME = /\bthe anchor\b/i
const ABOUT_US = /\b(?:the anchor|our|we|we're|we've|we'll|us)\b/i
// Dishes only our menu brings up in these posts, so a price beside one is ours.
const OUR_DISHES =
  /stone-baked|wellington|topside|beef (?:and|&) ale|wild mushroom|ham hock|butternut|cannelloni|katsu|garden veg|jumbo sausage/i
// Figures we may state that are not food or drink prices: deposits (£250 for private
// hire), entry and prizes, room hire, bar tab limits, race night bets, parking and fares.
const FIXED_FIGURE =
  /deposit|£250\b|ulez|entry|per book|dauber|quiz|bingo|tasting|ticket|prize|jackpot|snowball|\btabs?\b|\bbets?\b|parking|per (?:day|week)|per hour|\/hr|room hire|taxi|uber|fare/i
// Somebody else's prices, or a general estimate rather than ours.
const THIRD_PARTY =
  /hotel|airport|airside|terminal|lounge|plane food|perfectionist|wagamama|nando|giraffe|\bpret\b|wetherspoon|sofitel|hilton|marriott|premier inn|radisson|novotel|crowne plaza|holiday inn|\bibis\b|three magpies|greene king|domino|pizza hut|pizza express|\bchain|high street|takeaway|deliveroo|just eat|uber eats|typical|anywhere from|elsewhere/i

interface Heading {
  level: number
  text: string
}

function nearestSays(headings: Heading[]): boolean {
  for (let i = headings.length - 1; i >= 0; i--) {
    if (US_BY_NAME.test(headings[i].text)) return true
    if (THIRD_PARTY.test(headings[i].text)) return false
  }
  return false
}

function findOurTypedPrices(markdown: string): string[] {
  const found: string[] = []
  const headings: Heading[] = []
  // A line that is bold and nothing else ("**At a pub (The Anchor):**") works as a
  // sub-heading. null means it names nobody, so the real headings decide.
  let boldLabel: boolean | null = null
  let tableHeader: string[] | null = null

  markdown.split('\n').forEach((raw, index) => {
    const line = raw.trim()
    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      const level = heading[1].length
      while (headings.length > 0 && headings[headings.length - 1].level >= level) headings.pop()
      headings.push({ level, text: heading[2] })
      boldLabel = null
      tableHeader = null
      return
    }
    if (/^\*\*[^*]+\*\*:?$/.test(line)) {
      boldLabel = US_BY_NAME.test(line) ? true : THIRD_PARTY.test(line) ? false : null
      tableHeader = null
      return
    }
    const sectionIsOurs = boldLabel ?? nearestSays(headings)
    const headingIsFixed = FIXED_FIGURE.test(headings[headings.length - 1]?.text ?? '')

    if (line.startsWith('|')) {
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
      if (tableHeader === null) {
        tableHeader = cells
        return
      }
      if (cells.every((cell) => /^:?-+:?$/.test(cell))) return
      const rowLabel = cells[0] ?? ''
      cells.forEach((cell, column) => {
        const columnLabel = tableHeader?.[column] ?? ''
        if (!POUND.test(cell) || headingIsFixed) return
        if ([cell, rowLabel, columnLabel].some((text) => FIXED_FIGURE.test(text))) return
        const ours =
          US_BY_NAME.test(columnLabel) ||
          US_BY_NAME.test(rowLabel) ||
          (sectionIsOurs && ![columnLabel, rowLabel, cell].some((text) => THIRD_PARTY.test(text)))
        if (ours) found.push(`${index + 1}: ${line}`)
      })
      return
    }
    tableHeader = null

    for (const sentence of line.split(/(?<=[.!?])\s+/)) {
      if (!POUND.test(sentence) || headingIsFixed) continue
      if (FIXED_FIGURE.test(sentence) || THIRD_PARTY.test(sentence)) continue
      if (ABOUT_US.test(sentence) || OUR_DISHES.test(sentence) || sectionIsOurs) {
        found.push(`${index + 1}: ${sentence}`)
      }
    }
  })

  return found
}

describe('findOurTypedPrices', () => {
  it('flags our prices however they were typed on 10 September 2026', () => {
    expect(findOurTypedPrices('## 1. The Anchor, Stanwell Moor\n\n- **Roast Beef Topside** (£22), carved fresh')).toHaveLength(1)
    expect(findOurTypedPrices('## What The Anchor Offers\n\n### Highlights\n\n- **Margherita pizza**, from £13')).toHaveLength(1)
    expect(findOurTypedPrices('At The Anchor, stone-baked pizzas start at £13 for 12-inch bases.')).toHaveLength(1)
    expect(findOurTypedPrices('| Pub | Price |\n|---|---|\n| **The Anchor** (Stanwell Moor) | From £13 |')).toHaveLength(1)
    expect(findOurTypedPrices('| Venue | Cost |\n|---|---|\n| Local pub (e.g. The Anchor) | £35--50 |')).toHaveLength(1)
    expect(findOurTypedPrices('**At a pub (The Anchor):**\n\n| Item | Cost |\n|---|---|\n| **Total** | **approximately £725** |')).toHaveLength(1)
    expect(findOurTypedPrices('No. We operate on a quote-on-enquiry model, between £500 and £1,500.')).toHaveLength(1)
    expect(findOurTypedPrices("Completely. We're family-friendly, with a kids' menu from £8.00 per head.")).toHaveLength(1)
    expect(findOurTypedPrices('**Working Lunch Menu:**\n- **Stone-baked pizzas** from £13')).toHaveLength(1)
  })

  it('leaves prices that are not ours, and our fixed figures, alone', () => {
    expect(findOurTypedPrices('Hotel restaurants typically charge £15--25 for parking.')).toEqual([])
    expect(findOurTypedPrices('Groups of 15 or more take a £10 per person deposit.')).toEqual([])
    expect(findOurTypedPrices('## Quiz night at The Anchor\n\nEntry is £3 a head.')).toEqual([])
    expect(findOurTypedPrices('| Meal | Heathrow Airport | The Anchor |\n|---|---|---|\n| Burger | £18--22 | Live menu |')).toEqual([])
    expect(findOurTypedPrices('## 2. The White Horse, Shere\n\nExpect to pay around £18-24 for a main.')).toEqual([])
    expect(findOurTypedPrices('| Pub | Entry | Prize |\n|---|---|---|\n| **The Anchor** | £3 pp | £25 bar tab |')).toEqual([])
    expect(findOurTypedPrices('At The Anchor, it is £250, and you confirm numbers closer to the date.')).toEqual([])
    expect(findOurTypedPrices('### Our Simple Tab Policy\n\nYou have 7 days or £50 to settle.')).toEqual([])
  })
})

describe('blog posts do not type out our prices', () => {
  const posts = fs
    .readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(BLOG_DIR, entry.name, 'index.md')))
    .map((entry) => entry.name)

  it('reads every post', () => {
    // Guards the guard: a walk that found nothing would pass everything below.
    expect(posts.length).toBeGreaterThan(100)
  })

  it('finds none of our food or drink prices typed into a post', () => {
    const offenders = posts
      .filter((slug) => !DATED_OFFER_POSTS.has(slug))
      .flatMap((slug) =>
        findOurTypedPrices(fs.readFileSync(path.join(BLOG_DIR, slug, 'index.md'), 'utf8')).map(
          (hit) => `${slug}:${hit}`,
        ),
      )
    expect(offenders).toEqual([])
  })
})

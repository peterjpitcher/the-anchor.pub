// eslint-disable-next-line @typescript-eslint/no-var-requires
const audit = require('../../scripts/audit-a11y.js')

// Nothing is imported here, so say this file is a module: without it TypeScript
// reads `audit` as a global and it collides with another test's.
export {}

/**
 * The accessibility audit has to see content that is cut off at the edge of a
 * narrow screen.
 *
 * `scripts/audit-a11y.js` used to narrow each page to 320px and ask the root
 * element whether it scrolled sideways. It never does: `app/globals.css` gives
 * `<html>` and `<body>` `overflow-x: hidden`, so anything too wide is clipped by
 * `<body>` and adds nothing to the root's scroll width. On 6 October 2026 the audit
 * passed /blog/best-sunday-roast-surrey with a comparison table 856px wide and four
 * of its seven columns out of reach, and said "no reflow problems" about eight pages
 * that each had something cut off.
 *
 * The audit now measures every box and every run of text against the edge of the
 * viewport. That needs a real browser and CI has none, so the measuring is done by
 * hand against production builds. What CI can hold on to is the rule that decides
 * what is cut off and what is meant to be where it is. The first block plays a
 * document to that rule, one kind of thing at a time; the second plays a page to the
 * pass, and holds the one the old measurement let through; the last is the line the
 * report prints.
 */

const { REFLOW_WIDTH, lookForCutOff, checkReflow, describeCutOff } = audit as {
  REFLOW_WIDTH: number
  lookForCutOff: () => CutOff[]
  checkReflow: (page: FakePage) => Promise<CutOff[]>
  describeCutOff: (problem: { pathname: string; cutOff: CutOff[] }) => string
}

type CutOff = { what: string; by: number }
type FakePage = ReturnType<typeof fakePage>
type Edges = { left: number; right: number }
type Thing = Edges & {
  tag?: string
  inside?: HTMLElement
  position?: string
  overflowX?: string
  visibility?: string
  textOverflow?: string
  label?: string
  text?: string
  height?: number
}

const viewport = { width: REFLOW_WIDTH }
const root = document.documentElement
const textRuns = new WeakMap<Node, Edges[]>()

const boxOf = ({ left, right }: Edges, height = 40) => ({
  left, right, width: right - left, top: 0, bottom: height, height, x: left, y: 0, toJSON: () => ({}),
})

/**
 * jsdom has no layout and no stylesheet, so each element is told where it sits and
 * how it is styled. The styles are the ones a browser computes when nothing sets them.
 */
function add({
  tag = 'div', inside = document.body, left, right, height = 40,
  position = 'static', overflowX = 'visible', visibility = 'visible', textOverflow = 'clip',
  label, text,
}: Thing): HTMLElement {
  const el = document.createElement(tag)
  Object.assign(el.style, { position, overflowX, visibility, textOverflow })
  if (label) el.setAttribute('aria-label', label)
  if (text) el.textContent = text
  el.getBoundingClientRect = () => boxOf({ left, right }, height)
  inside.appendChild(el)
  return el
}

/** A run of text, and where its line sits. Text has no box of its own to ask. */
function say(inside: HTMLElement, text: string, line: Edges) {
  const node = document.createTextNode(text)
  textRuns.set(node, [line])
  inside.appendChild(node)
}

beforeAll(() => {
  // What a browser reports while <body> clips: the root is as wide as the screen
  // and no wider, whatever is on the page.
  Object.defineProperty(root, 'clientWidth', { configurable: true, get: () => viewport.width })
  Object.defineProperty(root, 'scrollWidth', { configurable: true, get: () => viewport.width })
  Range.prototype.getClientRects = function (this: Range) {
    return (textRuns.get(this.startContainer) ?? []).map((line) => boxOf(line, 20))
  } as unknown as Range['getClientRects']
})

beforeEach(() => {
  document.body.innerHTML = ''
  viewport.width = REFLOW_WIDTH
})

describe('what the audit takes for cut off', () => {
  it('finds a box that runs past the edge of the screen, and says by how much', () => {
    add({ tag: 'table', left: 16, right: 872, text: 'Pub Location Price Range' })

    expect(lookForCutOff()).toEqual([{ what: '<table> "Pub Location Price Range"', by: 552 }])
  })

  it('finds nothing on a page where everything fits', () => {
    const section = add({ left: 0, right: 320 })
    add({ tag: 'p', inside: section, left: 16, right: 304, text: 'Sunday roast, 1pm to 6pm' })

    expect(lookForCutOff()).toEqual([])
  })

  it('allows two pixels for rounding, as the old measurement did', () => {
    add({ left: 16, right: 322 })
    expect(lookForCutOff()).toEqual([])

    add({ tag: 'a', left: 16, right: 323, text: 'Book' })
    expect(lookForCutOff()).toEqual([{ what: '<a> "Book"', by: 3 }])
  })

  it('reports a wide thing once, under the outermost box, not once for every cell in it', () => {
    const table = add({ tag: 'table', left: 16, right: 872, label: 'Roast comparison' })
    const row = add({ tag: 'tr', inside: table, left: 16, right: 872 })
    add({ tag: 'td', inside: row, left: 400, right: 520, text: 'Parking' })
    add({ tag: 'td', inside: row, left: 520, right: 872, text: 'Dog friendly' })

    expect(lookForCutOff()).toEqual([{ what: '<table> "Roast comparison"', by: 552 }])
  })

  it('names a thing by its label, then its alt text, then its words, then its tag alone', () => {
    add({ tag: 'a', left: 306, right: 354, label: 'WhatsApp The Anchor', text: 'icon' })
    const image = add({ tag: 'img', left: 16, right: 416 })
    image.setAttribute('alt', 'The beer garden')
    add({ tag: 'p', left: 16, right: 400, text: '  Free parking,\n   20 spaces  ' })
    add({ tag: 'iframe', left: 16, right: 616 })

    expect(lookForCutOff().map(({ what }) => what)).toEqual([
      '<a> "WhatsApp The Anchor"',
      '<img> "The beer garden"',
      '<p> "Free parking, 20 spaces"',
      '<iframe>',
    ])
  })

  describe('what is meant to be past the edge', () => {
    it('leaves out what is not painted', () => {
      add({ left: 16, right: 600, visibility: 'hidden' })
      add({ left: 16, right: 600, height: 0 })
      add({ left: 400, right: 400 })

      expect(lookForCutOff()).toEqual([])
    })

    it.each(['auto', 'scroll'])('leaves out what sits in a box that scrolls sideways (overflow-x: %s): the rest can be reached', (overflowX) => {
      // The price table on /private-hire, the facts strip on an event page.
      const scroller = add({ left: 16, right: 304, overflowX })
      const table = add({ tag: 'table', inside: scroller, left: 16, right: 408 })
      add({ tag: 'td', inside: table, left: 330, right: 408, text: 'Rate' })

      expect(lookForCutOff()).toEqual([])
    })

    it('leaves out the slides a carousel keeps beside its window, and everything on them', () => {
      const frame = add({ left: 16, right: 304, overflowX: 'hidden' })
      const track = add({ inside: frame, left: 16, right: 304 })
      add({ inside: track, left: 16, right: 304, text: 'Lovely food' })
      const waiting = add({ inside: track, left: 304, right: 592 })
      add({ tag: 'p', inside: waiting, left: 320, right: 576, text: 'Great quiz night' })
      add({ inside: track, left: 592, right: 880, text: 'Friendly staff' })

      expect(lookForCutOff()).toEqual([])
    })

    it('does not leave out a thing just because a box clips it: part showing and part cut is cut off', () => {
      // The hero on most pages is `overflow-hidden`. A pill in it that is too wide
      // for the screen is cut by the hero, not by <body>, and is cut all the same.
      const hero = add({ tag: 'section', left: 0, right: 320, overflowX: 'hidden' })
      add({ tag: 'span', inside: hero, left: 16, right: 328, text: '15 mins drive from Slough Cemetery' })

      expect(lookForCutOff()).toEqual([{ what: '<span> "15 mins drive from Slough Cemetery"', by: 8 }])
    })

    it('leaves out text kept in a one-pixel box for screen readers', () => {
      const button = add({ tag: 'a', left: 250, right: 298 })
      const srOnly = add({ tag: 'span', inside: button, left: 273, right: 274, height: 1, position: 'absolute', overflowX: 'hidden' })
      say(srOnly, 'View menu', { left: 273, right: 372 })

      expect(lookForCutOff()).toEqual([])
    })

    it('leaves out text a box shortens with an ellipsis: somebody decided that', () => {
      const name = add({ tag: 'p', left: 80, right: 304, overflowX: 'hidden', textOverflow: 'ellipsis' })
      say(name, 'The Anchor Charity Christmas Quiz and Raffle Night', { left: 80, right: 470 })

      expect(lookForCutOff()).toEqual([])
    })

    it.each(['fixed', 'absolute'])('leaves out a closed drawer parked beside the screen (%s), and everything in it', (position) => {
      const drawer = add({ left: 320, right: 640, position, label: 'Event Cost Estimator' })
      add({ tag: 'button', inside: drawer, left: 336, right: 624, text: 'Get an estimate' })
      say(drawer, 'Tell us about your event', { left: 336, right: 624 })

      expect(lookForCutOff()).toEqual([])
    })

    it('does not take a button that has run off the end of its row for parked', () => {
      // The sticky bar on /private-hire, 6 October 2026: the bar fits the screen and
      // its last two buttons sat wholly past the edge of it. Nothing positioned them
      // there. They ran out of room.
      const bar = add({ left: 0, right: 320, position: 'fixed' })
      const row = add({ inside: bar, left: 16, right: 304 })
      add({ tag: 'a', inside: row, left: 16, right: 258, text: 'Enquire about your date' })
      add({ tag: 'a', inside: row, left: 270, right: 318, label: 'View menu' })
      add({ tag: 'a', inside: row, left: 330, right: 378, label: 'Call The Anchor' })
      add({ tag: 'a', inside: row, left: 390, right: 438, label: 'WhatsApp The Anchor' })

      expect(lookForCutOff()).toEqual([
        { what: '<a> "Call The Anchor"', by: 58 },
        { what: '<a> "WhatsApp The Anchor"', by: 118 },
      ])
    })

    it('does not take a drawer that has started onto the screen for parked', () => {
      add({ left: 200, right: 520, position: 'fixed', label: 'Event Cost Estimator' })

      expect(lookForCutOff()).toEqual([{ what: '<div> "Event Cost Estimator"', by: 200 }])
    })
  })

  describe('which boxes can clip or scroll a thing', () => {
    it('does not let a box hide or scroll a fixed thing: a fixed thing is laid out against the screen', () => {
      const frame = add({ left: 16, right: 200, overflowX: 'hidden' })
      add({ tag: 'a', inside: frame, left: 220, right: 360, position: 'fixed', text: 'Book a table' })
      const scroller = add({ left: 16, right: 304, overflowX: 'auto' })
      add({ tag: 'a', inside: scroller, left: 280, right: 360, position: 'fixed', text: 'Call us' })

      expect(lookForCutOff().map(({ what }) => what)).toEqual(['<a> "Book a table"', '<a> "Call us"'])
    })

    it('does not let a static box hide an absolute thing inside it, but lets a positioned one', () => {
      const plain = add({ left: 16, right: 200, overflowX: 'hidden' })
      add({ tag: 'span', inside: plain, left: 220, right: 360, position: 'absolute', text: 'New' })
      const positioned = add({ left: 16, right: 200, overflowX: 'hidden', position: 'relative' })
      add({ tag: 'span', inside: positioned, left: 220, right: 360, position: 'absolute', text: 'Sale' })

      expect(lookForCutOff().map(({ what }) => what)).toEqual(['<span> "New"'])
    })

    it('still lets a box further up hide a thing that the nearer boxes do not', () => {
      const frame = add({ left: 16, right: 304, overflowX: 'hidden' })
      const slide = add({ inside: frame, left: 304, right: 592 })
      const card = add({ inside: slide, left: 320, right: 576, overflowX: 'hidden' })
      add({ tag: 'p', inside: card, left: 336, right: 560, text: 'Great quiz night' })

      expect(lookForCutOff()).toEqual([])
    })
  })

  describe('text', () => {
    it('finds text that runs out of a box that fits: a long address in a narrow paragraph', () => {
      const paragraph = add({ tag: 'p', left: 16, right: 304 })
      say(paragraph, 'https://www.the-anchor.pub/private-hire/near/slough-crematorium', { left: 16, right: 498 })

      // Named by its first forty characters.
      expect(lookForCutOff()).toEqual([{ what: 'text "https://www.the-anchor.pub/private-hire/"', by: 178 }])
    })

    it('says nothing more about the text in a box it has already reported', () => {
      const link = add({ tag: 'a', left: 16, right: 485 })
      say(link, 'Get Directions from Slough Cemetery', { left: 40, right: 461 })

      expect(lookForCutOff()).toEqual([{ what: '<a> "Get Directions from Slough Cemetery"', by: 165 }])
    })

    it('leaves out text that is not painted', () => {
      const hidden = add({ tag: 'p', left: 16, right: 304, visibility: 'hidden' })
      say(hidden, 'manager@the-anchor.pub', { left: 16, right: 400 })

      expect(lookForCutOff()).toEqual([])
    })
  })

  describe('a page that is still moving', () => {
    const doc = document as unknown as { getAnimations?: () => Array<{ finish: () => void }> }

    afterEach(() => {
      delete doc.getAnimations
    })

    it('puts a carousel at rest before it measures: a slide on its way in is part shown', () => {
      // The reviews carousel moves every five seconds for half a second. Caught in
      // that half second without this, it was reported 18 times in 20.
      const frame = add({ left: 16, right: 304, overflowX: 'hidden' })
      const arriving = add({ inside: frame, left: 0, right: 0, text: 'Great quiz night' })
      let slid = 120
      arriving.getBoundingClientRect = () => boxOf({ left: 304 - slid, right: 592 - slid })
      doc.getAnimations = () => [{ finish: () => { slid = 288 } }]

      expect(lookForCutOff()).toEqual([])
      expect(arriving.getBoundingClientRect().right).toBe(304)
    })

    it('is not stopped by an animation that never ends, which has no end to go to', () => {
      add({ tag: 'table', left: 16, right: 872 })
      doc.getAnimations = () => [{
        finish: () => {
          throw new Error('InvalidStateError: cannot finish an infinite animation')
        },
      }]

      expect(lookForCutOff()).toEqual([{ what: '<table>', by: 552 }])
    })
  })
})

/** A stand-in for the browser page: it narrows the viewport and runs the look in this document. */
function fakePage() {
  const calls: string[] = []
  return {
    calls,
    setViewportSize: async ({ width }: { width: number; height: number }) => {
      calls.push(`narrow to ${width}`)
      viewport.width = width
    },
    waitForTimeout: async () => {
      calls.push('wait')
    },
    evaluate: async <T,>(look: () => T): Promise<T> => {
      calls.push('look')
      return look()
    },
  }
}

describe('the pass that checks a page for reflow', () => {
  beforeEach(() => {
    viewport.width = 1280
  })

  it('narrows the page to 320px, the width WCAG 1.4.10 names, before it looks', async () => {
    const page = fakePage()

    await checkReflow(page)

    expect(REFLOW_WIDTH).toBe(320)
    expect(page.calls).toEqual(['narrow to 320', 'wait', 'look'])
  })

  it('finds the table the old measurement passed: the 6 October miss', async () => {
    add({ tag: 'table', left: 16, right: 872, text: 'Pub Location Price Range' })

    const cutOff = await checkReflow(fakePage())

    // What the audit used to ask, and the answer it got on every page: <body> clips
    // the table, so the root never grows. More than 2 was a failure. This is 0.
    expect(root.scrollWidth - root.clientWidth).toBe(0)
    expect(cutOff).toEqual([{ what: '<table> "Pub Location Price Range"', by: 552 }])
  })

  it('finds nothing on a page that reflows: its boxes narrow with the screen', async () => {
    const paragraph = add({ tag: 'p', left: 0, right: 0, text: 'Sunday roast, 1pm to 6pm' })
    paragraph.getBoundingClientRect = () => boxOf({ left: 16, right: viewport.width - 16 })

    expect(await checkReflow(fakePage())).toEqual([])
  })
})

describe('the line the report prints for a page', () => {
  it('names the page and everything cut off on it, with how far', () => {
    const line = describeCutOff({
      pathname: '/private-hire',
      cutOff: [
        { what: '<form> "Short private hire enquiry"', by: 46 },
        { what: '<a> "WhatsApp The Anchor"', by: 118 },
      ],
    })

    expect(line).toBe('/private-hire  <form> "Short private hire enquiry" by 46px; <a> "WhatsApp The Anchor" by 118px')
  })
})

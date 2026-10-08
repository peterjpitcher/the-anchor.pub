export {}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const audit = require('../../scripts/audit-a11y.js')

const {
  auditTimedPopup,
  checkPopupKeyboard,
  whereIsFocus,
  popupDialogProblem,
  giveFocusAHome,
  focusIsHome,
  nothingMarked,
  focusedControlIsOnTop,
  POPUP_MARK,
  POPUP_TAB_PRESSES,
  PHONE,
  NOT_FOUND_PAGE,
  PAGES,
} = audit

/**
 * The audit's keyboard check on a timed pop-up, added 8 October 2026.
 *
 * Until then the audit said of itself: 'Not checked on the pop-up: where focus
 * goes, and whether Escape closes it.' The Christmas pop-up took no focus and
 * let Tab walk the page behind it, and the audit passed it (site review AX-002
 * and AX-021, 7 October 2026). These specs hold the check to the four things it
 * is there to notice. No browser: the page is a fake that answers each in-page
 * question by which question it is.
 */
type Answers = {
  /** Where focus is at the first look, then after each press of Tab. */
  focus: Array<{ inside: boolean; name: string }>
  dialogProblem?: string
  closesOnEscape?: boolean
  focusGoesHome?: boolean
}

function fakePage({ focus, dialogProblem = '', closesOnEscape = true, focusGoesHome = true }: Answers) {
  const keys: string[] = []
  let looks = 0
  return {
    keys,
    waitForTimeout: async () => undefined,
    keyboard: {
      press: async (key: string) => {
        keys.push(key)
      },
    },
    evaluate: async (question: unknown) => {
      if (question === whereIsFocus) {
        const answer = focus[Math.min(looks, focus.length - 1)]
        looks += 1
        return answer
      }
      if (question === popupDialogProblem) return dialogProblem
      if (question === focusIsHome) return focusGoesHome
      throw new Error('an in-page question the fake does not know')
    },
    waitForFunction: async (question: unknown) => {
      if (question !== nothingMarked) throw new Error('waited for something the fake does not know')
      if (!closesOnEscape) throw new Error('Timeout 3000ms exceeded')
    },
  }
}

const inside = (name: string) => ({ inside: true, name })
const outside = (name: string) => ({ inside: false, name })

describe('the keyboard check on a timed pop-up', () => {
  it('finds nothing wrong with a pop-up that takes focus, keeps Tab, is named, closes and hands focus back', async () => {
    const page = fakePage({ focus: [inside('Close modal')] })

    expect(await checkPopupKeyboard(page)).toEqual([])
    expect(page.keys).toEqual([...Array(POPUP_TAB_PRESSES).fill('Tab'), 'Escape'])
  })

  it('reports a pop-up that opens without taking focus, and every press of Tab that stays behind it', async () => {
    // What the Christmas pop-up did before it was rebuilt on the shared Modal.
    const page = fakePage({ focus: [outside('Airport parking')], dialogProblem: 'no element with role="dialog"' })

    expect(await checkPopupKeyboard(page)).toEqual([
      'focus did not move into the pop-up when it opened (it is on "Airport parking")',
      `Tab left the pop-up ${POPUP_TAB_PRESSES} time(s) in ${POPUP_TAB_PRESSES} presses (reached "Airport parking")`,
      'the pop-up is not announced: no element with role="dialog"',
    ])
  })

  it('reports a single press of Tab that gets out', async () => {
    const page = fakePage({ focus: [inside('Close modal'), inside('View Festive Packages'), inside('No thanks'), outside('Food'), inside('Close modal')] })

    expect(await checkPopupKeyboard(page)).toEqual([
      `Tab left the pop-up 1 time(s) in ${POPUP_TAB_PRESSES} presses (reached "Food")`,
    ])
  })

  it('reports a pop-up Escape does not close, and stops there', async () => {
    const page = fakePage({ focus: [inside('Close modal')], closesOnEscape: false, focusGoesHome: false })

    expect(await checkPopupKeyboard(page)).toEqual(['Escape did not close the pop-up'])
  })

  it('reports focus that is not handed back when the pop-up closes', async () => {
    const page = fakePage({ focus: [inside('Close modal')], focusGoesHome: false })

    expect(await checkPopupKeyboard(page)).toEqual(['focus did not go back to where it was when the pop-up closed'])
  })
})

describe('the in-page questions, asked of a real document', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('tells focus inside the pop-up from focus behind it', () => {
    document.body.innerHTML = `
      <a href="/heathrow-parking">Airport parking</a>
      <div ${POPUP_MARK}><div role="dialog" aria-modal="true" aria-labelledby="t"><h2 id="t">Christmas 2026</h2><button aria-label="Close modal"></button></div></div>`

    document.querySelector('a')?.focus()
    expect(whereIsFocus(POPUP_MARK)).toEqual({ inside: false, name: 'Airport parking' })
    document.querySelector('button')?.focus()
    expect(whereIsFocus(POPUP_MARK)).toEqual({ inside: true, name: 'Close modal' })
  })

  it.each([
    ['<div>Christmas 2026</div>', 'no element with role="dialog"'],
    ['<div role="dialog">Christmas 2026</div>', 'the dialog has no aria-modal="true"'],
    ['<div role="dialog" aria-modal="true">Christmas 2026</div>', 'the dialog has no name'],
    // Pointing at an id that is not in the page is no name at all (AX-015).
    ['<div role="dialog" aria-modal="true" aria-labelledby="missing">Christmas 2026</div>', 'the dialog has no name'],
    ['<div role="dialog" aria-modal="true" aria-labelledby="t"><h2 id="t">Christmas 2026</h2></div>', ''],
    ['<div role="dialog" aria-modal="true" aria-label="Christmas 2026"></div>', ''],
  ])('says whether %s would be announced', (html, problem) => {
    document.body.innerHTML = `<div ${POPUP_MARK}>${html}</div>`
    expect(popupDialogProblem(POPUP_MARK)).toBe(problem)
  })

  it('gives focus a home that is not the hidden skip link, and knows when focus is back there', () => {
    document.body.innerHTML = '<a class="sr-only" href="#main-content">Skip</a><a href="/">Home</a><button>Other</button>'

    giveFocusAHome('data-home')
    expect(document.activeElement?.textContent).toBe('Home')
    expect(focusIsHome('data-home')).toBe(true)

    document.querySelector('button')?.focus()
    expect(focusIsHome('data-home')).toBe(false)
  })

  it('knows the pop-up has gone once nothing carries its mark', () => {
    document.body.innerHTML = `<div ${POPUP_MARK}></div>`
    expect(nothingMarked(POPUP_MARK)).toBe(false)
    document.body.innerHTML = ''
    expect(nothingMarked(POPUP_MARK)).toBe(true)
  })

  it('reports nothing focused as covered, so a skip link that never takes focus cannot pass', () => {
    expect(focusedControlIsOnTop()).toEqual({ name: 'nothing', hits: 0, of: 5 })
  })
})

describe('the timed pop-up pass and the keyboard', () => {
  function fakeBrowser() {
    const questions: unknown[] = []
    let looks = 0
    const page = {
      goto: async () => ({ status: () => 200 }),
      evaluate: async (question: unknown) => {
        questions.push(question)
        if (question === whereIsFocus) return { inside: true, name: 'Close modal' }
        if (question === popupDialogProblem) return ''
        if (question === focusIsHome) return false
        if (question === giveFocusAHome) return undefined
        // lookForPopup: nothing at the first look, the pop-up at the second.
        looks += 1
        return looks === 1 ? null : { heading: 'Christmas 2026', shown: true }
      },
      waitForFunction: async () => undefined,
      waitForTimeout: async () => undefined,
      keyboard: { press: async () => undefined },
    }
    const browser = { newContext: async () => ({ newPage: async () => page, close: async () => undefined }) }
    class AxeBuilder {
      include() {
        return this
      }
      withTags() {
        return this
      }
      async analyze() {
        return { violations: [], incomplete: [] }
      }
    }
    return { browser, AxeBuilder, questions }
  }

  it('files what the keyboard check finds under the pop-up, for a caller that keeps a keyboard list', async () => {
    const fake = fakeBrowser()
    const keyboardProblems: Array<{ pathname: string; issue: string }> = []

    await auditTimedPopup(fake.browser, fake.AxeBuilder, { violations: [], incomplete: [], keyboardProblems })

    expect(fake.questions).toContain(giveFocusAHome)
    expect(keyboardProblems).toEqual([
      { pathname: '/heathrow-parking pop-up', issue: 'focus did not go back to where it was when the pop-up closed' },
    ])
  })

  it('leaves the keyboard alone for a caller that keeps none', async () => {
    const fake = fakeBrowser()

    await auditTimedPopup(fake.browser, fake.AxeBuilder, { violations: [], incomplete: [] })

    expect(fake.questions).not.toContain(giveFocusAHome)
    expect(fake.questions).not.toContain(whereIsFocus)
  })
})

describe('what else the audit looks at', () => {
  it('opens every page again at a phone width', () => {
    expect(PHONE).toEqual({ width: 390, height: 844 })
    expect(PAGES.length).toBeGreaterThan(10)
  })

  it('asks for a page that cannot exist, to see the not-found template', () => {
    expect(NOT_FOUND_PAGE).toMatch(/^\/a11y-audit-/)
    expect(PAGES.map(([pathname]: [string]) => pathname)).not.toContain(NOT_FOUND_PAGE)
  })
})

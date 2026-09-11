/**
 * /quiz-night/themed must book the themed quiz, and must never advertise one
 * that has already happened.
 *
 * On 11 September 2026 all three booking buttons on the page were
 * BookTableButton, which goes to /book-table, the dining wizard. The only route
 * to the Only Fools and Horses booking form was a text link. The closing band
 * said "Next one is Only Fools and Horses" and "Friday 25 September" in fixed
 * text, so from the 26th it would have advertised a finished night. The
 * upcoming split used `setHours(0, 0, 0, 0)` on the server's clock, which is
 * UTC on Vercel, so a finished night still counted as today for the first hour
 * after midnight in British Summer Time.
 */
import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { render, screen, within } from '@testing-library/react'
import { anchorAPI } from '@/lib/api/client'

// /quiz-night reads its own dates; they are not what this suite is about, and
// an unmocked read would reach the live management API.
jest.mock('@/lib/game-nights', () => ({
  ...jest.requireActual('@/lib/game-nights'),
  readGameNightEvents: async () => ({ status: 'ok', events: [] })
}))

import ThemedQuizNightsPage from '@/app/quiz-night/themed/page'
import QuizNightPage from '@/app/quiz-night/page'
import WhatsOnPage from '@/app/whats-on/page'
import { RegularEventCard } from '@/app/whats-on/_components/RegularEventCard'

const OFAH_BOOKING = '/events/pub-quiz-lovely-jubbly-only-fools-and-horses-quiz-night-2026-09-25#event-booking'
const MONTHLY_QUIZ_BOOKING = '/quiz-night#book'

function renderAt(instant: string) {
  jest.useFakeTimers().setSystemTime(new Date(instant))
  return render(ThemedQuizNightsPage())
}

afterEach(() => {
  jest.useRealTimers()
})

describe('before the Only Fools and Horses night', () => {
  it('points every booking button at that night’s own booking form', () => {
    renderAt('2026-09-11T11:00:00Z')

    const buttons = screen.getAllByRole('link', { name: 'Book the Only Fools and Horses quiz' })
    // Hero, body and closing band.
    expect(buttons).toHaveLength(3)
    for (const button of buttons) expect(button).toHaveAttribute('href', OFAH_BOOKING)
  })

  it('never sends anyone to the table-booking wizard', () => {
    const { container } = renderAt('2026-09-11T11:00:00Z')

    expect(screen.queryByRole('button', { name: /book a table/i })).not.toBeInTheDocument()
    expect(container.querySelector('a[href^="/book-table"]')).toBeNull()
  })

  it('names the next night and its date in the closing band', () => {
    renderAt('2026-09-11T11:00:00Z')

    const heading = screen.getByRole('heading', { name: 'Next one is Only Fools and Horses' })
    const band = heading.closest('section') ?? heading.parentElement!
    expect(within(band).getByText(/Friday 25 September 2026, £3 a player/)).toBeInTheDocument()
  })

  it('still counts the night as coming up in its first hour, London time', () => {
    // 00:30 on 25 September in London is still 24 September in UTC.
    renderAt('2026-09-24T23:30:00Z')

    expect(screen.getByRole('heading', { name: 'Next one is Only Fools and Horses' })).toBeInTheDocument()
  })
})

describe('once the night has passed', () => {
  // 00:30 on 26 September in London is still 25 September in UTC, which is
  // the hour the server clock used to get wrong.
  const JUST_AFTER = '2026-09-25T23:30:00Z'

  it('says nothing dated in the closing band', () => {
    renderAt(JUST_AFTER)

    expect(screen.queryByRole('heading', { name: /^Next one is/ })).not.toBeInTheDocument()
    const heading = screen.getByRole('heading', { name: 'Fancy the monthly quiz instead?' })
    const band = heading.closest('section') ?? heading.parentElement!
    expect(band.textContent).not.toMatch(/September|Only Fools/)
  })

  it('books the monthly quiz instead', () => {
    renderAt(JUST_AFTER)

    const buttons = screen.getAllByRole('link', { name: 'Book the monthly quiz' })
    expect(buttons).toHaveLength(3)
    for (const button of buttons) expect(button).toHaveAttribute('href', MONTHLY_QUIZ_BOOKING)
    expect(screen.queryByRole('link', { name: /Only Fools and Horses quiz$/ })).not.toBeInTheDocument()
  })

  it('moves the night into the themes we have run', () => {
    renderAt(JUST_AFTER)

    expect(screen.queryByRole('heading', { name: 'Coming up' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nothing themed booked in just yet' })).toBeInTheDocument()
  })
})

describe('/quiz-night', () => {
  it('links the themed page without naming a night it cannot tell has passed', async () => {
    const serialised = JSON.stringify(await QuizNightPage(), (_key, value) =>
      isValidElement(value) ? value.props : value
    )

    expect(serialised).toContain('/quiz-night/themed')
    expect(serialised).not.toMatch(/25 September|Only Fools/)
  })
})

describe('/whats-on links the themed page beside the quiz', () => {
  const getEventsSpy = jest.spyOn(anchorAPI, 'getEvents')
  const getBusinessHoursSpy = jest.spyOn(anchorAPI, 'getBusinessHours')

  beforeEach(() => {
    // An unmocked call would reach the live management API.
    getEventsSpy.mockResolvedValue({ events: [], pagination: { total: 0, limit: 100, offset: 0 } })
    getBusinessHoursSpy.mockResolvedValue(null as unknown as Awaited<ReturnType<typeof anchorAPI.getBusinessHours>>)
  })

  afterAll(() => {
    getEventsSpy.mockRestore()
    getBusinessHoursSpy.mockRestore()
  })

  function* walk(node: unknown): Generator<ReactElement> {
    if (Array.isArray(node)) {
      for (const child of node) yield* walk(child)
      return
    }
    if (!isValidElement(node)) return
    yield node
    yield* walk((node.props as { children?: ReactNode }).children)
  }

  it('gives the quiz card a second link to /quiz-night/themed', async () => {
    const cards = [...walk(await WhatsOnPage())].filter((element) => element.type === RegularEventCard)
    const quiz = cards.find((card) => (card.props as { href: string }).href === '/quiz-night')
    if (!quiz) throw new Error('No quiz card on /whats-on')

    render(quiz)

    expect(screen.getByRole('link', { name: 'Themed quiz nights' })).toHaveAttribute('href', '/quiz-night/themed')
    // The card's own link still goes to the quiz page, and is not nested.
    const main = screen.getByRole('link', { name: /Quiz Night/ })
    expect(main).toHaveAttribute('href', '/quiz-night')
    expect(main.querySelector('a')).toBeNull()
  })
})

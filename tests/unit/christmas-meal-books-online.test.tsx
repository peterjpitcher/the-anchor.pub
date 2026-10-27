/**
 * BK-061 and owner decision D22: a Christmas meal for 4 to 20 guests books online as a table, with
 * the deposit and each guest's courses, instead of becoming an enquiry that staff re-key as private
 * hire. Parties and meals for more than 20 still send an enquiry.
 *
 * BK-190: the enquiry forms count opening, pressing submit and being blocked, with no personal
 * data, and a security check that has not finished says so instead of leaving a dead button.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import {
  ChristmasPartiesPageClient,
  type ChristmasFactsView,
  type ChristmasMenuView,
  type ChristmasSeasonView
} from '@/app/christmas-parties/client-components'
import { christmasPartiesSchema } from '@/lib/christmas-parties-schema'
import { christmasMealBooksOnline, christmasTableBookingHref } from '@/lib/christmas-meal-booking'

const FACTS: ChristmasFactsView = {
  minPartySize: 4,
  christmasDay: { date: '2026-12-25', drinksOnly: true, opensAt: '12:00', closesAt: '15:00' } as never,
  minNoticeHours: 24,
  depositPerPerson: 10,
  buffetMinimumGuests: 30,
  maxSeated: 60,
  maxStanding: 100,
  privateHireThreshold: 20
}

const SEASON: ChristmasSeasonView = {
  state: 'upcoming',
  windowLabel: '10 November to 20 December 2026',
  minEnquiryDate: '2026-11-10',
  maxEnquiryDate: '2026-12-20',
  isBookable: true,
  bookingClosed: false,
  showChristmasDayNotice: false
}

const MENU: ChristmasMenuView = { tiers: [], extraSections: [], hasLiveDishes: false, isUnavailable: false }

function signalsSent(beacon: jest.Mock): Array<Record<string, unknown>> {
  return beacon.mock.calls
    .filter(([url]) => url === '/api/enquiry/christmas/signal')
    .map(([, blob]) => (blob as Blob & { __body: string }).__body)
    .map((body) => JSON.parse(body))
}

function installBeacon(): jest.Mock {
  const beacon = jest.fn(() => true)
  Object.defineProperty(window.navigator, 'sendBeacon', { configurable: true, value: beacon })
  const RealBlob = global.Blob
  ;(global as unknown as { Blob: unknown }).Blob = class extends RealBlob {
    __body: string
    constructor(parts: BlobPart[], options?: BlobPropertyBag) {
      super(parts, options)
      this.__body = String(parts[0])
    }
  }
  return beacon
}

async function openForm(button: string, heading: string) {
  render(<ChristmasPartiesPageClient structuredData={christmasPartiesSchema} menu={MENU} season={SEASON} facts={FACTS} />)
  fireEvent.click(screen.getAllByRole('button', { name: button })[0])
  // The drawer opens on the next animation frame.
  await screen.findByRole('heading', { name: heading })
}

const openMealForm = () => openForm('Book lunch or dinner', 'Book your Christmas meal')
const openPartyForm = () => openForm('Plan a Christmas party', 'Send your Christmas enquiry')

describe('christmasMealBooksOnline', () => {
  it('books online up to the private-hire threshold, and when no number is given yet', () => {
    expect(christmasMealBooksOnline('', 20)).toBe(true)
    expect(christmasMealBooksOnline('4', 20)).toBe(true)
    expect(christmasMealBooksOnline('20', 20)).toBe(true)
    expect(christmasMealBooksOnline('21', 20)).toBe(false)
  })

  it('carries what the guest typed to /book-table, and nothing it should not', () => {
    expect(christmasTableBookingHref({})).toBe('/book-table')
    expect(christmasTableBookingHref({ date: '2026-12-05', partySize: '6', time: '18:30' }))
      .toBe('/book-table?date=2026-12-05&party_size=6&time=18%3A30')
    expect(christmasTableBookingHref({ date: '5 Dec', partySize: '26', time: 'evening' })).toBe('/book-table')
  })
})

describe('/christmas-parties meal journey', () => {
  it('sends a meal for up to 20 to a table booking, with the date and numbers filled in', async () => {
    await openMealForm()

    expect(screen.getByRole('heading', { name: 'Book your Christmas meal' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Full name *')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Request my Christmas meal' })).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Number of guests *'), { target: { value: '6' } })
    fireEvent.change(screen.getByLabelText('Preferred date *'), { target: { value: '2026-12-05' } })

    const link = screen.getByRole('link', { name: 'Book a Christmas table' })
    expect(link.getAttribute('href')).toMatch(/^\/book-table\?date=2026-12-05&party_size=6&time=/)
    expect(screen.getByText(/books straight away/)).toHaveTextContent('£10 per person deposit')
  })

  it('keeps the enquiry for a meal for more than 20, which is a private booking', async () => {
    await openMealForm()

    fireEvent.change(screen.getByLabelText('Number of guests *'), { target: { value: '24' } })

    expect(screen.getByRole('heading', { name: 'Send your Christmas enquiry' })).toBeInTheDocument()
    expect(screen.getByLabelText('Full name *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Request my Christmas meal' })).toBeEnabled()
    expect(screen.queryByRole('link', { name: 'Book a Christmas table' })).not.toBeInTheDocument()
  })

  it('keeps the enquiry for a party', async () => {
    await openPartyForm()

    expect(screen.getByLabelText('Full name *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Plan my Christmas party' })).toBeInTheDocument()
  })
})

describe('/christmas-parties enquiry signals', () => {
  it('counts the form opening and a blocked submit, with no personal data', async () => {
    const beacon = installBeacon()
    await openPartyForm()

    fireEvent.change(screen.getByLabelText('Full name *'), { target: { value: 'Jo Bloggs' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Plan my Christmas party' }).closest('form') as HTMLFormElement)

    await waitFor(() => expect(signalsSent(beacon)).toEqual(expect.arrayContaining([
      { stage: 'opened', form: 'main', mode: 'party' },
      { stage: 'submit_pressed', form: 'main', mode: 'party' },
      { stage: 'blocked', form: 'main', mode: 'party', reason: 'missing_fields' }
    ])))
    expect(JSON.stringify(signalsSent(beacon))).not.toContain('Jo')
  })

  it("counts a press the browser's own checks stop, once per press", async () => {
    // A real click, so the required and email checks run and no submit event fires
    // (fireEvent.submit above skips them).
    const beacon = installBeacon()
    await openPartyForm()

    fireEvent.change(screen.getByLabelText('Full name *'), { target: { value: 'Jo Bloggs' } })
    fireEvent.click(screen.getByRole('button', { name: 'Plan my Christmas party' }))

    const pressed = () => signalsSent(beacon).filter((signal) => signal.stage !== 'opened')
    await waitFor(() => expect(pressed()).toEqual([
      { stage: 'submit_pressed', form: 'main', mode: 'party' },
      { stage: 'blocked', form: 'main', mode: 'party', reason: 'missing_fields' }
    ]))
    expect(JSON.stringify(signalsSent(beacon))).not.toContain('Jo')
  })
})

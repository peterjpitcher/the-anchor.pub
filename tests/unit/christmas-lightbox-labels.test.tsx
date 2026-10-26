import type { ComponentProps } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ChristmasLightbox } from '@/app/christmas-parties/client-components'

jest.mock('@/lib/gtm-events', () => new Proxy({}, { get: (_target, name) => (name === '__esModule' ? false : jest.fn()) }))

/**
 * Review BK-197. The enquiry pop-up on the Christmas page used grey
 * placeholder text as its only labels. They vanished once a guest typed, and
 * the date box said nothing but dd/mm/yyyy. The main form on the same page has
 * always had visible labels; the pop-up now has them too.
 */

type Props = ComponentProps<typeof ChristmasLightbox>

const props: Props = {
  suppressed: false,
  context: { mode: 'party', service: 'lunch', courseTier: 'undecided', source: 'test', perks: [] },
  season: {
    state: 'active',
    windowLabel: '10 November to 20 December 2026',
    minEnquiryDate: '2026-11-10',
    maxEnquiryDate: '2026-12-20',
    isBookable: true,
    bookingClosed: false,
    showChristmasDayNotice: false
  },
  facts: {
    minPartySize: 4,
    christmasDay: { opens: '12:00', closes: '15:00', foodService: false },
    minNoticeHours: 24,
    depositPerPerson: 10,
    buffetMinimumGuests: 20,
    maxSeated: 50,
    maxStanding: 100,
    privateHireThreshold: 20
  },
  onContextChange: jest.fn(),
  onSubmitSuccess: jest.fn()
}

function openLightbox() {
  render(<ChristmasLightbox {...props} />)
  // Desktop: it opens as the pointer leaves the top of the window.
  act(() => {
    fireEvent.mouseLeave(document, { clientY: 0 })
  })
  return screen.getByRole('dialog', { name: 'Planning Christmas with us?' })
}

afterEach(() => {
  window.localStorage.clear()
})

it.each(['Full name', 'Email', 'Mobile', 'Number of guests', 'Preferred date'])(
  'labels the %s box with words that stay on screen',
  (name) => {
    openLightbox()

    const label = screen.getByText(name, { selector: 'label' })
    const field = screen.getByLabelText(name)
    expect(label).toBeVisible()
    expect(label).toHaveAttribute('for', field.id)
    // The label is the name now; a placeholder or a hidden aria-label is not.
    expect(field).not.toHaveAttribute('aria-label')
    expect(field).not.toHaveAttribute('placeholder')
  }
)

it('keeps typed details and the label together', () => {
  openLightbox()
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Jane Guest' } })

  expect(screen.getByLabelText('Full name')).toHaveValue('Jane Guest')
  expect(screen.getByText('Full name', { selector: 'label' })).toBeVisible()
})

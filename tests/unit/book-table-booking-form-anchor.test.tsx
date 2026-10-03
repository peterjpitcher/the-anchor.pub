/**
 * /book-table#booking-form, where the paid-ads landing page sends its visitors.
 *
 * "Book a table" on /lunch-and-dinner links to
 * /book-table?source=lunch_dinner_lp#booking-form so a phone visitor lands on
 * the form, not on the booking page's hero. That only works while the form's
 * section keeps this id, in whichever layout the runtime flag
 * `booking_options_step1` picks.
 *
 * The page is not rendered here: it nests server components a test renderer
 * cannot run. The element tree the page returns already holds the section and
 * the form inside it, so the tree is read as it stands.
 */

import { isValidElement, type ReactElement, type ReactNode } from 'react'
import BookPage from '@/app/book-table/page'
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'
import { isWebsiteUiFlagEnabled } from '@/lib/flags'
import { LUNCH_DINNER_BOOKING_HREF } from '@/lib/booking-cta'

jest.mock('server-only', () => ({}), { virtual: true })

// React's `cache` only exists in the server build; the data helpers wrap
// themselves in it at import.
jest.mock('react', () => {
  const actual = jest.requireActual('react')
  return {
    ...actual,
    cache: (fn: unknown) => fn
  }
})

jest.mock('@/lib/flags', () => ({
  isWebsiteUiFlagEnabled: jest.fn()
}))

jest.mock('@/lib/menu-page-data', () => ({
  ...jest.requireActual('@/lib/menu-page-data'),
  getFoodMenuPageData: jest.fn().mockResolvedValue(null),
  getSundayLunchMenuPageData: jest.fn().mockResolvedValue({ menuData: null })
}))

type AnyProps = { children?: ReactNode; [key: string]: unknown }

/** Every element in a returned tree, parents before their children. */
function allElements(node: ReactNode): ReactElement<AnyProps>[] {
  if (Array.isArray(node)) return node.flatMap((child) => allElements(child))
  if (!isValidElement<AnyProps>(node)) return []
  return [node, ...allElements(node.props.children)]
}

async function bookingFormSection(flagOn: boolean) {
  jest.mocked(isWebsiteUiFlagEnabled).mockResolvedValue(flagOn)
  // The page reads only its prefill params; `source` and the ad tags are read
  // in the browser by the form itself.
  const tree = (await BookPage({ searchParams: {} })) as ReactElement
  const sections = allElements(tree).filter((element) => element.props.id === 'booking-form')
  return { tree, sections }
}

describe('/book-table#booking-form', () => {
  it('is the fragment the landing page links to', () => {
    expect(new URL(LUNCH_DINNER_BOOKING_HREF, 'https://www.the-anchor.pub').hash).toBe('#booking-form')
  })

  it.each([
    ['the single-form layout (flag off)', false],
    ['the two-screen layout (flag on)', true]
  ])('has the anchor, with the booking form inside it, in %s', async (_label, flagOn) => {
    const { sections } = await bookingFormSection(flagOn)

    // Exactly one, or the browser would scroll to whichever came first.
    expect(sections).toHaveLength(1)

    const forms = allElements(sections[0].props.children).filter(
      (element) => element.type === ManagementTableBookingForm
    )
    expect(forms).toHaveLength(1)
    expect(forms[0].props.twoScreenFlow).toBe(flagOn)
    expect(isWebsiteUiFlagEnabled).toHaveBeenCalledWith('booking_options_step1')
  })

  it('keeps the form clear of the top of the screen when it is jumped to', async () => {
    const { sections } = await bookingFormSection(false)

    expect(String(sections[0].props.className)).toMatch(/\bscroll-mt-\d+\b/)
  })

  it('puts the form in the page only once, inside the anchor', async () => {
    const { tree } = await bookingFormSection(true)

    expect(allElements(tree).filter((element) => element.type === ManagementTableBookingForm)).toHaveLength(1)
  })
})

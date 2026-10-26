/**
 * /book-table#booking-form, where the paid-ads landing page sends its visitors.
 *
 * "Book a table" on /lunch-and-dinner links to
 * /book-table?source=lunch_dinner_lp#booking-form so a phone visitor lands on
 * the form, not on the booking page's hero. That only works while the form's
 * section keeps this id.
 *
 * The page is not rendered here: it nests server components a test renderer
 * cannot run. The element tree the page returns already holds the section and
 * the form inside it, so the tree is read as it stands.
 */

import { Suspense, isValidElement, type ReactElement, type ReactNode } from 'react'
import BookPage, { revalidate } from '@/app/book-table/page'
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'
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

async function bookingFormSection() {
  const tree = (await BookPage()) as ReactElement
  const sections = allElements(tree).filter((element) => element.props.id === 'booking-form')
  return { tree, sections }
}

describe('/book-table#booking-form', () => {
  it('is the fragment the landing page links to', () => {
    expect(new URL(LUNCH_DINNER_BOOKING_HREF, 'https://www.the-anchor.pub').hash).toBe('#booking-form')
  })

  it('has the anchor, with the booking form inside it', async () => {
    const { sections } = await bookingFormSection()

    // Exactly one, or the browser would scroll to whichever came first.
    expect(sections).toHaveLength(1)

    const forms = allElements(sections[0].props.children).filter(
      (element) => element.type === ManagementTableBookingForm
    )
    expect(forms).toHaveLength(1)
  })

  it('keeps the form clear of the top of the screen when it is jumped to', async () => {
    const { sections } = await bookingFormSection()

    expect(String(sections[0].props.className)).toMatch(/\bscroll-mt-\d+\b/)
  })

  it('puts the form in the page only once, inside the anchor', async () => {
    const { tree } = await bookingFormSection()

    expect(allElements(tree).filter((element) => element.type === ManagementTableBookingForm)).toHaveLength(1)
  })

  // Review BK-200. The page read its address on the server and asked AMS for a
  // flag with caching off, so it was built afresh for every visitor. Now it
  // takes nothing from the request, hands the form nothing from it, and the
  // form, which reads the address in the browser, sits in Suspense so the
  // rest of the page can be built once and cached.
  it('is built without the request, so it can be cached', async () => {
    expect(BookPage.length).toBe(0)
    expect(revalidate).toBe(3600)

    const { sections } = await bookingFormSection()
    const [form] = allElements(sections[0].props.children).filter(
      (element) => element.type === ManagementTableBookingForm
    )
    expect(form.props).toEqual({})

    const boundaries = allElements(sections[0].props.children).filter((element) => element.type === Suspense)
    expect(boundaries).toHaveLength(1)
    expect(allElements(boundaries[0].props.children)).toContain(form)
    expect(boundaries[0].props.fallback).toBeTruthy()
  })
})

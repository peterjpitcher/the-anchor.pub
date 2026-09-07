/**
 * Guard: the desktop nav dropdowns must be keyboard operable.
 *
 * They were not. Each top-level item was a single <a aria-expanded> that opened
 * on hover only, so pressing Enter navigated to the landing page, aria-expanded
 * never moved, and every submenu link was unreachable without a pointer. The
 * browser audit could not see it either: it deliberately skipped links, because
 * pressing Enter on one detaches the node mid-read.
 *
 * These tests hold the shape that makes it work: a link to the landing page,
 * plus a separate <button> disclosure that Enter, Space and Escape operate.
 */
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navigation } from '@/components/layout/Navigation'

jest.mock('@/lib/gtm-events', () => ({
  trackModalClose: jest.fn(),
  trackModalEngage: jest.fn(),
  trackModalOpen: jest.fn(),
  trackNavigationClick: jest.fn()
}))
jest.mock('@/hooks/useFocusTrap', () => ({ useFocusTrap: () => ({ current: null }) }))

afterEach(cleanup)

// The desktop header and the mobile drawer both render a "Food" control, but the
// drawer only exists once the burger is open, so within a fresh render the
// desktop disclosure is the only match.
const foodDisclosure = () => screen.getByRole('button', { name: 'Food submenu' })

it('renders every dropdown trigger as a button, never as a link with aria-expanded', () => {
  const { container } = render(<Navigation />)

  expect(container.querySelectorAll('a[aria-expanded]')).toHaveLength(0)

  for (const name of ['Food', 'Private Hire', "What's On", 'Find Us']) {
    const disclosure = screen.getByRole('button', { name: `${name} submenu` })
    expect(disclosure).toHaveAttribute('aria-expanded', 'false')
    expect(disclosure.getAttribute('aria-controls')).toBeTruthy()
    // The panel it names has to exist, or the attribute points at nothing.
    expect(document.getElementById(disclosure.getAttribute('aria-controls')!)).toBeInTheDocument()
  }
})

it('keeps the top-level label as a link to the section landing page', () => {
  render(<Navigation />)
  expect(screen.getByRole('link', { name: 'Food' })).toHaveAttribute('href', '/food-menu')
})

it.each([
  ['Enter', '{Enter}'],
  ['Space', ' ']
])('toggles the submenu with %s', async (_name, key) => {
  const user = userEvent.setup()
  render(<Navigation />)

  await user.tab()
  const disclosure = foodDisclosure()
  disclosure.focus()

  await user.keyboard(key)
  expect(disclosure).toHaveAttribute('aria-expanded', 'true')

  await user.keyboard(key)
  expect(disclosure).toHaveAttribute('aria-expanded', 'false')
})

it('closes on Escape and puts focus back on the control that opened it', async () => {
  const user = userEvent.setup()
  render(<Navigation />)

  const disclosure = foodDisclosure()
  disclosure.focus()
  await user.keyboard('{Enter}')
  expect(disclosure).toHaveAttribute('aria-expanded', 'true')

  await user.keyboard('{Escape}')
  expect(disclosure).toHaveAttribute('aria-expanded', 'false')
  expect(disclosure).toHaveFocus()
})

it('opens on ArrowDown and moves focus to the first submenu link', async () => {
  const user = userEvent.setup()
  render(<Navigation />)

  const disclosure = foodDisclosure()
  disclosure.focus()
  await user.keyboard('{ArrowDown}')

  expect(disclosure).toHaveAttribute('aria-expanded', 'true')
  const panel = document.getElementById(disclosure.getAttribute('aria-controls')!)!
  await waitFor(() => expect(panel.querySelector('a')).toHaveFocus())
})

it('exposes the submenu as a list of links, not a menu widget', () => {
  render(<Navigation />)

  const panel = document.getElementById(foodDisclosure().getAttribute('aria-controls')!)!
  // role="menu" promises roving arrow-key focus and takes the links out of the
  // tab order. This is a disclosure full of ordinary links, so Tab must reach them.
  expect(panel.querySelectorAll('[role="menu"], [role="menuitem"]')).toHaveLength(0)
  expect(panel.querySelectorAll('li > a').length).toBeGreaterThan(0)
})

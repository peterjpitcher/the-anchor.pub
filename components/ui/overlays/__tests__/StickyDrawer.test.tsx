import { render, screen } from '@testing-library/react'
import { StickyDrawer } from '../StickyDrawer'

/**
 * `StickyCtas` mounts the quick-book sheet in the root layout, so this drawer is present
 * in the DOM of every page on the site, open or not. Unlike `Modal`, which unmounts when
 * closed, this one stays mounted and hides itself with a transform because it animates in
 * and out. That makes its closed-state markup a site-wide contract rather than a local
 * detail: whatever a closed drawer says about itself, it says on every page.
 *
 * `components/features/christmas/ChristmasLightbox.tsx` reads that markup at runtime.
 */
describe('StickyDrawer closed-state markup', () => {
  it('exposes an open drawer as a modal dialog', () => {
    render(
      <StickyDrawer open onClose={() => {}} title="Quick book" testId="drawer">
        <button type="button">Choose a time</button>
      </StickyDrawer>
    )

    const panel = screen.getByTestId('drawer')
    expect(panel).toHaveAttribute('role', 'dialog')
    expect(panel).toHaveAttribute('aria-modal', 'true')
    expect(panel).toHaveAttribute('data-state', 'open')
    expect(panel).not.toHaveAttribute('aria-hidden')
    expect(panel).not.toHaveAttribute('inert')
  })

  it('does not advertise a dialog while closed', () => {
    // The defect this pins: the panel used to carry role="dialog" and aria-modal="true"
    // whether it was open or not, so every page on the site permanently told assistive
    // technology that a modal dialog was open over the content.
    render(
      <StickyDrawer open={false} onClose={() => {}} title="Quick book" testId="drawer">
        <button type="button">Choose a time</button>
      </StickyDrawer>
    )

    const panel = screen.getByTestId('drawer')
    expect(panel).not.toHaveAttribute('role')
    expect(panel).not.toHaveAttribute('aria-modal')
    expect(panel).toHaveAttribute('data-state', 'closed')
  })

  it('hides the closed panel from assistive technology and the tab order', () => {
    // `aria-hidden` alone would be a fault of its own: hiding a subtree that still holds
    // focusable children lets a keyboard user tab into content the screen reader has been
    // told is not there. `inert` is what removes the off-canvas contents from the tab
    // order and from pointer events.
    render(
      <StickyDrawer open={false} onClose={() => {}} title="Quick book" testId="drawer">
        <button type="button">Choose a time</button>
      </StickyDrawer>
    )

    const panel = screen.getByTestId('drawer')
    expect(panel).toHaveAttribute('aria-hidden', 'true')
    expect(panel).toHaveAttribute('inert')
  })

  it('renders inert without a React attribute warning', () => {
    // React 18 has no `inert` support, so a boolean renders `inert="true"` and logs
    // "Received `true` for a non-boolean attribute". The empty string is what the HTML
    // spec asks for and React forwards it verbatim. If this app moves to React 19 the
    // shim in StickyDrawer can go, and this test should start failing loudly if it does
    // not.
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <StickyDrawer open={false} onClose={() => {}} title="Quick book" testId="drawer">
        <button type="button">Choose a time</button>
      </StickyDrawer>
    )

    expect(screen.getByTestId('drawer')).toHaveAttribute('inert', '')
    expect(errorSpy).not.toHaveBeenCalled()

    errorSpy.mockRestore()
  })

  it('keeps the panel mounted when closed so it can animate', () => {
    // Unmounting would be the simplest way to hide a closed dialog, and it is what
    // `Modal` does. It is not available here: the drawer slides in and out, and an
    // unmounted panel has nothing to slide.
    render(
      <StickyDrawer open={false} onClose={() => {}} title="Quick book" testId="drawer">
        <button type="button">Choose a time</button>
      </StickyDrawer>
    )

    const panel = screen.getByTestId('drawer')
    expect(panel).toBeInTheDocument()
    expect(panel.className).toContain('transition-transform')
  })
})

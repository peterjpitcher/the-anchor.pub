import { render } from '@testing-library/react'
import { AllergenFilterBar } from '../AllergenFilterBar'
import { isDialogOpen } from '../christmas/ChristmasLightbox'

/**
 * This panel stays mounted when closed and hides itself with a transform, because it slides
 * in and out. That makes its closed-state markup a contract rather than a local detail: an
 * always-mounted overlay says whatever it says on every page that mounts it.
 *
 * Two readers depend on that markup. Assistive technology, which was previously told a modal
 * dialog was open over the content whenever this component was on the page, and
 * `isDialogOpen()` in components/features/christmas/ChristmasLightbox.tsx, which holds the
 * lightbox back while a dialog is open. The second failure is the expensive one: it is
 * silent, it lasts the whole season, and the campaign simply never runs.
 *
 * The component is unused today. These tests are what runs it.
 */

const noop = () => {}

function renderPanel(isOpen: boolean) {
  return render(
    <AllergenFilterBar
      selectedAllergens={new Set()}
      showVegetarianOnly={false}
      showVeganOnly={false}
      showGlutenFreeOnly={false}
      onToggleAllergen={noop}
      onToggleVegetarian={noop}
      onToggleVegan={noop}
      onToggleGlutenFree={noop}
      onClearAll={noop}
      activeFilterCount={0}
      isOpen={isOpen}
      onOpen={noop}
      onClose={noop}
    />
  )
}

function panelOf(container: HTMLElement): HTMLElement {
  const panel = container.querySelector<HTMLElement>('[data-state]')
  if (!panel) throw new Error('panel not found')
  return panel
}

describe('AllergenFilterBar closed-state markup', () => {
  it('exposes an open panel as a modal dialog', () => {
    const { container } = renderPanel(true)
    const panel = panelOf(container)

    expect(panel).toHaveAttribute('role', 'dialog')
    expect(panel).toHaveAttribute('aria-modal', 'true')
    expect(panel).toHaveAttribute('data-state', 'open')
    expect(panel).not.toHaveAttribute('aria-hidden')
    expect(panel).not.toHaveAttribute('inert')
  })

  it('does not advertise a dialog while closed', () => {
    // The defect this pins: the panel carried role="dialog" and aria-modal="true" whether
    // it was open or not, so any page mounting it permanently claimed an open modal.
    const { container } = renderPanel(false)
    const panel = panelOf(container)

    expect(panel).not.toHaveAttribute('role')
    expect(panel).not.toHaveAttribute('aria-modal')
    expect(panel).toHaveAttribute('data-state', 'closed')
  })

  it('hides the closed panel from assistive technology and the tab order', () => {
    // `aria-hidden` alone would be a fault of its own making: hiding a subtree that still
    // holds focusable children lets a keyboard user tab into content the screen reader has
    // been told is not there. `inert` is what removes the off-canvas buttons from the tab
    // order and from pointer events.
    const { container } = renderPanel(false)
    const panel = panelOf(container)

    expect(panel).toHaveAttribute('aria-hidden', 'true')
    expect(panel).toHaveAttribute('inert')
  })

  it('renders inert without a React attribute warning', () => {
    // React 18 has no `inert` support, so a boolean prop renders `inert="true"` and logs
    // "Received `true` for a non-boolean attribute". The empty string is what the HTML spec
    // asks for and React forwards it verbatim, which is why the attribute is set on the node
    // in an effect. On React 19 the shim can go, and this test should fail loudly if it does
    // not.
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(noop)

    const { container } = renderPanel(false)

    expect(panelOf(container)).toHaveAttribute('inert', '')
    expect(errorSpy).not.toHaveBeenCalled()

    errorSpy.mockRestore()
  })

  it('keeps the panel mounted when closed so it can animate', () => {
    // Unmounting is the simplest way to hide a closed dialog, and it is what `Modal` does.
    // It is not available here: the panel slides in and out, and an unmounted panel has
    // nothing to slide.
    const { container } = renderPanel(false)
    const panel = panelOf(container)

    expect(panel).toBeInTheDocument()
    expect(panel.className).toContain('transition-transform')
    expect(panel.className).toContain('translate-x-full')
  })
})

describe('AllergenFilterBar and the Christmas lightbox', () => {
  it('does not suppress the lightbox while closed', () => {
    // Read through the real selector rather than a copy of it. Before the fix this panel
    // matched `[aria-modal="true"]:not([data-state="closed"])` on both counts, so mounting
    // it anywhere would have suppressed the lightbox site-wide for the whole season.
    renderPanel(false)

    expect(isDialogOpen()).toBe(false)
  })

  it('suppresses the lightbox while open', () => {
    // The other half of the contract. Dropping the attributes when closed is only correct
    // if they are still there when the panel really is open over the content.
    renderPanel(true)

    expect(isDialogOpen()).toBe(true)
  })
})

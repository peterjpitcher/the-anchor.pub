import { act, render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MODAL_FOCUS_DELAY_MS, Modal, ModalDescription, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '../Modal'

describe('Modal', () => {
  it('renders when open', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <ModalBody>Modal content</ModalBody>
      </Modal>
    )

    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <ModalBody>Modal content</ModalBody>
      </Modal>
    )

    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <ModalBody>Modal content</ModalBody>
      </Modal>
    )

    const closeButton = screen.getByLabelText('Close modal')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when escape key is pressed', () => {
    const onClose = jest.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <ModalBody>Modal content</ModalBody>
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose on escape when closeOnEscape is false', () => {
    const onClose = jest.fn()
    render(
      <Modal open={true} onClose={onClose} closeOnEscape={false}>
        <ModalBody>Modal content</ModalBody>
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <ModalBody>Modal content</ModalBody>
      </Modal>
    )

    const dialog = screen.getByRole('dialog')
    const overlay = dialog.parentElement as HTMLElement
    fireEvent.click(overlay)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when modal content is clicked', () => {
    const onClose = jest.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <ModalBody>Modal content</ModalBody>
      </Modal>
    )

    fireEvent.click(screen.getByText('Modal content'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('prevents body scroll when open', () => {
    const { rerender } = render(
      <Modal open={false} onClose={() => {}}>
        <ModalBody>Modal content</ModalBody>
      </Modal>
    )

    expect(document.body.style.overflow).toBe('')

    rerender(
      <Modal open={true} onClose={() => {}}>
        <ModalBody>Modal content</ModalBody>
      </Modal>
    )

    expect(document.body.style.overflow).toBe('hidden')

    rerender(
      <Modal open={false} onClose={() => {}}>
        <ModalBody>Modal content</ModalBody>
      </Modal>
    )

    expect(document.body.style.overflow).toBe('')
  })

  it('renders with different sizes', () => {
    const { rerender } = render(
      <Modal open={true} onClose={() => {}} size="sm">
        <ModalBody>Small modal</ModalBody>
      </Modal>
    )

    expect(screen.getByRole('dialog')).toHaveClass('max-w-md')

    rerender(
      <Modal open={true} onClose={() => {}} size="lg">
        <ModalBody>Large modal</ModalBody>
      </Modal>
    )

    expect(screen.getByRole('dialog')).toHaveClass('max-w-2xl')
  })

  it('focuses first focusable element when opened', () => {
    // Driven, not raced. The modal moves focus on a MODAL_FOCUS_DELAY_MS timer, so the
    // old `waitFor(..., { timeout: 200 })` gave a shared CI runner 100ms of wall clock to
    // render jsdom and fire it. That budget failed on `main` three times, on commits
    // which never touched this component, and a test that goes red for reasons unrelated
    // to the change is how a real failure eventually gets waved through.
    //
    // Advancing the timer directly removes the clock from the assertion entirely and
    // pins the actual contract: focus is not moved before the delay, and lands after it.
    jest.useFakeTimers()

    try {
      render(
        <Modal open={true} onClose={() => {}}>
          <ModalBody>
            <button>First button</button>
            <button>Second button</button>
          </ModalBody>
        </Modal>
      )

      // Proves the timer is what moves focus. Without this the test would still pass if
      // the delay were removed and focus moved synchronously on mount.
      expect(screen.getByLabelText('Close modal')).not.toHaveFocus()

      act(() => {
        jest.advanceTimersByTime(MODAL_FOCUS_DELAY_MS)
      })

      expect(screen.getByLabelText('Close modal')).toHaveFocus()
    } finally {
      jest.useRealTimers()
    }
  })

  it('traps focus within modal', async () => {
    const user = userEvent.setup()
    render(
      <Modal open={true} onClose={() => {}}>
        <ModalBody>
          <button>First button</button>
          <button>Second button</button>
          <button>Last button</button>
        </ModalBody>
      </Modal>
    )

    const firstButton = screen.getByText('First button')
    const lastButton = screen.getByText('Last button')

    // Focus last button
    lastButton.focus()
    expect(lastButton).toHaveFocus()

    // Tab should cycle to close button (first focusable)
    await user.tab()

    // Shift+Tab from first button should cycle to last
    firstButton.focus()
    await user.tab({ shift: true })
  })

  it('renders with proper ARIA attributes', () => {
    render(
      <Modal 
        open={true} 
        onClose={() => {}}
        title="Test Modal"
        description="Modal description"
      >
        <ModalHeader>
          <ModalTitle id="modal-title">Test Modal</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p id="modal-description">Modal description</p>
        </ModalBody>
      </Modal>
    )

    const modal = screen.getByRole('dialog')
    expect(modal).toHaveAttribute('aria-modal', 'true')
    expect(modal).toHaveAttribute('aria-labelledby')
  })

  // Site review AX-015, 7 October 2026: two dialogs pointed aria-labelledby at
  // an id that was not in the page, because Modal built the id from its own
  // `id` and each caller gave its title a fixed one.
  it('is named by its title whatever id the caller gave the title', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Before you go" id="exit_intent_modal">
        <ModalHeader>
          <ModalTitle id="modal-title">Before you go</ModalTitle>
        </ModalHeader>
      </Modal>
    )

    const modal = screen.getByRole('dialog', { name: 'Before you go' })
    const labelledBy = modal.getAttribute('aria-labelledby')
    expect(labelledBy).toBe('exit_intent_modal-title')
    expect(document.getElementById(labelledBy as string)).toHaveTextContent('Before you go')
    expect(modal).not.toHaveAttribute('aria-label')
  })

  it('is named by its title prop when no ModalTitle is rendered, and points at nothing that is missing', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Private hire offer" description="Not rendered">
        <p>Body</p>
      </Modal>
    )

    const modal = screen.getByRole('dialog', { name: 'Private hire offer' })
    expect(modal).not.toHaveAttribute('aria-labelledby')
    expect(modal).not.toHaveAttribute('aria-describedby')
  })

  it('is described by its ModalDescription', () => {
    render(
      <Modal open={true} onClose={() => {}} id="tour">
        <ModalTitle>The beer garden</ModalTitle>
        <ModalDescription>Seats sixty outside.</ModalDescription>
      </Modal>
    )

    const modal = screen.getByRole('dialog', { name: 'The beer garden' })
    expect(modal).toHaveAccessibleDescription('Seats sixty outside.')
  })

  it('tells onClose why it is closing', () => {
    const onClose = jest.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <p>Body</p>
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenLastCalledWith('escape_key')
    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))
    expect(onClose).toHaveBeenLastCalledWith('close_button')
  })

  it('brings focus in when Tab is pressed with focus behind the dialog', () => {
    render(
      <>
        <button>Behind</button>
        <Modal open={true} onClose={() => {}}>
          <button>Inside</button>
        </Modal>
      </>
    )

    screen.getByRole('button', { name: 'Behind' }).focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(screen.getByRole('button', { name: 'Close modal' })).toHaveFocus()
  })
})

describe('Modal Sub-components', () => {
  it('renders ModalHeader correctly', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <ModalHeader>
          <ModalTitle>Header Title</ModalTitle>
        </ModalHeader>
      </Modal>
    )

    expect(screen.getByText('Header Title')).toBeInTheDocument()
    expect(screen.getByText('Header Title').parentElement).toHaveClass('px-6', 'pt-6', 'pb-4')
  })

  it('renders ModalFooter with proper styling', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <ModalFooter>
          <button>Cancel</button>
          <button>Save</button>
        </ModalFooter>
      </Modal>
    )

    const footer = screen.getByText('Cancel').parentElement
    expect(footer).toHaveClass('flex', 'items-center', 'justify-end', 'gap-2')
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { type MutableRefObject } from 'react'
import { TurnstileField, type TurnstileFieldRef } from '@/components/security/TurnstileField'

const mockReset = jest.fn()
// Counts real mounts of the widget. A second mount is a second Cloudflare
// widget, and the visitor's token is gone with the first.
const mockWidgetMounted = jest.fn()

jest.mock('@marsidev/react-turnstile', () => {
  const React = require('react')

  return {
    Turnstile: React.forwardRef(function MockTurnstile(props: any, ref: any) {
      React.useImperativeHandle(ref, () => ({
        reset: mockReset
      }))
      React.useEffect(() => {
        mockWidgetMounted()
      }, [])

      return (
        <div
          data-testid="turnstile-widget"
          data-id={props.id}
          data-site-key={props.siteKey}
          data-options={JSON.stringify(props.options)}
        >
          <button type="button" onClick={() => props.onSuccess('token-123')}>
            Mock Success
          </button>
          <button type="button" onClick={() => props.onError('600010')}>
            Mock Error
          </button>
          <button type="button" onClick={() => props.onExpire('token-123')}>
            Mock Expire
          </button>
          <button type="button" onClick={() => props.onTimeout()}>
            Mock Timeout
          </button>
          <button type="button" onClick={() => props.onUnsupported()}>
            Mock Unsupported
          </button>
        </div>
      )
    })
  }
})

function renderTurnstileField() {
  const turnstileRef: MutableRefObject<TurnstileFieldRef> = { current: null }
  const onTokenChange = jest.fn()

  render(
    <TurnstileField
      id="test-turnstile"
      turnstileRef={turnstileRef}
      onTokenChange={onTokenChange}
    />
  )

  return { onTokenChange, turnstileRef }
}

/**
 * jsdom has no layout, so every element is 0 wide. This stands in for the room
 * the widget's slot has, which is the only thing the component measures.
 */
function slotIs(width: number | (() => number)) {
  return jest
    .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
    .mockImplementation(typeof width === 'function' ? width : () => width)
}

function renderedSize(): string | undefined {
  const widget = screen.getByTestId('turnstile-widget')
  return JSON.parse(widget.getAttribute('data-options') || '{}').size
}

describe('TurnstileField', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('widget size', () => {
    // 288px is a 320px phone inside the page gutters; 212px is the careers
    // form's security box on the same phone.
    it.each([288, 212, 299])('gives the compact widget to a %ipx slot', (width) => {
      slotIs(width)
      renderTurnstileField()

      expect(renderedSize()).toBe('compact')
    })

    it.each([300, 302, 640])('keeps the wide widget in a %ipx slot', (width) => {
      slotIs(width)
      renderTurnstileField()

      expect(renderedSize()).toBe('flexible')
    })

    it('keeps the wide widget when the slot measures 0', () => {
      slotIs(0)
      renderTurnstileField()

      expect(renderedSize()).toBe('flexible')
    })

    it('keeps the wide widget when measuring throws', () => {
      slotIs(() => {
        throw new Error('no layout')
      })
      renderTurnstileField()

      expect(renderedSize()).toBe('flexible')
    })

    it('still hands over the token from the compact widget', () => {
      slotIs(288)
      const { onTokenChange } = renderTurnstileField()

      fireEvent.click(screen.getByRole('button', { name: 'Mock Success' }))

      expect(renderedSize()).toBe('compact')
      expect(onTokenChange).toHaveBeenCalledWith('token-123')
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('still shows the phone number and Try Again when the compact widget fails', () => {
      slotIs(288)
      const { onTokenChange } = renderTurnstileField()

      fireEvent.click(screen.getByRole('button', { name: 'Mock Error' }))

      expect(onTokenChange).toHaveBeenCalledWith(null)
      expect(screen.getByRole('alert')).toHaveTextContent('01753 682707')
      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
    })

    it.each([
      ['narrow then wide (phone turned on its side)', 288, 640, 'compact'],
      ['wide then narrow (phone turned upright)', 640, 288, 'flexible']
    ])('does not change size after mount: %s', (_label, before, after, expected) => {
      let width = before
      slotIs(() => width)
      const turnstileRef: MutableRefObject<TurnstileFieldRef> = { current: null }
      const onTokenChange = jest.fn()
      const field = (callback: (token: string | null) => void) => (
        <TurnstileField id="test-turnstile" turnstileRef={turnstileRef} onTokenChange={callback} />
      )
      const { rerender } = render(field(onTokenChange))

      fireEvent.click(screen.getByRole('button', { name: 'Mock Success' }))
      expect(renderedSize()).toBe(expected)

      width = after
      fireEvent(window, new Event('resize'))
      fireEvent(window, new Event('orientationchange'))
      // A parent form re-rendering, with a new callback as an inline arrow gives.
      const nextOnTokenChange = jest.fn()
      rerender(field(nextOnTokenChange))

      expect(renderedSize()).toBe(expected)
      expect(mockWidgetMounted).toHaveBeenCalledTimes(1)
      // The token the visitor already had was never withdrawn.
      expect(onTokenChange).not.toHaveBeenCalledWith(null)
      expect(nextOnTokenChange).not.toHaveBeenCalled()
    })

    it('reserves the wide widget height and sets no minimum width on the slot', () => {
      slotIs(288)
      renderTurnstileField()
      const slot = screen.getByTestId('turnstile-widget').parentElement as HTMLElement

      expect(slot).toHaveClass('min-h-[65px]')
      expect(slot.className).not.toMatch(/min-w-|(^|\s)w-/)
      expect(slot.getAttribute('style')).toBeNull()
    })
  })

  it('uses the expected Turnstile render options and stores a successful token', () => {
    const { onTokenChange } = renderTurnstileField()
    const widget = screen.getByTestId('turnstile-widget')
    const options = JSON.parse(widget.getAttribute('data-options') || '{}')

    expect(widget).toHaveAttribute('data-id', 'test-turnstile')
    expect(options).toMatchObject({
      theme: 'light',
      size: 'flexible',
      retry: 'auto',
      refreshExpired: 'auto',
      refreshTimeout: 'auto'
    })

    fireEvent.click(screen.getByRole('button', { name: 'Mock Success' }))

    expect(onTokenChange).toHaveBeenCalledWith('token-123')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows retry UI when Turnstile reports an error', () => {
    const { onTokenChange } = renderTurnstileField()

    fireEvent.click(screen.getByRole('button', { name: 'Mock Error' }))

    expect(onTokenChange).toHaveBeenCalledWith(null)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Verification did not complete. Try again, or call 01753 682707 and we will book this for you.'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))

    expect(mockReset).toHaveBeenCalledTimes(1)
    expect(onTokenChange).toHaveBeenLastCalledWith(null)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('sends an unsupported browser to the phone rather than a dead retry', () => {
    const { onTokenChange } = renderTurnstileField()

    fireEvent.click(screen.getByRole('button', { name: 'Mock Unsupported' }))

    expect(onTokenChange).toHaveBeenCalledWith(null)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'This browser cannot complete our security check. Please call 01753 682707 and we will book this for you.'
    )
  })

  // Expiry and challenge-timeout self-heal via refreshExpired/refreshTimeout
  // 'auto'. A guest who spends more than five minutes on the booking form is
  // ordinary, and used to be shown a red failure banner for it.
  it.each([
    ['expiry', 'Mock Expire'],
    ['timeout', 'Mock Timeout']
  ])('drops the stale token silently on %s', (_label, buttonName) => {
    const { onTokenChange } = renderTurnstileField()

    fireEvent.click(screen.getByRole('button', { name: 'Mock Success' }))
    expect(onTokenChange).toHaveBeenLastCalledWith('token-123')

    fireEvent.click(screen.getByRole('button', { name: buttonName }))

    expect(onTokenChange).toHaveBeenLastCalledWith(null)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    // Cloudflare mints a replacement and the guest can submit again.
    fireEvent.click(screen.getByRole('button', { name: 'Mock Success' }))
    expect(onTokenChange).toHaveBeenLastCalledWith('token-123')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

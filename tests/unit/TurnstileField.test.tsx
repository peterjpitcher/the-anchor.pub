import { act, fireEvent, render, screen, within } from '@testing-library/react'
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

function renderTurnstileField(props: { showInlineError?: boolean; phoneSource?: string } = {}) {
  const turnstileRef: MutableRefObject<TurnstileFieldRef> = { current: null }
  const onTokenChange = jest.fn()

  render(
    <TurnstileField
      id="test-turnstile"
      turnstileRef={turnstileRef}
      onTokenChange={onTokenChange}
      {...props}
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
      // The widget sits in a box of its own inside the slot (see the next group).
      const slot = screen.getByTestId('turnstile-widget').parentElement?.parentElement as HTMLElement

      expect(slot).toHaveClass('min-h-[65px]')
      expect(slot.className).not.toMatch(/min-w-|(^|\s)w-/)
      expect(slot.getAttribute('style')).toBeNull()
    })
  })

  // The wide widget was right when the form mounted and the room has shrunk
  // since: a phone turned upright, a window dragged narrow. Swapping to the
  // compact widget would throw the visitor's token away, and left alone the
  // widget ran 22px past the edge of a 320px screen on /private-hire.
  describe('a wide widget whose room shrinks after it mounted', () => {
    type ResizeCallback = () => void
    let resizeCallbacks: ResizeCallback[]
    const realResizeObserver = global.ResizeObserver

    beforeEach(() => {
      resizeCallbacks = []
      global.ResizeObserver = class {
        constructor(callback: ResizeCallback) {
          resizeCallbacks.push(callback)
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      } as unknown as typeof ResizeObserver
    })

    afterEach(() => {
      global.ResizeObserver = realResizeObserver
    })

    const box = () => screen.getByTestId('turnstile-widget').parentElement as HTMLElement
    const roomChanges = () => act(() => resizeCallbacks.forEach((callback) => callback()))

    it('lays the wide widget over its slot, so its 300px minimum cannot push the form wider', () => {
      slotIs(640)
      renderTurnstileField()

      expect(box().style.position).toBe('absolute')
      expect(box().style.width).toBe('100%')
      expect(box().style.minWidth).toBe('300px')
      expect(box().style.transform).toBe('')
      expect(box()).toHaveAttribute('data-turnstile-squeezed', 'false')
      expect(box().parentElement).toHaveClass('relative', 'min-h-[65px]')
    })

    it('draws the same widget smaller when the slot drops under 300px, and keeps the token', () => {
      let width = 640
      slotIs(() => width)
      const { onTokenChange } = renderTurnstileField()
      fireEvent.click(screen.getByRole('button', { name: 'Mock Success' }))

      width = 278
      roomChanges()

      expect(box().style.transform).toBe(`scale(${278 / 300})`)
      expect(box().style.transformOrigin).toBe('top left')
      expect(box()).toHaveAttribute('data-turnstile-squeezed', 'true')
      // Still the wide widget, still the one that was mounted, token untouched.
      expect(renderedSize()).toBe('flexible')
      expect(mockWidgetMounted).toHaveBeenCalledTimes(1)
      expect(onTokenChange).not.toHaveBeenCalledWith(null)
    })

    it('goes back to full size when the room comes back', () => {
      let width = 278
      slotIs(() => width)
      // Mounted wide in a slot that could not be measured, then measured narrow.
      width = 0
      renderTurnstileField()
      width = 278
      roomChanges()
      expect(box()).toHaveAttribute('data-turnstile-squeezed', 'true')

      width = 400
      roomChanges()
      expect(box().style.transform).toBe('')
      expect(box()).toHaveAttribute('data-turnstile-squeezed', 'false')
    })

    it('leaves the compact widget in the flow and never scales it', () => {
      slotIs(288)
      renderTurnstileField()
      roomChanges()

      expect(renderedSize()).toBe('compact')
      expect(box().getAttribute('style')).toBeNull()
      expect(box().parentElement).not.toHaveClass('relative')
    })

    it('leaves the widget at full size when the slot cannot be measured', () => {
      let fail = false
      slotIs(() => {
        if (fail) throw new Error('no layout')
        return 640
      })
      renderTurnstileField()
      fail = true

      expect(() => roomChanges()).not.toThrow()
      expect(box().style.transform).toBe('')
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
    // "We will help": this widget is on the enquiry and job forms too, where
    // nothing is being booked.
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Verification did not complete. Try again, or call 01753 682707 and we will help.'
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
      'This browser cannot complete our security check. Please call 01753 682707 and we will help.'
    )
    // Nothing retries a browser that cannot run the challenge at all.
    expect(screen.queryByRole('button', { name: /try/i })).not.toBeInTheDocument()
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

  // Every form disables its button until a token exists. When Cloudflare's
  // script is blocked or never arrives it calls nothing back, so without the
  // clock the guest is left with a dead button and no explanation.
  describe('when the security check never finishes', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    function wait(ms: number) {
      act(() => {
        jest.advanceTimersByTime(ms)
      })
    }

    function panel(): HTMLElement {
      return screen.getByRole('status')
    }

    it('keeps an empty live region on the page from the start, so the message is announced when it comes', () => {
      renderTurnstileField()

      expect(panel()).toBeEmptyDOMElement()
      expect(panel()).toHaveAttribute('aria-live', 'polite')
    })

    it('says nothing for the first ten seconds', () => {
      renderTurnstileField()

      wait(9_999)

      expect(panel()).toBeEmptyDOMElement()
    })

    it('after ten seconds explains, gives the phone number as a link and offers another go', () => {
      renderTurnstileField({ phoneSource: 'test_form_recovery' })

      wait(10_000)

      expect(panel()).toHaveTextContent('Security check not completed')
      expect(panel()).toHaveTextContent('Everything you have typed is still here.')
      expect(panel()).toHaveTextContent('Call 01753 682707 and we will help.')
      expect(within(panel()).getByRole('link', { name: '01753 682707' })).toHaveAttribute('href', 'tel:+441753682707')
      expect(within(panel()).getByRole('button', { name: 'Try the security check again' })).toBeInTheDocument()
      // One message, not two.
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('does not use booking wording, because the same widget is on the enquiry and job forms', () => {
      renderTurnstileField()

      wait(10_000)

      expect(panel().textContent).not.toMatch(/book/i)
    })

    it('says nothing when the token arrives in time', () => {
      renderTurnstileField()

      wait(4_000)
      fireEvent.click(screen.getByRole('button', { name: 'Mock Success' }))
      wait(60_000)

      expect(panel()).toBeEmptyDOMElement()
    })

    it('clears the message as soon as a late token arrives', () => {
      const { onTokenChange } = renderTurnstileField()

      wait(10_000)
      expect(panel()).not.toBeEmptyDOMElement()
      fireEvent.click(screen.getByRole('button', { name: 'Mock Success' }))

      expect(panel()).toBeEmptyDOMElement()
      expect(onTokenChange).toHaveBeenLastCalledWith('token-123')
    })

    it('resets the widget and starts the wait again when the guest tries again', () => {
      const { onTokenChange } = renderTurnstileField()

      wait(10_000)
      fireEvent.click(screen.getByRole('button', { name: 'Try the security check again' }))

      expect(mockReset).toHaveBeenCalledTimes(1)
      expect(onTokenChange).toHaveBeenLastCalledWith(null)
      expect(panel()).toBeEmptyDOMElement()

      wait(9_999)
      expect(panel()).toBeEmptyDOMElement()
      wait(1)
      expect(panel()).toHaveTextContent('Security check not completed')
    })

    it('speaks up when an expired token is not replaced', () => {
      renderTurnstileField()

      fireEvent.click(screen.getByRole('button', { name: 'Mock Success' }))
      wait(300_000)
      expect(panel()).toBeEmptyDOMElement()

      fireEvent.click(screen.getByRole('button', { name: 'Mock Expire' }))
      wait(9_999)
      expect(panel()).toBeEmptyDOMElement()
      wait(1)

      expect(panel()).toHaveTextContent('Security check not completed')
    })

    it('stays quiet when an expired token is replaced, which is the ordinary case', () => {
      renderTurnstileField()

      fireEvent.click(screen.getByRole('button', { name: 'Mock Success' }))
      fireEvent.click(screen.getByRole('button', { name: 'Mock Expire' }))
      wait(800)
      fireEvent.click(screen.getByRole('button', { name: 'Mock Success' }))
      wait(60_000)

      expect(panel()).toBeEmptyDOMElement()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it.each([
      ['a failed challenge', 'Mock Error'],
      ['an unsupported browser', 'Mock Unsupported']
    ])('shows %s at once and never a second message on top of it', (_label, buttonName) => {
      renderTurnstileField()

      fireEvent.click(screen.getByRole('button', { name: buttonName }))

      expect(screen.getByRole('alert')).toHaveTextContent('01753 682707')
      wait(60_000)
      expect(panel()).toBeEmptyDOMElement()
    })

    it('renders neither message for a form that shows its own, and still reports the status', () => {
      const turnstileRef: MutableRefObject<TurnstileFieldRef> = { current: null }
      const onStatusChange = jest.fn()
      render(
        <TurnstileField
          id="test-turnstile"
          turnstileRef={turnstileRef}
          onTokenChange={jest.fn()}
          onStatusChange={onStatusChange}
          showInlineError={false}
        />
      )

      wait(10_000)
      fireEvent.click(screen.getByRole('button', { name: 'Mock Error' }))

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(onStatusChange).toHaveBeenLastCalledWith('error')
    })

    it('leaves no timer running after the form is taken off the page', () => {
      const turnstileRef: MutableRefObject<TurnstileFieldRef> = { current: null }
      const { unmount } = render(
        <TurnstileField id="test-turnstile" turnstileRef={turnstileRef} onTokenChange={jest.fn()} />
      )

      unmount()

      expect(jest.getTimerCount()).toBe(0)
    })
  })
})

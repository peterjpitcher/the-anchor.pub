import { fireEvent, render, screen } from '@testing-library/react'
import { type MutableRefObject } from 'react'
import { TurnstileField, type TurnstileFieldRef } from '@/components/security/TurnstileField'

const mockReset = jest.fn()

jest.mock('@marsidev/react-turnstile', () => {
  const React = require('react')

  return {
    Turnstile: React.forwardRef(function MockTurnstile(props: any, ref: any) {
      React.useImperativeHandle(ref, () => ({
        reset: mockReset
      }))

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

describe('TurnstileField', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

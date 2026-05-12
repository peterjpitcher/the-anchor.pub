/**
 * Tests for the CareersForm component.
 *
 * Covers: required-field validation, client-side CV checks, successful
 * submission, loading state, success reset, GDPR consent, and default
 * role pre-selection.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CareersForm } from '@/components/features/CareersForm'

// ── Mocks ────────────────────────────────────────────────────────────────────

// TurnstileField — render a hidden input that auto-provides a token
jest.mock('@/components/security/TurnstileField', () => {
  const React = require('react')

  function MockTurnstileField({
    onTokenChange,
  }: {
    id: string
    turnstileRef: React.RefObject<unknown>
    onTokenChange: (token: string | null) => void
  }) {
    React.useEffect(() => {
      onTokenChange('mock-turnstile-token')
    }, [onTokenChange])

    return <input type="hidden" data-testid="mock-turnstile" value="mock-turnstile-token" />
  }

  return {
    TurnstileField: MockTurnstileField,
    __esModule: true,
  }
})

// GTM tracking
jest.mock('@/lib/gtm-events', () => ({
  trackFormStart: jest.fn(),
  trackFormComplete: jest.fn(),
}))

import { trackFormStart, trackFormComplete } from '@/lib/gtm-events'

const mockTrackFormStart = trackFormStart as jest.MockedFunction<typeof trackFormStart>
const mockTrackFormComplete = trackFormComplete as jest.MockedFunction<typeof trackFormComplete>

// Global fetch
const mockFetch = jest.fn()

beforeAll(() => {
  ;(global as Record<string, unknown>).fetch = mockFetch
})

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Fill in all required fields so the form is valid. */
async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.type(screen.getByLabelText(/^name/i), 'Jane Smith')
  await user.type(screen.getByLabelText(/^email/i), 'jane@example.com')
  await user.type(screen.getByLabelText(/^phone/i), '07700900123')

  // Select a role via the select element
  const roleSelect = screen.getByLabelText(/role interest/i)
  await user.selectOptions(roleSelect, 'bar-staff')

  await user.type(
    screen.getByLabelText(/^experience/i),
    'I have three years of bar experience in central London pubs.'
  )

  // Check the GDPR consent checkbox
  const consent = screen.getByLabelText(/consent/i)
  if (!(consent as HTMLInputElement).checked) {
    await user.click(consent)
  }
}

function renderForm(defaultRole?: 'bar-staff' | 'kitchen-team' | 'either') {
  return render(<CareersForm defaultRole={defaultRole} />)
}

// ── Suite ────────────────────────────────────────────────────────────────────

describe('CareersForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
  })

  // 1. Required fields prevent submit (show validation errors)
  it('should show validation errors when submitting with empty fields', async () => {
    const user = userEvent.setup()
    renderForm()

    const submitButton = screen.getByRole('button', {
      name: /send application/i,
    })
    await user.click(submitButton)

    // Should display error messages for required fields
    expect(screen.getByText(/please enter your name/i)).toBeInTheDocument()
    expect(
      screen.getByText(/please enter your email/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/please enter your phone/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/please select which role/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/please tell us about your experience/i)
    ).toBeInTheDocument()

    // fetch should NOT have been called
    expect(mockFetch).not.toHaveBeenCalled()
  })

  // 2. Invalid CV type shows client-side error
  it('should show an error when a CV with an invalid extension is selected', async () => {
    renderForm()

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    const badFile = new File(['test'], 'resume.exe', {
      type: 'application/x-msdownload',
    })

    fireEvent.change(fileInput, { target: { files: [badFile] } })

    expect(
      screen.getByText(/\.pdf, \.doc, \.docx files are accepted/i)
    ).toBeInTheDocument()
  })

  // 3. Oversized CV shows client-side error
  it('should show an error when a CV exceeds the size limit', async () => {
    renderForm()

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    const largeFile = new File(['x'], 'huge.pdf', {
      type: 'application/pdf',
    })
    Object.defineProperty(largeFile, 'size', {
      value: 25 * 1024 * 1024,
    })

    fireEvent.change(fileInput, { target: { files: [largeFile] } })

    expect(screen.getByText(/too large/i)).toBeInTheDocument()
  })

  // 4. Successful submit posts FormData to /api/careers
  it('should POST FormData to /api/careers on valid submission', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const user = userEvent.setup()
    renderForm()
    await fillRequiredFields(user)

    await user.click(
      screen.getByRole('button', { name: /send application/i })
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/careers')
    expect(init.method).toBe('POST')
    expect(init.body).toBeInstanceOf(FormData)

    const fd = init.body as FormData
    expect(fd.get('name')).toBe('Jane Smith')
    expect(fd.get('email')).toBe('jane@example.com')
    expect(fd.get('role')).toBe('bar-staff')
  })

  // 5. Submit button is disabled while loading
  it('should disable the submit button while the request is in flight', async () => {
    // Return a promise that never resolves during the test
    let resolveRequest: ((value: Response) => void) | undefined
    mockFetch.mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveRequest = resolve
      })
    )

    const user = userEvent.setup()
    renderForm()
    await fillRequiredFields(user)

    await user.click(
      screen.getByRole('button', { name: /send application/i })
    )

    // The Button component replaces children with "Loading..." when loading
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /loading/i })
      expect(btn).toBeDisabled()
    })

    // Clean up: resolve the pending request
    resolveRequest?.(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })

  // 6. Success state resets the form / shows success message
  it('should show a success message after successful submission', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const user = userEvent.setup()
    renderForm()
    await fillRequiredFields(user)

    await user.click(
      screen.getByRole('button', { name: /send application/i })
    )

    await waitFor(() => {
      expect(screen.getByText(/application sent/i)).toBeInTheDocument()
    })

    // The original form fields should no longer be visible
    expect(screen.queryByLabelText(/^name/i)).not.toBeInTheDocument()
  })

  // 7. GDPR checkbox is required
  it('should show a consent error when GDPR checkbox is not checked', async () => {
    const user = userEvent.setup()
    renderForm()

    // Fill everything except consent
    await user.type(screen.getByLabelText(/^name/i), 'Jane Smith')
    await user.type(screen.getByLabelText(/^email/i), 'jane@example.com')
    await user.type(screen.getByLabelText(/^phone/i), '07700900123')
    await user.selectOptions(screen.getByLabelText(/role interest/i), 'bar-staff')
    await user.type(
      screen.getByLabelText(/^experience/i),
      'I have three years of bar experience in central London pubs.'
    )

    await user.click(
      screen.getByRole('button', { name: /send application/i })
    )

    expect(
      screen.getByText(/must consent to data processing/i)
    ).toBeInTheDocument()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  // 8. Default role prop pre-selects the dropdown
  it('should pre-select the role when defaultRole prop is provided', () => {
    renderForm('kitchen-team')

    const roleSelect = screen.getByLabelText(
      /role interest/i
    ) as HTMLSelectElement
    expect(roleSelect.value).toBe('kitchen-team')
  })
})

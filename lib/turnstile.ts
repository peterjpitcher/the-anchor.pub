import { logError } from '@/lib/error-handling'
import { reportFailure } from '@/lib/report-failure'
import { SECURITY_CHECK_REQUIRED_MESSAGE } from '@/lib/guest-error-messages'

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

type TurnstileVerifyResult = {
  success: boolean
  error?: string
}

export async function verifyTurnstileToken(token: string | null | undefined): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    // No secret configured, block the request rather than silently allowing it.
    // Set TURNSTILE_SECRET_KEY in Vercel env vars to enable verification.
    //
    // Failing closed is right, but it takes every booking and enquiry form
    // down at once, so it is reported: this branch used to log nothing and
    // tell the guest to "try again later" with no number to ring.
    await reportFailure({ route: 'lib/turnstile', status: null, reason: 'TURNSTILE_SECRET_MISSING' })
    return {
      success: false,
      error: 'We cannot take this online at the moment. Please call 01753 682707 and we will sort it out over the phone.'
    }
  }

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    // The phone number matters here: a guest whose browser never loaded the
    // widget has no token to send and nothing they can do about it online.
    return {
      success: false,
      error: SECURITY_CHECK_REQUIRED_MESSAGE
    }
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token })
    })

    const result = await response.json()
    if (result.success === true) {
      return { success: true }
    }

    // Log the codes Cloudflare gives us. Without them a rejection is
    // indistinguishable from every other rejection, and the difference matters:
    // `invalid-input-secret` means the key pair is wrong (an outage for every
    // guest), `timeout-or-duplicate` means an expired or already-spent token
    // (one guest, retryable). The codes carry no personal data.
    logError('lib/turnstile/verify-rejected', new Error('Turnstile rejected the token'), {
      errorCodes: Array.isArray(result?.['error-codes']) ? result['error-codes'] : []
    })

    return { success: false, error: 'Security check failed. Please try again, or call 01753 682707.' }
  } catch (error) {
    // Fail closed, if Turnstile is unreachable, reject the request.
    // Legitimate users can retry; bots are blocked.
    logError('lib/turnstile/verify-unreachable', error)
    return {
      success: false,
      error: 'Security verification unavailable. Please try again in a moment, or call 01753 682707.'
    }
  }
}

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

type TurnstileVerifyResult = {
  success: boolean
  error?: string
}

export async function verifyTurnstileToken(token: string | null | undefined): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    // If no secret is configured, skip validation (allows gradual rollout)
    return { success: true }
  }

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return { success: false, error: 'Please complete the security check before submitting.' }
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

    return { success: false, error: 'Security check failed. Please try again.' }
  } catch {
    // Fail closed — if Turnstile is unreachable, reject the request.
    // Legitimate users can retry; bots are blocked.
    return { success: false, error: 'Security verification unavailable. Please try again in a moment.' }
  }
}

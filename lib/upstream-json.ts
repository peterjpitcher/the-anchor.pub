export function safeJsonParse(input: string): unknown {
  try {
    return JSON.parse(input)
  } catch {
    return null
  }
}

export function getSafeUpstreamErrorMessage(rawText: string, fallback: string): string {
  const trimmed = rawText.trim()
  if (trimmed.length === 0) {
    return fallback
  }

  const lower = trimmed.toLowerCase()
  if (lower.startsWith('<!doctype html') || lower.startsWith('<html')) {
    return fallback
  }

  // Avoid returning very large opaque payloads to end users.
  if (trimmed.length > 500) {
    return fallback
  }

  return trimmed
}


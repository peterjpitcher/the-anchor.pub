const DEFAULT_MANAGEMENT_API_BASE_URL = 'https://management.orangejelly.co.uk/api'

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '')
}

export function getManagementApiBaseUrl(): string {
  const configuredBaseUrl = (process.env.ANCHOR_API_BASE_URL || DEFAULT_MANAGEMENT_API_BASE_URL).trim()
  const normalizedBaseUrl = trimTrailingSlashes(configuredBaseUrl)

  if (normalizedBaseUrl.length === 0) {
    return DEFAULT_MANAGEMENT_API_BASE_URL
  }

  if (normalizedBaseUrl.endsWith('/api')) {
    return normalizedBaseUrl
  }

  return `${normalizedBaseUrl}/api`
}


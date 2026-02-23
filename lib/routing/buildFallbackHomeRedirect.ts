export type FallbackHomeSearchParams = Record<string, string | string[] | undefined>

export function buildFallbackHomeRedirect(searchParams: FallbackHomeSearchParams = {}): string {
  const params = new URLSearchParams()

  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      params.append(key, value)
      return
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        params.append(key, entry)
      })
    }
  })

  const query = params.toString()
  return query ? `/?${query}` : '/'
}

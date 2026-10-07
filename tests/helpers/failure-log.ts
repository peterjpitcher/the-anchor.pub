/**
 * Reads what lib/report-failure.ts really wrote.
 *
 * The route tests do not mock the reporter. They let it run and read the log
 * line it produced, because "no personal data" is a claim about the line that
 * reaches the log, not about the arguments a route passed in.
 */

export const FAILURE_PREFIX = '[write-failure] '
export const ALERT_PREFIX = '[write-failure-alert] '

export type CapturedFailureLog = {
  /** Every `[write-failure]` line, parsed. */
  lines: () => Array<Record<string, unknown>>
  /** Every `[write-failure-alert]` line, parsed. */
  alertLines: () => Array<Record<string, unknown>>
  /** Everything written to console.error, as one string, for "does not contain". */
  everything: () => string
  restore: () => void
}

export function captureFailureLog(): CapturedFailureLog {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined)

  const written = (): string[] =>
    spy.mock.calls.map((call) =>
      call.map((part) => (typeof part === 'string' ? part : part instanceof Error ? `${part.name}: ${part.message}` : JSON.stringify(part))).join(' ')
    )

  const parse = (prefix: string) =>
    written()
      .filter((entry) => entry.startsWith(prefix))
      .map((entry) => JSON.parse(entry.slice(prefix.length)) as Record<string, unknown>)

  return {
    lines: () => parse(FAILURE_PREFIX),
    alertLines: () => parse(ALERT_PREFIX),
    everything: () => written().join('\n'),
    restore: () => spy.mockRestore()
  }
}

/**
 * Fails if any of the given personal values appears in the text. Values are
 * checked as typed and with spaces removed, so "AB12 CDE" also catches "AB12CDE".
 */
export function expectNoPersonalData(text: string, personal: ReadonlyArray<string>): void {
  for (const value of personal) {
    expect(text).not.toContain(value)
    const squashed = value.replace(/\s+/g, '')
    if (squashed !== value) expect(text).not.toContain(squashed)
  }
}

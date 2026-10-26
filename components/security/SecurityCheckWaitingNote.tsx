export const SECURITY_CHECK_WAITING_MESSAGE = 'Waiting for the security check.'

/**
 * The line under a submit button that is waiting for a security check token.
 *
 * The button stays focusable while it waits (Button's `unavailable`), so it
 * needs a reason a keyboard or screen reader user can reach: give the button
 * `aria-describedby={id}`. For the first ten seconds this is the only thing on
 * screen that says why the button does nothing; after that the widget's own
 * help panel appears as well (review BK-198).
 *
 * Always rendered, and only its words change, so the region is already on the
 * page when the wait is announced. Empty, it is out of the layout.
 */
export function SecurityCheckWaitingNote({ id, waiting }: { id: string; waiting: boolean }) {
  return (
    <p id={id} role="status" className={waiting ? 'text-sm text-ink-muted' : 'sr-only'}>
      {waiting ? SECURITY_CHECK_WAITING_MESSAGE : ''}
    </p>
  )
}

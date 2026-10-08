import { getFestiveKitchenStatus, getFestiveKitchenWording } from '@/lib/festive-kitchen-closure'

export interface FestiveKitchenNoticeProps {
  /** For tests. Defaults to the moment the page is rendered. */
  now?: Date
  className?: string
}

/**
 * The dated exception beside any "Sundays, 1pm to 6pm" food promise.
 *
 * Renders the kitchen sentence from SSOT section 16 ("Our kitchen's last day of
 * the year is Sunday 20 December, and it's back on Tuesday 12 January.") from
 * 30 days before the kitchen's last day until the day before it is back, and
 * nothing at all the rest of the year. Nobody has to add it or take it down.
 *
 * A server component with no props to remember: drop it under the promise.
 */
export function FestiveKitchenNotice({ now, className = '' }: FestiveKitchenNoticeProps): React.JSX.Element | null {
  const status = getFestiveKitchenStatus(now)
  const wording = getFestiveKitchenWording()
  if (status.state === 'none' || !wording) return null

  return (
    <p
      role="note"
      className={`rounded-card border border-line bg-surface-sunk px-4 py-3 text-sm font-medium text-ink-strong ${className}`.trim()}
    >
      {status.state === 'closed' ? 'No roasts or food just now. ' : ''}
      {wording} The bar stays open.
    </p>
  )
}

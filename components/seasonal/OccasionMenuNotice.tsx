export interface OccasionMenuNoticeProps {
  /** The occasion as it reads in a sentence, for example "Easter Sunday". */
  occasion: string
  className?: string
}

/**
 * The line that keeps an occasion page honest about its menu.
 *
 * Owner, 7 October 2026: Mother's Day, Easter Sunday and Father's Day are
 * special days, not normal Sundays. The roast may be the same, but a set menu
 * or something different may run, confirmed for each nearer the time.
 *
 * So until the day's menu is confirmed, each of those pages says so near the
 * top, and its "what is on the menu" answer uses OCCASION_MENU_ANSWER.
 */
export function occasionMenuLine(occasion: string): string {
  return `The menu for ${occasion} is confirmed nearer the time. It may be our Sunday roast, or a set menu for the day.`
}

export function OccasionMenuNotice({ occasion, className = '' }: OccasionMenuNoticeProps): React.JSX.Element {
  return (
    <div className="bg-surface">
      <div className="container">
        <p
          role="note"
          className={`my-3 rounded-card border border-line bg-surface-sunk px-4 py-3 text-sm font-medium text-ink-strong ${className}`.trim()}
        >
          {occasionMenuLine(occasion)}
        </p>
      </div>
    </div>
  )
}

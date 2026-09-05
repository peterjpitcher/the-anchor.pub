import Link from 'next/link'

/** Generic tournament promotion: service promises belong to individual fixtures. */
export function TournamentLink() {
  return <aside className="container py-6" aria-label="Nations Championship rugby">
    <div className="flex flex-col gap-4 rounded-card border border-line bg-surface-sunk p-5 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="font-display text-xl font-bold text-ink-strong">Nations Championship rugby</p><p className="mt-1 text-sm text-ink-muted">Find your game, check opening and food service times, then book your table.</p></div>
      <Link href="/live-sport/nations-championship" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-pill bg-anchor-green px-5 py-3 text-center font-semibold text-white">Choose a game and book</Link>
    </div>
  </aside>
}

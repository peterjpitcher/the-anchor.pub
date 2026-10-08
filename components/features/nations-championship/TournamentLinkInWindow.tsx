'use client'

import { useEffect, useState } from 'react'
import { isNationsChampionshipPromoOpen } from '@/lib/nations-championship/promo-window'
import { TournamentLink } from './TournamentLink'

interface TournamentLinkInWindowProps {
  /** Whether the window was open when the page was rendered on the server. */
  initiallyOpen: boolean
}

/**
 * The Nations Championship strip, shown only while the tournament is being
 * promoted (owner decision, 7 October 2026: it comes off every page that carries it
 * when the header link ends).
 *
 * The server decides first so the strip is in the HTML. The browser checks
 * again, because the page's HTML can be older than the visitor's clock: pages
 * are rebuilt on a five-minute timer, but only when somebody visits, so the
 * first visitor after a quiet spell gets the copy built before it. Navigation
 * does the same for the header link.
 */
export function TournamentLinkInWindow({ initiallyOpen }: TournamentLinkInWindowProps) {
  const [open, setOpen] = useState(initiallyOpen)

  useEffect(() => {
    setOpen(isNationsChampionshipPromoOpen())
  }, [])

  return open ? <TournamentLink /> : null
}

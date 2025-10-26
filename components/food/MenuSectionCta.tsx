'use client'

import { MouseEvent } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { trackContextCtaClick } from '@/lib/gtm-events'

interface MenuSectionCtaProps {
  label: string
  href?: string
  scrollToId?: string
  analyticsLabel: 'preorder_roast' | 'pizza_2for1' | 'view_roast_menu' | 'deal_details' | 'book_dinner' | 'dietary_picks' | 'near_heathrow' | 'view_full_menu'
  location: string
  variant?: 'primary' | 'secondary' | 'outline'
  fullWidth?: boolean
}

export function MenuSectionCta({
  label,
  href,
  scrollToId,
  analyticsLabel,
  location,
  variant = 'secondary',
  fullWidth = false
}: MenuSectionCtaProps) {
  const destination = href ?? (scrollToId ? `#${scrollToId}` : '')
  const mode = scrollToId ? 'scroll' : 'link'

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    trackContextCtaClick({
      label,
      destination,
      context: analyticsLabel,
      location,
      mode
    })

    if (scrollToId) {
      event.preventDefault()
      const target = document.getElementById(scrollToId)
      if (!target) return
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      })
      if (history.replaceState) {
        history.replaceState(null, '', `#${scrollToId}`)
      }
    }
  }

  const buttonContent = href ? (
    <Link href={href} onClick={handleClick}>
      {label}
    </Link>
  ) : (
    <a href={destination || '#'} onClick={handleClick}>
      {label}
    </a>
  )

  return (
    <Button
      asChild
      variant={variant}
      size="lg"
      fullWidth={fullWidth}
      className="min-w-[200px]"
    >
      {buttonContent}
    </Button>
  )
}

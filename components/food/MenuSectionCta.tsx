'use client'

import { MouseEvent } from 'react'
import { Button } from '@/components/ui'
import { useRouter } from 'next/navigation'
import { trackContextCtaClick } from '@/lib/gtm-events'
import { cn } from '@/lib/utils'

interface MenuSectionCtaProps {
  label: string
  href?: string
  scrollToId?: string
  analyticsLabel: 'preorder_roast' | 'pizza_menu' | 'view_roast_menu' | 'book_dinner' | 'dietary_picks' | 'near_heathrow' | 'view_full_menu'
  location: string
  variant?: 'primary' | 'outline' | 'ghost'
  fullWidth?: boolean
  className?: string
}

export function MenuSectionCta({
  label,
  href,
  scrollToId,
  analyticsLabel,
  location,
  variant = 'outline',
  fullWidth = false,
  className
}: MenuSectionCtaProps) {
  const router = useRouter()
  const destination = href ?? (scrollToId ? `#${scrollToId}` : '')
  const mode = scrollToId ? 'scroll' : 'link'

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
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
      return
    }

    if (href) {
      event.preventDefault()
      if (href.startsWith('http')) {
        window.location.assign(href)
      } else {
        router.push(href)
      }
    }
  }

  return (
    <Button
      variant={variant}
      size="lg"
      fullWidth={fullWidth}
      className={cn('w-full sm:w-auto sm:min-w-[200px]', className)}
      onClick={handleClick}
      data-destination={destination}
    >
      {label}
    </Button>
  )
}

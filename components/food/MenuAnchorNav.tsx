'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { trackAnchorNavClick } from '@/lib/gtm-events'
import { cn } from '@/lib/utils'

interface AnchorLink {
  id: string
  label: string
  icon?: string
}

interface MenuAnchorNavProps {
  links: AnchorLink[]
  className?: string
}

export function MenuAnchorNav({ links, className }: MenuAnchorNavProps) {
  const [activeId, setActiveId] = useState<string>(links[0]?.id ?? '')

  const deviceType = useMemo(() => {
    if (typeof window === 'undefined') return 'unknown'
    return window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
  }, [])

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, link: AnchorLink) => {
      event.preventDefault()
      const target = document.getElementById(link.id)
      if (!target) return

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })

      if (history.replaceState) {
        history.replaceState(null, '', `#${link.id}`)
      } else {
        window.location.hash = link.id
      }

      trackAnchorNavClick({
        section: link.id,
        deviceType,
        location: 'food-menu-anchor-nav'
      })
    },
    [deviceType]
  )

  useEffect(() => {
    const sectionIds = links.map(link => link.id)
    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-40% 0px -40% 0px',
        threshold: [0.3, 0.5, 0.7]
      }
    )

    sections.forEach(section => observer.observe(section))

    return () => observer.disconnect()
  }, [links])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const { hash } = window.location
    if (!hash) return
    const id = hash.replace('#', '')
    const target = document.getElementById(id)
    if (target) {
      setActiveId(id)
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return (
    <div
      className={cn(
        'relative',
        className
      )}
    >
      <div
        role="tablist"
        aria-label="Food menu sections"
        className="flex gap-3 overflow-x-auto whitespace-nowrap rounded-full bg-surface/90 px-2 py-3 shadow-md ring-1 ring-line backdrop-blur supports-[backdrop-filter]:backdrop-blur"
      >
        {links.map(link => {
          const isActive = activeId === link.id
          return (
            <button
              key={link.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={link.id}
              onClick={event => handleClick(event, link)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-anchor-gold-dark',
                isActive
                  ? 'bg-anchor-green text-white shadow-lg'
                  : 'bg-surface-sunk text-ink hover:bg-anchor-green/10 hover:text-accent-text'
              )}
            >
              {link.icon && <span aria-hidden="true" className="text-base">{link.icon}</span>}
              <span>{link.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const menuLinks = [
  { href: '/food-menu', label: 'Full Menu', badge: null, badgeColor: null },
  { href: '/food-menu/vegetarian', label: 'Vegetarian', badge: 'V', badgeColor: 'emerald' },
  { href: '/food-menu/vegan', label: 'Vegan', badge: 'VE', badgeColor: 'emerald' },
  { href: '/food-menu/gluten-free', label: 'Gluten-Free', badge: 'GF', badgeColor: 'green' },
] as const

export function DietaryMenuNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-6">
      {menuLinks.map(({ href, label, badge }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-medium min-h-[44px] border-[1.5px] transition-colors',
              isActive
                ? 'bg-anchor-green border-anchor-green text-white'
                : 'bg-surface border-line-strong text-ink hover:border-line-gold'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {badge && <span className="text-xs font-bold">{badge}</span>}
            {label}
          </Link>
        )
      })}
      <a
        href="/downloads/the-anchor-menu-march-2026.pdf"
        download
        className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] bg-surface border-[1.5px] border-line-strong rounded-pill text-accent-text hover:border-line-gold transition-colors text-sm font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        PDF
      </a>
    </div>
  )
}

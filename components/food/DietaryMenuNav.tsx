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
      {menuLinks.map(({ href, label, badge, badgeColor }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? badgeColor === 'green'
                  ? 'bg-anchor-green/20 border border-anchor-green text-anchor-green'
                  : badge
                    ? 'bg-emerald-400/20 border border-emerald-400 text-emerald-400'
                    : 'bg-anchor-gold/20 border border-anchor-gold text-anchor-gold'
                : badgeColor === 'green'
                  ? 'bg-anchor-green/10 border border-anchor-green/30 text-anchor-green hover:bg-anchor-green/20'
                  : badge
                    ? 'bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/20'
                    : 'bg-anchor-gold/10 border border-anchor-gold/30 text-anchor-gold hover:bg-anchor-gold/20'
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
        className="inline-flex items-center gap-2 px-4 py-2 bg-anchor-gold/10 border border-anchor-gold/30 rounded-lg text-anchor-gold hover:bg-anchor-gold/20 transition-colors text-sm font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        PDF
      </a>
    </div>
  )
}

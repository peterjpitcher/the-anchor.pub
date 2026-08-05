'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const menuLinks = [
  { href: '/food-menu', label: 'Full Menu', badge: null, badgeColor: null },
  { href: '/food-menu/vegetarian', label: 'Vegetarian', badge: 'V', badgeColor: 'emerald' },
  { href: '/food-menu/vegan', label: 'Vegan', badge: 'VE', badgeColor: 'emerald' },
  { href: '/food-menu/gluten-free', label: 'NGCI', badge: null, badgeColor: null },
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
    </div>
  )
}

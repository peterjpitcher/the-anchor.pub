import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { buildBreadcrumbItemList, type BreadcrumbItem } from '@/lib/breadcrumb-schema'

export type { BreadcrumbItem }

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  theme?: 'light' | 'dark'
  className?: string
  showHome?: boolean
}

export function Breadcrumbs({ 
  items, 
  theme = 'dark',
  className,
  showHome = true 
}: BreadcrumbsProps) {
  // Build the full breadcrumb trail
  const breadcrumbTrail: BreadcrumbItem[] = showHome 
    ? [{ name: 'Home', href: '/' }, ...items]
    : items

  // Generate schema. Every ListItem must carry an `item` URL; section-only
  // paths without a canonical page are dropped (see lib/breadcrumb-schema).
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": buildBreadcrumbItemList(breadcrumbTrail)
  }

  const textColor = theme === 'dark' ? 'text-white/70' : 'text-anchor-cream-text/65'
  const hoverColor = theme === 'dark' ? 'hover:text-white' : 'hover:text-anchor-gold'
  const currentColor = theme === 'dark' ? 'text-white' : 'text-anchor-gold-vivid'
  const iconColor = theme === 'dark' ? 'text-white/50' : 'text-anchor-cream-text/45'

  return (
    <>
      {/* Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(breadcrumbSchema) }}
      />
      
      {/* Visual breadcrumbs */}
      <nav 
        aria-label="Breadcrumb"
        className={cn('flex items-center space-x-1 text-sm', className)}
      >
        <ol className="flex items-center space-x-1">
          {breadcrumbTrail.map((item, index) => {
            const isLast = index === breadcrumbTrail.length - 1
            
            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight 
                    className={cn('w-4 h-4 mx-1 flex-shrink-0', iconColor)} 
                    aria-hidden="true"
                  />
                )}
                
                {isLast ? (
                  <span 
                    className={cn('font-medium', currentColor)}
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'transition-colours',
                      textColor,
                      hoverColor
                    )}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span className={textColor}>{item.name}</span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}

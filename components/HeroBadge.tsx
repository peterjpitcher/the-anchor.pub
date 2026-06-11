import { Badge } from '@/components/ui/primitives/Badge'
import { cn } from '@/lib/utils'
import ssot from '@/SSOT.json'

// Pull badge content from SSOT.json at build time (per D-03)
const GOOGLE_RATING = ssot.ratings.google.rating
const GOOGLE_REVIEW_COUNT = ssot.ratings.google.review_count

interface HeroBadgeProps {
  className?: string
  badgeClassName?: string
  reviewBadgeClassName?: string
}

/**
 * HeroBadge — displays the standard set of trust badges (Google rating, review count).
 * All pages show the same badges (per D-02). Content comes from SSOT.json (per D-03).
 * Wraps the Badge primitive (per D-01).
 */
export function HeroBadge({ className, badgeClassName, reviewBadgeClassName }: HeroBadgeProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-2', className)}>
      <Badge variant="green" className={badgeClassName}>
        {GOOGLE_RATING}/5 on Google
      </Badge>
      <Badge variant="outline" className={reviewBadgeClassName || badgeClassName}>
        {GOOGLE_REVIEW_COUNT} reviews
      </Badge>
    </div>
  )
}

// --- Item badge (legacy HeroBadge API) ---
// Used by ManagersSpecial.tsx and MenuRenderer.tsx for menu item badges (NEW, Featured, etc.)
// Routes through the Badge primitive instead of inline styles.

const itemBadgeVariantMap: Record<string, 'danger' | 'gold' | 'success' | 'green'> = {
  new: 'danger',
  featured: 'gold',
  special: 'success',
  limited: 'green'
}

interface ItemBadgeProps {
  text?: string
  variant?: 'new' | 'featured' | 'special' | 'limited'
  position?: 'absolute' | 'inline'
  className?: string
}

/**
 * ItemBadge — badge overlay for menu items (NEW, 25% OFF, etc.)
 * Backward-compatible replacement for the old HeroBadge item-badge API.
 */
export function ItemBadge({
  text = 'NEW',
  variant = 'new',
  position = 'absolute',
  className = ''
}: ItemBadgeProps) {
  if (position === 'absolute') {
    return (
      <Badge
        variant={itemBadgeVariantMap[variant] || 'danger'}
        className={cn(
          'absolute -top-2 -left-2 z-10 transform -rotate-12 shadow-md uppercase hidden md:inline-flex',
          className
        )}
      >
        {text}
      </Badge>
    )
  }

  // Inline version for mobile
  return (
    <Badge
      variant={itemBadgeVariantMap[variant] || 'danger'}
      className={cn('ml-3 uppercase md:hidden', className)}
    >
      {text}
    </Badge>
  )
}

// Preserve HeroItem export for backward compatibility with ManagersSpecial and MenuRenderer.
// HeroItem wraps children with an ItemBadge overlay.
interface HeroItemProps {
  children: React.ReactNode
  badgeText?: string
  badgeVariant?: 'new' | 'featured' | 'special' | 'limited'
  showBadge?: boolean
  className?: string
}

export function HeroItem({
  children,
  badgeText = 'NEW',
  badgeVariant = 'new',
  showBadge = false,
  className = ''
}: HeroItemProps) {
  if (!showBadge) {
    return <>{children}</>
  }

  return (
    <div className={cn('relative', className)}>
      <ItemBadge text={badgeText} variant={badgeVariant} position="absolute" />
      {children}
    </div>
  )
}

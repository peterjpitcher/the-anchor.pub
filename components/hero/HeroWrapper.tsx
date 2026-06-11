import { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { HeroSectionServer } from './HeroSectionServer'
import type { HeroSize, HeroImageConfig } from './HeroSection'
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs'
import { HeroTag } from './HeroTag'
import {
  HERO_VARIANTS,
  HERO_STATUS_BAR_THEMES,
  HERO_CTA_LAYOUTS,
  HERO_TAG_APPEARANCES,
  type HeroVariantName,
  type HeroCtaLayoutKey,
  type HeroStatusBarThemeKey
} from './heroVariants'
import { getPageHeaderImage, getDefaultHeaderImage } from '@/lib/page-header-images'
import { StatusBar } from '@/components/layout/StatusBar'
import { cn } from '@/lib/utils'
import { getSeasonalAltText, getSeasonalFocal, getSeasonalHomepageImage } from '@/lib/seasonal-utils'
import { SmartCTAs } from './SmartCTAs'
import type { Event } from '@/lib/api'

interface HeroTagConfig {
  label: string
  icon?: ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  className?: string
}

interface HeroWrapperProps {
  // Route & content
  route: string
  title: string | ReactNode
  description?: string | ReactNode
  eyebrow?: ReactNode
  lead?: ReactNode
  titleClassName?: string

  // Variant driven styling
  variant?: HeroVariantName

  /**
   * Advanced: override the size defined by the active variant.
   */
  size?: HeroSize
  /**
   * Advanced: override layout alignment for bespoke art direction.
   */
  alignment?: 'left' | 'center' | 'right'
  /**
   * Advanced: override the overlay wash.
   */
  overlay?: 'light' | 'medium' | 'dark' | 'gradient'
  style?: CSSProperties

  image?: HeroImageConfig
  /**
   * Controls when the global seasonal image is allowed to replace route imagery.
   * `auto` only allows seasonal fallback on the homepage when no route image exists.
   */
  seasonalFallback?: 'auto' | 'always' | 'never'

  // Features
  breadcrumbs?: BreadcrumbItem[]
  showBreadcrumbs?: boolean
  tags?: HeroTagConfig[]
  showStatusBar?: boolean
  statusBarPosition?: 'above' | 'below' | 'none'
  statusBarVariant?: 'default' | 'compact' | 'navigation' | 'hero'
  statusBarTheme?: {
    background?: string
    border?: string
    text?: string
    accentText?: string
  }
  statusBarThemeToken?: HeroStatusBarThemeKey
  statusBarShowKitchen?: boolean

  // Actions
  primaryCta?: ReactNode
  secondaryCta?: ReactNode
  secondaryInfo?: ReactNode
  ctaLayout?: HeroCtaLayoutKey
  ctaContainerClassName?: string
  ctaContainerProps?: HTMLAttributes<HTMLDivElement> & Record<string, unknown>

  /**
   * Advanced escape hatch: bypass variant CTA handling entirely.
   */
  cta?: ReactNode

  // Custom content (legacy)
  children?: ReactNode

  /** Opt-in: render smart context-aware CTAs when no page CTA props provided */
  enableSmartCtas?: boolean
  /**
   * Deprecated compatibility prop.
   *
   * The live context strip duplicated the global header status and was removed
   * sitewide because it confused visitors when kitchen status changed.
   */
  showContextStrip?: boolean
  /** Upcoming events for smart CTA and context strip awareness */
  heroEvents?: Event[]

  // Styling
  className?: string
  contentClassName?: string
  id?: string
}

const DEFAULT_VARIANT: HeroVariantName = 'default'

export function HeroWrapper({
  route,
  title,
  description,
  eyebrow,
  lead,
  titleClassName,
  variant = DEFAULT_VARIANT,
  size,
  alignment,
  overlay,
  style,
  image,
  seasonalFallback = 'auto',
  breadcrumbs,
  showBreadcrumbs = true,
  tags,
  showStatusBar,
  statusBarPosition,
  statusBarVariant,
  statusBarTheme,
  statusBarThemeToken,
  statusBarShowKitchen = true,
  primaryCta,
  secondaryCta,
  secondaryInfo,
  ctaLayout,
  ctaContainerClassName,
  ctaContainerProps,
  cta,
  children,
  enableSmartCtas = false,
  heroEvents,
  className,
  contentClassName,
  id
}: HeroWrapperProps) {
  const variantConfig = HERO_VARIANTS[variant] ?? HERO_VARIANTS[DEFAULT_VARIANT]

  const resolvedSize = size ?? variantConfig.size
  const resolvedAlignment = alignment ?? variantConfig.alignment
  const resolvedOverlay = overlay ?? variantConfig.overlay
  const resolvedShowStatusBar = typeof showStatusBar === 'boolean' ? showStatusBar : variantConfig.showStatusBar
  const resolvedStatusBarPosition = statusBarPosition ?? variantConfig.statusBarPosition
  const resolvedStatusBarVariant = statusBarVariant ?? variantConfig.statusBarVariant
  const resolvedStatusBarThemeToken = statusBarThemeToken ?? variantConfig.statusBarTheme
  const resolvedCtaLayoutKey: HeroCtaLayoutKey = ctaLayout ?? variantConfig.ctaLayout
  const ctaLayoutConfig = HERO_CTA_LAYOUTS[resolvedCtaLayoutKey] ?? HERO_CTA_LAYOUTS['inline-center']

  // StatusBar now self-styles via its `nav`/`pill` variants (redesign §5.6); the old
  // per-hero theme tokens and variant union are no longer forwarded. These remain
  // resolved (and referenced below) so the existing hero prop surface stays intact.
  const statusThemeBase = HERO_STATUS_BAR_THEMES[resolvedStatusBarThemeToken]
  const heroStatusTheme = {
    ...statusThemeBase,
    ...statusBarTheme
  }
  void heroStatusTheme
  void resolvedStatusBarVariant

  // Determine imagery
  const headerImage = getPageHeaderImage(route) || getDefaultHeaderImage(route)
  const { isFallback: _ignoredFallback, ...headerImageConfig } = headerImage
  const isHomepageRoute = route === '/'
  const shouldUseSeasonalImage =
    !image &&
    (seasonalFallback === 'always' ||
      (seasonalFallback === 'auto' && isHomepageRoute && headerImage.resolution === 'default'))

  if (shouldUseSeasonalImage && process.env.NODE_ENV !== 'production') {
    console.warn(
      `HeroWrapper: using seasonal homepage image for route "${route}". ` +
      'Add a page-specific image under public/images/page-headers or pass the `image` prop to HeroWrapper to suppress this warning.'
    )
  }

  if (process.env.NODE_ENV !== 'production' && !shouldUseSeasonalImage && headerImage.resolution === 'default') {
    console.warn(
      `HeroWrapper: route "${route}" is using the default header image. ` +
      'Add a page-specific image, configure an alias in `lib/page-header-images.ts`, or set `seasonalFallback="always"` if this is intentional.'
    )
  }

  const seasonalImage = shouldUseSeasonalImage ? getSeasonalHomepageImage() : null
  const focal = seasonalImage ? getSeasonalFocal(seasonalImage.season) : null

  // Avoid leaking blur data when a custom image replaces the base src.
  const imageOverridesBaseSrc = Boolean(image?.src && image.src !== headerImageConfig.src)
  const safeHeaderImageConfig = imageOverridesBaseSrc
    ? { ...headerImageConfig, blurDataURL: undefined }
    : headerImageConfig

  const seasonalStyle: CSSProperties | undefined = seasonalImage
    ? ({
      '--hero-ox': `${focal?.x ?? 50}%`,
      '--hero-oy-mobile': `${focal?.yMobile ?? 50}%`,
      '--hero-oy-desktop': `${focal?.yDesktop ?? 50}%`
    } as CSSProperties)
    : undefined

  const baseImageConfig = seasonalImage ? {} : safeHeaderImageConfig
  const resolvedImage: HeroImageConfig = {
    ...baseImageConfig,
    src: seasonalImage ? seasonalImage.src : headerImageConfig.src,
    alt: seasonalImage ? getSeasonalAltText(seasonalImage.season) : headerImageConfig.alt,
    priority: true,
    ...(seasonalImage ? { fallbackSrc: seasonalImage.fallback } : {}),
    ...image
  }

  const mergedStyle: CSSProperties | undefined = seasonalImage ? { ...seasonalStyle, ...style } : style

  const heroClassName = cn(className, seasonalImage && 'hero-focal')
  const resolvedContentClassName = cn(variantConfig.contentClassName, contentClassName)

  // Breadcrumbs
  const breadcrumbItems = breadcrumbs || generateBreadcrumbsFromRoute(route)

  // CTA composition
  const hasStructuredCtaApi = Boolean(primaryCta || secondaryCta || secondaryInfo)
  const resolvedSecondaryInfo = secondaryInfo ?? (hasStructuredCtaApi ? children : undefined)
  const structuredCtaContent = hasStructuredCtaApi ? (
    <div
      className={cn(ctaLayoutConfig.container, ctaContainerClassName)}
      data-hero-cta-layout={resolvedCtaLayoutKey}
      {...ctaContainerProps}
    >
      {primaryCta && (
        <div className={ctaLayoutConfig.primary ?? 'flex justify-center'}>
          {primaryCta}
        </div>
      )}
      {secondaryCta && (
        <div className={ctaLayoutConfig.secondary ?? 'flex flex-col gap-3 sm:flex-row sm:flex-wrap'}>
          {secondaryCta}
        </div>
      )}
      {resolvedSecondaryInfo && (
        <div className={ctaLayoutConfig.info ?? 'text-sm text-white/80 text-center'}>
          {resolvedSecondaryInfo}
        </div>
      )}
    </div>
  ) : undefined

  const ctaContent = structuredCtaContent ?? cta

  // Smart CTAs: only when explicitly opted in AND no page CTA overrides exist
  const hasAnyCTAOverride = Boolean(primaryCta || secondaryCta || cta)
  const shouldUseSmartCtas = enableSmartCtas && !hasAnyCTAOverride

  const resolvedCtaContent = shouldUseSmartCtas
    ? <SmartCTAs route={route} heroEvents={heroEvents} />
    : ctaContent

  const shouldRenderStatusBarAbove = resolvedShowStatusBar && resolvedStatusBarPosition === 'above'
  const shouldRenderStatusBarBelow = resolvedShowStatusBar && resolvedStatusBarPosition === 'below'
  const hasHeroActions = Boolean(resolvedCtaContent) || shouldRenderStatusBarAbove || shouldRenderStatusBarBelow

  const alignmentClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }[resolvedAlignment]

  const heroCta = hasHeroActions ? (
    <>
      {shouldRenderStatusBarAbove && (
        <div className={cn('mb-6 w-full flex', alignmentClass)}>
          <StatusBar variant="pill" showKitchen={statusBarShowKitchen} />
        </div>
      )}
      {resolvedCtaContent}
      {shouldRenderStatusBarBelow && (
        <div className={cn('w-full flex', resolvedCtaContent ? 'mt-6' : 'mt-0', alignmentClass)}>
          <StatusBar variant="pill" showKitchen={statusBarShowKitchen} />
        </div>
      )}
    </>
  ) : undefined

  const variantTagClassName =
    variantConfig.tagAppearance ? HERO_TAG_APPEARANCES[variantConfig.tagAppearance] : undefined
  const variantTagSize = variantConfig.tagSize

  const legacyChildren = hasStructuredCtaApi ? undefined : children

  return (
    <HeroSectionServer
      title={title}
      description={description}
      eyebrow={eyebrow}
      lead={lead}
      titleClassName={titleClassName}
      image={{
        ...resolvedImage
      }}
      size={resolvedSize}
      alignment={resolvedAlignment}
      overlay={resolvedOverlay}
      style={mergedStyle}
      id={id}
      breadcrumbs={
        showBreadcrumbs && breadcrumbItems.length > 0 ? (
          <Breadcrumbs items={breadcrumbItems} theme="dark" />
        ) : undefined
      }
      tags={
        tags && tags.length > 0 ? (
          <>
            {tags.map((tag, index) => (
              <HeroTag
                key={index}
                variant={tag.variant}
                icon={tag.icon}
                size={tag.size ?? variantTagSize ?? 'medium'}
                className={cn(variantTagClassName, tag.className)}
              >
                {tag.label}
              </HeroTag>
            ))}
          </>
        ) : undefined
      }
      cta={heroCta}
      bottomSlot={undefined}
      className={heroClassName}
      contentClassName={resolvedContentClassName}
    >
      {legacyChildren}
    </HeroSectionServer>
  )
}

// Intermediate paths that do not have a corresponding page.
// Breadcrumb segments matching these paths are rendered as
// non-clickable text instead of links to avoid 404s.
const NON_PAGE_PATHS = new Set([
  '/private-hire/near',
  '/blog/tag',
  '/heathrow-parking/confirmation',
  '/parking/bookings',
])

// Helper function to generate breadcrumbs from route
function generateBreadcrumbsFromRoute(route: string): BreadcrumbItem[] {
  if (!route || route === '/') return []

  const segments = route.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  segments.forEach((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/')
    const name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    const isLastSegment = index === segments.length - 1
    const isNonPagePath = NON_PAGE_PATHS.has(path)

    breadcrumbs.push({
      name,
      // Last segment is always non-clickable (current page).
      // Intermediate segments that don't have a real page are also non-clickable.
      href: !isLastSegment && !isNonPagePath ? path : undefined,
      // Canonical URL for the BreadcrumbList JSON-LD: the current page gets one
      // (so its ListItem carries `item`); section-only paths (NON_PAGE_PATHS)
      // get none and are dropped from the schema.
      url: !isNonPagePath ? path : undefined
    })
  })

  return breadcrumbs
}

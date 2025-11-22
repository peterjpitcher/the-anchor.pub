import { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { HeroSection, HeroSize, type HeroImageConfig } from './HeroSection'
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

  const statusThemeBase = HERO_STATUS_BAR_THEMES[resolvedStatusBarThemeToken]
  const heroStatusTheme = {
    ...statusThemeBase,
    ...statusBarTheme
  }

  // Determine imagery
  const headerImage = getPageHeaderImage(route) || getDefaultHeaderImage()
  const { isFallback, ...headerImageConfig } = headerImage
  const shouldUseSeasonalImage = !image && isFallback

  if (shouldUseSeasonalImage && process.env.NODE_ENV !== 'production') {
    console.warn(
      `HeroWrapper: using seasonal homepage image for route "${route}". ` +
        'Add a page-specific image under public/images/page-headers or pass the `image` prop to HeroWrapper to suppress this warning.'
    )
  }

  const seasonalImage = shouldUseSeasonalImage ? getSeasonalHomepageImage() : null
  const focal = seasonalImage ? getSeasonalFocal(seasonalImage.season) : null

  const seasonalStyle: CSSProperties | undefined = seasonalImage
    ? ({
        '--hero-ox': `${focal?.x ?? 50}%`,
        '--hero-oy-mobile': `${focal?.yMobile ?? 50}%`,
        '--hero-oy-desktop': `${focal?.yDesktop ?? 50}%`
      } as CSSProperties)
    : undefined

  const resolvedImage: HeroImageConfig = {
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

  const shouldRenderStatusBarAbove = resolvedShowStatusBar && resolvedStatusBarPosition === 'above'
  const shouldRenderStatusBarBelow = resolvedShowStatusBar && resolvedStatusBarPosition === 'below'
  const hasHeroActions = Boolean(ctaContent) || shouldRenderStatusBarAbove || shouldRenderStatusBarBelow

  const heroCta = hasHeroActions ? (
    <>
      {shouldRenderStatusBarAbove && (
        <div className="mb-6">
          <StatusBar
            variant={resolvedStatusBarVariant}
            showKitchen={statusBarShowKitchen}
            theme={heroStatusTheme}
          />
        </div>
      )}
      {ctaContent}
      {shouldRenderStatusBarBelow && (
        <div className={cn(ctaContent ? 'mt-6' : 'mt-0')}>
          <StatusBar
            variant={resolvedStatusBarVariant}
            showKitchen={statusBarShowKitchen}
            theme={heroStatusTheme}
          />
        </div>
      )}
    </>
  ) : undefined

  const variantTagClassName =
    variantConfig.tagAppearance ? HERO_TAG_APPEARANCES[variantConfig.tagAppearance] : undefined
  const variantTagSize = variantConfig.tagSize

  const legacyChildren = hasStructuredCtaApi ? undefined : children

  return (
    <HeroSection
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
      className={heroClassName}
      contentClassName={resolvedContentClassName}
    >
      {legacyChildren}
    </HeroSection>
  )
}

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

    breadcrumbs.push({
      name,
      href: index < segments.length - 1 ? path : undefined
    })
  })

  return breadcrumbs
}

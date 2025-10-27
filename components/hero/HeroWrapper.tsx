import { CSSProperties, ReactNode } from 'react'
import { HeroSection, HeroSize, type HeroImageConfig } from './HeroSection'
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs'
import { HeroTag } from './HeroTag'
import { getPageHeaderImage, getDefaultHeaderImage } from '@/lib/page-header-images'
import { StatusBar } from '@/components/StatusBar'
import { cn } from '@/lib/utils'
import { getSeasonalAltText, getSeasonalFocal, getSeasonalHomepageImage } from '@/lib/seasonal-utils'

interface HeroWrapperProps {
  // Route & Content
  route: string
  title: string | ReactNode
  description?: string | ReactNode
  eyebrow?: ReactNode
  lead?: ReactNode
  
  // Layout
  size?: HeroSize
  alignment?: 'left' | 'center' | 'right'
  overlay?: 'light' | 'medium' | 'dark' | 'gradient'
  style?: CSSProperties

  image?: HeroImageConfig

  // Features
  breadcrumbs?: BreadcrumbItem[]
  showBreadcrumbs?: boolean
  tags?: Array<{
    label: string
    icon?: ReactNode
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
    size?: 'small' | 'medium' | 'large'
    className?: string
  }>
  showStatusBar?: boolean
  statusBarPosition?: 'above' | 'below' | 'none'
  statusBarVariant?: 'default' | 'compact' | 'hero'
  statusBarTheme?: {
    background?: string
    border?: string
    text?: string
    accentText?: string
  }
  statusBarShowKitchen?: boolean
  
  // Actions
  cta?: ReactNode
  
  // Custom content
  children?: ReactNode
  
  // Styling
  className?: string
  contentClassName?: string
  id?: string
}

export function HeroWrapper({
  route,
  title,
  description,
  eyebrow,
  lead,
  size = 'small',
  alignment = 'center',
  overlay = 'light',
  style,
  image,
  breadcrumbs,
  showBreadcrumbs = true,
  tags,
  showStatusBar = true,
  statusBarPosition = 'below',
  statusBarVariant = 'compact',
  statusBarTheme,
  statusBarShowKitchen = true,
  cta,
  children,
  className,
  contentClassName,
  id
}: HeroWrapperProps) {
  // Get the appropriate header image for this route
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

  const mergedStyle: CSSProperties | undefined = seasonalImage
    ? { ...seasonalStyle, ...style }
    : style

  const heroClassName = cn(className, seasonalImage && 'hero-focal')
  
  // Auto-generate breadcrumbs if not provided
  const breadcrumbItems = breadcrumbs || generateBreadcrumbsFromRoute(route)
  
  const heroStatusTheme = {
    background: 'bg-white/80',
    border: 'border border-white/60',
    text: 'text-anchor-green',
    accentText: 'text-anchor-gold',
    ...statusBarTheme
  }

  return (
    <HeroSection
      title={title}
      description={description}
      eyebrow={eyebrow}
      lead={lead}
      image={{
        ...resolvedImage
      }}
      size={size}
      alignment={alignment}
      overlay={overlay}
      style={mergedStyle}
      id={id}
      breadcrumbs={
        showBreadcrumbs && breadcrumbItems.length > 0 && (
          <Breadcrumbs items={breadcrumbItems} theme="dark" />
        )
      }
      tags={
        tags && tags.length > 0 && (
          <>
            {tags.map((tag, index) => (
              <HeroTag
                key={index}
                variant={tag.variant}
                icon={tag.icon}
                size={tag.size}
                className={tag.className}
              >
                {tag.label}
              </HeroTag>
            ))}
          </>
        )
      }
      cta={
        <>
          {showStatusBar && statusBarPosition === 'above' && (
            <div className="mb-6">
              <StatusBar 
                variant={statusBarVariant}
                showKitchen={statusBarShowKitchen}
                theme={heroStatusTheme}
              />
            </div>
          )}
          {cta}
          {showStatusBar && statusBarPosition === 'below' && (
            <div className="mt-6">
              <StatusBar 
                variant={statusBarVariant}
                showKitchen={statusBarShowKitchen}
                theme={heroStatusTheme}
              />
            </div>
          )}
        </>
      }
      className={heroClassName}
      contentClassName={contentClassName}
    >
      {children}
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

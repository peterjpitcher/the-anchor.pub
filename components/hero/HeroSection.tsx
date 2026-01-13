"use client"

import { CSSProperties, ReactNode, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export type HeroSize = 'small' | 'medium' | 'large' | 'hero'

type OptimizedImageFormats = Array<'avif' | 'webp'>

export interface HeroImageConfig {
  src: string
  alt: string
  priority?: boolean
  objectPosition?: string
  blurDataURL?: string
  fallbackSrc?: string
  optimized?: {
    mobile: string
    tablet: string
    desktop: string
    formats?: OptimizedImageFormats
  }
}

interface HeroSectionProps {
  // Content
  title: string | ReactNode
  description?: string | ReactNode
  eyebrow?: ReactNode
  lead?: ReactNode
  titleClassName?: string
  children?: ReactNode
  
  // Image
  image: HeroImageConfig
  
  // Layout
  size?: HeroSize
  alignment?: 'left' | 'center' | 'right'
  overlay?: 'light' | 'medium' | 'dark' | 'gradient'
  
  // Features
  breadcrumbs?: ReactNode
  tags?: ReactNode
  cta?: ReactNode
  
  // Styling
  className?: string
  contentClassName?: string
  style?: CSSProperties
  id?: string
}

// Standardized height system with consistent mobile/desktop scaling
const heightClasses: Record<HeroSize, string> = {
  small: 'min-h-[40vh] sm:min-h-[45vh] md:min-h-[50vh]',
  medium: 'min-h-[50vh] sm:min-h-[55vh] md:min-h-[60vh]',
  large: 'min-h-[60vh] sm:min-h-[65vh] md:min-h-[70vh]',
  hero: 'min-h-[70vh] sm:min-h-[80vh] md:min-h-[90vh]'
}

// Standardized padding system
const paddingClasses: Record<HeroSize, string> = {
  small: 'py-8 sm:py-10 md:py-12',
  medium: 'py-10 sm:py-12 md:py-14',
  large: 'py-12 sm:py-14 md:py-16',
  hero: 'py-14 sm:py-16 md:py-20'
}

// Consistent overlay options
const overlayClasses: Record<string, string> = {
  light: 'bg-black/25',
  medium: 'bg-black/45',
  dark: 'bg-black/65',
  gradient: 'bg-gradient-to-b from-black/55 via-black/30 to-black/65'
}

const titleSizeClasses: Record<HeroSize, string> = {
  small: 'text-3xl sm:text-4xl md:text-5xl',
  medium: 'text-4xl sm:text-5xl md:text-6xl',
  large: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
  hero: 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl'
}

// Text alignment classes
const alignmentClasses: Record<string, string> = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end'
}

const tagAlignmentClasses: Record<string, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end'
}

const blockAlignmentClasses: Record<string, string> = {
  left: 'self-start text-left',
  center: 'self-center text-center',
  right: 'self-end text-right'
}

const justifyAlignmentClasses: Record<string, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end'
}

export function HeroSection({
  title,
  description,
  eyebrow,
  lead,
  children,
  titleClassName,
  image,
  size = 'medium',
  alignment = 'center',
  overlay = 'gradient',
  breadcrumbs,
  tags,
  cta,
  className,
  contentClassName,
  style,
  id
}: HeroSectionProps) {
  const [imageError, setImageError] = useState(false)

  const objectPosition = image.objectPosition || 'var(--hero-ox, 50%) var(--hero-oy, 50%)'
  const optimizedFormats: OptimizedImageFormats = image.optimized?.formats || ['avif', 'webp']
  const shouldUseOptimized = Boolean(image.optimized) && !imageError

  const primarySrc = image.optimized
    ? `${image.optimized.desktop}.jpg`
    : image.src

  const defaultBlurDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACETMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

  const fallbackSrc = imageError && image.fallbackSrc ? image.fallbackSrc : image.src
  const blurDataURL = image.blurDataURL || defaultBlurDataUrl

  return (
    <section 
      className={cn(
        'relative overflow-hidden',
        heightClasses[size],
        className
      )}
      style={style}
      id={id}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <div className="relative w-full h-full">
	          {shouldUseOptimized ? (
	            <picture className="relative block h-full w-full">
	              {optimizedFormats.includes('avif') && (
	                <>
	                  <source media="(max-width: 640px)" srcSet={`${image.optimized!.mobile}.avif`} type="image/avif" />
	                  <source media="(max-width: 1024px)" srcSet={`${image.optimized!.tablet}.avif`} type="image/avif" />
	                  <source srcSet={`${image.optimized!.desktop}.avif`} type="image/avif" />
	                </>
	              )}
              {optimizedFormats.includes('webp') && (
                <>
                  <source media="(max-width: 640px)" srcSet={`${image.optimized!.mobile}.webp`} type="image/webp" />
                  <source media="(max-width: 1024px)" srcSet={`${image.optimized!.tablet}.webp`} type="image/webp" />
                  <source srcSet={`${image.optimized!.desktop}.webp`} type="image/webp" />
                </>
              )}
              <Image
                src={primarySrc}
                alt={image.alt}
                fill
                className="object-cover"
                priority={image.priority !== false}
                sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px"
                quality={82}
                placeholder={blurDataURL ? 'blur' : 'empty'}
                blurDataURL={blurDataURL}
                style={{ objectPosition }}
                onError={() => setImageError(true)}
              />
            </picture>
          ) : (
            <Image
              src={fallbackSrc}
              alt={image.alt}
              fill
              className="object-cover"
              priority={image.priority !== false}
              sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px"
              quality={82}
              placeholder={blurDataURL ? 'blur' : 'empty'}
              blurDataURL={blurDataURL}
              style={{ objectPosition }}
              onError={image.fallbackSrc ? () => setImageError(true) : undefined}
            />
          )}
        </div>
        <div className={cn('absolute inset-0', overlayClasses[overlay])} />
      </div>

      {/* Content Container */}
      <div 
        className={cn(
          'relative z-10 h-full flex flex-col',
          paddingClasses[size]
        )}
      >
        <div className={cn(
          'container mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col',
          alignmentClasses[alignment],
          contentClassName
        )}>
          {/* Breadcrumbs */}
          {breadcrumbs && (
            <div className="mb-4 sm:mb-6">
              {breadcrumbs}
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center">
            {eyebrow && (
              <div className={cn('mb-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-white/80', blockAlignmentClasses[alignment])}>
                {eyebrow}
              </div>
            )}

            {/* Title */}
            <h1 className={cn(
              'font-bold text-white mb-4 sm:mb-6',
              blockAlignmentClasses[alignment],
              titleClassName ?? titleSizeClasses[size]
            )}>
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p className={cn(
                'text-white/90 max-w-3xl mb-6 sm:mb-8',
                size === 'small' && 'text-lg sm:text-xl',
                size === 'medium' && 'text-xl sm:text-2xl',
                size === 'large' && 'text-xl sm:text-2xl md:text-3xl',
                size === 'hero' && 'text-2xl sm:text-3xl md:text-4xl',
                blockAlignmentClasses[alignment]
              )}>
                {description}
              </p>
            )}

            {lead && (
              <div className={cn('mb-6 w-full', justifyAlignmentClasses[alignment])}>
                <div className={cn('flex flex-col items-center gap-4', alignment === 'left' && 'items-start', alignment === 'right' && 'items-end')}>
                  {lead}
                </div>
              </div>
            )}

            {/* Tags */}
            {tags && (
              <div className={cn('mb-4 sm:mb-6 flex flex-wrap gap-2 w-full', tagAlignmentClasses[alignment])}>
                {tags}
              </div>
            )}

            {/* CTA */}
            {cta && (
              <div className={cn('mt-4 sm:mt-6 flex w-full', justifyAlignmentClasses[alignment])}>
                <div className="max-w-full">
                  {cta}
                </div>
              </div>
            )}

            {/* Additional content */}
            {children && (
              <div className={cn('mt-4 sm:mt-6 flex w-full', justifyAlignmentClasses[alignment])}>
                <div className="max-w-full text-white/90">
                  {children}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

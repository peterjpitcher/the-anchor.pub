import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { CSSProperties, ReactNode } from 'react'
import type { HeroImageConfig, HeroSize } from './HeroSection'

interface HeroSectionServerProps {
  title: string | ReactNode
  description?: string | ReactNode
  eyebrow?: ReactNode
  lead?: ReactNode
  titleClassName?: string
  children?: ReactNode
  image: HeroImageConfig
  size?: HeroSize
  alignment?: 'left' | 'center' | 'right'
  overlay?: 'light' | 'medium' | 'dark' | 'gradient'
  breadcrumbs?: ReactNode
  tags?: ReactNode
  cta?: ReactNode
  className?: string
  contentClassName?: string
  style?: CSSProperties
  id?: string
}

const heightClasses: Record<HeroSize, string> = {
  small: 'min-h-[40vh] sm:min-h-[45vh] md:min-h-[50vh]',
  medium: 'min-h-[50vh] sm:min-h-[55vh] md:min-h-[60vh]',
  large: 'min-h-[60vh] sm:min-h-[65vh] md:min-h-[70vh]',
  hero: 'min-h-[70vh] sm:min-h-[80vh] md:min-h-[90vh]'
}

const paddingClasses: Record<HeroSize, string> = {
  small: 'py-8 sm:py-10 md:py-12',
  medium: 'py-10 sm:py-12 md:py-14',
  large: 'py-12 sm:py-14 md:py-16',
  hero: 'py-14 sm:py-16 md:py-20'
}

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

export function HeroSectionServer({
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
}: HeroSectionServerProps) {
  const objectPosition = image.objectPosition || 'var(--hero-ox, 50%) var(--hero-oy, 50%)'

  const defaultBlurDataUrl =
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACETMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

  const blurDataURL = image.blurDataURL || defaultBlurDataUrl

  return (
    <section
      className={cn('relative overflow-hidden', heightClasses[size], className)}
      style={style}
      id={id}
    >
      <div className="absolute inset-0">
        <div className="relative w-full h-full">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            priority={image.priority !== false}
            sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px"
            quality={65}
            placeholder={blurDataURL ? 'blur' : 'empty'}
            blurDataURL={blurDataURL}
            style={{ objectPosition }}
          />
        </div>
        <div className={cn('absolute inset-0', overlayClasses[overlay])} />
      </div>

      <div className={cn('relative z-10 h-full flex flex-col', paddingClasses[size])}>
        <div
          className={cn(
            'container mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col',
            alignmentClasses[alignment],
            contentClassName
          )}
        >
          {breadcrumbs && <div className="mb-4 sm:mb-6">{breadcrumbs}</div>}

          <div className="flex-1 flex flex-col justify-center">
            {eyebrow && <div className={cn('mb-3 sm:mb-4', blockAlignmentClasses[alignment])}>{eyebrow}</div>}

            <h1 className={cn('font-bold text-white leading-tight mb-4', titleSizeClasses[size], titleClassName)}>
              {title}
            </h1>

            {description && (
              <p className={cn('text-white/90 text-lg sm:text-xl md:text-2xl max-w-3xl mb-6', blockAlignmentClasses[alignment])}>
                {description}
              </p>
            )}

            {lead && <div className={cn('mb-6', blockAlignmentClasses[alignment])}>{lead}</div>}
            {children && <div className={cn('mb-6', blockAlignmentClasses[alignment])}>{children}</div>}

            {(tags || cta) && (
              <div className="mt-6 space-y-6">
                {tags && <div className={cn('flex flex-wrap gap-2', tagAlignmentClasses[alignment])}>{tags}</div>}
                {cta && <div className={cn('flex flex-wrap gap-4', justifyAlignmentClasses[alignment])}>{cta}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface MobileOptimizedImageProps extends Omit<ImageProps, 'alt' | 'sizes'> {
  alt: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
  sizes?: string
  mobileSrc?: string // Optional mobile-specific image
  desktopQuality?: number
  objectPosition?: string
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'auto'
  showSkeleton?: boolean
}

const DEFAULT_BLUR_DATA_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  auto: ''
}

export function MobileOptimizedImage({ 
  alt, 
  priority = false, 
  loading = 'lazy',
  sizes,
  src,
  mobileSrc,
  desktopQuality = 85,
  quality,
  className,
  objectPosition = 'center',
  aspectRatio = 'auto',
  showSkeleton = true,
  ...props 
}: MobileOptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  
  // Default sizes for better mobile optimization
  const defaultSizes = sizes || `
    (max-width: 640px) 100vw,
    (max-width: 768px) 90vw,
    (max-width: 1024px) 60vw,
    (max-width: 1280px) 50vw,
    40vw
  `.trim()
  
  const imageQuality = quality || desktopQuality
  
  return (
    <div className={cn(
      'relative overflow-hidden',
      aspectRatio !== 'auto' && aspectRatioClasses[aspectRatio],
      className
    )}>
      {showSkeleton && isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          aria-hidden="true"
        />
      )}
      
      <picture>
        {mobileSrc && (
          <source
            srcSet={mobileSrc}
            media="(max-width: 767px)"
          />
        )}
        <Image
          src={src}
          alt={alt}
          priority={priority}
          loading={priority ? 'eager' : loading}
          quality={imageQuality}
          placeholder="blur"
          blurDataURL={props.blurDataURL || DEFAULT_BLUR_DATA_URL}
          sizes={defaultSizes}
          onLoadingComplete={() => setIsLoading(false)}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            props.fill && `object-cover object-${objectPosition}`
          )}
          {...props}
        />
      </picture>
    </div>
  )
}

// Responsive picture element for art direction
export function ResponsivePicture({
  sources,
  alt,
  className,
  priority = false,
  loading = 'lazy'
}: {
  sources: Array<{
    srcSet: string
    media: string
    type?: string
  }>
  alt: string
  className?: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
}) {
  return (
    <picture className={className}>
      {sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.srcSet}
          media={source.media}
          type={source.type}
        />
      ))}
      <img
        src={sources[sources.length - 1].srcSet}
        alt={alt}
        loading={priority ? 'eager' : loading}
        className="w-full h-auto"
      />
    </picture>
  )
}

// Hero image with mobile optimization
export function HeroImage({
  src,
  mobileSrc,
  alt,
  priority = true,
  overlay = true,
  overlayOpacity = 40,
  children
}: {
  src: string
  mobileSrc?: string
  alt: string
  priority?: boolean
  overlay?: boolean
  overlayOpacity?: number
  children?: React.ReactNode
}) {
  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh]">
      <MobileOptimizedImage
        src={src}
        mobileSrc={mobileSrc}
        alt={alt}
        fill
        priority={priority}
        className="absolute inset-0"
        sizes="100vw"
        objectPosition="center"
        desktopQuality={90}
      />
      
      {overlay && (
        <div 
          className={`absolute inset-0 bg-black`}
          style={{ opacity: overlayOpacity / 100 }}
          aria-hidden="true"
        />
      )}
      
      {children && (
        <div className="relative z-10 h-full flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

// Gallery image with loading states
export function GalleryImage({
  src,
  alt,
  className,
  onClick,
  aspectRatio = 'square'
}: {
  src: string
  alt: string
  className?: string
  onClick?: () => void
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape'
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative block w-full overflow-hidden rounded-lg',
        'focus:outline-none focus:ring-2 focus:ring-anchor-gold focus:ring-offset-2',
        'hover:opacity-90 transition-opacity',
        className
      )}
      aria-label={`View ${alt}`}
    >
      <MobileOptimizedImage
        src={src}
        alt={alt}
        width={400}
        height={400}
        className="w-full h-full"
        aspectRatio={aspectRatio}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </button>
  )
}

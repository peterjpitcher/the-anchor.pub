'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Grid, GridItem } from '@/components/ui/layout/Grid'
import { Card } from '@/components/ui/layout/Card'
import { Button } from '@/components/ui/primitives/Button'
import { Badge } from '@/components/ui/primitives/Badge'
import { cn } from '@/lib/utils'
import {
  trackModalClose,
  trackModalEngage,
  trackModalOpen,
  type ModalCloseReason
} from '@/lib/gtm-events'

export interface GalleryImage {
  src: string
  alt: string
  caption?: string
  category?: string
  width?: number
  height?: number
}

interface GalleryProps {
  images: GalleryImage[]
  columns?: 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  showCaptions?: boolean
  showFilter?: boolean
  className?: string
  onImageClick?: (image: GalleryImage, index: number) => void
}

export function Gallery({ 
  images, 
  columns = 3,
  gap = 'md',
  showCaptions = true,
  showFilter = true,
  className,
  onImageClick
}: GalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1)
  const modalId = 'gallery_lightbox'
  const previousOpen = useRef(false)
  const engaged = useRef(false)
  const lastCloseReason = useRef<ModalCloseReason | null>(null)
  
  // Get unique categories
  const categories = Array.from(new Set(images.map(img => img.category).filter(Boolean))) as string[]
  
  // Filter images by category
  const filteredImages = selectedCategory 
    ? images.filter(img => img.category === selectedCategory)
    : images
  
  const handleImageClick = useCallback((image: GalleryImage, index: number) => {
    if (onImageClick) {
      onImageClick(image, index)
    } else {
      // Default lightbox behaviour
      setLightboxImage(image)
      setLightboxIndex(index)
    }
  }, [onImageClick])
  
  const handleLightboxClose = useCallback(() => {
    setLightboxImage(null)
    setLightboxIndex(-1)
  }, [])

  const requestClose = useCallback((reason: ModalCloseReason) => {
    lastCloseReason.current = reason
    handleLightboxClose()
  }, [handleLightboxClose])
  
  const handleLightboxNavigation = useCallback((direction: 'prev' | 'next') => {
    const currentImages = filteredImages
    let newIndex = lightboxIndex
    
    if (direction === 'prev') {
      newIndex = lightboxIndex > 0 ? lightboxIndex - 1 : currentImages.length - 1
    } else {
      newIndex = lightboxIndex < currentImages.length - 1 ? lightboxIndex + 1 : 0
    }
    
    if (!engaged.current) {
      engaged.current = true
      trackModalEngage({
        id: modalId,
        title: 'Image lightbox',
        interaction: 'click',
        element: direction === 'prev' ? 'prev_button' : 'next_button',
        extra: {
          gallery_image_index: lightboxIndex,
          gallery_total_images: currentImages.length,
        }
      })
    }

    setLightboxImage(currentImages[newIndex])
    setLightboxIndex(newIndex)
  }, [filteredImages, lightboxIndex])

  // Lightbox open/close tracking
  useEffect(() => {
    const isOpen = Boolean(lightboxImage)

    if (isOpen && !previousOpen.current) {
      previousOpen.current = true
      engaged.current = false
      lastCloseReason.current = null

      trackModalOpen({
        id: modalId,
        title: 'Image lightbox',
        extra: {
          gallery_image_src: lightboxImage?.src,
          gallery_image_alt: lightboxImage?.alt,
          gallery_image_index: lightboxIndex,
          gallery_image_category: lightboxImage?.category
        }
      })
      return
    }

    if (!isOpen && previousOpen.current) {
      previousOpen.current = false
      trackModalClose({
        id: modalId,
        title: 'Image lightbox',
        reason: lastCloseReason.current ?? 'programmatic'
      })
      lastCloseReason.current = null
    }
  }, [lightboxImage, lightboxIndex])
  
  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxImage) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          requestClose('escape_key')
          break
        case 'ArrowLeft':
          handleLightboxNavigation('prev')
          break
        case 'ArrowRight':
          handleLightboxNavigation('next')
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleLightboxNavigation, lightboxImage, requestClose])
  
  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxImage])
  
  return (
    <>
      <div className={className}>
        {/* Category Filter */}
        {showFilter && categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === null ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All ({images.length})
            </Button>
            {categories.map(category => {
              const count = images.filter(img => img.category === category).length
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category} ({count})
                </Button>
              )
            })}
          </div>
        )}
        
        {/* Image Grid */}
        <Grid cols={columns} gap={gap}>
          {filteredImages.map((image, index) => (
            <GridItem key={index}>
              <Card 
                variant="elevated" 
                padding="none"
                className="group cursor-pointer overflow-hidden focus-visible:ring-2 focus-visible:ring-anchor-gold focus-visible:outline-none"
                onClick={() => handleImageClick(image, index)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleImageClick(image, index) } }}
                role="button"
                tabIndex={0}
              >
                <div className="relative aspect-square">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes={`(max-width: 768px) 100vw, (max-width: 1200px) ${100/columns}vw, ${1200/columns}px`}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    loading={index < 4 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colours duration-300" />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-anchor-charcoal/90 backdrop-blur-sm rounded-full p-3">
                      <svg className="w-6 h-6 text-anchor-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Category Badge */}
                  {image.category && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="default" size="sm" className="bg-white/90 backdrop-blur-sm">
                        {image.category}
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* Caption */}
                {showCaptions && image.caption && (
                  <div className="p-4 bg-anchor-bg-raised">
                    <p className="text-sm text-anchor-cream-text/70">{image.caption}</p>
                  </div>
                )}
              </Card>
            </GridItem>
          ))}
        </Grid>
      </div>
      
      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => requestClose('backdrop_click')}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              requestClose('close_button')
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-600 transition-colours p-2 min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none rounded"
            aria-label="Close lightbox"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleLightboxNavigation('prev')
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-600 transition-colours p-2 min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none rounded"
            aria-label="Previous image"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleLightboxNavigation('next')
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-600 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none rounded"
            aria-label="Next image"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div 
            className="relative max-w-7xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              width={lightboxImage.width || 1200}
              height={lightboxImage.height || 800}
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
              loading="eager"
            />
            
            {lightboxImage.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-4">
                <p className="text-white text-center">{lightboxImage.caption}</p>
              </div>
            )}
          </div>
          
          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {lightboxIndex + 1} / {filteredImages.length}
          </div>
        </div>
      )}
    </>
  )
}

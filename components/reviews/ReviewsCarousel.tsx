'use client'

import { useState, useEffect } from 'react'
import { GoogleReview } from '@/lib/google/types'
import { ReviewCard } from './ReviewCard'

interface ReviewsCarouselProps {
  reviews: GoogleReview[]
  autoPlay?: boolean
  interval?: number
}

export function ReviewsCarousel({ 
  reviews, 
  autoPlay = true,
  interval = 5000 
}: ReviewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)

    handleChange()

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  useEffect(() => {
    if (!autoPlay || reviews.length <= 1 || isPaused || prefersReducedMotion) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, reviews.length, isPaused, prefersReducedMotion])

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  if (reviews.length === 0) return null

  return (
    <div
      className="relative max-w-4xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setIsPaused(false)
        }
      }}
    >
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {reviews.map((review, index) => (
            <div key={index} className="w-full flex-shrink-0 px-4">
              <ReviewCard review={review} index={index} />
            </div>
          ))}
        </div>
      </div>
      
      {reviews.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-anchor-bg-card/90 hover:bg-anchor-bg-raised border border-anchor-gold/25 p-2 shadow-lg text-anchor-cream-text transition-colors"
            aria-label="Previous review"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-anchor-bg-card/90 hover:bg-anchor-bg-raised border border-anchor-gold/25 p-2 shadow-lg text-anchor-cream-text transition-colors"
            aria-label="Next review"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div className="flex justify-center gap-2 mt-4">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-anchor-gold' : 'bg-anchor-cream-text/25'
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

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
  // The visitor's own choice, kept apart from the hover and focus pause above:
  // leaving the carousel must not start it again once they have stopped it.
  const [isStopped, setIsStopped] = useState(false)
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
    if (!autoPlay || reviews.length <= 1 || isPaused || isStopped || prefersReducedMotion) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, reviews.length, isPaused, isStopped, prefersReducedMotion])

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  if (reviews.length === 0) return null

  return (
    <div
      className="relative mx-auto"
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
        // One row under the slides: the pause button, then the dots. The two
        // arrows are inside it only so the tab order runs pause, previous,
        // next, dots; they are positioned against the carousel, not this row.
        //
        // Each dot button is a 24px tap target (WCAG 2.2 AA 2.5.8) with the 8px
        // dot drawn inside it. The targets touch, so there is no gap, and
        // mt-2 with -mb-2 keeps the dots and everything below them at the
        // height they had when the button was the dot.
        <div className="flex flex-wrap justify-center mt-2 -mb-2">
          {/* Anything that moves by itself for more than five seconds needs a
              way to stop it (WCAG 2.2.2). Hover and focus only pause it, and a
              touch screen has neither. Left out when the carousel is not going
              to move anyway. */}
          {autoPlay && !prefersReducedMotion && (
            <button
              type="button"
              onClick={() => setIsStopped((stopped) => !stopped)}
              className="mr-2 flex h-6 w-6 items-center justify-center rounded-full text-ink-muted hover:text-ink"
              aria-label={isStopped ? 'Play reviews' : 'Pause reviews'}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                {isStopped ? <path d="M8 5v14l11-7z" /> : <path d="M7 5h4v14H7zM13 5h4v14h-4z" />}
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-surface/90 hover:bg-surface-sunk border border-line rounded-md p-2 shadow-md text-ink transition-colors"
            aria-label="Previous review"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-surface/90 hover:bg-surface-sunk border border-line rounded-md p-2 shadow-md text-ink transition-colors"
            aria-label="Next review"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {reviews.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className="flex h-6 w-6 items-center justify-center rounded-full"
              aria-label={`Go to review ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : undefined}
            >
              {/* The other dots are rings in --text-muted, which clears 3:1
                  against every surface in both skins (WCAG 1.4.11). Filled
                  against hollow, not only gold against grey, tells the
                  current one apart: in the light skin the two colours are
                  almost the same lightness. The filled one follows the skin
                  (dark gold on cream, bright gold on green). */}
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-accent-text' : 'border-2 border-ink-muted'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'

const HERO_FALLBACK_HEIGHT = 480
const REVEAL_OFFSET = 90

/**
 * Best-effort measurement of the current page hero. Prefers the explicit
 * [data-hero] marker (InteriorHero and the home hero), falls back to the first
 * <section> in <main>, then a documented constant.
 */
export function measureHeroHeight(): number {
  if (typeof document === 'undefined') return HERO_FALLBACK_HEIGHT
  const explicit = document.querySelector<HTMLElement>('[data-hero]')
  if (explicit) return explicit.offsetHeight
  const firstSection = document.querySelector<HTMLElement>('main section')
  if (firstSection) return firstSection.offsetHeight
  return HERO_FALLBACK_HEIGHT
}

/**
 * True once the page has scrolled past its hero (scrollY > hero height - 90).
 *
 * The booking bar has always appeared on this trigger. The "Next Event" card
 * uses it too since 8 October 2026: pinned to the bottom of the screen from
 * the moment a page opened, the card sat on the hero's own buttons on 67
 * pages, the homepage's Book a table among them (site review LS-021).
 */
export function usePastHero(pathname: string | null, enabled = true): boolean {
  const [pastHero, setPastHero] = useState(false)
  const heroHeightRef = useRef<number>(HERO_FALLBACK_HEIGHT)

  useEffect(() => {
    if (!enabled) {
      setPastHero(false)
      return
    }
    // Measured after mount, and again on resize, in case images or fonts
    // changed the hero's height.
    heroHeightRef.current = measureHeroHeight()

    const evaluate = () => {
      const threshold = Math.max(0, heroHeightRef.current - REVEAL_OFFSET)
      setPastHero(window.scrollY > threshold)
    }
    const remeasure = () => {
      heroHeightRef.current = measureHeroHeight()
      evaluate()
    }

    evaluate()
    window.addEventListener('scroll', evaluate, { passive: true })
    window.addEventListener('resize', remeasure)
    return () => {
      window.removeEventListener('scroll', evaluate)
      window.removeEventListener('resize', remeasure)
    }
  }, [enabled, pathname])

  return pastHero
}

import { nowInLondonComponents } from './time-london'

export interface SeasonalImage {
  src: string
  season: 'winter' | 'spring' | 'summer' | 'autumn' | 'halloween' | 'christmas'
  fallback: string
  objectPosition?: string
}

/**
 * Determines the current season based on London date and returns appropriate image path
 * Date ranges:
 * - Winter: Jan 1 - Feb 28/29
 * - Spring: Mar 1 - May 31
 * - Summer: Jun 1 - Aug 31
 * - Autumn: Sep 1 - Sep 30
 * - Halloween: Oct 1 - Nov 2
 * - Autumn: Nov 3 - Nov 7
 * - Christmas: Nov 8 - Dec 31
 */
export function getSeasonalHomepageImage(testDate?: Date): SeasonalImage {
  const defaultImage = '/images/page-headers/home/page-headers-homepage.jpg'
  
  // Development override (no NODE_ENV check so it works in preview deployments)
  const forced = process.env.NEXT_PUBLIC_FORCE_SEASON as SeasonalImage['season'] | undefined
  if (forced) {
    console.log(`[Seasonal Image] Forced season: ${forced}`)
    return {
      src: `/images/page-headers/home/seasonal/${forced}/page-headers-homepage.jpg`,
      season: forced,
      fallback: defaultImage
    }
  }
  
  const date = testDate ?? new Date()
  const { month, day } = nowInLondonComponents(date)
  
  let season: SeasonalImage['season']
  let imagePath: string
  
  if (month === 1 || month === 2) {
    // Winter: January 1 - February 28/29
    season = 'winter'
  } else if (month >= 3 && month <= 5) {
    // Spring: March 1 - May 31
    season = 'spring'
  } else if (month >= 6 && month <= 8) {
    // Summer: June 1 - August 31
    season = 'summer'
  } else if (month === 9) {
    // Autumn: September 1 - September 30
    season = 'autumn'
  } else if (month === 10 || (month === 11 && day <= 2)) {
    // Halloween: October 1 - November 2
    season = 'halloween'
  } else if (month === 11 && day >= 3 && day <= 7) {
    // Autumn again: November 3 - November 7
    season = 'autumn'
  } else {
    // Christmas: November 8 - December 31
    season = 'christmas'
  }
  
  imagePath = `/images/page-headers/home/seasonal/${season}/page-headers-homepage.jpg`

  if (!validateSeasonalImage(imagePath)) {
    if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
      console.warn(`[Seasonal Image] Falling back to default header image. Missing asset at ${imagePath}`)
    }
    return { src: defaultImage, season, fallback: defaultImage }
  }
  
  // Log which seasonal image is being served (server-side only, in development)
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
    console.log(`[Seasonal Image] Serving ${season} image: ${imagePath}`)
  }
  
  return { src: imagePath, season, fallback: defaultImage }
}

/**
 * Get seasonal greeting message for the hero section
 */
export function getSeasonalGreeting(season: SeasonalImage['season']): string {
  const greetings = {
    winter: "Welcome to The Anchor",
    spring: "Welcome to The Anchor - Spring Has Sprung!",
    summer: "Welcome to The Anchor - Your Preferred Summer Spot",
    autumn: "Welcome to The Anchor - Autumn Vibes",
    halloween: "Welcome to The Anchor - Spooktacular Times Ahead! 🎃",
    christmas: "Welcome to The Anchor - Festive Cheer Awaits! 🎄"
  }
  
  return greetings[season] || "Welcome to The Anchor"
}

/**
 * Get seasonal alt text for better accessibility
 */
export function getSeasonalAltText(season: SeasonalImage['season']): string {
  const altTexts = {
    winter: "The Anchor pub in Stanwell Moor during winter",
    spring: "The Anchor pub garden in spring bloom",
    summer: "The Anchor pub beer garden in summer sunshine",
    autumn: "The Anchor pub with autumn colours",
    halloween: "The Anchor pub decorated for Halloween",
    christmas: "The Anchor pub with festive Christmas decorations"
  }
  
  return altTexts[season] || "The Anchor pub in Stanwell Moor"
}

/**
 * Focal point configuration for responsive image positioning
 */
export type Focal = { 
  x: number      // Horizontal position (0-100)
  yMobile: number  // Vertical position for mobile (0-100)
  yDesktop: number // Vertical position for desktop (0-100)
}

/**
 * Get responsive focal points for each seasonal image
 * Addresses "visual centre ≠ geometric centre" issue
 * Most hero images need to be lifted up (30-40%) to appear centered
 */
export function getSeasonalFocal(season: SeasonalImage['season']): Focal {
  // VERY aggressive lift - images need to show their upper portion
  const defaults: Record<string, Focal> = {
    // Centered by default to ensure hero image vertical alignment is middle
    winter:    { x: 50, yMobile: 50, yDesktop: 50 },
    spring:    { x: 50, yMobile: 50, yDesktop: 50 },
    summer:    { x: 50, yMobile: 50, yDesktop: 50 },
    autumn:    { x: 50, yMobile: 50, yDesktop: 50 },
    halloween: { x: 50, yMobile: 50, yDesktop: 50 },
    christmas: { x: 50, yMobile: 50, yDesktop: 50 }
  }
  
  return defaults[season] ?? { x: 50, yMobile: 15, yDesktop: 10 }
}

/**
 * @deprecated Use getSeasonalFocal() instead for responsive positioning
 */
export function getSeasonalObjectPosition(season: SeasonalImage['season']): string {
  const focal = getSeasonalFocal(season)
  return `${focal.x}% ${focal.yMobile}%`
}

/**
 * Server-side only: Validates if seasonal image exists
 * Use this in development to verify all seasonal images are present
 */
export function validateSeasonalImage(imagePath: string): boolean {
  if (typeof window !== 'undefined') {
    // Client-side, assume image exists
    return true
  }

  try {
    const fs = require('fs')
    const path = require('path')
    const normalizedPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
    const publicPath = path.join(process.cwd(), 'public', normalizedPath)
    const exists = fs.existsSync(publicPath)

    if (!exists && process.env.NODE_ENV !== 'production') {
      console.warn(`[Seasonal Image] Missing file at ${publicPath}`)
    }

    return exists
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Seasonal Image] Failed to validate image path', error)
    }
    return false
  }
}

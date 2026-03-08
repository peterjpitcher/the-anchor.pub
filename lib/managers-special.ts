/**
 * Single source of truth for Manager's Special promotions
 * Used by both API and SSR to ensure consistency
 */

// Dynamic import to avoid bundling in serverless functions
const getPromotionsData = () => {
  return require('@/content/managers-special-promotions.json')
}
import { nowInLondon, londonRangeToInstants, isLondonDateInRange } from './time-london'
import type { ManagersSpecial } from '@/types/managers-special'
import { isValidPromotion } from '@/types/managers-special'
import path from 'path'
import fs from 'fs'

/**
 * Get the currently active promotion based on London time
 * @param now - Optional date for testing (defaults to current London time)
 */
export function getCurrentPromotion(now: Date = nowInLondon()): ManagersSpecial | null {
  try {
    const data = getPromotionsData()
    const promotions = data.promotions as ManagersSpecial[]
    
    // Filter and validate promotions
    const validPromotions = promotions
      .filter(isValidPromotion)
      .filter(p => p.active)
    
    // Find active promotion for current date
    const activePromotions = validPromotions
      .filter(p => {
        const { start, end } = londonRangeToInstants(p.startDate, p.endDate)
        return isLondonDateInRange(now, start, end)
      })
      // In case of accidental overlaps, pick the one with the latest start date
      .sort((a, b) => (a.startDate < b.startDate ? 1 : -1))
    
    const active = activePromotions[0] ?? null
    
    // Log warning if no active promotion on first few days of month
    if (!active && process.env.NODE_ENV === 'development') {
      const day = now.getDate()
      if (day >= 1 && day <= 3) {
        console.warn(`No active Manager's Special for current date: ${now.toISOString()}`)
      }
    }
    
    return active
  } catch (error) {
    console.error('Error loading promotions:', error)
    return null
  }
}

/**
 * Get a specific promotion by ID (for preview mode)
 */
export function getPromotionById(id: string): ManagersSpecial | null {
  try {
    const data = getPromotionsData()
    const promotions = data.promotions as ManagersSpecial[]
    const promo = promotions.find(p => p.id === id)
    
    if (!promo) {
      console.warn(`Promotion not found: ${id}`)
      return null
    }
    
    if (!isValidPromotion(promo)) {
      console.error(`Invalid promotion data for ID: ${id}`)
      return null
    }
    
    return promo
  } catch (error) {
    console.error('Error getting promotion by ID:', error)
    return null
  }
}

/**
 * Get all promotions (for admin/debugging)
 */
export function getAllPromotions(): ManagersSpecial[] {
  try {
    const data = getPromotionsData()
    return (data.promotions as ManagersSpecial[]).filter(isValidPromotion)
  } catch (error) {
    console.error('Error loading all promotions:', error)
    return []
  }
}

/**
 * Get the image path for a promotion
 */
export function getPromotionImage(imageFolder: string): string | null {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'managers-special', imageFolder)
    
    // Check if directory exists
    if (!fs.existsSync(imagesDir)) {
      console.warn(`Manager's special images directory does not exist: ${imageFolder}`)
      return null
    }
    
    // Look for hero image first
    const heroFiles = ['hero.webp', 'hero.jpg', 'hero.png']
    for (const heroFile of heroFiles) {
      const heroPath = path.join(imagesDir, heroFile)
      if (fs.existsSync(heroPath)) {
        return `/images/managers-special/${imageFolder}/${heroFile}`
      }
    }
    
    // Fallback to any image in the directory
    const files = fs.readdirSync(imagesDir)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return imageExtensions.includes(ext)
    })
    
    if (imageFiles.length > 0) {
      return `/images/managers-special/${imageFolder}/${encodeURIComponent(imageFiles[0])}`
    }
    
    return null
  } catch (error) {
    console.error('Error finding promotion image:', error)
    return null
  }
}

/**
 * Normalize price display to ensure consistent formatting
 * Ensures "3" → "3.00", "3.5" → "3.50"
 */
export function normalisePrice(label: string): string {
  const trimmed = label.trim()
  const match = trimmed.match(/^(?:\u00A3\s*)?(\d+(?:\.\d{1,2})?)$/)
  
  if (!match) return trimmed
  
  const [whole, frac = ''] = match[1].split('.')
  const fraction = (frac + '00').slice(0, 2)
  
  return `${whole}.${fraction}`
}

/**
 * Calculate savings amount from prices
 */
export function calculateSavings(original: string, special: string): string {
  const originalNum = parseFloat(original.replace(/[\u00A3\s]/g, ''))
  const specialNum = parseFloat(special.replace(/[\u00A3\s]/g, ''))
  const savings = originalNum - specialNum
  
  return savings.toFixed(2)
}

/**
 * Get the next promotion (for "coming soon" messaging)
 */
export function getNextPromotion(now: Date = nowInLondon()): ManagersSpecial | null {
  try {
    const data = getPromotionsData()
    const promotions = data.promotions as ManagersSpecial[]
    
    const futurePromotions = promotions
      .filter(isValidPromotion)
      .filter(p => p.active)
      .filter(p => {
        const { start } = londonRangeToInstants(p.startDate, p.endDate)
        return start > now
      })
      .sort((a, b) => (a.startDate > b.startDate ? 1 : -1))
    
    return futurePromotions[0] ?? null
  } catch (error) {
    console.error('Error getting next promotion:', error)
    return null
  }
}

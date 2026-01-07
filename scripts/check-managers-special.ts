#!/usr/bin/env npx tsx

/**
 * Monthly check script for Manager's Special
 * Run on the 25th of each month: npx tsx scripts/check-managers-special.ts
 */

import { getCurrentPromotion, getAllPromotions, getNextPromotion } from '../lib/managers-special'
import { nowInLondon, getLondonTimeString } from '../lib/time-london'

const now = nowInLondon()
const currentMonth = now.getMonth()
const currentYear = now.getFullYear()
const nextMonth = new Date(currentYear, currentMonth + 1, 1)
const nextMonthName = nextMonth.toLocaleString('en-GB', { month: 'long' })

console.log('📋 Manager\'s Special Monthly Check')
console.log('=====================================\n')
console.log(`📅 Date: ${getLondonTimeString(now)}`)

// Check current promotion
const current = getCurrentPromotion()
console.log('\n✅ Current Promotion:')
if (current) {
  console.log(`   ${current.spirit.name} (ends ${current.endDate})`)
} else {
  console.log('   ⚠️ NO ACTIVE PROMOTION')
}

// Check next month
console.log(`\n📅 Checking ${nextMonthName} ${nextMonth.getFullYear()}:`)
const nextPromo = getNextPromotion()

const allPromos = getAllPromotions()
const nextMonthPromo = allPromos.find(p => {
  const [year, month] = p.startDate.split('-').map(Number)
  return year === nextMonth.getFullYear() && month === nextMonth.getMonth() + 1
})

if (nextMonthPromo) {
  console.log(`   ✅ ${nextMonthPromo.spirit.name} configured`)
  console.log(`   Starts: ${nextMonthPromo.startDate}`)
  console.log(`   Price: ${nextMonthPromo.spirit.specialPrice} (was ${nextMonthPromo.spirit.originalPrice})`)
  
  // Check for image
  const imageFolder = `/public/images/managers-special/${nextMonthPromo.imageFolder}`
  console.log(`   Image folder: ${imageFolder}`)
  console.log(`   ⚠️  Remember to add hero image!`)
} else {
  console.log(`   ❌ NO PROMOTION CONFIGURED FOR ${nextMonthName.toUpperCase()}!`)
  console.log(`   ACTION REQUIRED: Add promotion to managers-special-promotions.json`)
}

// List all future promotions
console.log('\n📅 All Future Promotions:')
const futurePromos = allPromos.filter(p => {
  const promoStart = new Date(p.startDate)
  return promoStart > now
})

if (futurePromos.length > 0) {
  futurePromos.forEach(p => {
    console.log(`   • ${p.spirit.name} (${p.startDate} to ${p.endDate})`)
  })
} else {
  console.log('   No future promotions configured')
}

// Validation checks
console.log('\n🔍 Validation Checks:')
let hasErrors = false
const pricePattern = /^\d+\.\d{2}$/

allPromos.forEach(p => {
  // Check price format
  if (!pricePattern.test(p.spirit.originalPrice)) {
    console.log(`   ❌ ${p.id}: originalPrice must be a number like 4.00`)
    hasErrors = true
  }
  if (!pricePattern.test(p.spirit.specialPrice)) {
    console.log(`   ❌ ${p.id}: specialPrice must be a number like 3.00`)
    hasErrors = true
  }
  
  // Check date format
  if (!p.startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    console.log(`   ❌ ${p.id}: Invalid startDate format`)
    hasErrors = true
  }
  if (!p.endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    console.log(`   ❌ ${p.id}: Invalid endDate format`)
    hasErrors = true
  }
  
  // Check for overlaps
  const others = allPromos.filter(o => o.id !== p.id && o.active)
  others.forEach(o => {
    const pStart = new Date(p.startDate)
    const pEnd = new Date(p.endDate)
    const oStart = new Date(o.startDate)
    const oEnd = new Date(o.endDate)
    
    if ((pStart <= oEnd && pEnd >= oStart)) {
      console.log(`   ⚠️  ${p.id} overlaps with ${o.id}`)
    }
  })
})

if (!hasErrors) {
  console.log('   ✅ All promotions valid')
}

// Summary
console.log('\n=====================================')
if (nextMonthPromo) {
  console.log('✅ Ready for next month!')
} else {
  console.log(`❌ ACTION REQUIRED: Configure ${nextMonthName} promotion`)
  console.log('\nNext steps:')
  console.log('1. Edit content/managers-special-promotions.json')
  console.log('2. Add promotion data for next month')
  console.log('3. Create image folder: public/images/managers-special/[month]-[year]/')
  console.log('4. Add hero.webp or hero.jpg image')
  console.log('5. Run this script again to verify')
}

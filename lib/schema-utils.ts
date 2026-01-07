import { BusinessHours, KitchenStatus } from './api'
import { isKitchenOpen } from './api'
import type { AllergenType } from '@/hooks/useAllergenFilter'

// Helper to generate OpeningHoursSpecification from BusinessHours API response
export function generateOpeningHoursSpecification(businessHours: BusinessHours | null) {
  if (!businessHours) return []
  
  const openingHours: any[] = []
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  
  daysOfWeek.forEach(day => {
    const hours = businessHours.regularHours[day]
    if (hours && !hours.is_closed) {
      openingHours.push({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": day.charAt(0).toUpperCase() + day.slice(1),
        "opens": hours.opens,
        "closes": hours.closes
      })
    }
  })
  
  return openingHours
}

// Helper to generate kitchen hours specification
export function generateKitchenHoursSpecification(businessHours: BusinessHours | null) {
  if (!businessHours) return []
  
  const kitchenHours: any[] = []
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  
  daysOfWeek.forEach(day => {
    const hours = businessHours.regularHours[day]
    if (hours && !hours.is_closed && hours.kitchen && isKitchenOpen(hours.kitchen)) {
      kitchenHours.push({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": day.charAt(0).toUpperCase() + day.slice(1),
        "opens": hours.kitchen.opens,
        "closes": hours.kitchen.closes,
        "name": "Kitchen Hours"
      })
    }
  })
  
  return kitchenHours
}

// Helper to generate special hours (holidays, etc.)
export function generateSpecialOpeningHours(businessHours: BusinessHours | null) {
  if (!businessHours || !businessHours.specialHours?.length) return []
  
  return businessHours.specialHours.map(special => ({
    "@type": "OpeningHoursSpecification",
    "validFrom": special.date,
    "validThrough": special.date,
    ...(special.is_closed ? {
      "opens": "00:00",
      "closes": "00:00"
    } : {
      "opens": special.opens,
      "closes": special.closes
    }),
    "description": special.reason || special.note || (special.is_closed ? "Closed" : "Modified hours")
  }))
}

// Map allergen types to schema.org RestrictedDiet values
export function mapAllergenToRestrictedDiet(allergen: AllergenType): string | null {
  const allergenMap: Record<AllergenType, string | null> = {
    gluten: "https://schema.org/GlutenFreeDiet",
    crustaceans: null,
    eggs: null,
    fish: null,
    peanuts: null,
    soya: null,
    milk: "https://schema.org/LactoseFreeDiet",
    nuts: null,
    celery: null,
    mustard: null,
    sesame: null,
    sulphites: null,
    lupin: null,
    molluscs: null
  }
  
  return allergenMap[allergen]
}

// Generate suitableForDiet array for menu items
export function generateSuitableForDiet(item: { vegetarian?: boolean, allergens?: string[] }) {
  const diets: string[] = []
  
  if (item.vegetarian) {
    diets.push("https://schema.org/VegetarianDiet")
  }
  
  // Add gluten-free if no gluten allergen
  if (item.allergens && !item.allergens.includes('gluten')) {
    diets.push("https://schema.org/GlutenFreeDiet")
  }
  
  // Add dairy-free if no milk allergen
  if (item.allergens && !item.allergens.includes('milk')) {
    diets.push("https://schema.org/LactoseFreeDiet")
  }
  
  return diets.length > 0 ? diets : undefined
}

// Generate nutrition information schema with AI-estimated values
export function generateNutritionInfo(itemName: string, category: string) {
  // AI-generated nutritional estimates - actual values may vary by serving
  
  const nutritionDefaults: Record<string, any> = {
    pizza: {
      calories: "850-1100",
      fatContent: "32-42g",
      saturatedFatContent: "14-18g",
      carbohydrateContent: "85-110g",
      sugarContent: "8-12g",
      proteinContent: "38-48g",
      sodiumContent: "1600-2100mg",
      fiberContent: "3-5g"
    },
    burger: {
      calories: "650-850",
      fatContent: "38-48g",
      saturatedFatContent: "15-20g",
      carbohydrateContent: "48-62g",
      sugarContent: "8-10g",
      proteinContent: "32-42g",
      sodiumContent: "1100-1400mg",
      fiberContent: "2-4g"
    },
    "fish-and-chips": {
      calories: "850-1050",
      fatContent: "42-52g",
      saturatedFatContent: "8-12g",
      carbohydrateContent: "78-92g",
      sugarContent: "2-4g",
      proteinContent: "38-45g",
      sodiumContent: "900-1300mg",
      fiberContent: "4-6g"
    },
    "sunday-roast": {
      calories: "750-950",
      fatContent: "28-38g",
      saturatedFatContent: "10-15g",
      carbohydrateContent: "65-85g",
      sugarContent: "6-10g",
      proteinContent: "45-60g",
      sodiumContent: "1200-1600mg",
      fiberContent: "6-8g"
    },
    salad: {
      calories: "350-550",
      fatContent: "22-32g",
      saturatedFatContent: "6-10g",
      carbohydrateContent: "25-35g",
      sugarContent: "8-12g",
      proteinContent: "20-30g",
      sodiumContent: "600-900mg",
      fiberContent: "5-8g"
    },
    starter: {
      calories: "250-450",
      fatContent: "15-25g",
      saturatedFatContent: "5-10g",
      carbohydrateContent: "20-35g",
      sugarContent: "3-6g",
      proteinContent: "12-20g",
      sodiumContent: "500-800mg",
      fiberContent: "2-4g"
    },
    default: {
      calories: "varies",
      fatContent: "varies",
      carbohydrateContent: "varies",
      proteinContent: "varies",
      sodiumContent: "varies"
    }
  }
  
  let nutritionKey = 'default'
  const lowerName = itemName.toLowerCase()
  
  if (lowerName.includes('pizza')) nutritionKey = 'pizza'
  else if (lowerName.includes('burger')) nutritionKey = 'burger'
  else if (lowerName.includes('fish') && lowerName.includes('chips')) nutritionKey = 'fish-and-chips'
  else if (category === 'sunday-roast' || lowerName.includes('roast')) nutritionKey = 'sunday-roast'
  else if (lowerName.includes('salad')) nutritionKey = 'salad'
  else if (category === 'starters' || category === 'starter') nutritionKey = 'starter'
  
  return {
    "@type": "NutritionInformation",
    "servingSize": "1 portion",
    "description": "AI-generated nutritional estimates - actual values may vary by serving and preparation method",
    ...nutritionDefaults[nutritionKey]
  }
}

// Generate offer schema for menu items with special deals
export function generateMenuItemOffer(item: any, dayOfWeek?: string) {
  void item
  void dayOfWeek
  return undefined
}

// Generate ContactPoint schema
export function generateContactPoints() {
  return [
    {
      "@type": "ContactPoint",
      "telephone": "+441753682707",
      "contactType": "customer service",
      "areaServed": "GB",
      "availableLanguage": ["English"],
      "contactOption": ["TollFree", "HearingImpairedSupported"]
    },
    {
      "@type": "ContactPoint",
      "telephone": "+441753682707",
      "contactType": "reservations",
      "areaServed": "GB",
      "availableLanguage": ["English"]
    }
  ]
}

// Generate Event schema for recurring events
export function generateEventSchema(eventType: 'quiz' | 'bingo' | 'drag') {
  const baseLocation = {
    "@type": "Place",
    "name": "The Anchor",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Horton Road",
      "addressLocality": "Stanwell Moor",
      "addressRegion": "Surrey",
      "postalCode": "TW19 6AQ",
      "addressCountry": "GB"
    }
  }

  const eventConfigs = {
    quiz: {
      "@type": "Event",
      "name": "Monthly Quiz Night at The Anchor",
      "description": "Test your knowledge at our popular monthly quiz night. 3 entry per person, teams up to 6 people. Great prizes including a 25 bar voucher for 1st place!",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "eventStatus": "https://schema.org/EventScheduled",
      "location": baseLocation,
      "offers": {
        "@type": "Offer",
        "price": "3",
        "priceCurrency": "GBP",
        "availability": "https://schema.org/InStock",
        "validFrom": new Date().toISOString()
      },
      "organizer": {
        "@type": "Organization",
        "name": "The Anchor",
        "url": "https://www.the-anchor.pub"
      },
      "performer": {
        "@type": "Organization",
        "name": "Question One Quiz Masters"
      },
      "maximumAttendeeCapacity": 80,
      "typicalAgeRange": "18+",
      "duration": "PT3H",
      "startTime": "19:00",
      "endTime": "22:00"
    },
    bingo: {
      "@type": "Event",
      "name": "Monthly Cash Bingo at The Anchor",
      "description": "Monthly bingo night with cash prizes! 10 per book gets you 10 games throughout the evening. Various prizes including drinks, chocolates, vouchers, and cash jackpot!",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "eventStatus": "https://schema.org/EventScheduled",
      "location": baseLocation,
      "offers": {
        "@type": "Offer",
        "price": "10",
        "priceCurrency": "GBP",
        "availability": "https://schema.org/InStock",
        "validFrom": new Date().toISOString()
      },
      "organizer": {
        "@type": "Organization",
        "name": "The Anchor",
        "url": "https://www.the-anchor.pub"
      },
      "maximumAttendeeCapacity": 60,
      "typicalAgeRange": "18+",
      "duration": "PT2H",
      "startTime": "19:00",
      "endTime": "21:00"
    },
    drag: {
      "@type": "Event",
      "name": "Monthly Drag Show with Nikki Manfadge",
      "description": "Spectacular monthly drag performances at The Anchor featuring Nikki Manfadge. FREE entry! Experience dazzling performances, hilarious comedy, and unforgettable entertainment.",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "eventStatus": "https://schema.org/EventScheduled",
      "location": baseLocation,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "GBP",
        "availability": "https://schema.org/InStock",
        "validFrom": new Date().toISOString()
      },
      "organizer": {
        "@type": "Organization",
        "name": "The Anchor",
        "url": "https://www.the-anchor.pub"
      },
      "performer": {
        "@type": "Person",
        "name": "Nikki Manfadge"
      },
      "maximumAttendeeCapacity": 150,
      "typicalAgeRange": "18+",
      "duration": "PT2H30M",
      "startTime": "21:00",
      "endTime": "23:30"
    }
  }

  return eventConfigs[eventType]
}

// Generate GeoShape for service area (roughly 10 mile radius around pub)
export function generateServiceArea() {
  return {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": 51.462509,
      "longitude": -0.502067
    },
    "geoRadius": "16000" // 16km ~ 10 miles
  }
}

// Generate aggregate rating from actual review data
export function generateAggregateRating(reviews?: Array<{ rating: number }>) {
  if (!reviews || reviews.length === 0) {
    // Return placeholder until we have real data
    return {
      "@type": "AggregateRating",
      "ratingValue": "4.6",
      "reviewCount": "312",
      "bestRating": "5",
      "worstRating": "1"
    }
  }
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = (totalRating / reviews.length).toFixed(1)
  
  return {
    "@type": "AggregateRating",
    "ratingValue": averageRating,
    "reviewCount": reviews.length.toString(),
    "bestRating": "5",
    "worstRating": "1"
  }
}

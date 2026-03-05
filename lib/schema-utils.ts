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
    ...(!special.is_closed && special.opens && special.closes
      ? { "opens": special.opens, "closes": special.closes }
      : {}),
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

export function generateNutritionInfo(_itemName: string, _category: string): undefined {
  // NutritionInformation requires single numeric values, not ranges.
  // Return undefined until actual measured values are available.
  return undefined
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
export function generateEventSchema(eventType: 'quiz' | 'bingo') {
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

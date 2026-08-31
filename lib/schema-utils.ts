import { BusinessHours, KitchenStatus } from './api'
import { isKitchenOpen } from './api'
import { getKitchenWindows } from './hours-utils'
import type { AllergenType } from '@/hooks/useAllergenFilter'

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function isoDayBefore(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return isoDate
  parsed.setUTCDate(parsed.getUTCDate() - 1)
  return parsed.toISOString().slice(0, 10)
}

type DatedSchedule = {
  hours: BusinessHours['regularHours']
  validFrom?: string
  validThrough?: string
}

/**
 * The weekly schedules to publish, in date order.
 *
 * `regularHours` is only the schedule in force today. When a dated change is
 * already published, emitting that alone tells Google the old times are
 * open-ended and says nothing about the new ones, so each schedule is bounded
 * by the start of the one that succeeds it.
 */
function datedSchedules(businessHours: BusinessHours): DatedSchedule[] {
  const upcoming = (businessHours.upcomingVersions ?? [])
    .filter((version) => version?.effectiveFrom && version.hours)
    .slice()
    .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom))

  if (upcoming.length === 0) return [{ hours: businessHours.regularHours }]

  const schedules: DatedSchedule[] = [
    { hours: businessHours.regularHours, validThrough: isoDayBefore(upcoming[0].effectiveFrom) }
  ]

  upcoming.forEach((version, index) => {
    const next = upcoming[index + 1]
    schedules.push({
      hours: version.hours,
      validFrom: version.effectiveFrom,
      ...(next ? { validThrough: isoDayBefore(next.effectiveFrom) } : {})
    })
  })

  return schedules
}

// Helper to generate OpeningHoursSpecification from BusinessHours API response
export function generateOpeningHoursSpecification(businessHours: BusinessHours | null) {
  if (!businessHours) return []

  const openingHours: any[] = []

  datedSchedules(businessHours).forEach((schedule) => {
    daysOfWeek.forEach(day => {
      const hours = schedule.hours?.[day]
      if (hours && !hours.is_closed) {
        openingHours.push({
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": day.charAt(0).toUpperCase() + day.slice(1),
          "opens": hours.opens,
          "closes": hours.closes,
          ...(schedule.validFrom ? { "validFrom": schedule.validFrom } : {}),
          ...(schedule.validThrough ? { "validThrough": schedule.validThrough } : {})
        })
      }
    })
  })

  return openingHours
}

// Helper to generate kitchen hours specification
export function generateKitchenHoursSpecification(businessHours: BusinessHours | null) {
  if (!businessHours) return []

  const kitchenHours: any[] = []

  datedSchedules(businessHours).forEach((schedule) => {
    daysOfWeek.forEach(day => {
      const hours = schedule.hours?.[day]
      if (!hours || hours.is_closed) return

      // One entry per sitting: a day that serves lunch and then dinner is two
      // windows, and publishing the flattened span would advertise food through
      // a gap the booking system refuses.
      getKitchenWindows(hours).forEach((window) => {
        kitchenHours.push({
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": day.charAt(0).toUpperCase() + day.slice(1),
          "opens": window.opens,
          "closes": window.closes,
          "name": "Kitchen Hours",
          ...(schedule.validFrom ? { "validFrom": schedule.validFrom } : {}),
          ...(schedule.validThrough ? { "validThrough": schedule.validThrough } : {})
        })
      })
    })
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
    gluten: null,
    crustaceans: null,
    eggs: null,
    fish: null,
    peanuts: null,
    soya: null,
    milk: null,
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

// Generate suitableForDiet array for menu items.
// Keep this to explicit vegan and vegetarian claims only.
export function generateSuitableForDiet(item: { vegetarian?: boolean, vegan?: boolean }) {
  const diets: string[] = []

  if (item.vegan) {
    diets.push("https://schema.org/VeganDiet")
  }

  if (item.vegetarian) {
    diets.push("https://schema.org/VegetarianDiet")
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
    // No self-serving or hardcoded ratings. Only emit AggregateRating from real review data.
    return undefined
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

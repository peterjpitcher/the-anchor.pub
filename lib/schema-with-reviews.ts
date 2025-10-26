import { organizationSchema, webSiteSchema } from './schema'
import { DEFAULT_PAGE_HEADER_IMAGE, DEFAULT_FOOD_IMAGE } from './image-fallbacks'
import { getAnchorPlacesClient } from './google/places-client'

export async function getEnhancedSchemas() {
  // Try to get dynamic rating data
  let rating = 4.6
  let reviewCount = 312
  
  try {
    const client = getAnchorPlacesClient()
    if (client) {
      const ratingInfo = await client.getRatingInfo()
      if (ratingInfo) {
        rating = ratingInfo.rating
        reviewCount = ratingInfo.totalReviews
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn('Failed to fetch rating for schema:', message)
    // Use defaults on error
  }

  const defaultImages = [
    `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
    'https://www.the-anchor.pub/images/garden/beer-garden/the-anchor-beer-garden-heathrow-flight-path.jpg',
    `https://www.the-anchor.pub${DEFAULT_FOOD_IMAGE}`
  ]

  const localBusinessSchemaWithReviews = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "BarOrPub"],
    "@id": "https://www.the-anchor.pub/#business",
    "name": "The Anchor",
    "image": defaultImages,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Horton Road",
      "addressLocality": "Stanwell Moor",
      "addressRegion": "Surrey",
      "postalCode": "TW19 6AQ",
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 51.462509,
      "longitude": -0.502067
    },
    "url": "https://www.the-anchor.pub",
    "telephone": "+441753682707",
    "priceRange": "££",
    "servesCuisine": ["British", "Pizza", "Pub Food"],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Monday",
        "opens": "16:00",
        "closes": "22:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Tuesday",
        "opens": "16:00",
        "closes": "22:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Wednesday",
        "opens": "16:00",
        "closes": "22:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Thursday",
        "opens": "16:00",
        "closes": "22:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Friday",
        "opens": "16:00",
        "closes": "00:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "12:00",
        "closes": "00:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "12:00",
        "closes": "22:00"
      }
    ],
    "hasMenu": "https://www.the-anchor.pub/food",
    "acceptsReservations": "true",
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Dog Friendly", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Beer Garden", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Parking", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Live Entertainment", "value": true }
    ],
    "paymentAccepted": ["Cash", "Credit Card", "Debit Card"],
    "currenciesAccepted": "GBP",
    "menu": "https://www.the-anchor.pub/food",
    "smokingAllowed": false
  }

  return {
    organizationSchema,
    localBusinessSchema: localBusinessSchemaWithReviews,
    webSiteSchema
  }
}

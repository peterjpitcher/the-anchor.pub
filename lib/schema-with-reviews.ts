import { unstable_cache } from 'next/cache'
import { organizationSchema, webSiteSchema } from './schema'
import { DEFAULT_PAGE_HEADER_IMAGE, DEFAULT_FOOD_IMAGE } from './image-fallbacks'
import { anchorAPI } from './api'
import { buildOpeningHoursSchema } from './opening-hours-schema'
import { DEFAULT_REVIEW_STATS } from './google/review-utils'

const getBusinessStatsCached = unstable_cache(
  async () => {
    let rating = DEFAULT_REVIEW_STATS.rating
    let reviewCount = DEFAULT_REVIEW_STATS.totalReviews
    let openingHours: ReturnType<typeof buildOpeningHoursSchema> = []

    try {
      const hours = await anchorAPI.getBusinessHours()
      openingHours = buildOpeningHoursSchema(hours?.regularHours)
    } catch (error) {
      console.warn('Failed to fetch opening hours for schema, omitting hours:', error)
    }

    return { rating, reviewCount, openingHours }
  },
  ['business-stats'],
  { revalidate: 300 }
)

export async function getBusinessStats() {
  return getBusinessStatsCached()
}

const getEnhancedSchemasCached = unstable_cache(
  async () => {
    const stats = await getBusinessStatsCached()
    const { openingHours } = stats

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
      "description": "The closest traditional British pub to Heathrow Airport. Famous Sunday roasts, beer garden under the flight path, and FREE parking for all guests.",
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
      "sameAs": [
        "https://www.facebook.com/theanchorpubsm/",
        "https://www.instagram.com/theanchor.pub/",
        "https://www.google.com/maps?cid=17928230944823812473",
        "https://www.tripadvisor.co.uk/Restaurant_Review-g477981-d9717898-Reviews-The_Anchor-Staines_Surrey_England.html",
        "https://www.opentable.co.uk/r/the-anchor-stanwell-moor",
        "https://ratings.food.gov.uk/business/1110171/the-anchor-stanwell-moor"
      ],
      "priceRange": "££",
      "servesCuisine": ["British", "Pizza", "Pub Food", "Sunday Roast"],
      ...(openingHours.length ? { "openingHoursSpecification": openingHours } : {}),
      "hasMenu": "https://www.the-anchor.pub/food-menu",
      "acceptsReservations": true,
      "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Free Parking", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Dog Friendly", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Family Friendly", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Step-free access", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Free WiFi", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Beer Garden", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Live Entertainment", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Plane Spotting", "value": true }
      ],
      "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Contactless"],
      "currenciesAccepted": "GBP",
      "menu": "https://www.the-anchor.pub/food-menu",
      "smokingAllowed": false,
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": "Stanwell Moor",
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": "Surrey",
          "containedInPlace": {
            "@type": "Country",
            "name": "United Kingdom"
          }
        }
      },
      "potentialAction": {
        "@type": "ReserveAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.the-anchor.pub/book-table",
          "actionPlatform": [
            "https://schema.org/DesktopWebPlatform",
            "https://schema.org/MobileWebPlatform"
          ]
        },
        "result": {
          "@type": "FoodEstablishmentReservation"
        }
      }
    }

    return {
      organizationSchema,
      localBusinessSchema: localBusinessSchemaWithReviews,
      webSiteSchema
    }
  },
  ['enhanced-schemas'],
  { revalidate: 300 }
)

export async function getEnhancedSchemas() {
  return getEnhancedSchemasCached()
}

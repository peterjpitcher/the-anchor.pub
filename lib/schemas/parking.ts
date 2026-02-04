// ParkingFacility Schema for The Anchor
export const parkingFacilitySchema = {
  "@context": "https://schema.org",
  "@type": "ParkingFacility",
  "@id": "https://www.the-anchor.pub/#parking",
  "name": "The Anchor Free Customer Parking",
  "description": "Free on-site parking for all guests at The Anchor pub. No time limits, no charges - a huge advantage over expensive airport parking.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Horton Road",
    "addressLocality": "Stanwell Moor",
    "addressRegion": "Surrey",
    "postalCode": "TW19 6AQ",
    "addressCountry": "GB"
  },
  "priceCurrency": "GBP",
  "price": "0",
  "freeOfCharge": true,
  "numberOfParkingSpaces": "30",
  "amenityFeature": [
    {
      "@type": "LocationFeatureSpecification",
      "name": "Free Parking",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "On-Site Parking",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "No Time Limit",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Disabled Parking",
      "value": true
    }
  ],
  "owner": {
    "@type": "Restaurant",
    "name": "The Anchor",
    "telephone": "+441753682707"
  }
}

// Enhanced LocalBusiness schema with parking reference
export function getLocalBusinessWithParking() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "The Anchor",
    "parking": {
      "@id": "https://www.the-anchor.pub/#parking"
    },
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Free Parking",
        "value": true
      }
    ]
  }
}

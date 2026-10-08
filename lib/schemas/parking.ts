import { PARKING_WORDING } from '../approved-wording'
import { CONTACT, PARKING, POSTAL_ADDRESS_SCHEMA } from '../constants'

// ParkingFacility Schema for The Anchor. This is the free parking for guests
// while they are with us: the paid airport parking is a separate product
// (docs/SSOT.md section 8), so nothing here compares the two.
export const parkingFacilitySchema = {
  "@context": "https://schema.org",
  "@type": "ParkingFacility",
  "@id": "https://www.the-anchor.pub/#parking",
  "name": "The Anchor Free Customer Parking",
  "description": PARKING_WORDING,
  "address": POSTAL_ADDRESS_SCHEMA,
  "priceCurrency": "GBP",
  "price": "0",
  "freeOfCharge": true,
  "numberOfParkingSpaces": String(PARKING.capacity),
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
    }
  ],
  "owner": {
    "@type": "Restaurant",
    "name": "The Anchor",
    "telephone": CONTACT.phoneIntl
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

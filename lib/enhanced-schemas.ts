// Enhanced Schema Markup for The Anchor Website

// FAQ Schema for Homepage and Voice Search
export const homepageFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What are The Anchor pub's opening hours?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our opening hours and kitchen hours are updated live on the website. Please check the Opening Hours section or call 01753 682707 for today's times."
      }
    },
    {
      "@type": "Question",
      "name": "Does The Anchor have parking?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! We have free parking for all our guests. This is a huge advantage over expensive airport parking - you can park with us for free while enjoying a meal before or after your flight."
      }
    },
    {
      "@type": "Question",
      "name": "Is The Anchor dog friendly?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! Dogs are welcome throughout The Anchor, including in our bar area and beer garden. We provide water bowls and your furry friends are part of the family here."
      }
    },
    {
      "@type": "Question",
      "name": "How far is The Anchor from Heathrow Airport?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Anchor is just 7 minutes from Terminal 5, 11 minutes from Terminals 2 & 3, and 12 minutes from Terminal 4. We're the closest traditional British pub to Heathrow Airport."
      }
    },
    {
      "@type": "Question",
      "name": "Does The Anchor have any special offers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! We have Buy One Get One Free pizza every Tuesday and Wednesday, 50% off fish & chips for over 65s every Friday, plus hosted nights like Music Bingo with Nikki Manfadge and one-off events. See /whats-on for the latest details."
      }
    }
  ]
}

// Breadcrumb Schema Generator
export function generateBreadcrumbSchema(items: Array<{ name: string, url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://www.the-anchor.pub${item.url}`
    }))
  }
}

// Note: aggregateRating should always be added directly to a parent schema (LocalBusiness, Product, Service, etc.)
// Never use aggregateRating as a standalone schema

// Drinks Menu Schema
export const drinksMenuSchema = {
  "@context": "https://schema.org",
  "@type": "Menu",
  "name": "The Anchor Drinks Menu",
  "description": "Full bar service with real ales, draught lagers, wines, spirits and soft drinks",
  "hasMenuSection": [
    {
      "@type": "MenuSection",
      "name": "Draught Beers & Ciders",
      "hasMenuItem": [
        {
          "@type": "MenuItem",
          "name": "Guinness",
          "description": "The classic Irish stout",
          "offers": {
            "@type": "Offer",
            "price": "5.50",
            "priceCurrency": "GBP"
          }
        },
        {
          "@type": "MenuItem",
          "name": "Stella Artois",
          "description": "Premium Belgian lager",
          "offers": {
            "@type": "Offer",
            "price": "5.20",
            "priceCurrency": "GBP"
          }
        }
      ]
    },
    {
      "@type": "MenuSection",
      "name": "Wines",
      "hasMenuItem": [
        {
          "@type": "MenuItem",
          "name": "House Red Wine",
          "description": "Smooth Merlot or full-bodied Cabernet Sauvignon",
          "offers": {
            "@type": "Offer",
            "price": "4.50",
            "priceCurrency": "GBP",
            "unitCode": "175ml glass"
          }
        }
      ]
    }
  ]
}

// Enhanced Place Schema for Find Us page
export const findUsPlaceSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "The Anchor",
  "description": "Traditional British pub near Heathrow Airport with free parking",
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
  "hasMap": "https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ",
  "publicAccess": true,
  "smokingAllowed": "Outside only",
  "amenityFeature": [
    {
      "@type": "LocationFeatureSpecification",
      "name": "Free Parking",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Wheelchair Accessible",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Beer Garden",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Dog Friendly",
      "value": true
    }
  ],
  "paymentAccepted": "Cash, Credit Card, Debit Card, Contactless",
  "currenciesAccepted": "GBP",
  "priceRange": "moderate"
}

// Event Booking Service Schema
export const eventBookingServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Private Event Hosting at The Anchor",
  "description": "Host your special event at The Anchor - birthdays, wakes, corporate events, and celebrations",
  "provider": {
    "@type": "Restaurant",
    "name": "The Anchor"
  },
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": 51.4764,
      "longitude": -0.4735
    },
    "geoRadius": "20 miles"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Event Packages",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "Birthday Party Package",
        "description": "Customizable birthday celebrations with food and drink options"
      },
      {
        "@type": "Offer",
        "name": "Corporate Event Package",
        "description": "Professional venue for team events and business meetings"
      },
      {
        "@type": "Offer",
        "name": "Wake & Memorial Package",
        "description": "Respectful and caring service for celebration of life events"
      }
    ]
  }
}

// Speakable Schema for Voice Search
export const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [
      ".hero-title",
      ".opening-hours",
      ".contact-info",
      ".special-offers"
    ]
  }
}

// Note: Review schemas should only be used for specific products/services, not the restaurant itself
// Use aggregateRating on LocalBusiness schema instead for overall restaurant ratings

// HowTo Schema for Directions
export function generateHowToDirectionsSchema(from: string, to: string = "The Anchor", steps: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to get to ${to} from ${from}`,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "name": `Step ${index + 1}`,
      "text": step,
      "position": index + 1
    })),
    "totalTime": "PT10M",
    "supply": {
      "@type": "HowToSupply",
      "name": "Transportation",
      "requiredQuantity": 1
    }
  }
}

// Special Offer Schema for Over 65s
export const over65sOfferSchema = {
  "@context": "https://schema.org",
  "@type": "Offer",
  "name": "50% Off Fish & Chips for Over 65s",
  "description": "Every Friday, customers aged 65 and over receive 50% off our traditional fish & chips",
  "eligibleCustomerType": "Seniors (65+)",
  "itemOffered": {
    "@type": "MenuItem",
    "name": "Fish & Chips",
    "description": "Beer-battered fish with chunky chips, mushy peas, tartar sauce, and lemon"
  },
  "priceSpecification": {
    "@type": "PriceSpecification",
    "price": "7.50",
    "priceCurrency": "GBP",
    "valueAddedTaxIncluded": true
  },
  "validFrom": "2025-01-01",
  "validThrough": "2025-12-31",
  "availabilityStarts": "12:00",
  "availabilityEnds": "21:00",
  "availableDay": "Friday"
}

import { DEFAULT_PAGE_HEADER_IMAGE, DEFAULT_FOOD_IMAGE } from './image-fallbacks'

const DEFAULT_SCHEMA_IMAGES = [
  `https://www.the-anchor.pub${DEFAULT_PAGE_HEADER_IMAGE}`,
  'https://www.the-anchor.pub/images/garden/beer-garden/the-anchor-beer-garden-heathrow-flight-path.jpg',
  `https://www.the-anchor.pub${DEFAULT_FOOD_IMAGE}`
]

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.the-anchor.pub/#organization",
  "name": "The Anchor",
  "url": "https://www.the-anchor.pub",
  "logo": "https://www.the-anchor.pub/images/the-anchor-pub-logo-black-transparent.png",
  "sameAs": [
    "https://www.facebook.com/theanchorpubsm/",
    "https://www.instagram.com/theanchor.pub/"
  ],
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
  "telephone": "+441753682707",
  "email": "manager@the-anchor.pub"
}

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "BarOrPub"],
  "@id": "https://www.the-anchor.pub/#business",
  "name": "The Anchor",
  "image": DEFAULT_SCHEMA_IMAGES,
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
  "acceptsReservations": "true",
  "menu": "https://www.the-anchor.pub/food-menu",
  "hasMenu": {
    "@type": "Menu",
    "name": "The Anchor Menu",
    "url": "https://www.the-anchor.pub/food-menu"
  },
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
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Free WiFi",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Pool Table",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Darts",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Outside ULEZ Zone",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Luggage Storage",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Live Sports on TV",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Private Event Space",
      "value": true
    }
  ],
  "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "American Express"],
  "currenciesAccepted": "GBP",
  "publicAccess": true,
  "isAccessibleForFree": true,
  "maximumAttendeeCapacity": 250,
  "smokingAllowed": false,
  "keywords": "pub near Heathrow, restaurant Stanwell Moor, British food Surrey, beer garden, dog friendly pub",
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+441753682707",
      "contactType": "customer service",
      "areaServed": "GB",
      "availableLanguage": ["English"]
    },
    {
      "@type": "ContactPoint",
      "telephone": "+441753682707",
      "contactType": "reservations",
      "areaServed": "GB",
      "availableLanguage": ["English"]
    }
  ],
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": 51.462509,
      "longitude": -0.502067
    },
    "geoRadius": "16000"
  }
}

// Special Announcement for Monday Closure
export const specialAnnouncementSchema = {
  "@context": "https://schema.org",
  "@type": "SpecialAnnouncement",
  "@id": "https://www.the-anchor.pub/#monday-closure",
  "name": "Monday Closure",
  "text": "The Anchor is closed every Monday. Kitchen is also closed on Mondays.",
  "datePosted": "2024-01-01",
  "expires": "2026-12-31",
  "announcementLocation": {
    "@id": "https://www.the-anchor.pub/#business"
  },
  "spatialCoverage": {
    "@type": "Place",
    "name": "The Anchor",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Stanwell Moor",
      "addressRegion": "Surrey"
    }
  }
}

export const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.the-anchor.pub/#website",
  "url": "https://www.the-anchor.pub",
  "name": "The Anchor Stanwell Moor",
  "description": "Traditional British pub near Heathrow with quiz nights, hosted events, and famous Sunday roasts",
  "publisher": {
    "@id": "https://www.the-anchor.pub/#organization"
  }
}

export const restaurantSchema = localBusinessSchema

// Event Series Schemas for Regular Events
export const quizNightEventSeries = {
  "@context": "https://schema.org",
  "@type": "EventSeries",
  "@id": "https://www.the-anchor.pub/#quiz-night-series",
  "name": "Monthly Quiz Night at The Anchor",
  "description": "Test your knowledge at our popular monthly quiz night. 3 entry, teams up to 6, great prizes including a 25 bar voucher for winners.",
  "startDate": "2024-01-01",
  "endDate": "2026-12-31",
  "eventSchedule": {
    "@type": "Schedule",
    "repeatFrequency": "P1M",
    "startTime": "19:00:00",
    "endTime": "22:00:00",
    "scheduleTimezone": "Europe/London"
  },
  "location": {
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
  },
  "offers": {
    "@type": "Offer",
    "price": "3",
    "priceCurrency": "GBP",
    "availability": "https://schema.org/InStock"
  },
  "organizer": {
    "@id": "https://www.the-anchor.pub/#organization"
  },
  "performer": {
    "@type": "Organization",
    "name": "Question One Quiz Masters"
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
    }
  }
}

export const bingoEventSeries = {
  "@context": "https://schema.org",
  "@type": "EventSeries",
  "@id": "https://www.the-anchor.pub/#bingo-series",
  "name": "Monthly Cash Bingo Night",
  "description": "Monthly bingo night with 10 per book entry. 10 games with various prizes including drinks, chocolate, vouchers, and cash jackpot on the last game.",
  "startDate": "2024-01-01",
  "endDate": "2026-12-31",
  "eventSchedule": {
    "@type": "Schedule",
    "repeatFrequency": "P1M",
    "startTime": "19:00:00",
    "endTime": "21:00:00",
    "scheduleTimezone": "Europe/London"
  },
  "location": {
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
  },
  "offers": {
    "@type": "Offer",
    "price": "10",
    "priceCurrency": "GBP",
    "availability": "https://schema.org/InStock"
  },
  "organizer": {
    "@id": "https://www.the-anchor.pub/#organization"
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
    }
  }
}

// Parking Facility Schema
export const parkingFacilitySchema = {
  "@context": "https://schema.org",
  "@type": "ParkingFacility",
  "@id": "https://www.the-anchor.pub/#parking",
  "name": "The Anchor Free Car Park",
  "description": "Free customer parking available on-site with ample spaces for pub visitors",
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
  "maximumVehicleHeight": {
    "@type": "QuantitativeValue",
    "value": 2.5,
    "unitCode": "MTR"
  },
  "petsAllowed": true,
  "isAccessibleForFree": true,
  "numberOfSpaces": {
    "@type": "QuantitativeValue",
    "value": 50
  },
  "amenityFeature": [
    {
      "@type": "LocationFeatureSpecification",
      "name": "Wheelchair Accessible Spaces",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Well Lit",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "CCTV Monitored",
      "value": true
    }
  ],
  "operator": {
    "@id": "https://www.the-anchor.pub/#organization"
  }
}

// Individual Review Schema Generator
export const createReviewSchema = (review: {
  author: string;
  datePublished: string;
  reviewBody: string;
  reviewRating: number;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": review.author
    },
    "datePublished": review.datePublished,
    "reviewBody": review.reviewBody,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.reviewRating,
      "bestRating": 5,
      "worstRating": 1
    },
    "itemReviewed": {
      "@id": "https://www.the-anchor.pub/#business"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Google Reviews"
    }
  }
}

// Image Object Schema Generator
export const createImageObjectSchema = (image: {
  url: string;
  name: string;
  caption?: string;
  width?: number;
  height?: number;
  datePublished?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "contentUrl": image.url,
    "name": image.name,
    "caption": image.caption || image.name,
    "description": image.caption || image.name,
    "width": image.width || 1200,
    "height": image.height || 800,
    "datePublished": image.datePublished || new Date().toISOString(),
    "uploadDate": image.datePublished || new Date().toISOString(),
    "copyrightHolder": {
      "@id": "https://www.the-anchor.pub/#organization"
    },
    "contentLocation": {
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
    },
    "license": "https://www.the-anchor.pub/terms",
    "acquireLicensePage": "https://www.the-anchor.pub/find-us"
  }
}

// Food Establishment Reservation Schema Generator
export const createReservationSchema = (reservation: {
  reservationId: string;
  reservationStatus: 'ReservationConfirmed' | 'ReservationPending' | 'ReservationCancelled';
  startTime: string;
  endTime: string;
  partySize: number;
  reservationFor?: {
    name: string;
    email?: string;
    telephone?: string;
  };
  bookingTime?: string;
  modifiedTime?: string;
  specialRequests?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "FoodEstablishmentReservation",
    "reservationId": reservation.reservationId,
    "reservationStatus": `https://schema.org/${reservation.reservationStatus}`,
    "startTime": reservation.startTime,
    "endTime": reservation.endTime,
    "partySize": reservation.partySize,
    "reservationFor": reservation.reservationFor ? {
      "@type": "Person",
      "name": reservation.reservationFor.name,
      "email": reservation.reservationFor.email,
      "telephone": reservation.reservationFor.telephone
    } : undefined,
    "bookingTime": reservation.bookingTime || new Date().toISOString(),
    "modifiedTime": reservation.modifiedTime,
    "provider": {
      "@id": "https://www.the-anchor.pub/#business"
    },
    "programMembershipUsed": {
      "@type": "ProgramMembership",
      "programName": "The Anchor Booking System",
      "url": "https://www.the-anchor.pub/book-table"
    },
    "bookingAgent": {
      "@type": "Organization",
      "name": "The Anchor Online Booking",
      "url": "https://www.the-anchor.pub"
    },
    "specialRequests": reservation.specialRequests,
    "potentialAction": [
      {
        "@type": "ConfirmAction",
        "name": "Confirm Reservation",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `https://www.the-anchor.pub/reservations/confirm/${reservation.reservationId}`,
          "actionPlatform": [
            "https://schema.org/DesktopWebPlatform",
            "https://schema.org/MobileWebPlatform"
          ]
        }
      },
      {
        "@type": "CancelAction",
        "name": "Cancel Reservation",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `https://www.the-anchor.pub/reservations/cancel/${reservation.reservationId}`,
          "actionPlatform": [
            "https://schema.org/DesktopWebPlatform",
            "https://schema.org/MobileWebPlatform"
          ]
        }
      }
    ]
  }
}

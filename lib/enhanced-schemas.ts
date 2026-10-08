import { HEATHROW_TIMES } from '@/lib/constants'
import { DOGS_WORDING } from '@/lib/approved-wording'
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
        "text": DOGS_WORDING
      }
    },
    {
      "@type": "Question",
      "name": "How far is The Anchor from Heathrow Airport?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `The Anchor is just ${HEATHROW_TIMES.terminal5} minutes from Terminal 5, ${HEATHROW_TIMES.terminal2} minutes from Terminals 2 & 3, and ${HEATHROW_TIMES.terminal4} minutes from Terminal 4. We're the closest traditional British pub to Heathrow Airport.`
      }
    }
  ]
}

const SITE_ORIGIN = 'https://www.the-anchor.pub'

/**
 * Turn a breadcrumb `url` into the one absolute address Google should read.
 *
 * The convention is a path ('/private-hire'). Six pages passed a full address
 * instead and the origin was glued on a second time, publishing
 * "https://www.the-anchor.pubhttps://www.the-anchor.pub/private-hire". A full
 * address is now left alone rather than trusted to be a path, so the same
 * mistake cannot publish a broken link again.
 */
export function toAbsoluteSiteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url
  return `${SITE_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`
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
      "item": toAbsoluteSiteUrl(item.url)
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
  "description": "Full bar service with bottled beers, draught lagers, wines, spirits and soft drinks",
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
            "priceCurrency": "GBP"
          }
        }
      ]
    }
  ]
}

// Enhanced Place Schema for Find Us page, references the canonical business entity
export const findUsPlaceSchema = {
  "@context": "https://schema.org",
  "@type": "Place",
  "@id": "https://www.the-anchor.pub/find-us#place",
  "name": "The Anchor",
  "hasMap": "https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ",
  "publicAccess": true,
  "isPartOf": { "@id": "https://www.the-anchor.pub/#business" }
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


/**
 * Schema.org helpers for generating structured data
 */

interface BreadcrumbItem {
  name: string
  href: string
}

/**
 * Generates BreadcrumbList schema for navigation
 */
export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://www.the-anchor.pub${item.href}`
    }))
  }
}

/**
 * Generates FAQPage schema
 */
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

/**
 * Generates MenuItem schema for food/drink items
 */
export function getMenuItemSchema(item: {
  name: string
  description: string
  price?: string
  currency?: string
  image?: string
  nutrition?: {
    calories?: number
    servingSize?: string
  }
}) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    "name": item.name,
    "description": item.description
  }
  
  if (item.price) {
    schema.offers = {
      "@type": "Offer",
      "price": item.price,
      "priceCurrency": item.currency || "GBP"
    }
  }
  
  if (item.image) {
    schema.image = item.image
  }
  
  if (item.nutrition) {
    schema.nutrition = {
      "@type": "NutritionInformation",
      "calories": item.nutrition.calories,
      "servingSize": item.nutrition.servingSize
    }
  }
  
  return schema
}

/**
 * Generates Event schema for individual events
 */
export function getEventSchema(event: {
  name: string
  description: string
  startDate: string
  endDate?: string
  location?: string
  performer?: string
  price?: string
  currency?: string
  availability?: string
  image?: string
}) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.name,
    "description": event.description,
    "startDate": event.startDate,
    "location": {
      "@type": "Place",
      "name": event.location || "The Anchor",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Horton Road",
        "addressLocality": "Stanwell Moor",
        "addressRegion": "Surrey",
        "postalCode": "TW19 6AQ",
        "addressCountry": "GB"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": "The Anchor",
      "url": "https://www.the-anchor.pub"
    }
  }
  
  if (event.endDate) {
    schema.endDate = event.endDate
  }
  
  if (event.performer) {
    schema.performer = {
      "@type": "Person",
      "name": event.performer
    }
  }
  
  if (event.price !== undefined) {
    schema.offers = {
      "@type": "Offer",
      "price": event.price,
      "priceCurrency": event.currency || "GBP",
      "availability": event.availability || "https://schema.org/InStock"
    }
  }
  
  if (event.image) {
    schema.image = event.image
  }
  
  return schema
}

/**
 * Generates VideoObject schema for embedded videos
 */
export function getVideoSchema(video: {
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  duration?: string
  embedUrl?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.name,
    "description": video.description,
    "thumbnailUrl": video.thumbnailUrl,
    "uploadDate": video.uploadDate,
    "duration": video.duration,
    "embedUrl": video.embedUrl
  }
}

/**
 * Generates Review schema
 */
export function getReviewSchema(review: {
  author: string
  rating: number
  reviewBody: string
  datePublished: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": review.author
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": "5"
    },
    "reviewBody": review.reviewBody,
    "datePublished": review.datePublished
  }
}

/**
 * Generates Service schema for venue services
 */
export function getServiceSchema(service: {
  name: string
  description: string
  provider?: string
  areaServed?: string
  availableChannel?: {
    url: string
    name: string
  }
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "provider": {
      "@type": "Organization",
      "name": service.provider || "The Anchor"
    },
    "areaServed": service.areaServed || "Stanwell Moor, Surrey",
    "availableChannel": service.availableChannel || {
      "@type": "ServiceChannel",
      "serviceUrl": "https://www.the-anchor.pub/private-hire",
      "name": "Online Booking"
    }
  }
}

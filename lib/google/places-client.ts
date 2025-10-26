// Google Places API Client
import { PlaceDetails, GoogleReview } from './types'

const GOOGLE_PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place'

export class GooglePlacesClient {
  private apiKey: string
  private placeId: string

  constructor(apiKey: string, placeId: string) {
    this.apiKey = apiKey
    this.placeId = placeId
  }

  async getPlaceDetails(): Promise<PlaceDetails | null> {
    try {
      const url = `${GOOGLE_PLACES_API_BASE}/details/json?` + 
        `place_id=${this.placeId}&` +
        `fields=place_id,name,formatted_address,rating,user_ratings_total,reviews,url,website,geometry&` +
        `key=${this.apiKey}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === 'OK' && data.result) {
        return data.result as PlaceDetails
      }

      console.warn('Google Places API error:', {
        status: data.status,
        message: data.error_message
      })
      return null
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn('Failed to fetch place details:', message)
      return null
    }
  }

  async getReviews(): Promise<GoogleReview[]> {
    const details = await this.getPlaceDetails()
    return details?.reviews || []
  }

  // Get aggregate rating info
  async getRatingInfo(): Promise<{ rating: number; totalReviews: number } | null> {
    const details = await this.getPlaceDetails()
    if (!details) return null

    return {
      rating: details.rating || 0,
      totalReviews: details.user_ratings_total || 0
    }
  }
}

// Singleton instance for The Anchor
let anchorPlacesClient: GooglePlacesClient | null = null
let buildWarningLogged = false

export function getAnchorPlacesClient(): GooglePlacesClient | null {
  // Use server-side API key if available, fallback to regular key
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY_SERVER || process.env.GOOGLE_PLACES_API_KEY;
  const isBuildPhase =
    typeof window === 'undefined' &&
    process.env.NEXT_PHASE === 'phase-production-build' &&
    process.env.ENABLE_BUILD_TIME_EXTERNAL_API !== 'true'
  
  if (!API_KEY || !process.env.GOOGLE_PLACE_ID) {
    console.warn('Google Places API credentials not configured')
    return null
  }

  if (isBuildPhase) {
    if (!buildWarningLogged) {
      console.info('Google Places API disabled during build; using mock reviews')
      buildWarningLogged = true
    }
    return null
  }

  if (!anchorPlacesClient) {
    anchorPlacesClient = new GooglePlacesClient(
      API_KEY,
      process.env.GOOGLE_PLACE_ID
    )
  }

  return anchorPlacesClient
}

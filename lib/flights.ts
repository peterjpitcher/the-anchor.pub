// Heathrow Flight Data Service using AviationStack API
// Provides real-time flight information for terminal pages

const AVIATIONSTACK_API_KEY = process.env.NEXT_PUBLIC_AVIATIONSTACK_API_KEY
const API_BASE_URL = 'http://api.aviationstack.com/v1'

// Cache duration: 10 minutes (to minimize API calls)
const CACHE_DURATION = 10 * 60 * 1000

export interface Flight {
  flight_date: string
  flight_status: string
  departure: {
    airport: string
    timezone: string
    iata: string
    icao: string
    terminal: string | null
    gate: string | null
    scheduled: string
    estimated: string | null
    actual: string | null
    estimated_runway: string | null
    actual_runway: string | null
  }
  arrival: {
    airport: string
    timezone: string
    iata: string
    icao: string
    terminal: string | null
    gate: string | null
    scheduled: string
    estimated: string | null
    actual: string | null
    estimated_runway: string | null
    actual_runway: string | null
  }
  airline: {
    name: string
    iata: string
    icao: string
  }
  flight: {
    number: string
    iata: string
    icao: string
  }
}

export interface FlightResponse {
  flights: Flight[]
  pagination: {
    limit: number
    offset: number
    count: number
    total: number
  }
}

// Terminal mappings for Heathrow
const TERMINAL_CODES: Record<string, string> = {
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  'terminal-2': '2',
  'terminal-3': '3',
  'terminal-4': '4',
  'terminal-5': '5'
}

// Cache implementation
const flightCache = new Map<string, { data: FlightResponse; timestamp: number }>()

export class FlightAPI {
  private apiKey: string

  constructor() {
    this.apiKey = AVIATIONSTACK_API_KEY || ''
    
    if (!this.apiKey) {
      console.warn('NEXT_PUBLIC_AVIATIONSTACK_API_KEY is not set. Flight data will not be available.')
    }
  }

  private getCacheKey(params: Record<string, string>): string {
    return JSON.stringify(params)
  }

  private async fetchFromAPI(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    if (!this.apiKey) {
      throw new Error('AviationStack API key not configured')
    }

    const queryParams = new URLSearchParams({
      access_key: this.apiKey,
      ...params
    })

    const url = `${API_BASE_URL}${endpoint}?${queryParams}`

    try {
      const response = await fetch(url, {
        next: { revalidate: 600 } // Next.js cache for 10 minutes
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        console.error('AviationStack API error:', data.error)
        throw new Error(data.error.message || data.error.type || 'API error occurred')
      }

      console.log('AviationStack API response:', {
        endpoint,
        params,
        dataLength: data.data?.length || 0,
        pagination: data.pagination
      })

      return data
    } catch (error) {
      console.error('Flight API error:', error)
      console.error('Failed URL:', url)
      throw error
    }
  }

  async getDepartures(terminal?: string, limit: number = 10): Promise<FlightResponse> {
    const params: Record<string, string> = {
      dep_iata: 'LHR', // Heathrow IATA code
      limit: limit.toString(),
    }

    // Note: Free tier might not support terminal filtering
    // if (terminal) {
    //   const terminalCode = TERMINAL_CODES[terminal] || terminal
    //   params.dep_terminal = terminalCode
    // }

    // Check cache first
    const cacheKey = this.getCacheKey({ ...params, type: 'departures' })
    const cached = flightCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    try {
      const data = await this.fetchFromAPI('/flights', params)
      const flightResponse: FlightResponse = {
        flights: data.data || [],
        pagination: data.pagination || { limit: 0, offset: 0, count: 0, total: 0 }
      }

      // Cache the response
      flightCache.set(cacheKey, {
        data: flightResponse,
        timestamp: Date.now()
      })

      return flightResponse
    } catch (error) {
      console.error('Failed to fetch departures:', error)
      return { flights: [], pagination: { limit: 0, offset: 0, count: 0, total: 0 } }
    }
  }

  async getArrivals(terminal?: string, limit: number = 10): Promise<FlightResponse> {
    const params: Record<string, string> = {
      arr_iata: 'LHR', // Heathrow IATA code
      limit: limit.toString(),
    }

    // Note: Free tier might not support terminal filtering
    // if (terminal) {
    //   const terminalCode = TERMINAL_CODES[terminal] || terminal
    //   params.arr_terminal = terminalCode
    // }

    // Check cache first
    const cacheKey = this.getCacheKey({ ...params, type: 'arrivals' })
    const cached = flightCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    try {
      const data = await this.fetchFromAPI('/flights', params)
      const flightResponse: FlightResponse = {
        flights: data.data || [],
        pagination: data.pagination || { limit: 0, offset: 0, count: 0, total: 0 }
      }

      // Cache the response
      flightCache.set(cacheKey, {
        data: flightResponse,
        timestamp: Date.now()
      })

      return flightResponse
    } catch (error) {
      console.error('Failed to fetch arrivals:', error)
      return { flights: [], pagination: { limit: 0, offset: 0, count: 0, total: 0 } }
    }
  }

  // Get flight status text
  static getStatusText(status: string): { text: string; color: string } {
    const statusMap: Record<string, { text: string; color: string }> = {
      'scheduled': { text: 'On Time', color: 'text-green-600' },
      'active': { text: 'In Flight', color: 'text-blue-600' },
      'landed': { text: 'Landed', color: 'text-green-600' },
      'cancelled': { text: 'Cancelled', color: 'text-red-600' },
      'incident': { text: 'Incident', color: 'text-red-600' },
      'diverted': { text: 'Diverted', color: 'text-orange-600' },
      'delayed': { text: 'Delayed', color: 'text-orange-600' }
    }

    return statusMap[status.toLowerCase()] || { text: status, color: 'text-gray-600' }
  }

  // Format time for display
  static formatTime(dateString: string | null): string {
    if (!dateString) return '--:--'
    
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      // h23, not `hour12: false` — the latter renders midnight as "24:05" on
      // some ICU builds.
      hourCycle: 'h23',
      timeZone: 'Europe/London'
    })
  }

  // Calculate delay in minutes
  static calculateDelay(scheduled: string, estimated: string | null): number | null {
    if (!estimated) return null
    
    const scheduledTime = new Date(scheduled).getTime()
    const estimatedTime = new Date(estimated).getTime()
    const delayMs = estimatedTime - scheduledTime
    
    return Math.round(delayMs / (1000 * 60)) // Convert to minutes
  }
}

// Export singleton instance
export const flightAPI = new FlightAPI()

// Helper functions
export async function getTerminalDepartures(terminal: string): Promise<Flight[]> {
  const response = await flightAPI.getDepartures(terminal, 20)
  return response.flights
}

export async function getTerminalArrivals(terminal: string): Promise<Flight[]> {
  const response = await flightAPI.getArrivals(terminal, 20)
  return response.flights
}

// Get average delay for a terminal
export async function getTerminalDelayInfo(terminal: string): Promise<{
  avgDepartureDelay: number
  avgArrivalDelay: number
  delayedFlights: number
  totalFlights: number
}> {
  const [departures, arrivals] = await Promise.all([
    getTerminalDepartures(terminal),
    getTerminalArrivals(terminal)
  ])

  let totalDelay = 0
  let delayedCount = 0
  let totalCount = 0

  // Calculate departure delays
  departures.forEach(flight => {
    const delay = FlightAPI.calculateDelay(
      flight.departure.scheduled,
      flight.departure.estimated
    )
    if (delay !== null && delay > 0) {
      totalDelay += delay
      delayedCount++
    }
    totalCount++
  })

  // Calculate arrival delays
  arrivals.forEach(flight => {
    const delay = FlightAPI.calculateDelay(
      flight.arrival.scheduled,
      flight.arrival.estimated
    )
    if (delay !== null && delay > 0) {
      totalDelay += delay
      delayedCount++
    }
    totalCount++
  })

  const avgDelay = totalCount > 0 ? Math.round(totalDelay / totalCount) : 0

  return {
    avgDepartureDelay: avgDelay,
    avgArrivalDelay: avgDelay,
    delayedFlights: delayedCount,
    totalFlights: totalCount
  }
}
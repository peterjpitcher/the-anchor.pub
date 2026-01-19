# API Integration Guide - The Anchor Pub

## Overview
Complete documentation for integrating with the OrangeJelly Management System API used by The Anchor pub website.

## Table of Contents
1. [Architecture](#architecture)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Implementation](#implementation)
5. [Error Handling](#error-handling)
6. [Known Issues](#known-issues)
7. [Testing](#testing)

## Architecture

### System Overview
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React Client   │────▶│ Next.js API      │────▶│ OrangeJelly API │
│  Components     │◀────│ Routes (Proxy)   │◀────│ Management System│
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Base Configuration
- **Provider**: OrangeJelly Management System
- **Base URL**: `https://management.orangejelly.co.uk/api`
- **Protocol**: HTTPS REST API
- **Authentication**: API Key (X-API-Key header)
- **Response Format**: JSON

## Authentication

### API Key Setup
```typescript
// .env.local
ANCHOR_API_KEY=anch_iPRE-XAgeN-D5QcfNTy_DxDbi1kZcrWg110ZroLotY4

// Usage in /lib/api.ts
headers: {
  'X-API-Key': process.env.ANCHOR_API_KEY,
  'Content-Type': 'application/json',
}
```

### Security Best Practices
1. **Never expose API key to client**
2. **Use Next.js API routes as proxy**
3. **Validate all inputs server-side**
4. **Log authentication failures**

## Endpoints

### Business Hours & Status
```typescript
GET /business/hours
// Returns current opening hours and live status
{
  regularHours: {
    monday: { opens: "11:00", closes: "23:00", kitchen: { opens: null, closes: null } }
    // ... other days
  },
  currentStatus: {
    isOpen: boolean,
    kitchenOpen: boolean,
    closesIn: string,
    opensIn: string
  }
}
```

### Table Bookings

#### Create Booking
```typescript
POST /bookings/create
{
  date: "2025-08-01",
  time: "19:00",
  partySize: 4,
  customerDetails: {
    name: "John Doe",
    phone: "+447700900000",
    email: "john@example.com"
  },
  booking_type: "regular" | "sunday_lunch",
  menuSelections?: [...] // Required for Sunday lunch
}
```

#### Check Availability
```typescript
GET /bookings/availability/{date}
// Returns available time slots for a given date
{
  available_times: ["12:00", "12:30", "13:00", ...],
  blocked_times: ["19:00", "19:30"]
}
```

### Event Bookings

Event bookings are handled via external booking links configured in the management system.

- Each event can include a `bookingUrl` field (nullable) returned from the Management API.
- The website should render a prominent **Book Now** CTA linking to `bookingUrl` (open in a new tab).
- If `bookingUrl` is missing, show a disabled CTA such as “Booking options available closer to the event”.

### Menu Management
```typescript
GET /menu/sunday-lunch
// Returns current Sunday lunch menu items
{
  items: [
    {
      id: "uuid",
      name: "Roasted Chicken",
      description: "Oven-roasted chicken breast with sage & onion stuffing balls...",
      price: 19.99
    }
  ]
}
```

## Implementation

### Proxy Pattern
All API calls must go through Next.js API routes:

```typescript
// app/api/business-hours/route.ts
export async function GET() {
  const response = await fetch(
    `${API_BASE_URL}/business/hours`,
    {
      headers: {
        'X-API-Key': process.env.ANCHOR_API_KEY,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    }
  )
  
  if (!response.ok) {
    throw new Error('Failed to fetch business hours')
  }
  
  return NextResponse.json(await response.json())
}
```

### Client-Side Usage
```typescript
// Use SWR for client-side data fetching
import useSWR from 'swr'

const { data, error } = useSWR('/api/business-hours', fetcher, {
  refreshInterval: 60000, // Refresh every minute
  revalidateOnFocus: true
})
```

## Error Handling

### Common Error Codes
- `401`: Invalid API key
- `403`: Permission denied
- `404`: Resource not found
- `429`: Rate limit exceeded
- `500`: Internal server error
- `503`: Service unavailable

### Error Response Format
```typescript
{
  error: {
    code: "SYSTEM_ERROR",
    message: "Detailed error message",
    details: {...} // Optional additional context
  }
}
```

### Handling Strategies
```typescript
try {
  const response = await fetch('/api/endpoint')
  if (!response.ok) {
    const error = await response.json()
    
    // Handle specific errors
    if (error.code === 'SYSTEM_ERROR') {
      // Show user-friendly message
      return fallbackData
    }
    
    throw new Error(error.message)
  }
} catch (error) {
  console.error('API call failed:', error)
  // Use fallback data or show error state
}
```

## Known Issues

### 1. Monday Kitchen Hours
- **Issue**: API returns null for Monday kitchen hours
- **Solution**: Default to kitchen closed on Mondays in business logic

### 2. SMS Multiple Messages
- **Issue**: External API sending duplicate SMS for old events
- **Status**: Reported to OrangeJelly, awaiting fix
- **Workaround**: None available (external system issue)

### 3. Sunday Lunch Payment
- **Issue**: Payment URLs not always returned for Sunday lunch bookings
- **Solution**: Check menu item IDs match API expectations

### 4. Timezone Handling
- **Issue**: API uses UTC, website uses Europe/London
- **Solution**: Convert times appropriately in business logic

## Testing

### Manual Testing
```bash
# Test API authentication
curl -X GET https://management.orangejelly.co.uk/api/business/hours \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json"

# Test booking creation
curl -X POST https://management.orangejelly.co.uk/api/bookings/create \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-08-01","time":"19:00","partySize":2,...}'
```

### Automated Testing
```typescript
// tests/api/business-hours.test.ts
describe('Business Hours API', () => {
  it('should return current status', async () => {
    const response = await fetch('/api/business-hours')
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('currentStatus')
  })
})
```

## Environment Variables
```bash
# Required in .env.local
ANCHOR_API_KEY=your-api-key-here

# Optional for testing
API_BASE_URL=https://management.orangejelly.co.uk/api
```

## Support & Contact
- **API Provider**: OrangeJelly
- **Support Email**: support@orangejelly.co.uk
- **Documentation**: Internal use only

---
*Last Updated: August 2025*

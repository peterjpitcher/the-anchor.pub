import { NextRequest, NextResponse } from 'next/server'
import { anchorAPI } from '@/lib/api'

// Force dynamic rendering to ensure date parameter is read at request time
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  
  try {
    const data = await anchorAPI.getSundayLunchMenu(date)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Failed to fetch Sunday lunch menu:', error)
    
    // Return error state to prevent invalid bookings
    return NextResponse.json({
      error: 'Unable to load menu. Please try again or call 01753 682707.',
      menu_date: date,
      mains: [],
      sides: [],
      cutoff_time: new Date(new Date(date).getTime() - 24 * 60 * 60 * 1000).toISOString()
    })
  }
}
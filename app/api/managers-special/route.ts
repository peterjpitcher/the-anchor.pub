import { timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { getCurrentPromotion, getPromotionById, getPromotionImage } from '@/lib/managers-special'
import { logError } from '@/lib/error-handling'
import type { ManagersSpecialAPIResponse } from '@/types/managers-special'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const preview = searchParams.get('preview')
    const token = searchParams.get('token')
    const date = searchParams.get('date') // Optional: for testing specific dates
    
    // Preview mode with token validation
    let promotion = null

    const expectedToken = process.env.MS_PREVIEW_TOKEN || ''
    const isValidToken = expectedToken.length > 0 &&
      token?.length === expectedToken.length &&
      timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken))

    if (preview && isValidToken) {
      promotion = getPromotionById(preview)
    } else if (date && process.env.NODE_ENV === 'development') {
      // Allow date override in development for testing
      const testDate = new Date(date + 'T12:00:00Z')
      promotion = getCurrentPromotion(testDate)
    } else {
      promotion = getCurrentPromotion()
    }
    
    if (!promotion) {
      return new NextResponse(
        JSON.stringify({ status: 'none', active: false } as ManagersSpecialAPIResponse), 
        {
          status: 200, // Return 200 instead of 404 to avoid errors
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store', // Ensure fresh data at midnight
            'x-ms-active': 'false',
          },
        }
      )
    }
    
    // Get the image for this promotion
    const imagePath = getPromotionImage(promotion.imageFolder)
    
    const response = {
      ...promotion,
      active: true,
      image: imagePath
    } as ManagersSpecialAPIResponse
    
    return new NextResponse(
      JSON.stringify(response), 
      {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store', // Guarantees flip at midnight
          'x-ms-active': 'true',
          'x-ms-id': promotion.id,
        },
      }
    )
  } catch (error) {
    logError('api/managers-special', error instanceof Error ? error : new Error(String(error)))
    return new NextResponse(
      JSON.stringify({ 
        status: 'error',
        message: 'Failed to load promotion' 
      }), 
      { 
        status: 500,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        }
      }
    )
  }
}
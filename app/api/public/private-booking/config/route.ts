import { NextResponse } from 'next/server'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'

// Use internal API routes to avoid CORS issues and keep API key secure if needed
const API_BASE_URL = getManagementApiBaseUrl()

export async function GET() {
    try {
        const res = await fetch(`${API_BASE_URL}/public/private-booking/config`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: { revalidate: 3600 }
        })

        const data = await res.json()

        if (!res.ok) {
            return NextResponse.json(data, { status: res.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error proxying private booking config:', error)
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'PROXY_ERROR',
                    message: 'Failed to fetch configuration via proxy'
                }
            },
            { status: 500 }
        )
    }
}

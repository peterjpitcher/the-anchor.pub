import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.ANCHOR_API_BASE_URL || 'https://management.orangejelly.co.uk/api'

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const res = await fetch(`${API_BASE_URL}/public/private-booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        })

        const data = await res.json()

        if (!res.ok) {
            return NextResponse.json(data, { status: res.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error proxying private booking creation:', error)
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'PROXY_ERROR',
                    message: 'Failed to create booking via proxy'
                }
            },
            { status: 500 }
        )
    }
}

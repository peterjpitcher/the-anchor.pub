import { NextResponse } from 'next/server'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'

export async function GET() {
  const apiBaseUrl = getManagementApiBaseUrl()

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apiBaseUrl,
    version: '1.0.0'
  })
}

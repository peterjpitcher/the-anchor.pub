import { NextResponse } from 'next/server'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'

export async function GET() {
  const apiKeyConfigured = !!process.env.ANCHOR_API_KEY
  const apiKeyLength = process.env.ANCHOR_API_KEY?.length || 0
  const apiBaseUrl = getManagementApiBaseUrl()
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apiKeyConfigured,
    apiKeyLength,
    apiBaseUrl,
    version: '1.0.0'
  })
}

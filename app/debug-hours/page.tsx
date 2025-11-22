'use client'

import { useState, useEffect } from 'react'
import { StatusBar } from '@/components/layout/StatusBar'
import { HeaderStatusSectionDirect } from '@/components/layout/HeaderStatusSectionDirect'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import { Section } from '@/components/ui'

export default function DebugHoursPage() {
  const [apiData, setApiData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { hours, loading, error: hookError } = useBusinessHours()
  const debugEnabled = process.env.NEXT_PUBLIC_STATUSBAR_DEBUG === 'true'

  useEffect(() => {
    // Direct API call
    fetch('/api/business-hours')
      .then(res => res.json())
      .then(data => {
        if (debugEnabled) {
          console.debug('[DebugHours] API Response', data)
        }
        setApiData(data)
      })
      .catch(err => {
        if (debugEnabled) {
          console.error('[DebugHours] API Error', err)
        }
        setError(err.message)
      })
  }, [debugEnabled])

  return (
    <>
      <Section spacing="sm" container>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-anchor-green">Business Hours Debug</h1>
          <p className="text-sm text-gray-600">
            Use this internal page to verify the status bar, business hour hooks, and API payloads.
            Enable `NEXT_PUBLIC_STATUSBAR_DEBUG` for verbose console logs.
          </p>
        </div>
      </Section>

      <Section spacing="md" container containerSize="md" className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">StatusBar Component (navigation variant)</h2>
          <StatusBar variant="navigation" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">StatusBar Component (default variant)</h2>
          <StatusBar />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">StatusBar Component (hero variant)</h2>
          <StatusBar variant="hero" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">HeaderStatusSectionDirect Component</h2>
          <HeaderStatusSectionDirect />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">useBusinessHours Hook</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify({ hours, loading, error: hookError }, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Direct API Response</h2>
          {error && <p className="text-red-600">Error: {error}</p>}
          {apiData && (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(apiData, null, 2)}
            </pre>
          )}
        </div>
      </Section>
    </>
  )
}

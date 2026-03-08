'use client'

import { useEffect, useState } from 'react'
import { Section } from '@/components/ui'

export default function TestSimplePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debugEnabled = process.env.NEXT_PUBLIC_STATUSBAR_DEBUG === 'true'

  useEffect(() => {
    fetch('/api/business-hours')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        if (debugEnabled) {
          console.error('[TestSimple] error', err)
        }
        setError(err.message)
        setLoading(false)
      })
  }, [debugEnabled])

  if (loading) {
    return (
      <Section spacing="md" container>
        <p>Loading business hours…</p>
      </Section>
    )
  }

  if (error || !data || !data.success) {
    return (
      <Section spacing="md" container>
        <p className="text-red-600">Error loading data: {error || 'Unknown error'}</p>
      </Section>
    )
  }

  const { currentStatus } = data.data

  return (
    <Section spacing="md" container containerSize="md" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-anchor-green mb-2">Business Hours API Check</h1>
        <p className="text-sm text-gray-600">
          Quick confirmation that the `/api/business-hours` endpoint is reachable and returning status metadata.
        </p>
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold">Current Status</h2>
        <p>Bar is: {currentStatus.isOpen ? 'OPEN' : 'CLOSED'}</p>
        <p>Kitchen is: {currentStatus.kitchenOpen ? 'OPEN' : 'CLOSED'}</p>
        {currentStatus.closesIn && <p>Closes in: {currentStatus.closesIn}</p>}
        {currentStatus.opensIn && <p>Opens in: {currentStatus.opensIn}</p>}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Full API Response</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </Section>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { trackPhoneCall } from '@/lib/gtm-events'
import { Section, Button } from '@/components/ui'

export default function TestGTMPage() {
  const [dataLayer, setDataLayer] = useState<any[]>([])
  const [gtmLoaded, setGtmLoaded] = useState(false)
  const debugEnabled = process.env.NEXT_PUBLIC_STATUSBAR_DEBUG === 'true'

  useEffect(() => {
    // Check GTM status
    const checkGTM = () => {
      if (typeof window !== 'undefined') {
        const hasDataLayer = 'dataLayer' in window
        setGtmLoaded(hasDataLayer)
        
        if (hasDataLayer) {
          setDataLayer([...(window as any).dataLayer])
        }
        
        if (debugEnabled) {
          console.debug('[TestGTM] status', {
            hasDataLayer,
            dataLayerLength: hasDataLayer ? (window as any).dataLayer.length : 0
          })
        }
      }
    }

    // Initial check
    checkGTM()

    // Set up interval to monitor dataLayer
    const interval = setInterval(checkGTM, 1000)

    return () => clearInterval(interval)
  }, [debugEnabled])

  const triggerTestEvent = () => {
    trackPhoneCall('test-page')
    
    // Also push a custom event
    if (typeof window !== 'undefined' && 'dataLayer' in window) {
      (window as any).dataLayer.push({
        event: 'test_button_click',
        category: 'Test',
        action: 'Button Click',
        label: 'Test GTM Button'
      })
    }
  }

  return (
    <>
      <Section spacing="sm" container>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-anchor-green">GTM Test Page</h1>
          <p className="text-sm text-gray-600">
            Validate GTM tracking in a safe environment. Page view and phone-call events fire automatically; use the
            test button below to push a custom event into the dataLayer.
          </p>
        </div>
      </Section>

      <Section spacing="md" container containerSize="md" className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">GTM Status</h2>
          <p className="mb-4">
            GTM Loaded: <span className={gtmLoaded ? 'text-green-600' : 'text-red-600'}>
              {gtmLoaded ? 'Yes' : 'No'}
            </span>
          </p>
          <p>DataLayer Events: {dataLayer.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Events</h2>
          <Button onClick={triggerTestEvent}>Trigger Test Event</Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">DataLayer Contents</h2>
          <div className="max-h-96 overflow-y-auto">
            <pre className="text-xs bg-gray-100 p-4 rounded">
              {JSON.stringify(dataLayer, null, 2)}
            </pre>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p>Check the browser console for additional debug information.</p>
          <p>This page should show GTM loading and track a page view event.</p>
        </div>
      </Section>
    </>
  )
}

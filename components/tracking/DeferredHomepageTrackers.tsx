'use client'

import dynamic from 'next/dynamic'
import { DeferredRender } from '@/components/DeferredRender'

const ScrollDepthTracker = dynamic(() => import('@/components/tracking/ScrollDepthTracker').then((mod) => mod.default), {
  ssr: false
})

export function DeferredHomepageTrackers() {
  return (
    <DeferredRender>
      <ScrollDepthTracker />
    </DeferredRender>
  )
}


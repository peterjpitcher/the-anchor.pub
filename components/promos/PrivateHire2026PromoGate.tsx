'use client'

import dynamic from 'next/dynamic'
import {
  PRIVATE_HIRE_2026_PROMO_ENABLED,
  PRIVATE_HIRE_2026_PROMO_ENDS_AT_MS
} from '@/lib/promos/privateHire2026'

const PrivateHire2026PromoPopup = dynamic(
  () => import('@/components/promos/PrivateHire2026PromoPopup').then(mod => mod.PrivateHire2026PromoPopup),
  { ssr: false }
)

export function PrivateHire2026PromoGate() {
  if (!PRIVATE_HIRE_2026_PROMO_ENABLED) return null
  if (Date.now() >= PRIVATE_HIRE_2026_PROMO_ENDS_AT_MS) return null

  return <PrivateHire2026PromoPopup />
}

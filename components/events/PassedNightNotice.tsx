'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Alert, Container } from '@/components/ui'

/**
 * Shown when an old link for a night that has gone sent the visitor here, the next night of the
 * same name (BK-192). A client component reading the query string, so the event page itself stays
 * statically rendered.
 */
export function PassedNightNotice() {
  const searchParams = useSearchParams()
  if (searchParams?.get('from') !== 'passed') return null
  return (
    <section className="bg-canvas py-4 sm:py-6">
      <Container>
        <Alert variant="info" title="That night has passed" titleAs="p">
          <p>
            The night your link was for has been and gone. Here&apos;s the next one, or see everything coming up on{' '}
            <Link href="/whats-on" className="font-semibold underline">What&apos;s On</Link>.
          </p>
        </Alert>
      </Container>
    </section>
  )
}

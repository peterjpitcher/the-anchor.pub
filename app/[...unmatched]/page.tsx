import { notFound, redirect } from 'next/navigation'

import { buildFallbackHomeRedirect, type FallbackHomeSearchParams } from '@/lib/routing/buildFallbackHomeRedirect'

type UnmatchedPageProps = {
  params: {
    unmatched: string[]
  }
  searchParams?: FallbackHomeSearchParams
}

export default function UnmatchedPage({ params, searchParams }: UnmatchedPageProps) {
  // Vercel preview deploy URLs use ?dpl= parameter, redirect these to homepage
  if (searchParams?.dpl) {
    redirect(buildFallbackHomeRedirect(searchParams))
  }

  // All other unmatched routes should return a proper 404
  notFound()
}

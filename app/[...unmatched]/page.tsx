import { notFound, redirect } from 'next/navigation'

import { buildFallbackHomeRedirect, type FallbackHomeSearchParams } from '@/lib/routing/buildFallbackHomeRedirect'

type UnmatchedPageProps = {
  params: {
    unmatched: string[]
  }
  searchParams?: FallbackHomeSearchParams
}

export default function UnmatchedPage({ params, searchParams }: UnmatchedPageProps) {
  if (params.unmatched[0] === 'api') {
    notFound()
  }

  redirect(buildFallbackHomeRedirect(searchParams))
}

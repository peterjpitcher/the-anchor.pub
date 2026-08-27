import React from 'react'
import { jsonLdSafeStringify } from '@/lib/jsonld'

type JsonLdProps = {
  data: Record<string, any> | Record<string, any>[]
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLdSafeStringify(data),
      }}
    />
  )
}

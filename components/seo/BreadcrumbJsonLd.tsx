import { generateBreadcrumbSchema } from '@/lib/enhanced-schemas'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = generateBreadcrumbSchema(items)
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(schema) }}
    />
  )
}

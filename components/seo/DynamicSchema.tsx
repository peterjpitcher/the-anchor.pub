import { getEnhancedSchemas } from '@/lib/schema-with-reviews'
import { jsonLdSafeStringify } from '@/lib/jsonld'

export async function DynamicSchema() {
  const schemas = await getEnhancedSchemas()
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLdSafeStringify([
          schemas.organizationSchema,
          schemas.localBusinessSchema,
          schemas.webSiteSchema
        ])
      }}
    />
  )
}

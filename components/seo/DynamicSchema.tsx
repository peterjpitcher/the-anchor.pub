import { getEnhancedSchemas } from '@/lib/schema-with-reviews'

export async function DynamicSchema() {
  const schemas = await getEnhancedSchemas()
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([
          schemas.organizationSchema,
          schemas.localBusinessSchema,
          schemas.webSiteSchema
        ])
      }}
    />
  )
}
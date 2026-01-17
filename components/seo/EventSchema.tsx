import { Event } from '@/lib/api'
import { buildEventSchema } from '@/lib/structured-data/event-schema'
import { jsonLdSafeStringify } from '@/lib/jsonld'

interface EventSchemaProps {
  event: Event
}

export function EventSchema({ event }: EventSchemaProps) {
  const schema = buildEventSchema(event)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLdSafeStringify(schema)
      }}
    />
  )
}

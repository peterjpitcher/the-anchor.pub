import { jsonLdSafeStringify } from '@/lib/jsonld'
interface SpeakableSchemaProps {
  selectors?: string[]
}

const defaultSelectors = [
  '.speakable-content',
  '.hero-title',
  '.opening-hours',
  '.contact-info',
  '.special-offers',
  'h1',
  '[data-speakable="true"]'
]

export function SpeakableSchema({ selectors = defaultSelectors }: SpeakableSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: selectors
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLdSafeStringify(schema)
      }}
    />
  )
}

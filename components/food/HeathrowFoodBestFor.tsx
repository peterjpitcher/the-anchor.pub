import { Container } from '@/components/ui'

const DEFAULT_ITEMS = [
  ['Pre-flight meal', 'Book ahead, eat properly and leave time to get back to your terminal.'],
  ['Post-flight meal', 'Meet arrivals away from terminal queues with free customer parking on site.'],
  ['Plane spotting day', 'Use the beer garden for food, drinks and aircraft overhead.'],
  ['Family meal', 'Pub classics, pizzas and space for children without airport pressure.'],
  ['Sunday roast', 'Served Sundays from 1pm to 6pm, with booking recommended for busy slots.'],
] as const

interface HeathrowFoodBestForProps {
  title?: string
  items?: ReadonlyArray<readonly [string, string]>
}

export function HeathrowFoodBestFor({
  title = 'Best For',
  items = DEFAULT_ITEMS,
}: HeathrowFoodBestForProps) {
  return (
    <section className="bg-anchor-bg-raised py-10 border-y border-anchor-gold/15">
      <Container>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-anchor-cream-text">
            {title}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {items.map(([itemTitle, body]) => (
              <div key={itemTitle} className="rounded-md border border-anchor-gold/15 bg-anchor-bg-card p-4">
                <h3 className="text-base font-semibold text-anchor-gold-vivid">
                  {itemTitle}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-anchor-cream-text/70">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

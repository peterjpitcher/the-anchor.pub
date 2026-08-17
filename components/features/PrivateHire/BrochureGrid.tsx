'use client'

import { Card, CardBody, Button } from '@/components/ui'
import { Icon } from '@/components/ui/Icon'
import { ALL_BROCHURES } from '@/lib/brochures'
import { trackBrochureDownload } from '@/lib/gtm-events'

interface BrochureGridProps {
  /** Page the downloads started from, used for GTM attribution. */
  source: string
}

/**
 * Lists every 2026 event brochure as a download card.
 *
 * Each PDF opens in a new tab rather than downloading, so mobile visitors get the
 * built-in viewer. Prices are deliberately absent: see `lib/brochures.ts`.
 */
export function BrochureGrid({ source }: BrochureGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {ALL_BROCHURES.map((brochure) => (
        <Card key={brochure.key} accent className="h-full">
          <CardBody className="flex h-full flex-col gap-3">
            <span aria-hidden="true" className="text-accent-text">
              <Icon name="file" className="h-6 w-6" />
            </span>
            <h3 className="font-display text-h4 text-ink-strong">{brochure.title}</h3>
            <p className="text-ink-muted">{brochure.description}</p>
            <p className="text-sm text-ink-muted">
              {`PDF, ${brochure.pages} pages, ${brochure.sizeLabel}`}
            </p>
            <a
              href={brochure.file}
              target="_blank"
              rel="noopener"
              onClick={() =>
                trackBrochureDownload({
                  brochure: brochure.key,
                  source,
                  file: brochure.file,
                })
              }
              className="mt-auto pt-2"
            >
              <Button
                variant="outline"
                size="md"
                fullWidth
                icon={<Icon name="download" />}
              >
                Download
              </Button>
              <span className="sr-only">
                {` ${brochure.title}. Opens in a new tab.`}
              </span>
            </a>
          </CardBody>
        </Card>
      ))}
    </div>
  )
}

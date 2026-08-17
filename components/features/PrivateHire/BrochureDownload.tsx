'use client'

import { Container, Button } from '@/components/ui'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'
import { getBrochure } from '@/lib/brochures'
import { trackBrochureDownload } from '@/lib/gtm-events'

interface BrochureDownloadProps {
  /** Brochure key from `lib/brochures.ts`, e.g. 'baby_shower'. */
  brochure: string
  /** Page the download started from, used for GTM attribution. */
  source: string
  /** Overrides the panel heading. */
  heading?: string
  className?: string
}

/**
 * Brochure download panel, wrapped in its own section so a page adds it in one line.
 *
 * Opens the PDF in a new tab rather than forcing a download, so mobile visitors get
 * the built-in viewer instead of a file they have to go and hunt for. The `download`
 * attribute is deliberately omitted for that reason.
 *
 * No prices appear here on purpose. Brochure prices are frozen at print time and
 * shown excluding VAT, so quoting one beside the button would compete with the live
 * cost estimator, which is the figure we want people to act on.
 */
export function BrochureDownload({
  brochure,
  source,
  heading,
  className
}: BrochureDownloadProps) {
  const { title, description, file, pages, sizeLabel } = getBrochure(brochure)
  const meta = `PDF, ${pages} pages, ${sizeLabel}`

  return (
    <section className={cn('py-section-y bg-surface', className)}>
      <Container>
        <div className="rounded-xl border border-line bg-surface-sunk p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className="mt-0.5 hidden rounded-lg bg-surface p-3 text-accent-text shadow-sm sm:block"
              >
                <Icon name="file" className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-accent-text">
                  {heading || `Take the ${title.toLowerCase()} away with you`}
                </h2>
                <p className="mt-1 text-ink-muted">{description}</p>
                <p className="mt-2 text-sm text-ink-muted">
                  Every space, menu, drinks package and how to book. {meta}.
                </p>
              </div>
            </div>
            <a
              href={file}
              target="_blank"
              rel="noopener"
              onClick={() => trackBrochureDownload({ brochure, source, file })}
              className="shrink-0"
            >
              <Button variant="primary" size="lg" icon={<Icon name="download" />}>
                Download
              </Button>
              <span className="sr-only">{` ${title}. ${meta}. Opens in a new tab.`}</span>
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}

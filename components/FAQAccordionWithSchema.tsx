'use client'

import { useState } from 'react'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { trackFaqItemOpened } from '@/lib/gtm-events'
import { cn } from '@/lib/utils'

interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionWithSchemaProps {
  title?: string
  faqs: FAQItem[]
  className?: string
  renderSchema?: boolean
  /**
   * Type scale for the section heading. Defaults to the design-system `text-h2`,
   * which is what all but one host page wants.
   *
   * The exception is a page that sets its own heading scale rather than using
   * `SectionHeading`. On those, the token heading renders around 52px next to
   * the page's own 30px headings and reads as a rendering fault. Passing the
   * host page's own scale here keeps one page consistent without restyling the
   * 80-plus pages that are already correct.
   */
  titleClassName?: string
}

export function FAQAccordionWithSchema({
  title = "Frequently Asked Questions",
  faqs,
  className = "",
  renderSchema = true,
  titleClassName = "text-h2"
}: FAQAccordionWithSchemaProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleQuestion = (index: number) => {
    const isOpening = openIndex !== index
    setOpenIndex(isOpening ? index : null)
    if (isOpening) {
      trackFaqItemOpened({
        questionText: faqs[index].question,
        faqPagePath: typeof window !== 'undefined' ? window.location.pathname : '',
      })
    }
  }

  // Generate FAQ schema
  const faqSchema = renderSchema ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null

  return (
    <>
      {/* Inject FAQ schema - only if renderSchema is true */}
      {renderSchema && faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(faqSchema) }}
        />
      )}

      <section className={cn('py-section-y bg-canvas', className)}>
        <div className="container mx-auto px-4">
          <div className="mx-auto">
            <h2 className={cn(titleClassName, 'text-ink-strong mb-8 text-center')}>
              {title}
            </h2>

            {/* Removed microdata markup to prevent duplicate schemas */}
            <div className="divide-y divide-line border-y border-line">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="overflow-hidden"
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full px-2 py-4 text-left flex items-center justify-between gap-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-anchor-gold-dark focus-visible:ring-inset"
                    aria-expanded={openIndex === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    {/*
                      text-lg, not the text-h4 token this used to carry. At h4 a
                      question rendered up to 24px in the display face, six pixels
                      under the section heading above it and in the same face and
                      colour, so a stack of them read as a wall of headings rather
                      than a list you can scan. The face stays for brand; only the
                      scale drops, which is what restores the hierarchy.
                    */}
                    <h3 className="font-display text-lg text-ink-strong pr-4">
                      {faq.question}
                    </h3>
                    <svg
                      className={`w-5 h-5 text-anchor-gold-dark flex-shrink-0 transition-transform duration-200 ${
                        openIndex === index ? 'rotate-45' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v14M5 12h14"
                      />
                    </svg>
                  </button>

                  <div
                    id={`faq-answer-${index}`}
                    className={`px-2 overflow-hidden transition-all duration-200 ${
                      openIndex === index ? 'pb-5' : ''
                    }`}
                    style={{
                      // Headroom, not a layout value: the open panel stops at its
                      // own content height, and this only has to be larger than
                      // the tallest answer or the rest is silently cut off. 500px
                      // was under a long answer on a narrow phone, which clipped
                      // it mid-sentence with nothing to indicate more was there.
                      maxHeight: openIndex === index ? '1500px' : '0',
                    }}
                    aria-hidden={openIndex !== index}
                  >
                    {/* One step under the question, so an open row reads as an
                        answer to it rather than as a second heading. */}
                    <p className="text-base text-ink-muted">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { trackFaqItemOpened } from '@/lib/gtm-events'
import { BUS_WORDING, HEATHROW_TIMES } from '@/lib/constants'
import { DOGS_WORDING, PARKING_WORDING } from '@/lib/approved-wording'

// HomeFaq — homepage FAQ accordion (redesign spec §7.1 item 8). Light/cream
// surface, max-width 920px, one item open at a time (first open by default),
// DM Serif question + gold plus icon rotating 45° when open, muted answer.
//
// Emits FAQPage JSON-LD matching the rendered Q&As exactly. Every answer is
// verified against docs/SSOT.md: live kitchen hours (§3/§4), 20 free parking
// spaces (§6), dog friendly (§3/§9), the terminal times and the bus (§2, read from lib/constants),
// booking + walk-ins (§7).

interface FaqItem {
  question: string
  answer: string
}

const FAQS: FaqItem[] = [
  {
    question: 'How far is The Anchor from Heathrow?',
    answer:
      `We are ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car or taxi, and around ${HEATHROW_TIMES.terminal2} minutes from Terminals 2 and 3. Our address is Horton Road, Stanwell Moor, Surrey TW19 6AQ. ${BUS_WORDING}`
  },
  {
    question: 'Is there parking at The Anchor?',
    answer:
      `Yes. ${PARKING_WORDING}`
  },
  {
    question: 'Are dogs welcome?',
    answer:
      `Yes. ${DOGS_WORDING}`
  },
  {
    question: 'When is the kitchen open?',
    answer:
      'Kitchen hours are shown live on this page and can vary on holidays and event days. Please check today’s times online or call 01753 682707 before you visit.'
  },
  {
    question: 'Do I need to book a table?',
    answer:
      'Walk-ins are always welcome, but booking guarantees your spot, especially at weekends and for Sunday roast. You can book online or call us on 01753 682707.'
  }
]

export function HomeFaq() {
  const [openIndex, setOpenIndex] = useState<number>(0)

  const toggle = (index: number) => {
    const isOpening = openIndex !== index
    setOpenIndex(isOpening ? index : -1)
    if (isOpening) {
      trackFaqItemOpened({
        questionText: FAQS[index].question,
        faqPagePath: typeof window !== 'undefined' ? window.location.pathname : ''
      })
    }
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer }
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(faqSchema) }}
      />

      <div className="mx-auto space-y-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <div key={index} className="overflow-hidden rounded-md border border-line bg-surface shadow-sm">
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                aria-controls={`home-faq-answer-${index}`}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-surface-sunk focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
              >
                <h3 className="font-display text-h4 text-ink-strong">{faq.question}</h3>
                <Plus
                  size={22}
                  aria-hidden
                  className={`flex-shrink-0 text-accent transition-transform duration-200 ${
                    isOpen ? 'rotate-45' : ''
                  }`}
                />
              </button>
              <div
                id={`home-faq-answer-${index}`}
                hidden={!isOpen}
                className="px-6 pb-5"
              >
                <p className="text-lg text-ink-muted">{faq.answer}</p>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { trackFaqItemOpened } from '@/lib/gtm-events'

// HomeFaq — homepage FAQ accordion (redesign spec §7.1 item 8). Light/cream
// surface, max-width 920px, one item open at a time (first open by default),
// DM Serif question + gold plus icon rotating 45° when open, muted answer.
//
// Emits FAQPage JSON-LD matching the rendered Q&As exactly. Every answer is
// verified against docs/SSOT.md: kitchen closed Mondays (§3/§4), 20 free parking
// spaces (§6), dog friendly (§3/§9), 7 mins from T5 + bus routes 441/442/555 (§2),
// booking + walk-ins (§7).

interface FaqItem {
  question: string
  answer: string
}

const FAQS: FaqItem[] = [
  {
    question: 'How far is The Anchor from Heathrow?',
    answer:
      'We are 7 minutes from Heathrow Terminal 5 by car or taxi, and around 11 minutes from Terminals 2 and 3. Our address is Horton Road, Stanwell Moor, Surrey TW19 6AQ. Bus routes 441, 442 and 555 from Heathrow Central Bus Station stop nearby.'
  },
  {
    question: 'Is there parking at The Anchor?',
    answer:
      'Yes. We have 20 free customer parking spaces on site with no time limit while you are eating or drinking with us, so you avoid the cost of airport parking.'
  },
  {
    question: 'Are dogs welcome?',
    answer:
      'Absolutely. Dogs are welcome throughout the pub and in the beer garden, and we keep water bowls on hand for them.'
  },
  {
    question: 'When is the kitchen open?',
    answer:
      'Kitchen hours are shown live on this page and can vary on holidays. We serve food Tuesday to Sunday, with roast service on Sundays. The kitchen is closed on Mondays. You can also call 01753 682707 to check today’s times.'
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

      <div className="mx-auto max-w-[920px] space-y-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <div key={index} className="overflow-hidden rounded-md border border-line bg-surface shadow-sm">
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                aria-controls={`home-faq-answer-${index}`}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-anchor-sand/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
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
                <p className="max-w-[70ch] text-lg text-ink-muted">{faq.answer}</p>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

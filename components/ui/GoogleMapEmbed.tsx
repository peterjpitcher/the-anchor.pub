'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/primitives/Button'

interface GoogleMapEmbedProps {
    query: string
    className?: string
    height?: number | string
    /**
     * The frame's accessible name, used for both `title` and `aria-label`.
     *
     * Optional, and defaults to the name this component has always given the
     * frame, so every existing caller keeps the wording it had. Pass one where
     * the raw query reads badly out loud, such as a full postal address
     * assembled from an API record.
     */
    title?: string
}

/**
 * A Google map that loads when the visitor asks for it, and not before.
 *
 * The frame used to load with the page. A Google Maps frame is a request to
 * Google from the visitor's browser, with their IP address and the page they
 * are on, and Google may set its own cookies inside it. That happened on the
 * homepage, the Find Us page and every event page before the visitor had been
 * asked anything, and no cookie choice on this site could stop it.
 *
 * So the space is held at the same height (nothing moves when the map arrives)
 * and the frame is only added on a press. The link beside the button opens
 * Google Maps itself, which is what most people on a phone want anyway.
 */
export function GoogleMapEmbed({
    query,
    className,
    height = 450,
    title
}: GoogleMapEmbedProps) {
    const [shown, setShown] = useState(false)

    // Encode the query for the URL
    const encodedQuery = encodeURIComponent(query)
    // A frame with no `title` is a WCAG 2.4.1 failure, and this component is
    // embedded on twelve page templates, so it failed on all of them. `title`
    // and `aria-label` are resolved from one value so the two can never
    // disagree: whichever an assistive technology reads, it hears the same
    // thing.
    const frameTitle = title?.trim() || `Google Map showing ${query}`

    return (
        <div className={cn("w-full overflow-hidden rounded-2xl shadow-md border border-line", className)}>
            {shown ? (
                <iframe
                    title={frameTitle}
                    width="100%"
                    height={height}
                    frameBorder="0"
                    style={{ border: 0, minHeight: 'inherit' }}
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodedQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    aria-label={frameTitle}
                />
            ) : (
                <div
                    className="flex flex-col items-center justify-center gap-3 bg-surface-sunk px-6 text-center"
                    style={{ height, minHeight: 'inherit' }}
                >
                    <p className="text-sm text-ink max-w-sm">
                        The map comes from Google Maps, so we only load it when you ask.
                    </p>
                    <Button type="button" variant="primary" size="sm" onClick={() => setShown(true)}>
                        Show the map
                    </Button>
                    <a
                        href={`https://maps.google.com/maps?q=${encodedQuery}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline text-accent-text"
                    >
                        Open in Google Maps
                    </a>
                </div>
            )}
        </div>
    )
}


import React from 'react'
import { cn } from '@/lib/utils'

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

export function GoogleMapEmbed({
    query,
    className,
    height = 450,
    title
}: GoogleMapEmbedProps) {
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
            <iframe
                title={frameTitle}
                width="100%"
                height={height}
                frameBorder="0"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodedQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                aria-label={frameTitle}
            />
        </div>
    )
}

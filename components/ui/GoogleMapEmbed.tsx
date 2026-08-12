
import React from 'react'
import { cn } from '@/lib/utils'

interface GoogleMapEmbedProps {
    query: string
    className?: string
    height?: number | string
}

export function GoogleMapEmbed({
    query,
    className,
    height = 450
}: GoogleMapEmbedProps) {
    // Encode the query for the URL
    const encodedQuery = encodeURIComponent(query)

    return (
        <div className={cn("w-full overflow-hidden rounded-2xl shadow-md border border-line", className)}>
            <iframe
                width="100%"
                height={height}
                frameBorder="0"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodedQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                aria-label={`Google Map showing ${query}`}
            />
        </div>
    )
}

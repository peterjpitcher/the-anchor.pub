import { ImageResponse } from 'next/og'
import { anchorAPI, formatEventTime } from '@/lib/api'
import { getEventDateRangeUtc } from '@/lib/event-calendar'
import { getEventPriceLabel } from '@/lib/event-pricing'

export const runtime = 'nodejs'

export const size = {
  width: 1200,
  height: 630
}

export const contentType = 'image/png'

const LONDON_TIME_ZONE = 'Europe/London'

export default async function OpenGraphImage({ params }: { params: { id: string } }) {
  let title = 'Event at The Anchor'
  let dateLabel = 'Stanwell Moor • Near Heathrow'
  let timeLabel = ''
  let categoryLabel = 'Live event'
  let priceLabel = ''

  try {
    const event = await anchorAPI.getEvent(params.id)
    title = event.name || title
    categoryLabel = event.category?.name || categoryLabel
    priceLabel = getEventPriceLabel(event) || ''

    const start = getEventDateRangeUtc(event).start
    if (!Number.isNaN(start.getTime())) {
      dateLabel = start.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: LONDON_TIME_ZONE
      })
    }
    timeLabel = formatEventTime(event.startDate)
  } catch {
    // fall back to defaults
  }

  const metaLine = [dateLabel, timeLabel].filter(Boolean).join(' • ')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: 'linear-gradient(135deg, #003b29 0%, #005131 55%, #0b6a46 100%)',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 999,
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.16)',
                border: '1px solid rgba(255,255,255,0.18)',
                fontSize: 18,
                letterSpacing: 2,
                textTransform: 'uppercase',
                fontWeight: 700
              }}
            >
              The Anchor
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 999,
                padding: '10px 16px',
                background: 'rgba(165,118,38,0.22)',
                border: '1px solid rgba(165,118,38,0.35)',
                fontSize: 18,
                fontWeight: 700
              }}
            >
              {categoryLabel}
            </div>
            {priceLabel ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 999,
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  fontSize: 18,
                  fontWeight: 700
                }}
              >
                {priceLabel}
              </div>
            ) : null}
          </div>

          <div
            style={{
              fontSize: 74,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              textShadow: '0 4px 14px rgba(0,0,0,0.35)'
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.9)'
            }}
          >
            {metaLine}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.85)' }}>
            Stanwell Moor • 7 mins from Heathrow T5
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f3c46a' }}>
            the-anchor.pub
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noimageindex'
      }
    }
  )
}

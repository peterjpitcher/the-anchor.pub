import { anchorAPI } from '@/lib/api'
import { buildEventIcs } from '@/lib/event-calendar'

function toSafeFilename(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const event = await anchorAPI.getEvent(params.id)
    const ics = buildEventIcs(event)
    const filenameBase = toSafeFilename(event.slug || event.id || 'event') || 'event'

    return new Response(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filenameBase}.ics"`,
        'Cache-Control': 'public, max-age=300'
      }
    })
  } catch {
    return new Response('Event not found', { status: 404 })
  }
}


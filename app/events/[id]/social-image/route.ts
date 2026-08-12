import sharp from 'sharp'
import { anchorAPI } from '@/lib/api'
import { getEventImage } from '@/lib/event-image'

export const runtime = 'nodejs'

const WIDTH = 1200
const HEIGHT = 1200
const MAX_SOURCE_BYTES = 10 * 1024 * 1024

function fallbackResponse(request: Request, id: string) {
  const fallbackUrl = new URL(
    `/events/${encodeURIComponent(id)}/opengraph-image`,
    request.url
  )

  return Response.redirect(fallbackUrl, 307)
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const event = await anchorAPI.getEvent(params.id)
    const imageUrl = getEventImage(event)

    if (!imageUrl) {
      return fallbackResponse(request, params.id)
    }

    const parsedImageUrl = new URL(imageUrl)
    if (parsedImageUrl.protocol !== 'https:' && parsedImageUrl.protocol !== 'http:') {
      return fallbackResponse(request, params.id)
    }

    const sourceResponse = await fetch(parsedImageUrl, {
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 3600 }
    })

    const contentType = sourceResponse.headers.get('content-type') || ''
    const contentLength = Number(sourceResponse.headers.get('content-length') || 0)
    if (
      !sourceResponse.ok ||
      !contentType.startsWith('image/') ||
      contentLength > MAX_SOURCE_BYTES
    ) {
      return fallbackResponse(request, params.id)
    }

    const source = Buffer.from(await sourceResponse.arrayBuffer())
    if (source.byteLength > MAX_SOURCE_BYTES) {
      return fallbackResponse(request, params.id)
    }

    const [background, foreground] = await Promise.all([
      sharp(source, { failOnError: false })
        .rotate()
        .resize(WIDTH, HEIGHT, { fit: 'cover' })
        .blur(24)
        .modulate({ brightness: 0.55, saturation: 0.85 })
        .toBuffer(),
      sharp(source, { failOnError: false })
        .rotate()
        .resize(HEIGHT, HEIGHT, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer()
    ])

    const socialImage = await sharp(background)
      .composite([{ input: foreground, gravity: 'centre' }])
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer()
    const imageBody = new Uint8Array(socialImage.byteLength)
    imageBody.set(socialImage)

    return new Response(imageBody.buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': String(socialImage.byteLength),
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
      }
    })
  } catch {
    return fallbackResponse(request, params.id)
  }
}

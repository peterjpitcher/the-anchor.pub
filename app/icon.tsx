import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#005131',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#a57626',
          fontWeight: 'bold',
        }}
      >
        A
      </div>
    ),
    {
      ...size,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noimageindex',
      },
    }
  )
}

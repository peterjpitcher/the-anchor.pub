'use client'

import { useState } from 'react'
import Image from 'next/image'

const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtube-nocookie.com']
const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/
const EMBED_PATH_REGEX = /\/embed\/([a-zA-Z0-9_-]{11})/

// Static JSX hoisted outside component — never changes between renders
const PLAY_BUTTON = (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors shadow-lg">
      <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  </div>
)

interface LiteYouTubeProps {
  url: string
  title?: string
}

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!YOUTUBE_HOSTS.includes(parsed.hostname)) return null

    // youtu.be/VIDEO_ID
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      return VIDEO_ID_REGEX.test(id) ? id : null
    }

    // youtube.com/watch?v=VIDEO_ID
    const vParam = parsed.searchParams.get('v')
    if (vParam && VIDEO_ID_REGEX.test(vParam)) return vParam

    // youtube.com/embed/VIDEO_ID
    const embedMatch = parsed.pathname.match(EMBED_PATH_REGEX)
    if (embedMatch) return embedMatch[1]

    return null
  } catch {
    return null
  }
}

export default function LiteYouTube({ url, title = 'Video' }: LiteYouTubeProps) {
  const [activated, setActivated] = useState(false)
  const [thumbnailError, setThumbnailError] = useState(false)
  const videoId = extractVideoId(url)

  // If we can't parse the URL safely, render a plain link
  if (!videoId) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
        Watch video
      </a>
    )
  }

  const thumbnailUrl = thumbnailError
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

  if (activated) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      className="absolute inset-0 w-full h-full group cursor-pointer bg-black"
      aria-label={`Play ${title}`}
    >
      <Image
        src={thumbnailUrl}
        alt={title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 640px"
        onError={() => setThumbnailError(true)}
      />
      {/* Play button overlay */}
      {PLAY_BUTTON}
    </button>
  )
}

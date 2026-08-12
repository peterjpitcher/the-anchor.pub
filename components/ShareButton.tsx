'use client'

import { useRef, useState } from 'react'
import { Button, type ButtonProps } from '@/components/ui'
import { trackSocialClick } from '@/lib/gtm-events'
import { withDailyShareMarker } from '@/lib/share-url'

type ShareButtonProps = Omit<ButtonProps, 'onClick' | 'children'> & {
  title: string
  url: string
  text?: string
  source: string
  label?: string
  refreshPreviewDaily?: boolean
}

export function ShareButton({
  title,
  url,
  text,
  source,
  label = 'Share',
  refreshPreviewDaily = false,
  ...buttonProps
}: ShareButtonProps) {
  const [didCopy, setDidCopy] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const resetCopyState = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = window.setTimeout(() => setDidCopy(false), 2000)
  }

  const handleShare = async () => {
    const shareUrl = refreshPreviewDaily ? withDailyShareMarker(url) : url

    trackSocialClick({
      platform: 'share',
      source,
      url: shareUrl,
      label: 'share',
      title
    })

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title, text, url: shareUrl })
        return
      } catch {
        // Fall back to clipboard if the user cancels or the share fails
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setDidCopy(true)
        resetCopyState()
        return
      } catch {
        // Fall back to opening the URL if clipboard fails
      }
    }

    if (typeof window !== 'undefined') {
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Button
      type="button"
      aria-label={`Share ${title}`}
      onClick={handleShare}
      {...buttonProps}
    >
      {didCopy ? 'Link copied' : label}
    </Button>
  )
}

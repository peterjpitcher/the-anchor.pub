'use client'

import { useRef, useState } from 'react'
import { Button, type ButtonProps } from '@/components/ui'
import { trackSocialClick } from '@/lib/gtm-events'

type ShareButtonProps = Omit<ButtonProps, 'onClick' | 'children'> & {
  title: string
  url: string
  text?: string
  source: string
  label?: string
}

export function ShareButton({
  title,
  url,
  text,
  source,
  label = 'Share',
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
    trackSocialClick({
      platform: 'share',
      source,
      url,
      label: 'share',
      title
    })

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {
        // Fall back to clipboard if the user cancels or the share fails
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url)
        setDidCopy(true)
        resetCopyState()
        return
      } catch {
        // Fall back to opening the URL if clipboard fails
      }
    }

    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer')
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

'use client'

import { Button } from '@/components/ui'
import { trackSocialClick } from '@/lib/gtm-events'

interface BlogShareButtonsProps {
  postTitle: string
  postSlug: string
}

export function BlogShareButtons({ postTitle, postSlug }: BlogShareButtonsProps) {
  const shareUrl = `https://www.the-anchor.pub/blog/${postSlug}`
  
  const handleTwitterShare = () => {
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(shareUrl)}`
    trackSocialClick({
      platform: 'twitter',
      source: 'blog_share',
      url: intentUrl,
      label: 'blog_share',
      title: postTitle
    })
    window.open(intentUrl, '_blank', 'noopener,noreferrer')
  }
  
  const handleFacebookShare = () => {
    const intentUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    trackSocialClick({
      platform: 'facebook',
      source: 'blog_share',
      url: intentUrl,
      label: 'blog_share',
      title: postTitle
    })
    window.open(intentUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex gap-4">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleTwitterShare}
      >
        Share on Twitter
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleFacebookShare}
      >
        Share on Facebook
      </Button>
    </div>
  )
}

import Image from 'next/image'
import { GOOGLE_REVIEWS_URL } from '@/lib/constants'

interface ReviewsBadgeProps {
  rating: number | null
  totalReviews: number | null
  size?: 'small' | 'medium' | 'large'
}

export function ReviewsBadge({ 
  rating, 
  totalReviews,
  size = 'medium' 
}: ReviewsBadgeProps) {
  const sizeClasses = {
    small: 'text-sm p-3',
    medium: 'text-base p-4',
    large: 'text-lg p-6'
  }

  const starSize = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  }

  return (
    <div className={`bg-surface border border-line rounded-md shadow-md inline-flex items-center gap-4 ${sizeClasses[size]}`}>
      <div className="text-center">
        <div className={`font-semibold text-3xl text-accent-text ${size === 'large' ? 'text-4xl' : ''}`}>
          {typeof rating === 'number' ? rating : 'Google'}
        </div>
        {typeof rating === 'number' && (
          <div className={`flex gap-0.5 ${starSize[size]}`} role="img" aria-label={`${rating} out of 5 stars`}>
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={i < Math.round(rating) ? "text-anchor-gold" : "text-ink-muted/30"}
              >
                &#9733;
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="text-left">
        <div className="font-semibold text-ink-strong">
          Google Reviews
        </div>
        <div className="text-ink-muted">
          {typeof totalReviews === 'number' ? `${totalReviews} reviews` : 'Latest reviews'}
        </div>
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent-text hover:text-anchor-gold transition-colors mt-1 inline-block"
        >
          View on Google →
        </a>
      </div>
      
      <Image 
        src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_74x24dp.png"
        alt="Google"
        width={74}
        height={24}
        className="h-6 w-auto"
        unoptimized
      />
    </div>
  )
}

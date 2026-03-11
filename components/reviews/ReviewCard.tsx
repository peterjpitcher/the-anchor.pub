import Image from 'next/image'
import { GoogleReview } from '@/lib/google/types'
import { formatReviewDate, getReviewExcerpt } from '@/lib/google/review-utils'

interface ReviewCardProps {
  review: GoogleReview
  variant?: 'vertical' | 'horizontal'
  showFullText?: boolean
  index?: number
}

export function ReviewCard({ 
  review, 
  variant = 'vertical',
  showFullText = false,
  index = 0
}: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < rating ? "text-yellow-400" : "text-anchor-cream-text/30"}
          >
          </span>
        ))}
      </div>
    )
  }

  if (variant === 'horizontal') {
    return (
      <div className="bg-anchor-bg-raised rounded-lg p-6 border border-anchor-gold/15 flex gap-4">
        <div className="flex-shrink-0">
          {review.profile_photo_url ? (
            <Image
              src={review.profile_photo_url}
              alt={review.author_name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full"
              unoptimized
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-anchor-green text-white flex items-center justify-center font-bold">
              {review.author_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-anchor-cream-text">{review.author_name}</h3>
            <span className="text-sm text-anchor-cream-text/60">
              {formatReviewDate(review.time)}
            </span>
          </div>
          {renderStars(review.rating)}
          <p className="text-anchor-cream-text/80 mt-2">
            {showFullText ? review.text : getReviewExcerpt(review.text)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-anchor-bg-raised rounded-xl p-6 border border-anchor-gold/15 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        {review.profile_photo_url ? (
          <Image
            src={review.profile_photo_url}
            alt={review.author_name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full"
            unoptimized
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-anchor-green text-white flex items-center justify-center font-bold">
            {review.author_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-anchor-cream-text">{review.author_name}</h3>
          <span className="text-sm text-anchor-cream-text/60">
            {formatReviewDate(review.time)}
          </span>
        </div>
      </div>

      {renderStars(review.rating)}

      <p className="text-anchor-cream-text/80 mt-3 flex-1">
        {showFullText ? review.text : getReviewExcerpt(review.text)}
      </p>
      
      {review.author_url && (
        <a 
          href={review.author_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-anchor-gold hover:text-anchor-green mt-3 inline-block"
        >
          View on Google
        </a>
      )}
    </div>
  )
}
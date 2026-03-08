import Image from 'next/image'

interface ReviewsBadgeProps {
  rating: number
  totalReviews: number
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
    <div className={`bg-white rounded-xl shadow-lg inline-flex items-center gap-4 ${sizeClasses[size]}`}>
      <div className="text-center">
        <div className={`font-bold text-3xl text-anchor-green ${size === 'large' ? 'text-4xl' : ''}`}>
          {rating}
        </div>
        <div className={`flex gap-0.5 ${starSize[size]}`}>
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"}
            >
            </span>
          ))}
        </div>
      </div>
      
      <div className="text-left">
        <div className="font-semibold text-anchor-green">
          Google Reviews
        </div>
        <div className="text-gray-600">
          {totalReviews} reviews
        </div>
        <a 
          href="https://g.page/theanchorpubsm?share"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-anchor-gold hover:text-anchor-green transition-colors mt-1 inline-block"
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
import { GoogleReviews } from './GoogleReviews'

interface ReviewSectionProps {
  title?: string
  subtitle?: string
  layout?: 'grid' | 'carousel' | 'badge' | 'list'
  filter?: {
    minRating?: number
    keywords?: string[]
    limit?: number
  }
  background?: "white" | "gray" | "cream" | "dark"
  className?: string
}

export function ReviewSection({
  title = "Customer Reviews",
  subtitle,
  layout = "carousel",
  filter,
  background = "gray",
  className = ""
}: ReviewSectionProps) {
  const bgClasses = {
    white: "bg-anchor-bg-card",
    gray: "bg-anchor-bg",
    cream: "bg-anchor-bg-card",
    dark: "bg-anchor-bg"
  }

  const titleClasses = {
    white: "text-anchor-cream-text",
    gray: "text-anchor-cream-text",
    cream: "text-anchor-cream-text",
    dark: "text-anchor-cream-text"
  }

  const subtitleClasses = {
    white: "text-anchor-cream-text/70",
    gray: "text-anchor-cream-text/70",
    cream: "text-anchor-cream-text/70",
    dark: "text-anchor-cream-text/70"
  }

  return (
    <section className={`section-spacing ${bgClasses[background]} ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {(title || subtitle) && (
            <div className="text-center mb-12">
              {title && (
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${titleClasses[background]}`}>
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className={`text-lg max-w-3xl mx-auto ${subtitleClasses[background]}`}>
                  {subtitle}
                </p>
              )}
            </div>
          )}
          <GoogleReviews 
            layout={layout}
            filter={filter}
            showTitle={false}
          />
        </div>
      </div>
    </section>
  )
}

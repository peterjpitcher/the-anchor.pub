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
    white: "bg-surface",
    gray: "bg-surface-sunk",
    cream: "bg-canvas",
    dark: "bg-surface-sunk"
  }

  return (
    <section className={`py-section-y ${bgClasses[background]} ${className}`}>
      <div className="container mx-auto px-4">
        <div className="mx-auto">
          {(title || subtitle) && (
            <div className="text-center mb-12">
              {title && (
                <h2 className="text-h2 text-ink-strong mb-4">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-lg mx-auto text-ink-muted">
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

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageTitle } from '@/components/ui/typography/PageTitle'

export const metadata: Metadata = {
  title: 'Leave a Review - The Anchor - Heathrow Pub & Dining',
  description: 'Share your experience at The Anchor. Leave us a review on Google to help others discover our traditional British pub near Heathrow.',
  robots: 'noindex, follow',
  alternates: {
    canonical: '/leave-review'
  }
}

export default function LeaveReviewPage() {
  // Redirect to Google Reviews page
  redirect('https://g.page/theanchorpubsm/review?share')
  
  // This won't render due to redirect, but included for completeness
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <PageTitle as="h1" className="text-2xl font-bold mb-4" seo={{ structured: true, speakable: true }}>
          Leave a Review - The Anchor
        </PageTitle>
        <p className="text-gray-600">
          You're being redirected to leave a review for The Anchor on Google.
        </p>
      </div>
    </div>
  )
}

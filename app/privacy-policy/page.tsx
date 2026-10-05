import type { Metadata } from 'next'
import { InteriorHero } from '@/components/hero'
import { PhoneLink } from '@/components/PhoneLink'
import { EmailLink } from '@/components/EmailLink'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { Container } from '@/components/ui'
// Read the version from the constant rather than restating it, so the policy
// cannot drift from the wording actually recorded against a guest's consent.
// It had been stuck at v1 while the code moved to v3.
import { GUEST_COMMS_CONSENT_TEXT_VERSION } from '@/lib/communication-consent'
// Changing the words of this notice? Move PRIVACY_POLICY_LAST_UPDATED in the
// same commit: section 10 below promises the date changes when the notice does.
import { PRIVACY_POLICY_LAST_UPDATED } from '@/lib/legal-pages'
import { formatLondonLongDate } from '@/lib/time-london'

export const metadata: Metadata = {
  title: 'Privacy Policy & Cookie Policy',
  description: 'Privacy and cookie policy for The Anchor, Stanwell Moor. How we collect, use and protect your data when you book a table, enquire about events or browse our site.',
  openGraph: {
    title: 'Privacy Policy & Cookie Policy | The Anchor',
    description: 'Learn how The Anchor collects, uses, and protects your personal information and data.',
    images: [
      {
        url: '/images/page-headers/home/page-headers-homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'The Anchor in Stanwell Moor',
      },
    ],
  },
  alternates: {
    canonical: '/privacy-policy'
  }
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Privacy Policy"
        title="Privacy & Cookie Policy"
        lead="Your privacy matters to us"
      />

      <section className="py-section-y bg-canvas">
        <Container>
        <div className="mx-auto">
          <PageTitle className="text-center text-ink-strong mb-8" seo={{ structured: true, speakable: true }}>
            Privacy Policy - The Anchor
          </PageTitle>
          <div className="prose prose-lg max-w-none">
          <p className="lead">
            Last updated: <time dateTime={PRIVACY_POLICY_LAST_UPDATED}>{formatLondonLongDate(PRIVACY_POLICY_LAST_UPDATED)}</time>
          </p>

          <h2>1. Introduction</h2>
          <p>
            The Anchor ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or visit our establishment.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>Information You Provide</h3>
          <ul>
            <li>Name and contact details when making bookings</li>
            <li>Your service-contact and marketing consent choices, including the consent wording version shown to you</li>
            <li>Email address when signing up for our newsletter</li>
            <li>Feedback and correspondence sent to us</li>
            <li>Information provided when participating in events or promotions</li>
          </ul>

          <h3>Information Automatically Collected</h3>
          <ul>
            <li>IP address and browser information</li>
            <li>Device and connection information</li>
            <li>Page views and site navigation patterns</li>
            <li>Referring website addresses</li>
          </ul>
          {/* Ships with the change that starts recording it: the page source
              sent with each website table booking (lib/table-booking/page-source.ts).
              It sits against a named booking, so it is personal data. */}
          <p>
            When you book a table on our website, we record which of our web pages and adverts you came from. We take this from the web address of the page you book on, not from cookies, and we keep it with your booking.
          </p>
          {/* An event booking always carries the page it was made on (the landing
              path in ManagementEventBookingForm.tsx). Advert tags are only added
              with marketing cookies, which section 5 covers. */}
          <p>
            When you book an event on our website, we record which of our web pages you booked from, and we keep it with your booking.
          </p>

          <h2>3. Job Applications</h2>
          <p>
            When you apply for a position through our Join Our Team page, we collect your name, email address, phone number, the role you are interested in, a summary of your experience, and optionally a CV.
          </p>
          <p>
            We use this information solely to assess your suitability for the role and to contact you about your application. Applications are sent by email to our hiring manager. CVs are attached to that email and are not stored on the website server.
          </p>
          <p>
            If your application is unsuccessful, we delete your personal data within 6 months unless you ask us to keep it on file for future opportunities.
          </p>
          <p>
            The legal basis for processing this data is our legitimate interests in recruitment, combined with the consent you give when submitting the application form.
          </p>

          <h2>4. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process your bookings and reservations</li>
            <li>Send booking confirmations, reminders, payment links, waitlist updates, and booking changes by phone, email, SMS, or WhatsApp where relevant</li>
            <li>Send you news about the pub: what is on, new menus, offers, and anything that is changing</li>
            <li>Improve our website and services</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p>
            If you have booked with us or given us your email address, we may email you news about the pub. Every email has an unsubscribe link, and using it stops the news straight away without affecting your booking confirmations or reminders. You can stop marketing texts by replying NOEVENTS, or STOP to stop texts altogether.
          </p>
          <p>
            Guest communication consent is recorded against the wording version {GUEST_COMMS_CONSENT_TEXT_VERSION}, separately for email, SMS, and WhatsApp. WhatsApp marketing is only ever sent to people who have asked for it, and clicking a WhatsApp contact link does not by itself opt you in to WhatsApp messages or marketing.
          </p>

          <h2>5. Cookie Policy</h2>
          <p>
            We use cookies and similar tracking technologies to improve your browsing experience on our website. Cookies are small data files stored on your device.
          </p>

          <h3>Types of Cookies We Use</h3>

          <h4>Necessary Cookies</h4>
          <p>
            These cookies are essential for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website. The website cannot function properly without these cookies.
          </p>

          <h4>Analytics Cookies</h4>
          <p>
            We use analytics cookies to understand how visitors interact with our website. These cookies help us improve your experience and our website's performance. We use Google Analytics and Microsoft Clarity to collect anonymized information about website usage.
          </p>

          <h4>Marketing Cookies</h4>
          <p>
            Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user. We may use these cookies to measure the effectiveness of our advertising campaigns.
          </p>
          {/* Every line here is a fact about the code. Check it before changing it:
              the 90-day record is lib/booking-attribution.ts; what goes to Meta is
              lib/meta-pixel.ts and the booking conversion forward to CheersAI, which
              only passes it on when marketing consent is true; the 7-day and
              24-month clear-downs are CheersAI's data retention job. The Tag
              Manager container (GTM-WWFQTQS) holds two tags that need marketing
              consent, Meta's pixel and LinkedIn's Insight Tag. Add a tag there
              and it has to be named here. */}
          <p>
            If you accept marketing cookies, this is what we do so we can tell which of our adverts work:
          </p>
          <ul>
            <li>We remember the advert or link that brought you to our website for up to 90 days, in a cookie and in your browser&apos;s storage. This includes the advert&apos;s campaign tags and the click reference that Facebook, Instagram or Google added to the link.</li>
            <li>When you book a table or an event, we keep those campaign tags and the first page you arrived on with your booking.</li>
            <li>We tell Meta, the company behind Facebook and Instagram, about the booking so it can match it to an advert you saw or clicked. This goes from your browser and from our own systems. It includes Meta&apos;s cookie identifiers, your IP address and browser type, the page address, your booking reference, what you booked and its value. It also includes your email address and phone number in a scrambled form (called hashing), never as readable text. We never send Meta your name.</li>
            <li>Our marketing system deletes the click reference, Meta&apos;s identifiers, your IP address, your browser details and the scrambled contact details after 7 days. It deletes the rest of its record of the booking after 24 months.</li>
            <li>LinkedIn&apos;s advertising tag also loads on our pages, which tells LinkedIn you visited our website.</li>
          </ul>
          {/* "Cookie settings" is the label of the footer control (components/layout/Footer.tsx),
              which reopens the banner's preferences panel. Change one, change the other:
              tests/unit/cookie-settings-control.test.tsx holds them together. The delete is
              syncBookingAttributionWithConsent in lib/booking-attribution.ts. */}
          <p>
            If you don&apos;t accept marketing cookies, we don&apos;t store the advert record in your browser and we send nothing about you to Meta or LinkedIn. You can change your mind at any time. Choose Cookie settings at the bottom of any page. If you switch marketing cookies off, we delete the advert record from your browser.
          </p>

          <h4>Preference Cookies</h4>
          <p>
            These cookies enable the website to remember choices you make (such as your language preference) and provide enhanced, more personalized features.
          </p>

          <h3>Managing Cookies</h3>
          {/* A fact about the code, like the lines above. The delete is removeTrackerCookies in
              lib/cookies.ts, run on every consent write. It reaches cookies on our own domain
              only; the four companies are the ones whose tags the Tag Manager container runs.
              Add a tag there from another company and it has to be named here. */}
          <p>
            If you switch analytics or marketing cookies off, we delete them from your browser. We can&apos;t delete the cookies that Google, Microsoft, Meta and LinkedIn keep for their own websites. You can clear those in your browser settings.
          </p>
          <p>
            You can control and manage cookies through your browser settings. Please note that removing or blocking cookies may impact your user experience and parts of our website may no longer be fully accessible.
          </p>

          <h2>6. Third-Party Services</h2>
          <p>
            We use the following third-party services that may collect data:
          </p>
          <ul>
            <li><strong>Google Analytics</strong> - Website analytics</li>
            <li><strong>Microsoft Clarity</strong> - Session insights and usability analytics</li>
            <li><strong>Google Maps</strong> - Location services</li>
            <li><strong>Social Media Platforms</strong> - When you interact with our social media content</li>
            <li><strong>Meta (Facebook and Instagram)</strong> - Advert measurement, only if you accept marketing cookies</li>
            <li><strong>LinkedIn</strong> - Advertising tag, only if you accept marketing cookies</li>
            <li><strong>Booking Systems</strong> - For table reservations</li>
          </ul>

          <h2>7. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your personal information against accidental or unlawful destruction, loss, alteration, unauthorized disclosure, or access.
          </p>

          <h2>8. Your Rights</h2>
          <p>Under UK data protection law, you have rights including:</p>
          <ul>
            <li>The right to access your personal data</li>
            <li>The right to rectification of inaccurate data</li>
            <li>The right to erasure of your data</li>
            <li>The right to restrict processing</li>
            <li>The right to data portability</li>
            <li>The right to object to processing</li>
            <li>The right to withdraw email, SMS, or WhatsApp marketing consent at any time</li>
          </ul>

          <h2>9. Children&apos;s Privacy</h2>
          <p>
            Our website is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our privacy practices, please contact us:
          </p>
          <address className="not-italic">
            <strong>The Anchor</strong><br/>
            Horton Road<br/>
            Stanwell Moor<br/>
            Surrey<br/>
            TW19 6AQ<br/>
            <br/>
            Email: <EmailLink email="manager@the-anchor.pub" source="privacy_policy" /><br/>
            Phone: <PhoneLink phone="01753 682707" source="privacy_policy" />
          </address>

          <h2>12. Complaints</h2>
          <p>
            If you're not satisfied with our response to your privacy concerns, you have the right to lodge a complaint with the Information Commissioner's Office (ICO):
          </p>
          <p>
            <a href="https://ico.org.uk/concerns" target="_blank" rel="noopener noreferrer" className="text-accent-text hover:underline">
              ico.org.uk/concerns
            </a>
          </p>
          </div>
        </div>
        </Container>
      </section>
    </>
  )
}

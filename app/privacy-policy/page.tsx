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

/*
 * HOW THIS NOTICE IS WRITTEN
 *
 * Rewritten on 8 October 2026 from what the two codebases do (this website and
 * the management app) and from the owner's decisions of 7 October 2026. The
 * old notice described things the site did not have (a newsletter, secure
 * areas, a language preference), said job applications were emailed and not
 * stored, and named four of the companies that handle customer data.
 *
 * The rule for every sentence: it is a fact about the code, or a decision the
 * owner has made, and the comment above it says which. Where a fact could not
 * be found (a company number, how long CCTV footage is kept, a legal basis) the
 * sentence is left out rather than guessed. tasks/changes/
 * 2026-10-08-privacy-and-consent.md lists what was left out and why.
 *
 * It states no legal basis and gives no legal advice. Those are for the owner
 * and whoever advises him.
 *
 * Add a company that handles personal data, a cookie, a storage key or a
 * deletion job, in either codebase, and it has to be named here.
 * tests/unit/privacy-policy-inventory.test.tsx fails when the Content Security
 * Policy or the cookie clean-up list names something this page does not.
 */

export const metadata: Metadata = {
  title: 'Privacy Policy & Cookie Policy',
  description: 'Privacy and cookie policy for The Anchor, Stanwell Moor. What we collect when you book, enquire, apply for a job or browse our site, who handles it and how long we keep it.',
  openGraph: {
    title: 'Privacy Policy & Cookie Policy | The Anchor',
    description: 'What The Anchor collects when you book, enquire, apply for a job or browse our site, who handles it and how long we keep it.',
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
        lead="What we do with your information"
      />

      <section className="py-section-y bg-canvas">
        <Container>
        <div className="mx-auto">
          <PageTitle className="text-center text-ink-strong mb-8" seo={{ structured: true, speakable: true }}>
            Privacy Policy - The Anchor
          </PageTitle>
          {/* Tailwind Typography colours its own headings, bold text, links, lead
              line and list markers from a fixed light-theme grey palette, which
              does not follow the season skin. Left bare, the dark skin put
              headings at 1.01:1 and body text at 1.7:1 (measured 5 October 2026).
              So every colour it sets is pointed at a token here: `text-ink` covers
              the paragraphs, list items and address, which inherit it, and the
              modifiers cover the rest. Add an element Typography colours itself
              (a blockquote, a table, inline code) and it needs a modifier too. */}
          <div className="prose prose-lg max-w-none text-ink prose-headings:text-ink-strong prose-a:text-accent-text prose-strong:text-ink-strong prose-lead:text-ink-muted marker:text-ink-muted">
          <p className="lead">
            Last updated: <time dateTime={PRIVACY_POLICY_LAST_UPDATED}>{formatLondonLongDate(PRIVACY_POLICY_LAST_UPDATED)}</time>
          </p>

          <h2>1. Who we are</h2>
          <p>
            This policy says what The Anchor does with your personal information when you use this website, book with us, enquire about an event or apply for a job.
          </p>
          {/* Owner fact 28, 7 October 2026 (docs/SSOT.md section 1). No company
              number or registered office is given: neither is in the SSOT. */}
          <p>
            Orange Jelly Limited is the business responsible for your personal information. Where this policy says &quot;we&quot;, &quot;us&quot; or &quot;our&quot;, it means The Anchor and Orange Jelly Limited.
          </p>
          <p>
            To ask anything about your information, email <EmailLink email="manager@the-anchor.pub" source="privacy_policy" /> or call <PhoneLink phone="01753 682707" source="privacy_policy" />.
          </p>

          <h2>2. What we collect</h2>
          <h3>What you give us</h3>
          {/* Each line is the fields its form sends: app/api/table-bookings,
              app/api/event-bookings, app/api/parking/bookings, the private hire
              and Christmas enquiry routes, and what the management app stores
              for each. The accessible table answer is a yes or no only. */}
          <ul>
            <li><strong>When you book a table:</strong> your name, mobile number and email address, the date, time and how many of you there are, and anything you tell us about the booking: allergies, dietary needs, whether you need an accessible table, high chairs, a celebration, and any notes.</li>
            <li><strong>When you book an event:</strong> your name, mobile number and email address, how many places you want, the names of the people coming where tickets need them, whether you&apos;d like food, and any notes.</li>
            <li><strong>When you book airport parking:</strong> your name, mobile number and email address, your dates, and your car&apos;s registration, make, model and colour.</li>
            <li><strong>When you enquire about private hire or a Christmas party:</strong> your name, your contact details and what you tell us about your event.</li>
            <li><strong>Your contact choices:</strong> what you&apos;ve said about marketing by email, text and WhatsApp, when you said it, and which version of our wording you were shown.</li>
            <li><strong>Messages:</strong> the texts and emails between you and us.</li>
          </ul>
          <p>
            Job applications are covered in <a href="#job-applications">section 3</a>.
          </p>

          <h3>What we collect automatically</h3>
          {/* Cloudflare is in front of the site and Vercel hosts it (response
              headers; reference note on Cloudflare and Vercel). The limit on
              repeated requests is lib/rate-limit.ts, keyed on the address. */}
          <p>
            Like every website, ours receives your IP address and details of your browser each time you load a page. We use the IP address to limit repeated requests and stop automated abuse.
          </p>
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
          {/* Management app: src/app/api/redirect/[code]/route.ts stores each
              click (user_agent, referrer, ip_address, country, city, region,
              device_type, browser, os, utm_content). Marketing email puts the
              recipient's row id in utm_content
              (src/lib/email/marketing/attribution.ts), and the website reads
              utm_content off the address for a table booking's page source. */}
          <p>
            The links in our texts and emails are our own short links. When you tap one, our booking system records the tap: the time, your IP address, the town or city, region and country it points to, your browser and device, and the page you came from. Each link in a marketing email also carries a code that tells us which email it came from and who we sent it to, so a booking you make afterwards can be linked to that email.
          </p>
          {/* docs/SSOT.md section 8: the car park has CCTV. How long footage is
              kept is not recorded anywhere, so it is not stated. */}
          <p>
            Our car park is covered by CCTV. To ask about footage, email <EmailLink email="manager@the-anchor.pub" source="privacy_policy" />.
          </p>

          <h2 id="job-applications" className="scroll-mt-28">3. Job applications</h2>
          {/* The form: app/join-our-team/_components/RecruitmentApplicationForm.tsx.
              The route posts it to the management app first and emails it only
              if that fails twice (app/api/enquiry/recruitment/route.ts). */}
          <p>
            When you apply through our Join Our Team page, we collect your name, email address and phone number, the role you want, your answers to the questions on the form, and your CV if you add one.
          </p>
          <p>
            Your application and CV are kept in our booking and management system. If that system can&apos;t take your application, it&apos;s emailed to our manager instead, with your CV attached.
          </p>
          {/* Management app: src/lib/recruitment/ai.ts sends up to 30,000
              characters of CV text, unredacted, and the form answers to
              OpenAI's chat completions endpoint (src/lib/openai/config.ts), and
              gets back a summary, a score from 0 to 100 and a recommendation.
              Nothing acts on the recommendation by itself: a decision is made
              by a member of staff (decideRecruitmentApplication in
              src/services/recruitment.ts). Whether the AI key is set in
              production could not be checked from the code. */}
          <p>
            We use an AI service, OpenAI, to help us read applications. It&apos;s sent the text of your CV and your answers, and it gives us back a summary and a score. Your CV usually has your name and contact details in it, so those go too. It&apos;s there to help us, not to decide: a person reads every application and makes every decision.
          </p>
          {/* The acknowledgement is automatic and goes through Microsoft 365
              (src/lib/recruitment/communications.ts). Texts need sms_consent.
              Interviews and trial shifts are written to Google Calendar with the
              candidate's name, email and phone (src/lib/recruitment/calendar.ts). */}
          <p>
            We email you to say your application has arrived. We only text you about it if you tick the box for texts. If we invite you to an interview or a trial shift, it goes in our calendar with your name and contact details.
          </p>
          {/* OWNER DECISION, 7 October 2026 (follow-up): "Keep a short record
              for good (name, role, date, outcome and reason). Delete the CV and
              contact details after 12 months." This paragraph states that
              decision. It needs the management app to match before it is true
              of every application: on 8 October 2026 its clean-up
              (runRecruitmentRetentionCleanup) ran at 12 months but only for
              applications marked rejected, withdrawn or duplicate, and it
              removed the name as well. See the change note. */}
          <p>
            If you don&apos;t get the job, we delete your CV and your contact details 12 months after you apply. We keep a short record for good: your name, the role, the date, the outcome and the reason.
          </p>

          <h2>4. How we use your information</h2>
          <p>We use it to:</p>
          <ul>
            <li>Take and look after your booking or enquiry</li>
            <li>Send booking confirmations, reminders, payment links, waitlist updates, and booking changes by phone, email, SMS, or WhatsApp where relevant</li>
            <li>Send you news about the pub: what is on, new menus, offers, and anything that is changing</li>
            <li>See how the website is used and fix what isn&apos;t working</li>
            <li>Answer your questions</li>
            <li>Stop automated abuse of our forms</li>
          </ul>
          {/* The lookup: app/api/customers/lookup/route.ts, a yes or no only. */}
          <p>
            When you type your mobile number into a booking form, we check whether we already have your details, so you don&apos;t have to type them again.
          </p>
          {/* Who is on the email list is the management app's audience query
              (marketing_email_opt_in, or any event or table booking), and the
              ways out are its /api/unsubscribe route and the keywords in
              src/lib/sms/opt-out-keywords.ts. */}
          <p>
            If you have booked with us or given us your email address, we may email you news about the pub. Every email has an unsubscribe link, and using it stops the news straight away without affecting your booking confirmations or reminders. You can stop marketing texts by replying NOEVENTS, or STOP to stop texts altogether.
          </p>
          <p>
            Guest communication consent is recorded against the wording version {GUEST_COMMS_CONSENT_TEXT_VERSION}, separately for email, SMS, and WhatsApp. WhatsApp marketing is only ever sent to people who have asked for it, and clicking a WhatsApp contact link does not by itself opt you in to WhatsApp messages or marketing.
          </p>

          <h2>5. Cookies and browser storage</h2>
          <p>
            Cookies are small files a website keeps in your browser. Browsers also have their own storage, which we use for a few things. This is all of it.
          </p>

          <h3>Always on</h3>
          {/* lib/cookies.ts: CONSENT_COOKIE_NAME, CONSENT_DURATION_DAYS. It is
              the only cookie the site sets before a choice. */}
          <p>
            <strong>anchor-cookie-consent</strong> is a cookie of our own. It remembers your cookie choice for a year, so we don&apos;t ask you again on every page.
          </p>
          {/* Every localStorage and sessionStorage key the site writes without a
              choice. None is read by the server and none holds a name, number,
              email or reference. tests/unit/privacy-policy-inventory.test.tsx
              fails if the code gains a key this list does not have. */}
          <p>
            We also keep a few notes in your browser&apos;s storage so that a pop-up or banner you&apos;ve closed stays closed, the Christmas page knows you&apos;ve already sent an enquiry, and the private hire page remembers the room you picked. They stay in your browser, they aren&apos;t sent to us, and they say nothing about who you are. Their names are christmas_2026_lightbox_seen, christmas_enquiry_submitted, christmas_enquiry_lightbox_last, event_banner_dismissed_until, event_banner_session_show, promo_private_hire_2026_dismissed_until, promo_private_hire_2026_disabled, sunday_lunch_booking_prompt_dismissed, sunday_lunch_exit_intent_shown, sunday_lunch_scroll_tooltip_shown, plane_spotting_booking_prompt_shown and anchor-private-hire-selected-space.
          </p>
          {/* Turnstile loads from challenges.cloudflare.com on the pages with a
              form; PayPal's buttons load from paypal.com at the payment step.
              What each sets inside its own frame is theirs to say, hence "may". */}
          <p>
            Our forms have a security check run by Cloudflare, and payments are taken by PayPal. Each loads in your browser when it&apos;s needed and may set its own cookies to do its job.
          </p>

          <h3>Types of cookies you can choose</h3>

          <h4>Analytics cookies</h4>
          {/* OWNER DECISION 4, 7 October 2026: Google Analytics and Clarity are
              off until a visitor presses Accept. The site does it by not loading
              Tag Manager at all until analytics is accepted
              (components/tracking/GTMProvider.tsx), and /api/analytics forwards
              nothing to Google without it (lib/cookie-consent-server.ts). The
              cookie names are the ones lib/cookies.ts removes. Our own events
              carry no name, contact detail or booking reference
              (lib/gtm-events.ts, lib/tracking/booking-identifiers.ts). The
              lifetimes are what the tags set on a production build of this
              site on 8 October 2026: _ga and _ga_2ZTRYGDRJW 400 days, _clck
              365 days, _clsk one day. They are Google's and Microsoft's to
              change, so check them again when this section is next edited. */}
          <p>
            These are off unless you accept them. If you do, we load Google Tag Manager, which runs Google Analytics and Microsoft Clarity. They show us which pages people visit and how they use them, so we can make the website better.
          </p>
          <ul>
            <li>Google Analytics gives your browser an identifier in cookies named _ga and _ga_ followed by a code, which last up to 400 days. We also send it a record of what you do on the site, such as starting or finishing a booking, from your browser and from our own server. That record doesn&apos;t include your name, your contact details or your booking reference.</li>
            <li>Microsoft Clarity gives your browser an identifier in cookies named _clck, which lasts a year, and _clsk, which lasts a day. It records how you move around a page: where you scroll and what you click.</li>
          </ul>
          <p>
            Until you accept, neither is loaded and we send nothing to Google Analytics or Clarity.
          </p>
          {/* Every line here is a fact about the code. Check it before changing it:
              what is recorded is lib/web-vitals-record.ts, written as one log line by
              app/api/web-vitals/route.ts; the off switch is hasSwitchedAnalyticsOff in
              lib/cookies.ts, read by app/web-vitals.tsx before anything is sent.
              "Cookie settings" is the label of the footer control
              (components/layout/Footer.tsx). */}
          <p>
            We measure how fast our pages load and whether they jump about while loading, so we can fix problems. This uses no cookie and isn&apos;t linked to you: we record the page address, whether the screen is phone, tablet or desktop size, the timings, and which part of the page moved. Our website host, Vercel, keeps those records for about 30 days. To stop it, switch analytics cookies off in Cookie settings at the bottom of any page.
          </p>

          <h4>Marketing cookies</h4>
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
            {/* Seen on the same build on 8 October 2026: with analytics and
                marketing both accepted the Google tag also called
                stats.g.doubleclick.net and www.google.co.uk/ads/ga-audiences;
                with analytics alone it called neither. */}
            <li>If analytics cookies are on as well, Google Analytics passes what it collects about your visit to Google&apos;s advertising services.</li>
          </ul>
          {/* The names lib/cookies.ts removes when marketing is switched off.
              mayLoadTagManager in GTMProvider is why the two tags also need
              analytics: they live in the same container as Google Analytics
              and Clarity, which load with it whatever the marketing choice. */}
          <p>
            These are off unless you accept them. The cookies are anchor-booking-attribution (ours), _fbp and _fbc (Meta), li_fat_id and others set by LinkedIn, and Google&apos;s advert click cookies, whose names start _gcl_. Meta&apos;s and LinkedIn&apos;s tags are loaded by Google Tag Manager, so they only run if you&apos;ve accepted analytics cookies as well.
          </p>
          {/* "Cookie settings" is the label of the footer control (components/layout/Footer.tsx),
              which reopens the banner's preferences panel. Change one, change the other:
              tests/unit/cookie-settings-control.test.tsx holds them together. The delete is
              syncBookingAttributionWithConsent in lib/booking-attribution.ts. Without
              marketing consent the booking itself is still counted by our marketing
              system, with nothing that ties it to an advert
              (lib/booking-conversion-consent.ts). */}
          <p>
            If you don&apos;t accept marketing cookies, we don&apos;t store the advert record in your browser and we send nothing about you to Meta or LinkedIn. You can change your mind at any time. Choose Cookie settings at the bottom of any page. If you switch marketing cookies off, we delete the advert record from your browser.
          </p>

          <h3>Maps and videos</h3>
          {/* components/ui/GoogleMapEmbed.tsx and components/events/LiteYouTube.tsx:
              neither frame is added until the visitor presses the button. */}
          <p>
            The maps on our pages come from Google Maps, and the videos on some event pages come from YouTube. We only load one when you press the button to show it. When you do, Google receives your IP address and may set its own cookies.
          </p>

          <h3>Managing cookies</h3>
          {/* A fact about the code, like the lines above. The delete is removeTrackerCookies
              and removeTrackerStorage in lib/cookies.ts, run on every consent write. It
              reaches cookies on our own domain only; the four companies are the ones whose
              tags the Tag Manager container runs. Add a tag there from another company and
              it has to be named here. */}
          <p>
            If you switch analytics or marketing cookies off, we delete them from your browser. We can&apos;t delete the cookies that Google, Microsoft, Meta and LinkedIn keep for their own websites. You can clear those in your browser settings.
          </p>
          <p>
            We also clear what those tools keep in your browser&apos;s storage. You can block or clear cookies in your browser settings too, and the website still works without them.
          </p>

          <h2>6. Who else handles your information</h2>
          {/* One line per company, each checked against the code on 8 October
              2026. Website: config/security-headers.json lists every host a page
              may load from. Management app: its package.json and the files named
              in the change note. A company is here because personal data reaches
              it, not because we use it. */}
          <p>
            These companies handle your information for us, each for the job listed:
          </p>
          <ul>
            <li><strong>Cloudflare</strong> - Delivers our website and runs the security check on our forms. It sees your IP address and details of your browser.</li>
            <li><strong>Vercel</strong> - Hosts our website and our booking system, and keeps the page speed records.</li>
            <li><strong>Supabase</strong> - The database behind our booking system. Bookings, customer records, messages and job applications, CVs included, are kept there.</li>
            <li><strong>Twilio</strong> - Sends our texts, and WhatsApp messages if you&apos;ve asked for them. It gets your mobile number and the message.</li>
            {/* Management app, src/lib/email/emailService.ts: marketing email is
                Resend only; recruitment email is Microsoft Graph only; every
                other email goes through whichever of the two production is set
                up for, which the code cannot tell us. Hence "can". The website's
                own fallback emails go through Microsoft Graph
                (lib/microsoft-graph-mail.ts). */}
            <li><strong>Resend</strong> - Sends our marketing emails, and tells us what happened to each one, such as delivered or bounced. It can also send our booking emails.</li>
            <li><strong>Microsoft</strong> - Sends our emails about job applications through Microsoft 365, and can send our booking emails. Microsoft Clarity runs only if you accept analytics cookies.</li>
            <li><strong>PayPal</strong> - Takes payments for deposits, event tickets and airport parking. You pay PayPal directly, so your card details never reach us.</li>
            <li><strong>Google</strong> - Our Google calendar holds private hire bookings and job interviews, with the name and contact details for each. Google Maps loads when you ask for a map. Google Analytics and Google Tag Manager run only if you accept analytics cookies.</li>
            <li><strong>OpenAI</strong> - Reads job applications to summarise and score them. See section 3.</li>
            <li><strong>Meta (Facebook and Instagram)</strong> - Advert measurement, only if you accept marketing cookies</li>
            <li><strong>LinkedIn</strong> - Advertising tag, only if you accept marketing cookies</li>
            <li><strong>Upstash</strong> - Counts requests to our booking system so we can block abuse. It sees your IP address.</li>
          </ul>
          {/* The management app's own notice (src/app/privacy/page.tsx) already
              says data may be processed outside the UK, "e.g., Twilio in the US".
              Which safeguards apply is not recorded anywhere, so none is named. */}
          <p>
            Several of these companies are based outside the UK, mostly in the United States, so your information may be handled there.
          </p>

          <h2>7. How long we keep it</h2>
          {/* Only periods a named job enforces, or the owner has decided.
              Management app: communications-retention (weekly) blanks message
              bodies and the page address and browser details on a consent record
              after 24 months, and deletes pre-order rows 730 days after the
              booking date; nothing deletes customers or bookings. Website:
              lib/booking-attribution.ts (90 days), lib/cookies.ts (365 days). */}
          <ul>
            <li><strong>Customer records and bookings:</strong> we don&apos;t delete these automatically. You can ask us to delete yours. See section 9.</li>
            <li><strong>Texts and emails:</strong> we remove the content of a message after 24 months and keep a note that it was sent.</li>
            <li><strong>Food pre-orders:</strong> two years after the date of the booking, we delete each person&apos;s name, what they ordered and any dietary note.</li>
            <li><strong>Your contact choices:</strong> we keep the choice. After 24 months we remove the web page and browser details we noted when you made it.</li>
            <li><strong>Job applications:</strong> see section 3.</li>
            <li><strong>Cookies, the advert record and page speed records:</strong> see section 5.</li>
          </ul>

          <h2>8. Keeping it safe</h2>
          {/* config/security-headers.json (Strict-Transport-Security); the PayPal
              buttons take the payment inside PayPal's own frames. */}
          <p>
            This website is only served over an encrypted connection. Payments are taken by PayPal, so we never see or store your card details.
          </p>

          <h2>9. Your rights</h2>
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
          <p>
            To use any of them, email <EmailLink email="manager@the-anchor.pub" source="privacy_policy" />.
          </p>

          <h2>10. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2>11. Contact us</h2>
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

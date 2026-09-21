# SEO monitoring routine

## Purpose

Check whether organic search is bringing more useful visitors and bookings, without reacting to normal daily changes.

## Schedule

- Run once a month on the 5th, after Search Console has had time to settle.
- Use the previous complete calendar month.
- Compare it with the month before and the same month last year where comparable data exists.
- Run an extra review only after a major site change, a new service, or a sustained traffic fall.

## What to measure

### Google Search Console

- Total web clicks, impressions, click-through rate and average position.
- Brand and non-brand queries separately.
- Results for each page group in the approved keyword map.
- Queries with impressions but no suitable page.
- Pages with a meaningful fall in clicks or impressions.
- Sitemap status and important indexing changes.

### GA4

- Organic sessions by landing page.
- Organic key events and session key-event rate.
- Organic revenue where it is recorded.
- Table-booking, event-booking, private-hire and call actions by landing page.
- Changes in traffic quality, not only visitor totals.

### Google Business Profile

- Website clicks, calls and direction requests.
- Search terms shown by Google, without adding thresholded values together.
- Categories, services, hours and public highlights still match the business.
- Review count, rating, recency and unanswered reviews.

### Website health

- Sitemap is readable and successful.
- Priority pages return 200 and keep their intended canonical, title and H1.
- No accidental `noindex`, robots block or redirect on a priority page.
- No new overlap between pages targeting the same search intent.

## Page groups

Use the page ownership table in `tasks/seo-powerhouse/2026-09-21-keyword-page-optimisation/report.md`. One search intent has one primary page. Do not create or rewrite a page solely because one month's figures moved.

## When to act

- Investigate when a priority page loses at least 20% of clicks or impressions for two consecutive complete months.
- Investigate immediately if a priority page stops indexing, redirects unexpectedly, returns an error, or its conversions stop recording.
- Improve a search snippet only when impressions remain healthy, average position is broadly stable and click-through rate falls.
- Review content when rankings and impressions fall together and the page is still technically sound.
- Review conversion experience when sessions hold up but bookings or enquiries fall.
- Treat seasonal pages against the same period last year, not the previous month.

These are investigation triggers, not proof of cause. Record site changes, promotions, closures and unusual events before drawing conclusions.

## Monthly output

Keep the update short:

1. What improved.
2. What declined.
3. Whether the change is technical, visibility, click-through or conversion related.
4. Up to five recommended actions, or no action.
5. Data gaps and anything that needs the owner's input.

Save each completed review in `tasks/keyword-plan/runs/` and update the persistent keyword plan only after its evidence checks pass.

## Data needed

The routine should use direct account access when available. If access is unavailable, request these exports:

- Search Console Performance for the previous complete month, with Queries, Pages and Chart.
- Search Console Page indexing and sitemap status.
- GA4 Landing page report filtered to Organic Search for the same month and comparison period.
- Google Business Profile performance, search terms, profile state and reviews.

Keyword Planner does not need running every month. Refresh it quarterly, or when a new service, occasion or location is being considered.

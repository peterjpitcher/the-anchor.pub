# Google Places Reviews (Removed)

The site no longer calls the Google Places API for reviews or rating data. This avoids recurring `REQUEST_DENIED` errors caused by Google billing/quota requirements.

## What Replaced It

- `/app/api/reviews` now serves static review content (`mockReviews`) and static rating totals (`DEFAULT_REVIEW_STATS`).
- `/lib/schema-with-reviews.ts` uses the same static rating totals when generating structured data and page-level stats.

If you want live Google reviews again in the future, you’ll need to reintroduce a server-side Places client and wire it back into `/app/api/reviews` and `/lib/schema-with-reviews.ts`.

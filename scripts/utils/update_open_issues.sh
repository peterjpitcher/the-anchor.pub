#\!/bin/bash

# Update critical issues (P0)
echo "Updating critical priority issues..."

# Issue #62 - Sunday lunch payment
gh issue edit 62 --add-label "P0-Critical,bug,payment" --body "## Priority: P0 (CRITICAL)

### Discovery Findings
After thorough code analysis, the issue is confirmed:

**Root Cause:** 
- Frontend correctly sends \`booking_type: 'sunday_lunch'\` to API
- Code expects API response with \`payment_required: true\` and payment details
- External API at \`management.orangejelly.co.uk\` not returning payment requirement for Sunday lunch bookings

**Current Implementation:**
- Menu selection working correctly
- Booking data properly formatted
- Payment handling code exists but not triggered

**Impact:** 
- Revenue loss from unpaid Sunday lunch pre-orders
- Operational issues with food preparation without payment

### Recommended Solution
1. **Immediate:** Contact OrangeJelly to configure Sunday lunch as requiring payment
2. **Alternative:** Implement client-side payment enforcement before API submission
3. **Verification:** Test with actual Sunday lunch booking to confirm payment flow

**Files involved:**
- \`/components/features/BookingWizard/index.tsx\` (lines 146-162)
- \`/lib/api.ts\` (booking submission)
- \`/SUNDAY_LUNCH_PAYMENT_DIAGNOSTICS.md\` (detailed analysis)"

# Issue #64 - UTM parameters
gh issue edit 64 --add-label "P0-Critical,bug,seo" --body "## Priority: P0 (CRITICAL)

### Discovery Findings
Google is indexing multiple URL variations with UTM parameters:

**Problem URLs:**
- \`http://www.the-anchor.pub/?utm_source=google&utm_medium=organic&utm_campaign=google_business\`
- \`http://www.the-anchor.pub/?utm_source=GBP&utm_medium=organic&utm_campaign=office\`

**Impact:**
- Duplicate content issues
- Diluted page authority
- Poor search rankings

### Recommended Solution
1. **Immediate:** Add canonical tag handling for parameterized URLs in \`app/layout.tsx\`
2. **robots.txt:** Already has \`Disallow: /*?*utm\` but needs verification
3. **Google Search Console:** Submit parameter handling rules
4. **301 Redirects:** Redirect parameterized URLs to clean versions

**Implementation needed in:**
- \`app/layout.tsx\` (canonical tag logic)
- \`middleware.ts\` (parameter stripping)
- Verify robots.txt is being served correctly"

echo "Updating high priority issues..."

# Issue #63 - Mobile header overlap
gh issue edit 63 --add-label "P1-High,bug,mobile,ux" --body "## Priority: P1 (HIGH)

### Discovery Findings
Mobile header components have conflicting layouts:

**Current Issues:**
- \`MobileHeaderStatus.tsx\` uses \`flex-col\` (vertical stacking)
- Reviews component has \`hidden sm:inline-flex\` causing display issues
- Inconsistent behavior between mobile and desktop breakpoints

**Files to fix:**
- \`/components/header/MobileHeaderStatus.tsx\` (lines 10-60)
- \`/components/header/HeaderStatusSection.tsx\`

### Recommended Solution
1. Change mobile layout to horizontal (\`flex-row\`) with proper spacing
2. Fix visibility classes for consistent mobile display
3. Ensure reviews badge shows correctly on mobile
4. Test on actual mobile devices

**Quick fix:**
Change line 10 in MobileHeaderStatus.tsx from \`flex-col\` to \`flex-row\` and adjust spacing"

# Issue #61 - Menu dropdown UX
gh issue edit 61 --add-label "P1-High,enhancement,ux" --body "## Priority: P1 (HIGH)

### Discovery Findings
Menu selection dropdown only shows name and price, making selection difficult:

**Current Implementation:**
- Dropdown shows: \`{item.name} - £{price}\`
- Description only appears AFTER selection
- Users can't see what they're selecting

**File:** \`/components/features/BookingWizard/WizardStep2bMenuSelection.tsx\` (lines 176-187)

### Recommended Solution
1. **Option A:** Show truncated description in dropdown (e.g., first 50 chars)
2. **Option B:** Implement tooltip/preview on hover
3. **Option C:** Use cards instead of dropdown for better visibility

**Implementation:**
Modify the Select component options to include descriptions or switch to a card-based selection UI"

echo "Updating medium priority issues..."

# Issue #59 - Technical SEO
gh issue edit 59 --add-label "P2-Medium,seo,technical-debt" --body "## Priority: P2 (MEDIUM)

### Discovery Findings
Previous non-indexed URL audit notes were archived; run a fresh crawl before implementing fixes.

**Current State:**
- Most non-indexed URLs are correct (API endpoints, assets)
- Proper redirects configured for legacy URLs
- Some duplicate content issues remain

### Recommended Actions
1. Run a fresh crawl / Search Console export and resolve the flagged canonical & indexing issues
2. Fix canonical tags for all pages
3. Update sitemap.xml generation
4. Configure structured data properly

**Not urgent but important for long-term SEO health**"

# Issue #52 - Christmas packages
gh issue edit 52 --add-label "P3-Low,content,seasonal" --body "## Priority: P3 (LOW)

### Discovery Findings
Pages already exist but need 2025 content updates:
- \`/app/christmas-parties/page.tsx\` - Has packages but needs 2025 pricing
- \`/app/corporate-events/page.tsx\` - Needs Christmas section

### Recommended Actions
1. Update pricing for 2025 season
2. Add early bird discounts
3. Include new menu options
4. Update availability calendar

**Can wait until September/October 2025**"

echo "Updating low priority issues..."

# Issue #27 - Dog-friendly page
gh issue edit 27 --add-label "P3-Low,content,seo" --body "## Priority: P3 (LOW)

### Discovery Findings
No dedicated dog-friendly page exists, but content is scattered across:
- Blog posts mention dog-friendly
- Beer garden allows dogs
- Various pages reference pet-friendly

### Recommended Implementation
Create \`/app/dog-friendly/page.tsx\` with:
- Dog-friendly policies
- Water bowls and treats info
- Beer garden access
- Local dog walking routes
- SEO optimization for 'dog friendly pub' searches

**Nice to have for pet owner market segment**"

# Issue #5 - SEO content expansion
gh issue edit 5 --add-label "P3-Low,seo,content,ongoing" --body "## Priority: P3 (LOW/ONGOING)

### Discovery Findings
Extensive SEO work already completed:
- Earlier audit notes are archived; use live Search Console data as the source of truth.
- Many location pages created
- Rich content on key pages

### Remaining Work
This is an ongoing task for continuous improvement:
1. Monitor search console for new opportunities
2. Create content for emerging keywords
3. Update seasonal content regularly
4. Expand blog content

**This is a continuous improvement task, not a specific issue**"

echo "Done updating issues with priorities and findings."

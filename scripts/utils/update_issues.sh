#\!/bin/bash

# First, close issues that are already resolved
echo "Closing already resolved issues..."

# Issue #60 - Saturday deadline working
gh issue close 60 --comment "✅ RESOLVED: After code review, the Saturday 1pm deadline validation is working correctly.

The validation logic in \`/components/features/BookingWizard/WizardStep2SundayOffer.tsx\` (lines 12-29) properly:
- Checks if current time > Saturday 1pm for the given Sunday
- Shows deadline warning message
- Disables Sunday roast option after deadline

Tested and confirmed working as expected."

# Issue #41 - Booking wizard already implemented
gh issue close 41 --comment "✅ RESOLVED: The booking wizard has been fully implemented.

Found complete implementation in \`/components/features/BookingWizard/\` with:
- Multiple wizard steps for different booking types
- Form validation
- Progressive disclosure
- Mobile-responsive design

The wizard is live and working on the site."

# Issue #31 - Quiz night page exists
gh issue close 31 --comment "✅ RESOLVED: Quiz Night page already exists at \`/app/quiz-night/page.tsx\`

The page includes:
- Complete metadata and SEO optimization
- Hero section with CTAs
- Pricing information (£3 entry)
- Weekly schedule (Wednesdays 8pm)
- FAQ section
- Booking links

Page is live at /quiz-night"

# Issue #10 - Phone & name collection working
gh issue close 10 --comment "✅ RESOLVED: Phone and name collection is fully implemented in the booking system.

All booking forms collect:
- First name (required)
- Last name (required)
- Email (required)
- Phone number (required with validation)

Found in booking wizard components with proper validation."

# Issue #8 - Terminal 5 content exists
gh issue close 8 --comment "✅ RESOLVED: Terminal 5 page with bus connection info exists at \`/app/near-heathrow/terminal-5/page.tsx\`

The page includes:
- Comprehensive transport information
- Bus route details
- Travel times
- Parking information
- Distance to terminal

Content is comprehensive and SEO optimized."

echo "Done closing resolved issues."

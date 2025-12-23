#\!/bin/bash

echo "Checking resolved issues..."
echo "=========================="

# Issues we've resolved
resolved_issues=(
  "67"  # Christmas Parties page optimized
  "66"  # Free Parking page created
  "65"  # Pubs in Stanwell page created
  "58"  # SEO pages created (Food menu, Function Room optimized)
  "57"  # Brand search optimization (homepage title fixed)
  "51"  # Private hire packages created
  "30"  # Sunday Roast page enhanced
  "26"  # Fish & Chips page created
  "25"  # Restaurants Near Heathrow page created
  "12"  # Private Hire content added (function room page)
)

for issue_num in "${resolved_issues[@]}"; do
  echo "Closing issue #$issue_num as resolved..."
  gh issue close $issue_num --comment "✅ Resolved: This issue has been completed as part of recent SEO improvements and page creation work."
done

echo "Done closing resolved issues."

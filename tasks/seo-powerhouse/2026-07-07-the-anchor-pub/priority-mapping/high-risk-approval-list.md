# High-Risk / Owner-Action List — needs sign-off or owner access

_Batched into one decision point (skill rule: no drip-feed approvals). Nothing here ships without the owner. Grouped by why it's gated._

## A. Owner-only (no code access from this session)
| ID | Action | Why it's owner-only | Risk if wrong |
|---|---|---|---|
| SEO-001 | Set/verify `GA4_MEASUREMENT_ID` + `GA4_API_SECRET` in Vercel | Vercel env vars | Conversions keep silently no-op'ing |
| SEO-002 | Link/verify GSC property, start weekly Performance + Page-Indexing exports | Google account access | Next audit stays on the blind without-data track |
| SEO-003 | Mark the 5 commercial events as GA4 key events; verify GTM triggers | GA4/GTM console | Bookings don't count as conversions |
| SEO-004 | Set `NEXT_PUBLIC_META_PIXEL_ID` in Vercel | Vercel env | Paid/social attribution stays dead |
| SEO-029 | Turn off Cloudflare Email Address Obfuscation (Scrape Shield) | Cloudflare dashboard | 244 broken /cdn-cgi links + email hidden from AI crawlers persist |
| SEO-038 | Fix inapub.co.uk listing (remove "Sky TV", add website link) | Third-party listing login | Banned claim keeps surfacing |
| SEO-039–042 | Plane-spotting citations, roast/near-Heathrow directories, review-velocity routine, community/press links, GBP audit | Off-site / owner relationships | Slow-compounding authority left on the table |

## B. Editorial (route to `editorial-team`, per house rule — briefs in content-production/)
| ID | Content work | Risk band | Cannibalisation note |
|---|---|---|---|
| SEO-015 | De-placeholder christmas-parties / engagement-parties (also has a code half) | High-traffic seasonal | expand existing |
| SEO-016 | Price de-hardcode sweep (4 app pages + ~10 blogs) + drift-guard test | Revenue-adjacent | expand existing |
| SEO-017 | Christmas-parties: strip ~20 prices + min-spend line + fix T2 distance | Seasonal money page | expand existing |
| SEO-018 | Wakes fact correction (capacity, crematorium distance) | Grief audience | expand existing |
| SEO-019 | Room-hire fee reconciliation across private-hire cluster | P2 money pages | expand existing |
| SEO-020 | Blog banned-claim purge | Brand risk | expand existing |
| SEO-022 | De-hardcode hours/review-count; occasion capacity reconcile | Multiple pages | expand existing |
| SEO-024 | Rewrite broken/oversized money-page meta descriptions | Money pages | expand existing |
| SEO-037 | FAQ + FAQPage + answer blocks on /private-hire, /whats-on (also `ai-seo` + `schema-markup`) | AEO upside | expand existing |
| SEO-046 | Frequency/over-claim tidy-ups (whats-on, fish-and-chips, parking, corporate savings) | Low | expand existing |

## C. High-risk technical / structural — needs sign-off (and often GSC data)
| ID | Change | Why gated | Cannibalisation / rollback |
|---|---|---|---|
| SEO-025 | Re-point 2 legacy blog 301s to /restaurants-near-heathrow + apply tag-alias at render | Redirect changes affect indexation | Reversible via redirect map; **create-new: no** — repoints to existing page |
| SEO-034 | De-cannibalise private-hire cluster (interim retarget safe; **merge needs GSC**) | Removing/merging a page can drop a term that earns | **Blocked on SEO-002**; decide create-new vs expand vs merge from GSC |
| SEO-035 | Hotel-page disposition (differentiate 11 pages or consolidate) | Doorway-page + indexation risk | **Blocked on SEO-002** |
| SEO-036 | Merge duplicate family-dining pages + competing cost blogs | Same-term self-competition | **Blocked on SEO-002** |
| SEO-027 | /drinks schema: kill 146 empty-price Offers + de-hardcode drinks.json + trim 60KB | Schema/menu-data change | Reversible; route design to `schema-markup` |
| SEO-028 | Schema-estate repair (430 missing-field blocks, retired rich results, articleBody bloat) | Sitewide JSON-LD template change | Reversible; `schema-markup` |
| SEO-030 | Right-size og:image default + source files | Asset/template change | Reversible |
| SEO-032 | Regenerate sitemap to cover 44 missing pages + real lastmod | Indexation signal | Reversible; verify no noindex pages added |

## Recommendation
Approve **A** (owner does these first — they unblock measurement and cost near-nothing), run **B** through `editorial-team` in a single batch, and stage **C** behind SEO-002 landing so the cannibalisation merges are data-led, not guesses.

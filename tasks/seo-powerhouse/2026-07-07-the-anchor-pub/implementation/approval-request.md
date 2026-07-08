# Batched Approval Request — one decision point

_Skill rule: no drip-feed approvals. Everything below needs owner sign-off or owner access before it ships. Recommendation column is the default if you don't object._

## Group A — Owner actions (unblock measurement; near-zero risk)
| ID | Action | Risk if not done | Recommendation |
|---|---|---|---|
| SEO-001 | Set `GA4_MEASUREMENT_ID` + `GA4_API_SECRET` in Vercel; redeploy | Server-side conversions keep silently no-op'ing | **Do now** |
| SEO-002 | Link/verify GSC property; export Performance + Page-Indexing weekly; connect GA4 | Next audit stays blind; cannibalisation merges stay blocked | **Do now** |
| SEO-003 | Mark the 5 commercial GTM events as GA4 key events; confirm triggers fire | Bookings don't count as conversions | **Do now** |
| SEO-004 | Set `NEXT_PUBLIC_META_PIXEL_ID` in Vercel | Paid/social attribution dead | **Do now** |
| SEO-029 | Cloudflare → turn off Scrape Shield Email Obfuscation | 244 broken /cdn-cgi links + email hidden from AI crawlers | **Do now** |
| SEO-010-confirm | Confirm which mailboxes are live (`manager@`, `parking@`, `events@`, `info@`); reconcile SSOT, then fix CTAs | Enquiries may go to dead mailboxes (silent lead loss) — but changing a *working* mailbox would also break things | **Owner confirms, then dev fixes** |

## Group B — Editorial (route to `editorial-team`; briefs in `content-production/editorial-team-briefs.md`)
Approve running EB-1…EB-9 as one editorial batch. **EB-1 (Christmas) and EB-2 (wakes) are time/impact-sensitive — do first.** Cannibalisation verdict on all: **expand existing, no new pages this cycle.**

## Group C — High-risk technical / structural (stage behind SEO-002 where noted)
| ID | Change | Risk | Rollback | Recommendation |
|---|---|---|---|---|
| T-SEO-007 | £-symbol fix on menu display prices | Could leak £ into JSON-LD Offer.price if mis-scoped | git revert; verify Rich Results | **Approve** (with the schema acceptance test) |
| T-SEO-025 | Repoint 2 legacy blog 301s → /restaurants-near-heathrow; apply tag-alias at render | Redirect/indexation change | reversible redirect map | **Approve** |
| T-SEO-027/028 | /drinks + sitewide schema repair | Sitewide JSON-LD change | reversible; `schema-markup` owns design | **Approve, staged** |
| T-SEO-032 | Sitemap reconciliation | Indexation signal | reversible; verify no noindex added | **Approve** |
| SEO-034/035/036 | Private-hire / hotel / family-dining consolidation-or-merge | Could drop a page that quietly earns | **BLOCKED on SEO-002** | **Defer until GSC data** |

**Cannibalisation check (required):** no change in this cycle creates a new page competing with an existing ranked URL. All private-hire/hotel/family-dining work is **expand/retarget existing**; merges are explicitly deferred until GSC query data shows which URL earns the term.

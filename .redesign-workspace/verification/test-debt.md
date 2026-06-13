# Tracked test-debt (must be resolved in Phase 6 — §K 6.2 / §L)

These suites fail because they assert on the OLD design the redesign removes. NOT product regressions. Confirmed by reading failure messages.

| Suite | Why it fails | Phase 6 action |
|---|---|---|
| `tests/.../hero-template-regressions` | Asserts `<HeroWrapper`, `route=`, `variant="feature"`, `primaryCta={<BookTableButton…}` — the old hero system. We migrated all pages to `InteriorHero` in Phase 2.1. | Rewrite to assert the InteriorHero structure, PRESERVING the intent checks (terminal/local-pub pages keep a booking-intent primary CTA; correct crumb/title per page). Do not just delete. |
| `TestimonialSection` | Looks for `[data-testid="section-header"]` — the old `SectionHeader`. Replaced by `SectionHeading` (Phase 1.3). | Update the test to the new SectionHeading markup/testid. |
| `ManagementTableBookingForm` | Pre-existing on `main` (31 failing titles, identical set confirmed). Flaky async/jsdom. | Out of redesign scope; pre-existing. Leave unless trivially fixable. |

Baseline note: the booking suite count drifts 31–33 across runs (flaky `waitFor`). Use failing-test-SET diff vs `main`, not counts, to detect real regressions.

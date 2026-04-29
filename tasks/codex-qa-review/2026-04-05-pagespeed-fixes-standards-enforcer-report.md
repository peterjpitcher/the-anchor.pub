# Standards Enforcer Report — PageSpeed Insights Fixes Design Spec

**Spec reviewed:** `docs/superpowers/specs/2026-04-05-pagespeed-fixes-design.md`
**Date:** 5 April 2026
**Verdict:** Conditionally passes with required actions before implementation

---

## 1. Definition of Ready Assessment

### Requirements — PASS (with notes)

| DoR Item | Status | Notes |
|----------|--------|-------|
| Problem statement clear | PASS | Each issue references a specific PSI finding with file and line numbers |
| Success criteria defined | PASS | Section at bottom with measurable targets (LCP, CLS, audit names) |
| Acceptance criteria listed | PARTIAL | Success criteria exist but are loosely worded for LCP ("toward 4-5s range") and CLS ("toward <0.1"). These should be hard pass/fail thresholds, not directional targets. |
| Scope bounded | PASS | "Out of Scope" section with justifications |

### Technical — PARTIAL PASS

| DoR Item | Status | Notes |
|----------|--------|-------|
| Inputs/outputs identified | PASS | File paths, line numbers, and expected changes are documented |
| Dependencies mapped | FAIL | No mention of dependencies between issues. Issue 3 (CLS) and Issue 2 (LCP) both modify `HeroSectionServer.tsx` — implementation order matters. |
| API contracts | N/A | No API changes |
| Database changes | N/A | No database |
| Auth/permission requirements | N/A | Public-facing changes only |

### Risk — PARTIAL PASS

| DoR Item | Status | Notes |
|----------|--------|-------|
| Failure modes listed | PARTIAL | Issue 3 mentions clipping risk. Issues 2, 4, 5 do not list failure modes. Issue 2 (quality reduction) could degrade visual quality — no mention. |
| Rollback strategy | FAIL | No rollback plan documented. Simple git revert would work, but it should be stated explicitly. |
| Performance targets | PASS | LCP and CLS targets set |
| Data classification | N/A | No PII involved |

### Complexity Check — FAIL

| DoR Item | Status | Notes |
|----------|--------|-------|
| Complexity score assigned | FAIL | No complexity score. This touches 4+ files across multiple concerns — likely a score of 3 (M). Must be recorded per standards. |
| Breakdown if >= 4 | N/A | Likely does not require breakdown, but score must still be assigned |

### DoR Gate Result

3+ items unchecked (dependencies, rollback, complexity score, and Issue 6 scoping). Per the DoR gate rule, **missing information should be requested before starting**. However, the gaps are minor enough that they can be addressed by adding the missing items to the spec rather than blocking work entirely.

---

## 2. Accessibility Assessment (per ui-patterns.md)

### What is addressed

- **Issue 5 (touch targets):** Correctly identifies the 48x48px minimum and proposes a concrete fix (size="xs" to size="sm", remove restrictive overrides). Aligns with accessibility baseline.
- **Issue 6 (colour contrast):** Identified but not scoped. See Section 3 below.
- **Issue 1 (descriptive link text):** While categorised as SEO, this is also an accessibility improvement for screen readers. Good.

### What is missing

- **Focus styles:** The spec does not mention verifying that the cookie banner's Accept button retains visible focus styles after the size change. The DoD accessibility checklist requires "interactive elements have visible focus styles."
- **Keyboard navigation:** No mention of verifying the cookie banner is keyboard-navigable after changes. The banner is an interactive overlay — it should be tested for keyboard access.
- **Image alt text:** Issue 4 (event images) discusses sizing but does not mention verifying `alt` text on event card images. The DoD requires "images have meaningful alt text."

---

## 3. Issue 6 (Colour Contrast) — "Investigation Needed"

**Verdict: NOT ACCEPTABLE per project standards.**

The Definition of Ready requires "acceptance criteria listed — specific, testable requirements" and "inputs and outputs identified." Issue 6 fails both: it lists "likely candidates" without confirming which elements actually fail, and proposes no specific fix.

Per the DoR gate: if 3+ items are unchecked, request missing information before coding. Issue 6 on its own has 3+ unchecked items (no specific elements, no specific fix, no failure modes, no success criteria beyond "improves").

**Required action:** Either:
1. Fully scope Issue 6 before implementation — identify the exact failing elements, their current contrast ratios, and the specific colour changes needed. Ensure no hardcoded hex values are introduced (use design tokens per DoD).
2. Split Issue 6 into a separate follow-up ticket with its own investigation phase, and remove it from this spec's scope.

Option 2 is recommended. The other 5 issues are well-scoped and can ship independently.

---

## 4. Standards Violations in Proposed Fixes

### Issue 2 — Hero image quality reduction

- **Hardcoded value:** The quality value `75` is a hardcoded magic number. The current value `82` is also hardcoded. Neither violation is new, but per "no hardcoded values" principles, consider extracting image quality settings to `lib/constants.ts` (e.g., `HERO_IMAGE_QUALITY = 75`). This is a minor concern — image quality props on `next/image` are typically inline, and the framework expects a number literal. **Low severity.**

### Issue 3 — CLS fix (min-h to h)

- **No test plan for visual regression.** The spec notes "test on mobile" as a risk but does not define what testing means. The DoD requires "new tests written for business logic." While this is a CSS-only change and difficult to unit test, the spec should at minimum define manual testing steps (specific devices/viewports to check) or reference visual regression tooling.
- **Overflow hidden risk.** Adding `overflow-hidden` could clip content that extends beyond the viewport fraction. The spec acknowledges this but does not define a fallback if clipping occurs on real content. A concrete plan is needed: "If content is clipped on viewport X, then do Y."

### Issue 4 — Event image sizing

- **Underspecified.** "Find the event card image components" is too vague. The spec should identify the exact file(s) and component(s). All other issues have file paths — this one does not. This needs to be resolved before implementation to avoid scope creep during coding.

### Issue 5 — Cookie banner button

- **No hardcoded colour concern** — this is a size change using existing design tokens (Button component variants). Clean.

### Issue 1 — Link text

- **Clean.** Text-only change with no standards implications.

---

## 5. Out of Scope Justifications

| Exclusion | Justification Quality | Notes |
|-----------|----------------------|-------|
| Content-Signal in robots.txt | GOOD | Correctly identified as Cloudflare-injected, not in codebase. Manual action documented. |
| Third-party script weight (FB Pixel, LinkedIn, Clarity) | GOOD | Accurate — these are external scripts. Removing them is a business decision, not a code fix. |
| LinkedIn deprecated API | GOOD | Third-party issue, no codebase action possible. |
| Render-blocking CSS | ACCEPTABLE | "Minimal gain from changing" is a valid judgement for Next.js CSS extraction behaviour. Could be stronger — should note that Next.js handles CSS chunking automatically and manual intervention risks breaking the framework's optimisation. |

**Overall:** Out of scope section is well-justified. No items appear to be improperly excluded.

---

## 6. Definition of Done Gaps

Items from the DoD that the spec does not address or plan for:

### Code Quality
- [ ] **No hardcoded hex colours — use design tokens.** Issue 6 (contrast) will likely require colour changes. The spec must explicitly state that any contrast fixes use design tokens, not inline hex values. Currently not mentioned.

### Testing
- [ ] **New tests written.** No test plan for any of the 6 issues. The spec should define:
  - Which changes are testable (Issue 1: link text can be snapshot-tested; Issue 5: button size can be tested)
  - Which are manual-only (Issues 2, 3: visual/performance — document manual test steps)
  - Whether existing tests need updating after changes
- [ ] **All existing tests pass.** Not mentioned — spec should note that `npm test` must pass after changes.

### Accessibility
- [ ] **Focus styles verification** after Issue 5 changes
- [ ] **Image alt text** verification during Issue 4 work
- [ ] **Keyboard navigation** verification for cookie banner after Issue 5

### Deployment
- [ ] **Verification pipeline.** Spec does not mention running lint/typecheck/test/build. Should reference `verification-pipeline.md`.
- [ ] **No console.log statements.** Not mentioned (minor — unlikely to be introduced, but should be checked).

### Documentation
- [ ] **Complex logic commented.** Issue 3 (CLS fix with overflow-hidden) should have a comment explaining why fixed height is used instead of min-height, to prevent future developers from "fixing" it back.

---

## Summary of Required Actions

| Priority | Action | Blocking? |
|----------|--------|-----------|
| HIGH | Scope Issue 6 fully or split it into a separate ticket | Yes |
| HIGH | Add complexity score to the spec (likely 3/M) | Yes (per DoR) |
| MEDIUM | Identify exact file(s) for Issue 4 (event card images) | Yes — too vague to implement |
| MEDIUM | Add test plan (which issues get automated tests, which get manual testing steps) | Yes (per DoD) |
| MEDIUM | Document rollback strategy (even if just "git revert") | No, but required by DoR |
| MEDIUM | Note implementation order — Issues 2 and 3 both modify same file | No, but reduces merge risk |
| LOW | Add inline code comment requirement for Issue 3 (why fixed height) | No |
| LOW | Add verification pipeline reference | No |
| LOW | Consider extracting image quality to constants | No |

**Bottom line:** The spec is well-structured and most issues are clearly scoped with file paths and concrete fixes. The main gaps are Issue 6 (unscoped), missing complexity score, missing test plan, and Issue 4's vague file references. Address the HIGH and MEDIUM items above, and this spec meets project standards.

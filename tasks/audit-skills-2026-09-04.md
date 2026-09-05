# Skills audit, 4 September 2026

Measured by script, nothing edited. Every personal skill has valid frontmatter, a description under 1024 characters with a when-clause, a SKILL.md under 300 lines, and no em dashes.

## 1. Personal skills

| Skill | Lines | Desc chars | Uses | Stale refs | Overlap | Verdict |
|---|---|---|---|---|---|---|
| auth-standardiser | 87 | 506 | 3 | 1 | supabase plugin (auth) | keep |
| cleanup | 220 | 464 | 9 | 0 | cloud dev-cleanup, cloud finish | keep |
| codex | 81 | 357 | 1 | 0 | codex-qa-review | merge |
| codex-qa-review | 214 | 502 | 181 | 6 | built-in code-review, cloud standards-guardian | keep |
| deploy-verify | 88 | 381 | 36 | 0 | deploy-verify.js hook, Codex vercel-deploy | keep |
| design | 209 | 460 | 0 | 4 | frontend-design plugin | retire |
| e2e-test | 257 | 518 | 3 | 0 | Codex playwright, built-in run | keep |
| editorial-team | 232 | 566 | 20 | 2 | content-strategy, copywriting (unlinked) | keep |
| fix-function | 230 | 578 | 69 | 2 | cloud app-section-review, built-in code-review | keep |
| graphify | 206 | 368 | 3 | 0 | none | keep |
| implement-plan | 214 | 420 | 156 | 0 | cloud implement-plan | keep |
| keyword-plan | 278 | 644 | 19 | 0 | cloud keyword-plan (April copy) | keep |
| prod-migrate | 95 | 461 | 24 | 0 | supabase plugin | keep |
| seo-powerhouse | 180 | 672 | 19 | 2 | Codex seo-audit | keep |
| session-setup | 60 | 322 | 175 | 1 | none | keep |

Stale refs: old paths, retired plugins, dead links and hand-offs to skills unlinked today. codex, design, editorial-team and graphify quote no trigger phrases.

## 2. Improvements

**auth-standardiser**: `references/reference-impl/` carries 2,954 lines copied from MixerAI and TheCookbook; pin to a commit with the existing `pin-references.mjs` so they cannot drift. Fix the dead link in `references/lessons.md`.

**cleanup**: name the memory skill precisely (`anthropic-skills:consolidate-memory`, lines 9 and 131). When cloud dev-cleanup and finish go, absorb their triggers ("wrap up", "done for today", "prune branches").

**codex**: one use ever, same `codex exec` plumbing as codex-qa-review; fold it in as a "delegate" mode.

**codex-qa-review**: `scripts/build-review-pack.sh` lines 395, 576, 577 and `agents/standards-enforcer.md` lines 9 and 48 read only `.claude/rules/`; since the 4 Sep move, packs silently omit the DoR, complexity, PR and verification rules. Delete `docs/superpowers` (line 55). Move the 15 report-template headings into `references/report-template.md`, taking SKILL.md to about 120 lines.

**deploy-verify**: line 23 says the-anchor.pub never deploys from a push; unverified, and recent notes describe merged PRs going live, so confirm against the Vercel Git settings, then date-stamp or delete it. Add a redirect assertion (destination equals the rule, layer named): two failures on record. Add a `vercel logs` step (vercel:logs had 17 uses).

**design**: retire. Never used, 9.2 MB (54 fonts, 25 Python scripts), two dead links (`assets/manifest.json`, `assets/design-tokens.json`), two hand-offs to the unlinked copywriting skill; the frontend-design plugin covers UI work. Archive it outside `~/.claude/skills`.

**e2e-test**: add a hard rule: never run write flows where local dev points at a live API (a test POST once created a real booking). Trim the phase text that repeats `references/pre-flight.md` and `playwright-setup.md`.

**editorial-team**: the description routes to copywriting and copy-editing, both unlinked today; reroute to its own quick mode or content-strategy. Quote real triggers ("write a blog post", "fact-check this").

**fix-function**: `scripts/build-review-pack.sh` lines 169 to 171 copy `.claude/rules/*.md` only; add `.claude/docs/*.md`. It leaves `.claude/fix-function/` inside project repos (OJ-The-Anchor.pub has one now); write to the scratchpad or have cleanup remove it. Send plain diff reviews to `/code-review`.

**graphify**: explicit trigger, CLI 0.9.23 present, graphs exist in AnchorManagementTools and CheersAI2.0. Check `.graphify_version` against the CLI and say in one clause what it produces.

**implement-plan**: remove the cloud duplicate (older, 382 lines, same triggers). Add the wave-gate rule: commit each wave at its gate, checking `git status -sb` first when the checkout is shared. Say where planning now happens; superpowers:writing-plans (171 uses) is gone.

**keyword-plan**: remove the April cloud copy (164 lines against 278), then delete the "Prefer this personal skill" clause. Move the Preflight table and output template into `references/`. Record the August GKP lesson: town-name terms return no data; "near me" plus Google Business Profile wins locally.

**prod-migrate**: title and description say Anchor only, yet the body is generic and 20 other repos use Supabase; retitle it and take the project ref from `supabase/config.toml`, never from memory. Cite the DROP audit and view-recreation rules from `.claude/rules/supabase.md` explicitly.

**seo-powerhouse**: references hand off to form-cro twice (unlinked today); route to page-cro. Confirm the 10,086 lines of Python and the evals still run, or prune them. Add the GSC lessons: data starts 1 May 2026, "not indexed" is not a defect count, AI Mode fan-out inflates impressions.

**session-setup**: line 20 reads `.claude/rules/`; only `supabase.md` remains there and `rules-inject.js` injects the docs on demand, so name that one file. Add a "read MEMORY.md and lessons first" step; that is where the corrections live.

## 3. Marketing, Codex and claude.ai skills

Still linked for Claude, keep: ai-seo (AI Mode fan-out is a live Anchor problem), analytics-tracking (GA4, GTM and CAPI work recurs), schema-markup (JSON-LD is core to hospitality pages), site-architecture and page-cro (seo-powerhouse routes to all three; "fix conversions, not rankings" is the standing diagnosis), find-skills. Probation (one or two uses each): content-strategy, social-content, programmatic-seo, paid-ads. Unlink docx-generator; the account docx skill is richer. Four linked descriptions now name unlinked skills: page-cro (form-cro, popup-cro, onboarding-cro, signup-flow-cro), analytics-tracking (ab-test-setup), content-strategy (copywriting), paid-ads (ad-creative); a one-line edit each.

Codex-only marketing skills: keep frontend-design (Codex has no plugin equivalent). Delete seo-audit (superseded by seo-powerhouse, now symlinked into `~/.agents`) and the other ten (churn-prevention, cold-email, free-tool-strategy, onboarding-cro, paywall-upgrade-cro, pricing-strategy, referral-program, revops, sales-enablement, signup-flow-cro): 10 to 68 SaaS terms each, zero local-business terms. The twelve unlinked today can go from `~/.agents` too (never used in Claude, SaaS copy); `npx skills add` brings any back.

Codex samples (`~/.codex/skills`): delete hatch-pet (924-line demo) and vercel-deploy (creates claimable previews, overlaps deploy-verify); keep the rest, gh-fix-ci and gh-address-comments especially.

claude.ai duplicates to remove: keyword-plan, implement-plan, app-section-review (fix-function's renovation mode, three shared triggers), dev-cleanup (six shared triggers with cleanup), standards-guardian (fires on "ANY development task"; `rules-inject.js` already does this), obsidian-docs (fires "after ANY code change"; the only `.obsidian` folder is graphify output), finish (overlaps cleanup and writes lessons into CLAUDE.md, against the `tasks/lessons.md` rule). Keep the rest; setup-cowork is irrelevant in Claude Code.

## 4. Gaps and candidate skills

The largest gap is the disabled superpowers plugin: brainstorming (215 uses), writing-plans (171), systematic-debugging (68) and subagent-driven-development (63) were the most used skills of all, last used 8 August; gsd (63) and commit-commands (17) are gone too.

1. **brainstorm-and-plan**: design before code, replaces brainstorming plus writing-plans. `npx skills find brainstorming`.
2. **systematic-debugging**: root-cause discipline for "just fix it" requests. `npx skills find debugging`.
3. **ship**: lint, typecheck, test, build, conventional commit, PR body from `pr-and-git-standards.md`; replaces commit-push-pr. `npx skills find commit`.
4. **gsc-review**: the recurring Search Console review with its lessons built in (three gsc-audit docs, four memory notes). `npx skills find search-console`.
5. **supabase-security-audit**: anon grants, `pg_default_acl`, function EXECUTE, views; 56 anon-executable functions still open. `npx skills find rls`.
6. **tracking-verify**: prove GTM, GA4 Measurement Protocol and Meta CAPI events end to end; four incidents. `npx skills find ga4`.
7. **ssot-guard** (project skill in OJ-The-Anchor.pub): pre-flight customer-facing copy against `docs/SSOT.md` and run the drift-guard test. No public equivalent.
8. **paired-repo-change**: website plus management-app changes with the token, live-API and RLS guards learned in August; possibly an implement-plan mode.

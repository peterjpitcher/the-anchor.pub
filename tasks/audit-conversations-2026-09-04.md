# Correction audit, 21 Jul to 4 Sep 2026

Basis: 244 transcripts (209 conversations, 21 projects), 74 feedback memory files, four lessons.md files, and the hooks. Counts are conversations; memory paths are relative to ~/.claude/projects/<project>/memory/.

## Recurring issues, ranked

**1. Stops before the work is done** (covered, recurring). Turns end asking permission or waiting on a background agent: 56 conversations, 15 projects, 21 Jul to 4 Sep; 15 to 37 percent of Not done turns asked permission. "STOP STOPPING, JUST WORK CONTINUOUSLY UNTIL IT'S ALL DONE!" (Cookbook, 22 Jul). Covered: ~/.claude/CLAUDE.md; AMS feedback_work_autonomously.md. Fix: done-status-stop.js blocks a Not done reply containing "want me to", "shall I" or "say the word" with no You need to item; rule: "Run dependent subagents in the foreground; never end a turn waiting on one."

**2. Replies too long or technical** (covered, recurring). 59 conversations, 12 projects, 15 Jul to 4 Sep, falling but never gone. "tldr, always use short plain simple english" (AMS, 30 Jul). Covered: ~/.claude/CLAUDE.md; eight memory files, e.g. AMS feedback_response_style.md. Fix: done-status-stop.js blocks final replies over 250 words unless the prompt asked for a spec, plan, brief or document.

**3. "Done" or "safe" claimed without running the real path** (covered, recurring). 17 conversations, 9 projects, 21 Jul to 31 Aug, plus five half-applied site-wide changes. Worst case: an unrun SMS campaign called safe died after 16 texts. "YOU TOLD ME TO FUCKING SEND IT!!!" (Anchor, 21 Aug). Covered: ~/.claude/CLAUDE.md "Verify before reporting problems"; Anchor feedback_verify_ui_in_browser.md; AMS feedback_sweep_for_siblings_before_shipping.md. Fix rule: "Never say done, fixed or safe unless you ran the user's exact path and quoted what you saw; for cross-cutting changes list files changed and left."

**4. Questions Peter cannot answer as written** (covered, recurring). 27 conversations, 13 projects, 16 Jul to 4 Sep. "tell me in short plain simple english what your question is" (AMS, 4 Sep). Covered: ~/.claude/CLAUDE.md; Cursor feedback_recommend_before_ask.md; the no-buried-questions hook (8 Aug) ended hidden questions but not unclear wording. Fix: done-status-stop.js blocks You need to items lacking "Recommend"; rule: "one plain sentence per question, five at most."

**5. Deploy state left unsaid** (partly covered, recurring). Peter asks whether work is live (9 conversations, 6 projects) and types the finish routine himself (30 conversations, 10 projects, 18 Jul to 19 Aug); AMS shipped without migrations on 27 Aug. "deploy everything if you haven't already" (AMS, 6 Aug). Covered: Cursor/.claude/hooks/deploy-verify.js; AMS feedback_verify_deployments.md. Fix rule: "Every status block states deploy state (live with deployment id, merged only, local) and pending migrations; once approved, build, merge, push, verify and delete the branch unasked."

**6. Acting or causing side effects before a go** (covered, recurring). 17 conversations, 7 projects, 22 Jul to 1 Sep: a backfill launched (Cookbook, 23 Jul), a live menu feed removed (Anchor, 5 Aug), a test that sent a real booking SMS (Anchor, 16 Aug). "I don't want you to run it" (Cookbook, 23 Jul). Covered: Cursor/CLAUDE.md "Do ONLY what is asked"; Barons feedback_scope_discipline.md. Fix rule: "Discovery, review, spec and recommendation requests are read-only; sends, batch runs, live database writes, deploys and feature removals need an explicit yes."

**7. Em dashes at source, causing double replies** (covered, recurring). Em dashes remain in 2 to 4 percent of messages; the Stop hook forced 95 reposts since 16 Aug. "Why do you keep replying twice? What's going on?" (AMS, 16 Aug). Covered: ~/.claude/CLAUDE.md; hooks no-em-dash-write.js and no-em-dash-stop.js. Fix: a UserPromptSubmit hook injecting a one-line no-em-dash reminder each turn; the Stop hook checks every message in the turn.

**8. Facts and contact details drift from the source of truth** (not covered workspace-wide). 14 conversations, 9 projects: stale or invented email addresses in OrangeJelly (16 Jul), Barons (27 Jul) and AMS (6 Aug); wrong Anchor dates and quiz answers. "We don't use privacy as a mailbox, only peter@orangejelly.co.uk" (OrangeJelly, 16 Jul). Covered per project only: OJ-The-Anchor.pub/CLAUDE.md; Barons feedback_ssot_wins_for_emails.md. Fix: Cursor/CLAUDE.md rule "Never invent a contact detail, price, rate, date, opening time or payment term; use the project SSOT or ask", plus a write hook blocking email addresses absent from the SSOT.

**9. Security holes and schema drift caught only by second-opinion review** (not covered). 31 agent-written bug reports, 9 projects: anon grants or RLS gaps in CashBingo (30 Jul), AMS (14 and 27 Aug) and Anchor (27 Aug); schema drift in CashBingo and MixerAI. "grants INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES and TRIGGER to both anon and authenticated" (AMS, 14 Aug). Cursor/.claude/rules/supabase.md never mentions privileges. Fix: rule "After any migration, audit anon and authenticated privileges on tables, views and functions and paste the result; new tables get REVOKE ALL FROM anon", injected by a db-push hook.

**10. Parallel sessions clobbering one checkout** (covered, recurring). 7 conversations, 4 projects, 9 to 27 Aug, including two incidents on 27 Aug. "Wait, I've got another agent making changes on this branch" (Anchor, 12 Aug). Covered: Cursor/.claude/hooks/parallel-git-guard.js; Anchor feedback_shared_checkout_contamination.md. Fix: the guard also denies git commit -a, directory-level git add and branch switches on a dirty tree; rule: "with another session active, use a worktree and commit only files you edited, by name."

## What clearly worked

- done-status-stop.js: only 12 of 1,749 long final replies lacked a status block.
- no-buried-questions-write.js (8 Aug): three complaints before it, none after.
- Numbered questions with recommendations: 197 "1 yes, 2 yes" answers in 112 conversations.
- Deploy verification: final replies quoting a deployment id rose from 8 to 32 across August.

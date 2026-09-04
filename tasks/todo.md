# Workspace standards and context optimisation, 4 September 2026

Owner decisions recorded: unlink the never-used marketing skills; standardise CLAUDE.md and AGENTS.md across every project.

## Done
- [x] Slim the CLAUDE.md chain, path-scope the Supabase rule, move on-demand rules to .claude/docs
- [x] Codex parity: AGENTS.md symlinks, global contract symlink, project_doc_fallback_filenames
- [x] Link personal skills into ~/.agents/skills so Codex sees them
- [x] Diagnose the keyword-plan slash-command question (present in both CLI builds; a stale claude.ai copy competes with it)
- [x] Park 23 unused marketing skills, the design skill and 2 Codex samples (all reversible with mv)
- [x] Audit 209 conversations for repeated corrections, and 1,379 commits across 18 repos for recurring bug classes
- [x] Audit every skill for quality, overlap, stale references and gaps
- [x] Fix the two review-pack scripts that silently dropped four rule files after the move
- [x] Add the no-em-dash Bash hook (14 tests pass) to close the shell-write gap
- [x] Reinstall brainstorming, writing-plans and systematic-debugging; retune descriptions and rewire them to existing skills
- [x] Fold the audit findings into the global and workspace rules
- [x] Standardise 17 of 18 repos

## Remaining
- [ ] OJ-OrangeJelly.co.uk instruction files (agent running)
- [ ] Owner: disable the stale claude.ai duplicate skills
- [ ] Owner: decide on the prevention work the commit audit proposes (fail-closed tests, anon allowlist tests, dateUtils rollout)

## Not touched
- OJ-Planner: dormant since March 2026, left without instruction files.
- SSOT.json shows an uncommitted WhatPub link change from another session at 19:28, not from this work.

# Lessons

Corrections from the owner, recorded so the same mistake is not repeated. Review at session start.

## 2026-08-08: Questions belong in chat, never in files

**What happened:** Agents wrote "Open questions for the owner" sections into tasks/*.md documents (e.g. book-table-flow-simplification-spec §10, event-ads-conversion-discovery §10) and expected the owner to find and answer them there. He had to say "just tell me what changes you want and I'll approve them in one go" twice (29 Jul, 8 Aug).

**Rule:** Every open question goes in the chat reply itself, numbered, one sentence, with a recommendation on the same line. Files record decisions after they are made. Before ending a turn, scan every document produced this turn (including subagent output) and lift any open questions into the reply. Batch approval requests into one list.

This rule is also in ~/.claude/CLAUDE.md (applies to every project) and in project memory.

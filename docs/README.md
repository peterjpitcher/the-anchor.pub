# The Anchor Documentation Set

This folder now holds the pared-down set of documents that still matter for the live codebase. Each file is focused on helping you deploy, operate, or extend the Next.js project at commit `a5e2155`.

## How to Use This Folder

- Start with the summaries below to jump to the right guide.
- Keep the content accurate when you change behaviour in code (deployment, APIs, copy, styling, or asset workflows).
- If a topic is no longer true, update or delete the corresponding document straight away.

## Document Index

- `deployment.md` – Vercel-focused deployment checklist and CLI commands.
- `domain-migration.md` / `domain-migration-safe-email.md` – DNS handover steps, with and without email preservation.
- `api-integration.md` – OrangeJelly management API architecture, auth rules, and core endpoints used by the app.
- `parking-api.md` – Parking subsystem contract that underpins `/api/parking/*`.
- `copy-assumptions.md` – Source of truth for operational claims referenced in site content.
- `image-optimization.md` – Workflow for the image optimiser script and bundle guardrails.
- `style-guide.md` – Front-end colour and component rules that protect accessibility and brand consistency.
- `google-places.md` – Legacy Google Places / reviews notes (integration removed).

## Maintenance Expectations

- Update documents in the same PR as the code change they describe.
- Treat missing or incorrect documentation as a bug—open an issue if you cannot fix it immediately.
- Run periodic spot checks on deployment, API, and asset workflows; note any deviations here.

For repository-wide onboarding, architecture, and local development setup, refer to the root `README.md`.

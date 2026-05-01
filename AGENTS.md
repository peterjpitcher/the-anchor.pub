# Repository Guidelines

## Project Structure & Module Organization
Next.js routes live in `app/` (for example `app/booking-confirmation`). Shared UI sits in `components/`, domain helpers in `lib/`, and reusable hooks in `hooks/`. Content updates belong in `content/`, long-form docs in `docs/`, static assets in `public/`, and automation scripts in `scripts/`.

## Build, Test, and Development Commands
- `npm run dev`: Start the Next.js dev server with current ISR settings.
- `npm run build`: Compile the production bundle with TypeScript checks.
- `npm run start`: Serve the compiled build locally for smoke testing.
- `npm run lint`: Run the Next.js ESLint preset.
- `npm run test` / `npm run test:watch` / `npm run test:coverage`: Execute Jest suites once, watch for changes, or report coverage.
- `npm run optimize:images`: Preprocess static assets via `scripts/optimize-images.js` before committing.

## Coding Style & Naming Conventions
Use TypeScript with two-space indentation, named exports, and the `@/` absolute import alias. Favor server components in `app/` unless hooks or browser APIs are required, and group Tailwind classes by layout → spacing → color. Run `npm run lint` before PRs; component files follow `PascalCase.tsx`, utilities use `camelCase.ts`.

## Testing Guidelines
Jest plus React Testing Library cover unit and integration cases. Place UI specs in `tests/unit` and API/data suites in `tests/api`, naming files `*.test.ts[x]`. Mock external calls with helpers from `lib/`, rely on RTL `render`, and verify coverage with `npm run test:coverage` when touching public APIs or analytics flows.

## Commit & Pull Request Guidelines
Use the conventional commit prefixes already in history (`feat`, `fix`, `chore`, etc.) and keep subjects under 72 characters. In PRs, describe user impact, list manual or automated tests (`npm run test`), attach screenshots for visual changes, and link Linear/GitHub issues or call out follow-ups.

## Content & Asset Workflow
Edit Markdown or JSON copy in `content/`, keeping front matter keys stable for sorting and sitemap jobs. Store new docs in `docs/` and static files in `public/`. Before committing imagery run `npm run optimize:images` and mention any large or animated assets in the PR.

## Customer-Facing Copy Style
Do not use em dashes in customer-facing text. Prefer commas, short sentences, or parentheses where needed.

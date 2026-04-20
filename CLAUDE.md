# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Public-facing web presence for **FutScore**, a soccer player/scout platform. Shows athlete profiles, match history, and video feeds sourced from a separate backend API. UI copy is in **Portuguese (pt-BR)**.

## AI scaffolding — read first

Before starting any non-trivial work, read the files under `ai/`:

- `ai/context/project-context.md` — what exists, what's being built (admin area), backend URL
- `ai/context/coding-styles.md` — TS / React / Tailwind / shadcn conventions in use
- `ai/rules/ai-behavior.md` — when to ask, when to stop, how to commit
- `ai/rules/architecture.md` — route groups, data flow, auth strategy
- `ai/rules/file-naming.md` and `ai/rules/import-rules.md` — naming and imports
- `ai/tasks/` — one brief per non-trivial task (`YYYY-MM-DD-<slug>.md`)

## Commands

```bash
npm run dev     # Turbopack dev server (http://localhost:3000)
npm run build   # Turbopack production build
npm start       # Serve production build
npm run lint    # eslint (uses eslint-config-next, flat config in eslint.config.mjs)
```

No test runner is configured.

## Stack

- **Next.js 16** (App Router, RSC, Turbopack for both dev and build)
- **React 19** / **TypeScript** (strict, `@/*` alias → repo root)
- **Tailwind CSS v4** (PostCSS-only config — no `tailwind.config.*`; theme lives in `app/globals.css` via `@theme`)
- **shadcn/ui** — style `new-york`, base color `neutral`, RSC enabled. Add components with `npx shadcn@latest add <component>`. Aliases in `components.json`: `@/components`, `@/components/ui`, `@/lib/utils`.
- **lucide-react** for icons

## Architecture

### Data flow

The backend is **external** — no local DB, no API routes, no auth on this site. Everything is fetched server-side from:

```
https://futscout-api.onrender.com/api
```

The base URL is hardcoded as `API_URL` inside page files (e.g. `app/players/[nickname]/page.tsx`). There is no `.env` config. If you need a new page, follow the existing pattern: `fetch(...)` in an `async` Server Component with `{ next: { revalidate: 60 } }` for ISR.

Endpoints in use:
- `GET /public/athletes` — list (supports `search`, `nickname`, `position` query params)
- `GET /public/athletes/:id` — detail by UUID

Response shapes live in `lib/types.ts` (`Athlete`, `AthletesResponse`, `AthleteDetailResponse`, `Match`, `VideoPlay`, plus the domain enums like `Position`, `PlayType`, `MatchResult`).

### Route structure

```
app/
  page.tsx                      # Marketing home (app store CTAs)
  players/[nickname]/page.tsx   # Athlete detail — PRIMARY route
  athletes/[nickname]/          # Legacy path — only has not-found.tsx
  delete-account/page.tsx       # Static (required by app stores)
  privacy-policy/page.tsx       # Static
```

**Nickname param is dual-mode.** `getAthleteByNickname` in `app/players/[nickname]/page.tsx` tests the param against a UUID regex: if it's a UUID, it hits `/public/athletes/:id` directly; otherwise it searches `/public/athletes?nickname=…`, finds the match, then fetches by id. Preserve this two-step lookup when modifying the detail page.

### Components

- `components/header.tsx` and `components/scroll-to-top.tsx` — shared chrome
- `components/player/` — profile-specific blocks (`player-field-position`, `player-stats-card`)
- `components/matches/` — match rendering
- `components/ui/` — shadcn primitives (button, card, avatar, badge, dialog, select, etc.)

### Styling conventions

- Dark mode is **forced**: `<html lang="pt-BR" className="dark">` in `app/layout.tsx`. Don't add a theme toggle without coordinating.
- Primary color is green; stat/header cards use `bg-linear-to-br from-primary/…` gradients — match this pattern when adding cards on the profile page.

### Images

`next.config.ts` whitelists only `pub-0dfa82468e274a9cb1498740d1ce6c91.r2.dev` (Cloudflare R2) for `next/image`. Add new hosts to `remotePatterns` before using them.

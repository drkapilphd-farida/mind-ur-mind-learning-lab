# Production Handoff — AI Learning Studio™ Sprint ALS-1: Foundation

## Status: COMPLETE. QSR, Memory Mode, Smart Notes, AI Mentor, the Shared Learning Runtime, and the real Dashboard untouched.

## Naming collision resolved before writing any code

Two things were already branded "AI Learning Studio™" in this repo:

1. **`/preview/*`** — the whole shell (per `docs/adr/0001-ai-learning-studio-domain-model.md`), covering Dashboard, Learning Projects, QSR/Memory/Smart Notes/AI Mentor session routes, etc.
2. **`/preview/learning-studio`** — one specific route inside that shell: a nav-linked ("AI Learning Studio", `Sparkles` icon) Sprint-0 hub page rendering a static six-tile module catalog, five of the six being literal `ModulePlaceholder` "Coming soon" stubs.

The brief's checklist — home route, existing-project detection, resume entry point, "Start New Learning Project" CTA, empty state — is what `/preview/learning-studio` itself was missing, and is also almost exactly what `/preview/dashboard` (already real, from an earlier sprint) already implements. Founder confirmed via `AskUserQuestion`: **rebuild `/preview/learning-studio` in place** as the real production hub, reusing the same data/components `/preview/dashboard` already ships — not a second copy of the same logic, and not a new route namespace.

## Scope

Only the production shell — no Upload Experience, no Universal Content Engine, no Learning Blueprint, no Workspace. Those are explicitly future sprints.

## What was built

### `src/features/ai-learning-studio/` (new feature folder — the permanent foundation)

```
types/StudioHomeViewState.ts
queries/selectResumeProject.ts (+ .test.ts)
queries/getStudioHomeViewState.ts
components/StudioHome.tsx
components/index.ts        ← client-safe sub-barrel
index.ts                   ← root barrel
```

- **`StudioHomeViewState`** — the "Studio state architecture" the brief asked for: a two-member discriminated union, `{kind:'empty'} | {kind:'active', projects, resumeProject}`. Every future Learning Studio sprint extends this component/state rather than re-deriving it.
- **`selectResumeProject`** — pure function, the "resume learning entry point" decision: most-recently-updated project among `status === 'active'` only (a completed/archived project is never offered as the resume target). Unit-tested (4 cases: zero projects, all completed/archived, order-independent most-recent selection, completed-project-with-a-later-timestamp correctly ignored).
- **`getStudioHomeViewState(userId)`** — the one server read the route needs, composed directly from `listLearningProjects` (`@/api/learning`) — the exact same call `/preview/dashboard` already makes. No second data-access implementation.
- **`StudioHome`** — the presentational shell: empty state renders `LearningProjectsEmptyState` (the same "whole page is the empty state" component Dashboard uses, not a smaller one); active state renders a "Continue Learning" resume card, a "Your Learning Projects" grid, and a "Start New Learning Project" CTA — all built on the existing `ProjectCard` component. Deliberately lighter than Dashboard (no greeting/stats) — this route's one job is getting the learner into a project, resumed or new.
- **Client-safe `components/index.ts` sub-barrel** — added proactively, mirroring `learning-mode-runtime/components`'s established convention, since the root barrel also exports the server-only `getStudioHomeViewState` (a Server Action-adjacent async function using `next/headers` transitively via Supabase's server client). No client component in this feature needs it yet, but the split exists from Sprint-1 so a future sprint can't reintroduce the exact client-bundle leak Memory Sprint-2 hit.

### `src/app/preview/learning-studio/page.tsx` — rewritten

Was: a static `LEARNING_STUDIO_MODULES.map(...)` grid (Sprint-0 mock). Now: an async Server Component — auth-check (mirrors `/preview/dashboard`'s own pattern exactly: `createClient()` → `auth.getUser()` → bail to `<div />` if absent, since the `/preview` layout already redirects unauthenticated requests) → `getStudioHomeViewState(user.id)` → `<StudioHome viewState={viewState} />`. No business logic in the route file itself.

### `src/app/preview/learning-studio/loading.tsx` — new

`LoadingCard` skeleton blocks matching `StudioHome`'s own active-state section rhythm (header / continue-learning card / projects grid / CTA) — the same skeleton-not-spinner convention every other Learning Mode's Sprint-5 established, applied here from Sprint-1 since this route now does a real data fetch.

### Error boundary — reused, not rebuilt

`src/app/preview/error.tsx` (shared across every `/preview/*` route) already logs as `'AI Learning Studio route error'` and needed no changes — confirmed as-is, not modified.

### Navigation — confirmed correct, zero changes

`src/app/preview/navConfig.ts`'s `PREVIEW_NAV_ITEMS` already points `"AI Learning Studio"` (Sparkles icon) at `/preview/learning-studio`. No nav file was touched.

## What was deliberately left in place, untouched

- `src/app/preview/learning-studio/navConfig.ts` (`LEARNING_STUDIO_MODULES`) and its five `ModulePlaceholder` sub-routes (`ai-mentor/`, `blueprint/`, `memory-intelligence/`, `research/`, `revision/`) plus the disclosed-mock `quantum-speed-reading/` sub-route — no longer linked from the home page, but not deleted. They remain reachable by direct URL. A future sprint (Learning Blueprint, etc.) decides whether to reuse, rewire, or retire them — not this one.
- `/preview/dashboard/page.tsx`, `ProjectCard.tsx`, `LearningProjectsEmptyState.tsx` — read and reused, never edited.
- QSR, Memory Mode, Smart Notes, AI Mentor, the Shared Learning Runtime, `src/core/`, `/preview/workspace` (still its own separate `ModulePlaceholder`) — zero changes.

## Verification Results

- `npx tsc --noEmit` — clean. (One real error caught and fixed during development: `StudioHomeViewState.projects` was declared as mutable `LearningProject[]` while `listLearningProjects` returns `readonly LearningProject[]`; widened the type rather than copying the array.)
- `npx eslint src/features/ai-learning-studio src/app/preview/learning-studio` — clean.
- `npx vitest run` (whole repo) — **631 test files, 3885 tests passed** — up from AI Mentor Sprint-5's 630/3881 by exactly one new file and four new tests (`selectResumeProject.test.ts`), proving zero regression anywhere else.
- `npm run build` — compiled successfully, 113 static/dynamic routes (same count as the prior build). `/preview/learning-studio` grew from 822 B to 1.01 kB — the real `StudioHome`/`ProjectCard`/`LearningProjectsEmptyState` markup replacing the static tile grid. Every other route's bundle size is byte-identical to the reference build log from AI Mentor Sprint-5, including `/preview/dashboard` (1.01 kB, unchanged) and `/preview/ai-mentor` (8.98 kB, unchanged) — confirmed by direct comparison, not just inspection.

## Locked Decisions

1. `/preview/learning-studio` is rebuilt in place as the real Studio home — not moved to a new route, not left as a second copy of Dashboard logic. Founder-confirmed via `AskUserQuestion`.
2. The Studio home and the Dashboard intentionally share data source and components (`listLearningProjects`, `ProjectCard`, `LearningProjectsEmptyState`) but not page composition — Dashboard keeps its greeting/stats emphasis, Studio is purely the resume/start-new entry point.
3. A project only qualifies as a resume target while `status === 'active'` — completed/archived projects are never surfaced as "Continue Learning," regardless of recency.
4. The five placeholder module routes and their local `navConfig.ts` are intentionally not deleted this sprint — an explicit, disclosed, reversible choice, not an oversight.

## Future Extension Points (not implemented)

- Upload Experience (the real "drag a document in" entry point beyond the existing `/preview/learning-projects/new` wizard link)
- Universal Content Engine™ integration on this route
- Learning Blueprint™ preview/summary card on the Studio home
- Workspace™ (currently its own separate placeholder at `/preview/workspace`)
- Deciding the fate of the five orphaned placeholder module routes

## Stop

No further AI Learning Studio sprint begins here without explicit approval.

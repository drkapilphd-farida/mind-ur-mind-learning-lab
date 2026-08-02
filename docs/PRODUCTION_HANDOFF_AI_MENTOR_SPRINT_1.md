# Production Handoff — AI Mentor™ Sprint-1: Foundation

## Status: COMPLETE. QSR, Memory Mode, Smart Notes, and the Shared Learning Runtime untouched.

## Pre-work audit: two disconnected universes of existing "AI Mentor" code

Before writing anything, a full repo audit was run for existing AI Mentor infrastructure, since
"reuse architecture, no duplicate business logic" required knowing what already existed.

**Finding:** two entirely separate, mutually incompatible bodies of code already claim the name:

1. **Eight mock packages** — `src/features/ai-mentor/`, `ai-mentor-orchestrator/`,
   `ai-mentor-personalization-bridge/`, `ai-mentor-prompt-assembler/`, `ai-mentor-provider-bridge/`,
   `ai-mentor-response-composer/`, `mentor-conversation-engine/`, and
   `ai-intelligence-layer/mentorPersona/` (~314 files). Every one is self-described in its own header
   comments as "fully self-contained," "no real LLM calls," or "reserves the shape only." Zero
   Supabase imports anywhere across all eight (confirmed by repo-wide grep). Not wired into any real
   route. Two of them even define separate, incompatible `ConversationSession`/`ConversationTurn`
   type shapes that don't interoperate with each other.
2. **One real, working Anthropic integration** — `src/lib/ai/generateMentorMessage.ts`, a stateless,
   non-streaming, one-shot dashboard pep-talk generator already rendered on the real `/dashboard`
   page, with a real fallback path for a missing API key and real tone/vocabulary rules matching
   `PROJECT_RULES.md` §6.

Flagged to the founder before writing code: adopting package (1)'s contracts wholesale would mean
building on dead, unpersisted scaffolding. **Decision: disregard the eight mock packages entirely,
same precedent as the disconnected legacy QSR track — disclosed, left untouched, not built upon.**
Sprint-1 builds a genuinely new, real foundation.

## A second real finding: AI Mentor does not fit the chunk-based Learning Mode architecture

`LearningModeType` (LSE-1) reserves an `'ai-mentor'` slot, but the load-bearing type underneath it —
`SessionType` (ULO) — does not include `'ai-mentor'` at all, and `SessionSnapshot`/
`LearningModeCapabilities` require `documentId`/`uloId`/`strategy`/`completedChunkIds` — every field
assumes a document being read chunk-by-chunk. AI Mentor has no document of its own; its entire
purpose (confirmed with the founder) is to **consume** Reading/Memory/Smart Notes' own real data as
read-only input, not to be a fourth chunk-navigated Learning Mode. Forcing it into
`LearningModeRegistry`/`LearningMode` would mean inventing a fake `SessionType`/`ChunkStrategy` that
reflects nothing real — exactly the "redesign" this sprint's own rules forbid.

**Decision, confirmed with the founder:** AI Mentor gets its own real, minimal, learner-scoped session
concept — not document/chunk-scoped, not registered in the chunk-based Learning Mode registry.

## Minimal schema, disclosed before implementation

```sql
CREATE TABLE public.mentor_sessions (
  id, user_id, status ('active'|'ended'), started_at, ended_at, created_at, updated_at
);
```

`supabase/migrations/20260718000003_create_mentor_sessions.sql` — RLS scoped to
`auth.uid() = user_id` (select/insert/update), mirroring `learning_sessions`'/`smart_notes`' own
policy pattern exactly. No conversation-turn table yet — "no conversational AI features yet" means
there is nothing real to persist per-turn this sprint. `src/lib/supabase/types.ts` gained a
hand-added `mentor_sessions` entry in its correct alphabetical position, matching the same
disclosed "hand-added, not regenerated" convention already used for `universal_learning_objects`
and `smart_notes`.

## Part 1 — Session lifecycle (persistence + Server Actions)

```
src/features/ai-mentor-runtime/
  types/
    MentorSession.ts            id, learnerId, status, startedAt, endedAt
    MentorSessionContext.ts     the real cross-module aggregation (below)
  persistence/
    mentorSessionRecord.ts      real row ↔ real domain type mapping
    createMentorSession.ts
    endMentorSession.ts
    findActiveMentorSession.ts
  actions/
    startMentorSession.ts
    endMentorSession.ts
    getActiveMentorSession.ts
    getMentorSessionContext.ts
```

Every persistence function mirrors the established shape (`loadSmartNote.ts`/`saveSmartNote.ts`):
real Supabase query, `logger.error` on failure, honest `null` for "nothing found" rather than
throwing. Every Server Action mirrors the established Zod-validated, auth-checked boundary every
other action in this codebase already follows. `getMentorSessionContext` requires a real, active,
caller-owned session before returning context — context is real input *into* a session, not
computed independently of one.

## Part 2 — Runtime integration (the actual point of this module)

```
src/features/ai-mentor-runtime/context/buildMentorSessionContext.ts
```

A real, read-only aggregation across every other real Learning Mode:

- **Reading** — `createSupabaseSessionPersistenceAdapter(supabase, learnerId, 'reading')` (Shared
  Learning Runtime, unmodified), a real completed-session count. QSR's real Sprint-1–3 track never
  built an Adaptive Intelligence layer, so there's no `computeReadingLearningProfile` to reuse — the
  count is derived honestly and directly, no business logic invented.
- **Memory** — `computeMemoryLearningProfile` (Memory Mode's own real Sprint-3 function), imported
  directly.
- **Smart Notes** — `computeSmartNotesLearningProfile` + `countSmartNotesWithContent` (Smart Notes'
  own real Sprint-3 functions), imported directly.
- **Learning Projects** — `listLearningProjects` (`@/api/learning`, already used by the real
  `/preview/dashboard` page).

This is the one place in the codebase where importing across Learning Mode feature boundaries is
the intended design, not accidental coupling — AI Mentor's entire reason to exist is consuming the
others' real data, per this sprint's own requirement #3. No new business logic was written for
Memory or Smart Notes; only Reading's own simple completed-count is new, and it's the smallest
possible honest derivation from data the Shared Learning Runtime already returns.

## Part 3 — Routing + minimal workspace

```
src/app/preview/ai-mentor/page.tsx
src/features/ai-mentor-runtime/components/AiMentorWorkspace.tsx
```

`/preview/ai-mentor` is a flat, learner-scoped route (no `[id]` — AI Mentor has no document). Same
auth pattern as every other `/preview/*` route. The pre-existing
`/preview/learning-studio/ai-mentor` mock placeholder was left untouched — it belongs to the
separate "AI Learning Studio™" mock catalog QSR's and Memory's own real routes have never touched
either.

`AiMentorWorkspace.tsx` is deliberately undecorated (no card treatment, no animation) — the same
restraint every other Learning Mode's own Sprint-1 workspace started with. It proves the real
session lifecycle (start → load context → end) end to end with a plain `<dl>` of the real context
figures. No conversational UI, no coaching copy, no AI-generated text, no recommendations — all
explicitly out of this sprint's scope.

## Verification Results

- `npx tsc --noEmit` — clean, zero errors on the first pass.
- `npx eslint` scoped to `src/features/ai-mentor-runtime`, the new route, and `src/lib/supabase/
  types.ts` — clean.
- `npx vitest run` (whole repo) — **627 test files, 3869 tests passed — identical counts to Smart
  Notes Sprint-5**, zero regressions. No new test files this sprint — the new persistence functions
  are I/O-touching (same untested-at-the-unit-level convention as `loadSmartNote`/`saveSmartNote`),
  and the workspace component follows this codebase's established no-jsdom convention.
- `npm run build` — compiled successfully, all real routes generated (`/preview/ai-mentor` joins at
  3.91 kB). Every other route's bundle size is byte-identical to Smart Notes Sprint-5 — the
  strongest possible confirmation this sprint changed nothing in QSR, Memory Mode, Smart Notes, or
  the Shared Learning Runtime.
- Manual check: dev server started; `/preview/ai-mentor` and `/preview/learning-projects/test-id/
  read` both return a clean `307` to `/login` for an unauthenticated request, with no server error.

## Scope Check

- Zero changes to QSR, Memory Mode, Smart Notes, or the Shared Learning Runtime — confirmed via
  filesystem timestamps and every existing route's byte-identical build output.
- Zero changes to `src/core/` — AI Mentor was deliberately not registered as a `LearningMode`; no
  edit to `learning-mode-integration`, `learning-session-engine`, or any locked engine layer.
- One new, minimal, disclosed, additive database migration — no existing table touched.
- Zero conversational AI, zero coaching UI, zero recommendation generation — none were implemented.
- Zero duplicate business logic — Memory's and Smart Notes' own real intelligence functions are
  imported directly, never re-derived.

## Remaining Roadmap

Per the brief's explicit stop instruction, AI Mentor Sprint-2 does not begin here. The real, open
question for a future sprint: whether the actual conversational layer is built fresh (reusing only
`generateMentorMessage.ts`'s prompt/fallback pattern and `ai-tutor`'s Server Action + Zod boundary
pattern, per this sprint's own recommendation) or whether any part of the eight mock packages is
worth revisiting — this sprint's own assessment is that they shouldn't be, but that remains the
founder's call to make explicitly before Sprint-2 begins.

# Production Handoff — AI Mentor™ Sprint-4: Session History

## Status: COMPLETE. QSR, Memory Mode, Smart Notes, and the Shared Learning Runtime untouched.

## Scope, confirmed before writing code

As with Sprint-2/3, no specific goal was named. AI Mentor's own trajectory doesn't map cleanly onto
the other modules' cadence, so it was confirmed directly rather than assumed: **Session History** —
a real list of the learner's past (ended) mentor sessions, each showing when it happened and its
real turn count. The alternative offered was real integration into the existing `/dashboard` page's
`AIMentorCTA`/`AIMentorSection` — deferred as a separate, larger decision touching a real production
page outside this feature's own boundary, not bundled into this sprint without being asked.

## Part 1 — Real persistence (two new, single-query, non-N+1 reads)

```
src/features/ai-mentor-runtime/persistence/
  listMentorSessions.ts                  every real session (active or ended) for a learner
  countMentorConversationTurnsBySession.ts  one real query, grouped in memory into per-session counts
```

`listMentorSessions` mirrors the `listByLearner` shape every other Learning Mode's own persistence
adapter already provides, applied to AI Mentor's own dedicated `mentor_sessions` table (which,
per Sprint-1's own architectural finding, doesn't go through the chunk-based
`SessionPersistenceAdapter`). `countMentorConversationTurnsBySession` fetches every real turn
belonging to the learner in one query and groups it client-side into a real per-session count —
deliberately not one query per session, avoiding an N+1 pattern for what could be a real, growing
history.

## Part 2 — Composition

```
src/features/ai-mentor-runtime/
  types/MentorSessionHistoryEntry.ts
  context/buildMentorSessionHistory.ts
  actions/getMentorSessionHistory.ts
```

`buildMentorSessionHistory` composes the two real queries above into the one real shape both
`page.tsx` (server-rendered initial load) and the Server Action need — the same "one real composer,
two real callers" pattern `buildMentorSessionContext` already established in Sprint-1. Each entry is
a real structural fact only (id, status, start/end timestamps, turn count) — never a content
preview of what was actually said, the same "structural fact, not content" discipline
Sprint-3's recommendations already follow.

## Part 3 — Additive wiring (two Sprint-1 files)

- **`page.tsx`** — fetches `buildMentorSessionHistory` in parallel with the existing active-session
  check (genuinely independent real queries, same "no false dependency" discipline the Smart Notes
  route established), passes it as a new `initialSessionHistory` prop.
- **`AiMentorWorkspace.tsx`** — `sessionHistory` state seeded from that prop, rendered as a real list
  in the no-session view (where "here's your history — start a new one?" is the natural question).
  Refreshed via `getMentorSessionHistory` right after a session ends, so the newly-ended session
  appears in the list immediately rather than only after a full page reload. The existing
  active-session view (chat, context, recommendations) is unchanged.

## Verification Results

- `npx tsc --noEmit` — clean.
- `npx eslint` scoped to `src/features/ai-mentor-runtime` and the route — clean.
- `npx vitest run` (whole repo) — **630 test files, 3881 tests passed — identical counts to
  Sprint-3**, zero regressions. No new test files this sprint — every new function is I/O-touching
  (real Supabase queries and composition), the same untested-at-the-unit-level convention this
  codebase already applies to `loadSmartNote`/`saveSmartNote`/`createMentorSession` and their
  siblings.
- `npm run build` — compiled successfully. `/preview/ai-mentor` grew from 4.59 kB to 4.75 kB (the
  real session-history UI). Every other route's bundle size is byte-identical to Sprint-3.
- Manual check: dev server started; `/preview/ai-mentor` and `/preview/learning-projects/test-id/
  read` both return a clean `307` to `/login` for an unauthenticated request, with no server error.

## Scope Check

- Zero changes to QSR, Memory Mode, Smart Notes, or the Shared Learning Runtime — confirmed via
  filesystem timestamps and every existing route's byte-identical build output.
- Zero changes to `src/core/`.
- Zero database migration this sprint — `mentor_sessions`/`mentor_conversation_turns` (Sprint-1/2)
  already carry everything this sprint reads.
- Zero mock data, zero placeholder logic — every entry is a real row, every count a real aggregate.
- Two Sprint-1 files extended additively (disclosed above); Sprint-2's and Sprint-3's own files are
  unchanged.
- The real `/dashboard` page (`AIMentorCTA`/`AIMentorSection`) was not touched — that integration
  was explicitly deferred rather than assumed in scope.

## Remaining Roadmap

Per the brief's explicit stop instruction, AI Mentor Sprint-5 does not begin here.

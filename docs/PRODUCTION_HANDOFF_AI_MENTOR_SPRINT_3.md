# Production Handoff — AI Mentor™ Sprint-3: Recommendations & Proactive Insights

## Status: COMPLETE. QSR, Memory Mode, Smart Notes, and the Shared Learning Runtime untouched.

## Scope, confirmed before writing code

As with Sprint-2, this sprint's own instructions carried general rules but no specific goal.
AI Mentor's own trajectory has diverged from the other three modules (it went straight from
foundation to a real conversation, skipping a presentation-only phase), so the natural next step
wasn't inferable the way it was for Smart Notes' own Sprint-3/4. Confirmed: **lift Sprint-1's own
"no recommendations generation yet" exclusion** — real, deterministic recommendations derived from
`MentorSessionContext`, surfaced alongside the chat, never LLM-generated.

## Additive, disclosed extension of two Sprint-1 files

Meaningful recommendations ("it's been a while since your last Reading session") need a real
last-activity signal that `MentorSessionContext` didn't carry — only aggregate counts. Rather than
build a second, duplicate data-fetching path (re-querying session snapshots
`buildMentorSessionContext` already fetches), `MentorSessionContext` and
`buildMentorSessionContext.ts` (both Sprint-1) were extended **additively**:

- **`MentorSessionContext.ts`** — three new fields: `daysSinceLastReadingSession`,
  `daysSinceLastMemorySession`, `daysSinceLastSmartNotesSession` (each `number | null`, honestly
  `null` when a learner has no sessions of that mode yet).
- **`buildMentorSessionContext.ts`** — computes these from the same real snapshot arrays it already
  fetches (no second query), via a new pure helper (below).

This is the same "widen additively, disclose clearly" pattern Smart Notes Sprint-3 used for
`SessionType` — not a redesign, since every existing field/consumer is unchanged and the function's
existing behavior for callers that ignore the new fields is identical. One direct, mechanical
consequence: `buildMentorSystemPrompt.test.ts`'s fixture object needed the three new required
fields added to stay valid — no assertion or behavior in that test changed.

## Part 1 — Real last-activity signal

```
src/features/ai-mentor-runtime/context/computeDaysSinceLastSession.ts (+test)
```

Pure, with an injectable clock (matching LSE-2's own `{ now }` convention). Real elapsed whole days
since the most recent session's own `capturedAt` — `null`, honestly, for zero sessions.

## Part 2 — Real, deterministic recommendations

```
src/features/ai-mentor-runtime/
  types/MentorRecommendation.ts
  recommendations/recommendMentorFocus.ts (+test)
  actions/getMentorRecommendations.ts
```

`recommendMentorFocus` is pure, threshold-based logic over `MentorSessionContext`'s own real
fields — mirroring the same "real signals, disclosed thresholds, never a content judgment"
discipline Memory's and Smart Notes' own insight generation already follow. Six real rules this
sprint: recommend starting a mode with zero sessions; recommend resuming a mode inactive for 5+
days (disclosed threshold); recommend saving notes when Smart Notes sessions exist but no document
has saved content. No AI call anywhere in this path — `getMentorRecommendations` (mirroring
`getMentorSessionContext`'s ownership-check pattern exactly) composes `buildMentorSessionContext`
+ `recommendMentorFocus`, nothing else.

**`buildMentorSystemPrompt.ts` (Sprint-2) was deliberately not touched** — recommendations are
surfaced as their own, separate element in the workspace, not woven into the chat's system prompt.
Folding them in would have changed Sprint-2's own prompt behavior for existing conversations,
beyond this sprint's own scope.

## Part 3 — Workspace (additive edit)

`AiMentorWorkspace.tsx` now loads recommendations proactively on mount, alongside conversation
history (a recommendation gated behind a button isn't really proactive), and renders them as a
plain list above the chat. The existing start/end-session, context-loading, and chat controls are
unchanged.

## Verification Results

- `npx tsc --noEmit` — clean.
- `npx eslint` scoped to `src/features/ai-mentor-runtime` — clean.
- `npx vitest run` (whole repo) — **630 test files, 3881 tests passed** (2 new test files, 9 new
  tests: 3 for `computeDaysSinceLastSession`, 6 for `recommendMentorFocus`, covering the disclosed
  inactivity threshold boundary and the "notes without sessions" vs. "sessions without notes"
  distinction), zero regressions against Sprint-2's 628/3872 baseline.
- `npm run build` — compiled successfully. `/preview/ai-mentor` grew from 4.45 kB to 4.59 kB (the
  real recommendations UI). Every other route's bundle size is byte-identical to Sprint-2.
- Manual check: dev server started; `/preview/ai-mentor` and `/preview/learning-projects/test-id/
  read` both return a clean `307` to `/login` for an unauthenticated request, with no server error.

## Scope Check

- Zero changes to QSR, Memory Mode, Smart Notes, or the Shared Learning Runtime — confirmed via
  filesystem timestamps and every existing route's byte-identical build output.
- Zero changes to `src/core/`.
- Zero database migration this sprint.
- Zero mock data, zero placeholder logic — every recommendation is real, threshold-based,
  deterministic; nothing LLM-generated.
- Two Sprint-1 files extended additively (disclosed above); Sprint-2's own `buildMentorSystemPrompt.ts`
  and every existing action/persistence file are unchanged.

## Remaining Roadmap

Per the brief's explicit stop instruction, AI Mentor Sprint-4 does not begin here.

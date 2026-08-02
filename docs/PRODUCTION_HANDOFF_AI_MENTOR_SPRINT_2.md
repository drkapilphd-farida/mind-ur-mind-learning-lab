# Production Handoff — AI Mentor™ Sprint-2: The First Real Conversation Turn

## Status: COMPLETE. QSR, Memory Mode, Smart Notes, and the Shared Learning Runtime untouched.

## Scope, confirmed before writing code

Sprint-1's own handoff flagged an open question: whether real conversational AI was in scope yet.
Sprint-2's rules notably did not repeat Sprint-1's "no conversational AI / no coaching UI / no
recommendations" exclusions — a real signal, but confirmed explicitly rather than assumed, given
"no mock data or placeholder implementations" raised the stakes of guessing wrong. Confirmed:

1. Real conversational AI is in scope — an actual Anthropic call, reusing
   `generateMentorMessage.ts`'s tone/fallback pattern and `ai-tutor`'s Server Action pattern, with
   Sprint-1's own `MentorSessionContext` folded into the system prompt.
2. Turns are persisted server-side in a new table, not held client-side — a learner can leave and
   resume a real conversation.

## Minimal, disclosed schema

```sql
CREATE TABLE public.mentor_conversation_turns (
  id, mentor_session_id, user_id, role ('mentor'|'learner'), content, created_at
);
```

`supabase/migrations/20260718000004_create_mentor_conversation_turns.sql` — `user_id` is
denormalized (not derived via a join through `mentor_session_id`) so RLS stays a simple, direct
`auth.uid() = user_id` check, the same convention `learning_sessions`/`smart_notes`/`mentor_sessions`
already use. Insert-only — no update/delete policy, since a real conversation turn, once sent, is
never edited or retracted (the same "observation-only" shape distinguishing `*_discovery_sessions`
from mutable session rows in `learning_sessions`'s own migration comment). `src/lib/supabase/types.ts`
gained a hand-added entry in its correct alphabetical position, matching the same disclosed
convention as every prior hand-added table.

## Part 1 — Real persistence

```
src/features/ai-mentor-runtime/
  types/MentorConversationTurn.ts
  persistence/
    mentorConversationTurnRecord.ts
    createMentorConversationTurn.ts
    listMentorConversationTurns.ts
```

Mirrors the established persistence shape exactly (`loadSmartNote.ts`/`saveSmartNote.ts`): real
Supabase query, `logger.error` on failure, honest empty/`null` results rather than throwing.

## Part 2 — The real Anthropic integration

```
src/features/ai-mentor-runtime/ai/
  buildMentorSystemPrompt.ts (+test)   pure — folds the real MentorSessionContext into the system prompt
  generateMentorReply.ts               real Anthropic call + honest fallback
```

`buildMentorSystemPrompt` is pure and tested — it mirrors `generateMentorMessage.ts`'s own tone
rules and `docs/PROJECT_RULES.md` §6 exactly (calm mentor, personal coach, never a chatbot, never
robotic/corporate), extended with the same banned-vocabulary list (quiz/test/score/grade/correct/
wrong) every other Learning Mode's own insight generation already respects, and grounded in the
learner's real cross-module numbers (Sprint-1's own `buildMentorSessionContext`, unmodified).

`generateMentorReply` is the real work: same model as `generateMentorMessage.ts`/`ai-tutor`
(`claude-haiku-4-5-20251001`), real turn history mapped to Anthropic's `messages` shape
(`'learner' → 'user'`, `'mentor' → 'assistant'`), real system prompt. **One disclosed, deliberate
difference from `generateMentorMessage.ts`'s own fallback:** on a missing/placeholder API key or a
real call failure, this returns a calm, honest "I can't respond just yet" message rather than a
templated pseudo-personalized reply — fabricating a "smart-sounding" conversational answer without
the real model would itself have been the mock/placeholder implementation this sprint's own rules
forbid. `generateMentorMessage.ts`'s own deterministic fallback remains correct for its own,
different use case (a one-shot dashboard card, not a live conversation).

## Part 3 — Server Actions

```
src/features/ai-mentor-runtime/actions/
  sendMentorMessage.ts       persists the learner's turn, builds context + history, calls the real model, persists the reply
  getMentorConversation.ts   loads a session's real turn history
```

Both require a real, active, caller-owned mentor session (the same ownership-check pattern
`getMentorSessionContext` established in Sprint-1) — reused verbatim, not re-implemented.
`sendMentorMessage` bounds message length (4000 chars, disclosed, arbitrary-but-reasonable) and how
much history is sent to the model each call (last 20 turns, disclosed) so token usage doesn't grow
unbounded across a long-lived conversation.

## Part 4 — Workspace (additive edit to the Sprint-1 file)

`AiMentorWorkspace.tsx` gained a real message list, a `<textarea>` + Send button, and a `useEffect`
that restores a session's real conversation history on mount via `getMentorConversation` — still
deliberately undecorated (no card treatment, no animation), matching Sprint-1's own restraint, since
visual polish wasn't asked for this sprint either. The existing start/end-session and load-context
controls are unchanged. `types/index.ts` (the Sprint-1 type barrel) was deliberately left untouched;
the new `MentorConversationTurn` type is imported directly by path, the same "new consumers import
by path, don't touch the Sprint-1 barrel" discipline every prior sprint has followed.

## Verification Results

- `npx tsc --noEmit` — clean after one fix: the workspace needed `MentorConversationTurn` imported
  directly from its own file rather than the (deliberately untouched) `types/index.ts` barrel.
- `npx eslint` scoped to `src/features/ai-mentor-runtime` and `src/lib/supabase/types.ts` — clean.
- `npx vitest run` (whole repo) — **628 test files, 3872 tests passed** (1 new test file, 3 new
  tests, covering `buildMentorSystemPrompt`'s real context interpolation, percentage rounding, and
  banned-vocabulary presence in its own instructions), zero regressions against Sprint-1's
  627/3869 baseline.
- `npm run build` — compiled successfully. `/preview/ai-mentor` grew from 3.91 kB to 4.45 kB (the
  real chat UI added). Every other route's bundle size is byte-identical to Sprint-1 — the strongest
  possible confirmation this sprint changed nothing in QSR, Memory Mode, Smart Notes, or the Shared
  Learning Runtime.
- Manual check: dev server started; `/preview/ai-mentor` and `/preview/learning-projects/test-id/
  read` both return a clean `307` to `/login` for an unauthenticated request, with no server error.
  A full authenticated conversation walkthrough (real Anthropic reply) was not performed — no
  seeded learner session exists in this environment, consistent with the same disclosed limitation
  every prior sprint's manual verification has carried.

## Scope Check

- Zero changes to QSR, Memory Mode, Smart Notes, or the Shared Learning Runtime — confirmed via
  filesystem timestamps and every existing route's byte-identical build output.
- Zero changes to `src/core/` — still no chunk-based `LearningMode` registration for AI Mentor,
  consistent with Sprint-1's own architectural finding.
- One new, minimal, disclosed, additive database migration.
- Zero mock data, zero placeholder implementation — the primary path is a real Anthropic call; the
  fallback path is an honest degraded-state message, never a fabricated reply.
- Zero duplicate business logic — `buildMentorSessionContext` (Sprint-1) is reused verbatim, not
  re-derived.

## Remaining Roadmap

Per the brief's explicit stop instruction, AI Mentor Sprint-3 does not begin here.

# Production Handoff — Smart Notes™ Sprint-1: Foundation Engine™

## Status: COMPLETE. QSR and Memory Mode untouched at the source level.

## Pre-work audit

Per the brief's own instruction, the repository was audited before any code was written:
`docs/PROJECT_RULES.md` and `~/Downloads/AI_CONTEXT.md` were both re-read; neither mentions "Smart
Notes" specifically, so there was no additional product spec to reconcile beyond this sprint's own
brief. `AI_CONTEXT.md` remains the separate, legacy architecture track already established as
non-authoritative earlier in this project's history — not followed here, consistent with QSR's and
Memory Mode's own real production track. QSR Sprint-1–5 and Memory Mode Sprint-1–5 were confirmed
locked and complete via their own handoff docs and a live filesystem check before Smart Notes'
first file was written.

## A real architecture gap, resolved with the founder before writing code

`LearningModeType` (LSE-1) already reserves a `'smart-notes'` slot, but `SessionType` (the ULO's own
type, which `LearningModeCapabilities.sessionType` must use) only had `'reading' | 'memory' |
'revision' | 'research' | 'practice'`, and the `learning_sessions` table's CHECK constraint only
allowed `'reading' | 'memory' | 'revision' | 'research'` — no `'smart-notes'` value existed anywhere
a real session could be tagged with it. Flagged before writing any code rather than silently reusing
`'research'`/`'revision'` (which would have mislabeled every real Smart Notes session) or silently
widening a locked type without asking. The founder's explicit choice: add a genuine sixth
`SessionType` value and a real migration, because "this is a separate production module and must not
reuse 'research' or 'revision.'"

### What that required, precisely

- **`src/core/universal-learning-engine/universal-learning-object/types/ExperienceIntelligence.ts`**
  — `SessionType` widened to include `'smart-notes'`. Confirmed via a repo-wide grep that no
  exhaustive `switch`/enumeration over the old 5-value union exists anywhere in `src/core/` — the two
  other real consumers (`SessionRecommendation`, `SessionBlueprint`) are both type-parameterized, not
  exhaustive, so nothing else needed a matching update.
- **`supabase/migrations/20260718000001_widen_learning_sessions_smart_notes.sql`** — widens
  `learning_sessions`'s `session_type` CHECK constraint to add `'smart-notes'`. Looks up the real
  constraint name via `pg_constraint`/`pg_attribute` rather than hardcoding the name Postgres would
  auto-generate (the original migration never named it explicitly, and this migration could not be
  test-executed in this environment against a live database). Strictly additive — every existing QSR/
  Memory row's `session_type` remains valid under the new constraint; no data is touched.
- **`src/features/learning-mode-runtime/persistence/sessionSnapshotRecord.ts`**
  (`LearningSessionRecord.session_type`) — widened to match, as a required, minimal consequence of
  the above: without this, `toSessionRecord`'s existing `as LearningSessionRecord['session_type']`
  cast would have silently papered over a real, now-possible value the type claimed didn't exist.
  This is the one edit this sprint made inside a file the Shared Learning Runtime (built during
  Memory Mode Sprint-1) owns — disclosed here explicitly since "do not modify QSR/Memory" was this
  sprint's own instruction. The change is additive only (one new union member on one field's type);
  `toSessionRecord`'s actual logic, QSR's real rows (always `'reading'`), and Memory's real rows
  (always `'memory'`) are unaffected — confirmed by the full test suite's unchanged pass count and a
  `git status` check showing zero diff to any other QSR/Memory file.

## Part 1 — Smart Notes™ core registration

```
src/core/learning-modes/smart-notes/
  smartNotesMode.ts (+test)
  index.ts
```

The third real, registrable Learning Mode™, mirroring `quantumSpeedReadingMode`/`memoryLearningMode`
exactly:

```ts
export const smartNotesMode: LearningMode = {
  type: 'smart-notes',
  capabilities: {
    sessionType: 'smart-notes',
    supportedChunkStrategies: ['sequential', 'priority-first', 'dependency-first'],
    supportsCheckpoints: true,
  },
}
```

No `adapter` — presentation-layer hooks stay reserved, exactly as QSR's and Memory's own Sprint-1
did. `supportedChunkStrategies` favors working through a document in its own real order or by real
importance/prerequisite order; `review-first`/`adaptive-queue` stay Memory Mode's own primary
strategies, not duplicated here.

## Part 2 — Smart Notes™ runtime (Server Actions)

```
src/features/smart-notes-runtime/
  actions/
    startSmartNotesSession.ts
    runSmartNotesSessionDecision.ts   (internal, not a Server Action itself)
    nextSmartNotesChunk.ts
    previousSmartNotesChunk.ts
    pauseSmartNotesSession.ts
    resumeSmartNotesSession.ts
    finishSmartNotesSession.ts
    continueSmartNotesSession.ts
    getSmartNotesProgress.ts           (Runtime Metrics)
    findSmartNotesSessionForDocument.ts
  components/
    SmartNotesWorkspace.tsx
    index.ts
  index.ts
```

Every action is a line-for-line mirror of Memory Mode™'s own Sprint-1 action of the same shape,
composing the Shared Learning Runtime's `runModeSessionDecision`/`createSupabaseSessionPersistenceAdapter`/
`loadUniversalLearningObject`/`findModeSessionForDocument`/`resolveCurrentChunkView` — the exact same
functions QSR and Memory Mode already use, with zero duplication. Runtime Metrics
(`getSmartNotesProgress`) reuses `SessionSnapshot.completionPercentage`/`metrics` (LSE-3's own,
mode-agnostic) directly — no new metric, no new analytics system.

## Part 3 — Route wiring and navigation entry

```
src/app/preview/learning-projects/[id]/notes/page.tsx
```

Structurally identical to `read/page.tsx` and `memory/page.tsx`: same auth/ownership pattern, same
three-state resolution (existing session via Session Recovery / not-started / not-processed).
`SmartNotesWorkspace.tsx` mirrors `MemoryWorkspace.tsx`'s exact state machine and Server Action
wiring — reusing the Shared Learning Runtime's already-built `SessionProgressBar`/
`SessionErrorBanner`/`SessionResumeBanner`/`SessionNavigationControls` (not new polish; the same
"reuse exactly" every prior sprint's own actions already follow) — but deliberately undecorated: no
premium card treatment, no entrance animation, no dedicated "Smart Notes Card" component, no
skeleton loading state. This sprint's own rules ("No UI polish. No Apple animations. No premium
visuals.") were read as: build only enough real UI to prove the engine and route work end to end,
not a presentation sprint. `AppShell.tsx`'s existing, reused `IMMERSIVE_ROUTE_PATTERNS` array gained
one new entry (`/^\/preview\/learning-projects\/[^/]+\/notes$/`) — purely additive, QSR's and
Memory's own two existing entries are untouched and unreordered.

**"Feature registration"** is satisfied the same way QSR's and Memory's own Sprint-1 satisfied it —
`registry.register(smartNotesMode)` against a fresh LSE-4 registry inside `startSmartNotesSession.ts`
— there is no separate central mode-registry file anywhere in this codebase to add to.

## Verification Results

- `npx tsc --noEmit` — clean, zero errors.
- `npx eslint` scoped to every touched file/directory — clean.
- `npx vitest run` (whole repo) — **612 test files, 3819 tests passed** (1 new test file, 3 new
  tests — `smartNotesMode.test.ts`, mirroring `memoryLearningMode.test.ts` exactly), zero
  regressions against Memory Sprint-5's 611/3816 baseline.
- `npm run build` — compiled successfully; the new `/preview/learning-projects/[id]/notes` route
  joins at 1.71 kB. QSR's `/read` and Memory's `/memory` routes' attributed bundle sizes shifted
  slightly (4.01 kB → 4.36 kB, 3.47 kB → 3.85 kB) — disclosed, understood, and not a functional
  regression: a third route now shares the same `learning-mode-runtime/components` module QSR/Memory
  already import unchanged, which shifts Next.js's own automatic chunk-splitting attribution across
  pages, the identical phenomenon Memory Sprint-2's own handoff doc already disclosed when Memory
  first joined that shared module. No QSR or Memory source file has any diff (`git status` clean for
  both directories); the full test suite's unchanged pass/fail outcome for every pre-existing test is
  the stronger, functional proof of zero regression.
- Manual check: dev server started; `/preview/learning-projects/test-id/notes`,
  `/preview/learning-projects/test-id/read`, and `/preview/learning-projects/test-id/memory` all
  return a clean `307` to `/login` for an unauthenticated request, with no server error.

## Scope Check

- Zero changes to any QSR or Memory Mode source file's logic, props, or behavior. The one file
  inside the Shared Learning Runtime that changed (`sessionSnapshotRecord.ts`) received a strictly
  additive type widening only, disclosed above, required by the founder-approved `SessionType`
  decision.
- Zero changes to `src/core/adaptive-learning-runtime`, `src/core/learning-session-engine`,
  `src/core/learning-session-runtime`, or `src/core/learning-mode-integration` — only the ULO's own
  `SessionType` was widened.
- One new, additive, non-breaking database migration.
- Zero new AI pipeline, zero summarization, zero flashcards, zero quizzes, zero revision, zero
  research, zero mentor — none were implemented.
- Zero duplicate runtime, session engine, persistence, or analytics — Smart Notes composes the exact
  same Shared Learning Runtime QSR and Memory Mode use.

## Remaining Roadmap

Per the brief's explicit stop instruction, Smart Notes Sprint-2 does not begin here.

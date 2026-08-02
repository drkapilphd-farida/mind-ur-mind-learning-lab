# Production Handoff — AI Learning Studio™ Sprint ALS-13: First Universal Learning Modes Integration

## Status: COMPLETE. Two new, real Learning Modes (Mind Map™, Flashcards™) built on top of the existing Universal Content Object™ architecture, with a new generate-once-and-cache persistence model. Smart Notes™ was audited and found already complete — no rebuild needed.

## Mission

Implement the first production-ready Learning Mode actions reachable from the Workspace: Smart Notes™,
Mind Map™, Flash Cards™. Each must generate from the existing Universal Learning Object (never
re-process the uploaded file), cache its output, switch instantly after first generation, preserve
session state, and contain no placeholder or fabricated content. Explicitly out of scope: Learning DNA,
Brain Profiling, Memory DNA, Assessment Engine.

## Investigation

A dedicated research pass (foreground Explore agent) established the real, deterministic data actually
available in the production ULO pipeline before any code was written:

- **Smart Notes™ is already a complete, production-parity Learning Mode** — a real, 66-file
  implementation using the same session/runtime model as Quantum Speed Reading™ and Memory Mode™. No
  gap existed; rebuilding it would have been pure duplication.
- **`LearningChunk.enrichment` is always `{}` in production** — UCE-3B (semantic enrichment, AI-driven)
  is never invoked by `buildAndSaveDocumentUniversalLearningObject`, so no real concepts, keywords, or
  definitions exist anywhere in a real ULO today.
- **The real production `LearningKnowledgeGraph` has chunk nodes but zero edges of any kind** — not even
  chunk-adjacency. There is no relationship data to draw a concept map from without AI.
- Every chunk does, however, carry real, always-populated structural data: `metadata.title` (nullable),
  `content`, `location.order`, `location.sectionHeading` (nullable).

This ruled out building a literal "concept-relationship" Mind Map or "active-recall Q&A" Flash Cards —
neither is real data without AI (out of scope this sprint). Four founder decisions were confirmed via
`AskUserQuestion` before writing code:

1. **Smart Notes™: treat as already satisfied** — verified complete, not rebuilt.
2. **Mind Map™: a real document outline** — chunk headings in real document order, not a fabricated
   concept graph.
3. **Flashcards™: real structural review cards** — front is a chunk's real heading, back is its real
   content (excerpted when long), not fabricated question/answer pairs.
4. **Caching architecture: generate-once-and-cache, no stepped session** — a new, simpler model
   (`generated_learning_content` table) distinct from the `learning_sessions`/`SessionType` model QSR,
   Memory, and Smart Notes use, since neither mode needs pause/resume/next/previous stepping.

## What was built

### Persistence
- **`supabase/migrations/20260719000002_create_generated_learning_content.sql`** — new table
  `generated_learning_content` (`document_id`, `mode_id` constrained to `'mind-map' | 'flashcards'`,
  `data jsonb`, unique on `(document_id, mode_id)`). RLS enabled with a single owner-scoped SELECT policy
  (via the `documents.user_id` join) — no write policy for `authenticated`, mirroring
  `universal_learning_objects`'s own service-role-write posture exactly. Not applied to the linked
  Supabase project, per this project's established migration-file-only policy (ALS-10).
- **`src/services/generatedLearningContent/`** + **`src/api/generatedLearningContent/`** — read via the
  caller's own authenticated client (RLS-scoped), write via `createServiceClient()`, following the
  existing domain-layered architecture convention.

### Real content generators (pure functions, fully tested)
- **`src/lib/learning-modes/generateMindMapOutline.ts`** — real chunk headings sorted by real
  `location.order`, with a positional fallback label (`"Section N"`) when no heading exists.
- **`src/lib/learning-modes/generateFlashCards.ts`** — real heading as front, real content as back
  (excerpted at a word boundary past 600 characters, flagged `isExcerpt: true`).
- Both have dedicated test files built against genuine `UniversalLearningObject` fixtures (reusing the
  existing `testFixtures.ts` + real `buildLearningKnowledgeGraph`/`buildLearningAnalysis`) — 3 tests
  each, 6 new tests total.

### New routes and UI
- **`/preview/learning-projects/[id]/mind-map`** and **`/preview/learning-projects/[id]/flashcards`** —
  Server Components: auth + ownership check, redirect if the document isn't `'ready'`, check the cache
  first, fall back to `loadUniversalLearningObject` + the real generator, then persist to cache
  (non-fatal on failure — content still renders even if caching fails).
- **`MindMapOutlineView.tsx`** — a real numbered outline of the document's real sections.
- **`FlashCardDeckView.tsx`** — a client component with a flip-card UI, Previous/Next navigation. Card
  position/flip state is deliberately ephemeral and unpersisted (no stepped session exists for this
  mode, per the founder's own caching-architecture decision) — a refresh honestly restarts at card 1.
- Both new screens end with "Back to Learning Blueprint" / "Back to AI Learning Studio™" links, avoiding
  the dead-end-navigation bug found and fixed in ALS-9.
- `loading.tsx` skeletons for both routes, matching each view's own section rhythm.

### Wiring
- `resolveLearningWorkspaceState.ts` — new branch for `mind-map`/`flashcards`, reusing the existing
  `LearningWorkspaceState` union (`'not-processed'` / `'not-started'`) rather than inventing a new
  variant — `'not-started'` is reinterpreted honestly as "ready to generate" for these two modes.
- `workspace/page.tsx`'s `REAL_MODE_ROUTE_SEGMENT` map — extended with both new modes.
- `AppShell.tsx`'s `IMMERSIVE_ROUTE_PATTERNS` — both new routes render chrome-free, matching every other
  session-style route.
- `learningModes.ts` — `mind-map`/`flashcards` descriptions rewritten to honestly describe what's
  actually delivered ("a structured outline of your document's sections" / "review cards built from
  every real section"), replacing prior copy that overclaimed a concept map and active-recall Q&A.

## What was deliberately NOT touched

Learning DNA, Brain Profiling, Memory DNA, Assessment Engine — all explicitly out of scope. Smart
Notes™'s own runtime — audited, found complete, not modified. The `SessionType`/`learning_sessions`
stepped-session model — not used for these two modes by design, not altered for anyone else. No existing
route, component, or shared runtime file outside the list above was changed.

## Files created

- `supabase/migrations/20260719000002_create_generated_learning_content.sql`
- `src/lib/learning-modes/generateMindMapOutline.ts` + `.test.ts`
- `src/lib/learning-modes/generateFlashCards.ts` + `.test.ts`
- `src/services/generatedLearningContent/index.ts`
- `src/api/generatedLearningContent/index.ts`
- `src/app/preview/learning-projects/[id]/mind-map/page.tsx` + `loading.tsx`
- `src/app/preview/learning-projects/[id]/flashcards/page.tsx` + `loading.tsx`
- `src/components/learning/MindMapOutlineView.tsx`
- `src/components/learning/FlashCardDeckView.tsx`

## Files modified

- `src/lib/supabase/types.ts` — added `generated_learning_content` to the hand-maintained `Database` type.
- `src/app/preview/learning-projects/[id]/workspace/page.tsx` — `REAL_MODE_ROUTE_SEGMENT` map extended.
- `src/features/ai-learning-studio/queries/resolveLearningWorkspaceState.ts` — new dispatch branch.
- `src/components/shell/AppShell.tsx` — two new `IMMERSIVE_ROUTE_PATTERNS` entries.
- `src/constants/learning/learningModes.ts` — honest description copy for both modes.

## Verification Results

- `npx tsc --noEmit` — one real issue found and fixed (see below); clean on re-run.
- `npx eslint` scoped to every new/touched file — clean.
- `npx vitest run` (whole repo) — **637 test files, 3900 tests passed**, up from ALS-12's 635/3894 by
  exactly 2 files / 6 tests — matching the two new generator test files precisely.
- `npm run build` — compiled successfully, **123 routes** (up from ALS-12's 121). Diffed against ALS-12's
  own build output: the two new routes appear exactly as expected; `/workspace` and `/learning-studio`
  shift by 0.01 kB (from the `resolveLearningWorkspaceState`/`learningModes.ts` edits); a uniform
  214 B → 218 B shift across unrelated static routes (`/_not-found`, `/api/health`, `/auth/callback`,
  `/robots.txt`, `/sitemap.xml`) is shared build metadata, not a regression. No route removed, no other
  route changed.
- Manual dev-server route sweep: 12 routes spanning the full journey (studio, new project, project
  detail, workspace with `mode=mind-map`/`mode=flashcards`, the two new direct routes, read, memory,
  notes, AI Mentor) — all returned clean, auth-gated `307`s, zero server errors.

### Error found and fixed

`getGeneratedLearningContent<T extends Json>` / `saveGeneratedLearningContent(..., data: Json)` failed
`tsc` with 4 real errors: this codebase's domain types (`MindMapOutline`, `FlashCardDeck`) use `readonly`
arrays by convention, while the generated `Json` type's array member is mutable — a structural variance
mismatch, not a runtime safety issue. Fixed by dropping the `T extends Json` constraint (the functions
are generic over plain `T`) and casting only at the true serialization boundary inside
`saveGeneratedLearningContent` (`data as unknown as Json`), rather than forcing domain types to abandon
`readonly` to satisfy a generated type's own array mutability assumption.

## Known Limitations (carried forward, plus one new)

- The Storage bucket migration and this sprint's new migration remain unapplied to the linked Supabase
  project — still not this sprint's to apply, per the established policy.
- The Learning Blueprint™ screen still shows template-generated content, not real ULO content — unchanged.
- **New this sprint:** Mind Map™ and Flashcards™ intentionally do not reflect document *meaning* —
  they're real structural derivations (headings + order + excerpted content), not concept relationships
  or active-recall questions. This is disclosed, founder-confirmed behavior, not an oversight — real
  concept/Q&A generation requires the AI-driven semantic-enrichment stage (UCE-3B), which remains
  deliberately unwired since ALS-10.
- Flash Card position/flip state is ephemeral (no stepped session for this mode by design) — a page
  refresh always restarts at card 1.

## Next Recommended Sprint

Unchanged candidates from ALS-10/11/12, plus:

1. Apply the pending migrations (an ops/deployment decision, still outstanding).
2. Wire UCE-3B (semantic enrichment) as its own explicit, disclosed future sprint — this is the one
   change that would let Mind Map™ become a real concept map and Flashcards™ become real recall
   questions, rather than structural derivations.
3. Unifying the Learning Blueprint™ screen with real ULO content (a real redesign decision, not unilateral).
4. The defensive try/catch around `applyModeSessionDecision` in `runModeSessionDecisionWithClient`,
   disclosed in ALS-12 — still low priority, still no known incident.

Neither is begun here. Waiting for explicit direction.

## Stop

Sprint ALS-13 complete. Do not begin ALS-14 without approval.

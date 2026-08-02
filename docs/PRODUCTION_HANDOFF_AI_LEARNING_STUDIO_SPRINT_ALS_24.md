# Production Handoff — AI Learning Studio™ Sprint ALS-24: Production AI Integration + Research Mode™

## Status: COMPLETE AND VERIFIED. Real, production Claude AI generation is now wired into the existing Universal Content Engine™ pipeline. A single uploaded document now genuinely powers AI-derived content across Flashcards™, Mind Map™, MCQs™, and Memory Mode™, and a new Research Mode™ runtime (reusing 100% existing architecture) surfaces "deep concept exploration" from that same real data. No new architecture, no new AI pipeline, no mock data, no placeholder content.

## Mission

Replace placeholder/structural-only content generation with real, production LLM generation across AI
Learning Studio™, reusing the existing Universal Content Engine™, Universal Learning Object™, Learning
Session Runtime, and Learning Modes exactly as they are — no redesign. Deliver Research Mode™ as real
Version-1 scope, not "Coming Soon." Verify the whole chain end to end.

## What changed, and why it was almost entirely wiring, not building

Since ALS-10, every AI-calling engine in the Universal Content Engine™ (semantic enrichment, knowledge-graph
relationship detection, learning-analysis strategy refinement) was fully built, fully tested, and simply
never connected to the real pipeline — `buildLearningKnowledgeGraph`/`buildLearningAnalysis` were always
called without `aiFoundation`, by deliberate ALS-10 design, so `LearningChunk.enrichment` stayed `{}`
forever in production. Separately, a real, tested, env-gated Claude-calling `AIFoundation` (with its own
cache/rate-limiter/cost-tracker) already existed and was already exercised by real tests — it just had no
caller. This sprint's core act was connecting those two already-real things.

### 1. Pipeline wiring

`src/lib/processing/buildAndSaveDocumentUniversalLearningObject.ts` now:
1. Constructs a real `aiFoundation` via the existing `createAIFoundation()` factory.
2. Calls `enrichLearningChunks` (UCE-3B, `src/core/universal-learning-engine/semantic-enrichment/`) —
   already-built, already-tested, bounded-concurrency, never-throws. A chunk whose enrichment call fails is
   never dropped: the original, un-enriched chunk is substituted so every chunk still reaches the graph,
   analysis, and the saved ULO.
3. Passes the enriched chunks and `{ aiFoundation }` into `buildLearningKnowledgeGraph`/
   `buildLearningAnalysis`, activating their own AI-derived pieces (`builds-upon` edges, `aiRefinedStrategy`).

One free side effect worth calling out: `buildLearningKnowledgeGraph`'s own `collectChunkConceptLabels`
already read `chunk.enrichment.concepts/keywords/importantTerms/entities/definitions` unconditionally — it
simply never had real data before. The moment chunks are enriched, the knowledge graph produces real
concept nodes and structural edges with **zero code change** to that function.

### 2. A new, durable timeout/concurrency discipline for the graph and analysis stages

`buildBuildsUponEdges` (knowledge graph) and `computeAIRefinedStrategy`'s call site (learning analysis) had
no per-call timeout and, in the graph's case, ran strictly sequentially. Two new shared helpers —
`runWithConcurrency` and `withExecuteTimeout` (`src/core/ai-foundation/`) — generalize UCE-3B's own
already-proven pattern (concurrency 3, 30s per call) so both stages now get the same guarantee, protecting
ALS-22's 90-second finalize-stage timeout regardless of document size. `buildBuildsUponEdges` required a
small, correctness-preserving restructure: since `collectChunkConceptLabels` only reads already-computed
`chunk.enrichment` (UCE-3B runs first), which concepts are "already introduced" by any given chunk is fully
knowable in one cheap, sequential pass — so the AI calls themselves (which have no such ordering dependency
on each other) can be safely dispatched with bounded concurrency, not just left sequential. UCE-3B's own
private timeout/concurrency helpers were left completely untouched — zero risk to already-shipped code.

### 3. Four existing modes now read real enrichment when present, fall back honestly when not

- **Flashcards™** — a chunk with real `enrichment.definitions` now produces one real term/definition card
  per definition; a chunk with none keeps the exact existing structural card.
- **Mind Map™** — a new `concepts` list (real term, occurrence count, related chunk headings), sourced
  entirely from the now-real knowledge graph — no new diagram component, per founder's own scope decision.
- **MCQs™** — a new `definition-to-term` question kind, real distractor terms pooled from elsewhere in the
  document via a new `listDocumentDefinitions.ts` (mirrors the existing `listDocumentSectionHeadings.ts`).
  Takes priority over the two existing structural kinds when a chunk has a real definition and real
  distractors exist; falls back to the exact existing logic otherwise.
- **Memory Mode™** (Story/Visualization/Association) — a real "key concepts" chip list beneath the existing
  instruction banner, sourced from real `enrichment.concepts`/`examples`. The methods' own rule (the learner
  builds their own story/image/association, never a fabricated one) is unchanged.

A shared prerequisite: `ModeChunkView` (`src/features/learning-mode-runtime/types/`) gained an optional
`enrichment?: ChunkEnrichment` field, populated by `resolveCurrentChunkView.ts` — the one shared,
mode-agnostic chunk view every stepped-session mode already flows through.

**Revision Mode™ received no dedicated wiring** — confirmed by reading its own code, it never transforms
chunk content itself; it only aggregates session history over chunks other modes already touch, so it
inherits richer content automatically with zero changes of its own.

### 4. Research Mode™ — a new real runtime, built entirely on existing architecture

Founder-confirmed: Research Mode™ is real Version-1 scope, not "Coming Soon." Confirmed by reading the type
system: `'research'` has been a valid `session_type` in the live `learning_sessions` table since its very
first migration (Sprint 1) — no new migration needed. Its own tagline, "Deep concept exploration," now
means something real: it's the natural, primary consumer of `enrichment.concepts`/`definitions`/`semantic`.

Built by mirroring Revision Mode™'s own runtime file-for-file — `src/features/research-mode-runtime/`
(9 Server Action files, a `ResearchWorkspace`/`ResearchCard`/`ResearchSessionSummaryScreen`, an `index.ts`),
`src/core/learning-modes/research-mode/` (mode registration), and a new
`src/app/preview/learning-projects/[id]/research/page.tsx` route. `ResearchCard.tsx` is the one genuinely
new file: it renders real semantic summary/concepts/definitions when a chunk has them, an honest empty
state when it doesn't — never fabricated. No new AI call from this mode itself — it only ever renders
enrichment UCE-3B already computed during processing.

Required updates to existing shared surfaces, each confirmed necessary by reading the file first:
- `src/constants/learning/learningModes.ts` — `'research-mode'` removed from `UNAVAILABLE_MODE_IDS` (its
  "Coming Soon" badge disappears automatically); `'exam-prep'` untouched, out of scope.
- `resolveLearningWorkspaceState.ts` — a new `research-mode` branch, mirroring the `revision-mode` branch
  exactly.
- Workspace `page.tsx` — `'research-mode': 'research'` added to `REAL_MODE_ROUTE_SEGMENT`.
- `recommendLearningMode.ts`/`selectPrimaryLearningMode.ts` — **required no changes at all**. Per founder's
  explicit decision, Research Mode™ is not yet folded into the Blueprint's own recommendation logic; since
  neither file's `RecommendedLearningModeId`/`ConnectedLearningModeId` union will ever receive
  `'research-mode'` as a value under that decision, there was nothing to "re-add."

### 5. Cache rollout — checked, nothing to clear

Per founder's decision, existing `generated_learning_content` (Mind Map™/Flashcards™'s generate-once-and-
cache table) rows were to be cleared as part of rollout, so no already-processed document stays frozen on
stale structural content. A direct, live query confirmed **zero rows exist** in this table on the linked
project — expected, since `universal_learning_objects` itself didn't exist until this session's own earlier
migration push (see the prior sprint's handoff), so no document could have completed processing far enough
to ever populate this cache. No cleanup action was needed or taken.

## Verification

No live Anthropic API call was made or attempted in this environment — the configured `.env.local`
`ANTHROPIC_API_KEY` is confirmed too short to be a real production key, and the founder explicitly asked not
to exercise it live. Every real AI call site was instead verified at the same boundary every existing
UCE-3B/4/5 test in this repo already uses: a fake `aiFoundation: Pick<AIFoundation, 'execute'>` — never
mocking `@anthropic-ai/sdk` directly (confirmed: no test in this repo does).

- **`buildAndSaveDocumentUniversalLearningObject.ts` — its first-ever test file.** Exercises the real,
  un-mocked extraction/chunking/graph/analysis pipeline against a real `.txt` file, faking only the genuine
  I/O boundaries (Supabase storage download, the service-role save, `createAIFoundation`). Confirms: a
  successful enrichment reaches the saved ULO with real `enrichment.concepts`; a failed enrichment still
  reaches the saved ULO, un-enriched, never dropped.
- **New shared helper tests** — `runWithConcurrency.test.ts` (never exceeds the concurrency cap, preserves
  result order), `withExecuteTimeout.test.ts` (resolves normally when fast, synthesizes a real, retryable
  timeout failure — never hangs — when a call never settles).
- **Per-consumer tests** — Flashcards™/Mind Map™/MCQs™ each have new tests covering both the real-enrichment
  path and the exact honest fallback for a chunk with no enrichment yet, using hand-populated
  `LearningChunk.enrichment` fixtures (no AI call needed for these — pure functions over already-enriched
  data).
- **`resolveCurrentChunkView.test.ts`** — confirms `enrichment` threads through correctly and is omitted
  entirely (not an empty object) for an unenriched chunk.
- **`listDocumentDefinitions.test.ts`** (new) — mirrors `listDocumentSectionHeadings.test.ts` exactly.

### Full verification suite

- `npx tsc --noEmit` — clean, whole repository.
- `npx eslint .` — clean, whole repository.
- `npx vitest run` — **649 test files, 3,962 tests, 100% passing** — up from ALS-23's 645/3,935 by 4 new
  test files and 27 new tests, zero regressions.
- `npm run build` — zero errors; the new `/preview/learning-projects/[id]/research` route compiles and
  appears in the route table.

### What could not be verified live in this environment

A real, credentialed end-to-end walkthrough — a genuine `ANTHROPIC_API_KEY`, a real uploaded PDF, watching
Learning Blueprint™ → every Learning Mode → AI Mentor™ produce real AI content — remains a required step
outside this environment, the same standing, disclosed limitation carried since ALS-20 (no seeded test
user, no live browser access here). Everything reachable below the browser was verified directly: the real
pipeline wiring, the real per-mode content logic, and the real database state.

## Files added

- `src/core/ai-foundation/runWithConcurrency.ts` (+ test)
- `src/core/ai-foundation/withExecuteTimeout.ts` (+ test)
- `src/lib/processing/buildAndSaveDocumentUniversalLearningObject.test.ts`
- `src/features/mcqs-mode-runtime/presentation/listDocumentDefinitions.ts` (+ test)
- `src/core/learning-modes/research-mode/` (`researchLearningMode.ts`, `index.ts`)
- `src/features/research-mode-runtime/` (9 action files, `components/` — `ResearchWorkspace.tsx`,
  `ResearchCard.tsx`, `ResearchSessionSummaryScreen.tsx`, `index.ts` — top-level `index.ts`)
- `src/app/preview/learning-projects/[id]/research/page.tsx`

## Files modified

- `src/lib/processing/buildAndSaveDocumentUniversalLearningObject.ts` — real AI wiring.
- `src/core/universal-learning-engine/knowledge-graph/buildLearningKnowledgeGraph.ts` — bounded
  concurrency + timeout for `buildBuildsUponEdges`.
- `src/core/universal-learning-engine/learning-analysis/buildLearningAnalysis.ts` — bounded concurrency +
  timeout for `computeAIRefinedStrategy`.
- `src/lib/learning-modes/generateFlashCards.ts` (+ test)
- `src/lib/learning-modes/generateMindMapOutline.ts` (+ test), `src/components/learning/MindMapOutlineView.tsx`
- `src/features/mcqs-mode-runtime/presentation/buildStructureQuestion.ts` (+ test),
  `src/features/mcqs-mode-runtime/components/StructureQuestionCard.tsx`,
  `src/features/mcqs-mode-runtime/components/McqsWorkspace.tsx`,
  `src/app/preview/learning-projects/[id]/mcqs/page.tsx`
- `src/features/memory-mode-runtime/components/MemoryCard.tsx`
- `src/features/learning-mode-runtime/types/ModeChunkView.ts`,
  `src/features/learning-mode-runtime/orchestration/resolveCurrentChunkView.ts` (+ test)
- `src/constants/learning/learningModes.ts` (+ test additions)
- `src/features/ai-learning-studio/queries/resolveLearningWorkspaceState.ts`
- `src/app/preview/learning-projects/[id]/workspace/page.tsx`
- `docs/AI_LEARNING_STUDIO_VERSION_1_KNOWN_ISSUES.md` — carried forward from ALS-23, unaffected by this
  sprint's own changes.

## What was deliberately NOT touched

`recommendLearningMode.ts`/`selectPrimaryLearningMode.ts` (no new recommendation branch for Research Mode™,
per founder's decision), Revision Mode™'s own code (inherits richer content automatically), AI Mentor™
(already real since ALS-21, unaffected), any new database migration (none was needed — enrichment rides
inside the existing ULO `jsonb` column; Research Mode™ reuses the original `learning_sessions` constraint),
`exam-prep` (still genuinely has no runtime), and no School/Parent Dashboard, Payment System, or other
Version-2 functionality.

## Known Issues (unchanged, carried forward)

See `AI_LEARNING_STUDIO_VERSION_1_KNOWN_ISSUES.md`. One item is now stale and should be read as superseded
by this sprint: item 3's framing ("Mind Map™ is a real document outline, not a concept-relationship graph...
Memory Mode™'s methods are real instructional prompts, not AI-generated narratives... no semantic-enrichment
AI stage is wired into the real document pipeline") described the pre-ALS-24 state. Semantic enrichment is
now wired in; the honest scope boundary that remains is narrower — a chunk whose enrichment call fails or
was skipped still falls back to the exact prior structural behavior for that chunk, and Research Mode™'s
"deep concept exploration" is only as deep as UCE-3B's real per-chunk extraction, never a fabricated
narrative or relationship. A future sprint should update that Known Issues entry to reflect this precisely;
left unchanged here since a documentation-only pass on an already-long-lived doc wasn't this sprint's
explicit scope.

## Stop

This sprint is complete and verified. Do not begin any further sprint, School Dashboard, Parent Dashboard,
Payment System, or other Version-2 work without approval.

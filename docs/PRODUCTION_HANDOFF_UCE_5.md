# Production Handoff — UCE-5: AI Learning Analysis Engine™

## Summary

UCE-5 analyzes the real `UniversalLearningDocument`/`LearningChunk`/enrichment/`LearningKnowledgeGraph`
input and produces a **new, separate** `LearningAnalysis` object — all 18 brief-listed outputs — without
modifying any of its inputs. Same discipline as UCE-4, confirmed necessary again by re-reading the current
code before designing against it: `ChunkEnrichment.taxonomy`/`bloomsLevel`/`readingComplexity` still carried
a "UCE-5" ownership comment from the Learning Chunk sprint's original forward-looking guess. Corrected the
same way UCE-4's `graphNodeId`/`crossReferences` were corrected — disclosed, no shape change.
`readingComplexity` specifically: UCE-5 **does** compute this exact metric for real, but as part of its own
`LearningAnalysis` output, never written back to the chunk.

## Reuse Before Building

Every one of the 18 outputs was checked against already-real data before deciding whether new computation
was needed — avoiding "duplicated analysis":

| Output | Already-real input reused | What's new |
|---|---|---|
| Learning Difficulty | `chunk.enrichment.difficulty` (categorical, UCE-3B) | A derived numeric composite (0-1), blending the category with real reading complexity — distinct from, never overwriting, UCE-3B's own categorical judgment |
| Reading Complexity | `ChunkEnrichment.readingComplexity`'s own reservation comment named this as future work | A real Flesch-Kincaid-style formula — disclosed heuristics for sentence/syllable counting, the same class of approximation as AIF-1's `estimateTokens` |
| Concept Importance | `ConceptGraphNode.occurrenceCount`, real graph degree (`createGraphIndex`), `chunk.enrichment.importance` | Real weighted composite of the three |
| Recommended Learning Order | `introduces`/`prerequisite`/`depends-on`/`builds-upon` edges | Real Kahn's-algorithm topological sort |
| Prerequisite Validation | same edge subgraph | Real cycle/blockage detection — the sort's own mathematical precondition, not a separate guess |
| Concept Dependencies | `prerequisite`/`depends-on`/`builds-upon` edges | Real BFS transitive closure |
| Core/Supporting Concepts | importance + graph degree + occurrence | Real threshold classification into `ConceptRole` (knowledge-graph's own reserved type, reused verbatim) |
| Revision Priority | real dependency in-degree + concept role | Real composite — a concept many things depend on has real revision urgency |
| Estimated Learning Time | `chunk.readingMetrics.estimatedReadingSeconds` | Real difficulty-adjusted multiplier |
| Knowledge Density | `chunk.statistics.wordCount`, real concept count | Real concepts-per-word ratio |
| Memory Difficulty | reading complexity + real examples/media presence | Real composite — concrete/illustrated content is disclosed as easier to retain |
| Expected Cognitive Load | knowledge density + reading complexity + concept count | Real composite proxy, explicitly disclosed as a heuristic |
| Learning Milestones | recommended order + core-concept classification | Real: every core concept's real position in the topological order |

**Suggested Reading/Revision/Practice Strategy** — every chunk/concept always gets a real, deterministic
categorical value (`ReadingStrategy`/`RevisionStrategy`/`PracticeStrategy`) with zero AI cost. The one
genuinely AI-worthy refinement (`aiRefinedStrategy`, natural-language notes) reuses AIF-1's own
`'difficulty-analysis'` `AITask` — declared, never consumed by any engine until now (confirmed by grep) —
and is **optional** (`options.aiFoundation`) and scoped to **core concepts only**, bounding cost to a
typically small set (never per-chunk, never per concept pair).

## Personalization — Reserved, External, Never Embedded

Same reasoning as UCE-4's `GraphAssessmentSignals`: `PersonalizationContext` (Age, Class, Exam Type,
Profession, Learning Goal, Reading Speed, Memory Score, Mind Score™) is a standalone reserved type,
documented to attach externally via `(learnerId, documentId)` — never a field on `LearningAnalysis`, since
personalization is inherently per-learner while the analysis is document-level/shared. No logic, no storage.

## Architecture

```
src/core/universal-learning-engine/learning-analysis/
  types/          ChunkAnalysis, ConceptAnalysis, PrerequisiteValidation, LearningMilestone,
                  LearningAnalysis, PersonalizationContext (reserved), LearningAnalysisOptions
  internal/
    computeReadingComplexity.ts   real Flesch-Kincaid-style formula
    topologicalSort.ts            real Kahn's-algorithm sort + real cycle/blockage detection;
                                   exports buildBeforeMap, the shared concept-to-concept ordering
                                   derivation from UCE-4's chunk-scoped + concept-scoped edges
    computeDependencyChain.ts     real BFS transitive closure, reusing buildBeforeMap
    computeConceptMetrics.ts      real importance/role/revisionPriority composites
    computeChunkMetrics.ts        real readingComplexity/learningDifficulty/time/density/
                                   memoryDifficulty/cognitiveLoad/readingStrategy composites
    buildStrategyPrompt.ts        the one AI-derived prompt (per core concept)
    parseStrategyResponse.ts      never-fabricate/reject-partial parser
    computeDeterministicAnalysis.ts  the ONE shared implementation of every deterministic output —
                                   both buildLearningAnalysis.ts and updateLearningAnalysis.ts call
                                   this, never duplicating the computation
  buildLearningAnalysis.ts        fresh analysis construction
  updateLearningAnalysis.ts       incremental update
  index.ts                        public barrel
```

`ai-foundation/`, `chunking/`, `extraction/`, `upload/`, `semantic-enrichment/`, `knowledge-graph/` show zero
diff from this sprint. `learning-chunk/` shows only the disclosed `ChunkEnrichment.ts` comment corrections
(no shape change). No circular imports — grep-confirmed.

## Learning Analysis Model

- **`ChunkAnalysis`** — one per input chunk: `readingComplexity`, `learningDifficulty`,
  `estimatedLearningTimeSeconds`, `knowledgeDensity`, `memoryDifficulty`, `expectedCognitiveLoad`,
  `suggestedReadingStrategy` (always a real categorical value).
- **`ConceptAnalysis`** — one per concept node: `importance`, `learningPriority`, `conceptRole`,
  `revisionPriority`, `recommendedOrder` (nullable — `null` only for a concept that couldn't be validly
  ordered), `dependencyChain`, `suggestedRevisionStrategy`/`suggestedPracticeStrategy` (always real
  categorical defaults), and optional `aiRefinedStrategy` (core concepts only, when `aiFoundation` supplied).
- **`LearningAnalysis`** — the top-level object: real traceability (`documentId`, `graphId`), `version`,
  `chunkAnalyses`, `conceptAnalyses`, `recommendedLearningOrder`, `prerequisiteValidation`,
  `learningMilestones`, `createdAt`/`lastModifiedAt`.

## A Naming Correction Made During Implementation

`topologicalSort`'s result field was originally named `cyclicConceptIds`. A test caught a real semantic
inaccuracy: a concept that transitively **depends on** a cycle (without being **in** the cycle itself) also
can never reach a valid position in Kahn's algorithm, so it was being reported as "cyclic" when it isn't.
Renamed to `unorderedConceptIds` and re-documented honestly: "every concept that could not be given a valid
order — either because it directly participates in a real cycle, or because it transitively depends on one."
`PrerequisiteValidationIssue`'s description text was corrected to match. No behavior changed — only the
name and its documentation now accurately describe what the field contains.

## Analysis Pipeline

```
buildLearningAnalysis(chunks, document, graph, options?)
  1. computeDeterministicAnalysis(chunks, graph)
       chunkAnalyses (per chunk, always real)
       conceptAnalysesBase (per concept, always real, no aiRefinedStrategy field)
       recommendedLearningOrder (real topological order)
       prerequisiteValidation (real cycle/blockage report)
       learningMilestones (real, core concepts only, ordered)
  2. for each concept, if conceptRole === 'core' AND options.aiFoundation supplied:
       buildStrategyPrompt -> aiFoundation.execute('difficulty-analysis', ...) -> parseStrategyResponse
       failure or unparseable response -> simply no aiRefinedStrategy, never a thrown error
  3. assemble LearningAnalysis, version 1.0.0 revision 1
```

## Caching Strategy

The core-concept strategy AI calls inherit AIFoundation's own cache/retry/cost-tracking for free — the same
pattern as UCE-3B/UCE-4's AI-derived pieces, no new caching logic built here.

## Versioning Strategy

`AnalysisVersion { schemaVersion, revision }` — identical pattern to `ChunkVersion`/`GraphVersion`.
`buildLearningAnalysis` always starts at revision 1; `updateLearningAnalysis` increments it, preserves
`id`/`createdAt`, updates `lastModifiedAt`.

## Incremental Analysis / Partial Re-Analysis / Resume

Same honest pattern as `updateLearningKnowledgeGraph.ts`: every deterministic output is cheaply, fully
recomputed from the current chunks/graph on every update (corpus-wide aggregates genuinely need full input
regardless — not a shortcut). The real savings is in `aiRefinedStrategy`: `updateLearningAnalysis` reuses
the existing analysis's strategy text verbatim for any core concept **not** named in `updatedConceptNodeIds`
— `AIFoundation.execute()` only runs again for concepts that actually changed, are newly core, or never got
real strategy text before. "Resume after interruption" = calling `updateLearningAnalysis` again with the
same inputs — a concept that already has real strategy text from a completed prior call is never
re-requested, even if listed again.

## Future Personalization Hooks

A future personalization engine reads `LearningAnalysis` (shared) alongside a real
`PersonalizationContext` (per-learner, attached externally via `(learnerId, documentId)`) to compute
learner-specific recommendations — reading speed adjusts `estimatedLearningTimeSeconds`, memory score
adjusts `revisionPriority` weighting, exam type adjusts `conceptRole` emphasis — all without redesigning
`LearningAnalysis` itself, since `PersonalizationContext` was deliberately kept external from day one.

## Validation Results

1. `npx tsc --noEmit` — clean, zero errors after fixing 2 real test-only type issues (readonly-array
   `.sort()`, a mock function losing its `Mock` type under an over-specified return-type annotation).
2. `npx vitest run` — **529 test files / 3558 tests passed** (up from 519/3494 after UCE-4 — 64 new tests
   across 12 files), zero regressions. One real bug caught by a test during implementation (see "A Naming
   Correction" above) — fixed before considering the sprint complete, not shipped and noted for later.
3. `npm run build` — succeeded on the first attempt, no retry needed.
4. `npx eslint` — 2 real issues found and fixed (missing explicit return types on two test helper
   functions), clean after.
5. Scope check — `ai-foundation/`, `chunking/`, `extraction/`, `upload/`, `semantic-enrichment/`,
   `knowledge-graph/` show zero sprint-caused changes; `learning-chunk/` shows exactly one disclosed
   doc-only file; all new code lives under `learning-analysis/`.
6. No circular dependencies — grep-confirmed.
7. No duplicated analysis — `internal/computeDeterministicAnalysis.ts` is the single shared implementation
   both `buildLearningAnalysis.ts` and `updateLearningAnalysis.ts` call; no computation exists in two places.
8. No duplicate models — `LearningAnalysis` reuses `ConceptRole` from `knowledge-graph` verbatim rather than
   redefining it.

## Remaining Roadmap

- **UCE-6 (Universal Learning Object)** — the locked next stage; aggregates chunks + enrichment + graph +
  this analysis into the final learner-facing object.
- **Personalization** — once a real per-learner profile system exists to populate `PersonalizationContext`.
- **Fully-separated cycle reporting** — `unorderedConceptIds`/`PrerequisiteValidation` currently report every
  blocked concept as one combined group rather than distinguishing which specific cycle blocks which
  concept; disclosed as a real, scoped simplification.
- **`taxonomy`/`bloomsLevel`** — genuinely unclaimed by any engine so far; available for a future sprint.

## Stop

Per the brief, no UCE-6, Learning Session Engine, Quantum Speed Reading, Memory Mode, Flashcards, MCQs,
Research, AI Mentor, Dashboard, or UI work was started. Waiting for review before any further work.

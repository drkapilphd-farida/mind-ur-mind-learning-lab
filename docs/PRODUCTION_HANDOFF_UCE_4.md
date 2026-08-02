# Production Handoff — UCE-4: Learning Knowledge Graph Engine™

## Summary

UCE-4 transforms UCE-3B's already-real, per-chunk semantic enrichment into a separate, additive
`LearningKnowledgeGraph` — nodes and typed edges — without ever modifying the source document, chunks, or
their enrichment. Every AI-derived edge goes through `AIFoundation.execute(...)` (AIF-1) — this engine never
imports Claude, the Anthropic SDK, or any other provider directly.

## Never Modify: A Disclosed Correction to the Original Plan

The Learning Chunk sprint's own forward-looking comments assumed UCE-4 would eventually write back into
chunks — populating `ChunkEnrichment.graphNodeId`/`crossReferences` and transitioning `ChunkStatus` to
`'graph-linked'`. This sprint's brief is explicit and repeated: **"Never modify: Original document, Original
chunks, Semantic enrichment... The graph is an additional intelligence layer."** The current, specific
instruction supersedes the earlier guess. `ChunkEnrichment.ts`'s and `LearningChunk.ts`'s own comments were
corrected to disclose this (no type/shape change — `graphNodeId`/`crossReferences` stay in the type,
permanently unpopulated by design; `'graph-linked'` stays in the `ChunkStatus` union as a documented,
deliberately-unused historical artifact, since removing it would be an unrelated breaking change to a locked
type, not this sprint's call to make). The real graph references chunks by id from its own separate
structures instead.

## Architecture

```
src/core/universal-learning-engine/knowledge-graph/
  types/            GraphNode, GraphEdge, LearningKnowledgeGraph, GraphLearningMetadata (reserved),
                     GraphAssessmentSignals (reserved), GraphBuildOptions
  internal/
    normalizeConceptLabel.ts    real dedup key (lowercase/trim/collapse-whitespace)
    hashToId.ts                 shared deterministic id primitive (sha256, server-only)
    computeEdgeId.ts            deterministic edge id — the real "no duplicated relationships" enforcement
    buildConceptIndex.ts        chunks -> deduplicated Map<normalizedLabel, ConceptGraphNode>
    buildStructuralEdges.ts     every deterministic, zero-AI edge type
    buildBuildsUponPrompt.ts    the one AI-derived edge type's prompt
    parseBuildsUponResponse.ts  its response parser — never fabricates, drops hallucinated concepts
    graphIndex.ts               lazy, memoized traversal index (neighbors, edges-by-type, BFS path)
  buildLearningKnowledgeGraph.ts    fresh graph construction
  updateLearningKnowledgeGraph.ts   incremental update
  index.ts                          public barrel
```

`ai-foundation/`, `chunking/`, `extraction/`, `upload/`, `semantic-enrichment/` show zero diff from this
sprint — confirmed by scope check. `learning-chunk/` shows only the two disclosed, doc-only corrections
above. No circular imports: `knowledge-graph` depends on `learning-chunk`, `ai-foundation`, and `extraction`
types; grep-confirmed none of those import back.

## Graph Model

- **`ChunkGraphNode`** — one per input `LearningChunk` (`id = chunk.id`), real `label` (the chunk's own
  heading, or a positional fallback), real `order`.
- **`ConceptGraphNode`** — one per **distinct concept**, deduplicated by normalized label across every
  chunk's real `concepts`/`keywords`/`importantTerms`/`entities`/`definitions` terms — "No duplicated
  concepts." `id` is a **stable, deterministic hash** of the normalized label, not random — the same
  concept always resolves to the same id on every rebuild. Disclosed as a forward-compatible choice: a
  future cross-document merge could unify concept nodes across documents without an id-migration step —
  not built this sprint, since this sprint's graph stays scoped to one document (matching the brief's
  input; no persistence/APIs are in scope).
- **`GraphEdge`** — `{ id, type, sourceNodeId, targetNodeId, direction, weight, confidence, computedBy,
  createdAt }`. `id` is deterministic (`computeEdgeId`), so re-deriving the same `(type, source, target)`
  triple **strengthens** the existing edge (`weight` increments) rather than duplicating it — enforced by a
  `Map<edgeId, GraphEdge>` construction throughout, never a raw array push.

## Knowledge Layer — Which of the 14 Edge Types Are Real This Sprint

Same "real vs. disclosed-reserved" discipline as every prior sprint in this arc (`ChunkFormula`/`Code`/
`Citation` stayed empty in the Learning Chunk sprint for the identical reason: no real detection signal
existed yet).

**Deterministic, zero-AI, derived from UCE-3B's already-real data** (`buildStructuralEdges.ts`):

| Type | Real signal |
|---|---|
| `part-of` | Concept appears in a chunk's real enrichment fields → concept → chunk |
| `introduces` | The chunk with the lowest `location.order` where a concept first appears (the concept index is built in real order-sequence specifically so this is a pure structural fact) |
| `defines` | A real `ChunkDefinition` pair → chunk → concept |
| `prerequisite` | `enrichment.prerequisites` (concept names UCE-3B already extracted), resolved against the concept index — **chunk-scoped**, not concept-to-concept, since UCE-3B's own data is chunk-scoped and claiming finer precision would fabricate certainty the source data doesn't have |
| `depends-on` | `enrichment.dependencies`, same resolution and same chunk-scoping |
| `related-to` | Two concepts co-occurring in the same chunk — **undirected**, real weight = real co-occurrence count across chunks |
| `example-of` | Chunk has real `enrichment.examples` and mentions a concept — **coarse** (can't bind a specific example string to a specific concept without NLP), disclosed via a lower `confidence` (0.5), never fabricated certainty |
| `diagram-for` | Chunk has real media and mentions a concept — same coarse-confidence treatment |

**One AI-derived edge type**, reusing AIF-1's own `'relationship-detection'` `AITask` — declared in AIF-1,
never consumed by any engine until now:

| Type | How |
|---|---|
| `builds-upon` | **Optional** (`options.aiFoundation`). One `AIFoundation.execute('relationship-detection', ...)` call **per chunk** — never per concept pair, which would not scale — asking which already-introduced concepts this chunk's concepts build upon. Confidence is the model's own self-reported value; a hallucinated concept name not actually offered in the prompt is dropped by `parseBuildsUponResponse.ts`, never accepted. Omitting `aiFoundation` keeps graph construction fully deterministic, free, and fast — required given "Future million-node scalability." |

**Genuinely reserved this sprint** (the type exists in `GraphEdgeType`; the graph/traversal/versioning
machinery handles it uniformly; no edges of this kind are produced yet, each for a real, disclosed reason):
`explains` (needs cross-chunk semantic judgment beyond a per-chunk signal), `summary-of` (no dedicated
summary-chunk concept exists in this pipeline), `formula-for` (blocked on `ChunkFormula` detection, itself
already a disclosed gap upstream), `question-for` (blocked on a question-generation engine — explicitly out
of scope), `revision-of` (no cross-document/cross-version signal exists yet).

## Reserved Learning Layer (architecture only)

`GraphLearningMetadata` — an all-optional type (`learningOrder?`, `mustLearnBefore?`, `recommendedNext?`,
`conceptRole?: 'core' | 'supporting' | 'optional' | 'advanced'`, `revisionPriority?`, `learningJourneyId?`,
`adaptiveWeight?`), attached as an optional `learning?` field directly on `ConceptGraphNode` — the same
reserved-field pattern as `ChunkEnrichment`. Never populated this sprint; a future engine (UCE-5, the
Learning Session Engine) fills it in without redesigning `ConceptGraphNode`.

## Reserved Assessment Layer (architecture only)

`GraphAssessmentSignals` — deliberately **not** a field on `GraphNode`. Assessment/memory data (memory
strength, retention, quiz history, learning confidence) is inherently **per-learner**, while a
`LearningKnowledgeGraph` is shared/document-level — one graph serves every learner who studies that
document. Embedding per-learner state on a shared node would either force one node per learner (breaking
"single source of truth"/concept dedup) or force mutating shared state on every learner action. Instead,
`GraphAssessmentSignals` is documented to attach **externally**, keyed by `(learnerId, nodeId)` — a future
separate join, never a graph node field. No logic or storage was built — the shape and this reasoning are
the whole deliverable.

## Caching Strategy

1. The `builds-upon` AI calls inherit AIFoundation's own cache/retry/cost-tracking for free — the same
   pattern as UCE-3B, no new caching logic.
2. `createGraphIndex(graph)`'s adjacency map is built **lazily**, on the first traversal call, and memoized
   on the returned index instance (never on the plain, immutable `LearningKnowledgeGraph` data object) — the
   real "Graph cache... Lazy loading."
3. No new persistent storage cache — deterministic graph construction from real chunk data is itself cheap
   (same "in-memory, disclosed" scope as AIF-1/UCE-3B), and no database/API work is in scope this sprint.

## Versioning Strategy

`GraphVersion { schemaVersion, revision }` — identical pattern to `LearningChunk`'s `ChunkVersion`.
`buildLearningKnowledgeGraph` always starts at revision 1; `updateLearningKnowledgeGraph` increments it,
preserves `id`/`createdAt`, and updates `lastModifiedAt`.

## Traversal Strategy

`createGraphIndex(graph)` exposes `getNeighbors(nodeId, direction?)`, `getEdgesByType(type)`, and a real BFS
`findPath(fromNodeId, toNodeId)` (shortest path by edge count, respecting direction for directed edges, both
directions traversable for `related-to`). All three read from the same lazily-built adjacency map.

## Incremental Update Strategy — What "Partial Rebuild" Actually Means

`nodes` and every deterministic structural edge are **cheaply, fully recomputed** from the complete, current
chunk set on every update — disclosed honestly, not a shortcut: a concept's `occurrenceCount`/`chunkIds` and
every structural edge are corpus-wide aggregates, so a genuinely correct partial recompute of them would
still need to see every chunk. This is safe because deterministic construction has no AI/network cost.

The **real** "Incremental updates... Partial rebuilds" savings is in the one genuinely expensive part: the
AI-derived `builds-upon` edges. `updateLearningKnowledgeGraph` **reuses** every existing `builds-upon` edge
from the prior graph whose source concept's introducing chunk is untouched (and whose source/target concepts
still exist) — `AIFoundation.execute()` only runs again for chunks named in `updatedChunkIds`.

## Extension Strategy

A future UCE-5 (AI Learning Analysis Engine) or the Learning Session Engine imports only
`@/core/universal-learning-engine/knowledge-graph`, reads `LearningKnowledgeGraph`/traverses via
`createGraphIndex`, and populates `ConceptGraphNode.learning` (`GraphLearningMetadata`) — no redesign of
`GraphNode`/`GraphEdge`/`LearningKnowledgeGraph` required. A future Flashcards™/MCQs™/Revision™ engine
attaches `GraphAssessmentSignals` externally via `(learnerId, nodeId)` — no redesign either. A future UCE-4.1
could populate the reserved edge types once their upstream signals exist (real formula detection, a
question-generation engine, a document-revision signal) without touching the type system, since
`GraphEdgeType` already names all 14.

## Validation Results

1. `npx tsc --noEmit` — clean, zero errors on the first attempt.
2. `npx vitest run` — **519 test files / 3494 tests passed** (up from 509/3427 after UCE-3B — 67 new tests
   across 10 files: `normalizeConceptLabel` (5), `hashToId` (3), `computeEdgeId` (4), `buildConceptIndex`
   (7), `buildStructuralEdges` (11), `buildBuildsUponPrompt` (4), `parseBuildsUponResponse` (9), `graphIndex`
   (11), `buildLearningKnowledgeGraph` (9), `updateLearningKnowledgeGraph` (4)), zero regressions — the
   existing `learning-chunk` suite passed unchanged after the doc-only corrections.
3. `npm run build` — succeeded on the first attempt, no retry needed.
4. `npx eslint` — 5 real issues found and fixed (missing explicit return types on test-file arrow constants,
   one unused type import), clean after.
5. Scope check — `ai-foundation/`, `chunking/`, `extraction/`, `upload/`, `semantic-enrichment/` show zero
   sprint-caused changes; `learning-chunk/` shows exactly the two disclosed doc-only files; all new code
   lives under `knowledge-graph/`.
6. No circular dependencies — grep-confirmed nothing `knowledge-graph` depends on imports back from it.
7. No duplicate graph entities — explicitly asserted in tests: the same concept across 3 chunks produces
   exactly 1 node; the same co-occurrence pair across chunks strengthens exactly 1 edge, never duplicates.

## Remaining Roadmap

- **UCE-5 (AI Learning Analysis Engine)** — the locked next stage; populates `GraphLearningMetadata`.
- **Cross-document concept merging** — enabled by today's stable, deterministic concept ids, not built this
  sprint (this sprint's graph stays scoped to one document, no persistence/APIs in scope).
- **`explains`/`summary-of`/`formula-for`/`question-for`/`revision-of`** — once their real upstream signals
  exist (see "Genuinely reserved" table above for each one's specific blocker).
- **Assessment Layer attachment** — once a real Flashcards™/MCQs™/Revision™ engine exists to populate
  `GraphAssessmentSignals` via its own `(learnerId, nodeId)` join.

## Stop

Per the brief, no UCE-5, UCE-6, Learning Session Engine, Quantum Speed Reading, Memory Mode, Flashcards,
MCQs, AI Mentor, or UI work was started. Waiting for review before any further work.

# Production Handoff — UCE-3B: Semantic Enrichment Engine™

## Summary

UCE-3B enriches existing `LearningChunk` objects with real, AI-derived semantic data — it never creates
chunks, never changes chunk boundaries, never reparses a document. Every AI request goes through
`AIFoundation.execute(task, payload)` (AIF-1) — this engine never imports Claude, the Anthropic SDK, or any
other provider directly. Enrichment produces a **new** `LearningChunk` per input chunk; the original is
never mutated.

## Two Disclosed, Additive Corrections to Prior Sprints

Both confirmed necessary by re-reading the current code before designing against it, not assumed:

1. **`ChunkEnrichment`'s field-ownership comments were updated, not the fields themselves.** The Learning
   Chunk sprint's own comments assigned `entities`, `difficulty`, `importance`, `learningObjectives`,
   `misconceptions`, `dependencies`, and `prerequisites` to "UCE-4"/"UCE-5" — reasonable guesses made before
   this sprint's brief existed, which explicitly assigns all seven to UCE-3B. No type or shape changed, only
   which engine populates each field. `dependencies`/`prerequisites` are populated as **concept-name
   strings** ("basic algebra," not a chunk id) — UCE-3B enriches one chunk at a time with no view of the rest
   of the corpus, so it cannot resolve a real cross-chunk id; that resolution stays UCE-4's job (Knowledge
   Graph Engine), consistent with this sprint's own "Do NOT implement Knowledge Graph."
2. **Three new, additive `ChunkEnrichment` fields**: `definitions?: readonly ChunkDefinition[]`
   (`{ term, definition }` pairs), `importantTerms?: readonly string[]`, `examples?: readonly string[]` — the
   brief's "Definitions," "Important Terms," and "Examples" tasks had no corresponding field before this
   sprint. "Summaries" maps onto the *existing* `semantic?: string` field (already documented as "a short
   semantic summary" — exactly what a summary is), so no new field was needed there. `embeddingId`/`vectorId`
   remain unpopulated — `AIFoundation` has no embeddings capability yet (only `provider.generate()` text
   calls), disclosed explicitly in the field's own comment rather than left as a stale, unfulfilled label.

## Architecture

```
src/core/universal-learning-engine/semantic-enrichment/
  types/            EnrichmentOptions, EnrichmentOutcome, BatchEnrichmentResult
  internal/
    buildEnrichmentPrompt.ts    (chunk, document) -> AIFoundationPayload
    parseEnrichmentResponse.ts  raw AI text -> { enrichment, confidence, warnings }
    mergeEnrichment.ts          (chunk, parsed, confidence) -> new LearningChunk
    isAlreadyEnriched.ts        chunk -> boolean (idempotency check)
  enrichLearningChunk.ts        single-chunk orchestrator
  enrichLearningChunks.ts       batch orchestrator (bounded concurrency)
  index.ts                      public barrel
```

`ai-foundation/`, `chunking/`, `extraction/`, `upload/` show zero diff from this sprint — confirmed by scope
check. Only `learning-chunk/types/ChunkEnrichment.ts` and its two barrels (`types/index.ts`, `index.ts`)
changed, both additively.

## Design Decision: One Combined Request Per Chunk, Not Thirteen

The brief lists 13 enrichment categories but also requires "Avoid one API request per paragraph... Process
intelligently." Firing 13 separate `AIFoundation.execute()` calls per chunk would be the opposite of that.
UCE-3B instead makes **one** `AIFoundation.execute('semantic-enrichment', payload)` call per chunk, with a
single prompt (`buildEnrichmentPrompt`) asking the model for one structured JSON object covering every
UCE-3B-owned category at once. `'semantic-enrichment'` already existed in the locked `AITask` union from
AIF-1 — **zero change to AIF-1's architecture was needed.**

True cross-chunk batching (combining several chunks into one prompt to reduce request count further) was
**not** built this sprint — it requires multi-key structured-response parsing and per-chunk partial-failure
handling *within* one AI response, materially more complex than this sprint's scope warrants. Listed under
"Remaining Roadmap" below.

## Processing Pipeline

```
enrichLearningChunk(chunk, document, aiFoundation, options)
  1. isAlreadyEnriched(chunk)?
       yes, and !options.forceReprocess → outcome: 'skipped' (no AI call made)
  2. buildEnrichmentPrompt(chunk, document) → AIFoundationPayload
       real chunk.content sent verbatim (never truncated/re-summarized before sending);
       real document title + section heading included as context
  3. aiFoundation.execute('semantic-enrichment', payload, chunk.id)
       raced against a real timeout (options.timeoutMs, default 30s — new here; AIF-1 itself
       has no timeout, confirmed by reading executeWithRetry.ts directly)
       failure → outcome: 'failed' { error, processingTimeMs }
  4. parseEnrichmentResponse(response.content)
       extracts the first JSON object (tolerant of markdown fences), validates every field,
       drops (never defaults) anything missing/malformed/out-of-range
       response wasn't valid JSON at all → { enrichment: {}, confidence: null, warnings } —
       NOT a failure; a genuine AI response was received, just no usable structured data
  5. mergeEnrichment(chunk, parsed.enrichment, parsed.confidence)
       new LearningChunk: same id/content/blocks/source/location/statistics/media/tables/
       language/accessibility/tags; enrichment = { ...chunk.enrichment, ...parsed } (a field
       the new response omits keeps its previous value — never blanked out); status ->
       'semantically-enriched'; version.revision + 1; confidence.semantic/overall set;
       one real ChunkAuditEntry appended
  6. outcome: 'enriched' { chunk: <new chunk>, cacheHit, processingTimeMs }
```

`enrichLearningChunks(chunks, document, aiFoundation, options)` runs this per chunk with bounded concurrency
(default 3, `options.concurrency` to override), continues past any individual chunk's failure, and
aggregates into one `BatchEnrichmentResult` (`enrichedCount`/`skippedCount`/`failedCount`).

## Caching Strategy

Two complementary layers, not one rebuilt on top of the other:

1. **AIFoundation's own cache** (already built in AIF-1) — keyed by a hash of `(task, exact prompt)`.
   Identical chunk content processed for `'semantic-enrichment'` twice, in any two calls to
   `enrichLearningChunk`, automatically hits this cache on the second call. UCE-3B does nothing extra to get
   this — it's inherited for free by calling `aiFoundation.execute()`.
2. **UCE-3B's own chunk-level idempotency check** (`isAlreadyEnriched`) — a cheaper, local check *before*
   even building a prompt: if the chunk itself already carries real UCE-3B enrichment data (`status ===
   'semantically-enriched'` and at least one UCE-3B-owned field is populated), skip entirely — no prompt
   built, no `AIFoundation.execute()` call, no cache lookup. `options.forceReprocess` bypasses this for
   deliberate re-processing/versioning.

"Never perform duplicate AI work" holds at both layers: re-running a whole document's enrichment is cheap
(layer 2 skips completed chunks), and even a genuinely new call for identical content across two different
chunks with the same text hits layer 1.

## Retry Strategy

- **Provider-level retry, rate limiting, provider-unavailable handling**: fully inherited from
  `AIFoundation.execute()` — UCE-3B does not reimplement any of this.
- **Timeout**: new here (`enrichLearningChunk`'s `withTimeout` wrapper) — AIF-1 has none today.
- **Partial failures / skip / continue**: `enrichLearningChunks` never lets one chunk's failure stop the
  batch; every chunk gets its own `EnrichmentOutcome`.
- **Resume**: re-invoking `enrichLearningChunks` with the same chunk array — already-enriched chunks are
  skipped via `isAlreadyEnriched`, previously-failed ones are retried. No new persistence layer, consistent
  with AIF-1's own in-memory-only scope disclosure.
- **Force reprocessing / versioning**: `options.forceReprocess` bypasses the idempotency skip; the resulting
  chunk gets `version.revision` incremented again and a new `ChunkAuditEntry`, with prior enrichment fields
  the new response doesn't address left intact (superseded field-by-field, not wholesale replaced).

## Cost Strategy

Nothing new to build — every field the brief's "Performance" section lists (processing time, tokens,
provider, model, cache hit/miss, estimated cost) is already captured by AIF-1's `AIFoundationResult`/
`CostTrackingEntry` on every `execute()` call. `EnrichmentOutcome` carries `cacheHit`/`processingTimeMs`
through from the underlying `AIFoundationResult` so a caller doesn't have to reach into AIF-1 directly to see
them; full cost/token detail is available via whatever `CostTracker` instance the caller's `AIFoundation` was
constructed with.

## Confidence Scoring

`ChunkConfidence.semantic` is set from the model's own self-reported `"confidence"` field in its JSON
response — disclosed as **LLM-self-reported, not independently verified**, the same honesty framing this
whole arc has used for every AI-adjacent signal. `ChunkConfidence.overall` is a real, disclosed, simple
average of the always-`1.0` structural confidence and the semantic confidence — not a fabricated combined
score.

## Validation Results

1. `npx tsc --noEmit` — clean, zero errors on the first attempt.
2. `npx vitest run` — **509 test files / 3427 tests passed** (up from 503/3381 after AIF-1 — 46 new tests:
   `buildEnrichmentPrompt.test.ts` (6), `parseEnrichmentResponse.test.ts` (13, including the mock-provider
   natural-language-response case as a real, expected, non-crashing path), `mergeEnrichment.test.ts` (9),
   `isAlreadyEnriched.test.ts` (6), `enrichLearningChunk.test.ts` (7, including a real timeout test),
   `enrichLearningChunks.test.ts` (5, including a real bounded-concurrency assertion)), zero regressions —
   the existing `learning-chunk` test suite passed unchanged after the additive `ChunkEnrichment` extension.
3. `npm run build` — succeeded on the first attempt, no retry needed.
4. `npx eslint` on all new/changed files — clean, zero errors.
5. Scope check — `ai-foundation/`, `chunking/`, `extraction/`, `upload/` show zero sprint-caused changes;
   `learning-chunk/` shows exactly the three disclosed additive files (`ChunkEnrichment.ts` and its two
   barrels); all other new code lives entirely under `semantic-enrichment/`.

## Remaining Roadmap

- **UCE-4 (Knowledge Graph Engine)** — the locked next stage. Consumes UCE-3B's concept-name
  `dependencies`/`prerequisites` and resolves them into real cross-chunk graph edges
  (`enrichment.crossReferences`, `enrichment.graphNodeId`, and non-adjacency `ChunkRelationship` entries) —
  none of which UCE-3B populates.
- **Cross-chunk batching** — a disclosed, deliberately-deferred optimization: combining several small chunks
  into one AI request (respecting token limits) to reduce request volume further than "one request per
  chunk" already achieves. Not built this sprint due to the added complexity of multi-key structured-response
  parsing and per-chunk partial-failure handling within a single AI response.
- **Embeddings** (`enrichment.embeddingId`/`vectorId`) — blocked on `AIFoundation` gaining an embeddings
  capability; `AIFoundation.execute()` today only supports text-generation tasks via `provider.generate()`.
- **`readingComplexity`** — a real, non-AI formula (e.g. Flesch-Kincaid) could compute this independently of
  UCE-3B's AI call; still explicitly out of this sprint's scope (the brief's "Reading Difficulty" task maps
  to the categorical `difficulty` field, not this numeric one).

## Stop

Per the brief, no UCE-4, UCE-5, UCE-6, Learning Session Engine, Learning Modes, Knowledge Graph, Flashcards,
MCQs, Notes, Mind Maps, or AI Mentor work was started. Waiting for review before any further work.

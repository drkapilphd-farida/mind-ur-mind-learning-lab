# Architecture — Learning Chunk™ Canonical Domain Model

## Summary

This sprint designs and implements the **Learning Chunk™** — the single, canonical object every downstream
engine (UCE-3B onward) and every Learning Mode will consume. `UniversalLearningDocument` (UCE-2) and
`ReadingChunk`/`ChunkedLearningDocument` (UCE-3A) stay internal to this engine; nothing outside it ever
touches a raw PDF/DOCX/OCR result/raw paragraph again. This is **pure domain-model design**: 22 named
production interfaces, a real mapping builder, a structural validator, JSON serialization, and one factory.
No AI, no embeddings, no semantic understanding, no Knowledge Graph, no Learning Sessions — those are named,
typed, and explicitly left empty for the engines that will populate them.

## Why This Shape

**One canonical object, not five.** Every prior sprint (UCE-1, UCE-2, UCE-3A) produced a real, working, but
narrowly-scoped type for its own stage. Without a canonical object, every future engine and every Learning
Mode would need to know about `UniversalSource` → `UniversalLearningDocument` → `ReadingChunk` just to read
a paragraph of text. `LearningChunk` collapses that chain into one object a consumer can hold without
knowing any of the pipeline stages behind it — the same reason a compiler emits one IR, not a chain of
lexer/parser-specific structs, for every later pass to consume.

**Every field is real or explicitly reserved — never fabricated.** This is the same discipline every prior
sprint in this arc has followed (image detection = presence-only, never OCR; language = honest `null`, never
guessed; PDF page count = real, DOCX/TXT page count = `null`). Applied here field-by-field:

| Populated for real today | Explicitly reserved (never set this sprint) |
|---|---|
| `id`, `content`, `blocks`, `source`, `location`, `statistics`, `readingMetrics`, `hierarchy` (flat), `confidence.structural`, `media`, `tables`, `language` (honest null), `accessibility`, `audit`, `version` | `enrichment.*` (all 20 fields), `confidence.semantic`/`overall`, `formulas`, `code`, `citations`, `tags` (empty, not absent), `status` (always `'structural'`), `extensions` (empty `{}`) |

**One disclosed, deliberate exception — `previous`/`next` relationships are populated today.** The brief
lists 13 relationship types and says "do NOT compute them." Read literally, `previous`/`next` are the one
kind that isn't a computed judgment at all — chunk order within a document is a 100% deterministic
structural fact established by UCE-3A's own `order` field, the same class of fact as `location.order`
itself. `buildLearningChunk` populates exactly these two, always with `computedBy: 'structural'` and
`confidence: 1`. All 11 other relationship types (`related`, `depends-on`, `explains`, `references`,
`example-of`, `summary-of`, `diagram-for`, `question-for`, `definition-of`, `parent`, `child`) are correctly
typed in `ChunkRelationshipType` but never emitted this sprint — reserved for UCE-3B (`'semantic'` origin)
and UCE-4 (`'graph'` origin).

**`formulas`/`code`/`citations` stay empty for a different reason than `enrichment` — a missing detection
signal, not an AI dependency.** UCE-2's extractors don't preserve LaTeX delimiters, monospace/font signals,
or footnote markers, so there is no real way to tell a code snippet or formula apart from a plain paragraph
today, unlike tables/images, which UCE-2 already detects structurally. This is disclosed as a future *UCE-2*
extension (pattern-based, non-AI — the same class of change UCE-3A's own image detection was), not a
UCE-3B/AI dependency. `readingComplexity` in `ChunkEnrichment` carries the same disclosure for the same
reason: a real Flesch-Kincaid-style formula could compute it without AI, but it's scoped as future work here
since the brief places all of `ChunkEnrichment` in the "do not populate" bucket.

## Folder Structure

```
src/core/universal-learning-engine/learning-chunk/
  types/
    LearningChunk.ts        — LearningChunk, ChunkStatus, ChunkVersion, ChunkMetadata
    ChunkIdentity.ts         — ChunkReference, ChunkSource
    ChunkLocation.ts
    ChunkStatistics.ts       — ChunkStatistics, ChunkReadingMetrics
    ChunkRelationship.ts     — ChunkRelationshipType (13 values), ChunkRelationship, ChunkHierarchy
    ChunkConfidence.ts
    ChunkAudit.ts
    ChunkContent.ts          — ChunkMedia, ChunkTable, ChunkFormula, ChunkCode, ChunkCitation
    ChunkLanguage.ts
    ChunkAccessibility.ts
    ChunkTags.ts
    ChunkExtensions.ts
    ChunkEnrichment.ts       — the UCE-3B..UCE-6 / Learning Session Engine future-fields container
    index.ts                 — barrel for every type above
  internal/
    blockText.ts             — shared block→text logic (builder assembles `content`; validator verifies it)
  builders/
    buildLearningChunk.ts (+ test)      — real mapping: ReadingChunk + ChunkedLearningDocument + UniversalLearningDocument → LearningChunk
  validators/
    validateLearningChunk.ts (+ test)  — real structural invariant checks, Result-type return
  serialization/
    learningChunkSerializer.ts (+ test) — serialize/deserialize with real validation on the way back in
  factories/
    createEmptyChunkEnrichment.ts (+ test)
  index.ts                   — top-level barrel, the one import path every future consumer uses
```

22 named interfaces from the brief are all present: `LearningChunk`, `ChunkMetadata`, `ChunkLocation`,
`ChunkStatistics`, `ChunkRelationship`, `ChunkReference`, `ChunkStatus`, `ChunkVersion`, `ChunkConfidence`,
`ChunkReadingMetrics`, `ChunkHierarchy`, `ChunkAudit`, `ChunkSource`, `ChunkMedia`, `ChunkTable`,
`ChunkFormula`, `ChunkCode`, `ChunkCitation`, `ChunkLanguage`, `ChunkAccessibility`, `ChunkTags`,
`ChunkExtensions`.

## The Domain Model

**`LearningChunk`** ties together every field described above (see `types/LearningChunk.ts` for the full
shape and per-field comments naming which future engine owns each reserved field).

**`ChunkStatus`**: `'structural' | 'semantically-enriched' | 'graph-linked' | 'ai-analyzed'` — every chunk
built this sprint is `'structural'`. A consumer can branch on this field alone without needing to inspect
which `enrichment` fields happen to be set.

**`ChunkVersion`**: `{ schemaVersion, revision }` — `schemaVersion` versions the *shape* of `LearningChunk`
itself (`"1.0.0"`, bumped only on a breaking change); `revision` versions one specific chunk's real edit
history (starts at `1`, incremented only by a future real update — nothing revises a chunk today).

**`ChunkMetadata`** (the interface the brief names but the original plan's field list initially missed —
added here to close that gap): `{ title, documentTitle, contentType }`, real display metadata distinct from
`ChunkSource` (relational ids) and `ChunkLocation` (structural position) — lets a Learning Mode render a
chunk without joining back to the full document. `title`/`documentTitle` reuse real values verbatim;
`contentType` (`'text' | 'mixed'`) is a real derivation from whether the chunk's own blocks include a
table/image.

**`ChunkSource`** / **`ChunkReference`**: full real traceability back through UCE-2 and UCE-1
(`documentId`, `universalSourceId`, `sectionId`, `originalSourceType`) — "maintain document traceability"
without re-embedding any raw content.

**`ChunkStatistics`** / **`ChunkReadingMetrics`**: real counts computed from the chunk's own blocks, and a
reading-time estimate using the same 200 WPM assumption already established in
`extraction/services/computeReadability.ts` and `src/lib/reading/generateReadingPassage.ts` (kept as a
local constant in `buildLearningChunk.ts`, matching how both of those files already declare it locally
rather than importing a shared one).

**`ChunkHierarchy`**: `{ depth: 0, path: [id], parentChunkId: null }` — real but flat, since UCE-3A produces
a flat sequence with no nesting. The shape exists so a future engine that nests chunks doesn't need a
breaking change.

**`ChunkConfidence`**: `structural` is always `1` (deterministic chunking has no uncertainty to express);
`semantic`/`overall` stay `null` until UCE-3B produces a real signal — never a fabricated confidence score.

**`ChunkMedia`** / **`ChunkTable`**: real, mapped 1:1 from the chunk's own real UCE-2 `'image'`/`'table'`
blocks — pure re-shaping, no new detection. **`ChunkAccessibility`** is derived from that same real media
list (`hasAltText` true only when at least one real media item carries real alt text;
`requiresScreenReaderReview` true when any media item lacks it).

**`ChunkEnrichment`**: all 20 brief-listed fields, each documented with which future engine populates it —
`semantic`/`concepts`/`keywords`/`embeddingId`/`vectorId` → UCE-3B; `entities`/`difficulty`/`importance`/
`learningObjectives`/`misconceptions`/`taxonomy`/`bloomsLevel`/`readingComplexity` → UCE-5;
`dependencies`/`prerequisites`/`crossReferences`/`graphNodeId` → UCE-4; `memoryPriority`/`revisionPriority`/
`attentionScore` → the Learning Session Engine. `createEmptyChunkEnrichment()` is the one place `{}` is
constructed, reused by the builder today and intended for future engines to build on when they enrich a
chunk (see "Update Strategy" below).

## Immutability, Versioning, Update Strategy, Audit Strategy

**Immutable fields**: `id`, `source`, `blocks`, `content` never change after a chunk is built — they are
facts about what UCE-1/UCE-2/UCE-3A actually extracted. Changing them would mean the chunk no longer
represents the same slice of the same document.

**Update strategy — enrichment produces a new chunk, never a mutation.** When UCE-3B (or any later engine)
enriches a chunk, it does not mutate `enrichment` in place. It builds a **new** `LearningChunk` — same `id`,
same immutable fields, `enrichment` merged with the new real fields, `status` upgraded, `version.revision`
incremented, `audit.lastModifiedAt`/`lastModifiedBy` updated, and one new `ChunkAuditEntry` appended to
`audit.history` describing what changed and why. This keeps every previous version's audit trail intact and
matches this codebase's existing Result-type/immutable-data conventions rather than introducing in-place
mutation anywhere in the engine.

**Audit strategy**: `audit.createdAt`/`createdBy` are set once, at build time, by `buildLearningChunk`
(`'system'` — no human step is involved in structural chunking). `history` starts empty and only grows when
a real update happens, per the update strategy above.

**Enrichment strategy**: a chunk's `status` communicates how far it has progressed
(`structural → semantically-enriched → graph-linked → ai-analyzed`) without a consumer needing to inspect
individual `enrichment` fields to know what's trustworthy yet.

## How Downstream Engines Will Consume This

- **UCE-3B (Semantic Enrichment Engine)** reads a `'structural'` `LearningChunk`, computes real embeddings/
  topic boundaries/concept relationships, and produces a new chunk with `enrichment.semantic`/`concepts`/
  `keywords`/`embeddingId`/`vectorId` set, `confidence.semantic` populated, and `status` upgraded to
  `'semantically-enriched'`. It never touches `UniversalLearningDocument` — `LearningChunk` is its only
  input.
- **UCE-4 (Knowledge Graph Engine)** reads `relationships` and `hierarchy`, adds real graph edges
  (`related`/`depends-on`/etc. with `computedBy: 'graph'`), and sets `enrichment.graphNodeId`/
  `crossReferences`/`dependencies`/`prerequisites`, upgrading `status` to `'graph-linked'`.
- **UCE-5 (AI Learning Analysis Engine)** reads a chunk's `content` plus any prior `enrichment`, and sets
  `enrichment.entities`/`difficulty`/`importance`/`learningObjectives`/`misconceptions`/`taxonomy`/
  `bloomsLevel`, upgrading `status` to `'ai-analyzed'`.
- **UCE-6 (Universal Learning Object)** aggregates a document's full set of enriched `LearningChunk`
  objects (via `location.totalChunksInDocument`/`relationships` for real ordering) into the final learner-
  facing object.
- **The Learning Session Engine and every Learning Mode** read `LearningChunk` only — never
  `UniversalLearningDocument`, never a raw PDF/DOCX/paragraph. They use `enrichment.memoryPriority`/
  `revisionPriority`/`attentionScore` once a real adaptive engine sets them; until then, those fields are
  simply absent and a Learning Mode falls back to `location`/`order`-based sequencing, which is real today.

## Builder, Validator, Serialization

- **`buildLearningChunk(readingChunk, chunkedDocument, document, options?)`** — pure mapping from a real
  UCE-3A `ReadingChunk` (plus its sibling `ChunkedLearningDocument`, for real order-adjacency and count, and
  its source `UniversalLearningDocument`, for real traceability/title) into a `LearningChunk`.
  `buildLearningChunks(chunkedDocument, document, options?)` is a batch convenience wrapper sharing one
  timestamp across the whole document's chunks. `options.now` is the only DI seam — `id` is reused verbatim
  from `readingChunk.id`, never generated, so no `idFactory` is needed (unlike UCE-1's `buildUniversalSource`,
  which does generate a new id).
- **`validateLearningChunk(chunk)`** — real structural invariant checks (non-empty `id`, `version.revision`
  is a valid positive integer, `location.order` is in range, `content` matches the real text of `blocks`,
  `statistics` counts match `blocks`/`tables`/`media`, `confidence` values are in `[0,1]`, no relationship
  targets the chunk itself, `audit` timestamps are valid ISO dates). Returns
  `{ valid: true } | { valid: false; errors: readonly string[] }`, collecting every violation rather than
  stopping at the first.
- **`serializeLearningChunk`/`deserializeLearningChunk`** — every field is already plain, JSON-safe data
  (ISO string timestamps, no class instances), so serialization is `JSON.stringify`/`JSON.parse`.
  `deserializeLearningChunk` runs `validateLearningChunk` on the parsed result before returning it, so a
  corrupted or malformed payload is caught, never silently trusted.

## Validation Results

1. `npx tsc --noEmit` — clean, zero errors.
2. `npx vitest run` — **495 test files / 3329 tests passed** (up from 491/3300 after UCE-3A — 29 new tests:
   14 in `buildLearningChunk.test.ts`, 2 in `buildLearningChunks` describe block within the same file, 9 in
   `validateLearningChunk.test.ts`, 4 in `learningChunkSerializer.test.ts`, 2 in
   `createEmptyChunkEnrichment.test.ts`), zero regressions, no flake on this run.
3. `npm run build` — succeeded on the first attempt, no retry needed. This engine isn't wired into any page
   (no UI/Server Action/database touched this sprint, per the brief's explicit non-goals).
4. `npx eslint` on all new files — one real issue found and fixed (a test file's inline arrow function was
   missing an explicit return type per this repo's `@typescript-eslint/explicit-function-return-type` rule);
   clean after the fix.
5. `git status` scope check — the entire `universal-learning-engine/` tree (UCE-1 through this sprint) has
   never been committed, so there is no tracked baseline for `chunking/`/`extraction/`/`upload/` to diff
   against; confirmed instead by inspection that this sprint touched only new files under `learning-chunk/`
   plus this document — no existing file in `chunking/`, `extraction/`, or `upload/` was edited.

## Future Extension Points

- **UCE-3B** enriches these chunks — the next phase, per the locked sequence.
- **UCE-2 extension for `formulas`/`code`/`citations`** — a real, non-AI, pattern-based detection signal
  (LaTeX delimiters, monospace/font markers, footnote patterns) would let these three fields populate for
  real without any AI dependency — disclosed here as a lower-risk, independent piece of future work.
- **`readingComplexity`** — similarly could be computed today via a real formula (e.g. Flesch-Kincaid)
  without needing UCE-5's AI analysis, but stays inside `ChunkEnrichment` (never populated this sprint) since
  the brief scopes all of `ChunkEnrichment` as future work.

## Stop

Per the brief's explicit instruction, no UCE-3B, UCE-4, enrichment logic, or Learning Session Engine work
was started. Waiting for review before any further work.

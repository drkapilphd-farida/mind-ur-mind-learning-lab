# Production Handoff — AI Learning Studio™ Sprint ALS-10: Universal Content Engine™ Wiring

## A naming clarification, disclosed up front

This sprint was requested as "AI Learning Studio™ Sprint ALS-10 — Universal Content Engine™
Foundation (UCE-1)," with the doc requested at `docs/PRODUCTION_HANDOFF_UCE_1.md`. That exact path
already exists — it's the real historical handoff for the actual UCE-1 sprint (`Universal Upload
Parser™`, `universalUploadParser`/`UniversalSource`), and **`docs/PRODUCTION_HANDOFF_UCE_2.md` through
`_6.md` also already exist**, one per stage of an already-complete pipeline
(extraction/chunking/semantic-enrichment/knowledge-graph/learning-analysis/ULO-assembly). None of the
six were touched or redesigned this sprint. Rather than overwrite real prior documentation under a
name that belongs to different, already-shipped work, this doc is filed under this arc's own
established `ALS-N` naming (matching ALS-1 through ALS-9) — this sprint's actual, accurate scope is
**wiring the already-complete UCE-1…6 pipeline to a real trigger for the first time**, plus adding the
real file storage that pipeline always assumed would eventually exist.

## Status: COMPLETE (code). Migration written, deliberately NOT applied — see Known Limitations. No extraction/chunking/graph/analysis/ULO algorithm was written or redesigned this sprint; all six were already real, tested, and orphaned.

## The investigation that reframed this sprint before any code was written

A thorough investigation of `src/core/universal-learning-engine/` (a dedicated research pass, before
writing anything) found **the entire UCE-2 through UCE-6 pipeline already exists** — real, tested,
production-quality code:

- **Extraction (UCE-2)** — `extractPDF`/`extractDOCX`/`extractTXT` do genuine parsing (pdfjs-dist,
  mammoth): real per-page text, real page count, real word counts, real section/block structure.
- **Chunking (UCE-3A)** — genuine deterministic structural chunking, no AI.
- **Semantic enrichment (UCE-3B) / Knowledge graph (UCE-4) / Learning analysis (UCE-5)** — real, but
  each has a genuine AI-calling piece (enrichment calls, "builds-upon" graph edges, a strategy prompt).
- **ULO assembly (UCE-6)** — real, zero-AI, pure composition (`buildUniversalLearningObject`).

**Every one of these was 100% orphaned** — never called by any real route, only by test fixtures.
`saveUniversalLearningObject` was correct and ready but had zero real callers. Reading/Memory Runtime
already exclusively consume `ulo.knowledge.chunks[].content` — there was no raw-extracted-text bypass
to replace, because they were built correctly from the start. The entire gap was upstream: nothing
ever populated the ULO they already read, and no file storage existed anywhere to extract from.

**No new UCO/section type was invented.** `UniversalLearningDocument` (title, real metadata, sections,
wordCount, real pageCount, source) and `LearningChunk` (id, real `location.order`, real title via
`metadata.title`, real `content`, real `statistics.wordCount`, real `readingMetrics.estimatedReadingSeconds`)
already cover every field the brief's "Universal Metadata" and "Universal Section Model" asked for.
"Extraction status" already exists too — `documents.status` (`'processing'|'ready'|'failed'`), a real
column since Sprint 1, whose `'failed'` value had simply never been set by any code path until now.

## Two decisions made with founder input before writing code

1. **File storage.** Real extraction needs real bytes; none existed anywhere (`documents.storage_path`
   nullable since Sprint 1, always null in practice; zero Supabase Storage buckets in 32 prior
   migrations). Founder-confirmed: **add a real Supabase Storage bucket**, uploaded to directly from
   the browser (the conventional, RLS-secured Supabase pattern), extraction running server-side.
2. **Pipeline scope.** The brief states "this is NOT an AI feature," but UCE-3B/4/5 make real AI calls.
   Investigation found both `buildLearningKnowledgeGraph` and `buildLearningAnalysis` were *already
   designed* with AI as fully optional (`options.aiFoundation`) — omitting it skips the one AI-derived
   piece and returns everything else real, deterministic, and complete, not partial. Founder-confirmed:
   **stop before any AI-calling stage** — call both functions with no `aiFoundation`, deferring
   semantic-enrichment/AI-derived graph edges/AI-refined strategy to an explicit future sprint.

## What was built

### 1. Real file storage (`supabase/migrations/20260719000001_create_learning_documents_bucket.sql`)

A private `learning-documents` bucket, path convention `{user_id}/{uuid}/{filename}` (mirrors this
app's existing owner-first-segment RLS convention). `authenticated` users can `INSERT`/`SELECT` only
within their own folder — no `UPDATE`/`DELETE` policy yet, since no replace/delete capability exists
anywhere in the app to use one.

### 2. Real upload (`NewLearningProjectWizard.tsx`, `new/actions.ts`, `services/documents`)

The wizard now genuinely uploads the selected file to Storage (using the browser Supabase client —
the same authenticated-client pattern already used for `auth.getUser()` elsewhere) before calling the
existing `createLearningProjectWithDocument` action, which now accepts an optional `storagePath` and
persists it to the already-existing (previously always-null) `documents.storage_path` column. A
Storage upload failure is honestly non-fatal — the project/document row still gets created
metadata-only, exactly like every sprint before this one; the document simply won't have a real file
to extract from later, which the pipeline (below) handles as an honest "nothing to process" skip, not
an error.

### 3. Real orchestration (`src/lib/processing/buildAndSaveDocumentUniversalLearningObject.ts`)

The one new file with real sequencing logic — and it contains **zero new extraction/chunking/graph/
analysis logic**, only calls to six already-real, already-tested functions in order:

```
universalUploadParser.parse(file)              → real UniversalSource (re-detects format from the
                                                   real downloaded file, same real entry point the
                                                   Upload Experience™ already uses)
extractUniversalLearningDocument(file, source)  → real UniversalLearningDocument (UCE-2)
chunkUniversalLearningDocument(document)        → real ChunkedLearningDocument (UCE-3A)
buildLearningChunks(chunked, document)          → real LearningChunk[] (existing batch converter)
buildLearningKnowledgeGraph(chunks, document)   → real LearningKnowledgeGraph, no AI (UCE-4)
buildLearningAnalysis(chunks, document, graph)  → real LearningAnalysis, no AI (UCE-5)
buildUniversalLearningObject(document, chunks, graph, analysis) → real UniversalLearningObject (UCE-6)
saveUniversalLearningObject(serviceClient, ulo) → persisted (already existed, zero real callers before this)
```

Real extraction is attempted only for PDF/DOCX/TXT (this sprint's own explicit scope, verified via the
already-real `parsed.source.sourceType`) — every other accepted format (image, camera-scan) is
honestly **skipped**, not failed, preserving its exact pre-ALS-10 behavior (no ULO, "not processed yet"
shown honestly downstream, same as before this sprint). A genuine extraction failure (corrupt PDF,
unsupported legacy `.doc`) is a real, distinct outcome, handled below.

The one disclosed, intentional RLS bypass in this flow: the `universal_learning_objects` table has no
`authenticated` write policy by design (its own migration: "a user must never be able to write or
hand-edit their own row here directly"). Only the final save uses `createServiceClient()`
(`src/lib/supabase/service.ts`, already existed, previously used only by `sitemap.ts` and the Stripe
webhook) — every earlier step in the sequence runs with the caller's own authenticated client.

### 4. Wired into the existing pipeline, not a new stage (`processing/actions.ts`)

`finalizeLearningProjectProcessing` — the Server Action ALS-3's own "Session Initialization" stage
already calls — now also runs the orchestration above before `markDocumentReady`. **No stage was
added, renamed, or restructured** in the AI Processing Experience™ (ALS-3): same 5 stages, same ids,
same UI, same state machine. A genuine extraction failure now calls the new `markDocumentFailed`
(mirrors `markDocumentReady`'s exact pattern; `'failed'` was a real, reserved `documents.status` value
since Sprint 1 — the CHECK constraint and `[id]/page.tsx`'s own "This document couldn't be processed"
branch have always existed — but nothing had ever set it until now) instead of silently reaching a
fake-ready Blueprint with no real content.

### 5. Runtime integration — already correct, verified not changed

Investigated whether Reading/Memory Runtime needed any change to "consume the Universal Content Object
instead." They didn't — `ReadingChunkViewer`/`MemoryCard` already render `chunk.content` from
`resolveCurrentChunkView(runtime, ulo)`, which already reads exclusively from
`ulo.knowledge.chunks[].content`. **Zero changes to `ReadingWorkspace.tsx`, `MemoryWorkspace.tsx`,
`SmartNotesWorkspace.tsx`, or any Shared Learning Runtime file.** Once a real ULO exists for a document
(this sprint's real contribution), these already-correct components will show its real content with no
further work.

## Files created

```
supabase/migrations/20260719000001_create_learning_documents_bucket.sql
src/lib/processing/buildAndSaveDocumentUniversalLearningObject.ts
```

## Files modified

```
src/services/documents/index.ts          (+ storagePath in CreateDocumentInput/createDocument; + markDocumentFailed)
src/api/documents/index.ts                (+ markDocumentFailed re-export)
src/app/preview/learning-projects/new/actions.ts   (+ storagePath field, defense-in-depth ownership check)
src/components/learning/NewLearningProjectWizard.tsx  (+ real Storage upload before document creation)
src/app/preview/learning-projects/[id]/processing/actions.ts  (finalizeLearningProjectProcessing now runs the real pipeline)
```

## What was deliberately NOT touched

- Every extraction/chunking/semantic-enrichment/knowledge-graph/learning-analysis/ULO-assembly source
  file — read, understood, called, never edited. Their own historical docs
  (`docs/PRODUCTION_HANDOFF_UCE_1.md` through `_6.md`) remain accurate and untouched.
- `ReadingWorkspace.tsx`, `MemoryWorkspace.tsx`, `SmartNotesWorkspace.tsx`, and everything under
  `learning-mode-runtime/` — confirmed already correct, zero changes.
- `ProcessingExperience.tsx`, `PROCESSING_STAGES`, `useProcessingPipeline` — same 5 stages, same UI,
  same state machine as ALS-3 left them.
- `verifyDocumentUpload` (Upload Verification stage) — unchanged.
- AI Mentor, the legacy `/labs/quantum-speed-reading` track, Dashboard — untouched.

## Verification Results

- `npx tsc --noEmit` — clean on the first pass (the investigation's exact-signature groundwork paid
  off — no type mismatches between the orchestration code and the six real functions it calls).
- `npx eslint` scoped to every created/modified file — clean.
- `npx vitest run` (whole repo) — **635 test files, 3894 tests passed**, identical to the prior
  sprint's count. No new pure/testable logic was introduced (the new orchestration function is
  integration/sequencing code over already-individually-tested real functions, consistent with this
  project's established convention of not unit-testing I/O-heavy orchestration — Server Actions here
  are never unit tested either, only the pure functions underneath them are).
- `npm run build` — compiled successfully, 121 routes (unchanged). `/preview/learning-projects/new`
  grew from 146 kB to 204 kB (real — the browser Supabase client's Storage capability, imported into a
  client bundle for the first time anywhere in this app). This triggered a **widespread but small
  (~1 KB) shared-chunk shift across nearly every other route** — the same disclosed, non-functional
  webpack chunk-splitting phenomenon documented in every prior sprint, just its broadest occurrence yet
  because the triggering dependency addition (58 KB) was larger than any previous sprint's. Verified
  non-functional and stable, not a fluke, by rebuilding a second time with no source changes: **the
  second build is byte-identical to the first.**
- Manual check: dev server started; `/preview/learning-projects/new`, `/preview/learning-projects/
  test-id`, and its `/processing` route all returned clean `307`s with no server errors.

## Known Limitations — read this before assuming this sprint is "live"

- **The Storage bucket migration is written but deliberately NOT applied.** Running
  `supabase migration list` mid-sprint revealed this migration *and 5 earlier ones* (the ULO table,
  both Smart Notes migrations, both AI Mentor tables) are unapplied to whatever Supabase project this
  CLI is linked to — a real, hosted project (local Docker wasn't even running when this was checked).
  Applying database migrations is a consequential, hard-to-reverse action; founder-confirmed: leave all
  of them as files only, this sprint doesn't apply anything. **Practical consequence: until someone
  applies this migration, real uploads will still succeed exactly as before (the Storage upload call
  will fail gracefully, non-fatally, and the project/document row will still be created metadata-only)
  — but no real extraction will ever run, because there is no bucket to upload to or read from yet.**
  This sprint's code is correct and ready; it is not yet live.
- **Because the migration isn't applied, true end-to-end manual verification (actually upload a real
  PDF and watch it become a real ULO) could not be performed in this environment.** Verification this
  sprint is code-level (types, lint, unit tests, build, route reachability) — not a substitute for a
  real upload test once the migration is applied. Disclosed explicitly, not glossed over.
- Real extraction covers PDF/DOCX/TXT only, this sprint's own explicit scope. Images, camera-scans, and
  legacy `.doc` files keep their pre-ALS-10 behavior (accepted, stored if the bucket exists, but no ULO
  built) — an honest, disclosed, intentional limit, not an oversight.
- No AI-derived content anywhere in this sprint's real output (by design, per the founder's own second
  decision above) — chunks have no semantic enrichment, the knowledge graph has only structural edges,
  analysis has no AI-refined strategy. All three remain real, complete, and useful without them
  (per their own functions' own design), just not AI-enriched yet.
- `detectLanguage()` remains a disclosed, pre-existing stub (always returns `null`) — not touched or
  upgraded this sprint; the brief's own "language (if available)" phrasing already anticipates this.

## Next Recommended Sprint

1. **Apply the pending migrations** (this one plus the 5 earlier ones) — a deployment/ops decision, not
   a coding sprint, but the actual prerequisite for any of this sprint's real value to reach a real user.
2. **A real end-to-end verification pass** once applied — upload a real PDF, confirm a real ULO is
   saved, confirm Reading/Memory Runtime show its real chunk content.
3. **UCE-3B/4/5's AI-derived stages**, as an explicit, disclosed "UCE-AI" sprint — semantic enrichment,
   AI-derived knowledge-graph edges, AI-refined learning strategy — now that the deterministic
   foundation they build on top of is real and wired.

Neither is begun here. Waiting for explicit direction.

## Stop

Sprint ALS-10 complete. Do not begin the next sprint without approval.

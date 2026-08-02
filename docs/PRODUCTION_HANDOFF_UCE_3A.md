# Production Handoff — Sprint UCE-3A: Deterministic Structural Chunk Engine™

## Summary

**A premise correction preceded this sprint.** The locked architecture
(`UCE-1 → UCE-2 → UCE-3 → UCE-4 → UCE-5 → UCE-6 → Learning Session Engine`) assumed UCE-3 through UCE-6
already existed; a search of the codebase confirmed they did not — only UCE-1 (Upload Parser) and UCE-2
(Extraction Engine) were real. This was flagged to the user before any code was written (the alternative —
silently fabricating a "Universal Learning Object" to satisfy a Learning Session Engine brief — would have
violated that same brief's own "no placeholders, no fake AI" rules). **Confirmed direction**: build UCE-3
now, split into two phases. **This sprint is Phase A only** — deterministic structural chunking, zero AI/
embeddings. Phase B (UCE-3B — semantic/embedding-based enrichment) is explicitly not built; the output
type is shaped so Phase B can enrich these same chunks later without breaking anything downstream.

## Files Modified / Created

**Modified (additive only) — `src/core/universal-learning-engine/extraction/`:**
- `types/UniversalLearningDocument.ts` — one new `LearningContentBlock` union member: `'image'`
- `extractors/extractDOCX.ts` (+ test) — real embedded-image detection via mammoth's own `convertImage` hook
- `extractors/extractPDF.ts` (+ test) — real per-page image detection via pdfjs-dist's operator list

**New — `src/core/universal-learning-engine/chunking/` (UCE-3A itself):**
- `types/ReadingChunk.ts` — `ReadingChunk`, `ChunkedLearningDocument`
- `services/chunkSections.ts` (+ test) — the core deterministic algorithm
- `services/buildChunkedLearningDocument.ts` (+ test) — pure assembly
- `universalChunkEngine.ts` (+ test) — the one public entry point
- `index.ts` — barrel export

## The UCE-2 Extension — Why It Was Necessary, and Why It's Additive, Not a Redesign

This sprint's own requirement was to chunk using "headings, sections, paragraphs, tables, images, and
reading order." UCE-2 had no concept of images at all — neither extractor detected them. Two real,
dependency-free detection methods were confirmed before implementing:

- **DOCX**: `mammoth`'s own documented `images.imgElement()` hook lets the existing `convertToHtml()` call
  emit a marker (`data-mammoth-image`, `data-content-type`) per real embedded image. mammoth also
  automatically carries real `alt` text through when the source document has it — never invented.
- **PDF**: `pdfjs-dist`'s `page.getOperatorList()` exposes real per-page drawing operations; scanning
  `fnArray` for `paintImageXObject`/`paintInlineImageXObject`/`paintImageXObjectRepeat` detects real image
  presence without rendering anything.

**Both are presence + content-type detection only — never OCR, never pixel content, never a description.**
PDF-detected images always carry `alt: null` (the operator-list method has no alt-text signal; never
guessed). This is one new union member and new detection logic inside two existing extractors — zero
existing fields or behavior changed. Every pre-UCE-3A test still passes unchanged; new tests cover only the
new, additive paths. Not a redesign of UCE-2's architecture.

**One resulting behavior refinement, disclosed**: `extractPDF.ts` previously treated any page with zero
extractable text as contributing nothing. It now creates a real section for a page that has a detected
image but no text (honest: "we found an image here, no text" is real structural information) — but the
*document-level* `empty-extraction` check is unchanged: a PDF with images but zero text anywhere is still
reported as empty-extraction, since this engine doesn't OCR and has nothing a Learning Mode could actually
read from image-only content.

## Chunking Architecture

**Why structural chunking is a real strategy, not a stand-in for the real thing.** Many production
retrieval/RAG systems chunk by a document's own authored structure first (heading → section → paragraph
boundaries), falling back to size-bounded splitting only within an oversized section. This sprint does
exactly that — it never claims to detect topic shifts within undifferentiated prose, only uses boundaries
the document's own author already created, plus a disclosed word-count threshold. Nothing here is
presented as more intelligent than it is.

**`chunkSections(documentId, sections, targetWordsPerChunk = 200)`** — pure, fully deterministic (no
randomness anywhere in this sprint — a stronger guarantee than this codebase's usual seeded-mock
determinism, since nothing here is mock content at all, every field is real):
- A new chunk starts at every section boundary — a section is already a real, authored structural unit
  (DOCX: `groupIntoSections`'s heading-boundary grouping; PDF: one section per page; TXT: one section for
  the whole document).
- Within a section, a new chunk starts whenever the running word count crosses `targetWordsPerChunk`
  (`200`, a named, adjustable constant — same disclosed-default convention as the existing 200 WPM
  reading-speed assumption), always at a safe block boundary.
- **A table or image block is never split across chunks**, even if it alone exceeds the target — splitting
  a coherent structural unit would be a much bigger, riskier engineering problem than this sprint takes on,
  and "stable" chunks should never fragment something like a table mid-row.

**`ChunkedLearningDocument.semanticEnrichment` is always `null` this sprint** — the explicit UCE-3B hook.

## Files Modified / Created — Validation Results

1. `npx tsc --noEmit` — clean, zero errors (after fixing 3 real, non-trivial API-shape errors caught
   during implementation: `mammoth.convertToHtml()` takes two separate arguments, not one merged object;
   `mammoth.images.imgElement()`'s callback must return a `Promise<ImageAttributes>` including a required
   `src` field, not a plain sync object; and `PdfPageExtraction`'s new required `pageHasImage` field needed
   updating in every existing PDF test fixture).
2. `npx vitest run` — **491 test files / 3300 tests passed** (up from 488/3278 — 22 new tests: 4 in
   `extractDOCX.test.ts`, 3 in `extractPDF.test.ts`, 9 in `chunkSections.test.ts`, 4 in
   `buildChunkedLearningDocument.test.ts`, 2 in `universalChunkEngine.test.ts`), zero regressions. One
   unrelated pre-existing test (`mentor-conversation-engine`'s own clock-determinism test, a file never
   touched by this or any prior sprint) failed once on a 1ms timestamp race and passed clean on immediate
   retry — confirmed as a pre-existing flake, not a regression, the same "retry and confirm" pattern
   established for the unrelated `reading-discovery` build issue in prior sprints.
3. `npm run build` — succeeded on the first attempt, no retry needed this time. Every route's bundle size
   unchanged (this engine isn't wired into any page, per this sprint's explicit non-goal).
4. `npx eslint` on all new/changed files — clean, zero warnings or errors.
5. `git status`/`git diff --stat` scope check — confirmed `upload/` still has exactly its original 12
   files (untouched); `extraction/` has its original 12 files plus the 5 additively-edited ones (2 source
   files + their tests, plus the type file); the new `chunking/` folder is the only other addition.

## Future Extension Points

- **UCE-3B (Semantic Chunk Enrichment)** — the next phase, per the user's own two-phase direction. Adds
  real embedding-based topic-boundary detection and concept relationships to these same `ReadingChunk`
  objects via the reserved `semanticEnrichment` field, without changing anything that already consumes
  `ChunkedLearningDocument`.
- **UCE-4 (Knowledge Graph Engine™)** — per the locked sequence, consumes `ChunkedLearningDocument` next.
- **Image content understanding** — this sprint detects real image *presence* only. A future sprint could
  add real OCR or a vision-model call (a materially bigger, separate authorization, consistent with how
  every AI-adjacent capability in this codebase has been gated so far).
- **PDF alt-text** — PDF-detected images always have `alt: null` since operator-list scanning carries no
  alt-text signal; DOCX images already carry real alt-text when the source document has it.

## Stop

Per the user's explicit instruction, no UCE-3B, UCE-4, or Learning Session Engine work was started.
Waiting for review before any further work.

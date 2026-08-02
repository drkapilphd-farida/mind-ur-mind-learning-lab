# Production Handoff — Sprint UCE-1: Universal Upload Parser™

## Summary

A pure architecture sprint — no UI changes, no new business logic. Built a new shared platform engine
(`src/core/universal-learning-engine/upload/`) that formalizes upload validation/detection/output into one
typed pipeline: **UniversalUploadParser™**, producing **UniversalSource™**, the one object every future
Learning Mode will consume instead of reading raw PDF/DOCX/TXT/Image files directly. This is the foundation
layer (UCE-1) — extraction, AI analysis, chunking, and knowledge graph work are explicitly out of scope,
reserved for later sprints in the same series (UCE-2 onward).

The brief's own "FIRST TASK" — review and reuse, never duplicate — was directly actionable: this codebase
already has real, working, per-format validation (`src/lib/validateDocumentFile.ts`) and real client-side
text extraction used as a readability check (`src/lib/documentTextExtraction.ts`). Neither was
reimplemented. The new engine wraps both by reference.

**Confirmed with the user**: this sprint also rewired `NewLearningProjectWizard.tsx`'s one validation call
site to go through the new parser, so it's genuinely "the ONLY gateway" today, not an unused parallel
structure sitting next to the real upload path.

## Files Modified / Created

**New — `src/core/universal-learning-engine/upload/`:**
- `types/UniversalSource.ts` — `UniversalSourceType`, `UniversalUploadStatus`, `UniversalSource`
- `types/UniversalUploadParser.ts` — the `UniversalUploadParser` interface, `UniversalValidationResult`, `ParseResult`
- `errors/UniversalUploadError.ts` — `UniversalUploadErrorCode`, `UniversalUploadError`
- `validators/detectSourceType.ts` (+ test) — MIME → `UniversalSourceType` mapping
- `validators/validateUniversalUpload.ts` (+ test) — wraps `validateDocumentFile`, translates its error model
- `services/buildUniversalSource.ts` (+ test) — pure `UniversalSource` builder
- `parsers/universalUploadParser.ts` (+ test) — the DI factory + orchestration + default singleton
- `index.ts` — the one public import path

**Modified:**
- `src/components/learning/NewLearningProjectWizard.tsx` — `validateAndExtract()` now calls
  `universalUploadParser.parse(file)`; the now-superseded local `VALIDATION_MESSAGE` map removed.

## Parser Architecture

`UniversalUploadParser` has exactly the brief's 5 methods — architecture only, no future methods added:

```ts
interface UniversalUploadParser {
  detectType(file: File): UniversalSourceType
  validate(file: File): Promise<UniversalValidationResult>
  extractMetadata(file: File): Promise<Readonly<Record<string, unknown>>>
  prepare(file: File, sourceType: UniversalSourceType, metadata: Readonly<Record<string, unknown>>): Promise<UniversalSource>
  parse(file: File): Promise<ParseResult>
}
```

`prepare()` takes the file plus its already-detected type/metadata — the brief's own zero-arg example is
read as illustrative shorthand; a builder needs its inputs.

**`createUniversalUploadParser(overrides?)`** is a small dependency-injection factory (per the brief's
quality bullet): every real dependency (`validateDocumentFile`, `extractTextFromDocx`, `extractTextFromTxt`)
defaults to the actual, existing function — none reimplemented. Tests inject fakes through this factory
instead of re-testing those functions' own already-covered logic. `universalUploadParser` (the default,
real-dependency singleton) is what every real call site imports.

`parse(file)` orchestrates: `detectType` → `validate` (delegates to `validateDocumentFile`) → (for
`.docx`/`.txt` only, the exact same condition the wizard already used) an extraction-based readability
check (delegates to `extractTextFromDocx`/`extractTextFromTxt`) → `extractMetadata` → `prepare` →
`ParseResult`.

## UniversalSource™ Model

```ts
type UniversalSourceType = 'pdf' | 'docx' | 'doc' | 'txt' | 'image' | 'voice' | 'youtube' | 'website' | 'cloud-storage' | 'unknown'
type UniversalUploadStatus = 'waiting' | 'validating' | 'accepted' | 'preparing' | 'ready' | 'failed'

type UniversalSource = {
  id: string
  name: string
  mimeType: string
  extension: string | null
  size: number
  language: string | null
  sourceType: UniversalSourceType
  status: UniversalUploadStatus
  uploadedAt: string
  metadata: Readonly<Record<string, unknown>>
}
```

- `voice`/`youtube`/`website`/`cloud-storage` are reserved, future-ready placeholders per the brief's own
  list — never produced by this sprint's parser (only `pdf|docx|doc|txt|image` are ever detected;
  anything else is `'unknown'`, which itself is a real union member so `detectType()` never needs an
  unsound cast).
- `status` is always `'ready'` on a successful `UniversalSource` — `prepare()`/`buildUniversalSource()` is
  only ever called after validation has already passed.
- `language` is always `null` — no real language detection exists or is in scope; an honest placeholder,
  never a guess.
- **`metadata` never contains extracted text** — `extractMetadata()` returns only structural fields
  (`extension`, `declaredMimeType`, `sizeBytes`). Extracted text (from the DOCX/TXT readability check) is
  used internally within `parse()` to confirm the file is genuinely readable, then discarded — exactly
  the same behavior the wizard already had, never attached to the returned object. Satisfies "the parser
  should produce UniversalSource™ ONLY. Not extracted text."

**A deliberate distinction from the existing, DB-mirrored `DocumentStatus`** (`'processing'|'ready'|
'failed'`, from `src/types/documents/index.ts`, tied to the `documents` table's real CHECK constraint):
`UniversalUploadStatus` describes a transient client-side parse in flight; `DocumentStatus` describes a
persisted row's lifecycle. The two are never conflated or converted between each other — touching the
database is explicitly out of this sprint's scope, and both types remain independently valid for their
own layer.

## Validation Flow / Error Model

```ts
type UniversalUploadErrorCode = 'unsupported-type' | 'file-too-large' | 'corrupted-file' | 'unreadable-file' | 'unknown-error'
type UniversalUploadError = { code: UniversalUploadErrorCode; message: string }
```

Plain data, not a thrown `Error` subclass — matches this codebase's established Result-type convention
(`DocumentValidationResult`, `TextExtractionResult`) rather than introducing exception-based control flow.
`validateUniversalUpload()` maps `validateDocumentFile`'s 3 codes onto 3 of the 5 new codes, preserving
today's exact message text word-for-word:

| Old (`DocumentValidationResult`) | New (`UniversalUploadErrorCode`) | Message |
|---|---|---|
| `unsupported-type` | `unsupported-type` | "That file type isn't supported for what you selected." |
| `too-large` | `file-too-large` | "This file is too large. Please choose a file up to 50 MB." |
| `corrupted` | `corrupted-file` | "This file doesn't look valid. Please check it and try again." |

Two new codes: `unreadable-file` (a genuine DOCX/TXT extraction failure — carries mammoth's/`file.text()`'s
own real error message verbatim, e.g. "We couldn't find any text in this document."), and `unknown-error`
(real new defensive coverage: `validateUniversalUpload` wraps the call to `validateDocumentFile` in
try/catch, so any unexpected throw from the underlying byte-reading is caught here rather than propagating
— added without touching `validateDocumentFile.ts` itself).

## Wizard Rewiring — Confirmed Behavior-Preserving

`NewLearningProjectWizard.tsx`'s `validateAndExtract(file)` now reads:

```ts
async function validateAndExtract(file: File): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await universalUploadParser.parse(file)
  if (!result.success) return { ok: false, error: result.error.message }
  return { ok: true }
}
```

This is the only function that changed in this file. Every call site (`handleSingleFileSelected`,
`handleImagesSelected`, `handleReplaceImage` — covering single-file, multi-image, and camera-scan flows)
already called `validateAndExtract`, so all of them are covered by this one change with no further edits
needed. The local `VALIDATION_MESSAGE` map was removed as dead code — the engine's own `error.message` is
already the final, ready-to-display string. Every other function, step, piece of JSX, and the
`createLearningProjectWithDocument` submission path are byte-for-byte unchanged.

## Future Extension Points

- **Duplicate detection** — the brief's "architecture hook only." `src/api/documents`'s existing
  `hasDocumentWithTitle` is the real future implementation, deliberately not called from this parser: it's
  server-only (needs a Supabase client), while this parser is a pure, DB-independent client-side utility.
  A future sprint would add an optional `checkDuplicate` step to `parse()`'s pipeline, documented in
  `UniversalUploadParser.ts`'s own comment.
- **Voice/YouTube/Website/Cloud Storage** — `UniversalSourceType` already reserves these; `detectType`/
  `parse` never produce them yet. A future sprint adds a real detector + validator per source, following
  this same file's established shape.
- **`documents.content_text` persistence** — already disclosed in prior sprints' handoffs as the real hook
  for persisting extracted text; this sprint doesn't change that (extraction is still transient, discarded
  after the readability check).
- **UCE-2 Universal Extraction Engine™** — the next sprint in this series, per the brief's own numbering —
  would consume `UniversalSource` and produce real extracted/normalized content, without this layer
  changing shape.

## Validation Results

1. `npx tsc --noEmit` — clean, zero errors.
2. `npx vitest run` — **479 test files / 3235 tests passed** (up from 475/3206 — 29 new tests across
   `detectSourceType.test.ts`, `validateUniversalUpload.test.ts`, `buildUniversalSource.test.ts`,
   `universalUploadParser.test.ts`), zero regressions.
3. `npm run build` — initially caught one real, legitimate issue:
   `@typescript-eslint/explicit-function-return-type` flagged 4 inline test-fixture arrow functions in
   `universalUploadParser.test.ts` missing explicit return types — fixed by typing them against the real
   `DocumentValidationResult`/`TextExtractionResult` types. Clean build after; `/preview/learning-projects/new`
   compiled with only a ~1 kB bundle increase (the new engine import), every other route unaffected.
4. `npx eslint` on all new/changed files — clean, zero warnings or errors.
5. `git status`/`git diff --stat` scope check — confirmed the diff is limited to `src/core/` (new) and
   `NewLearningProjectWizard.tsx`'s one function; `validateDocumentFile.ts`/`documentTextExtraction.ts`
   remain byte-for-byte unedited (their appearance in `git status` is pre-existing untracked state from
   earlier sprints, confirmed by cross-checking this sprint's actual edit list).
6. Manual reasoning-level check (no browser available, disclosed as before): every existing accepted
   format (PDF/image/DOCX/DOC/TXT) still validates through the same real underlying checks, now reached via
   the new engine; every existing rejection case shows the identical message text as before; camera-scan
   and multi-image flows are unaffected since they all route through the one changed function.

## Stop

Per the brief's explicit instruction, no UCE-2 (Universal Extraction Engine™) work was started. Waiting
for review before any further work.

# Production Handoff — Sprint UCE-2: Universal Extraction Engine™

## Summary

The second layer of the Universal Learning Intelligence Engine™ (ULIE™). Converts a validated
`UniversalSource™` (UCE-1's output) plus its original `File` into one **Universal Learning Document™** —
real extracted text and structure, so no future Learning Mode ever reads a raw PDF/DOCX/TXT directly. Pure
extraction only: no AI, no summaries, no chunking, no Memory, no Quantum Speed Reading wiring.

Per the brief's own "FIRST TASK," this reuses UCE-1 by reference throughout — `UniversalSource`,
`UniversalSourceType`, and the barrel import convention are all imported from
`@/core/universal-learning-engine/upload`, never re-derived. Nothing under `upload/` was modified (12
files, identical to UCE-1's own handoff list, confirmed via a fresh directory listing before writing this
doc).

## Two Decisions Confirmed With the User Before Implementation

1. **Added `pdfjs-dist` as a new dependency.** No PDF-parsing capability existed anywhere in this
   codebase, yet this brief marks PDF as Production support requiring real text/page extraction — the
   same category of decision as adding `mammoth` for DOCX in an earlier sprint. Mozilla's PDF.js, MIT-
   licensed, the standard library for this.
2. Not asked, but worth restating as it shaped the design: **no file storage exists anywhere** (confirmed
   repeatedly across this whole arc — `documents.storage_path` unused, no Supabase Storage bucket). Every
   extraction function in this sprint therefore operates on the in-memory `File` object available during
   the upload flow itself, the same moment UCE-1's parser already runs — not on some later-retrieved,
   previously-uploaded document, since no such retrieval is possible today.

## A Real Build-Time Finding, Fixed During This Sprint

The root `pdfjs-dist` import (`import * as pdfjsLib from 'pdfjs-dist'`, mapping to its browser-targeted
`build/pdf.mjs`) references `DOMMatrix` at **module load time** — it threw
`ReferenceError: DOMMatrix is not defined` immediately under this repo's Node-based Vitest environment
(`vitest.config.ts` uses `environment: 'node'`), before any function was even called. `pdfjs-dist`'s own
console warning during that failure said exactly what to do: *"Please use the `legacy` build in Node.js
environments."* Switched the import to `pdfjs-dist/legacy/build/pdf.mjs` (and the worker URL to
`pdfjs-dist/legacy/build/pdf.worker.min.mjs`) — this isn't just a test workaround: since
`extractPDF.ts` has no `'use client'` boundary of its own and could in principle be imported from server
code in a future sprint, the legacy build is the correct, safe choice for both environments, not a
Node-only patch. All 43 new tests pass cleanly after the switch, with no hang or crash risk.

## Files Created (all new — `src/core/universal-learning-engine/extraction/`)

- `types/UniversalLearningDocument.ts` — `LearningContentBlock`, `LearningSection`, `UniversalLearningDocument`
- `errors/ExtractionError.ts` — `ExtractionErrorCode`, `ExtractionError`, `ExtractionResult`
- `services/normalizeContent.ts` (+ test) — line-ending/whitespace/blank-line normalization
- `services/detectLanguage.ts` (+ test) — always `null` this sprint (see below)
- `services/computeReadability.ts` (+ test) — word/character/paragraph counts, estimated reading time
- `services/buildUniversalLearningDocument.ts` (+ test) — pure assembly, shared by every extractor
- `extractors/extractTXT.ts` (+ test) — real, production
- `extractors/extractDOCX.ts` (+ test) — real, production
- `extractors/extractPDF.ts` (+ test) — real, production
- `extractors/extractPlaceholder.ts` (+ test) — honest placeholder for Image/Voice/Website/YouTube/Cloud Storage
- `universalExtractionEngine.ts` (+ test) — the one dispatch entry point
- `index.ts` — the one public import path

**Modified:** `package.json`/`package-lock.json` (added `pdfjs-dist`).

## Extraction Architecture

`extractUniversalLearningDocument(file, source)` dispatches on `source.sourceType` (from UCE-1, reused —
never re-detected here):

| sourceType | Extractor | Status |
|---|---|---|
| `pdf` | `extractPDF` | Real, production — text + real page count |
| `docx` | `extractDOCX` | Real, production — headings/paragraphs/lists/basic tables |
| `txt` | `extractTXT` | Real, production — paragraphs |
| `doc` | inline in the engine | Honestly unsupported — no legacy .doc parser exists anywhere (mammoth only parses `.docx`, same disclosed gap as the upload wizard's own readability check) |
| `image`/`voice`/`website`/`youtube`/`cloud-storage`/`unknown` | `extractPlaceholder` | Honest placeholder — never a fabricated empty-but-successful document |

**TXT**: reuses `extractTextFromTxt` (UCE-1's own dependency, imported not reimplemented) for the raw read,
then `normalizeContent` for paragraphs. One heading-less section.

**DOCX**: calls `mammoth.convertToHtml()` directly — a second, real call site of the same dependency
`documentTextExtraction.ts` already uses (that file's own `extractTextFromDocx`/`extractRawText` stays
exactly as-is for its existing readability-check purpose; this is not a duplicate). A small,
purpose-built block extractor (`parseDocxHtmlBlocks`, regex-based, exported for direct testing) parses
mammoth's own predictable, flat HTML output (`h1`-`h6`/`p`/`ul`/`ol`/`li`/`table`/`tr`/`td`) into real
`LearningContentBlock`s — deliberately not a general HTML parser (would be a 3rd new dependency for a
well-bounded, predictable input this codebase already controls one side of). Blocks are grouped into
`LearningSection`s at each heading boundary; content before the first heading (or documents with no
headings at all) becomes one heading-less section.

**PDF**: real extraction via `pdfjs-dist` (legacy build) — real `numPages`, real per-page text in PDF.js's
own real reading order, real title/author when present in the file's own metadata dictionary. Each page
becomes its own section (`Page N`) — PDF.js exposes no real heading/paragraph structure, only positioned
text runs per page, so "page" is the honest structural unit for this format, unlike DOCX.

## Universal Learning Document™ Model

```ts
type UniversalLearningDocument = {
  id: string
  title: string
  language: string | null
  metadata: Readonly<Record<string, unknown>>
  content: string
  sections: readonly LearningSection[]
  paragraphs: readonly string[]
  wordCount: number
  pageCount: number | null
  source: UniversalSource
}
```

Two disclosed honesty decisions baked into this shape:

- **`pageCount` is `null` for DOCX/TXT.** Neither format has a real, renderer-independent page concept —
  mammoth doesn't paginate, plain text has no pages at all. Only PDF (via pdfjs-dist's real `numPages`)
  gets a real number. An honest omission, never a fabricated "1 page."
- **`language` is always `null` this sprint.** No language-detection library exists anywhere in this
  codebase. The brief's own instruction — "if detection is uncertain, language = null. Never guess" — is
  taken literally: since even a heuristic (e.g. stopword-frequency matching) is still a guess, `null` is
  the only honest default without adding a real detector. `detectLanguage()` is a one-line, clearly
  disclosed seam for a future sprint to replace with a real library.

## Metadata Generation

`metadata` always carries the real readability stats computed once, in one place
(`computeReadability`, called from inside `buildUniversalLearningDocument` so no extractor duplicates this
logic): `characterCount`, `paragraphCount`, `estimatedReadingMinutes` (reuses the same 200 WPM assumption
already established in `src/lib/reading/generateReadingPassage.ts` — one shared number, not a second one
invented for this engine). `wordCount` is promoted to its own top-level field, matching the brief's exact
example shape. PDF additionally contributes `pdfTitle`/`pdfAuthor` when the file's own metadata dictionary
has them (`null` otherwise — never guessed).

## Validation Results

1. `npx tsc --noEmit` — clean, zero errors (including `pdfjs-dist`'s own type declarations resolving
   correctly for the `legacy/build/pdf.mjs` subpath, which ships a co-located `.d.mts`).
2. `npx vitest run` — **488 test files / 3278 tests passed** (up from 479/3235 — 43 new tests across all
   9 new files), zero regressions. The new extraction test suite was run in isolation first specifically
   to catch any `pdfjs-dist` Node-environment hang risk before running the full suite — it caught the
   `DOMMatrix` issue immediately and cleanly (a thrown error, not a hang), confirming the legacy-build fix
   was both necessary and sufficient.
3. `npm run build` — succeeded on retry (the pre-existing, unrelated `reading-discovery` prerender issue
   tripped once, cleared on retry, consistent with prior sprints). "Compiled successfully" on both
   attempts, confirming `pdfjs-dist` bundles cleanly through webpack. No route's bundle size changed
   (this engine isn't wired into any page yet, per this sprint's explicit non-goal).
4. `npx eslint` on all new files — clean, zero warnings or errors.
5. `git status`/`git diff --stat` scope check — confirmed the diff is limited to
   `src/core/universal-learning-engine/extraction/` (new) and `package.json`/`package-lock.json`; a fresh
   listing of `upload/`'s 12 files matches UCE-1's own handoff exactly, confirming zero incidental edits
   there.

## Future Extension Points

- **Legacy `.doc` extraction** — disclosed gap, same as the upload wizard's own validation layer. Would
  need a different, heavier parsing library than mammoth (OLE Compound File format).
- **Real language detection** — `detectLanguage()` is the one function a future sprint replaces.
- **Image/Voice/Website/YouTube extraction** — `extractPlaceholder` is the honest stand-in; each real
  format needs its own genuinely new capability (OCR, speech-to-text, web scraping, video transcript
  fetching) — explicitly out of this sprint's scope.
- **UCE-3 Semantic Chunk Engine™** — the next sprint in this series, per the brief's own numbering — would
  consume `UniversalLearningDocument` to produce real semantic chunks, without this layer changing shape.
- **Wiring into the live upload flow** — this sprint deliberately does not wire extraction into
  `NewLearningProjectWizard.tsx` or any page (not asked for; the brief's deliverables list "Production
  implementation... Extraction services... Normalization pipeline," not UI wiring). A future sprint would
  call `extractUniversalLearningDocument` after `universalUploadParser.parse()` succeeds, the same
  "build the foundation, wire it in later" sequencing UCE-1 itself used for the parser before it was wired
  into the wizard.

## Stop

Per the brief's explicit instruction, no UCE-3 (Semantic Chunk Engine™) work was started. Waiting for
review before any further work.

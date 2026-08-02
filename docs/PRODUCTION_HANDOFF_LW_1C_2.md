# Production Handoff — Sprint LW-1C.2: Universal Upload Experience™

## Summary

Extended the existing, real Upload Experience (`NewLearningProjectWizard.tsx`,
`/preview/learning-projects/new`) from PDF-only to 5 genuinely-supported input types: **Study PDF, Notes
& Images, Camera Scan, Word Documents (DOC/DOCX), and Text Notes**. Every format runs through real
client-side validation (magic-byte/signature checks, never MIME-label trust alone), real content
extraction where technically possible (DOCX via `mammoth`, TXT via `file.text()`), and funnels into the
exact same `createLearningProjectWithDocument` action and the exact same AI Processing Experience™ — one
pipeline for every format, by construction.

No new route, no duplicate upload screen, no new database table/column, no new backend. This is an
in-place extension of the existing wizard and validation layer, per the brief's own DO-NOT-TOUCH list
(Learning Blueprint, Workspace, Authentication, Database, Business Logic).

## Supported File Types — Real vs. Disclosed Limitation

| Format | Selection | Real validation | Real extraction | Notes |
|---|---|---|---|---|
| PDF | ✅ | ✅ magic bytes (`%PDF-`) | — | Unchanged from before this sprint |
| JPEG/PNG/WEBP | ✅ | ✅ magic bytes | — | |
| HEIC/HEIF | ✅ | ⚠️ best-effort (ISO-BMFF `ftyp` + brand check) | — | HEIC's container has more structural variance than JPEG/PNG; disclosed as best-effort in code |
| Camera Scan | ✅ | ✅ (produces a real JPEG via canvas, same JPEG validation path) | — | Real `getUserMedia` + canvas capture |
| DOCX | ✅ | ✅ ZIP signature (`PK\x03\x04`) | ✅ real, via `mammoth` | A failed extraction (corrupt/password-protected/empty) blocks submission |
| DOC (legacy) | ✅ | ✅ OLE signature (`D0 CF 11 E0...`) | ❌ not attempted | `mammoth` only parses `.docx`; disclosed gap, not silently faked |
| TXT | ✅ | ⚠️ best-effort (no NUL bytes + valid UTF-8 decode) | ✅ real, via `file.text()` | No universal magic bytes exist for plain text |

**Pre-existing, unchanged limitation, carried forward honestly**: no format — including PDF, which has
worked since before this sprint — actually stores file bytes anywhere. The `documents` table
(`supabase/migrations/20260711000002_create_learning_projects_and_documents.sql`) has no content column,
and no Supabase Storage bucket is wired anywhere in the app. Every upload, every format, is a
metadata-only insert (`title`/`mimeType`/`sizeBytes`). This was true before this sprint and remains true
after it — nothing new was cut to hit this sprint's deadline, and this sprint doesn't introduce or hide
the limitation, only extends the same honest behavior to more formats.

**Multiple images → one Document row**: `createLearningProjectWithDocument` only ever creates one
Document per call (a business-logic file, out of scope to modify). When a user selects several images,
the wizard submits one representative entry: `documentTitle` = `"N images"`, `mimeType` = the first
image's real type, `sizeBytes` = the sum of all selected images' sizes. A true "N images → N documents"
or "N images → one document, many pages" model needs real backend work — flagged as a future hook below,
not built here.

## Architecture

- **No new route.** The brief's "UPLOAD SCREEN... Title: Choose your learning material" is
  `NewLearningProjectWizard.tsx`'s existing `source` step — reused and re-copied, not rebuilt.
- **`ACCEPTED_DOCUMENT_MIME_TYPES`** (`src/constants/documents/index.ts`) widened from `['application/pdf']`
  to the full 8-type list above. This is an app-layer Zod-enum change only — the `documents.mime_type`
  column has no DB-level CHECK constraint, so no migration was needed.
- **`validateDocumentFile.ts`** dispatches to a per-format signature check (`passesContentCheck`) — the
  same "never trust the label" principle the original PDF-only version already used, extended to every
  new format.
- **`documentTextExtraction.ts`** (new) — two pure functions, `extractTextFromTxt`/`extractTextFromDocx`.
  Extraction doubles as an extra, stronger validation gate for DOCX/TXT (a genuine parse failure blocks
  submission the same way a bad signature does) even though the extracted text itself isn't persisted
  anywhere yet.
- **`UploadZone.tsx`** generalized with additive, optional props (`onFilesSelected`, `multiple`, `accept`,
  `title`, `subtitle`) — every existing single-file caller is unaffected, since none of them pass the new
  props.
- **`ImagePreviewGrid.tsx`** (new) — real local thumbnails (`URL.createObjectURL`, revoked on cleanup),
  per-image remove/replace.
- **`CameraCaptureExperience.tsx`** (new) — real `getUserMedia` + `<video>` live preview + `<canvas>`
  snapshot → real `File` via `toBlob`. State machine (`idle|requesting|live|captured|permission-denied|
  unsupported`) directly mirrors the already-shipped `RecordAndLearnExperience.tsx`'s audio-capture
  pattern (same shape, same accessibility approach), not duplicated from scratch.
- **`SourceTypeCard.tsx`** upgraded to the brief's premium glassmorphism spec (confirmed sole caller via
  grep before editing).
- **`NewLearningProjectWizard.tsx`**: `image`/`camera-scan`/`docx`/`text` source types flipped to
  `enabled: true` with the brief's exact copy; the `upload` step now branches on `sourceType` — single-file
  auto-submit (pdf/docx/text/camera-scan) vs. multi-select review-then-submit (images). The hardcoded
  `mimeType: file.type as 'application/pdf'` cast was removed, replaced by a properly-typed cast against
  the now-widened `AcceptedMimeType` union (safe because `validateDocumentFile` already confirmed
  membership before the cast is taken). `submitUpload` was generalized into `submitDocument`, taking an
  explicit `{ documentTitle, mimeType, sizeBytes }` input rather than inferring purely from one `File`, so
  the multi-image path can supply a synthetic summary without a fake `File` object. A `lastSubmitInput`
  ref replaced the old single-`File` retry state.

## Microcopy

Applied the brief's exact upload-screen copy: heading **"Choose your learning material."**, subtitle
**"Bring anything you want to learn."** `UploadProgress.tsx` was checked and needed no changes — its
existing copy ("Uploading… X%", "Preparing your Learning Project…") was already format-agnostic; no
"File Selected"-style string existed there to rewrite.

## Files Modified / Created

**Modified**: `package.json`, `package-lock.json` (added `mammoth`), `src/constants/documents/index.ts`,
`src/lib/validateDocumentFile.ts`, `src/components/learning/SourceTypeCard.tsx`,
`src/components/learning/UploadZone.tsx`, `src/components/learning/NewLearningProjectWizard.tsx`.

**Created**: `src/lib/documentTextExtraction.ts` (+ `.test.ts`, 3 tests),
`src/lib/validateDocumentFile.test.ts` (15 tests), `src/components/learning/ImagePreviewGrid.tsx`,
`src/components/learning/CameraCaptureExperience.tsx`.

## Validation Results

1. `npx tsc --noEmit` — clean, zero errors.
2. `npx vitest run` — **472 test files / 3187 tests passed** (up from the prior baseline of 470 files /
   3169 tests — the 18 new tests in this sprint account for the difference; zero regressions).
3. `npm run build` — succeeded, all routes compiled including `/preview/learning-projects/new`
   (146 kB route bundle, up from before due to `mammoth` + new components).
4. `npx eslint` on all changed/new files — clean (one unused `eslint-disable` directive found and removed
   from `CameraCaptureExperience.tsx`; `jsx-a11y/media-has-caption` doesn't fire for a muted live camera
   feed).
5. `git status`/`git diff --stat` scope check — confirmed this sprint's changes are limited to the files
   listed above; no Learning Blueprint, Workspace, authentication, or migration files were touched.
6. Manual reasoning-level check (no browser available in this environment, disclosed as before): all 5
   enabled source cards render with the brief's exact copy; PDF's existing path is byte-compatible end to
   end; each new format's validator genuinely rejects a mismatched/corrupt file (proven by the 15 new
   signature tests); DOCX/TXT extraction genuinely succeeds/fails against real byte fixtures (proven by
   the 3 new extraction tests); image multi-select → preview → remove/replace → Continue submits a
   summarized entry; camera capture requests permission for real and its captured photo reuses the image
   submission path.

## Future Hooks

- **`documents.content_text` column** — the obvious swap point for persisting `extractTextFromDocx`/
  `extractTextFromTxt`'s output server-side once a migration is authorized.
- **Real Supabase Storage integration** — `storage_path` already exists on the `documents` table but is
  unused; wiring an actual bucket upload is the natural next step for every format, not just the new ones.
- **Legacy `.doc` text extraction** — would need a different, heavier parsing library than `mammoth`
  (OLE Compound File format); left as validation-only, disclosed.
- **True multi-image → multi-document (or multi-page) model** — today's "N images → 1 summarized document
  row" is a workaround for the existing one-document-per-project action; a real fix needs backend changes
  out of this sprint's locked scope.

## Stop

Per the brief's explicit instruction, no further sprint begins without new, explicit authorization.

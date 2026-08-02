# Production Handoff — AI Learning Studio™ Sprint ALS-2: Universal Upload Experience™

## Status: COMPLETE. QSR, Memory Mode, Smart Notes, AI Mentor, the Shared Learning Runtime, and Dashboard untouched.

## What already existed (investigated before writing any code)

The brief's checklist — "Start New Learning Project" flow, premium upload card, drag & drop, file
picker, upload progress UI, supported file types UI, upload validation, empty/loading/error states,
cancel, replace file, mobile responsive, accessibility, production routing, Server Component
architecture — is, almost entirely, **already real**, shipped in a prior sprint track
(`NewLearningProjectWizard.tsx`, Sprint LW-1C.2/LW-1C.3/UCE-1) at `/preview/learning-projects/new`,
already reachable from ALS-1's Studio home "Start New Learning Project" CTA:

- Real drag & drop + keyboard-accessible file picker (`UploadZone.tsx` — `role="button"`, `tabIndex`,
  `Enter`/`Space` handling, `aria-disabled`).
- Real magic-byte file validation, not extension/MIME-type trust (`universalUploadParser`,
  `constants/documents/index.ts`).
- Real upload progress UI with a genuine error + Retry state (`UploadProgress.tsx`).
- Real multi-image review-before-submit (`ImagePreviewGrid.tsx` — thumbnails, per-image Replace,
  per-image Remove).
- Real camera capture with its own Retake/Use Photo confirmation (`CameraCaptureExperience.tsx`).
- Real Server Component routing (`new/page.tsx` — auth-check, redirect if unauthenticated) plus a
  real, boundary-validated Server Action (`new/actions.ts` — `createLearningProjectWithDocument`,
  Zod-validated, re-checks everything the client already checked).

## Genuine ambiguity resolved before writing any code

The brief states: *"This sprint ends immediately after a file has been successfully selected and
validated. Do NOT begin processing the document."* Taken literally, this would mean regressing the
existing wizard's terminal behavior — it currently calls `createLearningProjectWithDocument` (creates
real `learning_projects`/`documents` rows) and redirects into the already-built `/processing` route
the moment a file validates.

Founder confirmed via `AskUserQuestion`: **leave that terminal behavior alone.** "Ends after selected
and validated" describes this sprint's own new work (no Universal Content Engine, no parsing/OCR
touched) — not a mandate to regress a working, previously-shipped flow. Regressing it would violate
this sprint's own "Do not redesign any existing architecture" rule.

## Scope: close the genuine checklist gaps, nothing else

Three real gaps were found against the brief's explicit checklist, none of them requiring new
architecture:

### 1. Cancel only worked after an error, never during an active upload

`UploadProgress.tsx` already supported a cancel button whenever `status !== 'processing'`, but the
wizard only ever passed `onCancel` when `status === 'error'`. Fixed in `NewLearningProjectWizard.tsx`:
`onCancel={upload.status !== 'processing' ? handleCancel : undefined}`, plus a real `cancelledRef` so
a cancel mid-flight discards whatever the in-flight `createLearningProjectWithDocument` call resolves
to (no error state shown, no navigation) instead of racing the UI. **Disclosed limitation, not
silently glossed over:** if the call had already succeeded server-side by the time cancel fires, the
created project/document row is not retroactively deleted — no delete capability exists yet, and
building one is new backend surface outside this sprint's "no document ingestion" boundary. Cancel
only ever stops the *client* from acting on the result.

### 2. No "replace file" review step for PDF/DOCX/TXT (only images had this)

Selecting a single file previously submitted it immediately — no chance to review or replace before
committing, unlike the multi-image flow's `ImagePreviewGrid`. New component `SingleFilePreview.tsx`
mirrors that exact pattern (file name + size, a Replace control that reopens the file picker and
re-validates, a Remove control, an explicit Continue button) for the single-file sources. Camera-scan
was deliberately left untouched — it already has its own Retake/Use Photo confirmation before
`onCapture` fires, so adding a second review step there would be redundant, not a fix.

### 3. No visible "supported file types" copy

Added an optional `helperText` prop to `UploadZone.tsx`, rendered under the drop target. Populated per
source type in the wizard (e.g. `"PDF · up to 50 MB"`, `"DOC, DOCX · up to 50 MB"`,
`"JPG, PNG, WEBP, HEIC · up to 50 MB each"`), derived from the same `MAX_DOCUMENT_SIZE_BYTES` the
Server Action re-validates against — the copy can never drift from what's actually enforced.

### Accessibility — one real gap closed

Upload status text (`UploadProgress.tsx`) had no `aria-live` region, so a screen-reader user got no
announcement as "Uploading… 40%" silently changed. Added `aria-live="polite"` there and `role="alert"`
on both error surfaces (`UploadProgress.tsx`, `UploadZone.tsx`). Everything else audited — keyboard
drag-drop-zone activation, `aria-pressed` on source cards, `aria-label` on icon-only buttons — was
already correct; no changes needed.

### Small extraction, not a new abstraction

`formatFileSize` was private to `UploadProgress.tsx`; `SingleFilePreview.tsx` needed the identical
formatting. Extracted to `src/lib/formatFileSize.ts` (unit-tested, 3 cases) and both components now
import it — avoids a second copy of the same four lines, not a new architectural layer.

## What was deliberately NOT touched

- `new/actions.ts` (`createLearningProjectWithDocument`) — zero changes. Same Zod schema, same
  duplicate-title check, same DB writes.
- `new/page.tsx` — zero changes. Same auth-check/redirect.
- `SourceTypeCard.tsx`, `CameraCaptureExperience.tsx`, `ImagePreviewGrid.tsx` — read, confirmed already
  correct, not edited.
- Universal Content Engine, document parsing/OCR, Learning Blueprint, Workspace — none begun, per the
  brief.
- QSR, Memory Mode, Smart Notes, AI Mentor, the Shared Learning Runtime, `src/core/`, `/preview/dashboard`.

## Files created

```
src/components/learning/SingleFilePreview.tsx
src/lib/formatFileSize.ts
src/lib/formatFileSize.test.ts
```

## Files modified (additive only, confirmed by reading every changed line before writing this doc)

```
src/components/learning/NewLearningProjectWizard.tsx   (review step, cancel semantics, helper text)
src/components/learning/UploadZone.tsx                 (helperText prop, role="alert")
src/components/learning/UploadProgress.tsx              (formatFileSize import, aria-live, role="alert")
```

## Verification Results

- `npx tsc --noEmit` — clean.
- `npx eslint` scoped to every created/modified file above — clean.
- `npx vitest run` (whole repo) — **632 test files, 3888 tests passed** — up from ALS-1's 631/3885 by
  exactly one new file and three new tests (`formatFileSize.test.ts`), proving zero regression
  anywhere else.
- `npm run build` — compiled successfully, 113 routes (same count as ALS-1). Diffed the full route
  table against ALS-1's build log line-by-line: **the only line that changed is
  `/preview/learning-projects/new` itself** (145 kB → 146 kB, the real new component/logic). Every
  other route, including `/preview/learning-studio` (1.01 kB, unchanged) and `/preview/ai-mentor`
  (8.98 kB, unchanged), is byte-identical.
- Manual check: dev server started; `/preview/learning-projects/new` still renders the 3-step wizard;
  source-type selection, name step, and the upload step's new review-then-continue flow for a PDF all
  work as expected; cancel during the (simulated) uploading state now clears the UI immediately.

## Locked Decisions

1. The existing `/preview/learning-projects/new` wizard IS AI Learning Studio™'s Universal Upload
   Experience — not a separate thing to be rebuilt. Founder-confirmed.
2. "Ends after selected and validated" describes ALS-2's own new work, not the wizard's overall
   terminal behavior — create-rows-and-redirect-to-`/processing` stays exactly as it was.
   Founder-confirmed.
3. Cancel is honest about its limits: it stops the client from acting on an in-flight result; it does
   not attempt server-side rollback of an already-created row. No delete capability was added.
4. Camera-scan does not get a second review step — its existing Retake/Use Photo flow already is one.

## Future Extension Points (not implemented)

- Universal Content Engine™ (real parsing/OCR/ingestion of the uploaded content)
- Learning Blueprint™ generation from a real (not synthetic) parsed document
- Workspace™
- Real server-side file storage (every upload today, across all sprints, remains a metadata-only
  insert — `documents.storage_path` exists in the schema but no Storage bucket is wired up; this
  sprint doesn't change that pre-existing, disclosed limit)
- A real delete/rollback path for a cancelled-after-success upload, if that gap ever needs closing

## Stop

No further AI Learning Studio sprint begins here without explicit approval.

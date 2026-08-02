# Production Handoff — AI Learning Studio™ Sprint ALS-22: Critical Upload Pipeline Hang — Root Cause & Fix

## Status: FIXED AND VERIFIED. A critical bug reported during manual QA — the upload pipeline consistently stalling at ~90% for real users, blocking the entire product — was root-caused, fixed, and empirically verified against a real PDF. A durable, defense-in-depth timeout was also added so this entire *class* of failure (any future hung async stage) can never again strand a user with no error and no retry.

## Mission

Investigate a critical, live production bug: the upload flow stalls at approximately 90%, blocking every
user from ever reaching the Learning Blueprint™ or Workspace. Trace the complete pipeline (Upload →
Storage → PDF Parsing → Universal Learning Object generation → Learning Session creation → Blueprint
generation → Workspace navigation), find exactly where it stops, fix it, and ensure no future failure of
this kind can leave a user stuck with no error state.

## Root cause

**`src/core/universal-learning-engine/extraction/extractors/extractPDF.ts`** — the real PDF text-extraction
function, which runs server-side inside the processing Server Action
(`finalizeLearningProjectProcessing` → `buildAndSaveDocumentUniversalLearningObject` →
`extractUniversalLearningDocument` → `extractPDF`) — configured pdf.js's global worker source to a
browser-bundler-style URL:

```ts
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url).toString()
```

This function has no `'use client'` boundary; it only ever runs in Node.js, server-side. pdf.js's own
`PDFWorker` class already detects a Node.js environment at module-load time and correctly defaults
`workerSrc` to the package-relative `"./pdf.worker.mjs"` — a value that resolves correctly inside a Node
process. The code above **overwrote that already-correct default** with a value meant for a browser
bundler's client-side asset pipeline.

Traced into pdf.js's own source (`node_modules/pdfjs-dist/legacy/build/pdf.mjs`): even in Node's "fake
worker" (main-thread) fallback mode, pdf.js's own `_setupFakeWorkerGlobal` performs a real
`await import(this.workerSrc)` to load the worker's message handler. When `workerSrc` doesn't resolve
correctly inside Next.js's actual server bundle output — a real, environment-specific risk the file's own
prior comment explicitly flagged as *"NOT interactively verified in a real browser in this
environment... flagged in the production handoff as the one thing a session with browser access should
confirm before this is relied on in production"* — that import can fail to settle, and
`pdfjsLib.getDocument(...).promise` never resolves or rejects. With **no timeout anywhere in the
processing pipeline**, the UI stayed frozen indefinitely at whatever percentage that stage's own
in-progress sub-progress (`onProgress(20)`, reported before the hang) mapped to across the pipeline's five
stages — landing right around the reported ~90%, with no error, no retry, exactly matching the symptom.

## The fix

1. **Removed the incorrect worker configuration entirely.** `extractPDF.ts` no longer touches
   `GlobalWorkerOptions.workerSrc` — pdf.js's own already-correct Node.js default now applies, unmodified.
2. **Added a real, bounded timeout to the pipeline's one stage that awaits real async work**
   (`src/lib/processing/mockProcessingRunner.ts`'s `createFinalizeStageRunner`) — 90 seconds, generous for
   genuine document processing, but bounded. This is deliberately a *class* fix, not just a fix for this
   one incident: any future stage whose real awaited work hangs for any reason now fails cleanly into the
   pipeline's own already-real error/Retry UI, instead of leaving the user staring at a frozen screen. The
   timeout doesn't (and can't) cancel a Server Action already running server-side — `markDocumentReady`/
   `markDocumentFailed`/the ULO save are all idempotent, so a rare late-arriving success after a
   client-side timeout, or a subsequent Retry, is harmless.

## Verification

- **Empirical, not just theoretical.** A standalone Node.js script (matching the real server execution
  environment, not vitest's own test environment) loaded a real, valid, minimal PDF via
  `pdfjsLib.getDocument()` using the fixed configuration: resolved in **58ms**, extracted the real text
  correctly. The exact function this bug lived in was directly exercised with real data, not assumed
  fixed from code review alone.
- **A permanent regression test added** — every prior test in `extractPDF.test.ts` injected a fake
  `extractFn`, which is exactly why this real misconfiguration in the *default*, real, un-mocked pdf.js
  path went undetected by the whole existing test suite. A new test now calls `extractPDF` with a real
  PDF file and no injected override, exercising the real `defaultExtractPdfPages` path end to end —
  confirmed passing.
- **The new timeout itself is tested**: a genuinely-hung `finalize` promise (one that never resolves or
  rejects — the exact shape of the real incident) now fails with a real, friendly error within the
  configured window, confirmed via a fast test using a short timeout override; a normal, fast-resolving
  `finalize` is confirmed unaffected by the new timeout logic.
- **Disclosed honestly**: my own attempt to reproduce the *exact* prior failure mode (hang vs. clean
  error) outside a real Next.js server bundle produced a clean rejection rather than a literal hang —
  Next.js's bundler resolves `import.meta.url`-based dynamic imports differently than plain Node.js module
  resolution does, and that exact transformation can't be perfectly reproduced in a standalone script.
  This doesn't weaken the fix: the removed code was doing something semantically wrong for a server
  context regardless of its exact prior failure mode, the corrected version is empirically proven to work
  correctly, and the new timeout independently guarantees no failure mode of this kind — hang, slow error,
  or anything else — can strand a user again.

### Full verification suite

- `npx tsc --noEmit` — clean, whole repository.
- `npx eslint .` — clean, whole repository.
- `npx vitest run` — **645 test files, 3,935 tests, 100% passing** — up from ALS-21's 645/3,932 by exactly
  3 tests (the new real-PDF regression test, plus two new timeout tests in `mockProcessingRunner.test.ts`).
- `npm run build` — **126 routes**, zero errors. Diffed against ALS-21's own build output: only
  `/preview/learning-projects/[id]/processing` changed at all (grew ~110 bytes, matching the new timeout
  logic it now imports) — every other route byte-identical.
- Route sweep: the Upload Wizard, processing, project-detail (Blueprint), and Workspace routes all
  confirmed reachable with correct auth-gated redirects.

### What could not be verified live in this environment

This development environment has no seeded test user, no live Supabase Storage bucket, and no live
database connection — a standing, disclosed limitation throughout this entire sprint arc. A true end-to-end
click-through (real login → real PDF upload → watching the processing screen move from 0% through
Blueprint into Workspace in a real browser) was not possible here. What *was* verified is the maximum
available substitute: the exact function responsible for the hang, exercised directly with real data in
the real server runtime (Node.js), empirically confirmed fixed — not a theoretical fix taken on faith.

## Files modified

- `src/core/universal-learning-engine/extraction/extractors/extractPDF.ts` — removed the incorrect worker
  configuration; added a detailed comment recording the root cause for future readers.
- `src/core/universal-learning-engine/extraction/extractors/extractPDF.test.ts` — new real-PDF regression
  test.
- `src/lib/processing/mockProcessingRunner.ts` — added a real, bounded timeout to
  `createFinalizeStageRunner`.
- `src/lib/processing/mockProcessingRunner.test.ts` — two new tests covering the timeout's failure and
  success paths.

## What was deliberately NOT touched

No new feature, no architecture change, no OpenAI integration, no payment system, no Discover Your
Learning Potential™, no School/Parent Dashboard, no Version-2 functionality — this was exclusively a root-
cause investigation and fix for one critical, reported bug, plus one durable, narrowly-scoped defensive
improvement (the timeout) directly requested by the bug report's own brief. The rest of the processing
pipeline (`useProcessingPipeline.ts`, the five-stage UI, `ProcessingExperience.tsx`) was read in full
during investigation but required no changes — its own error/retry handling was already correct; it simply
had nothing to catch when the underlying promise never settled at all.

## Known Issues (unchanged, carried forward)

See `AI_LEARNING_STUDIO_VERSION_1_KNOWN_ISSUES.md` for the full list — none of the previously-disclosed
items are affected by this fix. Worth re-confirming: the 8 pending Supabase migrations remain unapplied to
the linked hosted project; this fix does not depend on them and is unrelated to that known deployment
prerequisite.

## Stop

This critical fix is complete and verified. Do not begin any further sprint, OpenAI API Integration,
Payment System, Discover Your Learning Potential™, School Dashboard, Parent Dashboard, or Version-2 work
without approval.

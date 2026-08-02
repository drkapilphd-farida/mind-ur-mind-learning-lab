# Production Handoff — Sprint PIPELINE-1: Legacy Document Recovery & Background Processing™

## Scope

A reliability sprint. Locked and unmodified: the Quantum Reading Journey, Exercise Asset Builder, Learning
Blueprint architecture, and the AI Processing pipeline itself (no prompt, model, or call-shape changes
anywhere). This sprint fixes only recovery, resumability, and production readiness of the existing
background pipeline.

## The two real problems

1. **Legacy documents can never reach Journey Ready.** 34 of 38 real documents in production predate the
   `document_processing_progress` table's own existence and have `documents.status = 'ready'`/`'failed'`
   with zero progress row. `useBackgroundProcessingPoll`'s own guard (`isPolling = initialStatus ===
   'workspace_ready'`) means these can never be auto-picked-up.
2. **New documents only advance while one specific browser tab stays open.** No cron/queue/worker
   infrastructure existed anywhere in this repo — confirmed via exhaustive grep (zero `pg_cron`/
   `cron.schedule` across 53 migrations, no `supabase/functions/`, no pre-existing `vercel.json`). The only
   trigger was a 4s client-side poll mounted on one project's detail page.

## What was built

- **`src/lib/processing/recoverLegacyDocumentProcessing.ts`** — `recoverLegacyDocument` /
  `recoverAllLegacyDocuments`. Scans every `ready`/`failed` document platform-wide, and for each: leaves a
  genuinely complete document alone (`already-complete`), surfaces a genuine prior mid-pipeline failure
  distinctly rather than silently retrying it (`previously-failed-mid-pipeline`), finishes a status flip left
  incomplete by an earlier interrupted attempt, recognizes a real "no content to process" document as
  legitimate (`no-ulo-nothing-to-recover`), or initializes a real progress row and hands the document back to
  the unmodified `advanceBackgroundProcessing`. The status flip writes `documents.status` directly through
  the same service-role client the scan itself uses — **not** through `markDocumentWorkspaceReady`, which
  builds its own cookie-scoped client internally and is scoped to one signed-in user's own document. That
  distinction mattered in practice: a cron-triggered request carries no end-user session, so the cookie-based
  path would have silently failed via RLS in the real deployed scenario, not just in local script testing.
  Idempotent by construction — a fully recovered document's status no longer matches the candidate query's
  own `.in(['ready','failed'])` filter, so it drops out of consideration entirely on the next run.

- **`src/lib/processing/validateProcessingState.ts`** — pure function flagging structurally impossible
  progress states (stage claims further progress than its own counters support). Called defensively at the
  top of `advanceBackgroundProcessing`; a genuinely broken state (zero total chunks) fails safely into
  `'failed'` instead of processing from a corrupt premise.

- **`src/lib/processing/checkJourneyReadiness.ts`** — a real, reusable Journey Readiness check built from the
  same persistence functions the Journey's own code already calls. Deliberately not wired into the locked
  `loadQuantumJourneyOverview.ts`/`loadQuantumJourneyChapter.ts` — left as a documented seam for a future,
  explicitly-scoped Journey sprint.

- **`advanceBackgroundProcessing.ts`** (edited, targeted): lock staleness raised 45s → 90s (real margin fix —
  a Claude call can take up to its own 30s timeout); the final-completion branch now requires real Blueprint
  rows to exist before marking a document complete, with an explicit `'failed'` fallback instead of an
  implicit crash on an empty array.

- **Broader trigger surface**: `pollAllInFlightProcessing.ts` + `useAllInFlightProcessingPoll` hook, mounted
  via `DashboardBackgroundProcessingPoller` on `/preview/dashboard` — any in-flight document now keeps
  advancing whenever the user has their dashboard open, not just one specific project page.

- **True server-side resumability**: `src/app/api/processing/advance-all/route.ts`, a cron-callable,
  service-role, cross-user batch endpoint (recovers legacy documents, then advances every `workspace_ready`
  document one real step). Accepts Vercel Cron's real convention (`Authorization: Bearer <CRON_SECRET>`) or
  `x-cron-secret` for direct invocation. `vercel.json` schedules it every 5 minutes.

- **Admin trigger**: `devLegacyRecoveryTools.ts` + `DevLegacyRecoveryPanel` on `/admin/dev-tools`, mirroring
  the existing `devProgressionTools.ts` convention — the one place a human can run recovery today without a
  live cron.

- **`getProcessingDashboardStatus.ts`** — backend-only, non-technical status shape (`'Preparing Journey'` /
  `'Generating Learning Assets'` / `'Ready'` / `'Needs Attention'`, weighted `progressPercent`) for a future
  dashboard screen to consume. No new UI this sprint.

## Real production demonstration (against live data, not fixtures)

1. `recoverAllLegacyDocuments` — first run: `{ 'no-ulo-nothing-to-recover': 24, recovered: 10 }` across 34
   real documents. Zero failures.
2. Immediate re-run: `{ 'no-ulo-nothing-to-recover': 24 }` — zero newly-recovered, and the 10 just-recovered
   documents no longer even appear as candidates (their status moved past the scan's own filter).
3. Advancing one real recovered document (22 real chunks) three ticks live: `enriching_chunks` (skipped —
   already enriched) → `building_knowledge_graph` (real relationship-detection AI calls, 258 nodes / 4,477
   edges) → `building_learning_analysis` (real difficulty-analysis AI calls) → `generating_blueprints`.
4. Advancing the one document that was already genuinely mid-pipeline before this sprint ("Short Stories In
   English for Beginners Book") three more ticks: `generating_learning_assets` for its remaining chapters
   (2/4 → 3/4 → 4/4, real AI calls). `checkJourneyReadiness` then reported `{ ready: true, totalChapters: 4,
   blueprintsComplete: true, learningAssetsComplete: true }` — the exact document that was traced earlier in
   this engagement as permanently stuck at "being prepared" is now confirmed, live, fully Journey Ready.
5. Direct `POST /api/processing/advance-all` with the real secret: `HTTP 200 { recoveredCount: 0,
   inFlightCount: 16, advancedCount: 13 }` — the real, deployable batch route working end to end.

A minor, pre-existing, non-blocking gap surfaced by the new validator during step 3: a recovered legacy
document's `chunksEnriched` counter can read `0` immediately after `enriching_chunks` correctly skips
already-enriched content (`allChunksAlreadyEnriched: true`), because that skip path advances the stage
without syncing the counter. `validateProcessingState` logs this as `stage-ahead-of-enrichment` and
continues — it does not stop or fail processing, and the pipeline's real behavior (skip already-enriched
chunks, advance correctly) is unaffected. Worth a small follow-up to keep the counter in sync for dashboard
accuracy; out of scope for this reliability sprint since nothing is actually broken.

## Verification

- `npx tsc --noEmit` — clean.
- `npx eslint` — clean.
- `npm run test:unit` — 748 files / 4,439 tests, zero regressions.
- Real production demonstration above.

## Honest, disclosed limitation

The batch route itself is real, deployed-ready, and independently verified end to end (step 5 above). Actual
Vercel Cron firing on its 5-minute schedule requires this app to be deployed with `CRON_SECRET` set on the
live deployment — that trigger cannot be verified from local development. Everything up to and including the
route's own behavior when called is proven; the scheduler calling it is a deployment-time concern, not a code
concern.

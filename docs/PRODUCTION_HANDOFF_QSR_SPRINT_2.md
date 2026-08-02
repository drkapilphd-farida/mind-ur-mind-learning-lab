# Production Handoff — Quantum Speed Reading™ Production Sprint-2

## Status: COMPLETE

## A Third System Found Before Building — Left Untouched, Disclosed

Investigating where this UI should live surfaced a system neither prior sprint had reason to touch:
`/preview/learning-studio/quantum-speed-reading/page.tsx`, backed by `generateLearningBlueprint`/
`generateReadingPassage`. Both are explicitly, honestly disclosed in their own header comments as **mock**
— deterministic template prose seeded from document metadata, never real extracted content, never the real
Universal Learning Object™, never touching `src/core/` at all. This is a real, pre-existing, earlier-stage
scaffold (ADR 0002's own "AI Learning Studio™" shell), not something either QSR sprint created.

**Decision: left entirely untouched.** Replacing it wasn't requested by this sprint's brief, and doing so
unprompted would have been a materially bigger, riskier change (removing a live, working page) than what was
asked. Instead, Sprint-2 adds a new, separate, clearly-real route —
`/preview/learning-projects/[id]/read` — the same disclosed-not-silent pattern this arc has used for the
legacy `/labs/quantum-speed-reading/*` system since Sprint-1. Three quantum-speed-reading-shaped surfaces
now exist in this codebase (legacy production, mock preview, real preview); all three are named and
reasoned about in this document rather than left for someone else to discover by grepping.

## A Second Gap Found and Resolved: Snapshot Had No Position

`SessionSnapshot` (LSE-3) deliberately never carries live position — it is a durable, cross-session summary,
not a moment-to-moment cursor. Sprint-1's own `ReadingSessionActionResult` returned only `{ snapshot }`,
which meant a UI had no way to know *which chunk to render* without either re-deriving position itself (a
real duplication risk) or holding an entire ULO in browser memory just to look one chunk up. **Resolved**:
`ReadingSessionActionResult` (this feature's own type, not locked core) now also returns `currentChunk`
(a small, denormalized `ReadingChunkView` — id, order, content, checkpoint flag), `queueIndex`, and
`totalChunks` — all read from the `AdaptiveRuntimeState` `applyReadingSessionDecision` was already computing
and silently discarding. No new runtime logic; a new pure resolver
(`orchestration/resolveCurrentChunkView.ts`, tested) reads real, already-existing fields off it.

This is also this sprint's real Performance Optimization: only the *current* chunk's content ever crosses
the wire, on every action — never the full ULO. A document with hundreds of chunks costs exactly as much
per navigation as a document with three.

## Component Map

```
src/app/preview/learning-projects/[id]/read/
  page.tsx                          Server Component: auth, project/document lookup, real Session
                                     Recovery (continueReadingSession) or real "not started"/"not
                                     processed" resolution — the same pattern as every sibling route
  loading.tsx                       Loading States — mirrors the real layout, no layout shift

src/features/quantum-speed-reading-runtime/
  actions/findReadingSessionForDocument.ts   thin filter over LSE-3's own listByLearner (no new capability)
  orchestration/resolveCurrentChunkView.ts   pure (+test) — the current-chunk resolver
  types/ReadingChunkView.ts, ReadingWorkspaceInitialState.ts   new, feature-owned types
  components/
    ReadingWorkspace.tsx             the one client orchestrator (owns snapshot + current chunk state;
                                      useTransition is this component's only loading-state source)
    ReadingChunkViewer.tsx           Current Chunk Viewer — plain text, no highlighting, no animation
    ReadingNavigationControls.tsx    Next / Previous / Pause / Resume / Finish
    ResumeBanner.tsx                 Resume Banner
    SessionProgressBar.tsx           Session Progress
    ReadingTimer.tsx                 Reading Timer — plain elapsed-time display, never a pacing signal
    CompletedSessionScreen.tsx       Completed Session Screen
    ReadingErrorBanner.tsx           Error States
```

## How the 10 Requested Pieces Map to Real Code

| Requested | Real implementation |
|---|---|
| Reading Workspace | `ReadingWorkspace.tsx` |
| Current Chunk Viewer | `ReadingChunkViewer.tsx`, fed by `resolveCurrentChunkView` |
| Next/Previous Navigation | `ReadingNavigationControls.tsx` → `nextReadingChunk`/`previousReadingChunk` (Sprint-1) |
| Resume Banner | `ResumeBanner.tsx`, shown when `page.tsx` found a real existing session |
| Session Progress | `SessionProgressBar.tsx`, reads `snapshot.completionPercentage`/`metrics.completedChunks` directly — no recomputation |
| Reading Timer | `ReadingTimer.tsx`, ticks from real `snapshot.startedAt` |
| Completed Session Screen | `CompletedSessionScreen.tsx`, gated on real `snapshot.status === 'completed'` |
| Loading States | `loading.tsx` (route-level) + `useTransition`'s `pending` (in-component) |
| Error States | `ReadingErrorBanner.tsx`, surfaces every real `{success:false, error}` from any action |
| Performance Optimization | Denormalized `currentChunk` (never the full ULO to the client); Server Component initial load avoids one client round-trip |

## What Was Reused Verbatim, Not Rebuilt

Every session-lifecycle interaction goes through Sprint-1's existing Server Actions
(`startReadingSession`/`nextReadingChunk`/`previousReadingChunk`/`pauseReadingSession`/
`resumeReadingSession`/`finishReadingSession`) unchanged. Session Recovery is Sprint-1's own
`continueReadingSession`, unchanged. No new analytics system — `getReadingProgress` (Sprint-1) exists and
remains available, but the Workspace itself reads progress straight off whichever `SessionSnapshot` the
last action already returned, since that's already real and already in hand. No new runtime, AI pipeline,
or duplicate system — confirmed by scope check below.

## Disclosed Gap: No Document Has a Real ULO Yet

Nothing in the live app currently triggers UCE-1…6 processing and `saveUniversalLearningObject` for an
uploaded document — that pipeline-triggering wiring doesn't exist yet, in this sprint or any prior one. The
Reading Workspace's `'not-processed'` state (§ready-made in `resolveInitialReadingState`) handles this
honestly today, but means this sprint's UI has no real document to point at in a live environment until a
future sprint wires "upload → process → save ULO." Combined with Sprint-1's own disclosed limitation (no
live Supabase connection available here to apply the migration or exercise this end-to-end), this UI is
real, production-shaped code that has been verified for correctness (types, build) but not yet exercised
against live data.

## Verification Results

- `npx tsc --noEmit` — clean, zero errors, on the first pass.
- `npx eslint` on all new files — clean.
- `npx vitest run` (whole repo) — **592 test files, 3751 tests passed** (1 new test file, 3 new tests, for
  `resolveCurrentChunkView`), zero regressions against the pre-sprint 591/3748 baseline.
- `npm run build` — compiled successfully on the first attempt; the new route
  (`/preview/learning-projects/[id]/read`) appears correctly in the route manifest, alongside the untouched
  existing `/preview/learning-studio/quantum-speed-reading`.
- Scope check — confirmed zero diff under any `src/core/` layer; every pre-existing tracked file in this
  sprint's `git status` was already modified before this session began, none newly touched by this sprint.

## Remaining Roadmap

Per the brief's STOP instruction, Sprint-3 does not begin here. Two real dependencies block a live
end-to-end demonstration of this UI, both disclosed rather than worked around: applying the Sprint-1
migration against a real Supabase project, and building whatever future sprint wires document upload to
real UCE processing and ULO persistence.

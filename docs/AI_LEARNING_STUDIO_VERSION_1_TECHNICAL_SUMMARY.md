# AI Learning Studio™ — Version-1 Technical Summary

**Release Candidate:** RC-1

## Architecture layers (bottom to top)

1. **Universal Content Engine™ (UCE-1…6)** — `src/core/universal-learning-engine/`. Real upload
   validation and parsing (UCE-1/2), chunking (UCE-3A), and ULO assembly (UCE-6). Semantic enrichment
   (UCE-3B) and AI-derived knowledge-graph/learning-analysis stages exist and are fully real, but are
   deliberately run *without* `aiFoundation` in production (`buildAndSaveDocumentUniversalLearningObject.ts`,
   ALS-10) — both functions are designed to return complete, real, deterministic output either way, which
   is what makes every downstream mode's "no fake AI" guarantee possible.
2. **Universal Learning Object™ (ULO)** — the one real, persisted artifact every mode reads. Real chunks
   (`content`, `location.order`, `location.sectionHeading`, `metadata.title`, `statistics.wordCount`),
   zero knowledge-graph edges, always-empty `enrichment` — these three facts are the load-bearing
   constraints every honest-content decision in this arc was built around.
3. **Learning Session Engine™ (LSE-1)** — `src/core/learning-session-engine/`. Real session identity,
   status, and natural-order queue. `LearningModeType` names every real and reserved Learning Mode.
4. **Adaptive Learning Runtime™ (LSE-2)** — `src/core/adaptive-learning-runtime/`. Real chunk scheduling
   (`ChunkStrategy`: sequential/priority-first/dependency-first/review-first/adaptive-queue),
   pause/resume/complete/skip/repeat/revisit decisions, all pure and independently tested.
5. **Learning Session Runtime™ (LSE-3)** — `src/core/learning-session-runtime/`. `SessionSnapshot` — the
   one real, bounded, persisted projection of runtime state (never the raw event log). Its `method` field
   (added ALS-15) is a deliberately opaque, mode-defined string — the extensibility point Memory Mode™'s
   six methods, Focus Mode™'s three variants, and Reading Sprint's target duration all reuse, with zero
   further shared-type changes needed per new mode.
6. **Learning Mode Runtime Integration™ (LSE-4)** — `src/core/learning-mode-integration/`. The registry/
   dispatch layer (`createLearningModeRegistry`, `startModeRuntime`) every mode's own `start<Mode>Session.ts`
   composes, never duplicates.
7. **Shared Learning Runtime** — `src/features/learning-mode-runtime/`. The one real
   `SessionPersistenceAdapter` implementation (Supabase-backed, `learning_sessions` table), the one real
   `applyModeSessionDecision`/`runModeSessionDecision` every session action funnels through, and the
   shared presentation components (`SessionProgressBar`, `SessionTimer`, `SessionErrorBanner`,
   `SessionResumeBanner`, `SessionNavigationControls`) every stepped-session mode's own Workspace reuses.
8. **Per-mode feature folders** — `src/features/<mode>-runtime/` (six of these: quantum-speed-reading,
   memory-mode, focus-mode, smart-notes, mcqs-mode, revision-mode) and `src/lib/learning-modes/` (two pure
   generator functions: Mind Map™, Flashcards™). Each stepped-session mode follows the identical 8-9-file
   action template (start/next/previous/pause/resume/finish/continue/find, + one internal decision
   dispatcher) — confirmed, deliberate duplication-as-a-pattern, not an oversight (ALS-19 audit).
9. **Universal Learning Studio™ orchestration** — `src/features/ai-learning-studio/`. The Workspace
   pre-flight shell and `resolveLearningWorkspaceState`/`resolveLearningModeHref` dispatchers that make all
   nine modes reachable from one consistent entry point.

## The nine Learning Modes — real architecture per mode

| Mode | Session model | Real content source | Notable ALS-15+ addition |
|---|---|---|---|
| Quantum Speed Reading™ | Stepped (LSE full stack) | Real chunk content, paginated | Theme selector, Focus Mode chrome toggle |
| Memory Mode™ | Stepped | Real chunk content, six method framings | `SessionSnapshot.method` extensibility point (built here) |
| Focus Mode™ | Stepped | Real chunk content + real/countdown timers | Automatic Pomodoro work/break cycling via existing pause/resume |
| Smart Notes™ | Stepped | Real chunk content + real, separately-persisted notes | Notes scoped per document, not per session |
| Flashcards™ | Generate-once-and-cache | Real heading + real excerpted content | `generated_learning_content` table |
| Mind Map™ | Generate-once-and-cache | Real headings, real document order | Shares cache table/mechanism with Flashcards™ |
| MCQs™ | Stepped | Real structural questions (document organization) | Deterministic seeded distractor selection (never random) |
| Revision Mode™ | Stepped | Real chunk content (review-first strategy) | Real, read-only cross-session history aggregator |
| AI Mentor™ | Separate (no ULO/session model) | Learner's own real progress across every mode above | Own dedicated conversation/session persistence |

## Verification results at RC-1

- **TypeScript** (`npx tsc --noEmit`) — clean, zero errors, whole repository.
- **ESLint** (`npx eslint .`) — clean, zero warnings or errors, whole repository.
- **Vitest** (`npx vitest run`) — **644 test files, 3,927 tests, 100% passing.**
- **Production build** (`npm run build`) — **126 routes**, zero build errors, byte-identical output to the
  immediately prior sprint (ALS-19), confirming a stable, unchanged codebase entering RC-1.
- **Route-guard sweep** — 4 public routes serve real content unauthenticated; 23 protected routes spanning
  the complete user journey (dashboard, Studio, upload, processing, Workspace ×9 mode entries, every
  mode's own dedicated route, AI Mentor™) all correctly redirect to `/login` with the real destination
  preserved via a `next` query parameter.
- **Database migrations** — 39 total migration files; 31 applied to the linked hosted Supabase project, 8
  unapplied (files only), per the standing, founder-confirmed policy since ALS-10. See Known Issues and
  Launch Checklist.

## Design system

- `TYPOGRAPHY` (`src/lib/designSystem/typography.ts`) and `ICON_SIZE` (`src/lib/designSystem/icons.ts`) —
  the two token sets every mode's UI is built on. An ALS-19 audit confirmed consistent usage across all
  eight project-scoped modes' primary content views and all six stepped-session completion screens, with
  two small drifts found and fixed in that same sprint.
- Shared primitives: `Card`, `Button`, `Badge`, `EmptyStateCard`, `LoadingCard`, `Progress` — `src/components/ui/`.
- Motion convention: `animate-in fade-in duration-(--duration-base)` for primary content views,
  `duration-(--duration-slow)` for completion screens — consistent across all eight modes as of ALS-19.
- Accessibility: real `aria-live`/`aria-atomic` regions on every chunk-transition view, `role="radiogroup"`/
  `role="radio"` on every selectable-choice UI (theme selectors, method/variant pickers, MCQ answer
  options), `focus-visible:ring` on every interactive element, inherited consistently through the shared
  `Button` primitive.

## Performance notes

- An ALS-19 bundle-size audit found and fixed the one real outlier in the entire application: the Upload
  Wizard route (`/preview/learning-projects/new`) shipped a ~2.5 MB DOCX-parsing library
  (`mammoth`) to every visitor regardless of whether they uploaded a `.docx`. Converted to a dynamic
  import inside `extractTextFromDocx`; confirmed by build diff to cut that route's own bundle from 204 kB
  to 77.3 kB (First Load JS 360 kB → 234 kB).
- Every other route's own bundle in the application is under 41 kB; the nine Learning Mode routes
  themselves range 189–216 kB First Load JS, tightly clustered with no outlier.

## Full per-sprint technical detail

`docs/PRODUCTION_HANDOFF_AI_LEARNING_STUDIO_SPRINT_ALS_1.md` through `_ALS_20.md` — the authoritative,
detailed record of what was built, investigated, and decided at every step of this arc.

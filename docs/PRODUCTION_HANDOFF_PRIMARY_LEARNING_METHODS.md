# Production Handoff — Primary Learning Methods™ (Upload & Learn™ / Record & Learn™)

**Generated:** 2026-07-14
**Purpose:** Allow a new Claude Code session to continue with zero context loss.
**Scope of this document:** This sprint only. Builds directly on the real, working Upload Experience
(`src/components/learning/NewLearningProjectWizard.tsx`, `/preview/learning-projects/new`) — read this
document before touching that wizard again.

---

## 1. What This Sprint Is

The brief asked the Upload Experience to first let the user choose *how* they want to start learning —
Upload & Learn™ or Record & Learn™ — before anything else. The real Upload Experience already existed as
a working 3-step wizard (Name → Source → Upload), with only PDF functionally accepted anywhere in the
stack (`src/constants/documents/index.ts`'s `ACCEPTED_DOCUMENT_MIME_TYPES = ['application/pdf']`); every
other source type already rendered as a genuine, disabled "Coming Soon" card per
`SourceTypeCard.tsx`'s own stated principle, *"Do NOT fake functionality."* No recording/audio
infrastructure of any kind existed anywhere in the repo before this sprint (confirmed via grep).

### What changed, concretely

- **New first step, "Primary Learning Method"** — two large hero cards, 📄 Upload & Learn™ and
  🎤 Record & Learn™, using the brief's exact literal copy/emoji.
- **Step order changed**: was Name → Source → Upload; is now **Method → Source → Name → Upload**. This is
  a mechanical reorder of existing, unmodified step content — no step's own internal logic changed — made
  because the brief explicitly describes selecting Upload & Learn™ leading straight into "the supported
  learning material options" (the Source step), not into naming the project first.
- **2 new, honestly-disabled source-type entries** — `image` (Images) and `camera-scan` (Camera Scan) —
  added to the existing `SOURCE_TYPES` array alongside the 6 that already existed as "Coming Soon."
  Upload & Learn™'s hero-card subtitle lists Images, Camera Scan, Word Documents, and Text Notes as
  supported; only PDF actually works today, so rather than let the hero card's marketing copy make claims
  with no corresponding UI, these two were added as real (disabled) options, matching how PowerPoint/
  Website/YouTube/EPUB were already handled.
- **Record & Learn™ ends at a real, honest "coming soon" screen** — no audio recording, no microphone
  permission request, no transcription. Selecting it shows the locked future flow description and a
  working Back button. Nothing further was built, per the brief's own explicit instruction.

---

## 2. What Stayed Untouched

- `createLearningProjectWithDocument` (the server action), `validateDocumentFile.ts`,
  `constants/documents/index.ts` — `ACCEPTED_DOCUMENT_MIME_TYPES` is still PDF-only; adding two new
  disabled source-type *cards* doesn't change what the backend actually accepts.
- `UploadZone.tsx`, `UploadProgress.tsx`, `SourceTypeCard.tsx` — reused exactly as they were, zero edits.
- The Source, Name, and Upload steps' own internal JSX/logic — byte-identical to before, only their
  position in the sequence and their `Back` button targets changed.
- `/welcome/*` (Arrival Experience, Learning Goal, the `preparing` stub), AI Processing, Learning
  Blueprint, Learning Workspace — none touched.
- `/welcome/preparing` is **not** wired to redirect into this wizard — that connection remains a separate,
  not-yet-authorized decision (see §5).

---

## 3. Work Completed

### New — `src/components/learning/PrimaryLearningMethodCard.tsx`
The two large hero cards. Reuses the exact glassmorphism visual language already established in
`LearningGoalSelector.tsx` (`bg-background/60 backdrop-blur-sm`, soft border, accent-tinted hover, focus
ring) scaled up for a 2-card hero layout. Both Upload & Learn™ and Record & Learn™ render through this
same component with the same prop shape — "neither should dominate" is a structural guarantee (identical
component, identical size), not just a styling suggestion. Supports an optional `formats` chip list
(used by Upload & Learn™) and an optional custom `illustration` node (used by Record & Learn™).

### New — `src/components/learning/RecordAndLearnIllustration.tsx`
The "premium microphone illustration" — a large `lucide-react` `Mic` icon (already used for every other
source-type icon in this exact wizard) over a soft, breathing radial glow, reusing the already-established
`breathing-pulse` CSS keyframe (`src/app/globals.css`, pre-existing — no new keyframe added) rather than
inventing new motion or commissioning bespoke SVG artwork. Gated by `usePrefersReducedMotion`.

### `src/components/learning/NewLearningProjectWizard.tsx` (rewritten step machine, same step content)
- `step` type changed from `1 | 2 | 3` to named states: `'method' | 'source' | 'name' | 'upload' |
  'record-coming-soon'` — clearer than renumbering integers now that the sequence and count changed.
- New `method` step renders the two hero cards; selecting Upload & Learn™ → `source`; selecting Record &
  Learn™ → `record-coming-soon`.
- `record-coming-soon` reuses `ModulePlaceholder` (`src/components/shell/ModulePlaceholder.tsx` — the
  same reusable "real route, real auth, no business logic yet" stub pattern already established for the
  `/welcome/preparing` hook in the previous sprint) with copy describing the full locked future flow:
  Record → AI Transcription → AI Understanding → Learning Blueprint™ → Learning Workspace™ → Smart
  Notes™ → Mind Map™ → Flashcards™ → MCQs™ → Memory Test™ → Revision™ → Learning Proof™ → Dashboard™.
- `source`, `name`, `upload` steps — same JSX, same handlers (`selectSourceType`, `submitUpload`,
  `handleFileSelected`, `handleRetry`, `handleCancel`), only their `Back` button targets updated to match
  the new order (`source` → back to `method`; `name` → back to `source`; `upload` → back to `name`).
- `SOURCE_TYPES` gained the 2 new disabled entries described above; reordered slightly so Images/Camera
  Scan/Word/Text (the formats named in Upload & Learn™'s subtitle) appear first, before the pre-existing
  PowerPoint/Website/YouTube/EPUB entries — cosmetic ordering only, no entry's `enabled` value changed
  except the 2 new ones (both `false`).
- Step counter ("Step X of 4") shown for the 4 main-path steps; omitted on the `record-coming-soon`
  dead-end screen, which isn't part of that numbered sequence.

---

## 4. Files Changed / Added

```
NEW   src/components/learning/PrimaryLearningMethodCard.tsx
NEW   src/components/learning/RecordAndLearnIllustration.tsx
NEW   docs/PRODUCTION_HANDOFF_PRIMARY_LEARNING_METHODS.md
MOD   src/components/learning/NewLearningProjectWizard.tsx
```

No other file touched — confirmed via `git status`/`git diff --stat`.

---

## 5. Future Hooks

1. **Wiring `/welcome/preparing`** (the previous sprint's LW-1C stub) to redirect into this wizard's new
   `method` step, so the full `Arrival → Learning Goal → Primary Learning Method → ...` flow connects
   end-to-end. Deliberately not done this sprint — a routing decision, not this sprint's scope.
2. **Real Record & Learn™ implementation** — the `record-coming-soon` screen in
   `NewLearningProjectWizard.tsx` is the exact swap point: replace its `ModulePlaceholder` render with a
   real recording UI once microphone capture, transcription, and the rest of the locked flow have backend
   support. The step-machine's `'record-coming-soon'` state and the `handleBegin`-style navigation pattern
   already established elsewhere in this app are ready to extend.
3. **Real Images/Camera Scan/Word/Text upload support** — each just needs `enabled: true` on its
   `SOURCE_TYPES` entry plus corresponding validation logic in `validateDocumentFile.ts` and an
   `ACCEPTED_DOCUMENT_MIME_TYPES` update — the UI-level "Coming Soon" → real toggle is already the
   established pattern this codebase uses (see how `pdf` itself was enabled).

---

## 6. Validation (exact results, this sprint)

1. `npx tsc --noEmit` — **clean, whole repo, first attempt.**
2. `npx eslint` on all 3 new/changed files — **zero findings.**
3. `npx vitest run` (whole repo) — **470 test files, 3169 tests, all passing** — identical count to before
   this sprint (no pure logic added; this is UI/flow-structure only).
4. `npm run build` — **green, first attempt** (the known unrelated `reading-discovery` prerender flake
   did not trip this run).
5. `git status`/`git diff --stat` — the tracked `M` list is unchanged from before this sprint; all changes
   live inside the already-untracked `src/components/learning/` directory, consistent with the rest of the
   `/preview` arc.

---

## 7. Known Limitations

1. **No browser was available to visually preview the new hero cards or the reordered wizard flow** in
   this environment (no browser-automation tool, same disclosed limitation as every prior UI sprint this
   session). Verified instead via a clean production build, `tsc`/`eslint` correctness, and careful
   tracing of every state transition. A manual pass through the full Method → Source → Name → Upload path
   (confirming the real PDF upload still completes end-to-end) is recommended before this ships.
2. **The 2 new source-type entries (Images, Camera Scan) are UI-only** — genuinely disabled, no backend
   support exists for either; adding them was a transparency choice (match what the hero card's copy
   claims), not a functionality claim.
3. **Record & Learn™ has zero real capability** — by explicit brief instruction. The `ModulePlaceholder`
   copy describes the full future flow accurately as *future*, never implying it works today.
4. **`/welcome/preparing` and this wizard remain two disconnected islands** — see Future Hooks §5.1.

---

## 8. Resume Instructions

**Nothing further has been authorized beyond this sprint.** When the next brief arrives:

1. Read this document first, especially §5 (future hooks) before assuming what already exists.
2. If it's about wiring the `/welcome/*` flow into this wizard, or building real Record & Learn™: treat
   either as a genuine architectural/routing decision requiring the same scrutiny as prior sprints'
   routing decisions in this session — confirm scope explicitly before assuming.
3. Verify using the same sequence as this sprint (§6) — the whole-repo baseline going forward is
   **470 test files / 3169 tests**, `tsc` clean, `eslint` clean, build green.
4. Report results and stop — do not begin further work without a new, explicit user instruction.

**Nothing else is pending.**

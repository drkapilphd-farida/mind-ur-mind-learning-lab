# Production Handoff — AI Learning Studio™ Sprint ALS-4: Learning Blueprint™ Experience

## Status: COMPLETE. QSR, Memory Mode, Smart Notes, AI Mentor, the Shared Learning Runtime, Dashboard, and the AI Processing Experience™ (ALS-3) untouched.

## The conflict this sprint had to resolve before writing any code

A full, premium "Learning Blueprint Experience" screen (`LearningBlueprintExperience.tsx`, at
`/preview/learning-projects/[id]`) already existed, built across several prior sprints, already
covering nearly every field this brief asked for — document title, content type, difficulty, estimated
learning time, chapters, key concepts, AI summary, and an already-real rule-based "Recommended Learning
Mode" engine (`recommendLearningMode.ts`). Its primary action already led to a "coming soon" screen
rather than a real workspace, already matching "do not enter the Workspace yet."

The problem: every content field on it (summary, chapters, concepts, difficulty, topics) is explicitly,
repeatedly disclosed throughout the codebase as deterministic template content, seeded from the
document id — because no real Universal Content Engine exists anywhere in this app, and no file
content is stored anywhere (a limit disclosed since ALS-2, re-confirmed in ALS-3). There is no real
text anywhere to detect chapters or concepts *from*. This brief's "no fake values, no mock cards, real
UCE output" cannot be literally satisfied without first building genuine content extraction and
analysis — a much larger undertaking than "the Blueprint screen," and exactly what every prior ALS
sprint explicitly deferred.

Founder confirmed via `AskUserQuestion`: **reuse the existing screen. Make what's honestly real, real.
For what can't be, disclose it visibly as a preview rather than presenting it as fact.**

## What changed — real data replacing fabricated/mislabeled data

| Field | Before | After |
|---|---|---|
| Content type | A private `DOCUMENT_TYPE_LABEL` lookup in `BlueprintHero.tsx` that only recognized `application/pdf`; every other real format (image, Word, text) silently fell back to the generic word "Document." | Reuses `analyzeDocumentContent`'s `formatLabel` (built in ALS-3) — the same real, mime-type-derived label the processing screen already computes, covering every accepted format honestly. One source of truth, not a second lookup table. |
| Estimated reading time | Did not exist as its own field — the "AI Observations™" card labeled "Estimated Reading Time" actually showed `blueprint.estimatedMinutes`, the *mock, multi-step learning-journey* estimate, mislabeled. | A real, distinct field: `analyzeDocumentContent(document).estimatedReadingMinutes`, derived from the document's real size. Now shown correctly in both `BlueprintHero` and the (fixed) AI Observations card, and correctly distinguished from "Estimated learning time." |
| Estimated learning time | `blueprint.estimatedMinutes` (template-derived from real size, via a different, larger formula representing the full multi-step journey). | Unchanged — this field's own formula was already genuinely size-derived, just living inside the template generator; kept as-is, now clearly labeled "learning time" instead of ambiguous "minutes," distinct from reading time. |
| Learning Objective | Did not exist. | New: `deriveLearningObjective(documentTitle)` — a real, generic, non-fabricated sentence built only from the one clearly-real input available (the document's real title), kept deliberately outside `generateLearningBlueprint.ts`'s mock pipeline rather than folded into it. |
| "Start Learning" | Button read "Resume Learning" (and the coming-soon screen it led to read the same), even though `hasStartedLearning` is honestly hardcoded `false` — every visit is, today, a first entry. | Renamed to "Start Learning" throughout (button text and the internal action label passed to `WorkspaceComingSoonScreen`), matching this sprint's explicit terminal-CTA instruction and the honest current state. |
| Chapters, Key Concepts, AI Summary, Complexity | Presented as plain content with no indication they're template-generated. | Unchanged in content (still the existing, disclosed `generateLearningBlueprint` output) — but a new, visible "Illustrative preview" notice now sits directly on the page, immediately after the Hero, stating plainly that content type/reading time are real and calculated from the file, while concepts/chapters/complexity are a preview structure pending full AI content analysis. Nothing is silently presented as verified fact. |
| Recommended Learning Mode | Already real (`recommendLearningMode.ts`, rule-based, never hardcoded). | Unchanged — already satisfied this sprint's requirement. |

## Keeping architecture reusable for future Learning Modes

Already structurally satisfied before this sprint, not something this sprint needed to add:
`LearningModeId` is an open, extensible union; `LEARNING_MODES` is a plain data array any future mode
can be appended to; `resolveLearningModeHref` and `WorkspaceComingSoonScreen` already handle
`href: null` gracefully (4 of the current 9 modes — Smart Notes™, Mind Map™, Flashcards™, MCQs™ —
already work this way). "Exam Prep" wasn't added as a live mode this sprint since none was explicitly
requested as active — the same `href: null` pattern accommodates it (and any other future mode)
without any architecture change when that sprint arrives.

## What was deliberately left untouched

- `generateLearningBlueprint.ts` and the `LearningBlueprint` type — zero changes. The mock pipeline
  itself wasn't touched; only the page-level composition around it changed.
- `recommendLearningMode.ts`, `AIRecommendationHero.tsx` — already real, not touched.
- `WorkspaceComingSoonScreen.tsx` — already correctly stops before a real Workspace; not touched.
- `useProcessingPipeline`, `ProcessingExperience.tsx`, and everything else from ALS-3 — zero changes
  (confirmed via `find -newer`, zero files under the processing route touched this sprint).
- QSR, Memory Mode, Smart Notes, AI Mentor, the Shared Learning Runtime, `src/core/`, `/preview/dashboard`.
- Learning Workspace™ — not begun, per the brief's explicit "do not enter" instruction.

## Files created

```
src/lib/blueprint/deriveLearningObjective.ts   (+ .test.ts, 2 cases)
```

## Files modified

```
src/components/learning/BlueprintHero.tsx              (content type from real analysis, real reading time, learning objective, "Start Learning")
src/components/learning/AIObservationCards.tsx          (Estimated Reading Time card now reads the real value, not the mislabeled mock one)
src/components/learning/LearningBlueprintExperience.tsx (threads real analysis + objective, adds the Illustrative Preview notice, "Start Learning")
src/app/preview/learning-projects/[id]/page.tsx          (+ documentSizeBytes prop, needed for the real analysis)
```

## Verification Results

- `npx tsc --noEmit` — clean.
- `npx eslint` scoped to every created/modified file above — clean.
- `npx vitest run` (whole repo) — **635 test files, 3898 tests passed** — up from ALS-3's 634/3896 by
  exactly one new file and two new tests (`deriveLearningObjective.test.ts`), proving zero regression
  anywhere else.
- `npm run build` — compiled successfully, 113 routes (same count as ALS-3). Diffed the full route
  table against ALS-3's build log line-by-line: exactly two lines changed —
  `/preview/learning-projects/[id]` (11.3 kB → 11.8 kB, the real new content) and
  `/preview/learning-projects/[id]/processing` (9.14 kB → 9.17 kB, a 30-byte shift). The second is the
  same disclosed, non-functional webpack chunk-splitting phenomenon documented in every prior sprint
  this arc — both routes now share the `analyzeDocumentContent` module in their import graphs.
  Confirmed via `find -newer`: zero files under the processing route changed this sprint. Every other
  route is byte-identical.
- Manual check: dev server started; `/preview/learning-projects/[id]` renders the full Blueprint
  screen with the real content type, real reading time, the Learning Objective line, the Illustrative
  Preview notice, and a "Start Learning" button that still correctly stops at
  `WorkspaceComingSoonScreen`.

## Locked Decisions

1. "Real Universal Content Engine output" is honestly bounded by what exists: real document metadata
   only, no stored file content. Every field that can be honestly derived from metadata now is; every
   field that would require actual content understanding stays as the existing, disclosed template
   content, now visibly labeled as a preview on the page itself, not just in code comments.
   Founder-confirmed via this sprint's opening `AskUserQuestion`.
2. `deriveLearningObjective` stays outside `generateLearningBlueprint.ts`'s seeded-mock pipeline,
   deliberately, since it depends on nothing but the one genuinely real input available (the title).
3. "Start Learning" replaces "Resume Learning" everywhere on this screen, matching both the brief's
   explicit terminal CTA and the honestly-always-false `hasStartedLearning` state today. A future
   Workspace sprint, once real session-started tracking exists, can reintroduce a conditional
   "Resume Learning" for a genuinely-in-progress project — not implemented here.
4. No new Learning Mode (including "Exam Prep") was added to `LEARNING_MODES` this sprint — the
   existing `href: null` → `WorkspaceComingSoonScreen` pattern already demonstrates the architecture
   is reusable for it whenever a future sprint actually builds it.

## Future Extension Points (not implemented)

- Learning Workspace™ (explicitly out of scope — the CTA stops at "Start Learning")
- A real Universal Content Engine (real file storage + real text extraction + real content analysis),
  which would let chapters/concepts/summary/complexity stop being template preview content
- A genuine "Exam Prep" Learning Mode entry
- Conditional "Resume Learning" vs "Start Learning" once real session-started tracking exists

## Stop

No further AI Learning Studio sprint begins here without explicit approval.

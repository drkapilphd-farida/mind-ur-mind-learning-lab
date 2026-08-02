# Changelog

[← Back to index](./PROJECT_BLUEPRINT.md)

Chronological record of every completed sprint in Quantum Speed Reading™ V2, in the order they actually happened. This is the concise version — full purpose/architecture/design-decision detail for each sprint lives in [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md), Section 2.

## Sprint 3.1A — Master Reading Engine™ Foundation
Built the shared engine as pure infrastructure with zero UI consumer: `ReadingUnit`/`ReadingSessionResult`/`ReadingRuntimePhase` types, `useReadingRuntime`, `useReadingSession`, `readingMetrics.ts`, `readingLocalHistory.ts`, `ReadingStatTile`. Unit-tested from day one. No mode existed on top of it yet.

## Sprint 3.1B — Vertical Word Reading migration
Migrated the pre-existing, hand-built Vertical Word Reading exercise onto the new engine, replacing its one-off timing hook. Introduced the `ReadingUnit` content-preparation convention at the dataset layer without changing the engine hook's own `string[]` signature. First proof the engine actually works end to end.

## Sprint 3.2 — Phrase Reading Mode™
Second mode, first proof the engine generalizes to a genuinely different content shape (multi-word phrases). Confirmed live via direct timing measurement that word-count-weighted pacing (`computeUnitDwellMs`) works correctly with no engine changes.

## Sprint 3.2A — Reading Experience Polish™
Extracted the shared Reading Shell (`ReadingHeader`, `ReadingLayout`, `ReadingProgressBar`, `ReadingSessionCompleteScreen`) out of duplicated per-mode code, retrofitting both existing modes onto it. Deleted two now-redundant mode-specific completion screens (confirmed byte-identical except subtitle copy). Renamed "Current WPM" → "Reading Pace" with a "Warming up…" state.

## Sprint 3.3 — Sentence Reading Mode™
Third content shape (one full sentence per unit). First mode built directly on the finished shared shell — needed zero mode-specific completion code, direct evidence the 3.2A extraction was paying off. Renamed "Average WPM" → "Average Reading Pace" in the shared completion screen, verified the change correctly propagated to every mode.

## Sprint 3.3A — Reading Hub Experience™
Gave the four, until-then URL-only modes a real discoverable entry point: new `reading-hub` feature folder, new `getPracticeSessionsForExercises` server query, one new footer link on Lab Home. Real data throughout (Best Reading Pace, Last Practised, Today's Practice, Streak) — deliberately did not fabricate a Recent Activity WPM number that no real column backs.

## Sprint 3.4 — Paragraph Reading Mode™
Fourth content shape (a whole paragraph per unit) — the first long-form mode. Borrowed the legacy V1 comfort-reading typography convention (fixed-pixel font-size/line-height) rather than the large display type the other three modes use. Confirmed live that long paragraphs dwell proportionally longer than short ones at the same target WPM.

## Sprint 3.4A — Apple Motion Polish™
First motion-quality pass across all four modes. Fixed two real root causes of mechanical-feeling motion: unnecessary remounts on content advance, and a snapping `font-size` transition in Vertical Word Reading. Built `useContentCrossfade` (same-node exit→pause→enter, no remount).

## Sprint 3.4B — Continuous Reading Motion Engine™
A genuine interaction-model redesign for Phrase, Sentence, and Paragraph Reading: adopted a "windowed previous/current/next" model, all three slots always visible, each crossfading independently via `useContentCrossfade`. A full-dataset scroll design was considered and rejected at this point as too risky for highly variable paragraph heights.

## Sprint 3.4C — Flow Reading Experience™ (Phrase Reading only)
Generalized Vertical Word Reading's own proven "permanent list + single scroll transform" mechanism to Phrase Reading, with a fixed row height per `PhraseSize`. Phrase Reading stopped using `useContentCrossfade` at this point.

## Sprint 3.4D, first pass — Reference Flow Implementation (Sentence + Paragraph)
Extended 3.4C's vertical-scroll model to Sentence Reading. Paragraph Reading deliberately kept its windowed-peek structure (to avoid clipping risk on highly variable-length text) but gained a small consistent upward drift on its existing crossfade transitions.

## Sprint 3.4D, second pass — Phrase Flow Reading™ (horizontal)
Replaced Phrase Reading's vertical scroll with a horizontal one (`translateX`, fixed column widths per `PhraseSize`), per an explicit new instruction. Sentence, Paragraph, and Vertical Word Reading were explicitly untouched, leaving Phrase Reading as the only mode on a horizontal axis — a deliberate, current asymmetry (see [LIMITATIONS_AND_TECHNICAL_DEBT.md](./LIMITATIONS_AND_TECHNICAL_DEBT.md)), left in place pending explicit approval to expand the model elsewhere.

---

**A transparency note that applies across Sprints 3.4B through 3.4D (second pass):** each of these sprints' briefs referenced an "attached reference video" as the design target. No such video ever actually reached the agent implementing them — every affected sprint disclosed this openly rather than silently guessing and presenting the guess as verified fact. All motion decisions in this range were made from textual descriptions only (see [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md) and [AI_HANDOVER.md](./AI_HANDOVER.md) for why this matters to how future sprint briefs should be handled).

**Verification discipline, unchanged across every sprint above:** `npx tsc --noEmit`, `npx eslint .`, `npx vitest run` — 751 test files / 4459 tests, confirmed unchanged (other than genuinely new tests) after every single sprint in this list.

[← Back to index](./PROJECT_BLUEPRINT.md) · [Next: Appendix →](./APPENDIX.md)

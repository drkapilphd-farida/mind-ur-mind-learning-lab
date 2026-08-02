import { computeUnitDwellMs } from '@/features/reading-engine/readingMetrics'
import type { ReadingUnit } from '@/features/reading-engine/types'

export type ContinuousStreamOffsetInput = {
  units: readonly ReadingUnit[]
  currentUnitIndex: number
  targetWpm: number
  elapsedMs: number
  // The pixel center-position of unit `index` along the track. Deliberately
  // a caller-supplied function rather than a single `columnWidth` number —
  // Phrase Reading uses fixed-width columns (uniform arithmetic), while
  // Sentence/Paragraph Reading (Strict Single-Line Sprint) use real,
  // per-unit measured single-line text widths (variable spacing) — this
  // utility's own lerp math is identical either way, so it stays the one
  // shared piece rather than being duplicated per width model.
  offsetForIndex: (index: number) => number
}

// Streaming Motion Sprint — a shared, presentation-only motion utility
// (same category as useContentCrossfade.ts: no reading/session logic of
// its own, purely a pixel-offset calculation), used by every horizontal-
// streaming Reading Mode's Canvas (Phrase, Sentence, Paragraph) so all
// three share one identical continuous-ticker feel rather than each
// re-deriving this math independently — this is the one piece of logic
// genuinely shared across those three Canvases, not duplicated three times
// (per this project's own "zero duplicated logic across modes" rule).
//
// The previous "discrete" motion model held a column still for its entire
// dwell window, then snapped to the next column over a short ~260ms ease.
// That reads as a jump-then-pause, not a continuous stream. This instead
// derives a pixel offset that glides linearly from the *previous* unit's
// centered position to the *current* unit's centered position across
// exactly the current unit's own dwell duration (computeUnitDwellMs) —
// so the track is always in motion, arriving at true center for a unit
// right as the engine is about to advance past it, then immediately
// beginning the next glide. A new unit therefore visibly enters from the
// right and drifts left into center — a real "flows right to left"
// stream, not a cut.
//
// Deliberately derived only from currentUnitIndex/elapsedMs/targetWpm
// (all already engine outputs) plus the read-only computeUnitDwellMs pure
// function (imported, never modified) — no independent clock. Because
// elapsedMs only accumulates while the engine's own phase is 'reading'
// (see useReadingRuntime.ts's timer), pausing freezes elapsedMs and this
// offset freezes with it automatically — no separate pause-handling logic
// needed here, and nothing in useReadingRuntime.ts/useReadingSession.ts/
// readingMetrics.ts is touched or reimplemented.
export function computeContinuousStreamOffsetPx({ units, currentUnitIndex, targetWpm, elapsedMs, offsetForIndex }: ContinuousStreamOffsetInput): number {
  if (currentUnitIndex <= 0 || units.length === 0) {
    return offsetForIndex(0)
  }

  let cumulativeDwellBeforeCurrentMs = 0
  for (let i = 0; i < currentUnitIndex; i += 1) {
    const unit = units[i]
    if (unit) cumulativeDwellBeforeCurrentMs += computeUnitDwellMs(unit.text, targetWpm)
  }

  const currentUnit = units[currentUnitIndex]
  const dwellForCurrentUnitMs = currentUnit ? computeUnitDwellMs(currentUnit.text, targetWpm) : 0
  if (dwellForCurrentUnitMs <= 0) {
    return offsetForIndex(currentUnitIndex)
  }

  const timeIntoCurrentUnitMs = Math.min(Math.max(elapsedMs - cumulativeDwellBeforeCurrentMs, 0), dwellForCurrentUnitMs)
  const fraction = timeIntoCurrentUnitMs / dwellForCurrentUnitMs

  const previousOffset = offsetForIndex(currentUnitIndex - 1)
  const currentOffset = offsetForIndex(currentUnitIndex)
  return previousOffset + (currentOffset - previousOffset) * fraction
}

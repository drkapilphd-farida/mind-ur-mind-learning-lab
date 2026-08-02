// Master Reading Engine™ (Sprint 3.1A) — canonical metrics namespace.
// computeWpm/formatElapsedTime are re-exported, not reimplemented:
// readingSessionEngine.ts's computeLiveWpm/formatElapsedTime are already the
// de facto cross-feature-folder canonical source (imported by
// ReadingAssessmentFlow.tsx, ReadingSprintView.tsx,
// useContinuousSprintRuntime.ts, and others) — a third independent copy of
// the same one-line formula would be the exact duplication this engine
// exists to retire going forward.
export { computeLiveWpm as computeWpm, formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'

// The one piece genuinely missing a canonical home: today this exact logic
// only exists copy-pasted/private inside phraseEngine.ts, paragraphEngine.ts,
// and useContinuousSprintRuntime.ts. This becomes the one importable source
// going forward; those existing copies are untouched this sprint.
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// How long a reading unit should stay on screen before the runtime advances
// past it, at a given target WPM. A 3-word unit dwells 3x as long as a
// 1-word unit at the same target WPM — this is what lets a single runtime
// correctly pace word/phrase/sentence/paragraph units without special-casing
// any of them, purely from how the caller chunks its content.
export function computeUnitDwellMs(unit: string, targetWpm: number): number {
  return countWords(unit) * (60_000 / targetWpm)
}

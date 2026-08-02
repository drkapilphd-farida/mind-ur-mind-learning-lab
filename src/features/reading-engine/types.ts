// Master Reading Engine™ (Sprint 3.1A) — shared types for every future
// content-paced reading mode (vertical-word, horizontal-phrase,
// vertical-phrase, sentence, paragraph, guided-paragraph). The engine is
// content-blind: a "unit" is a plain string — one word, a phrase, or a whole
// paragraph — and it never inspects what's inside one. Display Modes own
// all rendering/layout; when they render a list of units, repeated
// identical units must be keyed by `${unit}-${index}` (index, not content
// alone), the same convention VerticalWordReadingCanvas.tsx already uses.

export type ReadingRuntimePhase = 'settings' | 'reading' | 'paused' | 'complete'

// The content-*shape* axis (word vs. phrase vs. paragraph, etc.) — distinct
// from this domain's existing ReadingMode ('learning' | 'focus' | 'speed' |
// 'quantum', readingModes.ts), which is a pacing-*profile* axis. A mode id
// here has no registry yet — nothing exists to register until Sprint 3.1B
// builds the first Display Mode.
export type ReadingDisplayModeId = 'vertical-word' | 'horizontal-phrase' | 'vertical-phrase' | 'sentence' | 'paragraph' | 'guided-paragraph'

// Deliberately minimal — targetWpm is the only setting every WPM-paced mode
// needs today. Visual preferences (font/width/line-height/theme/focus/guide)
// already live in readingPreferences.ts and compose alongside this later;
// they aren't merged in now since nothing here consumes them yet. Adding a
// field to this object type later needs no redesign.
export type ReadingSettings = {
  targetWpm: number
}

// A prepared piece of content ready for the engine. The engine itself
// (useReadingRuntime) still takes plain strings — this wrapper exists at the
// content-preparation layer so Display Modes have a stable id to key
// repeated-identical units by (`unit.id`, not `${text}-${index}`), without
// requiring any change to the locked runtime's own signature.
export type ReadingUnit = {
  id: string
  text: string
}

export type ReadingSessionResult = {
  averageWpm: number
  targetWpm: number
  elapsedMs: number
  wordsRead: number
  totalWords: number
  completionPercent: number
  wasFinishedEarly: boolean
}

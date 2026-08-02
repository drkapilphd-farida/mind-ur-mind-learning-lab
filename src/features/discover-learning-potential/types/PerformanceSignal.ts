// Discover Your Learning Potential™ — Sprint-1 Foundation. Learning
// Intelligence Engine™'s real signal shape — the one contract every
// future Reading/Memory/Focus Discovery engine emits real observations
// through (Sprint-2+ wires the actual emission; this sprint defines the
// seam only). Mirrors the brief's own named "Performance Signals" list.
export type PerformanceDomain = 'reading' | 'memory' | 'focus'

export type PerformanceSignalKind =
  | 'reading-speed'
  | 'reading-accuracy'
  | 'reading-time'
  | 'answer-time'
  | 'wrong-answer'
  | 'memory-performance'
  | 'focus-performance'
  | 'confidence'
  // Reading Discovery Engine™ (Sprint-2 Part-1) — real hesitation
  // (elapsed ms before a response) and recognition speed (elapsed ms to
  // register a stimulus) signals the brief's own "AI OBSERVES" list
  // names explicitly.
  | 'hesitation'
  | 'recognition-speed'

export type PerformanceSignal = {
  domain: PerformanceDomain
  kind: PerformanceSignalKind
  // A real, already-normalized numeric observation (e.g. a WPM number,
  // an accuracy percentage, a reaction time in ms) — never a guess. The
  // unit is implied by `kind`, same convention `RuntimeMetrics` already
  // uses one layer down in the QSR runtime.
  value: number
  occurredAt: string
}

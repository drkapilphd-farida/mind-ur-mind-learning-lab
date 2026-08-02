// Reading Session Engine™ — Sprint 2 of Quantum Speed Reading™'s Reading
// Experience. Pure functions only; no cross-mission imports. Every mission
// in this pack computes live/session WPM the same way
// (`(words / elapsedMs) * 60000`, see phraseEngine.ts/paragraphEngine.ts) —
// this file keeps its own copy rather than importing theirs, matching this
// pack's established self-contained-feature-folder convention.

export function computeLiveWpm(wordsRead: number, elapsedMs: number): number {
  if (elapsedMs <= 0 || wordsRead <= 0) return 0
  return Math.round((wordsRead / elapsedMs) * 60_000)
}

export function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function estimateRemainingSec(wordsRemaining: number, currentWpm: number): number {
  if (currentWpm <= 0 || wordsRemaining <= 0) return 0
  return Math.round((wordsRemaining / currentWpm) * 60)
}

export function computeReadingProgressPercent(scrollTop: number, scrollHeight: number, clientHeight: number): number {
  const scrollableDistance = scrollHeight - clientHeight
  if (scrollableDistance <= 0) return 100
  const percent = (scrollTop / scrollableDistance) * 100
  return Math.min(100, Math.max(0, Math.round(percent)))
}

// Cumulative word count through and including a given paragraph index —
// the "words read so far" figure that live WPM and Reading Progress both
// derive from the same scroll-position-driven index.
export function wordsReadThroughLine(lines: readonly string[], lineIndex: number): number {
  let total = 0
  for (let i = 0; i <= lineIndex && i < lines.length; i++) {
    total += lines[i]?.trim().split(/\s+/).filter(Boolean).length ?? 0
  }
  return total
}

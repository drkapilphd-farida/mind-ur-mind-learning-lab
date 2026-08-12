// Sensory Hologram Builder™ — pure speech-duration estimation. Used as
// the safety-net pacing timer whenever real speech synthesis isn't
// available (no `speechSynthesis` in the browser, no voice for the
// requested language, or the API errors mid-utterance) — the session
// must still progress at a believable spoken pace so the on-screen
// caption isn't left up for an arbitrary fixed duration regardless of how
// long the actual sentence is.
const BASELINE_WORDS_PER_MINUTE = 150
const MINIMUM_LINE_DURATION_MS = 1800

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// Estimates how long a real speech engine would take to speak `text` at
// the given rate multiplier (matching SpeechSynthesisUtterance.rate's own
// semantics — 1.0 is "normal," 0.85 is 15% slower). Floors at
// MINIMUM_LINE_DURATION_MS so a one- or two-word line still gets a real
// beat on screen rather than flashing by instantly.
export function estimateSpeechDurationMs(text: string, rate: number): number {
  const words = countWords(text)
  if (words === 0) return MINIMUM_LINE_DURATION_MS
  const effectiveWordsPerMinute = BASELINE_WORDS_PER_MINUTE * rate
  const minutes = words / effectiveWordsPerMinute
  return Math.max(MINIMUM_LINE_DURATION_MS, Math.round(minutes * 60_000))
}

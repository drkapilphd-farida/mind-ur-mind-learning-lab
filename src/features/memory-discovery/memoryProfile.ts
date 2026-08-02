// Memory Discovery™ per-mission behavioral signals — the real, raw
// observations every experiment produces (what was shown vs. what the
// user actually selected during recall, plus whether each single-choice
// recognition answer matched the flashed item exactly). No AI, no
// scoring, no percentages computed here.
//
// Sprint-2 — the old 21-archetype bullet-list engine that used to live in
// this file (`deriveMemoryProfile`) is retired: the Memory Intelligence
// Engine™ (`memoryIntelligenceEngine.ts`) now turns these same real
// signals into the actual closing report ("Do not build a Result Screen.
// Build a Memory Discovery Report."). This file keeps only the real,
// still-used inputs — the signal shape and the one real helper
// (`overlapRatio`) every recall-grid experiment computes its own ratio
// with.

export type MemoryProfileSignals = {
  // Fraction (0–1) of shown items the user re-selected during that
  // experiment's recall grid — a same-length case-insensitive text
  // overlap, not an id match (recall choices are plain display strings).
  visualRatio: number
  wordRatio: number
  // Sprint-1.5 FIX-04 — Pattern & Sequence™ is a real order-match now
  // (1 if the chosen order was exactly right, 0 otherwise), not a
  // partial-overlap ratio.
  patternAccuracy: number
  imageRatio: number
  // Sprint-1.5 FIX-05 — Recognition & Recall's third real content type.
  shapeRatio: number
  // Whether the single-choice answer's label matched the flashed
  // sentence exactly, and whether the real Digit Span™ session (Sprint-
  // 1.5 FIX-02 — multiple real rounds now, not one) was captured overall
  // (at least half of its real rounds answered correctly).
  sentenceExact: boolean
  numberExact: boolean
}

// Case-insensitive set overlap: how much of what was shown reappeared in
// what the user picked. Order-independent — this is about recognition,
// not sequence.
export function overlapRatio(shown: readonly string[], selected: readonly string[]): number {
  if (shown.length === 0) return 0
  const selectedLower = new Set(selected.map((item) => item.toLowerCase()))
  const matched = shown.filter((item) => selectedLower.has(item.toLowerCase())).length
  return matched / shown.length
}

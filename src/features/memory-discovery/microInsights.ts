// Memory Discovery™ Mini Discovery text — rule-based, computed from this
// session's own signals (same shape as memoryProfile.ts) so every
// experiment's insight reflects what actually happened, never a fixed
// line. No AI, no randomness — a plain threshold read on a real ratio or
// exact-match boolean.
//
// Sprint-1.6 FIX-08 — "Micro Feedback System™... Replace generic
// responses with contextual reinforcement... Maximum one short
// sentence." Rewritten to the brief's own short, energetic, emoji-led
// voice — still a real, honest tier read on this session's own real
// signal (never scoring, never "wrong"), just punchier and shorter than
// the previous full-sentence phrasing.

export function visualInsight(visualRatio: number): string {
  if (visualRatio >= 0.5) return '🎯 Perfect Recognition!'
  if (visualRatio > 0) return '✨ Nice Recall!'
  return '👀 Your Eyes Moved Fast!'
}

export function wordInsight(wordRatio: number): string {
  if (wordRatio >= 0.5) return '🧠 Excellent Focus!'
  if (wordRatio > 0) return '✨ Nice Recall!'
  return '💭 Meaning Stuck, Not Words.'
}

// Sprint-1.5 FIX-04 — Pattern & Sequence is now a real order-match
// (correct/incorrect), not a partial-overlap ratio, so this reads as a
// real yes/no observation rather than a ratio threshold — same
// reinforcing, never-scoring voice as every other insight here.
export function patternInsight(patternCorrect: boolean): string {
  return patternCorrect ? '⚡ Great Memory!' : '🔗 The Pattern Felt Familiar.'
}

export function sentenceInsight(sentenceExact: boolean): string {
  return sentenceExact ? '🎯 Perfect Recognition!' : '💭 The Feeling Stayed With You.'
}

export function imageInsight(imageRatio: number): string {
  if (imageRatio >= 0.34) return '🧠 Excellent Focus!'
  return '👀 You Noticed the Scene.'
}

// Sprint-1.5 FIX-05 — Recognition & Recall's third real content type
// (shapes/colours), same real overlap-ratio shape as Visual/Word/Image.
export function shapeInsight(shapeRatio: number): string {
  if (shapeRatio >= 0.34) return '⚡ Great Memory!'
  return '🎨 Motion Over Detail.'
}

export function numberInsight(numberExact: boolean): string {
  return numberExact ? '🎯 Perfect Recognition!' : '🚀 Ready for the Next Challenge?'
}

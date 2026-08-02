// Progressive AI Commentary™ / Difficulty Feedback™ — Sprint-1.7 RULE-05,
// refined by Sprint-1.8's own exact locked copy. "As difficulty
// increases, AI should acknowledge it... maximum one short sentence...
// never interrupt gameplay." A real, deterministic line keyed to the
// real level a mission just advanced to — never shown on Level 1
// (nothing has escalated yet).
const LEVEL_UP_COMMENTARY = [
  "Nice start. Let's make it slightly harder.",
  'More distractions are appearing.',
  'Stay focused.',
  'This is your peak challenge.',
] as const

// Anti-Frustration System™ — Sprint-1.8. Shown instead of a level-up
// line whenever the Adaptive Difficulty Engine™ chose to hold the
// current real level rather than advance (`AdaptiveDifficultyController`
// stabilized) — a real, calm acknowledgment, never framed as a failure.
const STABILIZE_COMMENTARY = "Let's keep this pace a little longer."

export function pickDifficultyCommentary(levelIndex: number, justStabilized = false): string | null {
  if (justStabilized) return STABILIZE_COMMENTARY
  if (levelIndex <= 0) return null
  return LEVEL_UP_COMMENTARY[Math.min(levelIndex - 1, LEVEL_UP_COMMENTARY.length - 1)]!
}

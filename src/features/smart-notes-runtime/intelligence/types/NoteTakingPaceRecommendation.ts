// Smart Notes™ Sprint-3 — Adaptive Intelligence™. A deterministic
// recommendation only — never an automatic change to LSE-2's own real
// scheduling/`ChunkStrategy` behavior, and never a judgment of note
// *content* quality. Mirrors Memory Mode™'s own
// `AdaptiveDifficultyRecommendation` (Sprint-3), renamed: "difficulty"
// doesn't fit a note-taking context, but the same real signals (revisit/
// repeat/completion rate) drive the same kind of pacing guidance.
export type NoteTakingPaceLevel = 'slow-down' | 'maintain-pace' | 'increase-pace'

export type NoteTakingPaceRecommendation = {
  level: NoteTakingPaceLevel
  reason: string
}

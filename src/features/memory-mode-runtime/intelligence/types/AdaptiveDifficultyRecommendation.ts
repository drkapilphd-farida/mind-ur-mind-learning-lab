// Memory Mode™ Sprint-3 — Adaptive Memory Intelligence™. A deterministic
// recommendation only — never an automatic change to LSE-2's own real
// scheduling/`ChunkStrategy` behavior. Surfacing this is a future
// presentation sprint's concern; this sprint computes the real signal
// only.
export type AdaptiveDifficultyLevel = 'slow-down' | 'maintain-pace' | 'increase-pace'

export type AdaptiveDifficultyRecommendation = {
  level: AdaptiveDifficultyLevel
  reason: string
}

// Immutable — every field `readonly`. The "Safety Configuration"
// dimension (§ brief) — deterministic metadata only, no real
// moderation logic ("Do NOT implement" real API calls/LLM execution).
export type SafetyConfiguration = {
  readonly moderationEnabled: boolean
  readonly blockedTerms: readonly string[]
}

// Runtime feature flags for the `ai` domain. `false` everywhere — no
// provider is wired (see src/ai/providers/), so nothing here should be
// reachable yet regardless of what a caller passes in.
export const AI_CONFIG = {
  mentorEnabled: false,
  cacheEnabled: false,
} as const

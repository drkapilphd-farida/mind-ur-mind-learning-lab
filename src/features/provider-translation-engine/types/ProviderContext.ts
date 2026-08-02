// Immutable — every field `readonly`. `facts` is a flat, deterministic
// passthrough of `MentorPromptContext`-derived values — for the
// Anthropic profile specifically, the `system-context` section's
// values are folded in here instead of becoming a message (see
// `../translation/translateForAnthropic.ts`).
export type ProviderContext = {
  readonly learnerId: string
  readonly profileId: string
  readonly facts: readonly string[]
}

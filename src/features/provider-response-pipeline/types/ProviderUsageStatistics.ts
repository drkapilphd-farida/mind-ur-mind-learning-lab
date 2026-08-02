// Immutable — every field `readonly`. "Usage statistics" (§3) —
// deterministically parsed from each provider's own raw usage fields,
// never computed/estimated. Shaped to match `@/features/ai-provider/types`'s
// own `TokenUsage` field-for-field (renamed to this feature's own
// vocabulary) — see `../integration/toTokenUsage.ts` for the checked
// compatibility seam. "No billing logic" — no cost fields here.
export type ProviderUsageStatistics = {
  readonly promptTokens: number
  readonly completionTokens: number
  readonly totalTokens: number
}

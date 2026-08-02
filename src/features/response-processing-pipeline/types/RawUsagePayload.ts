// Immutable — every field `readonly`. A deterministic, caller-supplied
// stand-in for "what a provider's raw usage block would look like" —
// never fetched, never measured ("Out of Scope: Token accounting").
export type RawUsagePayload = {
  readonly promptTokens: number
  readonly completionTokens: number
  readonly totalTokens: number
}

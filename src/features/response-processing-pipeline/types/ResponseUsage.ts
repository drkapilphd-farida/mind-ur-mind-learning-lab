// Immutable — every field `readonly`. `UsageExtractor`'s own output —
// defaults to all-zero when the raw usage payload is `null`
// (`ResponseValidator` is what flags a genuinely-missing usage, not
// this type).
export type ResponseUsage = {
  readonly promptTokens: number
  readonly completionTokens: number
  readonly totalTokens: number
}

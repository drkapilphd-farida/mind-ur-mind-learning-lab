// Either bound may be `null` (unbounded on that dimension). No token
// estimation, no model-specific limits — `maxPayloadSize` is measured
// in characters of `ContextEntry.summary`, a simple, deterministic,
// provider-agnostic proxy, not a token count.
export type ContextWindowLimits = {
  readonly maxEntries: number | null
  readonly maxPayloadSize: number | null
}

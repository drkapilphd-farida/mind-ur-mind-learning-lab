// Either bound may be `null` (unbounded on that dimension). "Maximum
// payload size (object count only, not token count)" — `maxPayloadSize`
// counts sections + references combined, a simple, deterministic,
// provider-agnostic proxy, never a token estimate.
export type ContextSizeLimits = {
  readonly maxMemoryCount: number | null
  readonly maxSections: number | null
  readonly maxPayloadSize: number | null
}

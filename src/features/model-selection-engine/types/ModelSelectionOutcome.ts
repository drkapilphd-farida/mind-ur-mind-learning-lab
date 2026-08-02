// Immutable — every field `readonly`. `ModelSelectionEngine.select()`'s
// own output — never throws; an unresolvable request (including an
// empty registry, or no models at all for the requested provider) is
// representable as `resolutionPath: 'none'`, `selectedModelId: null`
// data, not an exception.
export type ModelSelectionOutcome = {
  readonly selectedModelId: string | null
  readonly resolutionPath: 'preferred' | 'default' | 'fallback' | 'none'
  readonly reason: string
}

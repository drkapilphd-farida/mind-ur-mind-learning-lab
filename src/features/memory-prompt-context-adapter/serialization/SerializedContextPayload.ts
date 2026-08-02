// Mirrors `@/features/memory-persistence`'s own `SerializedMemory`
// shape ("Reuse existing serialization patterns where appropriate") —
// independently re-implemented here, not imported, since it's a
// different concrete payload type.
export type SerializedContextPayload = {
  readonly version: number
  readonly payload: Record<string, unknown>
}

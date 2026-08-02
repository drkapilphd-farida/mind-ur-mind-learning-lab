// Immutable — every field `readonly`. A self-contained mirror of
// `provider-execution-engine`'s own `ExecutionRequest` — reduced from
// the real type in `../integration/adaptExecutionRequest.ts`, the only
// place that type is ever touched. `providerId` stays a plain `string`
// here too (matching the mirrored type's own "reasons about *shape*,
// not content" discipline) — this is what `validateRequest()` and
// `transformExecutionRequest()` operate on.
export type ProviderAdapterExecutionRequest = {
  readonly id: string
  readonly providerId: string
  readonly messageCount: number
  readonly instructionCount: number
  readonly payloadSummary: readonly string[]
}

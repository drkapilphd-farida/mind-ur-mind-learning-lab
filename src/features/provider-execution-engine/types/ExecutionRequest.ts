// Immutable — every field `readonly`. A flat, self-contained
// reduction of a real `ProviderRequest` (Provider Translation Engine)
// — real reduction happens in `../integration/buildExecutionRequest.ts`.
// `payloadSummary` is a deterministic list of message roles, never
// message content — this engine reasons about *shape*, not content.
export type ExecutionRequest = {
  readonly id: string
  readonly providerId: string
  readonly messageCount: number
  readonly instructionCount: number
  readonly payloadSummary: readonly string[]
}

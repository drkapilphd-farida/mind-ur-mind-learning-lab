// Immutable — every field `readonly`. `buildExecutionResult()`'s own
// output — this feature's own, self-contained notion of a result
// (distinct from `provider-execution-engine`'s own richer
// `ExecutionResult`, which tracks session state/attempt count that
// this adapter layer never sees). `sessionId` is always caller-supplied,
// never generated here.
export type ProviderAdapterExecutionResult = {
  readonly sessionId: string
  readonly succeeded: boolean
  readonly outputText: string
  readonly finishReason: 'stop' | 'length' | 'error'
}

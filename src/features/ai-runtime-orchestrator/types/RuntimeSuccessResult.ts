// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — the successful-completion shape, populated only
// when `AIRuntimeResult.completionStatus === 'completed'`.
export type RuntimeSuccessResult = {
  readonly responseText: string
  readonly providerId: string
  readonly modelId: string
  readonly finishReason: string
}

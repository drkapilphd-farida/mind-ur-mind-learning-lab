// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — "Final session result," populated only when
// `SessionRunResult.completionStatus === 'completed'`.
export type SessionResult = {
  readonly responseText: string
  readonly providerId: string | null
  readonly modelId: string | null
}

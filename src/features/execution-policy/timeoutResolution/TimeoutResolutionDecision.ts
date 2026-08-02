// Immutable — every field `readonly`.
export type TimeoutResolutionDecision = {
  readonly expired: boolean
  readonly remainingMs: number
  readonly reason: string | null
}

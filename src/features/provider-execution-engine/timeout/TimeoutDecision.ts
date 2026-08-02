// Immutable — every field `readonly`. "Timeout Decision, Remaining
// Budget, Timeout Result" (§ Timeout Engine) — folded into this one
// type rather than 3 separate ones, since "Timeout Result" is the
// same decision object once produced, not a distinct concept.
export type TimeoutDecision = {
  readonly timedOut: boolean
  readonly remainingBudgetMs: number
  readonly reason: string | null
}

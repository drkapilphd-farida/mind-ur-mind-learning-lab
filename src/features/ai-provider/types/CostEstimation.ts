// Cents, not a float dollar amount — avoids floating-point rounding
// drift for a value that will eventually be summed across many
// requests (same reasoning `ai_events.cost_cents` already uses
// elsewhere in this codebase's schema).
export type CostEstimation = {
  inputCostCents: number
  outputCostCents: number
  totalCostCents: number
  currency: 'USD'
}

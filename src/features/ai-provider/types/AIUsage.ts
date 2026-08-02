import type { CostEstimation } from './CostEstimation'
import type { TokenUsage } from './TokenUsage'

// A full usage *record* — TokenUsage is just the raw counts; this
// pairs them with which provider/model produced them, their cost, and
// when, the shape a future usage-tracking/billing feature would
// persist one row per request.
export type AIUsage = {
  providerId: string
  modelId: string
  tokens: TokenUsage
  cost: CostEstimation
  occurredAt: string
}

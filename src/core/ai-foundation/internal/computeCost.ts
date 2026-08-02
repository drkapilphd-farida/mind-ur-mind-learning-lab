import type { CostEstimation, TokenUsage } from '../types'
import type { ModelPricingTable } from '../types/ModelPricing'

// AI Foundation Layer™ — AIF-1. Pure — real per-model pricing (see
// types/ModelPricing.ts) times real token counts. A `modelId` with no
// entry in `pricingTable` returns a real, honest $0 rather than a
// guessed number — the caller (aiFoundation.ts) logs this case so a
// missing price entry is visible, not silently absorbed. Fractional
// cents are kept as-is (not rounded to whole cents) so aggregating many
// small requests in CostTracker.totalCostCents() stays accurate.
export function computeCost(tokens: TokenUsage, modelId: string, pricingTable: ModelPricingTable): CostEstimation {
  const rate = pricingTable[modelId]
  if (!rate) {
    return { inputCostCents: 0, outputCostCents: 0, totalCostCents: 0, currency: 'USD' }
  }

  const inputCostCents = (tokens.inputTokens / 1000) * rate.inputCentsPer1kTokens
  const outputCostCents = (tokens.outputTokens / 1000) * rate.outputCentsPer1kTokens

  return { inputCostCents, outputCostCents, totalCostCents: inputCostCents + outputCostCents, currency: 'USD' }
}

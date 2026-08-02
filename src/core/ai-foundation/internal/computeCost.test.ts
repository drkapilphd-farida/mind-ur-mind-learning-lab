import { describe, expect, it } from 'vitest'
import type { ModelPricingTable } from '../types/ModelPricing'
import { computeCost } from './computeCost'

const PRICING: ModelPricingTable = {
  'claude-3-5-sonnet-20241022': { inputCentsPer1kTokens: 0.3, outputCentsPer1kTokens: 1.5 },
}

describe('computeCost', () => {
  it('computes real cost from real token counts and a known model\'s rate', () => {
    const cost = computeCost({ inputTokens: 1000, outputTokens: 1000, totalTokens: 2000 }, 'claude-3-5-sonnet-20241022', PRICING)
    expect(cost).toEqual({ inputCostCents: 0.3, outputCostCents: 1.5, totalCostCents: 1.8, currency: 'USD' })
  })

  it('scales linearly with token count', () => {
    const cost = computeCost({ inputTokens: 500, outputTokens: 0, totalTokens: 500 }, 'claude-3-5-sonnet-20241022', PRICING)
    expect(cost.inputCostCents).toBeCloseTo(0.15, 10)
  })

  it('returns an honest zero cost for a model with no pricing entry, rather than guessing', () => {
    const cost = computeCost({ inputTokens: 1000, outputTokens: 1000, totalTokens: 2000 }, 'unknown-model', PRICING)
    expect(cost).toEqual({ inputCostCents: 0, outputCostCents: 0, totalCostCents: 0, currency: 'USD' })
  })

  it('returns zero cost for zero tokens', () => {
    const cost = computeCost({ inputTokens: 0, outputTokens: 0, totalTokens: 0 }, 'claude-3-5-sonnet-20241022', PRICING)
    expect(cost).toEqual({ inputCostCents: 0, outputCostCents: 0, totalCostCents: 0, currency: 'USD' })
  })
})

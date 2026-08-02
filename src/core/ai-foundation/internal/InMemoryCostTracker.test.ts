import { describe, expect, it } from 'vitest'
import type { CostTrackingEntry } from '../types/CostTracker'
import { createInMemoryCostTracker } from './InMemoryCostTracker'

function makeEntry(overrides: Partial<CostTrackingEntry> = {}): CostTrackingEntry {
  return {
    requestId: 'req-1',
    task: 'summarization',
    providerId: 'claude',
    modelId: 'claude-3-5-sonnet-20241022',
    tokens: { inputTokens: 1000, outputTokens: 200, totalTokens: 1200 },
    estimatedCost: { inputCostCents: 30, outputCostCents: 30, totalCostCents: 60, currency: 'USD' },
    actualCost: { inputCostCents: 30, outputCostCents: 30, totalCostCents: 60, currency: 'USD' },
    processingTimeMs: 500,
    cacheHit: false,
    occurredAt: '2026-01-01T00:00:00.000Z',
    success: true,
    ...overrides,
  }
}

describe('InMemoryCostTracker', () => {
  it('starts empty', () => {
    const tracker = createInMemoryCostTracker()
    expect(tracker.list()).toEqual([])
    expect(tracker.totalCostCents()).toBe(0)
  })

  it('records and lists entries in order', () => {
    const tracker = createInMemoryCostTracker()
    const first = makeEntry({ requestId: 'req-1' })
    const second = makeEntry({ requestId: 'req-2' })
    tracker.record(first)
    tracker.record(second)
    expect(tracker.list()).toEqual([first, second])
  })

  it('sums actualCost.totalCostCents across every recorded entry', () => {
    const tracker = createInMemoryCostTracker()
    tracker.record(makeEntry({ actualCost: { inputCostCents: 10, outputCostCents: 10, totalCostCents: 20, currency: 'USD' } }))
    tracker.record(makeEntry({ actualCost: { inputCostCents: 5, outputCostCents: 5, totalCostCents: 10, currency: 'USD' } }))
    expect(tracker.totalCostCents()).toBe(30)
  })

  it('excludes cache hits\' zeroed actual cost from the total naturally', () => {
    const tracker = createInMemoryCostTracker()
    tracker.record(makeEntry({ cacheHit: true, actualCost: { inputCostCents: 0, outputCostCents: 0, totalCostCents: 0, currency: 'USD' } }))
    tracker.record(makeEntry({ cacheHit: false, actualCost: { inputCostCents: 10, outputCostCents: 10, totalCostCents: 20, currency: 'USD' } }))
    expect(tracker.totalCostCents()).toBe(20)
  })

  it('filters totalCostCents by providerId', () => {
    const tracker = createInMemoryCostTracker()
    tracker.record(makeEntry({ providerId: 'claude', actualCost: { inputCostCents: 10, outputCostCents: 10, totalCostCents: 20, currency: 'USD' } }))
    tracker.record(makeEntry({ providerId: 'mock', actualCost: { inputCostCents: 1, outputCostCents: 1, totalCostCents: 2, currency: 'USD' } }))
    expect(tracker.totalCostCents({ providerId: 'claude' })).toBe(20)
    expect(tracker.totalCostCents({ providerId: 'mock' })).toBe(2)
  })

  it('returns a defensive copy from list()', () => {
    const tracker = createInMemoryCostTracker()
    tracker.record(makeEntry())
    const firstList = tracker.list()
    tracker.record(makeEntry({ requestId: 'req-2' }))
    expect(firstList).toHaveLength(1)
  })
})

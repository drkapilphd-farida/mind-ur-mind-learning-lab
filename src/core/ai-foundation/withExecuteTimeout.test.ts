import { describe, expect, it } from 'vitest'
import type { AIFoundationResult } from './types/AIFoundationResult'
import { withExecuteTimeout } from './withExecuteTimeout'

function makeSuccessResult(): AIFoundationResult {
  return {
    success: true,
    task: 'relationship-detection',
    requestId: 'req-1',
    response: { id: 'resp-1', providerId: 'claude', modelId: 'claude-3-5-sonnet-20241022', content: '{}', usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 }, finishReason: 'stop' },
    usage: { providerId: 'claude', modelId: 'claude-3-5-sonnet-20241022', tokens: { inputTokens: 10, outputTokens: 5, totalTokens: 15 }, cost: { inputCostCents: 0, outputCostCents: 0, totalCostCents: 0, currency: 'USD' }, occurredAt: '2026-01-01T00:00:00.000Z' },
    cacheHit: false,
    processingTimeMs: 5,
  }
}

describe('withExecuteTimeout', () => {
  it('resolves with the real result when it settles before the timeout', async () => {
    const result = await withExecuteTimeout(Promise.resolve(makeSuccessResult()), 'relationship-detection', 1000, 'req-1')
    expect(result).toEqual(makeSuccessResult())
  })

  it('resolves with a synthetic, retryable timeout failure — never hangs, never rejects — when the call never settles', async () => {
    const hungPromise = new Promise<AIFoundationResult>(() => {})
    const result = await withExecuteTimeout(hungPromise, 'relationship-detection', 20, 'req-2')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.task).toBe('relationship-detection')
      expect(result.requestId).toBe('req-2')
      expect(result.error.code).toBe('timeout')
      expect(result.error.retryable).toBe(true)
      expect(result.error.message).toContain('20ms')
    }
  })

  it('labels the synthetic timeout failure with whichever real AITask was passed in', async () => {
    const hungPromise = new Promise<AIFoundationResult>(() => {})
    const result = await withExecuteTimeout(hungPromise, 'difficulty-analysis', 15, 'req-3')

    expect(result.success).toBe(false)
    if (!result.success) expect(result.task).toBe('difficulty-analysis')
  })
})

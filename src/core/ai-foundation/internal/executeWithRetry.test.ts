import { describe, expect, it, vi } from 'vitest'
import { ProviderAdapterError } from '@/features/ai-provider/adapter'
import type { AIError, AIResponse, RetryPolicy } from '../types'
import { executeWithRetry } from './executeWithRetry'

const RESPONSE: AIResponse = { id: 'resp-1', providerId: 'claude', modelId: 'claude-3-5-sonnet-20241022', content: 'Hello.', usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 }, finishReason: 'stop' }

function retryableError(): AIError {
  return { code: 'rate-limited', message: 'Rate limited.', providerId: 'claude', retryable: true }
}

function nonRetryableError(): AIError {
  return { code: 'invalid-request', message: 'Bad request.', providerId: 'claude', retryable: false }
}

const FIXED_POLICY: RetryPolicy = { maxAttempts: 3, backoffStrategy: 'fixed', baseDelayMs: 100 }
const EXPONENTIAL_POLICY: RetryPolicy = { maxAttempts: 4, backoffStrategy: 'exponential', baseDelayMs: 100 }

describe('executeWithRetry', () => {
  it('returns success on the first attempt without any delay', async () => {
    const execute = vi.fn().mockResolvedValue(RESPONSE)
    const delay = vi.fn().mockResolvedValue(undefined)

    const result = await executeWithRetry(execute, FIXED_POLICY, { delay })

    expect(result).toEqual({ success: true, response: RESPONSE, attempts: 1 })
    expect(delay).not.toHaveBeenCalled()
  })

  it('retries a retryable failure and succeeds on a later attempt', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new ProviderAdapterError(retryableError()))
      .mockRejectedValueOnce(new ProviderAdapterError(retryableError()))
      .mockResolvedValueOnce(RESPONSE)
    const delay = vi.fn().mockResolvedValue(undefined)

    const result = await executeWithRetry(execute, FIXED_POLICY, { delay })

    expect(result).toEqual({ success: true, response: RESPONSE, attempts: 3 })
    expect(delay).toHaveBeenCalledTimes(2)
  })

  it('stops immediately on a non-retryable error, without exhausting maxAttempts', async () => {
    const execute = vi.fn().mockRejectedValue(new ProviderAdapterError(nonRetryableError()))
    const delay = vi.fn().mockResolvedValue(undefined)

    const result = await executeWithRetry(execute, FIXED_POLICY, { delay })

    expect(result).toEqual({ success: false, error: nonRetryableError(), attempts: 1 })
    expect(execute).toHaveBeenCalledTimes(1)
    expect(delay).not.toHaveBeenCalled()
  })

  it('gives up after exhausting maxAttempts on a retryable error', async () => {
    const execute = vi.fn().mockRejectedValue(new ProviderAdapterError(retryableError()))
    const delay = vi.fn().mockResolvedValue(undefined)

    const result = await executeWithRetry(execute, FIXED_POLICY, { delay })

    expect(result).toEqual({ success: false, error: retryableError(), attempts: 3 })
    expect(execute).toHaveBeenCalledTimes(3)
    expect(delay).toHaveBeenCalledTimes(2)
  })

  it('uses a constant delay for the fixed backoff strategy', async () => {
    const execute = vi.fn().mockRejectedValue(new ProviderAdapterError(retryableError()))
    const delay = vi.fn().mockResolvedValue(undefined)

    await executeWithRetry(execute, FIXED_POLICY, { delay })

    expect(delay).toHaveBeenNthCalledWith(1, 100)
    expect(delay).toHaveBeenNthCalledWith(2, 100)
  })

  it('doubles the delay each attempt for the exponential backoff strategy', async () => {
    const execute = vi.fn().mockRejectedValue(new ProviderAdapterError(retryableError()))
    const delay = vi.fn().mockResolvedValue(undefined)

    await executeWithRetry(execute, EXPONENTIAL_POLICY, { delay })

    expect(delay).toHaveBeenNthCalledWith(1, 100)
    expect(delay).toHaveBeenNthCalledWith(2, 200)
    expect(delay).toHaveBeenNthCalledWith(3, 400)
  })

  it('maps a non-ProviderAdapterError throw to a conservative, non-retryable AIError', async () => {
    const execute = vi.fn().mockRejectedValue(new Error('Something unexpected.'))
    const delay = vi.fn().mockResolvedValue(undefined)

    const result = await executeWithRetry(execute, FIXED_POLICY, { delay })

    expect(result).toEqual({ success: false, error: { code: 'unknown', message: 'Something unexpected.', providerId: 'unknown', retryable: false }, attempts: 1 })
    expect(delay).not.toHaveBeenCalled()
  })
})

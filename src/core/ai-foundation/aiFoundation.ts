import { estimateTokens } from '@/features/ai-provider/adapters'
import { logger } from '@/lib/logger'
import type { AIError, AIRequest, AIUsage, CostEstimation, TokenUsage } from './types'
import type { AITask } from './types/AITask'
import type { AIFoundationPayload } from './types/AIFoundationRequest'
import type { AIFoundationResult } from './types/AIFoundationResult'
import type { AIProviderFactory } from './types/AIProviderFactory'
import type { AIResultCache, AIResultCacheEntry } from './types/AIResultCache'
import type { CostTracker, CostTrackingEntry } from './types/CostTracker'
import type { RateLimiter } from './types/RateLimiter'
import type { AIFoundationConfiguration } from './types/AIFoundationConfiguration'
import { loadAIFoundationConfiguration } from './types/AIFoundationConfiguration'
import { DEFAULT_MODEL_PRICING, type ModelPricingTable } from './types/ModelPricing'
import { computeCacheKey } from './internal/computeCacheKey'
import { computeCost } from './internal/computeCost'
import { executeWithRetry } from './internal/executeWithRetry'
import { createInMemoryAIResultCache } from './internal/InMemoryAIResultCache'
import { createInMemoryCostTracker } from './internal/InMemoryCostTracker'
import { createInMemoryRateLimiter } from './internal/InMemoryRateLimiter'
import { createRuntimeAIProviderFactory } from './internal/RuntimeAIProviderFactory'

const ZERO_TOKENS: TokenUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
const ZERO_COST: CostEstimation = { inputCostCents: 0, outputCostCents: 0, totalCostCents: 0, currency: 'USD' }

export type AIFoundationDependencies = {
  providerFactory: AIProviderFactory
  cache: AIResultCache
  costTracker: CostTracker
  rateLimiter: RateLimiter
  configuration: AIFoundationConfiguration
  pricingTable: ModelPricingTable
  idFactory: () => string
  now: () => Date
}

export interface AIFoundation {
  execute(task: AITask, payload: AIFoundationPayload, requestId?: string): Promise<AIFoundationResult>
}

function createDefaultDependencies(): AIFoundationDependencies {
  const configuration = loadAIFoundationConfiguration()
  return {
    providerFactory: createRuntimeAIProviderFactory(),
    cache: createInMemoryAIResultCache({ defaultTtlSeconds: configuration.cacheTtlSeconds }),
    costTracker: createInMemoryCostTracker(),
    rateLimiter: createInMemoryRateLimiter(configuration.rateLimitPolicy),
    configuration,
    pricingTable: DEFAULT_MODEL_PRICING,
    idFactory: () => crypto.randomUUID(),
    now: () => new Date(),
  }
}

// AI Foundation Layer™ — AIF-1. The single gateway: "every future AI
// engine must simply call AIFoundation.execute(task, payload) and never
// know which AI provider is executing the request." Never imports
// Claude/Anthropic/OpenAI by name — only the AIProviderFactory contract,
// whose default implementation (RuntimeAIProviderFactory) is the one
// place that knows about the existing real-ai-providers switcher.
class DefaultAIFoundation implements AIFoundation {
  constructor(private readonly deps: AIFoundationDependencies) {}

  async execute(task: AITask, payload: AIFoundationPayload, requestId?: string): Promise<AIFoundationResult> {
    const id = requestId ?? this.deps.idFactory()
    const startedAt = this.deps.now().getTime()
    const cacheEnabled = payload.cache?.enabled ?? true
    const cacheKey = computeCacheKey(task, payload)

    if (cacheEnabled) {
      const cached = await this.safeCacheGet(cacheKey, id, task)
      if (cached) return this.handleCacheHit(task, id, startedAt, cached)
    }

    const estimatedTokens = payload.messages.reduce((sum, message) => sum + estimateTokens(message.content), 0) + (payload.maxOutputTokens ?? 0)
    const rateLimitDecision = this.deps.rateLimiter.tryAcquire(estimatedTokens)
    if (!rateLimitDecision.allowed) {
      return this.handleFailure(task, id, startedAt, {
        code: 'rate-limited',
        message: rateLimitDecision.reason,
        providerId: 'ai-foundation',
        retryable: true,
      })
    }

    const provider = await this.resolveProviderOrNull(task, id, startedAt)
    if (!provider.ok) return provider.result

    const modelId = payload.modelId ?? provider.value.models[0]?.id
    if (!modelId) {
      return this.handleFailure(task, id, startedAt, {
        code: 'invalid-request',
        message: `Provider "${provider.value.metadata.id}" has no registered models to select a default from.`,
        providerId: provider.value.metadata.id,
        retryable: false,
      })
    }

    const request: AIRequest = {
      id,
      modelId,
      messages: payload.messages,
      ...(payload.temperature !== undefined ? { temperature: payload.temperature } : {}),
      ...(payload.maxOutputTokens !== undefined ? { maxOutputTokens: payload.maxOutputTokens } : {}),
    }

    const retryResult = await executeWithRetry(() => provider.value.generate(request), this.deps.configuration.retryPolicy)
    const processingTimeMs = this.deps.now().getTime() - startedAt

    if (!retryResult.success) {
      this.recordCost({
        requestId: id,
        task,
        providerId: provider.value.metadata.id,
        modelId,
        tokens: ZERO_TOKENS,
        estimatedCost: ZERO_COST,
        actualCost: ZERO_COST,
        processingTimeMs,
        cacheHit: false,
        occurredAt: this.deps.now().toISOString(),
        success: false,
      })
      logger.error('ai-foundation.request-failed', { requestId: id, task, providerId: provider.value.metadata.id, modelId, code: retryResult.error.code, attempts: retryResult.attempts })
      return { success: false, task, requestId: id, error: retryResult.error, processingTimeMs }
    }

    const response = retryResult.response
    const actualCost = computeCost(response.usage, modelId, this.deps.pricingTable)
    const usage: AIUsage = { providerId: provider.value.metadata.id, modelId, tokens: response.usage, cost: actualCost, occurredAt: this.deps.now().toISOString() }

    this.recordCost({
      requestId: id,
      task,
      providerId: provider.value.metadata.id,
      modelId,
      tokens: response.usage,
      estimatedCost: actualCost,
      actualCost,
      processingTimeMs,
      cacheHit: false,
      occurredAt: usage.occurredAt,
      success: true,
    })

    if (cacheEnabled) {
      await this.safeCacheSet(cacheKey, { response, usage, cachedAt: usage.occurredAt }, payload.cache?.ttlSeconds, id, task)
    }

    logger.info('ai-foundation.request-succeeded', { requestId: id, task, providerId: provider.value.metadata.id, modelId, attempts: retryResult.attempts })

    return { success: true, task, requestId: id, response, usage, cacheHit: false, processingTimeMs }
  }

  private handleCacheHit(task: AITask, requestId: string, startedAt: number, cached: AIResultCacheEntry): AIFoundationResult {
    const processingTimeMs = this.deps.now().getTime() - startedAt

    // A cache hit spends zero — "tokens"/"cost" here describe THIS call,
    // not the original call that produced the cached entry (that call
    // already recorded its own real, non-zero CostTrackingEntry).
    this.recordCost({
      requestId,
      task,
      providerId: cached.response.providerId,
      modelId: cached.response.modelId,
      tokens: ZERO_TOKENS,
      estimatedCost: ZERO_COST,
      actualCost: ZERO_COST,
      processingTimeMs,
      cacheHit: true,
      occurredAt: this.deps.now().toISOString(),
      success: true,
    })

    logger.info('ai-foundation.cache-hit', { requestId, task, providerId: cached.response.providerId, modelId: cached.response.modelId })

    return { success: true, task, requestId, response: cached.response, usage: cached.usage, cacheHit: true, processingTimeMs }
  }

  private handleFailure(task: AITask, requestId: string, startedAt: number, error: AIError): AIFoundationResult {
    const processingTimeMs = this.deps.now().getTime() - startedAt
    logger.warn('ai-foundation.request-blocked', { requestId, task, code: error.code, message: error.message })
    return { success: false, task, requestId, error, processingTimeMs }
  }

  private async resolveProviderOrNull(task: AITask, requestId: string, startedAt: number): Promise<{ ok: true; value: Awaited<ReturnType<AIProviderFactory['resolveProvider']>> } | { ok: false; result: AIFoundationResult }> {
    try {
      const value = await this.deps.providerFactory.resolveProvider()
      return { ok: true, value }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resolve an AI provider.'
      return {
        ok: false,
        result: this.handleFailure(task, requestId, startedAt, { code: 'provider-unavailable', message, providerId: 'ai-foundation', retryable: true }),
      }
    }
  }

  // Cost tracking is observability, not a correctness dependency — a
  // failure here (e.g. a future persistent tracker's write fails) never
  // fails the overall AIFoundationResult. Logged as a warning instead —
  // the brief's "partial failures" requirement.
  private recordCost(entry: CostTrackingEntry): void {
    try {
      this.deps.costTracker.record(entry)
    } catch (error) {
      logger.warn('ai-foundation.cost-tracking-failed', { requestId: entry.requestId, task: entry.task, message: error instanceof Error ? error.message : 'Unknown error.' })
    }
  }

  private async safeCacheGet(key: string, requestId: string, task: AITask): Promise<AIResultCacheEntry | undefined> {
    try {
      return await this.deps.cache.get(key)
    } catch (error) {
      logger.warn('ai-foundation.cache-read-failed', { requestId, task, message: error instanceof Error ? error.message : 'Unknown error.' })
      return undefined
    }
  }

  private async safeCacheSet(key: string, entry: AIResultCacheEntry, ttlSeconds: number | undefined, requestId: string, task: AITask): Promise<void> {
    try {
      await this.deps.cache.set(key, entry, ttlSeconds ?? this.deps.configuration.cacheTtlSeconds)
    } catch (error) {
      logger.warn('ai-foundation.cache-write-failed', { requestId, task, message: error instanceof Error ? error.message : 'Unknown error.' })
    }
  }
}

export function createAIFoundation(overrides: Partial<AIFoundationDependencies> = {}): AIFoundation {
  return new DefaultAIFoundation({ ...createDefaultDependencies(), ...overrides })
}

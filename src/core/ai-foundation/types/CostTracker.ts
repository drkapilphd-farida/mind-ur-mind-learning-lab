import type { CostEstimation, TokenUsage } from '@/features/ai-provider/types'
import type { AITask } from './AITask'

// AI Foundation Layer™ — AIF-1. Every field the brief's "Cost Control"
// section lists: provider, model, tokens (+ input/output split via
// TokenUsage), estimated cost, actual cost, processing time, cache hit/
// miss (one boolean covers both — true is a hit, false is a miss),
// request id. Recorded once per `AIFoundation.execute()` call,
// including cache hits (with `actualCost` zeroed — no provider call was
// made) so a cost report reflects the real request volume, not just
// billed spend.
export type CostTrackingEntry = {
  requestId: string
  task: AITask
  providerId: string
  modelId: string
  tokens: TokenUsage
  estimatedCost: CostEstimation
  actualCost: CostEstimation
  processingTimeMs: number
  cacheHit: boolean
  occurredAt: string
  // Production AI Cost Optimization — Task 5 (additive). The real
  // success/failure of the underlying request, known at every real call
  // site in aiFoundation.ts at the moment it calls recordCost(). Exists so
  // a persistent CostTracker can log a genuine failure honestly, rather
  // than inferring it from zeroed tokens/cost (which a real, legitimate
  // zero-cost outcome could otherwise be mistaken for).
  success: boolean
}

// The default implementation (internal/InMemoryCostTracker.ts) is a
// real, in-process, append-only log — a scoped limitation this sprint
// (see the architecture doc), the same "in-memory today, persistent
// store later" disclosure as AIResultCache.
export interface CostTracker {
  record(entry: CostTrackingEntry): void
  list(): readonly CostTrackingEntry[]
  totalCostCents(filter?: { providerId?: string }): number
}

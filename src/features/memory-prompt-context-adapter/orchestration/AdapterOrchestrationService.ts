import type { ContextPackage, ContextSizeLimits } from '@/features/memory-context-assembly'
import type { AdapterOrchestrationResult } from './AdapterOrchestrationResult'

// "Execute transformation, Validate payload, Produce diagnostics,
// Return immutable payload. Repositories remain free of business
// logic." This sprint needs no repository at all — it transforms an
// already-assembled `ContextPackage`, never queries anything new —
// so that note holds trivially: there is no repository here to leak
// business logic into.
export interface AdapterOrchestrationService {
  execute(contextPackage: ContextPackage, payloadLimits: ContextSizeLimits | null): AdapterOrchestrationResult
}

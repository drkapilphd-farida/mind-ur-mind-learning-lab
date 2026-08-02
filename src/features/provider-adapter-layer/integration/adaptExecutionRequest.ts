import type { ExecutionRequest } from '@/features/provider-execution-engine'
import type { ProviderAdapterExecutionRequest } from '../types'

// Pure — the one function that turns a real `ExecutionRequest` (from
// the approved Provider Execution Engine) into this feature's own
// fully self-contained `ProviderAdapterExecutionRequest`. This is the
// *only* place `ExecutionRequest`'s own shape is inspected — nothing
// in `../capabilities/`, `../validation/`, `../diagnostics/`, or
// `../orchestration/` knows this type exists. Same "bridges the
// internal Provider Execution Engine" seam as this sprint's own brief
// language, kept as narrow as Sprint 35's own `buildExecutionRequest.ts`.
export function adaptExecutionRequest(request: ExecutionRequest): ProviderAdapterExecutionRequest {
  return {
    id: request.id,
    providerId: request.providerId,
    messageCount: request.messageCount,
    instructionCount: request.instructionCount,
    payloadSummary: request.payloadSummary,
  }
}

import type { ProviderRequest } from '@/features/provider-translation-engine'
import type { ExecutionRequest } from '../types'

// Pure — the one function that turns a real `ProviderRequest` (from
// the approved Provider Translation Engine) into the fully
// self-contained `ExecutionRequest` this engine consumes. This is the
// *only* place `ProviderRequest`'s own shape is inspected — nothing in
// `../lifecycle/`, `../retry/`, `../timeout/`, `../cancellation/`,
// `../validation/`, or `../diagnostics/` knows this type exists.
// `payloadSummary` is a deterministic list of message roles, never
// message content.
export function buildExecutionRequest(providerRequest: ProviderRequest): ExecutionRequest {
  return {
    id: providerRequest.id,
    providerId: providerRequest.providerId,
    messageCount: providerRequest.messages.length,
    instructionCount: providerRequest.instructions.length,
    payloadSummary: providerRequest.messages.map((message) => message.role),
  }
}

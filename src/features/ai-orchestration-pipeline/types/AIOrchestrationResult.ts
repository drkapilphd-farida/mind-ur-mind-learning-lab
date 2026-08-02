import type { AIOrchestrationContext } from './AIOrchestrationContext'
import type { AIOrchestrationMetadata } from './AIOrchestrationMetadata'

// Immutable — every field `readonly`. This engine's whole output — one
// end-to-end orchestration run. `responseText`/`providerId` are flat
// extractions from the final `ProviderExecutionResponse` (`null` when
// the pipeline never reached `response-normalized`) — the real object
// itself is never embedded, same self-containment discipline as
// `context`.
export type AIOrchestrationResult = {
  readonly id: string
  readonly version: number
  readonly context: AIOrchestrationContext
  readonly completionStatus: 'completed' | 'failed'
  readonly responseText: string | null
  readonly providerId: string | null
  readonly metadata: AIOrchestrationMetadata
}

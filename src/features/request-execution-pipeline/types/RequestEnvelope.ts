import type { PromptPayload } from './PromptPayload'
import type { RequestConfiguration } from './RequestConfiguration'
import type { RequestContext } from './RequestContext'
import type { RequestMetadata } from './RequestMetadata'
import type { SafetyConfiguration } from './SafetyConfiguration'

// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — the fully-assembled request, ready for
// validation/normalization. `ExecutionRequestBuilder`'s own output.
export type RequestEnvelope = {
  readonly id: string
  readonly context: RequestContext
  readonly payload: PromptPayload
  readonly metadata: RequestMetadata
  readonly configuration: RequestConfiguration
  readonly safetyConfiguration: SafetyConfiguration
}

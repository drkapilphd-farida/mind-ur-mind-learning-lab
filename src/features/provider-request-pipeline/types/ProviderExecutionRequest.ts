import type { ProviderExecutionContext } from './ProviderExecutionContext'
import type { ProviderExecutionInstruction } from './ProviderExecutionInstruction'
import type { ProviderExecutionMessage } from './ProviderExecutionMessage'
import type { ProviderExecutionMetadata } from './ProviderExecutionMetadata'
import type { ProviderExecutionOptions } from './ProviderExecutionOptions'
import type { ProviderExecutionProfileId } from './ProviderExecutionProfileId'

// Immutable — every field `readonly`. This engine's whole output — one
// execution-ready request per pipeline run, still never executed.
// "No provider execution" — this stops strictly at producing the
// object; nothing here calls a provider, an HTTP client, or an SDK.
export type ProviderExecutionRequest = {
  readonly id: string
  readonly version: number
  readonly providerId: ProviderExecutionProfileId
  readonly modelId: string
  readonly context: ProviderExecutionContext
  readonly options: ProviderExecutionOptions
  readonly messages: readonly ProviderExecutionMessage[]
  readonly instructions: readonly ProviderExecutionInstruction[]
  readonly metadata: ProviderExecutionMetadata
}

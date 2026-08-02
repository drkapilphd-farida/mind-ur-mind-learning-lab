import type { ProviderExecutionInstruction, ProviderExecutionMessage, ProviderExecutionProfileId } from '../types'

// The already-reduced, fully self-contained inputs the pipeline
// consumes — real reduction from `ProviderRequest` happens in
// `../integration/buildPipelineInputs.ts`.
export type PipelineInputs = {
  readonly learnerId: string
  readonly profileId: string
  readonly providerId: ProviderExecutionProfileId
  readonly sourceVersion: number
  readonly facts: readonly string[]
  readonly messages: readonly ProviderExecutionMessage[]
  readonly instructions: readonly ProviderExecutionInstruction[]
}

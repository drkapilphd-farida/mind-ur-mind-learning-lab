import type { ProviderExecutionInstruction, ProviderExecutionOptions, ProviderExecutionProfileId } from '../types'
import { PROVIDER_CONFIGURATION_CATALOG } from './PROVIDER_CONFIGURATION_CATALOG'

export type ResolvedProviderConfiguration = {
  readonly modelId: string
  readonly options: ProviderExecutionOptions
  readonly safetyInstruction: ProviderExecutionInstruction
}

// Every profile gets the same safety instruction — deterministic,
// uniform, no per-provider branching needed for "Safety configuration."
const SAFETY_INSTRUCTION: ProviderExecutionInstruction = { id: 'safety-baseline', directive: 'enforce-standard-safety-level' }

// Pure — "Prepare deterministic resolution for: Provider profile,
// Model identifier, Runtime options, Safety configuration. Configuration
// only." Looks up the fixed catalog entry for the given profile.
export function resolveProviderConfiguration(providerId: ProviderExecutionProfileId): ResolvedProviderConfiguration {
  const entry = PROVIDER_CONFIGURATION_CATALOG[providerId]

  return {
    modelId: entry.modelId,
    options: { temperature: entry.temperature, maxOutputTokens: entry.maxOutputTokens },
    safetyInstruction: SAFETY_INSTRUCTION,
  }
}

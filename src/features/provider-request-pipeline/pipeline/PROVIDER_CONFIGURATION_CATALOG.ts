import type { ProviderExecutionProfileId } from '../types'

export type ProviderConfigurationEntry = {
  readonly modelId: string
  readonly temperature: number
  readonly maxOutputTokens: number
}

// Fixed, in-code, deterministic configuration per provider profile —
// "Configuration only," never a live registry lookup (see this
// feature's own `index.ts` header for why `ai-provider`'s
// `ProviderResolver`/`ProviderFactory` are deliberately not used here).
export const PROVIDER_CONFIGURATION_CATALOG: Record<ProviderExecutionProfileId, ProviderConfigurationEntry> = {
  openai: { modelId: 'gpt-4o-mini', temperature: 0.7, maxOutputTokens: 1024 },
  anthropic: { modelId: 'claude-3-5-sonnet', temperature: 0.7, maxOutputTokens: 1024 },
  gemini: { modelId: 'gemini-1.5-flash', temperature: 0.7, maxOutputTokens: 1024 },
}

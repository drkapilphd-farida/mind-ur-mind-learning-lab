import type { ProviderCatalogEntry, SelectionProviderId } from '../types'

// Fixed, in-code, deterministic seed data — "ProviderCatalog" (§ brief),
// distinct from `../registry/`'s mutable runtime store. Same
// "configuration only" discipline as
// `provider-request-pipeline/pipeline/PROVIDER_CONFIGURATION_CATALOG.ts`
// and `provider-adapter-layer/definitions/PROVIDER_ADAPTER_DEFINITIONS.ts`.
// Deliberately *not* uniform — `gemini` is `'degraded'`, `deepseek` is
// `'unavailable'`, `local-llm` is disabled — real, differentiating
// facts so priority/availability/capability/configuration-based
// selection all have something genuine to select between.
export const PROVIDER_SELECTION_CATALOG: Record<SelectionProviderId, ProviderCatalogEntry> = {
  openai: {
    providerId: 'openai',
    priority: 1,
    availability: 'available',
    supportedCapabilities: ['chat-completion', 'vision', 'function-calling', 'json-output', 'streaming-support', 'multimodal'],
    supportedModels: ['gpt-4o', 'gpt-4o-mini'],
    configuration: { enabled: true, maxRequestsPerMinute: 60 },
  },
  anthropic: {
    providerId: 'anthropic',
    priority: 2,
    availability: 'available',
    supportedCapabilities: ['chat-completion', 'vision', 'function-calling', 'json-output', 'streaming-support', 'reasoning-support', 'multimodal'],
    supportedModels: ['claude-3-5-sonnet', 'claude-3-opus'],
    configuration: { enabled: true, maxRequestsPerMinute: 60 },
  },
  gemini: {
    providerId: 'gemini',
    priority: 3,
    availability: 'degraded',
    supportedCapabilities: ['chat-completion', 'vision', 'function-calling', 'json-output', 'streaming-support', 'multimodal'],
    supportedModels: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    configuration: { enabled: true, maxRequestsPerMinute: 60 },
  },
  grok: {
    providerId: 'grok',
    priority: 4,
    availability: 'available',
    supportedCapabilities: ['chat-completion', 'function-calling', 'json-output'],
    supportedModels: ['grok-2'],
    configuration: { enabled: true, maxRequestsPerMinute: 60 },
  },
  deepseek: {
    providerId: 'deepseek',
    priority: 5,
    availability: 'unavailable',
    supportedCapabilities: ['chat-completion', 'reasoning-support', 'json-output'],
    supportedModels: ['deepseek-chat', 'deepseek-reasoner'],
    configuration: { enabled: true, maxRequestsPerMinute: 60 },
  },
  'local-llm': {
    providerId: 'local-llm',
    priority: 6,
    availability: 'available',
    supportedCapabilities: ['chat-completion'],
    supportedModels: ['llama-3-70b'],
    configuration: { enabled: false, maxRequestsPerMinute: 10 },
  },
}

export const ALL_CATALOG_ENTRIES: readonly ProviderCatalogEntry[] = Object.values(PROVIDER_SELECTION_CATALOG)

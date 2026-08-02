import type { ModelCatalogEntry } from '../types'

// Fixed, in-code, deterministic seed data — "ModelCatalog" (§ brief),
// distinct from `../registry/`'s mutable runtime store. Same
// "configuration only" discipline as
// `provider-selection-engine/catalog/PROVIDER_SELECTION_CATALOG.ts`.
// Deliberately not uniform — `claude-3-opus` is `'degraded'`,
// `gemini-1.5-flash` is disabled — real, differentiating facts so
// priority/availability/capability/context-size/configuration-based
// selection all have something genuine to select between, across 3
// providers so provider-scoping is also meaningfully testable.
export const ALL_MODEL_CATALOG_ENTRIES: readonly ModelCatalogEntry[] = [
  {
    metadata: {
      id: 'gpt-4o',
      providerId: 'openai',
      displayName: 'GPT-4o',
      contextSize: 128000,
      maxOutputTokens: 16384,
      supportedCapabilities: ['chat-completion', 'vision', 'function-calling', 'json-output', 'streaming-support', 'multimodal'],
    },
    priority: 1,
    availability: 'available',
    configuration: { enabled: true, maxRequestsPerMinute: 60 },
  },
  {
    metadata: {
      id: 'gpt-4o-mini',
      providerId: 'openai',
      displayName: 'GPT-4o mini',
      contextSize: 128000,
      maxOutputTokens: 16384,
      supportedCapabilities: ['chat-completion', 'json-output'],
    },
    priority: 2,
    availability: 'available',
    configuration: { enabled: true, maxRequestsPerMinute: 60 },
  },
  {
    metadata: {
      id: 'claude-3-5-sonnet',
      providerId: 'anthropic',
      displayName: 'Claude 3.5 Sonnet',
      contextSize: 200000,
      maxOutputTokens: 8192,
      supportedCapabilities: ['chat-completion', 'vision', 'reasoning-support', 'multimodal'],
    },
    priority: 1,
    availability: 'available',
    configuration: { enabled: true, maxRequestsPerMinute: 60 },
  },
  {
    metadata: {
      id: 'claude-3-opus',
      providerId: 'anthropic',
      displayName: 'Claude 3 Opus',
      contextSize: 200000,
      maxOutputTokens: 4096,
      supportedCapabilities: ['chat-completion', 'reasoning-support'],
    },
    priority: 2,
    availability: 'degraded',
    configuration: { enabled: true, maxRequestsPerMinute: 60 },
  },
  {
    metadata: {
      id: 'gemini-1.5-flash',
      providerId: 'gemini',
      displayName: 'Gemini 1.5 Flash',
      contextSize: 1000000,
      maxOutputTokens: 8192,
      supportedCapabilities: ['chat-completion'],
    },
    priority: 1,
    availability: 'available',
    configuration: { enabled: false, maxRequestsPerMinute: 10 },
  },
]

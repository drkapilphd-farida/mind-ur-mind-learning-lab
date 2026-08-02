import type { AdapterProviderId, ProviderAdapterMetadata } from '../types'

// Fixed, in-code, deterministic metadata per provider — "Create
// deterministic adapter definitions for" (§ Supported Provider Types).
// Same "configuration only, never a live registry lookup" discipline
// as `provider-request-pipeline/pipeline/PROVIDER_CONFIGURATION_CATALOG.ts`
// — deliberately not sourced from `ai-provider`'s own live 8-provider
// catalog (`providers/*.ts`), which is real, mutable, SDK-adjacent
// infrastructure this sprint doesn't couple to. Capability sets are a
// real, deterministic differentiating fact per provider (not copy-
// pasted identically) — e.g. `local-llm` only supports chat, matching
// the "genuine per-provider fact" precedent Sprint 31 set for
// Anthropic/Gemini message-role handling.
export const PROVIDER_ADAPTER_DEFINITIONS: Record<AdapterProviderId, ProviderAdapterMetadata> = {
  openai: {
    providerId: 'openai',
    providerName: 'OpenAI',
    providerVersion: '1.0.0',
    supportedModels: ['gpt-4o', 'gpt-4o-mini'],
    maximumContext: 128000,
    maximumOutput: 16384,
    supportedFeatures: ['chat-completion', 'vision', 'function-calling', 'json-output', 'streaming-support', 'multimodal'],
    defaultConfiguration: { temperature: 0.7, maxOutputTokens: 1024 },
  },
  anthropic: {
    providerId: 'anthropic',
    providerName: 'Anthropic',
    providerVersion: '1.0.0',
    supportedModels: ['claude-3-5-sonnet', 'claude-3-opus'],
    maximumContext: 200000,
    maximumOutput: 8192,
    supportedFeatures: ['chat-completion', 'vision', 'function-calling', 'json-output', 'streaming-support', 'reasoning-support', 'multimodal'],
    defaultConfiguration: { temperature: 0.7, maxOutputTokens: 1024 },
  },
  gemini: {
    providerId: 'gemini',
    providerName: 'Google Gemini',
    providerVersion: '1.0.0',
    supportedModels: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    maximumContext: 1000000,
    maximumOutput: 8192,
    supportedFeatures: ['chat-completion', 'vision', 'function-calling', 'json-output', 'streaming-support', 'multimodal'],
    defaultConfiguration: { temperature: 0.7, maxOutputTokens: 1024 },
  },
  grok: {
    providerId: 'grok',
    providerName: 'Grok',
    providerVersion: '1.0.0',
    supportedModels: ['grok-2'],
    maximumContext: 131072,
    maximumOutput: 4096,
    supportedFeatures: ['chat-completion', 'function-calling', 'json-output'],
    defaultConfiguration: { temperature: 0.7, maxOutputTokens: 1024 },
  },
  deepseek: {
    providerId: 'deepseek',
    providerName: 'DeepSeek',
    providerVersion: '1.0.0',
    supportedModels: ['deepseek-chat', 'deepseek-reasoner'],
    maximumContext: 64000,
    maximumOutput: 8192,
    supportedFeatures: ['chat-completion', 'reasoning-support', 'json-output'],
    defaultConfiguration: { temperature: 0.7, maxOutputTokens: 1024 },
  },
  'local-llm': {
    providerId: 'local-llm',
    providerName: 'Local LLM',
    providerVersion: '1.0.0',
    supportedModels: ['llama-3-70b'],
    maximumContext: 8192,
    maximumOutput: 2048,
    supportedFeatures: ['chat-completion'],
    defaultConfiguration: { temperature: 0.7, maxOutputTokens: 1024 },
  },
}

export const ALL_ADAPTER_DEFINITIONS: readonly ProviderAdapterMetadata[] = Object.values(PROVIDER_ADAPTER_DEFINITIONS)

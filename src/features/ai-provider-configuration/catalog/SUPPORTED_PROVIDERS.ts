import type { ProviderConfigEntry } from '../types'

// The full Provider Configuration System catalog — "Supported
// (configuration only)" from the Sprint 6 brief. Every entry starts
// `enabled: false` ("Every real provider must remain disabled");
// `requiresApiKey` is `false` only for Ollama, which normally talks to
// an unauthenticated local server.
export const SUPPORTED_PROVIDERS: readonly ProviderConfigEntry[] = [
  { id: 'openai', displayName: 'OpenAI', enabled: false, requiresApiKey: true },
  { id: 'claude', displayName: 'Claude', enabled: false, requiresApiKey: true },
  { id: 'gemini', displayName: 'Gemini', enabled: false, requiresApiKey: true },
  { id: 'azure-openai', displayName: 'Azure OpenAI', enabled: false, requiresApiKey: true },
  { id: 'openrouter', displayName: 'OpenRouter', enabled: false, requiresApiKey: true },
  { id: 'ollama', displayName: 'Ollama', enabled: false, requiresApiKey: false },
  { id: 'custom', displayName: 'Custom Provider', enabled: false, requiresApiKey: true },
] as const

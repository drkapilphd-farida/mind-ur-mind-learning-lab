import type { SupportedProviderId } from './SupportedProviderId'

// One entry in the Provider Configuration System's catalog.
// `requiresApiKey` is a documented, honest data flag — never a real
// key or a pointer to one ("No API keys" is absolute in this sprint) —
// `false` only for Ollama, which normally runs against a local,
// unauthenticated server. `enabled` defaults to `false` for every
// entry this sprint ships ("Every real provider must remain
// disabled").
export type ProviderConfigEntry = {
  id: SupportedProviderId
  displayName: string
  enabled: boolean
  requiresApiKey: boolean
}

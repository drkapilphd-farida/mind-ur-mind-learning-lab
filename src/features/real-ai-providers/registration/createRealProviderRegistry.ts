import { createProviderRegistry } from '@/features/ai-provider/registry'
import { createMockProviderAdapter } from '@/features/ai-provider/adapter'
import { CHAT_CAPABILITIES } from '@/features/ai-provider/providers'
import type { ProviderAdapter, ProviderRegistry } from '@/features/ai-provider/contracts'
import { createOpenAIProviderAdapter } from '../openaiAdapter'
import { createClaudeProviderAdapter } from '../claudeAdapter'

function createMockProviderEntry(): ProviderAdapter {
  return createMockProviderAdapter({
    metadata: {
      id: 'mock',
      displayName: 'Mock Provider',
      description: 'The always-available, deterministic mock provider — the platform default.',
      supportsFineTuning: false,
    },
    models: [
      {
        id: 'mock-default-chat',
        displayName: 'Mock Default Chat',
        providerId: 'mock',
        capabilities: CHAT_CAPABILITIES,
        contextWindowTokens: 8_192,
        maxOutputTokens: 1_024,
      },
    ],
  })
}

export type RealProviderRegistryOptions = {
  mockProvider?: ProviderAdapter
  openAIProvider?: ProviderAdapter
  claudeProvider?: ProviderAdapter
}

export type RealProviderRegistrationResult = {
  registry: ProviderRegistry
  // Kept alongside the registry (not recovered by narrowing
  // registry.get()'s AIProvider-typed result) for lifecycle management —
  // same "concretely-typed reference held separately" pattern
  // `ai-mentor-provider-bridge`'s MentorAIProviderAdapter (Sprint 5,
  // Chunk 4) already established.
  adapters: readonly ProviderAdapter[]
}

// "Provider Registration" — registers exactly 3 providers into a fresh
// ProviderRegistry (Sprint 5, Chunk 1/2, unmodified): 'mock' (always
// present, no credentials to check), 'openai', and 'claude' (both real,
// both gated behind their own env var via EnvGatedProviderLifecycle).
// Registering a real provider here does NOT make it active —
// RuntimeProviderSwitcher is what decides which one actually gets used.
export function createRealProviderRegistry(options: RealProviderRegistryOptions = {}): RealProviderRegistrationResult {
  const mockProvider = options.mockProvider ?? createMockProviderEntry()
  const openAIProvider = options.openAIProvider ?? createOpenAIProviderAdapter()
  const claudeProvider = options.claudeProvider ?? createClaudeProviderAdapter()

  const registry = createProviderRegistry()
  registry.register(mockProvider)
  registry.register(openAIProvider)
  registry.register(claudeProvider)

  return { registry, adapters: [mockProvider, openAIProvider, claudeProvider] }
}

import type { AIProvider, ProviderAdapter, ProviderRegistry } from '@/features/ai-provider/contracts'
import type { ResolvedProvider, RuntimeProviderResolver } from '@/features/ai-provider-configuration/contracts'
import { NoRegisteredProviderError } from './NoRegisteredProviderError'

export type RuntimeProviderSwitcherDependencies = {
  registry: ProviderRegistry
  adapters: readonly ProviderAdapter[]
  resolver: RuntimeProviderResolver
}

export type ActiveProviderResult = {
  provider: AIProvider
  resolution: ResolvedProvider
}

// "Runtime Provider Switching" — the piece Sprint 6's own report
// flagged as deferred ("Runtime Provider Resolver... decides which
// provider to resolve, but real provider ADAPTERS don't exist yet").
// Composes ai-provider-configuration's RuntimeProviderResolver (Sprint
// 6, unmodified — decides *which* providerId) with this feature's own
// ProviderRegistry (Sprint 5, Chunk 1/2, unmodified — holds the actual
// live adapters) to produce a genuinely ready-to-call AIProvider.
// Falls back to the registry's 'mock' entry if the resolved id somehow
// isn't registered (defense-in-depth; unreachable with default wiring).
// Each adapter is `initialize()`'d at most once — same lazy pattern
// `ai-mentor-provider-bridge`'s MentorAIProviderAdapter (Sprint 5,
// Chunk 4) already established.
export class RuntimeProviderSwitcher {
  private readonly initializedProviderIds = new Set<string>()

  constructor(private readonly dependencies: RuntimeProviderSwitcherDependencies) {}

  async getActiveProvider(): Promise<ActiveProviderResult> {
    const resolution = await this.dependencies.resolver.resolve()

    const provider = this.dependencies.registry.get(resolution.providerId) ?? this.dependencies.registry.get('mock')
    if (!provider) throw new NoRegisteredProviderError(resolution.providerId)

    await this.ensureInitialized(provider.metadata.id)
    return { provider, resolution }
  }

  private async ensureInitialized(providerId: string): Promise<void> {
    if (this.initializedProviderIds.has(providerId)) return

    const adapter = this.dependencies.adapters.find((candidate) => candidate.metadata.id === providerId)
    if (adapter) await adapter.initialize()

    this.initializedProviderIds.add(providerId)
  }
}

export function createRuntimeProviderSwitcher(dependencies: RuntimeProviderSwitcherDependencies): RuntimeProviderSwitcher {
  return new RuntimeProviderSwitcher(dependencies)
}

import { createDefaultRuntimeProviderSwitcher, type RuntimeProviderSwitcher } from '@/features/real-ai-providers'
import type { AIProvider } from '@/features/ai-provider/contracts'
import type { AIProviderFactory } from '../types/AIProviderFactory'

export type RuntimeAIProviderFactoryOptions = {
  switcher?: Pick<RuntimeProviderSwitcher, 'getActiveProvider'>
}

// AI Foundation Layer™ — AIF-1. The ONE file in this module that imports
// from `@/features/real-ai-providers` — every other AIF-1 file only ever
// sees the small `AIProviderFactory` contract. Delegates entirely to the
// existing, real, env-driven `createDefaultRuntimeProviderSwitcher()`:
// reads `AI_ACTIVE_PROVIDER_ID`/`AI_PROVIDER_CLAUDE_ENABLED`/
// `ANTHROPIC_API_KEY` from the real environment, checks real credentials
// and health, and falls back to the always-available mock provider
// unless every gate passes (confirmed by reading the switcher's own
// source — with no env vars set, it always resolves to mock, so tests
// and local dev never make a real network call by accident). This class
// never references "claude"/"openai" by name — swapping which real
// provider is active happens entirely through the existing registry/
// switcher, with zero change here.
export class RuntimeAIProviderFactory implements AIProviderFactory {
  private readonly switcher: Pick<RuntimeProviderSwitcher, 'getActiveProvider'>

  constructor(options: RuntimeAIProviderFactoryOptions = {}) {
    this.switcher = options.switcher ?? createDefaultRuntimeProviderSwitcher()
  }

  async resolveProvider(): Promise<AIProvider> {
    const { provider } = await this.switcher.getActiveProvider()
    return provider
  }
}

export function createRuntimeAIProviderFactory(options: RuntimeAIProviderFactoryOptions = {}): AIProviderFactory {
  return new RuntimeAIProviderFactory(options)
}

import type { AIProvider } from '@/features/ai-provider/contracts'

// AI Foundation Layer™ — AIF-1. The one seam between AIFoundation and
// "which provider answers this." The default implementation
// (internal/RuntimeAIProviderFactory.ts) delegates entirely to the
// existing, real, env-driven `createDefaultRuntimeProviderSwitcher()`
// (src/features/real-ai-providers) — this interface exists so
// aiFoundation.ts depends only on this small contract, never on
// real-ai-providers directly, and so a future factory (e.g. one that
// does per-task model routing) can replace the default without touching
// aiFoundation.ts.
export interface AIProviderFactory {
  resolveProvider(): Promise<AIProvider>
}

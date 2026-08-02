import type { ConfigurationEntry, ConfigurationProfile, MemoryConfiguration } from '../domain'

// Deterministic, precedence-based resolution — no AI, no scoring, only
// last-write-wins layering in a fixed order.
export interface ConfigurationResolutionEngine {
  resolve(
    defaultConfiguration: readonly ConfigurationEntry[],
    engineConfiguration: readonly ConfigurationEntry[],
    profile: ConfigurationProfile | null,
    runtimeOverrides: readonly ConfigurationEntry[],
  ): MemoryConfiguration
}

import type { MemoryConfiguration } from '../domain'

// "Extend repository contracts to persist and retrieve configuration
// objects while maintaining backward compatibility. No behavioral
// changes to existing services." This feature is brand new, so
// "extend" means growing this codebase's family of repository
// contracts with one more — the exact same Promise-based,
// framework-agnostic shape every other repository already uses
// (independently mirrored, not imported — "No cross-feature
// imports"). Exactly the two verbs the brief names — "persist and
// retrieve" — no delete/list/archive beyond what was asked.
export interface ConfigurationRepository {
  save(configuration: MemoryConfiguration): Promise<void>
  retrieve(id: string): Promise<MemoryConfiguration | null>
}

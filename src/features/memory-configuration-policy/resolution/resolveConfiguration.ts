import type { ConfigurationEntry, ConfigurationProfile, MemoryConfiguration } from '../domain'
import { mergeConfigurationEntries } from '../domain'

// Pure — "Implement deterministic resolution using precedence: Default
// configuration, Engine configuration, Profile overrides, Explicit
// runtime overrides. Resolution must always produce a single immutable
// configuration." Each layer is merged in exactly that order, so a
// later layer always wins over an earlier one for the same key
// (`mergeConfigurationEntries`'s own last-write-wins semantics).
export function resolveConfiguration(
  defaultConfiguration: readonly ConfigurationEntry[],
  engineConfiguration: readonly ConfigurationEntry[],
  profile: ConfigurationProfile | null,
  runtimeOverrides: readonly ConfigurationEntry[],
  now: string,
  id: string,
): MemoryConfiguration {
  const entries = mergeConfigurationEntries(defaultConfiguration, engineConfiguration, profile?.entries ?? [], runtimeOverrides)

  return {
    id,
    entries,
    metadata: { profileId: profile?.id ?? null, version: 1, createdAt: now, updatedAt: now },
  }
}

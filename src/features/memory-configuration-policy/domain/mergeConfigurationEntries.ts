import type { ConfigurationEntry } from './ConfigurationEntry'
import type { ConfigurationValue } from './ConfigurationValue'

// Pure — merges any number of entry layers, later layers overriding
// earlier ones by key (last-write-wins). Output is deduplicated and
// sorted by key, so the result is deterministic regardless of how many
// layers were given or how their internal entries were ordered.
// Shared by `resolution/resolveConfiguration.ts` (precedence merge)
// and `policyRegistry/DefaultPolicyRegistry.ts` (`overridePolicy`).
export function mergeConfigurationEntries(...layers: readonly (readonly ConfigurationEntry[])[]): readonly ConfigurationEntry[] {
  const merged = new Map<string, ConfigurationValue>()

  for (const layer of layers) {
    for (const entry of layer) {
      merged.set(entry.key, entry.value)
    }
  }

  return [...merged.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => ({ key, value }))
}

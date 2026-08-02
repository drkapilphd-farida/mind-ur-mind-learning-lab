import type { MemoryConfiguration } from '@/features/memory-configuration-policy'
import type { PersonalizationFacts } from '../domain'

// Pure — reduces a "Configuration" input (a `MemoryConfiguration` from
// the approved Configuration & Policy Engine™) down to flat facts —
// its `entries` are already `{ key, value }` pairs of exactly the
// primitive types `PersonalizationFacts` accepts, so this is a direct
// array-to-record fold, not a lossy summary like the other two
// `integration/` builders.
export function buildConfigurationFacts(configuration: MemoryConfiguration | null): PersonalizationFacts {
  if (!configuration) return {}

  const facts: Record<string, string | number | boolean> = {}
  for (const entry of configuration.entries) {
    facts[entry.key] = entry.value
  }
  return facts
}
